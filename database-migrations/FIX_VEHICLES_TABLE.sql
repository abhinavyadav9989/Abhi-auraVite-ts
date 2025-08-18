-- Fix Vehicles Table Structure
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

-- Add missing columns that AddVehicle is trying to use
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

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE vehicles ADD CONSTRAINT vehicles_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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
