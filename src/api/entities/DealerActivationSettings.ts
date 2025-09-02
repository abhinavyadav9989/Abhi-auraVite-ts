// Phase 1: Dealer Activation Settings Entity Adapter - OPTIMIZED
// Uses extended dealers table instead of separate tables for efficiency

import { db } from '@/api/supabaseClient';
import type { Database } from '@/types/database-all.types';

// Type definitions based on extended dealers table schema
export interface DealerActivationSettings {
  dealer_id: string;
  activation_completed: boolean;
  activation_date?: string;
  last_activation_update?: string;

  // Business Type
  business_type: 'used' | 'new' | 'both' | 'individual';

  // Branches & Team
  current_branches: number;
  expected_growth: 'stable' | 'growing' | 'expanding';
  has_sub_branches: boolean;

  // Brand Coverage
  brand_coverage: BrandCoverageItem[];

  // Advanced Specs
  advanced_specs_enabled: boolean;
  conditional_fields_enabled: boolean;

  // Transfers & Logistics
  use_internal_drivers: boolean;
  use_external_carriers: boolean;
  preferred_carriers: string[];
  checklist_required: boolean;
  photo_verification: boolean;

  // Inspections
  intake_checks: boolean;
  pdi_required: boolean;
  checklist_templates: string[];
  auto_create_inspection_jobs: boolean;

  // Bulk Operations
  bulk_volume_expected: 'small' | 'medium' | 'large';
  data_sources: string[];
  automation_level: 'manual' | 'semi' | 'full';

  // Approvals
  price_bands_enabled: boolean;
  multi_stage_approvals: boolean;
  auto_approval_limit?: number;

  // Analytics
  dashboard_type: 'basic' | 'advanced' | 'custom';
  key_metrics: string[];
  report_frequency: 'daily' | 'weekly' | 'monthly';

  // Theming
  custom_branding: boolean;
  consistent_theme: boolean;
  branch_specific_colors: boolean;
}

export interface BrandCoverageItem {
  brand: string;
  exclusive: boolean;
  branches: string[];
}

export interface UnlockedFeature {
  id?: string;
  dealer_id: string;
  feature_id: string;
  unlocked_at?: string;
  unlocked_by_step?: number;
  is_active: boolean;
}

export interface ActivationStatus {
  activation_completed: boolean;
  business_type: string | null;
  current_branches: number;
  unlocked_features: UnlockedFeature[];
}

