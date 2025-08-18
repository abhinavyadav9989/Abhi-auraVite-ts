-- Phase 1: Database Schema Updates for Comprehensive Onboarding System
-- This script adds new tables and columns without modifying existing functionality

-- 1. Create new user types and access levels (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM (
      'group_dealer', 'individual_org', 'franchise', 'wholesale_trader',
      'consignment_seller', 'fleet_corporate', 'nbfc_bank', 'govt_psu',
      'rental_leasing', 'agri_construction', '2w_3w_network', 'dsa_broker',
      'chauffeur_driver', 'self_user', 'partner'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_level AS ENUM ('L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhanced dealers table (additive only - no existing data affected)
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS user_type user_type;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS access_level access_level DEFAULT 'L1';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS business_mode JSONB;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_status_new VARCHAR(20) DEFAULT 'pending';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS plan_selection JSONB;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS consent_receipt JSONB;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER DEFAULT 1;

-- 3. New branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  contact_number VARCHAR(20),
  working_hours JSONB,
  manager_id UUID,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. New team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  branch_scope UUID[],
  status VARCHAR(20) DEFAULT 'pending',
  invited_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. New bank details table
CREATE TABLE IF NOT EXISTS bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  account_holder_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(255),
  cancelled_cheque_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. New audit log table for onboarding
CREATE TABLE IF NOT EXISTS onboarding_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  step VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealers_user_type ON dealers(user_type);
CREATE INDEX IF NOT EXISTS idx_dealers_access_level ON dealers(access_level);
CREATE INDEX IF NOT EXISTS idx_dealers_verification_status_new ON dealers(verification_status_new);
CREATE INDEX IF NOT EXISTS idx_branches_dealer_id ON branches(dealer_id);
CREATE INDEX IF NOT EXISTS idx_team_members_dealer_id ON team_members(dealer_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_dealer_id ON bank_details(dealer_id);

       -- 8. Data migration for existing dealers
       UPDATE dealers
       SET
         user_type = 'individual_org'::user_type,
         access_level = CASE
           WHEN verification_status = 'verified' THEN 'L3'::access_level
           ELSE 'L1'::access_level
         END,
         onboarding_progress = '{"account": true, "organization": true}',
         onboarding_completed = CASE
           WHEN verification_status = 'verified' THEN true
           ELSE false
         END,
         verification_status_new = verification_status
       WHERE user_type IS NULL;

-- 9. Create RLS policies for new tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_audit_log ENABLE ROW LEVEL SECURITY;

-- Branches policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own branches" ON branches
      FOR SELECT USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own branches" ON branches
      FOR INSERT WITH CHECK (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own branches" ON branches
      FOR UPDATE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own branches" ON branches
      FOR DELETE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Team members policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own team members" ON team_members
      FOR SELECT USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own team members" ON team_members
      FOR INSERT WITH CHECK (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own team members" ON team_members
      FOR UPDATE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own team members" ON team_members
      FOR DELETE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Bank details policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own bank details" ON bank_details
      FOR SELECT USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own bank details" ON bank_details
      FOR INSERT WITH CHECK (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own bank details" ON bank_details
      FOR UPDATE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own bank details" ON bank_details
      FOR DELETE USING (dealer_id IN (
        SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email'
      ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin policies for all tables
DO $$ BEGIN
    CREATE POLICY "Admins can view all onboarding data" ON branches
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM dealers 
          WHERE created_by = auth.jwt() ->> 'email' 
          AND access_level IN ('L6', 'L7')
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all team members" ON team_members
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM dealers 
          WHERE created_by = auth.jwt() ->> 'email' 
          AND access_level IN ('L6', 'L7')
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all bank details" ON bank_details
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM dealers 
          WHERE created_by = auth.jwt() ->> 'email' 
          AND access_level IN ('L6', 'L7')
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Audit log policies (admin only)
DO $$ BEGIN
    CREATE POLICY "Admins can view audit logs" ON onboarding_audit_log
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM dealers 
          WHERE created_by = auth.jwt() ->> 'email' 
          AND access_level IN ('L6', 'L7')
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can insert audit logs" ON onboarding_audit_log
      FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Create functions for common operations
CREATE OR REPLACE FUNCTION log_onboarding_action(
  p_dealer_id UUID,
  p_action TEXT,
  p_step TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO onboarding_audit_log (
    dealer_id, action, step, old_values, new_values, 
    ip_address, user_agent
  ) VALUES (
    p_dealer_id, p_action, p_step, p_old_values, p_new_values,
    inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress(
  p_dealer_id UUID,
  p_step TEXT,
  p_data JSONB,
  p_current_step INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE dealers 
  SET 
    onboarding_progress = onboarding_progress || jsonb_build_object(p_step, p_data),
    current_onboarding_step = COALESCE(p_current_step, current_onboarding_step),
    onboarding_started_at = COALESCE(onboarding_started_at, NOW()),
    updated_at = NOW()
  WHERE id = p_dealer_id;
  
  -- Log the action
  PERFORM log_onboarding_action(p_dealer_id, 'progress_update', p_step, NULL, p_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to complete onboarding
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_dealer_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE dealers 
  SET 
    onboarding_completed = true,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_dealer_id;
  
  -- Log the action
  PERFORM log_onboarding_action(p_dealer_id, 'onboarding_completed', 'final', NULL, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to verify dealer
CREATE OR REPLACE FUNCTION verify_dealer(
  p_dealer_id UUID,
  p_verified_by TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE dealers 
  SET 
    verification_status_new = 'verified',
    access_level = 'L3'::access_level,
    updated_at = NOW()
  WHERE id = p_dealer_id;
  
  -- Log the action
  PERFORM log_onboarding_action(p_dealer_id, 'dealer_verified', 'admin_verification', NULL, 
    jsonb_build_object('verified_by', p_verified_by, 'new_access_level', 'L3'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to reject dealer
CREATE OR REPLACE FUNCTION reject_dealer(
  p_dealer_id UUID,
  p_rejected_by TEXT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE dealers 
  SET 
    verification_status_new = 'rejected',
    updated_at = NOW()
  WHERE id = p_dealer_id;
  
  -- Log the action
  PERFORM log_onboarding_action(p_dealer_id, 'dealer_rejected', 'admin_verification', NULL, 
    jsonb_build_object('rejected_by', p_rejected_by, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Phase 1 Database Schema Updated Successfully!' as status;
