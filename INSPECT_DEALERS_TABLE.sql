-- Comprehensive inspection of dealers table
-- Run this in your Supabase SQL Editor and share the results

-- 1. Show all columns and their properties
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'dealers' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'NOT NULL';

-- 3. Show RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dealers'
ORDER BY policyname;

-- 4. Show sample data (if any)
SELECT * FROM dealers LIMIT 3;

-- 5. Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealers' 
        AND column_name = 'business_name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as business_name_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealers' 
        AND column_name = 'business_type'
    ) THEN 'EXISTS' ELSE 'MISSING' END as business_type_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealers' 
        AND column_name = 'client_type'
    ) THEN 'EXISTS' ELSE 'MISSING' END as client_type_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealers' 
        AND column_name = 'created_by'
    ) THEN 'EXISTS' ELSE 'MISSING' END as created_by_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dealers' 
        AND column_name = 'email'
    ) THEN 'EXISTS' ELSE 'MISSING' END as email_status;
