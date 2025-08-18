-- Fix Bank Details Table Constraint Issue
-- This script adds the missing unique constraint for dealer_id in bank_details table

-- 1. First, let's check the current structure of bank_details table
SELECT '=== CURRENT BANK_DETAILS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bank_details' 
ORDER BY ordinal_position;

-- 2. Check existing constraints
SELECT '=== EXISTING CONSTRAINTS ===' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'bank_details';

-- 3. Add unique constraint on dealer_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bank_details' 
        AND constraint_name = 'bank_details_dealer_id_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        -- Add unique constraint
        ALTER TABLE bank_details 
        ADD CONSTRAINT bank_details_dealer_id_unique 
        UNIQUE (dealer_id);
        
        RAISE NOTICE 'Added unique constraint on dealer_id';
    ELSE
        RAISE NOTICE 'Unique constraint on dealer_id already exists';
    END IF;
END $$;

-- 4. Verify the constraint was added
SELECT '=== VERIFIED CONSTRAINTS ===' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'bank_details';

-- 5. Test the upsert functionality
SELECT '=== TESTING UPSERT FUNCTIONALITY ===' as info;

-- Create a test function to verify upsert works
CREATE OR REPLACE FUNCTION test_bank_details_upsert()
RETURNS TEXT AS $$
DECLARE
    test_dealer_id UUID;
    result TEXT;
BEGIN
    -- Get a test dealer ID
    SELECT id INTO test_dealer_id FROM dealers LIMIT 1;
    
    IF test_dealer_id IS NULL THEN
        RETURN 'No dealers found for testing';
    END IF;
    
    -- Test insert
    INSERT INTO bank_details (
        dealer_id,
        account_holder_name,
        account_number,
        ifsc_code,
        bank_name,
        is_verified
    ) VALUES (
        test_dealer_id,
        'Test Account Holder',
        '1234567890',
        'TEST0001234',
        'Test Bank',
        false
    ) ON CONFLICT (dealer_id) DO UPDATE SET
        account_holder_name = EXCLUDED.account_holder_name,
        account_number = EXCLUDED.account_number,
        ifsc_code = EXCLUDED.ifsc_code,
        bank_name = EXCLUDED.bank_name,
        updated_at = NOW();
    
    -- Test update (should work due to ON CONFLICT)
    INSERT INTO bank_details (
        dealer_id,
        account_holder_name,
        account_number,
        ifsc_code,
        bank_name,
        is_verified
    ) VALUES (
        test_dealer_id,
        'Updated Account Holder',
        '0987654321',
        'UPDT0005678',
        'Updated Bank',
        true
    ) ON CONFLICT (dealer_id) DO UPDATE SET
        account_holder_name = EXCLUDED.account_holder_name,
        account_number = EXCLUDED.account_number,
        ifsc_code = EXCLUDED.ifsc_code,
        bank_name = EXCLUDED.bank_name,
        updated_at = NOW();
    
    RETURN 'Upsert test completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Upsert test failed: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Run the test
SELECT test_bank_details_upsert() as test_result;

-- Clean up test function
DROP FUNCTION IF EXISTS test_bank_details_upsert();

SELECT '=== BANK_DETAILS TABLE FIX COMPLETED ===' as info;
