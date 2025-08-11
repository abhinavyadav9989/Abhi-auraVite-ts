-- Safe Migration Script - Only Adds Missing Features
-- Run as a single migration on your Supabase Postgres

-- =============================================================================
-- Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- (If you prefer uuid_generate_v4() instead of gen_random_uuid():)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Ownership column required by policies
-- =============================================================================
ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Optional backfills (best-effort; safe if columns don't exist)
DO $$ BEGIN
  UPDATE dealers d
     SET created_by = u.email
    FROM auth.users u
   WHERE d.created_by IS NULL
     AND d.owner_user_id = u.id;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  UPDATE dealers
     SET created_by = email
   WHERE created_by IS NULL
     AND email IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- Helpful index for policy predicates
CREATE INDEX IF NOT EXISTS idx_dealers_created_by ON dealers(created_by);

-- =============================================================================
-- Custom types/enums
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('active', 'sold', 'pending', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE txn_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('bank_transfer', 'card', 'cash', 'upi');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Consistent enums for new tables
DO $$ BEGIN
  CREATE TYPE logistics_status AS ENUM ('pending','assigned','in_transit','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rto_status AS ENUM ('pending','submitted','approved','rejected','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new','in_progress','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inspection_status AS ENUM ('pending','scheduled','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- Add missing columns to existing tables
-- =============================================================================
DO $$ BEGIN
  ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status vehicle_status DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status txn_status DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS status payment_status DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method payment_method;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Payment method constraints/defaults
ALTER TABLE payments
  ALTER COLUMN payment_method SET DEFAULT 'upi',
  ALTER COLUMN payment_method SET NOT NULL;

-- =============================================================================
-- Create NEW tables (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS logistics_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  pickup_address TEXT,
  delivery_address TEXT,
  status logistics_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rto_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  vehicle_number TEXT,
  owner_name TEXT,
  status rto_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  account_number TEXT,
  ifsc_code TEXT,
  bank_name TEXT,
  account_holder_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT true,
  auto_publish BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT dealer_preferences_dealer_unique UNIQUE (dealer_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT team_members_unique UNIQUE (dealer_id, user_id)
);

CREATE TABLE IF NOT EXISTS dealer_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status document_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  inquirer_name TEXT,
  inquirer_email TEXT,
  inquirer_phone TEXT,
  message TEXT,
  status inquiry_status DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shortlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inspection_date DATE,
  report_url TEXT,
  status inspection_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assets_vehicle_id ON vehicle_assets(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- Enable RLS
-- =============================================================================
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rto_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Drop conflicting policies (safe if absent)
-- =============================================================================
DROP POLICY IF EXISTS "Dealers can view own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can update own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can insert own data" ON dealers;

DROP POLICY IF EXISTS "Dealers can manage own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public can view active vehicles" ON vehicles;
DROP POLICY IF EXISTS "Dealers can manage own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Public can view vehicle assets" ON vehicle_assets;

DROP POLICY IF EXISTS "Dealers can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Dealers can view own payments" ON payments;

DROP POLICY IF EXISTS "Dealers can manage own logistics orders" ON logistics_orders;
DROP POLICY IF EXISTS "Dealers can manage own rto applications" ON rto_applications;
DROP POLICY IF EXISTS "Dealers can manage own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Dealers can manage own preferences" ON dealer_preferences;
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Dealers can manage own team members" ON team_members;
DROP POLICY IF EXISTS "Dealers can manage own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can manage own hours" ON dealer_hours;
DROP POLICY IF EXISTS "Public can view dealer reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Dealers can manage own reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Dealers can manage own inquiries" ON dealer_inquiries;
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can manage own shortlists" ON shortlists;
DROP POLICY IF EXISTS "Dealers can manage own vehicle inspections" ON vehicle_inspections;
DROP POLICY IF EXISTS "Admin can manage app configs" ON app_configs;

-- Storage
DROP POLICY IF EXISTS "Public can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- =============================================================================
-- RLS policies (all write policies include WITH CHECK)
-- =============================================================================
-- Dealers (email-based ownership)
CREATE POLICY "Dealers can view own data" ON dealers
  FOR SELECT USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can update own data" ON dealers
  FOR UPDATE USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can insert own data" ON dealers
  FOR INSERT WITH CHECK (created_by = auth.jwt() ->> 'email');

-- Vehicles
CREATE POLICY "Dealers can manage own vehicles" ON vehicles
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

CREATE POLICY "Public can view active vehicles" ON vehicles
  FOR SELECT USING (status = 'active');

-- Vehicle assets
CREATE POLICY "Dealers can manage own vehicle assets" ON vehicle_assets
  FOR ALL
  USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      JOIN dealers d ON v.dealer_id = d.id
      WHERE d.created_by = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      JOIN dealers d ON v.dealer_id = d.id
      WHERE d.created_by = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Public can view vehicle assets" ON vehicle_assets
  FOR SELECT USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE status = 'active')
  );

-- Transactions (read-only)
CREATE POLICY "Dealers can view own transactions" ON transactions
  FOR SELECT USING (
    buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email') OR
    seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Payments (read-only)
CREATE POLICY "Dealers can view own payments" ON payments
  FOR SELECT USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      WHERE t.buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
         OR t.seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
    )
  );

-- Logistics orders
CREATE POLICY "Dealers can manage own logistics orders" ON logistics_orders
  FOR ALL
  USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      WHERE t.buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
         OR t.seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT t.id FROM transactions t
      WHERE t.buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
         OR t.seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
    )
  );

-- RTO applications
CREATE POLICY "Dealers can manage own rto applications" ON rto_applications
  FOR ALL
  USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      WHERE t.buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
         OR t.seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT t.id FROM transactions t
      WHERE t.buyer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
         OR t.seller_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
    )
  );

