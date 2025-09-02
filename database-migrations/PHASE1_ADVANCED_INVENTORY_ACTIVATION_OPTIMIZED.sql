-- Phase 1: Advanced Inventory Activation - Optimized Schema
-- This migration extends existing tables instead of creating new ones for efficiency

-- =====================================================
-- 1. EXTEND DEALERS TABLE WITH ACTIVATION SETTINGS
-- =====================================================
-- Add activation-related columns to existing dealers table

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS activation_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS activation_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS last_activation_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Business configuration (extends existing business_type)
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS expected_growth TEXT CHECK (expected_growth IN ('stable', 'growing', 'expanding'));
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS has_sub_branches BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS current_branches INTEGER DEFAULT 1;

-- Advanced features configuration
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS advanced_specs_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS conditional_fields_enabled BOOLEAN DEFAULT FALSE;

-- Transfers & Logistics
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS use_internal_drivers BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS use_external_carriers BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS preferred_carriers TEXT[] DEFAULT '{}';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS checklist_required BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS photo_verification BOOLEAN DEFAULT FALSE;

-- Inspections & Quality
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS intake_checks BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS pdi_required BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS checklist_templates TEXT[] DEFAULT '{}';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS auto_create_inspection_jobs BOOLEAN DEFAULT FALSE;

-- Bulk Operations
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS bulk_volume_expected TEXT CHECK (bulk_volume_expected IN ('small', 'medium', 'large'));
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS data_sources TEXT[] DEFAULT '{}';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS automation_level TEXT CHECK (automation_level IN ('manual', 'semi', 'full'));

-- Approvals & Price Bands
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS price_bands_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS multi_stage_approvals BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS auto_approval_limit INTEGER;

-- Analytics & Reporting
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS dashboard_type TEXT CHECK (dashboard_type IN ('basic', 'advanced', 'custom'));
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS key_metrics TEXT[] DEFAULT '{}';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS report_frequency TEXT CHECK (report_frequency IN ('daily', 'weekly', 'monthly'));

-- Theming & Branding
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS custom_branding BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS consistent_theme BOOLEAN DEFAULT FALSE;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS branch_specific_colors BOOLEAN DEFAULT FALSE;

-- Complex data stored as JSONB
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS brand_coverage JSONB DEFAULT '[]';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS activation_audit_log JSONB DEFAULT '[]';

-- =====================================================
-- 2. EXTEND BRANCHES TABLE
-- =====================================================
-- Add activation-related columns to existing branches table

ALTER TABLE branches ADD COLUMN IF NOT EXISTS branch_type TEXT CHECK (branch_type IN ('showroom', 'workshop', 'warehouse', 'kiosk', 'outlet'));
ALTER TABLE branches ADD COLUMN IF NOT EXISTS parent_branch_id UUID REFERENCES branches(id);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 0;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS vehicle_count INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_branches_dealer_type ON branches(dealer_id, branch_type);
CREATE INDEX IF NOT EXISTS idx_branches_parent ON branches(parent_branch_id);

-- =====================================================
-- 3. CREATE MINIMAL ADDITIONAL TABLES (only if needed)
-- =====================================================

-- Feature unlock tracking (separate table for performance)
CREATE TABLE IF NOT EXISTS dealer_unlocked_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unlocked_by_step INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(dealer_id, feature_id)
);

-- Audit log for activation changes
CREATE TABLE IF NOT EXISTS dealer_activation_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_details JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dealer_unlocked_features_dealer ON dealer_unlocked_features(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_unlocked_features_feature ON dealer_unlocked_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_dealer_activation_audit_dealer ON dealer_activation_audit(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealers_activation_status ON dealers(activation_completed, business_type);

-- =====================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE dealer_unlocked_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_activation_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealer_unlocked_features
CREATE POLICY "Dealers can view their own unlocked features" ON dealer_unlocked_features
    FOR SELECT USING (auth.uid() IN (
        SELECT owner_user_id FROM dealers WHERE id = dealer_unlocked_features.dealer_id
    ));

CREATE POLICY "Dealers can insert their own unlocked features" ON dealer_unlocked_features
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT owner_user_id FROM dealers WHERE id = dealer_unlocked_features.dealer_id
    ));

