-- Migrate Existing Documents from Onboarding Progress to dealer_documents Table
-- This script handles users who completed onboarding before the document migration was implemented

-- 1. First, let's check what documents exist in onboarding progress
SELECT '=== CHECKING EXISTING ONBOARDING DOCUMENTS ===' as info;

SELECT 
    d.id as dealer_id,
    d.email,
    d.name,
    d.onboarding_progress->'kybDocuments' as kyb_documents,
    d.onboarding_progress->'bankDetails' as bank_details
FROM dealers d
WHERE d.onboarding_completed = true 
AND (d.onboarding_progress->'kybDocuments' IS NOT NULL OR d.onboarding_progress->'bankDetails' IS NOT NULL);

-- 2. Create a function to migrate documents for a specific dealer
CREATE OR REPLACE FUNCTION migrate_dealer_documents(dealer_id UUID)
RETURNS TEXT AS $$
DECLARE
    dealer_record RECORD;
    kyb_docs JSONB;
    bank_details JSONB;
    doc_type TEXT;
    doc_data JSONB;
    doc_count INTEGER := 0;
BEGIN
    -- Get dealer data
    SELECT * INTO dealer_record FROM dealers WHERE id = dealer_id;
    
    IF NOT FOUND THEN
        RETURN 'Dealer not found';
    END IF;
    
    -- Extract documents from onboarding progress
    kyb_docs := dealer_record.onboarding_progress->'kybDocuments';
    bank_details := dealer_record.onboarding_progress->'bankDetails';
    
    -- Migrate KYB documents
    IF kyb_docs IS NOT NULL THEN
        FOR doc_type, doc_data IN SELECT * FROM jsonb_each(kyb_docs)
        LOOP
            -- Check if document already exists
            IF NOT EXISTS (
                SELECT 1 FROM dealer_documents 
                WHERE dealer_id = dealer_id AND document_type = doc_type
            ) THEN
                -- Insert document record
                INSERT INTO dealer_documents (
                    dealer_id,
                    document_type,
                    file_url,
                    file_name,
                    file_size,
                    file_type,
                    status,
                    uploaded_at,
                    created_at
                ) VALUES (
                    dealer_id,
                    doc_type,
                    doc_data->>'url',
                    COALESCE(doc_data->>'fileName', 'Uploaded Document'),
                    COALESCE((doc_data->>'fileSize')::INTEGER, 0),
                    COALESCE(doc_data->>'fileType', 'application/octet-stream'),
                    'pending',
                    COALESCE(doc_data->>'uploadedAt', NOW()::TEXT),
                    NOW()
                );
                doc_count := doc_count + 1;
            END IF;
        END LOOP;
    END IF;
    
    -- Migrate bank details document (cancelled cheque)
    IF bank_details IS NOT NULL AND bank_details->'cancelledCheque' IS NOT NULL THEN
        doc_data := bank_details->'cancelledCheque';
        
        IF NOT EXISTS (
            SELECT 1 FROM dealer_documents 
            WHERE dealer_id = dealer_id AND document_type = 'cancelled_cheque'
        ) THEN
            INSERT INTO dealer_documents (
                dealer_id,
                document_type,
                file_url,
                file_name,
                file_size,
                file_type,
                status,
                uploaded_at,
                created_at
            ) VALUES (
                dealer_id,
                'cancelled_cheque',
                doc_data->>'url',
                COALESCE(doc_data->>'fileName', 'Cancelled Cheque'),
                COALESCE((doc_data->>'fileSize')::INTEGER, 0),
                COALESCE(doc_data->>'fileType', 'application/octet-stream'),
                'pending',
                COALESCE(doc_data->>'uploadedAt', NOW()::TEXT),
                NOW()
            );
            doc_count := doc_count + 1;
        END IF;
    END IF;
    
    RETURN 'Migrated ' || doc_count || ' documents for dealer ' || dealer_record.email;
END;
$$ LANGUAGE plpgsql;

-- 3. Migrate documents for all dealers who completed onboarding
SELECT '=== MIGRATING DOCUMENTS FOR ALL DEALERS ===' as info;

DO $$
DECLARE
    dealer_record RECORD;
    result TEXT;
BEGIN
    FOR dealer_record IN 
        SELECT id, email, name 
        FROM dealers 
        WHERE onboarding_completed = true 
        AND (onboarding_progress->'kybDocuments' IS NOT NULL OR onboarding_progress->'bankDetails' IS NOT NULL)
    LOOP
        result := migrate_dealer_documents(dealer_record.id);
        RAISE NOTICE 'Dealer % (%): %', dealer_record.name, dealer_record.email, result;
    END LOOP;
END $$;

-- 4. Verify the migration
SELECT '=== VERIFICATION - DOCUMENTS AFTER MIGRATION ===' as info;

SELECT 
    d.email,
    d.name,
    COUNT(dd.id) as document_count,
    ARRAY_AGG(dd.document_type) as document_types
FROM dealers d
LEFT JOIN dealer_documents dd ON d.id = dd.dealer_id
WHERE d.onboarding_completed = true
GROUP BY d.id, d.email, d.name
ORDER BY d.email;

-- 5. Show sample migrated documents
SELECT '=== SAMPLE MIGRATED DOCUMENTS ===' as info;

SELECT 
    dd.dealer_id,
    d.email,
    dd.document_type,
    dd.file_name,
    dd.file_url,
    dd.status,
    dd.created_at
FROM dealer_documents dd
JOIN dealers d ON dd.dealer_id = d.id
WHERE d.onboarding_completed = true
ORDER BY dd.created_at DESC
LIMIT 10;

-- 6. Clean up the function
DROP FUNCTION IF EXISTS migrate_dealer_documents(UUID);

SELECT '=== DOCUMENT MIGRATION COMPLETED ===' as info;
