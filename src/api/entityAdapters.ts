import { supabase } from './supabaseClient';

// Generic entity adapter that mimics Base44 API
class EntityAdapter {
  constructor(private tableName: string) {}

  // Mimic Base44's list() method
  async list(filters?: any) {
    let query = supabase.from(this.tableName).select('*');
    
    if (filters) {
      // Apply filters similar to Base44
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Mimic Base44's get() method
  async get(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Mimic Base44's create() method
  async create(data: any) {
    console.log(`EntityAdapter.create() - Table: ${this.tableName}, Data:`, data);
    
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error(`EntityAdapter.create() - Error for table ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`EntityAdapter.create() - Success for table ${this.tableName}:`, result);
      return result;
    } catch (error) {
      console.error(`EntityAdapter.create() - Exception for table ${this.tableName}:`, error);
      throw error;
    }
  }

  // Mimic Base44's update() method
  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  // Simple upsert helper for tables with unique keys (e.g., vehicle_id in vehicle_condition)
  async upsert(data: any | any[]) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .upsert(data)
      .select();
    if (error) throw error;
    return result;
  }

  // Mimic Base44's delete() method
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Mimic Base44's filter() method
  async filter(filters: any) {
    console.log(`EntityAdapter.filter() - Table: ${this.tableName}, Filters:`, filters);
    
    try {
      // Ensure we never query with an anonymous session which will 403 under RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn(`EntityAdapter.filter() - Aborting query for ${this.tableName}: no authenticated session`);
        // Return empty list to mimic a safe, non-error state for callers that expect [] when unauthenticated
        return [] as any[];
      }

      let query = supabase.from(this.tableName).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          console.log(`EntityAdapter.filter() - Adding filter: ${key} = ${value}`);
          
          // Handle $or operator
          if (key === '$or' && Array.isArray(value)) {
            // For $or, we need to use .or() method
            const orConditions = value.map(condition => {
              const [field, fieldValue] = Object.entries(condition)[0];
              return `${field}.eq.${fieldValue}`;
            });
            query = query.or(orConditions.join(','));
          } else {
            // Regular equality filter
            query = query.eq(key, value);
          }
        });
      }
      
      console.log(`EntityAdapter.filter() - Final query for ${this.tableName}:`, query);
      const { data, error } = await query;
      
      if (error) {
        console.error(`EntityAdapter.filter() - Error for table ${this.tableName}:`, error);
        console.error(`EntityAdapter.filter() - Error details:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`EntityAdapter.filter() - Success for table ${this.tableName}:`, data);
      return data;
    } catch (error) {
      console.error(`EntityAdapter.filter() - Exception for table ${this.tableName}:`, error);
      throw error;
    }
  }
}

// Enhanced Auth adapter that matches your existing Base44 API
class AuthAdapter {
  // Match your existing User.me() call
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Match your existing User.loginWithRedirect() call
  async loginWithRedirect(redirectUrl?: string) {
    // For now, we'll redirect to a login page
    // In a full implementation, this could open a modal or redirect
    if (redirectUrl) {
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    } else {
      window.location.href = '/login';
    }
  }

  // Match your existing User.logout() call
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }

  // Match your existing User.updateMyUserData() call
  async updateMyUserData(data: any) {
    const { data: user, error } = await supabase.auth.updateUser(data);
    if (error) throw error;
    return user;
  }

  // Standard Supabase auth methods
  async signUp(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }

  async signIn(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Mimic Base44's list() for admin functionality
  async list() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return data;
  }

  // Get session for additional auth data
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
}

// Create entity instances
export const Dealer = new EntityAdapter('dealers');
export const Vehicle = new EntityAdapter('vehicles');
export const VehicleAsset = new EntityAdapter('vehicle_assets');
export const VehicleDocument = new EntityAdapter('vehicle_documents');
export const Transaction = new EntityAdapter('transactions');
export const Payment = new EntityAdapter('payments');
export const LogisticsOrder = new EntityAdapter('logistics_orders');
export const RTOApplication = new EntityAdapter('rto_applications');
export const BankAccount = new EntityAdapter('bank_accounts');
export const BankDetails = new EntityAdapter('bank_details');
export const DealerPreferences = new EntityAdapter('dealer_preferences');
export const UserSession = new EntityAdapter('user_sessions');
export const TeamMember = new EntityAdapter('team_members');
export const DealerDocument = new EntityAdapter('dealer_documents');
export const DealerHours = new EntityAdapter('dealer_hours');
export const DealerReview = new EntityAdapter('dealer_reviews');
export const DealerRating = new EntityAdapter('dealer_ratings');
export const DealerInquiry = new EntityAdapter('dealer_inquiries');
export const AuditLog = new EntityAdapter('audit_logs');
export const Shortlist = new EntityAdapter('shortlists');
export const VehicleInspection = new EntityAdapter('vehicle_inspections');
export const VehicleCondition = new EntityAdapter('vehicle_condition');
export const Branch = new EntityAdapter('branches');
export const AppConfig = new EntityAdapter('app_configs');

// Auth instance
export const User = new AuthAdapter();
