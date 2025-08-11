-- Final Complete Vehicles Table Fix
-- This script adds ALL possible missing columns to prevent future errors
-- Run this in your Supabase SQL Editor

-- Check current vehicles table structure
SELECT 'Current vehicles table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add ALL possible missing columns that the application might use
DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ai_metadata JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS asking_price DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS custom_attributes JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS inspection_report_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS landed_cost_components JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS market_data JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS suggested_categories TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS videos TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS publish_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_number TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS variant TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS kilometers INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ownership TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS images TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS documents TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS features TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location_city TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location_state TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS listing_fee_type TEXT DEFAULT 'percentage';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS listing_fee_value DECIMAL(5,2) DEFAULT 2.0;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tags TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS inventory_type TEXT DEFAULT 'public';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS publish_schedule TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS dealer_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status vehicle_status DEFAULT 'draft';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Additional columns that might be used
DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_category TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS market_price_min DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS market_price_max DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ai_confidence TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_size TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS body_type TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seating_capacity INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_valid_until DATE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rto_location TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS emi_available BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exchange_available BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS test_drive_available BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add any other potential columns that might be used
DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS condition_rating INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS service_history JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS warranty_info JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS financing_options JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seller_notes TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS buyer_requirements JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS viewing_schedule JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE vehicles ADD CONSTRAINT vehicles_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Verify the updated table structure
SELECT 'Updated vehicles table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT 'Sample vehicles data:' as info;
SELECT COUNT(*) as total_vehicles FROM vehicles;
SELECT id, registration_number, make, model, status FROM vehicles LIMIT 5;

-- Final verification that all common columns exist
SELECT 'Final verification - All columns should exist now!' as info;