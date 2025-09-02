// Phase 1: Hook for managing dealer activation settings
// Provides React-friendly interface to activation settings API

import { useState, useEffect, useCallback } from 'react';
import { DealerActivationSettings, ActivationStatus, UnlockedFeature } from '@/api/entities/DealerActivationSettings';
import { db } from '@/api/supabaseClient';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface UseDealerActivationSettingsReturn {
  // State
  settings: DealerActivationSettings | null;
  activationStatus: ActivationStatus | null;
  unlockedFeatures: UnlockedFeature[];
  isLoading: boolean;
  error: string | null;

  // Actions
  saveSettings: (settings: DealerActivationSettings) => Promise<boolean>;
  updateSettings: (updates: Partial<DealerActivationSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  checkFeatureAccess: (featureId: string) => boolean;
  getFeatureExplanation: (featureId: string) => string;
  resetSettings: () => Promise<boolean>;
}

// Feature explanations for user education
const FEATURE_EXPLANATIONS: Record<string, string> = {
  unlimited_branches: "Allows you to create as many branches as your business needs, removing the 2-branch limit.",
  branch_hierarchy: "Organize your branches in a parent-child structure for better management and reporting.",
  brand_coverage: "Set up brand-specific configurations for new car inventory management.",
  attribute_sets: "Enable advanced vehicle specifications and custom data fields.",
  vin_mapping: "Automatically populate vehicle data from VIN numbers for faster inventory entry.",
  driver_assignment: "Manage internal drivers and assign them to vehicle transfers.",
  photo_verification: "Require before/after photos for all vehicle transfers to ensure quality.",
  inspections: "Set up professional inspection workflows for intake and pre-delivery checks.",
  bulk_operations: "Import large numbers of vehicles at once (up to 5,000 per batch).",
  data_ops: "Access advanced data import tools, scheduling, and error management.",
  approvals: "Set up multi-stage approval workflows for price changes and important decisions.",
  price_bands: "Define acceptable price ranges and get automatic notifications for outliers.",
  analytics: "Access advanced business intelligence dashboards and reporting.",
  scheduled_reports: "Receive automated reports via email at your preferred frequency.",
  branch_theming: "Customize the look and feel of individual branches with logos and colors."
};

export function useDealerActivationSettings(): UseDealerActivationSettingsReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [settings, setSettings] = useState<DealerActivationSettings | null>(null);
  const [activationStatus, setActivationStatus] = useState<ActivationStatus | null>(null);
  const [unlockedFeatures, setUnlockedFeatures] = useState<UnlockedFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount and when user changes
  const loadSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current dealer
      console.log('🔍 Load settings - Looking for dealer with email:', user.email);
      const { data: dealerResults, error: dealerError } = await db
        .from('dealers')
        .select('id')
        .eq('created_by', user.email);

      if (dealerError) {
        console.error('🔍 Load settings - Dealer query error:', dealerError);
        throw new Error(`Dealer lookup failed: ${dealerError.message}`);
      }

      if (!dealerResults || dealerResults.length === 0) {
        console.warn('🔍 Load settings - No dealer found for email:', user.email);
        // Don't throw error for missing dealer - just set defaults and return
        const defaultSettings = DealerActivationSettings.getDefaultSettings('');
        setSettings(defaultSettings);
        setActivationStatus({
          activation_completed: false,
          business_type: 'individual',
          current_branches: 1,
          unlocked_features: []
        });
        setIsLoading(false);
        return;
      }

      const dealerId = dealerResults[0].id;
      console.log('🔍 Load settings - Found dealer:', dealerId);

      // Load activation settings from dealer record
      const { data: dealerData, error: loadError } = await db
        .from('dealers')
        .select(`
          activation_completed,
          activation_date,
          business_type,
          current_branches,
          expected_growth,
          has_sub_branches,
          brand_coverage,
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
          branch_specific_colors
        `)
        .eq('id', dealerId)
        .single();

      if (loadError) {
        console.warn('No activation settings found, using defaults:', loadError);
        // Use default settings if no saved settings exist
        const defaultSettings = DealerActivationSettings.getDefaultSettings(dealerId);
        setSettings(defaultSettings);
        setActivationStatus({
          activation_completed: defaultSettings.activation_completed,
          business_type: defaultSettings.business_type,
          current_branches: defaultSettings.current_branches,
          unlocked_features: [
            {
              id: 'basic_inventory',
              dealer_id: dealerId,
              feature_id: 'basic_inventory',
              unlocked_at: new Date().toISOString(),
              is_active: true
            },
            {
              id: 'branch_management',
              dealer_id: dealerId,
              feature_id: 'branch_management',
              unlocked_at: new Date().toISOString(),
              is_active: true
            }
          ]
        });
        setUnlockedFeatures([
          {
            id: 'basic_inventory',
            dealer_id: dealerId,
            feature_id: 'basic_inventory',
            unlocked_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: 'branch_management',
            dealer_id: dealerId,
            feature_id: 'branch_management',
            unlocked_at: new Date().toISOString(),
            is_active: true
          }
        ]);
      } else {
        // Use loaded settings from database
        const loadedSettings: DealerActivationSettings = {
          dealer_id: dealerId,
          activation_completed: dealerData.activation_completed || false,
          activation_date: dealerData.activation_date || new Date().toISOString(),
          business_type: (dealerData.business_type as 'used' | 'new' | 'both' | 'individual') || 'used',
          current_branches: dealerData.current_branches || 1,
          expected_growth: (dealerData.expected_growth as 'stable' | 'growing' | 'expanding') || 'stable',
          has_sub_branches: dealerData.has_sub_branches || false,
          brand_coverage: (dealerData.brand_coverage as any[]) || [],
          advanced_specs_enabled: dealerData.advanced_specs_enabled || false,
          conditional_fields_enabled: dealerData.conditional_fields_enabled || false,
          use_internal_drivers: dealerData.use_internal_drivers || false,
          use_external_carriers: dealerData.use_external_carriers || false,
          preferred_carriers: (dealerData.preferred_carriers as string[]) || [],
          checklist_required: dealerData.checklist_required || false,
          photo_verification: dealerData.photo_verification || false,
          intake_checks: dealerData.intake_checks || false,
          pdi_required: dealerData.pdi_required || false,
          checklist_templates: (dealerData.checklist_templates as string[]) || [],
          auto_create_inspection_jobs: dealerData.auto_create_inspection_jobs || false,
          bulk_volume_expected: (dealerData.bulk_volume_expected as 'small' | 'medium' | 'large') || 'small',
          data_sources: (dealerData.data_sources as string[]) || [],
          automation_level: (dealerData.automation_level as 'full' | 'manual' | 'semi') || 'manual',
          price_bands_enabled: dealerData.price_bands_enabled || false,
          multi_stage_approvals: dealerData.multi_stage_approvals || false,
          auto_approval_limit: dealerData.auto_approval_limit || undefined,
          dashboard_type: (dealerData.dashboard_type as 'basic' | 'advanced' | 'custom') || 'basic',
          key_metrics: (dealerData.key_metrics as string[]) || [],
          report_frequency: (dealerData.report_frequency as 'daily' | 'weekly' | 'monthly') || 'weekly',
          custom_branding: dealerData.custom_branding || false,
          consistent_theme: dealerData.consistent_theme || false,
          branch_specific_colors: dealerData.branch_specific_colors || false
        };

        console.log('Loading activation settings from database:', {
          dealerId,
          activation_completed: loadedSettings.activation_completed,
          business_type: loadedSettings.business_type,
          dashboard_type: loadedSettings.dashboard_type
        });

        setSettings(loadedSettings);
        setActivationStatus({
          activation_completed: loadedSettings.activation_completed,
          business_type: loadedSettings.business_type,
          current_branches: loadedSettings.current_branches,
          unlocked_features: extractFeaturesFromSettings(loadedSettings)
        });
        setUnlockedFeatures(extractFeaturesFromSettings(loadedSettings));
      }

    } catch (err) {
      console.error('Error loading activation settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      toast({
        title: "Error",
        description: "Failed to load activation settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Save complete settings (used during activation)
  const saveSettings = useCallback(async (newSettings: DealerActivationSettings): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Get dealer ID
      console.log('🔍 Save settings - Looking for dealer with email:', user.email);
      const { data: dealerResult, error: dealerError } = await db
        .from('dealers')
        .select('id')
        .eq('created_by', user.email)
        .single();

      if (dealerError) {
        console.error('🔍 Save settings - Dealer query error:', dealerError);
        throw new Error(`Dealer lookup failed: ${dealerError.message}`);
      }

      if (!dealerResult) {
        console.warn('🔍 Save settings - No dealer found for email:', user.email);
        throw new Error('No dealer profile found');
      }

      console.log('🔍 Save settings - Found dealer:', dealerResult.id);

      const dealerId = dealerResult.id;
      const settingsToSave = { ...newSettings, dealer_id: dealerId };

      console.log('Saving activation settings to database:', {
        dealerId,
        activation_completed: settingsToSave.activation_completed,
        business_type: settingsToSave.business_type,
        dashboard_type: settingsToSave.dashboard_type
      });

      // Update the dealer record with activation settings
      const { error: updateError } = await db
        .from('dealers')
        .update({
          // Map activation settings to dealer table fields
          activation_completed: settingsToSave.activation_completed,
          activation_date: settingsToSave.activation_date,
          business_type: settingsToSave.business_type,
          current_branches: settingsToSave.current_branches,
          expected_growth: settingsToSave.expected_growth,
          has_sub_branches: settingsToSave.has_sub_branches,
          brand_coverage: settingsToSave.brand_coverage as any,
          advanced_specs_enabled: settingsToSave.advanced_specs_enabled,
          conditional_fields_enabled: settingsToSave.conditional_fields_enabled,
          use_internal_drivers: settingsToSave.use_internal_drivers,
          use_external_carriers: settingsToSave.use_external_carriers,
          preferred_carriers: settingsToSave.preferred_carriers as any,
          checklist_required: settingsToSave.checklist_required,
          photo_verification: settingsToSave.photo_verification,
          intake_checks: settingsToSave.intake_checks,
          pdi_required: settingsToSave.pdi_required,
          checklist_templates: settingsToSave.checklist_templates as any,
          auto_create_inspection_jobs: settingsToSave.auto_create_inspection_jobs,
          bulk_volume_expected: settingsToSave.bulk_volume_expected,
          data_sources: settingsToSave.data_sources,
          automation_level: settingsToSave.automation_level,
          price_bands_enabled: settingsToSave.price_bands_enabled,
          multi_stage_approvals: settingsToSave.multi_stage_approvals,
          auto_approval_limit: settingsToSave.auto_approval_limit,
          dashboard_type: settingsToSave.dashboard_type,
          key_metrics: settingsToSave.key_metrics,
          report_frequency: settingsToSave.report_frequency,
          custom_branding: settingsToSave.custom_branding,
          consistent_theme: settingsToSave.consistent_theme,
          branch_specific_colors: settingsToSave.branch_specific_colors,
          last_activation_update: new Date().toISOString()
        })
        .eq('id', dealerId);

      if (updateError) {
        throw new Error(`Failed to save activation settings: ${updateError.message}`);
      }

      console.log('Activation settings saved successfully to database');

      // Update local state after successful database save
      setSettings(settingsToSave);

      // Extract features from settings
      const features = extractFeaturesFromSettings(settingsToSave);

      setActivationStatus(prev => prev ? {
        ...prev,
        unlocked_features: features
      } : null);
      setUnlockedFeatures(features);

      toast({
        title: "Settings Saved",
        description: "Your Customised Inventory settings have been saved successfully.",
      });

      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadSettings, toast]);

  // Update partial settings (used for ongoing management)
  const updateSettings = useCallback(async (updates: Partial<DealerActivationSettings>): Promise<boolean> => {
    if (!settings || !user) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Get dealer ID
      const { data: dealerResult, error: dealerError } = await db
        .from('dealers')
        .select('id')
        .eq('created_by', user.email)
        .single();

      if (dealerError || !dealerResult) {
        throw new Error('No dealer profile found');
      }

      const dealerId = dealerResult.id;

      // Map updates to database fields
      const updateData: Record<string, any> = {};
      if (updates.activation_completed !== undefined) updateData.activation_completed = updates.activation_completed;
      if (updates.activation_date !== undefined) updateData.activation_date = updates.activation_date;
      if (updates.business_type !== undefined) updateData.business_type = updates.business_type;
      if (updates.current_branches !== undefined) updateData.current_branches = updates.current_branches;
      if (updates.expected_growth !== undefined) updateData.expected_growth = updates.expected_growth;
      if (updates.has_sub_branches !== undefined) updateData.has_sub_branches = updates.has_sub_branches;
      if (updates.brand_coverage !== undefined) updateData.brand_coverage = updates.brand_coverage;
      if (updates.advanced_specs_enabled !== undefined) updateData.advanced_specs_enabled = updates.advanced_specs_enabled;
      if (updates.conditional_fields_enabled !== undefined) updateData.conditional_fields_enabled = updates.conditional_fields_enabled;
      if (updates.use_internal_drivers !== undefined) updateData.use_internal_drivers = updates.use_internal_drivers;
      if (updates.use_external_carriers !== undefined) updateData.use_external_carriers = updates.use_external_carriers;
      if (updates.preferred_carriers !== undefined) updateData.preferred_carriers = updates.preferred_carriers;
      if (updates.checklist_required !== undefined) updateData.checklist_required = updates.checklist_required;
      if (updates.photo_verification !== undefined) updateData.photo_verification = updates.photo_verification;
      if (updates.intake_checks !== undefined) updateData.intake_checks = updates.intake_checks;
      if (updates.pdi_required !== undefined) updateData.pdi_required = updates.pdi_required;
      if (updates.checklist_templates !== undefined) updateData.checklist_templates = updates.checklist_templates;
      if (updates.auto_create_inspection_jobs !== undefined) updateData.auto_create_inspection_jobs = updates.auto_create_inspection_jobs;
      if (updates.bulk_volume_expected !== undefined) updateData.bulk_volume_expected = updates.bulk_volume_expected;
      if (updates.data_sources !== undefined) updateData.data_sources = updates.data_sources;
      if (updates.automation_level !== undefined) updateData.automation_level = updates.automation_level;
      if (updates.price_bands_enabled !== undefined) updateData.price_bands_enabled = updates.price_bands_enabled;
      if (updates.multi_stage_approvals !== undefined) updateData.multi_stage_approvals = updates.multi_stage_approvals;
      if (updates.auto_approval_limit !== undefined) updateData.auto_approval_limit = updates.auto_approval_limit;
      if (updates.dashboard_type !== undefined) updateData.dashboard_type = updates.dashboard_type;
      if (updates.key_metrics !== undefined) updateData.key_metrics = updates.key_metrics;
      if (updates.report_frequency !== undefined) updateData.report_frequency = updates.report_frequency;
      if (updates.custom_branding !== undefined) updateData.custom_branding = updates.custom_branding;
      if (updates.consistent_theme !== undefined) updateData.consistent_theme = updates.consistent_theme;
      if (updates.branch_specific_colors !== undefined) updateData.branch_specific_colors = updates.branch_specific_colors;

      // Add last update timestamp
      updateData.last_activation_update = new Date().toISOString();

      // Update database
      const { error: updateError } = await db
        .from('dealers')
        .update(updateData)
        .eq('id', dealerId);

      if (updateError) {
        throw new Error(`Failed to update activation settings: ${updateError.message}`);
      }

      // Update local state after successful database save
      setSettings(prev => {
        const updatedSettings = prev ? { ...prev, ...updates } : null;
        if (updatedSettings) {
          const features = extractFeaturesFromSettings(updatedSettings);
          setUnlockedFeatures(features);
        }
        return updatedSettings;
      });

      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });

      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings, user, loadSettings, toast]);

  // Refresh all settings data
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Check if a specific feature is unlocked
  const checkFeatureAccess = useCallback((featureId: string): boolean => {
    return unlockedFeatures.some(feature =>
      feature.feature_id === featureId && feature.is_active
    );
  }, [unlockedFeatures]);

  // Get explanation for a feature
  const getFeatureExplanation = useCallback((featureId: string): string => {
    return FEATURE_EXPLANATIONS[featureId] || `Advanced feature: ${featureId}`;
  }, []);

  // Reset settings to defaults (useful for testing or starting over)
  const resetSettings = useCallback(async (): Promise<boolean> => {
    if (!settings || !user) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Reset to default settings
      const defaultSettings = DealerActivationSettings.getDefaultSettings(settings.dealer_id);
      setSettings(defaultSettings);
      setActivationStatus({
        activation_completed: false,
        business_type: defaultSettings.business_type,
        current_branches: defaultSettings.current_branches,
        unlocked_features: []
      });
      setUnlockedFeatures([]);

      toast({
        title: "Settings Reset",
        description: "Your settings have been reset to defaults.",
      });

      return true;
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings, user, toast]);

  // Load settings on mount and when user changes
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // State
    settings,
    activationStatus,
    unlockedFeatures,
    isLoading,
    error,

    // Actions
    saveSettings,
    updateSettings,
    refreshSettings,
    checkFeatureAccess,
    getFeatureExplanation,
    resetSettings
  };
}

