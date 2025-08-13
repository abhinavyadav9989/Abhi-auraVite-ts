-- Add missing columns to dealers table
-- Run this in your Supabase SQL Editor

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to dealer_documents table
-- Run this in your Supabase SQL Editor

-- Add file_type column to store the original MIME type
ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Add rejection_reason column if not exists
ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing records to have a default file_type
UPDATE dealer_documents 
SET file_type = 'application/pdf' 
WHERE file_type IS NULL AND file_name LIKE '%.pdf';

UPDATE dealer_documents 
SET file_type = 'image/jpeg' 
WHERE file_type IS NULL AND (file_name LIKE '%.jpg' OR file_name LIKE '%.jpeg');

UPDATE dealer_documents 
SET file_type = 'image/png' 
WHERE file_type IS NULL AND file_name LIKE '%.png';

-- Set default for remaining records
UPDATE dealer_documents 
SET file_type = 'application/octet-stream' 
WHERE file_type IS NULL;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealer_documents'
AND table_schema = 'public'
ORDER BY ordinal_position;
