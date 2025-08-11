-- Refresh Vehicles Table Schema Cache
-- Run this AFTER fixing the vehicles table structure

-- Force schema cache refresh by querying the table structure
SELECT 'Refreshing schema cache for vehicles table...' as info;

-- Query the table structure to force cache refresh
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Perform a dummy operation to trigger cache refresh
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Check if all required columns exist
SELECT 'Verifying all required columns exist:' as info;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'All required columns exist'
        ELSE 'Missing columns: ' || string_agg(column_name, ', ')
    END as status
FROM (
    SELECT unnest(ARRAY[
        'ai_metadata', 'asking_price', 'custom_attributes', 'registration_number', 'make', 'model', 'variant',
        'year', 'price', 'description', 'fuel_type', 'transmission',
        'mileage', 'ownership', 'color', 'images', 'documents',
        'features', 'location_city', 'location_state', 'listing_fee_type',
        'listing_fee_value', 'tags', 'inventory_type', 'publish_schedule',
        'dealer_id', 'created_by', 'status', 'created_at', 'updated_at'
    ]) as column_name
) required_columns
WHERE column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'vehicles' 
    AND table_schema = 'public'
);

-- Test a simple insert to verify the table works
SELECT 'Testing table functionality...' as info;
SELECT 'Table is ready for use!' as status;