// Helper function to extract features from settings
function extractFeaturesFromSettings(settings: DealerActivationSettings): UnlockedFeature[] {
  const features: UnlockedFeature[] = [];
  const dealerId = settings.dealer_id;

  // Extract features based on settings
  if (settings.advanced_specs_enabled) {
    features.push({
      id: 'advanced_specs',
      dealer_id: dealerId,
      feature_id: 'advanced_specs',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.conditional_fields_enabled) {
    features.push({
      id: 'conditional_fields',
      dealer_id: dealerId,
      feature_id: 'conditional_fields',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.use_internal_drivers || settings.use_external_carriers) {
    features.push({
      id: 'logistics',
      dealer_id: dealerId,
      feature_id: 'logistics',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.intake_checks || settings.pdi_required) {
    features.push({
      id: 'inspections',
      dealer_id: dealerId,
      feature_id: 'inspections',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.bulk_volume_expected !== 'small') {
    features.push({
      id: 'bulk_operations',
      dealer_id: dealerId,
      feature_id: 'bulk_operations',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.price_bands_enabled || settings.multi_stage_approvals) {
    features.push({
      id: 'approval_workflows',
      dealer_id: dealerId,
      feature_id: 'approval_workflows',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.brand_coverage.length > 0) {
    features.push({
      id: 'brand_coverage',
      dealer_id: dealerId,
      feature_id: 'brand_coverage',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  if (settings.custom_branding || settings.consistent_theme || settings.branch_specific_colors) {
    features.push({
      id: 'theming',
      dealer_id: dealerId,
      feature_id: 'theming',
      unlocked_at: new Date().toISOString(),
      is_active: true
    });
  }

  // Always include basic features
  features.push(
    {
      id: 'basic_inventory',
      dealer_id: dealerId,
      feature_id: 'basic_inventory',
      unlocked_at: new Date().toISOString(),
      is_active: true
    },
    {
      id: 'branch_management',
      dealer_id: dealerId,
      feature_id: 'branch_management',
      unlocked_at: new Date().toISOString(),
      is_active: true
    }
  );

  return features;
}
