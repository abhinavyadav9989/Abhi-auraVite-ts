-- Phase 1: Advanced Inventory Activation Schema
-- This migration creates tables to store comprehensive activation settings for dynamic inventory

-- =====================================================
-- 1. DEALER ACTIVATION SETTINGS TABLE
-- =====================================================
-- Stores the main activation data for each dealer
CREATE TABLE IF NOT EXISTS dealer_activation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    activation_completed BOOLEAN DEFAULT FALSE,
    activation_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Business Type (from Step 1)
    business_type TEXT CHECK (business_type IN ('used', 'new', 'both')),

    -- Branches & Team (from Step 2)
    current_branches INTEGER DEFAULT 1,
    expected_growth TEXT CHECK (expected_growth IN ('stable', 'growing', 'expanding')),
    has_sub_branches BOOLEAN DEFAULT FALSE,
    branch_types TEXT[] DEFAULT '{}', -- Array of branch types

    -- Brand Coverage (from Step 3 - only for new car dealers)
    brand_coverage JSONB DEFAULT '[]', -- Array of brand objects with exclusive flags

    -- Advanced Specs (from Step 4)
    advanced_specs_enabled BOOLEAN DEFAULT FALSE,
    conditional_fields_enabled BOOLEAN DEFAULT FALSE,

    -- Transfers & Logistics (from Step 5)
    use_internal_drivers BOOLEAN DEFAULT FALSE,
    use_external_carriers BOOLEAN DEFAULT FALSE,
    preferred_carriers TEXT[] DEFAULT '{}',
    checklist_required BOOLEAN DEFAULT FALSE,
    photo_verification BOOLEAN DEFAULT FALSE,

    -- Inspections (from Step 6)
    intake_checks BOOLEAN DEFAULT FALSE,
    pdi_required BOOLEAN DEFAULT FALSE,
    checklist_templates TEXT[] DEFAULT '{}',
    auto_create_inspection_jobs BOOLEAN DEFAULT FALSE,

    -- Bulk Operations (from Step 7)
    bulk_volume_expected TEXT CHECK (bulk_volume_expected IN ('small', 'medium', 'large')),
    data_sources TEXT[] DEFAULT '{}',
    automation_level TEXT CHECK (automation_level IN ('manual', 'semi', 'full')),

    -- Approvals (from Step 8)
    price_bands_enabled BOOLEAN DEFAULT FALSE,
    multi_stage_approvals BOOLEAN DEFAULT FALSE,
    auto_approval_limit INTEGER,

    -- Analytics (from Step 9)
    dashboard_type TEXT CHECK (dashboard_type IN ('basic', 'advanced', 'custom')),
    key_metrics TEXT[] DEFAULT '{}',
    report_frequency TEXT CHECK (report_frequency IN ('daily', 'weekly', 'monthly')),

    -- Theming (from Step 10)
    custom_branding BOOLEAN DEFAULT FALSE,
    consistent_theme BOOLEAN DEFAULT FALSE,
    branch_specific_colors BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(dealer_id)
);

-- =====================================================
-- 2. ACTIVATION FEATURES UNLOCKED TABLE
-- =====================================================
-- Tracks which features are unlocked based on activation settings
CREATE TABLE IF NOT EXISTS dealer_unlocked_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL, -- e.g., 'unlimited_branches', 'brand_coverage', etc.
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unlocked_by_step INTEGER, -- Which activation step unlocked this feature
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(dealer_id, feature_id)
);

-- =====================================================
-- 3. DEALER BRANCH TYPES TABLE
-- =====================================================
-- Stores branch type configurations for each dealer
CREATE TABLE IF NOT EXISTS dealer_branch_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    branch_type TEXT NOT NULL, -- 'showroom', 'workshop', 'warehouse', 'kiosk'
    is_enabled BOOLEAN DEFAULT TRUE,
    display_name TEXT,
    description TEXT,
    icon_name TEXT, -- For UI rendering
    sort_order INTEGER DEFAULT 0,

    UNIQUE(dealer_id, branch_type)
);

