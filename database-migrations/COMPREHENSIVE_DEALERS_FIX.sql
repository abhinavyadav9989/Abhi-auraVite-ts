-- Comprehensive fix for dealers table
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist and their constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Make ALL potentially problematic columns nullable
DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN owner_user_id DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN name DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN business_name DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN business_type DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN client_type DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN contact_number DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ALTER COLUMN address DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS email TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

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

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
