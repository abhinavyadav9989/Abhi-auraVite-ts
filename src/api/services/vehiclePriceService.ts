import { db } from '@/api/supabaseClient';
import type { Vehicle } from '@/types';

export interface VehiclePriceInfo {
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;
  confidence: number;
  factors: string[];
  marketTrend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
  // Additional properties for compatibility
  priceType?: 'owner_full' | 'retail' | 'b2b' | 'masked' | 'restricted';
  displayPrice?: number;
  exposureMode?: string;
  message?: string;
}

export interface VehiclePricingData {
  basePrice: number;
  marketAdjustment: number;
  conditionAdjustment: number;
  locationAdjustment: number;
  finalPrice: number;
  breakdown: {
    base: number;
    market: number;
    condition: number;
    location: number;
  };
}

export class VehiclePriceService {
  private static instance: VehiclePriceService;

  private constructor() {}

  static getInstance(): VehiclePriceService {
    if (!VehiclePriceService.instance) {
      VehiclePriceService.instance = new VehiclePriceService();
    }
    return VehiclePriceService.instance;
  }

  // Compatibility methods
  async getVehiclePriceInfo(vehicleId: string, dealerId: string): Promise<VehiclePriceInfo> {
    // Get vehicle data
    const { data: vehicle, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error || !vehicle) {
      return {
        minPrice: 0,
        maxPrice: 0,
        suggestedPrice: 0,
        confidence: 0,
        factors: ['Vehicle not found'],
        marketTrend: 'stable',
        lastUpdated: new Date().toISOString(),
        priceType: 'restricted',
        displayPrice: 0,
        exposureMode: 'hidden',
        message: 'Vehicle not found'
      };
    }

    const priceInfo = await this.getMarketPriceSuggestions(vehicle);
    return {
      ...priceInfo,
      priceType: 'owner_full',
      displayPrice: vehicle.asking_price || priceInfo.suggestedPrice,
      exposureMode: 'public',
      message: undefined
    };
  }

  getPriceBadgeVariant(priceType: string): "default" | "destructive" | "outline" | "secondary" {
    switch (priceType) {
      case 'owner_full': return 'default';
      case 'retail': return 'secondary';
      case 'b2b': return 'outline';
      case 'masked': return 'destructive';
      case 'restricted': return 'destructive';
      default: return 'default';
    }
  }

