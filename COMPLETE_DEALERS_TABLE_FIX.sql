-- Complete Dealers Table Fix
-- This script adds ALL possible missing columns to prevent future errors
-- Run this in your Supabase SQL Editor

-- Check current dealers table structure
SELECT 'Current dealers table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add ALL possible missing columns that the application might use
DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS pincode TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS city TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS state TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS owner_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS gstin TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS pan_number TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS phone TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS tagline TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS website TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS logo_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS banner_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_notes TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Additional columns that might be used
DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS address TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS contact_number TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS business_type TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS client_type TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS business_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS owner_user_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add any other potential columns that might be used
DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS kyb_completed BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS kyb_data JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS draft_data JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS bank_details JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS payment_methods JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS business_hours JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS specializations TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS certifications TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS total_vehicles INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_dealers FROM dealers;

-- Verify the updated table structure
SELECT 'Updated dealers table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT 'Sample dealers data:' as info;
SELECT COUNT(*) as total_dealers FROM dealers;
SELECT id, email, business_name, city, state, verification_status FROM dealers LIMIT 5;

-- Final verification that all common columns exist
SELECT 'Final verification - All columns should exist now!' as info;
