-- Check Profile Data in Database Tables
-- This script will help us verify if onboarding data is actually being saved

-- 1. Check dealers table for business_mode, plan_selection, and consent_receipt
SELECT 
    id,
    email,
    name,
    business_mode,
    plan_selection,
    consent_receipt,
    onboarding_completed,
    verification_status_new,
    created_at,
    updated_at
FROM dealers 
WHERE email = 'your-email@example.com'  -- Replace with actual email
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check branches table
SELECT 
    id,
    dealer_id,
    name,
    address,
    city,
    state,
    contact_number,
    working_hours,
    is_default,
    created_at
FROM branches 
WHERE dealer_id IN (
    SELECT id FROM dealers WHERE email = 'your-email@example.com'
)
ORDER BY created_at DESC;

-- 3. Check team_members table
SELECT 
    id,
    dealer_id,
    user_id,
    role,
    permissions,
    created_at
FROM team_members 
WHERE dealer_id IN (
    SELECT id FROM dealers WHERE email = 'your-email@example.com'
)
ORDER BY created_at DESC;

-- 4. Check bank_details table
SELECT 
    id,
    dealer_id,
    account_holder_name,
    account_number,
    ifsc_code,
    bank_name,
    cancelled_cheque_url,
    created_at
FROM bank_details 
WHERE dealer_id IN (
    SELECT id FROM dealers WHERE email = 'your-email@example.com'
)
ORDER BY created_at DESC;

-- 5. Check dealer_documents table
SELECT 
    id,
    dealer_id,
    document_type,
    file_name,
    file_url,
    file_size,
    file_type,
    status,
    created_at
FROM dealer_documents 
WHERE dealer_id IN (
    SELECT id FROM dealers WHERE email = 'your-email@example.com'
)
ORDER BY created_at DESC;

-- 6. Check all dealers to see the structure
SELECT 
    id,
    email,
    name,
    business_mode IS NOT NULL as has_business_mode,
    plan_selection IS NOT NULL as has_plan_selection,
    consent_receipt IS NOT NULL as has_consent_receipt,
    onboarding_completed,
    verification_status_new,
    created_at
FROM dealers 
ORDER BY created_at DESC
LIMIT 10;
