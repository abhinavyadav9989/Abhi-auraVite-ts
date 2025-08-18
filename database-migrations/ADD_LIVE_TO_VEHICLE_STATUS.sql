-- Add 'live' to vehicle_status enum
-- Run this FIRST in your Supabase SQL Editor

-- Check current enum values BEFORE adding
SELECT 'Current vehicle_status enum values:' as info;
SELECT unnest(enum_range(NULL::vehicle_status)) as enum_value;

-- Add 'live' safely (will error if already exists, but that's okay)
DO $$ 
BEGIN
    ALTER TYPE vehicle_status ADD VALUE 'live';
    RAISE NOTICE 'Successfully added "live" to vehicle_status enum';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '"live" already exists in vehicle_status enum - continuing...';
END $$;
