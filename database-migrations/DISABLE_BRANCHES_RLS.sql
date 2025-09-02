-- Disable RLS on branches table to allow admin access
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies on branches table
DROP POLICY IF EXISTS "Users can view their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON public.branches;
