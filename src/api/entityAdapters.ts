import { db } from './supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import type { 
  Vehicle as VehicleRow, VehicleInsert, VehicleUpdate,
  VehicleDocument as VehicleDocumentRow, VehicleDocumentInsert, VehicleDocumentUpdate,
  VehicleCondition as VehicleConditionRow, VehicleConditionInsert, VehicleConditionUpdate,
  Dealer as DealerRow, DealerInsert, DealerUpdate,
  Transaction as TransactionRow, TransactionInsert, TransactionUpdate,
  Payment as PaymentRow, PaymentInsert, PaymentUpdate,
  BankAccount as BankAccountRow, BankAccountInsert, BankAccountUpdate,
  Branch as BranchRow, BranchInsert, BranchUpdate,
  TeamMember as TeamMemberRow, TeamMemberInsert, TeamMemberUpdate,
  AuditLog as AuditLogRow, AuditLogInsert, AuditLogUpdate,
  Shortlist as ShortlistRow, ShortlistInsert, ShortlistUpdate,
  VehicleInspection as VehicleInspectionRow, VehicleInspectionInsert, VehicleInspectionUpdate,
  AppConfig as AppConfigRow, AppConfigInsert, AppConfigUpdate,
  BankDetail as BankDetailRow, BankDetailInsert, BankDetailUpdate,
  DealerDocument as DealerDocumentRow, DealerDocumentInsert, DealerDocumentUpdate,
  DealerHours as DealerHoursRow, DealerHoursInsert, DealerHoursUpdate,
  DealerReview as DealerReviewRow, DealerReviewInsert, DealerReviewUpdate,
  DealerInquiry as DealerInquiryRow, DealerInquiryInsert, DealerInquiryUpdate,
  DealerPreferences as DealerPreferencesRow, DealerPreferencesInsert, DealerPreferencesUpdate,
  LogisticsOrder as LogisticsOrderRow, LogisticsOrderInsert, LogisticsOrderUpdate,
  RTOApplication as RTOApplicationRow, RTOApplicationInsert, RTOApplicationUpdate,
  UserSession as UserSessionRow, UserSessionInsert, UserSessionUpdate,
  VehicleAsset as VehicleAssetRow, VehicleAssetInsert, VehicleAssetUpdate,
  OnboardingAuditLog as OnboardingAuditLogRow, OnboardingAuditLogInsert, OnboardingAuditLogUpdate
} from '@/types';
import { 
  validateVehicleInsert, validateVehicleUpdate,
  validateVehicleDocumentInsert, validateVehicleDocumentUpdate,
  validateVehicleConditionInsert, validateVehicleConditionUpdate,
  validateDealerInsert, validateDealerUpdate,
  BusinessRules
} from '@/lib/validation';

// Type for filter objects
type FilterObject = Record<string, string | number | boolean | null>;

// ===== TYPE-SAFE ENTITY ADAPTERS =====

