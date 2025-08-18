-- Fix Vehicle Status Enum and Dealer Hours Table
-- Run this in your Supabase SQL Editor

-- 1. Check current vehicle_status enum values
SELECT unnest(enum_range(NULL::vehicle_status)) as enum_value;

-- 2. If 'live' is not in the enum, add it (run this separately if needed)
-- Note: If you get an error about unsafe use, run this part separately first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'live' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vehicle_status')) THEN
        ALTER TYPE vehicle_status ADD VALUE 'live';
    END IF;
END $$;

-- 3. Check dealer_hours table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealer_hours'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Ensure dealer_hours has the correct columns - use is_open instead of is_closed
DO $$ BEGIN
    ALTER TABLE dealer_hours ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- 5. Drop is_closed column if it exists (since we're using is_open)
DO $$ BEGIN
    ALTER TABLE dealer_hours DROP COLUMN IF EXISTS is_closed;
EXCEPTION WHEN undefined_column THEN null;
END $$;

-- 6. Verify the fixes
SELECT 'Vehicle Status Enum Values:' as info;
SELECT unnest(enum_range(NULL::vehicle_status)) as enum_value;

SELECT 'Dealer Hours Table Structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealer_hours'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show sample dealer_hours data if any exists
SELECT 'Sample Dealer Hours Data:' as info;
SELECT COUNT(*) as total_hours FROM dealer_hours;
SELECT * FROM dealer_hours LIMIT 5;
