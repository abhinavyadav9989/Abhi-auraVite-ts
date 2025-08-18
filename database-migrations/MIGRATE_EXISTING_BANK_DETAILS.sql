-- Migrate Existing Bank Details from onboarding_data to bank_details table
-- Run this in your Supabase SQL Editor

-- 1. Check for existing bank details in onboarding_data
SELECT '=== CHECKING EXISTING BANK DETAILS ===' as info;

SELECT 
    id,
    name,
    email,
    onboarding_data->'bankDetails' as bank_details_json
FROM dealers 
WHERE onboarding_data->'bankDetails' IS NOT NULL
AND onboarding_data->'bankDetails' != 'null';

-- 2. Migrate existing bank details to bank_details table
INSERT INTO bank_details (
    dealer_id,
    account_holder_name,
    account_number,
    ifsc_code,
    bank_name,
    cancelled_cheque_url,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    d.id as dealer_id,
    d.onboarding_data->'bankDetails'->>'accountHolderName' as account_holder_name,
    d.onboarding_data->'bankDetails'->>'accountNumber' as account_number,
    d.onboarding_data->'bankDetails'->>'ifscCode' as ifsc_code,
    d.onboarding_data->'bankDetails'->>'bankName' as bank_name,
    CASE 
        WHEN d.onboarding_data->'bankDetails'->'cancelledCheque'->>'url' IS NOT NULL 
        THEN d.onboarding_data->'bankDetails'->'cancelledCheque'->>'url'
        ELSE NULL
    END as cancelled_cheque_url,
    false as is_verified,
    NOW() as created_at,
    NOW() as updated_at
FROM dealers d
WHERE d.onboarding_data->'bankDetails' IS NOT NULL
AND d.onboarding_data->'bankDetails' != 'null'
AND NOT EXISTS (
    SELECT 1 FROM bank_details bd 
    WHERE bd.dealer_id = d.id
);

-- 3. Verify migration results
SELECT '=== MIGRATION RESULTS ===' as info;

SELECT 
    COUNT(*) as total_bank_accounts_after_migration
FROM bank_details;

SELECT 
    d.name,
    d.email,
    bd.account_holder_name,
    bd.bank_name,
    bd.is_verified
FROM dealers d
LEFT JOIN bank_details bd ON d.id = bd.dealer_id
WHERE bd.id IS NOT NULL
ORDER BY d.name;

SELECT '=== MIGRATION COMPLETE ===' as info;
