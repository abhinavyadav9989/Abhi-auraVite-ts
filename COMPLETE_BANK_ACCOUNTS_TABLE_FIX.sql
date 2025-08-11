-- Complete Bank Accounts Table Fix
-- This script adds ALL possible missing columns to prevent future errors
-- Run this in your Supabase SQL Editor

-- Check current bank_accounts table structure
SELECT 'Current bank_accounts table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add ALL possible missing columns that the application might use
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS branch_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS dealer_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS bank_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS cheque_image_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Additional columns that might be used
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'savings';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS micr_code TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS upi_id TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS verification_method TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add any other potential columns that might be used
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS notes TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS last_transaction_date TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_bank_accounts FROM bank_accounts;

-- Verify the updated table structure
SELECT 'Updated bank_accounts table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bank_accounts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT 'Sample bank_accounts data:' as info;
SELECT COUNT(*) as total_bank_accounts FROM bank_accounts;
SELECT id, dealer_id, account_number, bank_name, is_verified FROM bank_accounts LIMIT 5;

-- Final verification that all common columns exist
SELECT 'Final verification - All columns should exist now!' as info;
