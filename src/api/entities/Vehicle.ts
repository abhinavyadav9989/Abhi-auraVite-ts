import { db } from '../supabaseClient';
import { documentUploadService } from '../services/documentUploadService';
import type { Vehicle as VehicleRow, VehicleInsert, VehicleUpdate } from '@/types';
import { validateVehicleInsert, validateVehicleUpdate, BusinessRules } from '@/lib/validation';

type FilterObject = Record<string, string | number | boolean | null>;

export class VehicleEntity {
  private tableName = 'vehicles';

  async list(filters?: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  }

  async get(id: string): Promise<VehicleRow | null> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleRow | null;
  }

  async create(data: unknown): Promise<VehicleRow> {
    const validatedData = validateVehicleInsert(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleRow;
  }

  async update(id: string, data: unknown): Promise<VehicleRow> {
    const validatedData = validateVehicleUpdate(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleRow;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async filter(filters: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  }

  /**
   * Get vehicle with related data (documents, condition)
   */
  async getWithDetails(id: string): Promise<{
    vehicle: VehicleRow;
    documents: any[];
    condition: Record<string, unknown> | null;
  } | null> {
    try {
      // Get vehicle
      const { data: vehicle, error: vehicleError } = await (db as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (vehicleError) throw vehicleError;

      // Get documents
      const { data: documents, error: documentsError } = await (db as any)
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', id);

      if (documentsError) throw documentsError;

      // Get condition
      const { data: condition, error: conditionError } = await (db as any)
        .from('vehicle_condition')
        .select('*')
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (conditionError && conditionError.code !== 'PGRST116') {
        throw conditionError;
      }

      return {
        vehicle: vehicle as VehicleRow,
        documents: (documents || []) as any[],
        condition: condition || null
      };
    } catch (error) {
      console.error('Error getting vehicle with details:', error);
      throw error;
    }
  }

  /**
   * Get vehicles by dealer
   */
  async getByDealer(dealerId: string, filters?: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any)
      .from(this.tableName)
      .select('*')
      .eq('dealer_id', dealerId);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  }

  /**
   * Get vehicles by branch
   */
  async getByBranch(branchId: string, filters?: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any)
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  }

  /**
   * Check for duplicate vehicles
   */
  async checkDuplicates(data: Partial<VehicleRow>): Promise<VehicleRow[]> {
    const conditions = [];
    
    if (data.registration_number) {
      conditions.push(`registration_number.eq.${data.registration_number}`);
    }
    
    if (data.make && data.model && data.year) {
      conditions.push(`make.eq.${data.make},model.eq.${data.model},year.eq.${data.year}`);
    }

    if (conditions.length === 0) return [];

    const { data: duplicates, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .or(conditions.join(','));

    if (error) throw error;
    return (duplicates || []) as VehicleRow[];
  }

  /**
   * Get market price suggestions
   */
  async getMarketPriceSuggestions(data: Partial<VehicleRow>): Promise<{
    minPrice: number;
    maxPrice: number;
    suggestedPrice: number;
    confidence: number;
    factors: string[];
  }> {
    // Get similar vehicles for price comparison
    const { data: similarVehicles, error } = await (db as any)
      .from(this.tableName)
      .select('asking_price, market_price_min, market_price_max')
      .eq('make', data.make)
      .eq('model', data.model)
      .eq('status', 'active')
      .not('asking_price', 'is', null)
      .limit(10);

    if (error) throw error;

    const prices = similarVehicles
      ?.map(v => v.asking_price)
      .filter(price => price && price > 0) || [];

    if (prices.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        suggestedPrice: 0,
        confidence: 0,
        factors: ['No similar vehicles found']
      };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      minPrice,
      maxPrice,
      suggestedPrice: Math.round(avgPrice),
      confidence: Math.min(prices.length / 10, 1),
      factors: [
        `Based on ${prices.length} similar vehicles`,
        `Price range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
      ]
    };
  }

  /**
   * Calculate commission for consignment
   */
  calculateCommission(vehicle: VehicleRow, consignmentTerms: {
    commissionPercentage: number;
    minimumCommission: number;
    maximumCommission: number;
  }): number {
    const askingPrice = vehicle.asking_price || 0;
    const commission = (askingPrice * consignmentTerms.commissionPercentage) / 100;
    
    return Math.max(
      consignmentTerms.minimumCommission,
      Math.min(commission, consignmentTerms.maximumCommission)
    );
  }

  /**
   * Get vehicle statistics
   */
  async getStatistics(dealerId?: string): Promise<{
    totalVehicles: number;
    activeListings: number;
    soldVehicles: number;
    averagePrice: number;
    totalValue: number;
  }> {
    let query = (db as any).from(this.tableName).select('*');
    
    if (dealerId) {
      query = query.eq('dealer_id', dealerId);
    }

    const { data: vehicles, error } = await query;
    if (error) throw error;

    const vehicleList = (vehicles || []) as VehicleRow[];
    const totalVehicles = vehicleList.length;
    const activeListings = vehicleList.filter(v => v.status === 'active').length;
    const soldVehicles = vehicleList.filter(v => v.status === 'sold').length;
    
    const prices = vehicleList
      .map(v => v.asking_price)
      .filter(price => price && price > 0);
    
    const averagePrice = prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
      : 0;
    
    const totalValue = vehicleList
      .reduce((sum, v) => sum + (v.asking_price || 0), 0);

    return {
      totalVehicles,
      activeListings,
      soldVehicles,
      averagePrice: Math.round(averagePrice),
      totalValue
    };
  }

  /**
   * Search vehicles with filters
   */
  async search(filters: {
    make?: string;
    model?: string;
    year?: number;
    priceRange?: { min: number; max: number };
    location?: string;
    status?: string;
    dealerId?: string;
  }): Promise<VehicleRow[]> {
    let query = (db as any).from(this.tableName).select('*');

    if (filters.make) {
      query = query.eq('make', filters.make);
    }
    if (filters.model) {
      query = query.eq('model', filters.model);
    }
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    if (filters.priceRange) {
      query = query.gte('asking_price', filters.priceRange.min)
                   .lte('asking_price', filters.priceRange.max);
    }
    if (filters.location) {
      query = query.ilike('location_city', `%${filters.location}%`);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.dealerId) {
      query = query.eq('dealer_id', filters.dealerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  }

  /**
   * Upload document for vehicle
   */
  async uploadDocument(
    vehicleId: string,
    file: File,
    documentType: 'rc' | 'insurance' | 'puc' | 'invoice' | 'other'
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // Validate file using business rules
      const fileValidation = BusinessRules.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: `File validation failed: ${fileValidation.errors.join(', ')}`
        };
      }

      const result = await documentUploadService.uploadVehicleDocument(vehicleId, file, documentType);
      return result;
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: 'Failed to upload document'
      };
    }
  }
}

export const vehicle = new VehicleEntity();

