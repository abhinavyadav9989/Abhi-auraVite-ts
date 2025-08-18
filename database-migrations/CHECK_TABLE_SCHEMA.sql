-- Check the actual structure of the dealers table
-- Run this in your Supabase SQL Editor to see what columns exist

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'dealers';

-- Show RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dealers';

-- Show sample data (if any)
SELECT * FROM dealers LIMIT 5;