-- =====================================================
-- 4. DEALER BRAND CONFIGURATIONS TABLE
-- =====================================================
-- Stores brand-specific configurations for new car dealers
CREATE TABLE IF NOT EXISTS dealer_brand_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    is_exclusive BOOLEAN DEFAULT FALSE,
    assigned_branches UUID[] DEFAULT '{}', -- Array of branch IDs
    brand_logo_url TEXT,
    brand_color TEXT, -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(dealer_id, brand_name)
);

-- =====================================================
-- 5. DEALER LOGISTICS PARTNERS TABLE
-- =====================================================
-- Stores configured logistics partners for each dealer
CREATE TABLE IF NOT EXISTS dealer_logistics_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    partner_type TEXT CHECK (partner_type IN ('driver', 'carrier')),
    contact_info JSONB, -- Phone, email, etc.
    is_active BOOLEAN DEFAULT TRUE,
    contract_details JSONB, -- Pricing, SLA, etc.

    UNIQUE(dealer_id, partner_name)
);

-- =====================================================
-- 6. DEALER INSPECTION TEMPLATES TABLE
-- =====================================================
-- Stores custom inspection templates for each dealer
CREATE TABLE IF NOT EXISTS dealer_inspection_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('intake', 'pdi', 'maintenance', 'damage')),
    checklist_items JSONB DEFAULT '[]', -- Array of checklist items
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(dealer_id, template_name)
);

-- =====================================================
-- 7. DEALER APPROVAL WORKFLOWS TABLE
-- =====================================================
-- Stores approval workflow configurations
CREATE TABLE IF NOT EXISTS dealer_approval_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    trigger_condition TEXT, -- e.g., 'price_change', 'new_vehicle'
    approval_levels JSONB DEFAULT '[]', -- Array of approval levels with roles/users
    auto_approval_limit INTEGER,
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(dealer_id, workflow_name)
);

-- =====================================================
-- 8. DEALER ANALYTICS CONFIGURATIONS TABLE
-- =====================================================
-- Stores analytics dashboard and report configurations
CREATE TABLE IF NOT EXISTS dealer_analytics_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    dashboard_layout JSONB, -- Layout configuration for dashboard
    custom_reports JSONB DEFAULT '[]', -- Custom report definitions
    scheduled_reports JSONB DEFAULT '[]', -- Scheduled report configurations
    alert_configurations JSONB DEFAULT '{}', -- Alert settings
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(dealer_id)
);

-- =====================================================
-- 9. DEALER THEMING CONFIGURATIONS TABLE
-- =====================================================
-- Stores theming and branding configurations
CREATE TABLE IF NOT EXISTS dealer_theming_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    primary_color TEXT,
    secondary_color TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    custom_css TEXT,
    branch_specific_theming JSONB DEFAULT '{}', -- Per-branch theming overrides
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(dealer_id)
);

-- =====================================================
-- 10. ACTIVATION AUDIT LOG TABLE
-- =====================================================
-- Tracks all changes to activation settings for audit purposes
CREATE TABLE IF NOT EXISTS dealer_activation_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'create', 'update', 'feature_unlock', 'feature_lock'
    action_details JSONB, -- What changed
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dealer_activation_settings_dealer_id ON dealer_activation_settings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_unlocked_features_dealer_id ON dealer_unlocked_features(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_unlocked_features_feature_id ON dealer_unlocked_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_dealer_branch_types_dealer_id ON dealer_branch_types(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_brand_configurations_dealer_id ON dealer_brand_configurations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_logistics_partners_dealer_id ON dealer_logistics_partners(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_inspection_templates_dealer_id ON dealer_inspection_templates(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_approval_workflows_dealer_id ON dealer_approval_workflows(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_analytics_configurations_dealer_id ON dealer_analytics_configurations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_theming_configurations_dealer_id ON dealer_theming_configurations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_activation_audit_log_dealer_id ON dealer_activation_audit_log(dealer_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================
ALTER TABLE dealer_activation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_unlocked_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_branch_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_brand_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_logistics_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_analytics_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_theming_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_activation_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for dealer_activation_settings
CREATE POLICY "Dealers can view their own activation settings" ON dealer_activation_settings
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM dealers WHERE id = dealer_activation_settings.dealer_id
    ));

CREATE POLICY "Dealers can insert their own activation settings" ON dealer_activation_settings
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM dealers WHERE id = dealer_activation_settings.dealer_id
    ));

CREATE POLICY "Dealers can update their own activation settings" ON dealer_activation_settings
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM dealers WHERE id = dealer_activation_settings.dealer_id
    ));

