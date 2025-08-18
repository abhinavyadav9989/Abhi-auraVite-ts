-- Fix Bank Details to Save to bank_details Table
-- Run this in your Supabase SQL Editor

-- 1. Check current state
SELECT '=== CURRENT STATE ANALYSIS ===' as info;

-- Check bank_details table
SELECT COUNT(*) as total_bank_accounts FROM bank_details;

-- Check dealers with bank details in onboarding_data
SELECT COUNT(*) as dealers_with_bank_data
FROM dealers 
WHERE onboarding_data->'bankDetails' IS NOT NULL;

-- 2. Create function to save bank details
CREATE OR REPLACE FUNCTION save_bank_details_to_table(
    p_dealer_id UUID,
    p_account_holder_name TEXT,
    p_account_number TEXT,
    p_ifsc_code TEXT,
    p_bank_name TEXT,
    p_cancelled_cheque_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    bank_id UUID;
BEGIN
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
    ) VALUES (
        p_dealer_id,
        p_account_holder_name,
        p_account_number,
        p_ifsc_code,
        p_bank_name,
        p_cancelled_cheque_url,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (dealer_id) 
    DO UPDATE SET
        account_holder_name = EXCLUDED.account_holder_name,
        account_number = EXCLUDED.account_number,
        ifsc_code = EXCLUDED.ifsc_code,
        bank_name = EXCLUDED.bank_name,
        cancelled_cheque_url = EXCLUDED.cancelled_cheque_url,
        updated_at = NOW()
    RETURNING id INTO bank_id;
    
    RETURN bank_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger for bank details
CREATE OR REPLACE FUNCTION trigger_save_bank_details()
RETURNS TRIGGER AS $$
DECLARE
    bank_data JSONB;
BEGIN
    IF (NEW.onboarding_data->'bankDetails' IS DISTINCT FROM OLD.onboarding_data->'bankDetails') THEN
        IF NEW.onboarding_data->'bankDetails' IS NOT NULL THEN
            bank_data := NEW.onboarding_data->'bankDetails';
            
            PERFORM save_bank_details_to_table(
                NEW.id,
                bank_data->>'accountHolderName',
                bank_data->>'accountNumber',
                bank_data->>'ifscCode',
                bank_data->>'bankName',
                CASE 
                    WHEN bank_data->'cancelledCheque'->>'url' IS NOT NULL 
                    THEN bank_data->'cancelledCheque'->>'url'
                    ELSE NULL
                END
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS save_bank_details_trigger ON dealers;
CREATE TRIGGER save_bank_details_trigger
    AFTER UPDATE ON dealers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_save_bank_details();

SELECT '=== SETUP COMPLETE ===' as info;
SELECT 'Bank details will now be automatically saved to bank_details table!' as message;
