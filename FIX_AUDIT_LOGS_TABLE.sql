-- Fix Audit Logs Table
-- This script adds missing columns to the existing audit_logs table
-- Run this in your Supabase SQL Editor

-- Check current audit_logs table structure
SELECT 'Current audit_logs table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to audit_logs table
DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_id UUID;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_email TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add indexes for better performance (if they don't exist)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Refresh schema cache by querying the table
SELECT 'Refreshing schema cache...' as info;
SELECT COUNT(*) as total_audit_logs FROM audit_logs;

-- Verify the updated table structure
SELECT 'Updated audit_logs table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT 'Sample audit_logs data:' as info;
SELECT COUNT(*) as total_audit_logs FROM audit_logs;
SELECT id, target_id, target_type, actor_email, action, created_at FROM audit_logs LIMIT 5;

-- Final verification that all columns exist
SELECT 'Final verification - All audit_logs columns should exist now!' as info;