-- Apply similar policies to all other tables (simplified for brevity)
-- In production, create specific policies for each table based on business requirements

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dealer_activation_settings_updated_at
    BEFORE UPDATE ON dealer_activation_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================
-- Insert default branch types for all dealers
INSERT INTO dealer_branch_types (dealer_id, branch_type, display_name, description, icon_name, sort_order)
SELECT
    d.id as dealer_id,
    bt.branch_type,
    bt.display_name,
    bt.description,
    bt.icon_name,
    bt.sort_order
FROM dealers d
CROSS JOIN (
    VALUES
        ('showroom', 'Showroom', 'Customer-facing sales location', 'Store', 1),
        ('workshop', 'Workshop', 'Service and repair facility', 'Wrench', 2),
        ('warehouse', 'Warehouse', 'Storage and inventory facility', 'Warehouse', 3),
        ('kiosk', 'Kiosk', 'Small sales or service point', 'MapPin', 4)
) AS bt(branch_type, display_name, description, icon_name, sort_order)
ON CONFLICT (dealer_id, branch_type) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
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
        'activation_completed', COALESCE(das.activation_completed, FALSE),
        'business_type', das.business_type,
        'current_branches', COALESCE(das.current_branches, 1),
        'unlocked_features', (
            SELECT json_agg(json_build_object(
                'feature_id', duf.feature_id,
                'unlocked_at', duf.unlocked_at,
                'unlocked_by_step', duf.unlocked_by_step
            ))
            FROM dealer_unlocked_features duf
            WHERE duf.dealer_id = dealer_uuid AND duf.is_active = TRUE
        )
    ) INTO result
    FROM dealer_activation_settings das
    WHERE das.dealer_id = dealer_uuid;

    RETURN COALESCE(result, json_build_object(
        'activation_completed', FALSE,
        'business_type', NULL,
        'current_branches', 1,
        'unlocked_features', '[]'::json
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to track migration
COMMENT ON TABLE dealer_activation_settings IS 'Phase 1: Stores comprehensive activation settings for dynamic Advanced Inventory system';
COMMENT ON TABLE dealer_unlocked_features IS 'Phase 1: Tracks which features are unlocked for each dealer';
COMMENT ON TABLE dealer_branch_types IS 'Phase 1: Stores branch type configurations per dealer';
COMMENT ON TABLE dealer_brand_configurations IS 'Phase 1: Stores brand-specific configurations for new car dealers';
COMMENT ON TABLE dealer_logistics_partners IS 'Phase 1: Stores configured logistics partners';
COMMENT ON TABLE dealer_inspection_templates IS 'Phase 1: Stores custom inspection templates';
COMMENT ON TABLE dealer_approval_workflows IS 'Phase 1: Stores approval workflow configurations';
COMMENT ON TABLE dealer_analytics_configurations IS 'Phase 1: Stores analytics dashboard configurations';
COMMENT ON TABLE dealer_theming_configurations IS 'Phase 1: Stores theming and branding configurations';
COMMENT ON TABLE dealer_activation_audit_log IS 'Phase 1: Audit log for all activation setting changes';
