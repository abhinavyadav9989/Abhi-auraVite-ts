-- Add Missing Columns to Dealers Table
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

-- Add missing columns that KYBWizard is trying to use
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
