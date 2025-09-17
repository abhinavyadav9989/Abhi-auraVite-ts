-- Remove RLS policies for documents and engine sound (audio) tables
-- This ensures everyone can see audio (engine sound) and documents
-- Run this in your Supabase SQL Editor

-- ==============================================
-- REMOVE RLS POLICIES FOR DEALER_DOCUMENTS TABLE
-- ==============================================

-- Drop all existing RLS policies on dealer_documents table
DROP POLICY IF EXISTS "Dealers can view own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can insert own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can update own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can delete own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Dealers can manage own documents" ON dealer_documents;
DROP POLICY IF EXISTS "Admin can view all dealer documents" ON dealer_documents;
DROP POLICY IF EXISTS "Public can view dealer documents" ON dealer_documents;
DROP POLICY IF EXISTS "Authenticated users can view dealer documents" ON dealer_documents;

-- Disable RLS on dealer_documents table to allow public access
ALTER TABLE dealer_documents DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- REMOVE RLS POLICIES FOR VEHICLE_DOCUMENTS TABLE (if exists)
-- ==============================================

-- Drop all existing RLS policies on vehicle_documents table
DROP POLICY IF EXISTS "Dealers can view own vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Dealers can insert own vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Dealers can update own vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Dealers can delete own vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Dealers can manage own vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Admin can view all vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Public can view vehicle documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Authenticated users can view vehicle documents" ON vehicle_documents;

-- Disable RLS on vehicle_documents table to allow public access
ALTER TABLE vehicle_documents DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- REMOVE RLS POLICIES FOR VEHICLE_ASSETS TABLE (ENGINE SOUND/AUDIO)
-- ==============================================

-- Drop all existing RLS policies on vehicle_assets table
DROP POLICY IF EXISTS "Dealers can manage own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Public can view vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Admin can view all vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Dealers can view own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Dealers can insert own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Dealers can update own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Dealers can delete own vehicle assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Public can view audio assets" ON vehicle_assets;
DROP POLICY IF EXISTS "Everyone can view engine sound" ON vehicle_assets;
DROP POLICY IF EXISTS "Authenticated users can view vehicle assets" ON vehicle_assets;

-- Disable RLS on vehicle_assets table to allow public access to all assets including audio/engine sound
ALTER TABLE vehicle_assets DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify that RLS is disabled on the tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('dealer_documents', 'vehicle_documents', 'vehicle_assets')
ORDER BY tablename;

-- Verify that no RLS policies exist on these tables
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('dealer_documents', 'vehicle_documents', 'vehicle_assets')
ORDER BY tablename, policyname;

-- Test query to verify public access to audio assets
SELECT 
    va.id,
    va.vehicle_id,
    va.file_url,
    va.media_type,
    va.purpose,
    va.file_name
FROM vehicle_assets va
WHERE va.media_type = 'audio' 
    AND va.purpose IN ('engine_idle', 'engine_rev')
LIMIT 5;

-- Test query to verify public access to documents
SELECT 
    dd.id,
    dd.dealer_id,
    dd.document_type,
    dd.file_url,
    dd.file_name
FROM dealer_documents dd
LIMIT 5;

-- ==============================================
-- SUMMARY
-- ==============================================

/*
This migration removes all RLS policies and disables RLS on the following tables:

1. dealer_documents - Now publicly accessible
2. vehicle_documents - Now publicly accessible (if table exists)
3. vehicle_assets - Now publicly accessible (including engine sound/audio)

This ensures that:
- Everyone can see audio files (engine sound) without authentication
- Everyone can see documents without authentication
- No restrictions based on dealer ownership or user authentication

The tables are now completely open for public read access.
*/
