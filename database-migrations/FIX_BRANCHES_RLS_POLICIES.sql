-- Fix branches RLS policies so everyone can see all branches
-- This ensures branch information is publicly visible in dealer profiles
-- Run this in your Supabase SQL Editor

-- ==============================================
-- REMOVE EXISTING RESTRICTIVE RLS POLICIES
-- ==============================================

-- Drop all existing restrictive policies on branches table
DROP POLICY IF EXISTS "branches_select_scoped" ON branches;
DROP POLICY IF EXISTS "branches_write_scoped" ON branches;
DROP POLICY IF EXISTS "Users can view their own branches" ON branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON branches;
DROP POLICY IF EXISTS "Admins can view all onboarding data" ON branches;
DROP POLICY IF EXISTS "Admin can view all branches" ON branches;
DROP POLICY IF EXISTS "Dealers can view own branches" ON branches;
DROP POLICY IF EXISTS "Dealers can manage own branches" ON branches;
DROP POLICY IF EXISTS "Public can view branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can view branches" ON branches;

-- ==============================================
-- CREATE NEW PUBLIC ACCESS RLS POLICIES
-- ==============================================

-- Policy 1: Everyone can view all branches (public read access)
-- This allows all users (authenticated and anonymous) to see branch information
CREATE POLICY "Everyone can view all branches" ON branches
  FOR SELECT 
  USING (true);

-- Policy 2: Authenticated users can insert branches for their own dealer
-- This maintains security for branch creation
CREATE POLICY "Dealers can create branches for their own business" ON branches
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND
    dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    )
  );

-- Policy 3: Authenticated users can update branches for their own dealer
-- This maintains security for branch updates
CREATE POLICY "Dealers can update their own branches" ON branches
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND
    dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    )
  );

-- Policy 4: Authenticated users can delete branches for their own dealer
-- This maintains security for branch deletion
CREATE POLICY "Dealers can delete their own branches" ON branches
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND
    dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    )
  );

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify that RLS is enabled and policies exist
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
    AND tablename = 'branches'
ORDER BY policyname;

-- Test query to verify all branches are visible to everyone
-- This should return all branches with dealer information
SELECT 
    b.id,
    b.name as branch_name,
    b.address,
    b.city,
    b.state,
    b.contact_number,
    b.branch_type,
    b.is_default,
    b.vehicle_count,
    b.created_at,
    -- Dealer information
    d.name as dealer_name,
    d.business_name,
    d.city as dealer_city,
    d.state as dealer_state
FROM branches b
JOIN dealers d ON b.dealer_id = d.id
ORDER BY d.name, b.name
LIMIT 20;

-- Test query to verify branches are visible for a specific dealer
-- Replace 'Bishow Auto Traders Pvt Ltd' with the actual dealer name from your data
SELECT 
    b.id,
    b.name as branch_name,
    b.address,
    b.city,
    b.state,
    b.contact_number,
    b.branch_type,
    b.is_default,
    b.vehicle_count
FROM branches b
JOIN dealers d ON b.dealer_id = d.id
WHERE d.business_name ILIKE '%Bishow%' OR d.name ILIKE '%Bishow%'
ORDER BY b.name;

-- Test query to verify branch count per dealer
SELECT 
    d.id,
    d.name as dealer_name,
    d.business_name,
    COUNT(b.id) as branch_count
FROM dealers d
LEFT JOIN branches b ON d.id = b.dealer_id
GROUP BY d.id, d.name, d.business_name
HAVING COUNT(b.id) > 0
ORDER BY branch_count DESC, d.name;

-- ==============================================
-- SUMMARY
-- ==============================================

/*
This migration fixes the branches visibility issue by:

1. **Removing restrictive policies** that were preventing public access to branch information
2. **Adding public read access** so everyone can see all branches
3. **Maintaining security** for branch creation, updates, and deletion (only dealers can manage their own branches)
4. **Preserving data integrity** while making branch information publicly accessible

Key improvements:
- All users can now see all branches in dealer profiles
- Branch information is publicly accessible (name, address, contact, etc.)
- Dealers can still manage their own branches securely
- The "No branches listed" issue in dealer profile modals is resolved

The branches are now fully visible to everyone while maintaining appropriate security for branch management.
*/
