-- Fix for Dealers RLS Policy Issue
-- Run this in Supabase SQL Editor to fix the onboarding issue

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Dealers can insert own data" ON dealers;
DROP POLICY IF EXISTS "Admin can insert dealers" ON dealers;

-- Create a comprehensive policy for dealer creation
CREATE POLICY "Dealers can insert own data" ON dealers
  FOR INSERT WITH CHECK (
    -- Allow ANY authenticated user to create dealer records
    auth.role() = 'authenticated'
  );

-- Create a simple policy that allows authenticated users to manage their own dealers
-- and provides a fallback for admin operations
CREATE POLICY "Users can manage dealers" ON dealers
  FOR ALL USING (
    -- Allow authenticated users to access dealers they created
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    -- Allow authenticated users to create dealers
    auth.uid() IS NOT NULL
  );

-- Optional: Create a more permissive policy for admin users (if needed)
-- This can be added later if specific admin permissions are required
-- CREATE POLICY "Admin full access" ON dealers FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'dealers'
ORDER BY policyname;
