-- Fix dealer ratings RLS policies so all dealers can see all reviews and reviewer names
-- This ensures transparency in the rating system
-- Run this in your Supabase SQL Editor

-- ==============================================
-- REMOVE EXISTING RLS POLICIES (if any)
-- ==============================================

-- Drop any existing policies on dealer_ratings table
DROP POLICY IF EXISTS "Dealers can view own ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Dealers can view ratings they gave" ON dealer_ratings;
DROP POLICY IF EXISTS "Dealers can view ratings they received" ON dealer_ratings;
DROP POLICY IF EXISTS "Dealers can insert own ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Dealers can update own ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Dealers can delete own ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Admin can view all dealer ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Public can view dealer ratings" ON dealer_ratings;
DROP POLICY IF EXISTS "Authenticated users can view dealer ratings" ON dealer_ratings;

-- ==============================================
-- CREATE NEW RLS POLICIES FOR TRANSPARENCY
-- ==============================================

-- Policy 1: All authenticated users (dealers) can view ALL ratings and reviews
-- This includes the reviewer name (rater_dealer_id) and all review details
CREATE POLICY "All dealers can view all ratings and reviews" ON dealer_ratings
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policy 2: Dealers can only insert ratings for transactions they're involved in
-- This ensures dealers can only rate dealers they've actually transacted with
CREATE POLICY "Dealers can rate dealers they transacted with" ON dealer_ratings
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      -- The rater must be the buyer or seller in the transaction
      EXISTS (
        SELECT 1 FROM transactions t
        WHERE t.id = dealer_ratings.transaction_id
        AND (
          t.buyer_id IN (
            SELECT d.id FROM dealers d 
            WHERE d.owner_user_id = auth.uid()
          )
          OR t.seller_id IN (
            SELECT d.id FROM dealers d 
            WHERE d.owner_user_id = auth.uid()
          )
        )
      )
    )
  );

-- Policy 3: Dealers can update their own ratings (within a reasonable time limit)
-- This allows for corrections but prevents abuse
CREATE POLICY "Dealers can update their own ratings" ON dealer_ratings
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND
    rater_dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    ) AND
    -- Only allow updates within 24 hours of creation
    created_at > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    rater_dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    )
  );

-- Policy 4: Dealers can delete their own ratings (within a reasonable time limit)
-- This allows for corrections but prevents abuse
CREATE POLICY "Dealers can delete their own ratings" ON dealer_ratings
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND
    rater_dealer_id IN (
      SELECT d.id FROM dealers d 
      WHERE d.owner_user_id = auth.uid()
    ) AND
    -- Only allow deletion within 24 hours of creation
    created_at > NOW() - INTERVAL '24 hours'
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
    AND tablename = 'dealer_ratings'
ORDER BY policyname;

-- Test query to verify all dealers can see all ratings with reviewer names
-- This should return all ratings with dealer names
SELECT 
    dr.id,
    dr.overall,
    dr.communication,
    dr.vehicle_condition,
    dr.professionalism,
    dr.transaction_experience,
    dr.comment,
    dr.created_at,
    -- Reviewer (rater) information
    rater_dealer.name as reviewer_name,
    rater_dealer.business_name as reviewer_business,
    rater_dealer.city as reviewer_city,
    -- Rated dealer information
    rated_dealer.name as rated_dealer_name,
    rated_dealer.business_name as rated_dealer_business,
    rated_dealer.city as rated_dealer_city
FROM dealer_ratings dr
JOIN dealers rater_dealer ON dr.rater_dealer_id = rater_dealer.id
JOIN dealers rated_dealer ON dr.rated_dealer_id = rated_dealer.id
ORDER BY dr.created_at DESC
LIMIT 10;

-- Test query to verify rating aggregation still works
SELECT 
    d.id,
    d.name,
    d.business_name,
    d.city,
    d.rating_avg,
    d.rating_count,
    COUNT(dr.id) as actual_rating_count,
    ROUND(AVG(dr.overall)::numeric, 2) as calculated_avg
FROM dealers d
LEFT JOIN dealer_ratings dr ON d.id = dr.rated_dealer_id
GROUP BY d.id, d.name, d.business_name, d.city, d.rating_avg, d.rating_count
HAVING d.rating_count > 0
ORDER BY d.rating_avg DESC
LIMIT 10;

-- ==============================================
-- SUMMARY
-- ==============================================

/*
This migration fixes the dealer ratings visibility issue by:

1. **Removing restrictive policies** that were preventing dealers from seeing reviews
2. **Adding transparent policies** that allow all authenticated dealers to see all ratings and reviews
3. **Including reviewer information** so dealers can see who wrote each review
4. **Maintaining security** by only allowing dealers to rate dealers they've transacted with
5. **Allowing corrections** within 24 hours of rating creation

Key improvements:
- All dealers can now see all reviews and comments
- All dealers can see the name of who wrote each review
- Overall ratings are still calculated and displayed
- System maintains transaction-based rating integrity
- Prevents rating abuse with time limits on updates/deletions

The rating system is now fully transparent while maintaining security.
*/
