-- Verify Vehicle Status Enum and Dealer Hours Table
-- Run this AFTER running the ADD_LIVE_TO_VEHICLE_STATUS.sql script

-- 1. Check vehicle_status enum values
SELECT 'Vehicle Status Enum Values:' as info;
SELECT unnest(enum_range(NULL::vehicle_status)) as enum_value;

-- 2. Check dealer_hours table structure
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

-- 3. Show sample dealer_hours data if any exists
SELECT 'Sample Dealer Hours Data:' as info;
SELECT COUNT(*) as total_hours FROM dealer_hours;
SELECT * FROM dealer_hours LIMIT 5;
