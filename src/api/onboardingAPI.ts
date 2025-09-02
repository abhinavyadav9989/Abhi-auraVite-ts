import { db } from './supabaseClient';
import { z } from 'zod';

export interface OnboardingData {
  dealer_id: string;
  step: string;
  data: Record<string, unknown>;
  completed: boolean;
}

export interface OnboardingProgress {
  current_step: string;
  completed_steps: string[];
  total_steps: number;
  progress_percentage: number;
}

// Validation schema for onboarding audit data
const OnboardingAuditSchema = z.object({
  dealer_id: z.string().uuid('Invalid dealer ID'),
  step: z.string().min(1, 'Step is required'),
  data: z.record(z.unknown()).optional(),
  completed: z.boolean().default(true),
  created_at: z.string().datetime().optional()
});

type OnboardingAuditInsert = z.infer<typeof OnboardingAuditSchema>;

export class OnboardingAPI {
  private static instance: OnboardingAPI;

  private constructor() {}

  static getInstance(): OnboardingAPI {
    if (!OnboardingAPI.instance) {
      OnboardingAPI.instance = new OnboardingAPI();
    }
    return OnboardingAPI.instance;
  }

  async saveOnboardingStep(dealerId: string, step: string, data: Record<string, unknown>): Promise<void> {
    try {
      // Validate onboarding data before database insert
      const auditData = {
        dealer_id: dealerId,
        step,
        data,
        completed: true,
        created_at: new Date().toISOString()
      };

      const validatedData = OnboardingAuditSchema.parse(auditData);

      const { error } = await (db as any)
        .from('onboarding_audit_log')
        .upsert(validatedData);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving onboarding step:', error);
      throw error;
    }
  }

  async getOnboardingProgress(dealerId: string): Promise<OnboardingProgress> {
    try {
      const { data, error } = await (db as any)
        .from('onboarding_audit_log')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const completedSteps = data?.map(item => item.step) || [];
      const totalSteps = 10; // Define total steps
      const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100);

      // Determine current step (next incomplete step)
      const allSteps = [
        'business_verification',
        'kyc_verification',
        'bank_details',
        'branch_setup',
        'team_members',
        'preferences',
        'documents',
        'terms_acceptance',
        'final_review',
        'activation'
      ];

      const currentStep = allSteps.find(step => !completedSteps.includes(step)) || 'completed';

      return {
        current_step: currentStep,
        completed_steps: completedSteps,
        total_steps: totalSteps,
        progress_percentage: progressPercentage
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw error;
    }
  }

  async getOnboardingData(dealerId: string): Promise<OnboardingData[]> {
    try {
      const { data, error } = await (db as any)
        .from('onboarding_audit_log')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      throw error;
    }
  }

  async isOnboardingComplete(dealerId: string): Promise<boolean> {
    try {
      const progress = await this.getOnboardingProgress(dealerId);
      return progress.progress_percentage === 100;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  // Alias methods for compatibility
  async getProgress(dealerId: string): Promise<OnboardingProgress> {
    return this.getOnboardingProgress(dealerId);
  }

  async saveStep(dealerId: string, stepName: string, data: any, step?: number): Promise<void> {
    return this.saveOnboardingStep(dealerId, stepName, data);
  }

  async complete(dealerId: string): Promise<void> {
    try {
      const { error } = await (db as any)
        .from('dealers')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', dealerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  async getBusinessModes(): Promise<any[]> {
    return [
      { id: 'retail', name: 'Retail', description: 'Sell directly to end customers' },
      { id: 'wholesale', name: 'Wholesale', description: 'Sell to other dealers' },
      { id: 'both', name: 'Both', description: 'Sell to both retail and wholesale customers' }
    ];
  }

  async getVehicleSegments(): Promise<any[]> {
    return [
      { id: 'hatchback', name: 'Hatchback', description: 'Compact hatchback vehicles' },
      { id: 'sedan', name: 'Sedan', description: 'Sedan vehicles' },
      { id: 'suv', name: 'SUV', description: 'Sport Utility Vehicles' },
      { id: 'muv', name: 'MUV', description: 'Multi Utility Vehicles' },
      { id: 'luxury', name: 'Luxury', description: 'Luxury vehicles' },
      { id: 'commercial', name: 'Commercial', description: 'Commercial vehicles' }
    ];
  }

  async getClientTypes(): Promise<any[]> {
    return [
      { id: 'individual', name: 'Individual', description: 'Individual customers' },
      { id: 'corporate', name: 'Corporate', description: 'Corporate customers' },
      { id: 'both', name: 'Both', description: 'Both individual and corporate customers' }
    ];
  }

  async getTeamRoles(): Promise<any[]> {
    return [
      { 
        id: 'owner', 
        name: 'Owner', 
        description: 'Full access to all features',
        permissions: ['all']
      },
      { 
        id: 'manager', 
        name: 'Manager', 
        description: 'Manage inventory and deals',
        permissions: ['inventory', 'deals', 'reports']
      },
      { 
        id: 'sales', 
        name: 'Sales Executive', 
        description: 'Handle sales and customer interactions',
        permissions: ['deals', 'customers']
      },
      { 
        id: 'support', 
        name: 'Support', 
        description: 'Customer support and basic operations',
        permissions: ['customers', 'basic_operations']
      }
    ];
  }
}

// Export singleton instance
export const onboardingAPI = OnboardingAPI.getInstance();
