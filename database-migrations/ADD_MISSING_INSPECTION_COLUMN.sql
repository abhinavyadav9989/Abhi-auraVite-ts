-- Add Missing Inspection Report Column
-- Run this in your Supabase SQL Editor

-- Add the missing inspection_report_url column
DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS inspection_report_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Verify the column was added
SELECT 'Verifying inspection_report_url column:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
AND column_name = 'inspection_report_url';

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Show updated table structure
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
