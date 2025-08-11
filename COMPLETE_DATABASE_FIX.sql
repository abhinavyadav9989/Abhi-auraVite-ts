-- Complete Database Fix
-- This script creates ALL missing tables and adds ALL missing columns
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE AUDIT_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID,
    target_type TEXT,
    actor_email TEXT,
    action TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    metadata JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 2. CREATE SHORTLISTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS shortlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shortlists_dealer_id ON shortlists(dealer_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_vehicle_id ON shortlists(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_user_id ON shortlists(user_id);

-- =====================================================
-- 3. CREATE VEHICLE_INSPECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicle_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    inspector_id UUID,
    inspection_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    report_url TEXT,
    findings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_status ON vehicle_inspections(status);

-- =====================================================
-- 4. CREATE TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    buyer_id UUID,
    seller_id UUID,
    transaction_type TEXT,
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_vehicle_id ON transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);

-- =====================================================
-- 5. FIX BANK_ACCOUNTS TABLE (if not already fixed)
-- =====================================================

-- Add missing columns to bank_accounts table
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS branch_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS dealer_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS bank_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS cheque_image_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 6. CREATE VEHICLES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    make TEXT,
    model TEXT,
    year INTEGER,
    price DECIMAL(15,2),
    status TEXT DEFAULT 'draft',
    images TEXT[],
    description TEXT,
    mileage INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    color TEXT,
    registration_number TEXT,
    vin TEXT,
    engine_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);

-- =====================================================
-- 7. CREATE DEALER_DOCUMENTS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS dealer_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    document_type TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dealer_documents_dealer_id ON dealer_documents(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_documents_type ON dealer_documents(document_type);

-- =====================================================
-- 8. VERIFY ALL TABLES EXIST
-- =====================================================

-- Check all table structures
SELECT 'Verifying all tables exist...' as info;

SELECT 'audit_logs table structure:' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'shortlists table structure:' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shortlists'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'bank_accounts table structure:' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'vehicles table structure:' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'dealer_documents table structure:' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealer_documents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 9. REFRESH SCHEMA CACHE
-- =====================================================

-- Query each table to refresh schema cache
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as audit_logs_count FROM audit_logs;
SELECT COUNT(*) as shortlists_count FROM shortlists;
SELECT COUNT(*) as bank_accounts_count FROM bank_accounts;
SELECT COUNT(*) as vehicles_count FROM vehicles;
SELECT COUNT(*) as dealer_documents_count FROM dealer_documents;
SELECT COUNT(*) as vehicle_inspections_count FROM vehicle_inspections;
SELECT COUNT(*) as transactions_count FROM transactions;

-- =====================================================
-- 10. FINAL VERIFICATION
-- =====================================================

SELECT 'Final verification - All tables and columns should exist now!' as info;
SELECT 'Database fix completed successfully!' as status;
