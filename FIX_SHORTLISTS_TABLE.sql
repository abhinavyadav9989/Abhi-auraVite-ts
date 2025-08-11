-- Fix Shortlists Table
-- This script adds missing columns to the existing shortlists table
-- Run this in your Supabase SQL Editor

-- Check current shortlists table structure
SELECT 'Current shortlists table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shortlists'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to shortlists table
DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS dealer_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS vehicle_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS user_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS notes TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
    ALTER TABLE shortlists ADD CONSTRAINT shortlists_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE shortlists ADD CONSTRAINT shortlists_vehicle_id_fkey 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance (if they don't exist)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_shortlists_dealer_id ON shortlists(dealer_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_shortlists_vehicle_id ON shortlists(vehicle_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_shortlists_user_id ON shortlists(user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_shortlists FROM shortlists;

-- Verify the updated table structure
SELECT 'Updated shortlists table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shortlists'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT 'Sample shortlists data:' as info;
SELECT COUNT(*) as total_shortlists FROM shortlists;
SELECT id, dealer_id, vehicle_id, user_id, is_active FROM shortlists LIMIT 5;

-- Final verification that all columns exist
SELECT 'Final verification - All shortlists columns should exist now!' as info;