-- RLS Policies for dealer_activation_audit
CREATE POLICY "Dealers can view their own activation audit" ON dealer_activation_audit
    FOR SELECT USING (auth.uid() IN (
        SELECT owner_user_id FROM dealers WHERE id = dealer_activation_audit.dealer_id
    ));

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to check if a dealer has a specific feature unlocked
CREATE OR REPLACE FUNCTION dealer_has_feature_unlocked(dealer_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM dealer_unlocked_features
        WHERE dealer_id = dealer_uuid
        AND feature_id = feature_name
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock a feature for a dealer
CREATE OR REPLACE FUNCTION unlock_dealer_feature(dealer_uuid UUID, feature_name TEXT, unlocked_by_step INTEGER DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO dealer_unlocked_features (dealer_id, feature_id, unlocked_by_step)
    VALUES (dealer_uuid, feature_name, unlocked_by_step)
    ON CONFLICT (dealer_id, feature_id) DO UPDATE SET
        unlocked_at = NOW(),
        unlocked_by_step = COALESCE(unlocked_by_step, dealer_unlocked_features.unlocked_by_step),
        is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dealer's activation status
CREATE OR REPLACE FUNCTION get_dealer_activation_status(dealer_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'activation_completed', COALESCE(d.activation_completed, FALSE),
        'business_type', d.business_type,
        'current_branches', COALESCE(d.current_branches, 1),
        'unlocked_features_count', (
            SELECT COUNT(*) FROM dealer_unlocked_features
            WHERE dealer_id = dealer_uuid AND is_active = TRUE
        ),
        'unlocked_features', COALESCE((
            SELECT json_agg(json_build_object(
                'feature_id', duf.feature_id,
                'unlocked_at', duf.unlocked_at,
                'unlocked_by_step', duf.unlocked_by_step
            ))
            FROM dealer_unlocked_features duf
            WHERE duf.dealer_id = dealer_uuid AND duf.is_active = TRUE
        ), '[]'::json)
    ) INTO result
    FROM dealers d
    WHERE d.id = dealer_uuid;

    RETURN COALESCE(result, json_build_object(
        'activation_completed', FALSE,
        'business_type', NULL,
        'current_branches', 1,
        'unlocked_features_count', 0,
        'unlocked_features', '[]'::json
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update dealer activation settings
CREATE OR REPLACE FUNCTION update_dealer_activation_settings(
    dealer_uuid UUID,
    settings_data JSONB,
    changed_by_uuid UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    old_data JSONB;
    changes_made JSONB := '{}';
BEGIN
    -- Get current data for audit
    SELECT json_build_object(
        'business_type', business_type,
        'expected_growth', expected_growth,
        'current_branches', current_branches,
        'advanced_specs_enabled', advanced_specs_enabled,
        'use_internal_drivers', use_internal_drivers,
        'intake_checks', intake_checks,
        'bulk_volume_expected', bulk_volume_expected,
        'price_bands_enabled', price_bands_enabled,
        'dashboard_type', dashboard_type,
        'custom_branding', custom_branding
    ) INTO old_data
    FROM dealers WHERE id = dealer_uuid;

    -- Update dealer record with new settings
    UPDATE dealers SET
        activation_completed = COALESCE(settings_data->>'activation_completed', activation_completed)::boolean,
        activation_date = CASE
            WHEN settings_data->>'activation_date' IS NOT NULL
            THEN (settings_data->>'activation_date')::timestamp with time zone
            ELSE activation_date
        END,
        last_activation_update = NOW(),
        business_type = COALESCE(settings_data->>'business_type', business_type),
        expected_growth = COALESCE(settings_data->>'expected_growth', expected_growth),
        current_branches = COALESCE((settings_data->>'current_branches')::integer, current_branches),
        has_sub_branches = COALESCE((settings_data->>'has_sub_branches')::boolean, has_sub_branches),
        advanced_specs_enabled = COALESCE((settings_data->>'advanced_specs_enabled')::boolean, advanced_specs_enabled),
        conditional_fields_enabled = COALESCE((settings_data->>'conditional_fields_enabled')::boolean, conditional_fields_enabled),
        use_internal_drivers = COALESCE((settings_data->>'use_internal_drivers')::boolean, use_internal_drivers),
        use_external_carriers = COALESCE((settings_data->>'use_external_carriers')::boolean, use_external_carriers),
        preferred_carriers = COALESCE((settings_data->>'preferred_carriers')::text[], preferred_carriers),
        checklist_required = COALESCE((settings_data->>'checklist_required')::boolean, checklist_required),
        photo_verification = COALESCE((settings_data->>'photo_verification')::boolean, photo_verification),
        intake_checks = COALESCE((settings_data->>'intake_checks')::boolean, intake_checks),
        pdi_required = COALESCE((settings_data->>'pdi_required')::boolean, pdi_required),
        checklist_templates = COALESCE((settings_data->>'checklist_templates')::text[], checklist_templates),
        auto_create_inspection_jobs = COALESCE((settings_data->>'auto_create_inspection_jobs')::boolean, auto_create_inspection_jobs),
        bulk_volume_expected = COALESCE(settings_data->>'bulk_volume_expected', bulk_volume_expected),
        data_sources = COALESCE((settings_data->>'data_sources')::text[], data_sources),
        automation_level = COALESCE(settings_data->>'automation_level', automation_level),
        price_bands_enabled = COALESCE((settings_data->>'price_bands_enabled')::boolean, price_bands_enabled),
        multi_stage_approvals = COALESCE((settings_data->>'multi_stage_approvals')::boolean, multi_stage_approvals),
        auto_approval_limit = COALESCE((settings_data->>'auto_approval_limit')::integer, auto_approval_limit),
        dashboard_type = COALESCE(settings_data->>'dashboard_type', dashboard_type),
        key_metrics = COALESCE((settings_data->>'key_metrics')::text[], key_metrics),
        report_frequency = COALESCE(settings_data->>'report_frequency', report_frequency),
        custom_branding = COALESCE((settings_data->>'custom_branding')::boolean, custom_branding),
        consistent_theme = COALESCE((settings_data->>'consistent_theme')::boolean, consistent_theme),
        branch_specific_colors = COALESCE((settings_data->>'branch_specific_colors')::boolean, branch_specific_colors),
        brand_coverage = COALESCE(settings_data->'brand_coverage', brand_coverage),
        updated_at = NOW()
    WHERE id = dealer_uuid;

    -- Record changes in audit log
    INSERT INTO dealer_activation_audit (dealer_id, action_type, action_details, changed_by)
    VALUES (dealer_uuid, 'settings_update', json_build_object('old_data', old_data, 'new_data', settings_data), changed_by_uuid);

    -- Auto-unlock features based on settings
    IF settings_data->>'business_type' IS NOT NULL THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'unlimited_branches', 1);
        PERFORM unlock_dealer_feature(dealer_uuid, 'branch_hierarchy', 1);
    END IF;

    IF (settings_data->>'business_type')::text IN ('new', 'both') THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'brand_coverage', 3);
    END IF;

    IF (settings_data->>'advanced_specs_enabled')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'attribute_sets', 4);
        PERFORM unlock_dealer_feature(dealer_uuid, 'vin_mapping', 4);
    END IF;

    IF (settings_data->>'use_internal_drivers')::boolean = true OR (settings_data->>'use_external_carriers')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'driver_assignment', 5);
    END IF;

    IF (settings_data->>'photo_verification')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'photo_verification', 5);
    END IF;

    IF (settings_data->>'intake_checks')::boolean = true OR (settings_data->>'pdi_required')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'inspections', 6);
    END IF;

    IF (settings_data->>'bulk_volume_expected')::text IN ('medium', 'large') THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'bulk_operations', 7);
        PERFORM unlock_dealer_feature(dealer_uuid, 'data_ops', 7);
    END IF;

    IF (settings_data->>'price_bands_enabled')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'approvals', 8);
        PERFORM unlock_dealer_feature(dealer_uuid, 'price_bands', 8);
    END IF;

    IF (settings_data->>'dashboard_type')::text IN ('advanced', 'custom') THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'analytics', 9);
        PERFORM unlock_dealer_feature(dealer_uuid, 'scheduled_reports', 9);
    END IF;

    IF (settings_data->>'custom_branding')::boolean = true THEN
        PERFORM unlock_dealer_feature(dealer_uuid, 'branch_theming', 10);
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. UPDATE EXISTING DEALERS WITH DEFAULT VALUES
-- =====================================================
-- Set default values for existing dealers
UPDATE dealers SET
    activation_completed = COALESCE(activation_completed, FALSE),
    current_branches = COALESCE(current_branches, 1),
    advanced_specs_enabled = COALESCE(advanced_specs_enabled, FALSE),
    conditional_fields_enabled = COALESCE(conditional_fields_enabled, FALSE),
    use_internal_drivers = COALESCE(use_internal_drivers, FALSE),
    use_external_carriers = COALESCE(use_external_carriers, FALSE),
    checklist_required = COALESCE(checklist_required, FALSE),
    photo_verification = COALESCE(photo_verification, FALSE),
    intake_checks = COALESCE(intake_checks, FALSE),
    pdi_required = COALESCE(pdi_required, FALSE),
    auto_create_inspection_jobs = COALESCE(auto_create_inspection_jobs, FALSE),
    price_bands_enabled = COALESCE(price_bands_enabled, FALSE),
    multi_stage_approvals = COALESCE(multi_stage_approvals, FALSE),
    custom_branding = COALESCE(custom_branding, FALSE),
    consistent_theme = COALESCE(consistent_theme, FALSE),
    branch_specific_colors = COALESCE(branch_specific_colors, FALSE)
WHERE activation_completed IS NULL;

-- =====================================================
-- 8. MIGRATION COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE dealer_unlocked_features IS 'Phase 1: Tracks which advanced features are unlocked for each dealer';
COMMENT ON TABLE dealer_activation_audit IS 'Phase 1: Audit log for all dealer activation setting changes';
COMMENT ON FUNCTION dealer_has_feature_unlocked(UUID, TEXT) IS 'Phase 1: Check if dealer has specific feature unlocked';
COMMENT ON FUNCTION unlock_dealer_feature(UUID, TEXT, INTEGER) IS 'Phase 1: Unlock a feature for a dealer';
COMMENT ON FUNCTION get_dealer_activation_status(UUID) IS 'Phase 1: Get comprehensive activation status for dealer';
COMMENT ON FUNCTION update_dealer_activation_settings(UUID, JSONB, UUID) IS 'Phase 1: Update dealer activation settings with audit trail';
