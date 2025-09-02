-- Fix branches RLS policy to allow dealer access
-- This addresses the "permission denied for table branches" error

-- First, let's check if RLS is enabled and drop existing policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_select_scoped') THEN
    DROP POLICY branches_select_scoped ON public.branches;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_write_scoped') THEN
    DROP POLICY branches_write_scoped ON public.branches;
  END IF;
  
  -- Drop any other branches policies that might conflict
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='Users can view their own branches') THEN
    DROP POLICY "Users can view their own branches" ON public.branches;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='Users can insert their own branches') THEN
    DROP POLICY "Users can insert their own branches" ON public.branches;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='Users can update their own branches') THEN
    DROP POLICY "Users can update their own branches" ON public.branches;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='Users can delete their own branches') THEN
    DROP POLICY "Users can delete their own branches" ON public.branches;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='Admins can view all onboarding data') THEN
    DROP POLICY "Admins can view all onboarding data" ON public.branches;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows dealers to access their own branches
-- This uses the dealer's email from auth.jwt() to match with dealers.created_by
CREATE POLICY "Dealers can access their own branches" ON public.branches
FOR ALL
USING (
  dealer_id IN (
    SELECT id FROM public.dealers 
    WHERE created_by = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  dealer_id IN (
    SELECT id FROM public.dealers 
    WHERE created_by = auth.jwt() ->> 'email'
  )
);

-- Also create a fallback policy for admin access
CREATE POLICY "Admins can access all branches" ON public.branches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.dealers 
    WHERE created_by = auth.jwt() ->> 'email' 
    AND (access_level IN ('L6', 'L7') OR role = 'admin')
  )
);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.branches TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to help debug RLS issues
CREATE OR REPLACE FUNCTION debug_branches_access()
RETURNS TABLE (
  user_email TEXT,
  dealer_id UUID,
  dealer_created_by TEXT,
  has_access BOOLEAN,
  policy_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.jwt() ->> 'email' as user_email,
    d.id as dealer_id,
    d.created_by as dealer_created_by,
    (auth.jwt() ->> 'email') = d.created_by as has_access,
    CASE 
      WHEN (auth.jwt() ->> 'email') = d.created_by THEN 'Direct dealer access'
      WHEN d.access_level IN ('L6', 'L7') OR d.role = 'admin' THEN 'Admin access'
      ELSE 'No access'
    END as policy_reason
  FROM public.dealers d
  WHERE d.created_by = auth.jwt() ->> 'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on debug function
GRANT EXECUTE ON FUNCTION debug_branches_access() TO authenticated;