// Main DealerActivationSettings entity - OPTIMIZED
export const DealerActivationSettings = {
  // Get activation settings for a dealer from extended dealers table
  async get(dealerId: string): Promise<{ data: DealerActivationSettings | null; error: any }> {
    try {
      const { data, error } = await db
        .from('dealers')
        .select(`
          id,
          activation_completed,
          activation_date,
          last_activation_update,
          business_type,
          current_branches,
          expected_growth,
          has_sub_branches,
          advanced_specs_enabled,
          conditional_fields_enabled,
          use_internal_drivers,
          use_external_carriers,
          preferred_carriers,
          checklist_required,
          photo_verification,
          intake_checks,
          pdi_required,
          checklist_templates,
          auto_create_inspection_jobs,
          bulk_volume_expected,
          data_sources,
          automation_level,
          price_bands_enabled,
          multi_stage_approvals,
          auto_approval_limit,
          dashboard_type,
          key_metrics,
          report_frequency,
          custom_branding,
          consistent_theme,
          branch_specific_colors,
          brand_coverage
        `)
        .eq('id', dealerId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { data: null, error };
      }

      if (data) {
        // Transform the data to match our interface - safely cast the data
        const dealerData = data as any; // Type-safe access to new columns
        const settings: DealerActivationSettings = {
          dealer_id: dealerId,
          activation_completed: dealerData.activation_completed || false,
          activation_date: dealerData.activation_date,
          last_activation_update: dealerData.last_activation_update,
          business_type: dealerData.business_type || 'used',
          current_branches: dealerData.current_branches || 1,
          expected_growth: dealerData.expected_growth || 'stable',
          has_sub_branches: dealerData.has_sub_branches || false,
          brand_coverage: dealerData.brand_coverage || [],
          advanced_specs_enabled: dealerData.advanced_specs_enabled || false,
          conditional_fields_enabled: dealerData.conditional_fields_enabled || false,
          use_internal_drivers: dealerData.use_internal_drivers || false,
          use_external_carriers: dealerData.use_external_carriers || false,
          preferred_carriers: dealerData.preferred_carriers || [],
          checklist_required: dealerData.checklist_required || false,
          photo_verification: dealerData.photo_verification || false,
          intake_checks: dealerData.intake_checks || false,
          pdi_required: dealerData.pdi_required || false,
          checklist_templates: dealerData.checklist_templates || [],
          auto_create_inspection_jobs: dealerData.auto_create_inspection_jobs || false,
          bulk_volume_expected: dealerData.bulk_volume_expected || 'small',
          data_sources: dealerData.data_sources || [],
          automation_level: dealerData.automation_level || 'manual',
          price_bands_enabled: dealerData.price_bands_enabled || false,
          multi_stage_approvals: dealerData.multi_stage_approvals || false,
          auto_approval_limit: dealerData.auto_approval_limit,
          dashboard_type: dealerData.dashboard_type || 'basic',
          key_metrics: dealerData.key_metrics || [],
          report_frequency: dealerData.report_frequency || 'weekly',
          custom_branding: dealerData.custom_branding || false,
          consistent_theme: dealerData.consistent_theme || false,
          branch_specific_colors: dealerData.branch_specific_colors || false
        };
        return { data: settings, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create or update activation settings using database function
  async upsert(settings: DealerActivationSettings): Promise<{ data: DealerActivationSettings | null; error: any }> {
    try {
      // Convert settings to JSONB for the database function
      const settingsJson = {
        activation_completed: true,
        activation_date: settings.activation_date || new Date().toISOString(),
        business_type: settings.business_type,
        current_branches: settings.current_branches,
        expected_growth: settings.expected_growth,
        has_sub_branches: settings.has_sub_branches,
        advanced_specs_enabled: settings.advanced_specs_enabled,
        conditional_fields_enabled: settings.conditional_fields_enabled,
        use_internal_drivers: settings.use_internal_drivers,
        use_external_carriers: settings.use_external_carriers,
        preferred_carriers: settings.preferred_carriers,
        checklist_required: settings.checklist_required,
        photo_verification: settings.photo_verification,
        intake_checks: settings.intake_checks,
        pdi_required: settings.pdi_required,
        checklist_templates: settings.checklist_templates,
        auto_create_inspection_jobs: settings.auto_create_inspection_jobs,
        bulk_volume_expected: settings.bulk_volume_expected,
        data_sources: settings.data_sources,
        automation_level: settings.automation_level,
        price_bands_enabled: settings.price_bands_enabled,
        multi_stage_approvals: settings.multi_stage_approvals,
        auto_approval_limit: settings.auto_approval_limit,
        dashboard_type: settings.dashboard_type,
        key_metrics: settings.key_metrics,
        report_frequency: settings.report_frequency,
        custom_branding: settings.custom_branding,
        consistent_theme: settings.consistent_theme,
        branch_specific_colors: settings.branch_specific_colors,
        brand_coverage: settings.brand_coverage
      };

      // Use the database function to update settings and unlock features
      const { error } = await db.rpc('update_dealer_activation_settings' as any, {
        dealer_uuid: settings.dealer_id,
        settings_data: settingsJson as any, // Type-safe for Json
        changed_by_uuid: null // Will be set by RLS
      });

      if (error) {
        return { data: null, error };
      }

      // Return the updated settings
      return await this.get(settings.dealer_id);
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update specific fields using database function
  async update(dealerId: string, updates: Partial<DealerActivationSettings>): Promise<{ data: DealerActivationSettings | null; error: any }> {
    try {
      // Convert updates to JSONB format for the database function
      const updatesJson: any = {};
      if (updates.business_type !== undefined) updatesJson.business_type = updates.business_type;
      if (updates.current_branches !== undefined) updatesJson.current_branches = updates.current_branches;
      if (updates.expected_growth !== undefined) updatesJson.expected_growth = updates.expected_growth;
      if (updates.has_sub_branches !== undefined) updatesJson.has_sub_branches = updates.has_sub_branches;
      if (updates.advanced_specs_enabled !== undefined) updatesJson.advanced_specs_enabled = updates.advanced_specs_enabled;
      if (updates.conditional_fields_enabled !== undefined) updatesJson.conditional_fields_enabled = updates.conditional_fields_enabled;
      if (updates.use_internal_drivers !== undefined) updatesJson.use_internal_drivers = updates.use_internal_drivers;
      if (updates.use_external_carriers !== undefined) updatesJson.use_external_carriers = updates.use_external_carriers;
      if (updates.preferred_carriers !== undefined) updatesJson.preferred_carriers = updates.preferred_carriers;
      if (updates.checklist_required !== undefined) updatesJson.checklist_required = updates.checklist_required;
      if (updates.photo_verification !== undefined) updatesJson.photo_verification = updates.photo_verification;
      if (updates.intake_checks !== undefined) updatesJson.intake_checks = updates.intake_checks;
      if (updates.pdi_required !== undefined) updatesJson.pdi_required = updates.pdi_required;
      if (updates.checklist_templates !== undefined) updatesJson.checklist_templates = updates.checklist_templates;
      if (updates.auto_create_inspection_jobs !== undefined) updatesJson.auto_create_inspection_jobs = updates.auto_create_inspection_jobs;
      if (updates.bulk_volume_expected !== undefined) updatesJson.bulk_volume_expected = updates.bulk_volume_expected;
      if (updates.data_sources !== undefined) updatesJson.data_sources = updates.data_sources;
      if (updates.automation_level !== undefined) updatesJson.automation_level = updates.automation_level;
      if (updates.price_bands_enabled !== undefined) updatesJson.price_bands_enabled = updates.price_bands_enabled;
      if (updates.multi_stage_approvals !== undefined) updatesJson.multi_stage_approvals = updates.multi_stage_approvals;
      if (updates.auto_approval_limit !== undefined) updatesJson.auto_approval_limit = updates.auto_approval_limit;
      if (updates.dashboard_type !== undefined) updatesJson.dashboard_type = updates.dashboard_type;
      if (updates.key_metrics !== undefined) updatesJson.key_metrics = updates.key_metrics;
      if (updates.report_frequency !== undefined) updatesJson.report_frequency = updates.report_frequency;
      if (updates.custom_branding !== undefined) updatesJson.custom_branding = updates.custom_branding;
      if (updates.consistent_theme !== undefined) updatesJson.consistent_theme = updates.consistent_theme;
      if (updates.branch_specific_colors !== undefined) updatesJson.branch_specific_colors = updates.branch_specific_colors;
      if (updates.brand_coverage !== undefined) updatesJson.brand_coverage = updates.brand_coverage;

      // Use the database function to update
      const { error } = await db.rpc('update_dealer_activation_settings' as any, {
        dealer_uuid: dealerId,
        settings_data: updatesJson as any,
        changed_by_uuid: null
      });

      if (error) {
        return { data: null, error };
      }

      // Return the updated settings
      return await this.get(dealerId);
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get activation status summary using database function
  async getActivationStatus(dealerId: string): Promise<{ data: ActivationStatus | null; error: any }> {
    try {
      const { data, error } = await db.rpc('get_dealer_activation_status' as any, {
        dealer_uuid: dealerId
      });

      if (error) {
        return { data: null, error };
      }

      // Transform the result to match our interface
      if (data) {
        const statusData = data as any; // Type-safe access
        const activationStatus: ActivationStatus = {
          activation_completed: statusData.activation_completed || false,
          business_type: statusData.business_type,
          current_branches: statusData.current_branches || 1,
          unlocked_features: statusData.unlocked_features || []
        };
        return { data: activationStatus, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // NOTE: Feature unlocking is now handled automatically by the
  // update_dealer_activation_settings database function
  // No separate method needed here

  // Check if dealer has specific feature unlocked
  async hasFeatureUnlocked(dealerId: string, featureId: string): Promise<{ data: boolean; error: any }> {
    try {
      const { data, error } = await db.rpc('dealer_has_feature_unlocked' as any, {
        dealer_uuid: dealerId,
        feature_name: featureId
      });

      if (error) {
        return { data: false, error };
      }

      return { data: !!data, error: null };
    } catch (error) {
      return { data: false, error };
    }
  },

  // Get all unlocked features for a dealer
  async getUnlockedFeatures(dealerId: string): Promise<{ data: UnlockedFeature[]; error: any }> {
    try {
      const { data, error } = await db
        .from('dealer_unlocked_features' as any) // Type-safe access to new table
        .select('*')
        .eq('dealer_id', dealerId)
        .eq('is_active', true)
        .order('unlocked_at', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      return { data: (data as unknown as UnlockedFeature[]) || [], error: null };
    } catch (error) {
      return { data: [] as unknown as UnlockedFeature[], error };
    }
  },

  // Get default settings for new dealers
  getDefaultSettings(dealerId: string): DealerActivationSettings {
    return {
      dealer_id: dealerId,
      activation_completed: false,
      business_type: 'used',
      current_branches: 1,
      expected_growth: 'stable',
      has_sub_branches: false,
      brand_coverage: [],
      advanced_specs_enabled: false,
      conditional_fields_enabled: false,
      use_internal_drivers: false,
      use_external_carriers: false,
      preferred_carriers: [],
      checklist_required: false,
      photo_verification: false,
      intake_checks: false,
      pdi_required: false,
      checklist_templates: [],
      auto_create_inspection_jobs: false,
      bulk_volume_expected: 'small',
      data_sources: [],
      automation_level: 'manual',
      price_bands_enabled: false,
      multi_stage_approvals: false,
      dashboard_type: 'basic',
      key_metrics: [],
      report_frequency: 'weekly',
      custom_branding: false,
      consistent_theme: false,
      branch_specific_colors: false
    };
  }
};

// Export types for use in other files
export type { DealerActivationSettings as DealerActivationSettingsType };
export type { UnlockedFeature as UnlockedFeatureType };
export type { ActivationStatus as ActivationStatusType };
export type { BrandCoverageItem as BrandCoverageItemType };
