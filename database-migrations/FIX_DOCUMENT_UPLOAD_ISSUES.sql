-- Fix Document Upload Issues
-- This script addresses the problem where images are being saved as PDFs
-- Run this in your Supabase SQL Editor

-- 1. Add file_type column to dealer_documents table
ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 2. Add rejection_reason column if not exists
ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Update existing records to have proper file_type based on file extension
UPDATE dealer_documents 
SET file_type = 'application/pdf' 
WHERE file_type IS NULL AND file_name LIKE '%.pdf';

UPDATE dealer_documents 
SET file_type = 'image/jpeg' 
WHERE file_type IS NULL AND (file_name LIKE '%.jpg' OR file_name LIKE '%.jpeg');

UPDATE dealer_documents 
SET file_type = 'image/png' 
WHERE file_type IS NULL AND file_name LIKE '%.png';

UPDATE dealer_documents 
SET file_type = 'image/gif' 
WHERE file_type IS NULL AND file_name LIKE '%.gif';

UPDATE dealer_documents 
SET file_type = 'image/webp' 
WHERE file_type IS NULL AND file_name LIKE '%.webp';

UPDATE dealer_documents 
SET file_type = 'application/msword' 
WHERE file_type IS NULL AND file_name LIKE '%.doc';

UPDATE dealer_documents 
SET file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
WHERE file_type IS NULL AND file_name LIKE '%.docx';

-- 4. Set default for remaining records
UPDATE dealer_documents 
SET file_type = 'application/octet-stream' 
WHERE file_type IS NULL;

-- 5. Verify the changes
SELECT 
    'dealer_documents table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'dealer_documents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Show sample of updated records
SELECT 
    'Sample updated records:' as info,
    document_type,
    file_name,
    file_type,
    file_size,
    status
FROM dealer_documents 
LIMIT 10;

-- 7. Count documents by type
SELECT 
    'Documents by type:' as info,
    file_type,
    COUNT(*) as count
FROM dealer_documents 
GROUP BY file_type
ORDER BY count DESC;
