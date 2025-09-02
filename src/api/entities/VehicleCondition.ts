import { db } from '../supabaseClient';
import type { VehicleCondition as VehicleConditionRow, VehicleConditionInsert, VehicleConditionUpdate } from '@/types';
import { validateVehicleConditionInsert, validateVehicleConditionUpdate } from '@/lib/validation';

type FilterObject = Record<string, string | number | boolean | null>;

export class VehicleConditionEntity {
  private tableName = 'vehicle_condition';

  async list(filters?: FilterObject): Promise<VehicleConditionRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  }

  async get(id: string): Promise<VehicleConditionRow | null> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleConditionRow | null;
  }

  async create(data: unknown): Promise<VehicleConditionRow> {
    const validatedData = validateVehicleConditionInsert(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleConditionRow;
  }

  async update(id: string, data: unknown): Promise<VehicleConditionRow> {
    const validatedData = validateVehicleConditionUpdate(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleConditionRow;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async filter(filters: FilterObject): Promise<VehicleConditionRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  }

  /**
   * Get condition records by vehicle ID
   */
  async getByVehicle(vehicleId: string): Promise<VehicleConditionRow[]> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  }

  /**
   * Get latest condition for a vehicle
   */
  async getLatestByVehicle(vehicleId: string): Promise<VehicleConditionRow | null> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as VehicleConditionRow | null;
  }

  /**
   * Get condition statistics
   */
  async getStatistics(vehicleId?: string): Promise<{
    totalInspections: number;
    averageOverallCondition: number;
    conditionBreakdown: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    recentInspections: number;
  }> {
    let query = (db as any).from(this.tableName).select('*');
    
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    const { data: conditions, error } = await query;
    if (error) throw error;

    const conditionList = (conditions || []) as VehicleConditionRow[];
    const totalInspections = conditionList.length;

    if (totalInspections === 0) {
      return {
        totalInspections: 0,
        averageOverallCondition: 0,
        conditionBreakdown: { excellent: 0, good: 0, fair: 0, poor: 0 },
        recentInspections: 0
      };
    }

    const overallConditions = conditionList
      .map(c => c.overall_rating)
      .filter(condition => condition !== null && condition > 0);

    const averageOverallCondition = overallConditions.length > 0
      ? overallConditions.reduce((sum, condition) => sum + condition, 0) / overallConditions.length
      : 0;

    const conditionBreakdown = {
      excellent: conditionList.filter(c => c.overall_rating && c.overall_rating >= 9).length,
      good: conditionList.filter(c => c.overall_rating && c.overall_rating >= 7 && c.overall_rating < 9).length,
      fair: conditionList.filter(c => c.overall_rating && c.overall_rating >= 5 && c.overall_rating < 7).length,
      poor: conditionList.filter(c => c.overall_rating && c.overall_rating < 5).length
    };

    // Count recent inspections (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInspections = conditionList.filter(c => {
      const createdAt = new Date(c.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length;

    return {
      totalInspections,
      averageOverallCondition: Math.round(averageOverallCondition * 10) / 10,
      conditionBreakdown,
      recentInspections
    };
  }

  /**
   * Calculate condition score
   */
  calculateConditionScore(condition: VehicleConditionRow): number {
    const weights = {
      overall: 0.4,
      paint: 0.2,
      interior: 0.2,
      mechanical: 0.15,
      tyre: 0.05
    };

    let score = 0;
    let totalWeight = 0;

    if (condition.overall_rating) {
      score += condition.overall_rating * weights.overall;
      totalWeight += weights.overall;
    }

    if (condition.paint_condition) {
      // Convert string condition to numeric score (1-10)
      const paintScore = this.convertConditionToScore(condition.paint_condition);
      score += paintScore * weights.paint;
      totalWeight += weights.paint;
    }

    if (condition.interior_condition) {
      const interiorScore = this.convertConditionToScore(condition.interior_condition);
      score += interiorScore * weights.interior;
      totalWeight += weights.interior;
    }

    if (condition.mechanical_condition) {
      const mechanicalScore = this.convertConditionToScore(condition.mechanical_condition);
      score += mechanicalScore * weights.mechanical;
      totalWeight += weights.mechanical;
    }

    if (condition.tyre_condition) {
      const tyreScore = this.convertConditionToScore(condition.tyre_condition);
      score += tyreScore * weights.tyre;
      totalWeight += weights.tyre;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Convert string condition to numeric score
   */
  private convertConditionToScore(condition: string): number {
    const conditionMap: Record<string, number> = {
      'excellent': 9,
      'very_good': 8,
      'good': 7,
      'fair': 5,
      'poor': 3,
      'very_poor': 1
    };
    return conditionMap[condition.toLowerCase()] || 5; // Default to fair
  }

  /**
   * Get condition trend for a vehicle
   */
  async getConditionTrend(vehicleId: string, days: number = 90): Promise<{
    trend: 'improving' | 'declining' | 'stable';
    averageChange: number;
    inspections: Array<{ date: string; score: number }>;
  }> {
    const { data: conditions, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const conditionList = (conditions || []) as VehicleConditionRow[];
    
    if (conditionList.length < 2) {
      return {
        trend: 'stable',
        averageChange: 0,
        inspections: []
      };
    }

    const inspections = conditionList.map(c => ({
      date: c.created_at,
      score: this.calculateConditionScore(c)
    }));

    // Calculate trend
    const changes = [];
    for (let i = 1; i < inspections.length; i++) {
      changes.push(inspections[i].score - inspections[i - 1].score);
    }

    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;

    let trend: 'improving' | 'declining' | 'stable';
    if (averageChange > 0.5) {
      trend = 'improving';
    } else if (averageChange < -0.5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      averageChange: Math.round(averageChange * 100) / 100,
      inspections
    };
  }
}

export const vehicleCondition = new VehicleConditionEntity();
