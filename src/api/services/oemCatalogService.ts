import { db } from '@/api/supabaseClient';
import { Vehicle, VehicleInsert, VehicleUpdate } from '@/types';

// OEM Catalog Service for new vehicle identification
// This service integrates with OEM catalogs to provide accurate vehicle data

// Interface for OEM API responses (not stored in database)
export interface OEMVehicleAPI {
  make: string;
  model: string;
  variant: string;
  year: number;
  fuel_type: string;
  transmission: string;
  engine_capacity?: number;
  power?: number;
  torque?: number;
  seating_capacity?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
  };
  features?: string[];
  colors?: Array<{
    name: string;
    hex_code?: string;
  }>;
  price_range?: {
    ex_showroom_min: number;
    ex_showroom_max: number;
    on_road_min: number;
    on_road_max: number;
  };
  category?: string[];
  is_active: boolean;
  last_updated: string;
}

export interface OEMCatalogSearchParams {
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  min_price?: number;
  max_price?: number;
}

export interface OEMCatalogSearchResult {
  vehicles: OEMVehicleAPI[];
  total_count: number;
  search_criteria: OEMCatalogSearchParams;
  confidence: number;
}

class OEMCatalogService {
  private readonly OEM_CATALOG_TABLE = 'oem_catalog_vehicles';

  // Mock OEM catalog data for demonstration
  // In production, this would integrate with actual OEM APIs
  private mockOEMData: OEMVehicleAPI[] = [
    {
      make: 'Maruti Suzuki',
      model: 'Swift',
      variant: 'VXI',
      year: 2024,
      fuel_type: 'petrol',
      transmission: 'manual',
      engine_capacity: 1197,
      power: 82,
      torque: 113,
      seating_capacity: 5,
      dimensions: {
        length: 3845,
        width: 1735,
        height: 1530,
        wheelbase: 2450
      },
      features: ['Air Conditioning', 'Power Steering', 'Central Locking'],
      colors: [
        { name: 'Pearl Arctic White', hex_code: '#FFFFFF' },
        { name: 'Metallic Magma Grey', hex_code: '#4A4A4A' },
        { name: 'Metallic Silky Silver', hex_code: '#C0C0C0' }
      ],
      price_range: {
        ex_showroom_min: 650000,
        ex_showroom_max: 700000,
        on_road_min: 720000,
        on_road_max: 780000
      },
      category: ['hatchback'],
      is_active: true,
      last_updated: new Date().toISOString()
    },
    {
      make: 'Hyundai',
      model: 'Creta',
      variant: 'SX',
      year: 2024,
      fuel_type: 'petrol',
      transmission: 'automatic',
      engine_capacity: 1497,
      power: 113,
      torque: 144,
      seating_capacity: 5,
      dimensions: {
        length: 4300,
        width: 1790,
        height: 1635,
        wheelbase: 2610
      },
      features: ['Sunroof', 'Alloy Wheels', 'Touchscreen Infotainment', 'Wireless Charging'],
      colors: [
        { name: 'Phantom Black', hex_code: '#000000' },
        { name: 'Starry Night', hex_code: '#1a1a2e' },
        { name: 'Titan Grey', hex_code: '#5a5a5a' }
      ],
      price_range: {
        ex_showroom_min: 1200000,
        ex_showroom_max: 1350000,
        on_road_min: 1350000,
        on_road_max: 1520000
      },
      category: ['suv'],
      is_active: true,
      last_updated: new Date().toISOString()
    },
    {
      make: 'Tata',
      model: 'Nexon',
      variant: 'XZ Plus',
      year: 2024,
      fuel_type: 'petrol',
      transmission: 'manual',
      engine_capacity: 1199,
      power: 118,
      torque: 170,
      seating_capacity: 5,
      dimensions: {
        length: 3993,
        width: 1811,
        height: 1606,
        wheelbase: 2498
      },
      features: ['Connected Car Tech', 'Multi-drive Modes', 'Roof Rails'],
      colors: [
        { name: 'Pristine White', hex_code: '#FFFFFF' },
        { name: 'Daytona Grey', hex_code: '#808080' },
        { name: 'Calgary White', hex_code: '#F5F5F5' }
      ],
      price_range: {
        ex_showroom_min: 850000,
        ex_showroom_max: 950000,
        on_road_min: 950000,
        on_road_max: 1080000
      },
      category: ['suv', 'compact_suv'],
      is_active: true,
      last_updated: new Date().toISOString()
    }
  ];

