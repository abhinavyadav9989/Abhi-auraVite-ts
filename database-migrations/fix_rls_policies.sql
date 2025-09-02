-- Fix RLS Policies for Tier System
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on subscription_usage table
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for subscription_usage table
CREATE POLICY "Users can view their own subscription usage" ON subscription_usage
    FOR SELECT
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own subscription usage" ON subscription_usage
    FOR INSERT
    WITH CHECK (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own subscription usage" ON subscription_usage
    FOR UPDATE
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

-- 3. Enable RLS on branches table
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for branches table
CREATE POLICY "Users can view their own branches" ON branches
    FOR SELECT
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own branches" ON branches
    FOR INSERT
    WITH CHECK (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own branches" ON branches
    FOR UPDATE
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own branches" ON branches
    FOR DELETE
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

-- 5. Enable RLS on dealer_subscriptions table (if it exists)
ALTER TABLE dealer_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for dealer_subscriptions table
CREATE POLICY "Users can view their own dealer subscriptions" ON dealer_subscriptions
    FOR SELECT
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own dealer subscriptions" ON dealer_subscriptions
    FOR INSERT
    WITH CHECK (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own dealer subscriptions" ON dealer_subscriptions
    FOR UPDATE
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

-- 7. Enable RLS on subscription_plans table (if it exists)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy for subscription_plans table (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view subscription plans" ON subscription_plans
    FOR SELECT
    TO authenticated
    USING (true);

-- 9. Enable RLS on tier_changes table (if it exists)
ALTER TABLE tier_changes ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policy for tier_changes table
CREATE POLICY "Users can view their own tier changes" ON tier_changes
    FOR SELECT
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own tier changes" ON tier_changes
    FOR INSERT
    WITH CHECK (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

-- 11. Enable RLS on feature_access_logs table (if it exists)
ALTER TABLE feature_access_logs ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policy for feature_access_logs table
CREATE POLICY "Users can view their own feature access logs" ON feature_access_logs
    FOR SELECT
    USING (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own feature access logs" ON feature_access_logs
    FOR INSERT
    WITH CHECK (
        dealer_id IN (
            SELECT id FROM dealers 
            WHERE created_by = auth.jwt() ->> 'email'
            OR owner_user_id = auth.uid()
        )
    );

-- 13. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON subscription_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dealer_subscriptions TO authenticated;
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT, INSERT ON tier_changes TO authenticated;
GRANT SELECT, INSERT ON feature_access_logs TO authenticated;

-- 14. Grant usage on sequences (if they exist)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
