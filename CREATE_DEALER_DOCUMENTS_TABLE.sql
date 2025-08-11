-- Create dealer_documents table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dealer_documents table
CREATE TABLE IF NOT EXISTS dealer_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE dealer_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE dealer_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Dealers can manage own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can view own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can insert own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can update own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can delete own documents" ON dealer_documents;

-- Create RLS policies using created_by from dealers table
CREATE POLICY "Dealers can view own documents" ON dealer_documents
  FOR SELECT USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

CREATE POLICY "Dealers can insert own documents" ON dealer_documents
  FOR INSERT WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

CREATE POLICY "Dealers can update own documents" ON dealer_documents
  FOR UPDATE USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

CREATE POLICY "Dealers can delete own documents" ON dealer_documents
  FOR DELETE USING (
    dealer_id IN (SELECT id FROM dealers WHERE created_by = auth.jwt() ->> 'email')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dealer_documents_dealer_id ON dealer_documents(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_documents_document_type ON dealer_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_dealer_documents_status ON dealer_documents(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_dealer_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dealer_documents_updated_at_trigger ON dealer_documents;
CREATE TRIGGER update_dealer_documents_updated_at_trigger 
    BEFORE UPDATE ON dealer_documents
    FOR EACH ROW EXECUTE FUNCTION update_dealer_documents_updated_at();

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dealer_documents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'dealer_documents'
ORDER BY policyname;