  // Search OEM catalog
  async searchCatalog(params: OEMCatalogSearchParams): Promise<OEMCatalogSearchResult> {
    try {
      // In production, this would query the actual OEM catalog API
      // For now, we'll filter the mock data

      let filteredVehicles = [...this.mockOEMData];

      // Apply filters
      if (params.make) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.make.toLowerCase().includes(params.make!.toLowerCase())
        );
      }

      if (params.model) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.model.toLowerCase().includes(params.model!.toLowerCase())
        );
      }

      if (params.variant) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.variant.toLowerCase().includes(params.variant!.toLowerCase())
        );
      }

      if (params.year) {
        filteredVehicles = filteredVehicles.filter(v => v.year === params.year);
      }

      if (params.fuel_type) {
        filteredVehicles = filteredVehicles.filter(v => v.fuel_type === params.fuel_type);
      }

      if (params.transmission) {
        filteredVehicles = filteredVehicles.filter(v => v.transmission === params.transmission);
      }

      if (params.min_price || params.max_price) {
        filteredVehicles = filteredVehicles.filter(v => {
          if (!v.price_range) return false;
          const minPrice = params.min_price || 0;
          const maxPrice = params.max_price || Infinity;
          return v.price_range.ex_showroom_min >= minPrice &&
                 v.price_range.ex_showroom_max <= maxPrice;
        });
      }

      // Calculate confidence score
      const confidence = this.calculateSearchConfidence(params, filteredVehicles);

      return {
        vehicles: filteredVehicles.slice(0, 20), // Limit to 20 results
        total_count: filteredVehicles.length,
        search_criteria: params,
        confidence
      };

    } catch (error) {
      console.error('OEM Catalog search error:', error);
      throw new Error('Failed to search OEM catalog');
    }
  }

  // Get makes list
  async getMakes(): Promise<string[]> {
    try {
      // In production, this would query the OEM API
      const makes = [...new Set(this.mockOEMData.map(v => v.make))];
      return makes.sort();
    } catch (error) {
      console.error('Failed to get makes:', error);
      return [];
    }
  }

  // Get models for a specific make
  async getModels(make: string): Promise<string[]> {
    try {
      const models = [...new Set(
        this.mockOEMData
          .filter(v => v.make.toLowerCase() === make.toLowerCase())
          .map(v => v.model)
      )];
      return models.sort();
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  // Get variants for a specific make and model
  async getVariants(make: string, model: string): Promise<string[]> {
    try {
      const variants = [...new Set(
        this.mockOEMData
          .filter(v =>
            v.make.toLowerCase() === make.toLowerCase() &&
            v.model.toLowerCase() === model.toLowerCase()
          )
          .map(v => v.variant)
      )];
      return variants.sort();
    } catch (error) {
      console.error('Failed to get variants:', error);
      return [];
    }
  }

  // Get vehicle details by VIN (for existing inventory)
  async getVehicleByVIN(vin: string): Promise<OEMVehicleAPI | null> {
    try {
      // In production, this would decode VIN and match against catalog
      // For demo, return a mock vehicle
      return this.mockOEMData[0] || null;
    } catch (error) {
      console.error('Failed to get vehicle by VIN:', error);
      return null;
    }
  }

  // Get popular vehicles for quick selection
  async getPopularVehicles(limit: number = 10): Promise<OEMVehicleAPI[]> {
    try {
      return this.mockOEMData.slice(0, limit);
    } catch (error) {
      console.error('Failed to get popular vehicles:', error);
      return [];
    }
  }

  // Calculate search confidence score
  private calculateSearchConfidence(
    params: OEMCatalogSearchParams,
    results: OEMVehicleAPI[]
  ): number {
    if (results.length === 0) return 0;

    let confidence = 50; // Base confidence

    // Increase confidence based on specificity of search
    if (params.variant) confidence += 20;
    if (params.model) confidence += 15;
    if (params.make) confidence += 10;
    if (params.year) confidence += 10;
    if (params.fuel_type) confidence += 5;
    if (params.transmission) confidence += 5;

    // Cap at 95%
    return Math.min(confidence, 95);
  }

  // Validate if a vehicle exists in OEM catalog
  async validateVehicle(
    make: string,
    model: string,
    variant: string,
    year: number
  ): Promise<{ isValid: boolean; vehicle?: OEMVehicleAPI; confidence: number }> {
    try {
      const result = await this.searchCatalog({ make, model, variant, year });

      if (result.vehicles.length > 0) {
        return {
          isValid: true,
          vehicle: result.vehicles[0],
          confidence: result.confidence
        };
      }

      return {
        isValid: false,
        confidence: 0
      };
    } catch (error) {
      console.error('Vehicle validation error:', error);
      return {
        isValid: false,
        confidence: 0
      };
    }
  }
}

// Export singleton instance
export const oemCatalogService = new OEMCatalogService();
