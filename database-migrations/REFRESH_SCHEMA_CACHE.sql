-- Refresh Supabase Schema Cache
-- Run this AFTER adding the missing columns

-- Force schema cache refresh by querying the table structure
SELECT 'Refreshing schema cache for dealers table...' as info;

-- Query the table structure to force cache refresh
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Perform a dummy operation to trigger cache refresh
SELECT COUNT(*) as total_dealers FROM dealers;

-- Check if all required columns exist
SELECT 'Verifying all required columns exist:' as info;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'All required columns exist'
        ELSE 'Missing columns: ' || string_agg(column_name, ', ')
    END as status
FROM (
    SELECT unnest(ARRAY[
        'city', 'state', 'owner_name', 'gstin', 'pan_number', 
        'phone', 'whatsapp', 'tagline', 'website', 'description',
        'logo_url', 'banner_url', 'verification_status', 'submitted_at',
        'subscription_plan', 'verification_notes'
    ]) as column_name
) required_columns
WHERE column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'dealers' 
    AND table_schema = 'public'
);