-- Bank accounts
CREATE POLICY "Dealers can manage own bank accounts" ON bank_accounts
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Dealer preferences
CREATE POLICY "Dealers can manage own preferences" ON dealer_preferences
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- User sessions (per-user)
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Team members
CREATE POLICY "Dealers can manage own team members" ON team_members
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Dealer documents
CREATE POLICY "Dealers can manage own documents" ON dealer_documents
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Dealer hours
CREATE POLICY "Dealers can manage own hours" ON dealer_hours
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Dealer reviews
CREATE POLICY "Public can view dealer reviews" ON dealer_reviews
  FOR SELECT USING (true);

CREATE POLICY "Dealers can manage own reviews" ON dealer_reviews
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Dealer inquiries
CREATE POLICY "Dealers can manage own inquiries" ON dealer_inquiries
  FOR ALL
  USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Audit logs (admin)
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Shortlists
CREATE POLICY "Users can manage own shortlists" ON shortlists
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Vehicle inspections
CREATE POLICY "Dealers can manage own vehicle inspections" ON vehicle_inspections
  FOR ALL
  USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      JOIN dealers d ON v.dealer_id = d.id
      WHERE d.created_by = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM vehicles v
      JOIN dealers d ON v.dealer_id = d.id
      WHERE d.created_by = auth.jwt() ->> 'email'
    )
  );

-- App configs (admin)
CREATE POLICY "Admin can manage app configs" ON app_configs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- Storage bucket + policies
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Assumes keys like: {user_id}/{filename}
CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- Seed app configs (proper JSONB values)
-- =============================================================================
INSERT INTO app_configs (key, value, description) VALUES
('email_verification_required', to_jsonb(true), 'Whether email verification is required for new users'),
('max_vehicles_per_dealer', to_jsonb(100), 'Maximum number of vehicles a dealer can list'),
('auto_approve_dealers', to_jsonb(false), 'Whether new dealers are automatically approved')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- updated_at trigger function
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Triggers (drop then create) - NOTE: no trigger on audit_logs
-- =============================================================================
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_logistics_orders_updated_at ON logistics_orders;
DROP TRIGGER IF EXISTS update_rto_applications_updated_at ON rto_applications;
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_dealer_preferences_updated_at ON dealer_preferences;
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
DROP TRIGGER IF EXISTS update_dealer_hours_updated_at ON dealer_hours;
DROP TRIGGER IF EXISTS update_shortlists_updated_at ON shortlists;
DROP TRIGGER IF EXISTS update_vehicle_inspections_updated_at ON vehicle_inspections;
DROP TRIGGER IF EXISTS update_app_configs_updated_at ON app_configs;
DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON audit_logs;

CREATE TRIGGER update_dealers_updated_at        BEFORE UPDATE ON dealers             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at       BEFORE UPDATE ON vehicles            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at   BEFORE UPDATE ON transactions        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logistics_orders_updated_at BEFORE UPDATE ON logistics_orders  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rto_applications_updated_at BEFORE UPDATE ON rto_applications  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at  BEFORE UPDATE ON bank_accounts       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_preferences_updated_at BEFORE UPDATE ON dealer_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at   BEFORE UPDATE ON team_members        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_hours_updated_at   BEFORE UPDATE ON dealer_hours        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shortlists_updated_at     BEFORE UPDATE ON shortlists          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_inspections_updated_at BEFORE UPDATE ON vehicle_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_configs_updated_at    BEFORE UPDATE ON app_configs         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