  getPriceDisplayText(priceInfo: VehiclePriceInfo): string {
    if (priceInfo.priceType === 'masked') return 'Contact for price';
    if (priceInfo.priceType === 'restricted') return 'KYC required';
    return `₹${this.formatPrice(priceInfo.displayPrice || 0)}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Get market price suggestions for a vehicle
   */
  async getMarketPriceSuggestions(vehicleData: Partial<Vehicle>): Promise<VehiclePriceInfo> {
    // Get similar vehicles for price comparison
    const { data: similarVehicles, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .eq('make', vehicleData.make)
      .eq('model', vehicleData.model)
      .eq('year', vehicleData.year)
      .not('asking_price', 'is', null)
      .limit(10);

    if (error) throw error;

    if (!similarVehicles || similarVehicles.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        suggestedPrice: 0,
        confidence: 0,
        factors: ['No similar vehicles found'],
        marketTrend: 'stable',
        lastUpdated: new Date().toISOString()
      };
    }

    const prices = similarVehicles
      .map((v: Vehicle) => v.asking_price)
      .filter((price: number) => price && price > 0)
      .sort((a: number, b: number) => a - b);

    const minPrice = prices[0] || 0;
    const maxPrice = prices[prices.length - 1] || 0;
    const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;

    // Determine market trend based on recent prices
    const recentPrices = prices.slice(-5);
    const olderPrices = prices.slice(0, -5);
    let marketTrend: 'rising' | 'falling' | 'stable' = 'stable';
    
    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;
      
      if (recentAvg > olderAvg * 1.05) marketTrend = 'rising';
      else if (recentAvg < olderAvg * 0.95) marketTrend = 'falling';
    }

    return {
      minPrice,
      maxPrice,
      suggestedPrice: Math.round(avgPrice),
      confidence: Math.min(prices.length / 10, 1),
      factors: [
        `Based on ${prices.length} similar vehicles`,
        `Make: ${vehicleData.make}`,
        `Model: ${vehicleData.model}`,
        `Year: ${vehicleData.year}`,
        `Market trend: ${marketTrend}`
      ],
      marketTrend,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate dealer net price
   */
  async calculateDealerNet(vehicleData: Partial<Vehicle>): Promise<number> {
    if (!vehicleData.asking_price) return 0;

    // Get market data for similar vehicles
    const marketInfo = await this.getMarketPriceSuggestions(vehicleData);
    
    // Calculate dealer net based on market price and margins
    const marketPrice = marketInfo.suggestedPrice;
    const askingPrice = vehicleData.asking_price || marketPrice;
    
    // Apply typical dealer margins (15-25%)
    const marginPercentage = 0.20; // 20% margin
    const dealerNet = askingPrice * (1 - marginPercentage);
    
    return Math.round(dealerNet);
  }

  /**
   * Calculate commission for consignment vehicles
   */
  async calculateCommission(vehicleData: Partial<Vehicle>): Promise<number> {
    if (!vehicleData.asking_price || vehicleData.stock_type !== 'consignment') {
      return 0;
    }

    // Get consignment terms from vehicle data
    const consignmentTerms = vehicleData.consignment_terms as Record<string, unknown> || {};
    const commissionType = consignmentTerms.commission_type as string || 'percentage';
    
    if (commissionType === 'percentage') {
      const commissionRate = (consignmentTerms.commission_rate as number) || 0.05; // 5% default
      return Math.round(vehicleData.asking_price * commissionRate);
    } else {
      return (consignmentTerms.commission_amount as number) || 0;
    }
  }

  /**
   * Validate pricing data
   */
  async validatePricing(vehicleData: Partial<Vehicle>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if asking price is reasonable
    if (vehicleData.asking_price) {
      const marketInfo = await this.getMarketPriceSuggestions(vehicleData);
      
      if (vehicleData.asking_price < marketInfo.minPrice * 0.7) {
        errors.push('Asking price is significantly below market minimum');
      }
      
      if (vehicleData.asking_price > marketInfo.maxPrice * 1.3) {
        errors.push('Asking price is significantly above market maximum');
      }
    }

    // Check for required fields
    if (!vehicleData.make) errors.push('Vehicle make is required');
    if (!vehicleData.model) errors.push('Vehicle model is required');
    if (!vehicleData.year) errors.push('Vehicle year is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get pricing breakdown
   */
  async getPricingBreakdown(vehicleData: Partial<Vehicle>): Promise<VehiclePricingData> {
    const basePrice = vehicleData.base_cost || 0;
    const askingPrice = vehicleData.asking_price || 0;
    
    // Calculate adjustments
    const marketAdjustment = askingPrice - basePrice;
    const conditionAdjustment = this.calculateConditionAdjustment(vehicleData);
    const locationAdjustment = this.calculateLocationAdjustment(vehicleData);
    
    const finalPrice = basePrice + marketAdjustment + conditionAdjustment + locationAdjustment;

    return {
      basePrice,
      marketAdjustment,
      conditionAdjustment,
      locationAdjustment,
      finalPrice: Math.round(finalPrice),
      breakdown: {
        base: basePrice,
        market: marketAdjustment,
        condition: conditionAdjustment,
        location: locationAdjustment
      }
    };
  }

  /**
   * Calculate condition-based price adjustment
   */
  private calculateConditionAdjustment(vehicleData: Partial<Vehicle>): number {
    const conditionRating = vehicleData.condition_rating || 5;
    const basePrice = vehicleData.base_cost || 0;
    
    // Adjust price based on condition (1-10 scale)
    const conditionMultiplier = 0.8 + (conditionRating * 0.04); // 0.8 to 1.2 range
    return Math.round(basePrice * (conditionMultiplier - 1));
  }

  /**
   * Calculate location-based price adjustment
   */
  private calculateLocationAdjustment(vehicleData: Partial<Vehicle>): number {
    const basePrice = vehicleData.base_cost || 0;
    
    // Location adjustments based on state/city
    const location = vehicleData.location_state || '';
    let locationMultiplier = 1.0;
    
    // Premium locations get higher prices
    if (['Maharashtra', 'Delhi', 'Karnataka'].includes(location)) {
      locationMultiplier = 1.1;
    } else if (['Tamil Nadu', 'Telangana', 'Gujarat'].includes(location)) {
      locationMultiplier = 1.05;
    }
    
    return Math.round(basePrice * (locationMultiplier - 1));
  }

  /**
   * Get market trends for a specific make/model
   */
  async getMarketTrends(make: string, model: string): Promise<{
    trend: 'rising' | 'falling' | 'stable';
    percentageChange: number;
    timePeriod: string;
  }> {
    // Get historical price data for the make/model
    const { data: historicalData, error } = await (db as any)
      .from('vehicles')
      .select('asking_price, created_at')
      .eq('make', make)
      .eq('model', model)
      .not('asking_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!historicalData || historicalData.length < 10) {
      return {
        trend: 'stable',
        percentageChange: 0,
        timePeriod: '3 months'
      };
    }

    // Calculate trend over last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentPrices = historicalData
      .filter((item: Vehicle) => new Date(item.created_at) > threeMonthsAgo)
      .map((item: Vehicle) => item.asking_price);

    const olderPrices = historicalData
      .filter((item: Vehicle) => new Date(item.created_at) <= threeMonthsAgo)
      .map((item: Vehicle) => item.asking_price);

    if (recentPrices.length === 0 || olderPrices.length === 0) {
      return {
        trend: 'stable',
        percentageChange: 0,
        timePeriod: '3 months'
      };
    }

    const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;
    const percentageChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (percentageChange > 5) trend = 'rising';
    else if (percentageChange < -5) trend = 'falling';

    return {
      trend,
      percentageChange: Math.round(percentageChange * 100) / 100,
      timePeriod: '3 months'
    };
  }
}

// Export singleton instance
export const vehiclePriceService = VehiclePriceService.getInstance();
