import { supabase } from './supabaseClient';

// Types for onboarding
export interface OnboardingData {
  clientType?: string;
  businessMode?: any;
  organization?: any;
  branches?: any[];
  team?: any[];
  kybDocuments?: any;
  bankDetails?: any;
  planSelection?: any;
  consent?: any;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  progress: number;
  data: OnboardingData;
}

// Onboarding API functions
export const onboardingAPI = {
  // Start onboarding process
  start: async (dealerId: string) => {
    const { data, error } = await supabase
      .from('dealers')
      .update({
        onboarding_started_at: new Date().toISOString(),
        onboarding_progress: { started: true }
      })
      .eq('id', dealerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get onboarding progress
  getProgress: async (dealerId: string): Promise<OnboardingProgress> => {
    const { data, error } = await supabase
      .from('dealers')
      .select('onboarding_progress, onboarding_completed, current_onboarding_step')
      .eq('id', dealerId)
      .single();

    if (error) throw error;

    const progress = data.onboarding_progress || {};
    const completedSteps = Object.keys(progress).filter(key => 
      progress[key] === true || 
      (typeof progress[key] === 'object' && progress[key] !== null && !progress[key].skipped)
    );
    
    // Use stored current step if available, otherwise calculate based on completed steps
    const currentStep = data.current_onboarding_step || Math.min(completedSteps.length + 1, 9);
    
    return {
      currentStep: currentStep,
      completedSteps,
      progress: Math.round((completedSteps.length / 9) * 100), // 9 total steps
      data: progress
    };
  },

  // Save onboarding step
  saveStep: async (dealerId: string, step: string, stepData: any, currentStep?: number) => {
    try {
      const { data, error } = await supabase
        .rpc('update_onboarding_progress', {
          p_dealer_id: dealerId,
          p_step: step,
          p_data: stepData,
          p_current_step: currentStep || null
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in saveStep:', error);
      // Fallback: try without current_step parameter
      try {
        const { data, error: fallbackError } = await supabase
          .rpc('update_onboarding_progress', {
            p_dealer_id: dealerId,
            p_step: step,
            p_data: stepData
          });

        if (fallbackError) throw fallbackError;
        return data;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Complete onboarding
  complete: async (dealerId: string) => {
    const { data, error } = await supabase
      .rpc('complete_onboarding', {
        p_dealer_id: dealerId
      });

    if (error) throw error;
    return data;
  },

  // Get client types
  getClientTypes: () => {
    return [
      { id: 'group_dealer', label: 'Group Dealer', icon: '🏢', description: 'Multiple dealerships under one organization' },
      { id: 'individual_org', label: 'Individual Organization', icon: '🏪', description: 'Single dealership or business' },
      { id: 'franchise', label: 'Franchise (OEM store)', icon: '🏭', description: 'Authorized brand dealership' },
      { id: 'wholesale_trader', label: 'Wholesale Trader', icon: '📦', description: 'Bulk vehicle trading' },
      { id: 'consignment_seller', label: 'Consignment Seller', icon: '🤝', description: 'Selling vehicles on behalf of others' },
      { id: 'fleet_corporate', label: 'Fleet/Corporate Seller', icon: '🚗', description: 'Corporate fleet management' },
      { id: 'nbfc_bank', label: 'NBFC/Bank (Repo)', icon: '🏦', description: 'Financial institution with repossessed vehicles' },
      { id: 'govt_psu', label: 'Govt/PSU', icon: '🏛️', description: 'Government or public sector unit' },
      { id: 'rental_leasing', label: 'Rental/Leasing', icon: '🔑', description: 'Vehicle rental and leasing services' },
      { id: 'agri_construction', label: 'Agri/Construction', icon: '🚜', description: 'Agricultural or construction vehicles' },
      { id: '2w_3w_network', label: '2W/3W Network', icon: '🛵', description: 'Two-wheeler and three-wheeler network' },
      { id: 'dsa_broker', label: 'DSA/Broker', icon: '👨‍💼', description: 'Direct selling agent or broker' },
      { id: 'chauffeur_driver', label: 'Chauffeur/Driver', icon: '🚕', description: 'Individual driver or chauffeur' },
      { id: 'self_user', label: 'Self-User', icon: '👤', description: 'Individual vehicle owner' },
      { id: 'partner', label: 'Partner (Logistics/RTO/Workshop)', icon: '🔧', description: 'Service partner or workshop' }
    ];
  },

  // Get business modes
  getBusinessModes: () => {
    return [
      { id: 'new_vehicles', label: 'New Vehicles' },
      { id: 'used_vehicles', label: 'Used Vehicles' },
      { id: 'both', label: 'Both New & Used' }
    ];
  },

  // Get vehicle segments
  getVehicleSegments: () => {
    return [
      { id: '2w', label: '2-Wheeler' },
      { id: '3w', label: '3-Wheeler' },
      { id: '4w', label: '4-Wheeler' },
      { id: 'commercial', label: 'Commercial' },
      { id: 'others', label: 'Others' }
    ];
  },

  // Get team roles
  getTeamRoles: () => {
    return [
      { id: 'inventory_controller', label: 'Inventory Controller' },
      { id: 'sales_manager', label: 'Sales Manager' },
      { id: 'branch_manager', label: 'Branch Manager' },
      { id: 'finance', label: 'Finance' },
      { id: 'admin', label: 'Administrator' }
    ];
  },

  // Get plans
  getPlans: () => {
    return [
      { id: 'basic', label: 'Basic', price: 0, features: ['Add vehicles', 'Browse marketplace'] },
      { id: 'premium', label: 'Premium', price: 999, features: ['All basic features', 'Analytics', 'Priority support'] },
      { id: 'enterprise', label: 'Enterprise', price: 2999, features: ['All premium features', 'Custom integrations', 'Dedicated support'] }
    ];
  }
};

// Branch management API
export const branchAPI = {
  // Get branches for dealer
  getBranches: async (dealerId: string) => {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create branch
  create: async (branchData: any) => {
    const { data, error } = await supabase
      .from('branches')
      .insert(branchData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update branch
  update: async (branchId: string, branchData: any) => {
    const { data, error } = await supabase
      .from('branches')
      .update(branchData)
      .eq('id', branchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete branch
  delete: async (branchId: string) => {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', branchId);

    if (error) throw error;
    return true;
  }
};

// Team management API
export const teamAPI = {
  // Get team members for dealer
  getTeam: async (dealerId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Invite team member
  invite: async (inviteData: any) => {
    const { data, error } = await supabase
      .from('team_members')
      .insert(inviteData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update team member
  update: async (memberId: string, memberData: any) => {
    const { data, error } = await supabase
      .from('team_members')
      .update(memberData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete team member
  delete: async (memberId: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  }
};

// Bank details API
export const bankAPI = {
  // Get bank details for dealer
  getBankDetails: async (dealerId: string) => {
    const { data, error } = await supabase
      .from('bank_details')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Create bank details
  create: async (bankData: any) => {
    const { data, error } = await supabase
      .from('bank_details')
      .insert(bankData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update bank details
  update: async (bankId: string, bankData: any) => {
    const { data, error } = await supabase
      .from('bank_details')
      .update(bankData)
      .eq('id', bankId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete bank details
  delete: async (bankId: string) => {
    const { error } = await supabase
      .from('bank_details')
      .delete()
      .eq('id', bankId);

    if (error) throw error;
    return true;
  }
};

// Admin verification API
export const adminAPI = {
  // Get pending verifications
  getPendingVerifications: async () => {
    const { data, error } = await supabase
      .from('dealers')
      .select(`
        *,
        branches (*),
        team_members (*),
        bank_details (*)
      `)
      .eq('verification_status_new', 'pending')
      .order('onboarding_started_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Verify dealer
  verifyDealer: async (dealerId: string, verifiedBy: string) => {
    const { data, error } = await supabase
      .rpc('verify_dealer', {
        p_dealer_id: dealerId,
        p_verified_by: verifiedBy
      });

    if (error) throw error;
    return data;
  },

  // Reject dealer
  rejectDealer: async (dealerId: string, rejectedBy: string, reason: string) => {
    const { data, error } = await supabase
      .rpc('reject_dealer', {
        p_dealer_id: dealerId,
        p_rejected_by: rejectedBy,
        p_reason: reason
      });

    if (error) throw error;
    return data;
  },

  // Get audit logs
  getAuditLogs: async (dealerId?: string) => {
    let query = supabase
      .from('onboarding_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (dealerId) {
      query = query.eq('dealer_id', dealerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