// Vehicle Entity Adapter
export const Vehicle = {
  async list(filters?: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any).from('vehicles').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  },

  async get(id: string): Promise<VehicleRow | null> {
    const { data, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleRow | null;
  },

  async create(data: unknown): Promise<VehicleRow> {
    const validatedData = validateVehicleInsert(data);
    const { data: result, error } = await (db as any)
      .from('vehicles')
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleRow;
  },

  async update(id: string, data: unknown): Promise<VehicleRow> {
    const validatedData = validateVehicleUpdate(data);
    const { data: result, error } = await (db as any)
      .from('vehicles')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleRow;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from('vehicles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async filter(filters: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any).from('vehicles').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleRow[];
  },

  // Vehicle-specific methods
  async getByDealer(dealerId: string, filters?: FilterObject): Promise<VehicleRow[]> {
    let query = (db as any)
      .from('vehicles')
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
  },

  async getByStatus(status: VehicleRow['status']): Promise<VehicleRow[]> {
    const { data, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .eq('status', status);
    if (error) throw error;
    return (data || []) as VehicleRow[];
  },

  async search(query: string): Promise<VehicleRow[]> {
    const { data, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .or(`make.ilike.%${query}%,model.ilike.%${query}%,registration_number.ilike.%${query}%`);
    if (error) throw error;
    return (data || []) as VehicleRow[];
  },

  // Additional methods for Inventory management
  async getByBranch(branchId: string): Promise<{ data: VehicleRow[] | null; error: any }> {
    const { data, error } = await (db as any)
      .from('vehicles')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    return { data: (data || []) as VehicleRow[], error };
  },

  async getStats(branchId: string): Promise<{ data: any; error: any }> {
    // Get vehicle counts by status for the branch
    const { data, error } = await (db as any)
      .from('vehicles')
      .select('status')
      .eq('branch_id', branchId);

    if (error) {
      return { data: null, error };
    }

    const stats = {
      total: data?.length || 0,
      public: data?.filter((v: any) => v.status === 'live').length || 0,
      private: data?.filter((v: any) => v.status === 'draft').length || 0,
      service: data?.filter((v: any) => v.status === 'service').length || 0,
      aging: data?.filter((v: any) => v.status === 'aging').length || 0,
      pendingApprovals: 0, // This would need approval workflow implementation
      pendingTransfers: 0, // This would need transfer workflow implementation
      duplicates: 0 // This would need duplicate detection implementation
    };

    return { data: stats, error: null };
  },

  async bulkPublish(vehicleIds: string[]): Promise<{ success: boolean; count: number }> {
    const { error } = await (db as any)
      .from('vehicles')
      .update({ status: 'live', updated_at: new Date().toISOString() })
      .in('id', vehicleIds);

    if (error) throw error;
    return { success: true, count: vehicleIds.length };
  },

  async bulkUnpublish(vehicleIds: string[]): Promise<{ success: boolean; count: number }> {
    const { error } = await (db as any)
      .from('vehicles')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .in('id', vehicleIds);

    if (error) throw error;
    return { success: true, count: vehicleIds.length };
  },

  async bulkDelete(vehicleIds: string[]): Promise<{ success: boolean; count: number }> {
    const { error } = await (db as any)
      .from('vehicles')
      .delete()
      .in('id', vehicleIds);

    if (error) throw error;
    return { success: true, count: vehicleIds.length };
  },

  async findDuplicates(params?: any): Promise<{ data: VehicleRow[] | null; error: any }> {
    // Simple duplicate detection based on registration number and VIN
    let query = (db as any).from('vehicles').select('*');

    if (params?.registration_number) {
      query = query.eq('registration_number', params.registration_number);
    }

    if (params?.vin) {
      query = query.or(`vin.eq.${params.vin}`);
    }

    const { data, error } = await query.limit(10);
    return { data: (data || []) as VehicleRow[], error };
  },

  async mergeDuplicates(params: { primaryVehicleId: string; duplicateIds: string[] }): Promise<{ data: any; error: any }> {
    try {
      // Mark duplicates as merged and update primary vehicle
      const { error } = await (db as any)
        .from('vehicles')
        .update({
          status: 'merged',
          merged_into: params.primaryVehicleId,
          updated_at: new Date().toISOString()
        })
        .in('id', params.duplicateIds);

      return { data: { success: true, merged: params.duplicateIds.length }, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Vehicle Document Entity Adapter
export const VehicleDocument = {
  async list(filters?: FilterObject): Promise<VehicleDocumentRow[]> {
    let query = (db as any).from('vehicle_documents').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  },

  async get(id: string): Promise<VehicleDocumentRow | null> {
    const { data, error } = await (db as any)
      .from('vehicle_documents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleDocumentRow | null;
  },

  async create(data: unknown): Promise<VehicleDocumentRow> {
    const validatedData = validateVehicleDocumentInsert(data);
    const { data: result, error } = await (db as any)
      .from('vehicle_documents')
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleDocumentRow;
  },

  async update(id: string, data: unknown): Promise<VehicleDocumentRow> {
    const validatedData = validateVehicleDocumentUpdate(data);
    const { data: result, error } = await (db as any)
      .from('vehicle_documents')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleDocumentRow;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from('vehicle_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async filter(filters: FilterObject): Promise<VehicleDocumentRow[]> {
    let query = (db as any).from('vehicle_documents').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  },

  // Vehicle Document-specific methods
  async getByVehicle(vehicleId: string): Promise<VehicleDocumentRow[]> {
    const { data, error } = await (db as any)
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  },

  async getByType(vehicleId: string, documentType: VehicleDocumentRow['document_type']): Promise<VehicleDocumentRow[]> {
    const { data, error } = await (db as any)
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('document_type', documentType)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }
};

// Vehicle Condition Entity Adapter
export const VehicleCondition = {
  async list(filters?: FilterObject): Promise<VehicleConditionRow[]> {
    let query = (db as any).from('vehicle_condition').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  },

  async get(id: string): Promise<VehicleConditionRow | null> {
    const { data, error } = await (db as any)
      .from('vehicle_condition')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleConditionRow | null;
  },

  async create(data: unknown): Promise<VehicleConditionRow> {
    const validatedData = validateVehicleConditionInsert(data);
    const { data: result, error } = await (db as any)
      .from('vehicle_condition')
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleConditionRow;
  },

  async update(id: string, data: unknown): Promise<VehicleConditionRow> {
    const validatedData = validateVehicleConditionUpdate(data);
    const { data: result, error } = await (db as any)
      .from('vehicle_condition')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleConditionRow;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from('vehicle_condition')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async filter(filters: FilterObject): Promise<VehicleConditionRow[]> {
    let query = (db as any).from('vehicle_condition').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  },

  // Vehicle Condition-specific methods
  async getByVehicle(vehicleId: string): Promise<VehicleConditionRow[]> {
    const { data, error } = await (db as any)
      .from('vehicle_condition')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleConditionRow[];
  },

  async getLatestByVehicle(vehicleId: string): Promise<VehicleConditionRow | null> {
    const { data, error } = await (db as any)
      .from('vehicle_condition')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as VehicleConditionRow | null;
  }
};

// Dealer Entity Adapter
export const Dealer = {
  async list(filters?: FilterObject): Promise<DealerRow[]> {
    let query = (db as any).from('dealers').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DealerRow[];
  },

  async get(id: string): Promise<DealerRow | null> {
    const { data, error } = await (db as any)
      .from('dealers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as DealerRow | null;
  },

  async create(data: unknown): Promise<DealerRow> {
    const validatedData = validateDealerInsert(data);
    const { data: result, error } = await (db as any)
      .from('dealers')
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as DealerRow;
  },

  async update(id: string, data: unknown): Promise<DealerRow> {
    const validatedData = validateDealerUpdate(data);
    const { data: result, error } = await (db as any)
      .from('dealers')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as DealerRow;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from('dealers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async filter(filters: FilterObject): Promise<DealerRow[]> {
    let query = (db as any).from('dealers').select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DealerRow[];
  },

  // Dealer-specific methods
  async getByEmail(email: string): Promise<DealerRow | null> {
    const { data, error } = await (db as any)
      .from('dealers')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as DealerRow | null;
  },

  async getByUserId(userId: string): Promise<DealerRow | null> {
    const { data, error } = await (db as any)
      .from('dealers')
      .select('*')
      .eq('owner_user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as DealerRow | null;
  },

  async getVerified(): Promise<DealerRow[]> {
    const { data, error } = await (db as any)
      .from('dealers')
      .select('*')
      .eq('is_verified', true);
    if (error) throw error;
    return (data || []) as DealerRow[];
  },

  async createBranch(formData: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branches')
        .insert({
          dealer_id: formData.dealer_id || formData.dealerId,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          contact_number: formData.contact_number || formData.phone,
          working_hours: formData.working_hours || formData.business_hours || {},
          is_default: formData.is_default || formData.isDefault,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Generic Entity Adapter Factory (for other entities)
function createGenericEntityAdapter<T, TInsert, TUpdate>(
  tableName: string,
  validateInsert?: (data: unknown) => TInsert,
  validateUpdate?: (data: unknown) => TUpdate
) {
  return {
    async list(filters?: FilterObject): Promise<T[]> {
      let query = (db as any).from(tableName).select('*');
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as T[];
    },

    async get(id: string): Promise<T | null> {
      const { data, error } = await (db as any)
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as T | null;
    },

    async create(data: unknown): Promise<T> {
      const validatedData = validateInsert ? validateInsert(data) : data as TInsert;
      const { data: result, error } = await (db as any)
        .from(tableName)
        .insert(validatedData)
        .select()
        .single();
      if (error) throw error;
      return result as T;
    },

    async update(id: string, data: unknown): Promise<T> {
      const validatedData = validateUpdate ? validateUpdate(data) : data as TUpdate;
      const { data: result, error } = await (db as any)
        .from(tableName)
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result as T;
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const { error } = await (db as any)
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    async filter(filters: FilterObject): Promise<T[]> {
      let query = (db as any).from(tableName).select('*');
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as T[];
    }
  };
}

// Create other entity adapters using the generic factory
export const Transaction = createGenericEntityAdapter<TransactionRow, TransactionInsert, TransactionUpdate>('transactions');
export const Payment = createGenericEntityAdapter<PaymentRow, PaymentInsert, PaymentUpdate>('payments');
export const BankAccount = createGenericEntityAdapter<BankAccountRow, BankAccountInsert, BankAccountUpdate>('bank_accounts');
export const Branch = createGenericEntityAdapter<BranchRow, BranchInsert, BranchUpdate>('branches');
export const TeamMember = createGenericEntityAdapter<TeamMemberRow, TeamMemberInsert, TeamMemberUpdate>('team_members');
export const AuditLog = createGenericEntityAdapter<AuditLogRow, AuditLogInsert, AuditLogUpdate>('audit_logs');
export const Shortlist = createGenericEntityAdapter<ShortlistRow, ShortlistInsert, ShortlistUpdate>('shortlists');
export const VehicleInspection = createGenericEntityAdapter<VehicleInspectionRow, VehicleInspectionInsert, VehicleInspectionUpdate>('vehicle_inspections');
export const AppConfig = createGenericEntityAdapter<AppConfigRow, AppConfigInsert, AppConfigUpdate>('app_configs');
export const BankDetail = createGenericEntityAdapter<BankDetailRow, BankDetailInsert, BankDetailUpdate>('bank_details');
export const DealerDocument = createGenericEntityAdapter<DealerDocumentRow, DealerDocumentInsert, DealerDocumentUpdate>('dealer_documents');
export const DealerHours = createGenericEntityAdapter<DealerHoursRow, DealerHoursInsert, DealerHoursUpdate>('dealer_hours');
export const DealerReview = createGenericEntityAdapter<DealerReviewRow, DealerReviewInsert, DealerReviewUpdate>('dealer_reviews');
export const DealerInquiry = createGenericEntityAdapter<DealerInquiryRow, DealerInquiryInsert, DealerInquiryUpdate>('dealer_inquiries');
export const DealerPreferences = createGenericEntityAdapter<DealerPreferencesRow, DealerPreferencesInsert, DealerPreferencesUpdate>('dealer_preferences');
export const LogisticsOrder = createGenericEntityAdapter<LogisticsOrderRow, LogisticsOrderInsert, LogisticsOrderUpdate>('logistics_orders');
export const RTOApplication = createGenericEntityAdapter<RTOApplicationRow, RTOApplicationInsert, RTOApplicationUpdate>('rto_applications');
export const UserSession = createGenericEntityAdapter<UserSessionRow, UserSessionInsert, UserSessionUpdate>('user_sessions');
export const VehicleAsset = createGenericEntityAdapter<VehicleAssetRow, VehicleAssetInsert, VehicleAssetUpdate>('vehicle_assets');
export const OnboardingAuditLog = createGenericEntityAdapter<OnboardingAuditLogRow, OnboardingAuditLogInsert, OnboardingAuditLogUpdate>('onboarding_audit_log');

// Enhanced Auth adapter for authentication operations
export const User = {
  // Get current user
  async me(): Promise<SupabaseUser | null> {
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current user with role information
  async meWithRole(): Promise<(SupabaseUser & { role?: string }) | null> {
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    console.log('🔍 meWithRole - Basic user data:', {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata
    });

    // Get role from user metadata (this is where it should be stored)
    const role = user.user_metadata?.role || user.app_metadata?.role;
    console.log('🔍 meWithRole - Role from metadata:', role);

    const result = { ...user, role };
    console.log('🔍 meWithRole - Final result:', {
      email: result.email,
      role: result.role
    });
    
    return result;
  },

  // Login with redirect
  async loginWithRedirect(redirectUrl?: string) {
    if (redirectUrl) {
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    } else {
      window.location.href = '/login';
    }
  },

  // Logout user
  async logout() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  // Update user data
  async updateMyUserData(data: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const { data: user, error } = await db.auth.updateUser(data);
    if (error) throw error;
    return user;
  },

  // Get current session
  async getSession(): Promise<SupabaseSession | null> {
    const { data: { session }, error } = await db.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.me();
    return user !== null;
  },

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const userWithRole = await this.meWithRole();
    return userWithRole?.role === 'admin';
  },

  // Set admin role for current user (for testing purposes)
  async setAdminRole(): Promise<boolean> {
    try {
      const { data: { user }, error } = await db.auth.getUser();
      if (error || !user) throw new Error('No authenticated user');

      const { data, error: updateError } = await db.auth.updateUser({
        data: { role: 'admin' }
      });

      if (updateError) throw updateError;
      
      console.log('✅ Admin role set successfully for:', user.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to set admin role:', error);
      return false;
    }
  },

  // Remove admin role for current user (for testing purposes)
  async removeAdminRole(): Promise<boolean> {
    try {
      const { data: { user }, error } = await db.auth.getUser();
      if (error || !user) throw new Error('No authenticated user');

      const { data, error: updateError } = await db.auth.updateUser({
        data: { role: 'user' }
      });

      if (updateError) throw updateError;
      
      console.log('✅ Admin role removed successfully for:', user.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to remove admin role:', error);
      return false;
    }
  }
};

// ===== PHASE 4: ATTRIBUTE SETS & BRANCH HIERARCHY ENTITIES =====

// Attribute Set Entity
export const AttributeSet = {
  async list(filters?: { category?: string; isActive?: boolean }): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = (db as any).from('attribute_sets').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async get(id: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('attribute_sets')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(attributeSet: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('attribute_sets')
        .insert(attributeSet)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(id: string, updates: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('attribute_sets')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(id: string): Promise<{ data: null; error: any }> {
    try {
      const { error } = await (db as any)
        .from('attribute_sets')
        .delete()
        .eq('id', id);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get attribute sets for a specific category
  async getByCategory(category: string): Promise<{ data: any[] | null; error: any }> {
    return this.list({ category, isActive: true });
  },

  // Clone an existing attribute set
  async clone(id: string, newName: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data: originalSet, error: fetchError } = await this.get(id);
      if (fetchError || !originalSet) {
        return { data: null, error: fetchError };
      }

      const clonedSet = {
        ...originalSet,
        id: undefined, // Let Supabase generate new ID
        name: newName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return this.create(clonedSet);
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Vehicle Attribute Set Entity
export const VehicleAttributeSet = {
  async get(vehicleId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vehicle_attribute_sets')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(vehicleAttributeSet: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vehicle_attribute_sets')
        .insert(vehicleAttributeSet)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(vehicleId: string, updates: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vehicle_attribute_sets')
        .update(updates)
        .eq('vehicle_id', vehicleId)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async applyAttributeSet(request: any): Promise<{ data: any | null; error: any }> {
    try {
      // First, check if vehicle already has an attribute set
      const { data: existing } = await this.get(request.vehicleId);

      if (existing) {
        // Update existing
        return this.update(request.vehicleId, {
          attribute_set_id: request.attributeSetId,
          values: request.initialValues || {},
          is_completed: false
        });
      } else {
        // Create new
        return this.create({
          vehicle_id: request.vehicleId,
          attribute_set_id: request.attributeSetId,
          values: request.initialValues || {},
          is_completed: false
        });
      }
    } catch (error) {
      return { data: null, error };
    }
  }
};

// VIN Mapping Entity
export const VINMapping = {
  async list(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vin_mappings')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async get(id: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vin_mappings')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(mapping: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vin_mappings')
        .insert(mapping)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(id: string, updates: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('vin_mappings')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(id: string): Promise<{ data: null; error: any }> {
    try {
      const { error } = await (db as any)
        .from('vin_mappings')
        .delete()
        .eq('id', id);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Decode VIN using available mappings
  async decodeVIN(vin: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data: mappings, error: fetchError } = await this.list();
      if (fetchError || !mappings) {
        return { data: null, error: fetchError };
      }

      // Find matching mapping rule
      for (const mapping of mappings) {
        if (new RegExp(mapping.vin_pattern).test(vin)) {
          // Extract values based on mapping rules
          const decodedValues: Record<string, any> = {};

          Object.entries(mapping.field_mappings).forEach(([position, fieldId]) => {
            const pos = parseInt(position as string, 10);
            if (!isNaN(pos) && pos >= 0 && pos < vin.length) {
              decodedValues[fieldId as string] = vin[pos];
            }
          });

          return {
            data: {
              success: true,
              brand: mapping.brand,
              model: mapping.model,
              year: mapping.year,
              decodedValues,
              confidence: 85,
              source: 'local_mapping' as const
            },
            error: null
          };
        }
      }

      return {
        data: {
          success: false,
          confidence: 0,
          source: 'local_mapping' as const
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Branch Hierarchy Entity
export const BranchHierarchy = {
  async list(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .select('*')
        .eq('is_active', true)
        .order('depth', { ascending: true })
        .order('name', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async get(id: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(branch: any): Promise<{ data: any | null; error: any }> {
    try {
      // Calculate path and depth
      const path = branch.parentId ? [...(await this.getParentPath(branch.parentId)), branch.parentId] : [];
      const depth = path.length;

      const branchWithHierarchy = {
        ...branch,
        path,
        depth,
        is_active: true
      };

      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .insert(branchWithHierarchy)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(id: string, updates: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(id: string): Promise<{ data: null; error: any }> {
    try {
      // Soft delete by setting is_active to false
      const { error } = await (db as any)
        .from('branch_hierarchy')
        .update({ is_active: false })
        .eq('id', id);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get children of a branch
  async getChildren(parentId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get full hierarchy tree
  async getHierarchyTree(): Promise<{ data: any | null; error: any }> {
    try {
      const { data: allBranches, error: fetchError } = await this.list();
      if (fetchError || !allBranches) {
        return { data: null, error: fetchError };
      }

      // Build tree structure
      const buildTree = (parentId?: string): any[] => {
        return allBranches
          .filter(branch => branch.parent_id === parentId)
          .map(branch => ({
            ...branch,
            children: buildTree(branch.id)
          }));
      };

      const tree = buildTree();
      return { data: tree, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Move branch to new parent
  async moveBranch(branchId: string, newParentId?: string): Promise<{ data: any | null; error: any }> {
    try {
      const path = newParentId ? [...(await this.getParentPath(newParentId)), newParentId] : [];
      const depth = path.length;

      const { data, error } = await (db as any)
        .from('branch_hierarchy')
        .update({
          parent_id: newParentId,
          path,
          depth
        })
        .eq('id', branchId)
        .select('*')
        .single();

      // Update children paths as well
      if (data && !error) {
        await this.updateChildrenPaths(branchId, [...path, branchId]);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Helper method to get parent path
  async getParentPath(branchId: string): Promise<string[]> {
    try {
      const { data, error } = await this.get(branchId);
      return data?.path || [];
    } catch (error) {
      return [];
    }
  },

  // Helper method to update children paths recursively
  async updateChildrenPaths(parentId: string, parentPath: string[]): Promise<void> {
    try {
      const { data: children } = await this.getChildren(parentId);
      if (!children || children.length === 0) return;

      for (const child of children) {
        const childPath = [...parentPath, child.id];
        const childDepth = childPath.length - 1;

        await (db as any)
          .from('branch_hierarchy')
          .update({
            path: childPath.slice(0, -1), // Exclude self from path
            depth: childDepth
          })
          .eq('id', child.id);

        // Recursively update grandchildren
        await this.updateChildrenPaths(child.id, childPath);
      }
    } catch (error) {
      console.error('Error updating children paths:', error);
    }
  }
};

// Branch Theme Entity
export const BranchTheme = {
  async get(branchId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_themes')
        .select('*')
        .eq('branch_id', branchId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(theme: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_themes')
        .insert(theme)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(branchId: string, updates: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (db as any)
        .from('branch_themes')
        .update(updates)
        .eq('branch_id', branchId)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(branchId: string): Promise<{ data: null; error: any }> {
    try {
      const { error } = await (db as any)
        .from('branch_themes')
        .delete()
        .eq('branch_id', branchId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Apply theme to branch
  async applyTheme(branchId: string, themeData: any): Promise<{ data: any | null; error: any }> {
    try {
      const { data: existing } = await this.get(branchId);

      if (existing) {
        return this.update(branchId, themeData);
      } else {
        return this.create({
          branch_id: branchId,
          ...themeData
        });
      }
    } catch (error) {
      return { data: null, error };
    }
  }
};
