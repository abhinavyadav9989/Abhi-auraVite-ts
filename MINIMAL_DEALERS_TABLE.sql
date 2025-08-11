-- Minimal Dealers Table Setup
-- Run this in your Supabase SQL Editor to create/update the dealers table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dealers table if it doesn't exist
CREATE TABLE IF NOT EXISTS dealers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS email TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
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
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Dealers can view own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can update own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can insert own data" ON dealers;

-- Create RLS policies
CREATE POLICY "Dealers can view own data" ON dealers
  FOR SELECT USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can update own data" ON dealers
  FOR UPDATE USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can insert own data" ON dealers
  FOR INSERT WITH CHECK (created_by = auth.jwt() ->> 'email');

-- Create index
CREATE INDEX IF NOT EXISTS idx_dealers_created_by ON dealers(created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
CREATE TRIGGER update_dealers_updated_at 
  BEFORE UPDATE ON dealers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
