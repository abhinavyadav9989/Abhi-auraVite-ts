-- Comprehensive fix for branches visibility issue
-- This addresses all possible RLS policy conflicts and ensures branches are visible
-- Run this in your Supabase SQL Editor

-- ==============================================
-- STEP 1: DISABLE RLS TEMPORARILY TO CLEAR ALL POLICIES
-- ==============================================

-- Disable RLS on branches table to clear all existing policies
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 2: DROP ALL EXISTING POLICIES (SAFETY CHECK)
-- ==============================================

-- Drop all possible existing policies on branches table
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
DROP POLICY IF EXISTS "Everyone can view all branches" ON branches;
DROP POLICY IF EXISTS "Dealers can create branches for their own business" ON branches;
DROP POLICY IF EXISTS "Dealers can update their own branches" ON branches;
DROP POLICY IF EXISTS "Dealers can delete their own branches" ON branches;

-- ==============================================
-- STEP 3: GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ==============================================

-- Grant basic CRUD permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.branches TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ==============================================
-- STEP 4: ENABLE RLS WITH NEW POLICIES
-- ==============================================

-- Re-enable RLS on branches table
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 5: CREATE NEW PUBLIC ACCESS POLICIES
-- ==============================================

-- Policy 1: Everyone can view all branches (public read access)
CREATE POLICY "Everyone can view all branches" ON branches
  FOR SELECT 
  USING (true);

-- Policy 2: Authenticated users can insert branches for their own dealer
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
-- STEP 6: VERIFICATION AND TESTING
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

-- Test query to verify branches are visible for Bishow Auto Traders
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
-- STEP 7: ALTERNATIVE APPROACH - DISABLE RLS COMPLETELY
-- ==============================================

-- If the above doesn't work, you can completely disable RLS on branches
-- Uncomment the following lines if needed:

-- ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.branches TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.branches TO anon;

-- ==============================================
-- SUMMARY
-- ==============================================

/*
This comprehensive fix addresses the branches visibility issue by:

1. **Clearing all existing policies** by temporarily disabling RLS
2. **Granting proper permissions** to authenticated users
3. **Creating new public access policies** that allow everyone to see branches
4. **Maintaining security** for branch management operations
5. **Providing verification queries** to test the fix

If this doesn't work, the alternative approach (Step 7) completely disables RLS on branches,
which will make them fully accessible to everyone.

The key issue was likely conflicting RLS policies that were preventing access.
This fix ensures a clean slate and proper public access to branch information.
*/
