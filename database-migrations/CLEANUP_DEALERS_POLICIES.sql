-- Clean up conflicting RLS policies on dealers table
-- Run this in your Supabase SQL Editor

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Dealers can view own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can update own data" ON dealers;
DROP POLICY IF EXISTS "Dealers can insert own data" ON dealers;
DROP POLICY IF EXISTS "dealer_owner_delete" ON dealers;
DROP POLICY IF EXISTS "dealer_owner_insert" ON dealers;
DROP POLICY IF EXISTS "dealer_owner_select" ON dealers;
DROP POLICY IF EXISTS "dealer_owner_update" ON dealers;

-- Create clean, consistent policies using created_by
CREATE POLICY "Dealers can view own data" ON dealers
  FOR SELECT USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can update own data" ON dealers
  FOR UPDATE USING (created_by = auth.jwt() ->> 'email');

CREATE POLICY "Dealers can insert own data" ON dealers
  FOR INSERT WITH CHECK (created_by = auth.jwt() ->> 'email');

-- Optional: Add delete policy if needed
CREATE POLICY "Dealers can delete own data" ON dealers
  FOR DELETE USING (created_by = auth.jwt() ->> 'email');

-- Verify the policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dealers'
ORDER BY policyname;
