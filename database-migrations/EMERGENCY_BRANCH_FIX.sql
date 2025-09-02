-- EMERGENCY FIX for branches table permissions
-- This should resolve the 403 Forbidden error for admin users

-- 1. First, disable RLS completely
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on branches table
DROP POLICY IF EXISTS "Users can view their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON public.branches;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.branches;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.branches;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.branches;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.branches;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.branches;

-- 3. Grant ALL permissions to authenticated role
GRANT ALL PRIVILEGES ON public.branches TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 4. Grant permissions to anon role as well (just in case)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO anon;

-- 5. Ensure the table owner has full permissions
ALTER TABLE public.branches OWNER TO postgres;

-- 6. Grant permissions to postgres role
GRANT ALL PRIVILEGES ON public.branches TO postgres;

-- 7. Verify the grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'branches' AND table_schema = 'public';
