-- Add Progressive Verification Columns to Dealers Table
-- Run this in your Supabase SQL Editor to add feature gating columns

-- Check current dealers table structure
SELECT 'Current dealers table structure before adding progressive verification columns:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing progressive verification column (others already exist)
-- Based on schema analysis: kyc_completed, bank_details_added, branches_added already exist
-- Only kyb_completed is missing

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS kyb_completed BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN 
    RAISE NOTICE 'Column kyb_completed already exists';
END $$;

-- Add helpful verification tracking columns
DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'incomplete';
EXCEPTION WHEN duplicate_column THEN 
    RAISE NOTICE 'Column verification_status already exists';
END $$;

DO $$ BEGIN
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_notes JSONB DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN 
    RAISE NOTICE 'Column verification_notes already exists';
END $$;

-- Update existing records that have progressive verification data in JSON
UPDATE dealers 
SET 
    kyc_completed = COALESCE((onboarding_data->'progressive_verification'->>'kyc_completed')::boolean, false),
    kyb_completed = COALESCE((onboarding_data->'progressive_verification'->>'kyb_completed')::boolean, false),
    bank_details_added = COALESCE((onboarding_data->'progressive_verification'->>'bank_details_added')::boolean, false),
    branches_added = COALESCE((onboarding_data->'progressive_verification'->>'branches_added')::boolean, false)
WHERE onboarding_data->'progressive_verification' IS NOT NULL;

-- Show final table structure
SELECT 'Final dealers table structure after adding progressive verification columns:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current dealer records
SELECT 'Current dealer records with progressive verification status:' as info;
SELECT 
    id,
    business_name,
    email,
    onboarding_completed,
    kyc_completed,
    kyb_completed,
    bank_details_added,
    branches_added,
    verification_status
FROM dealers
ORDER BY created_at DESC
LIMIT 10;
