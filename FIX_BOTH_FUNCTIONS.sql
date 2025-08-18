-- Fix both functions to ensure they work correctly

-- 1. Drop and recreate the main function
DROP FUNCTION IF EXISTS public.check_dealer_email_exists(TEXT);

CREATE OR REPLACE FUNCTION public.check_dealer_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- Count how many records exist with this email
  SELECT COUNT(*) INTO email_count
  FROM dealers 
  WHERE email = email_to_check;
  
  -- Return true if count > 0, false otherwise
  RETURN email_count > 0;
END;
$$;

-- 2. Drop and recreate the simple function
DROP FUNCTION IF EXISTS public.check_email_simple(TEXT);

CREATE OR REPLACE FUNCTION public.check_email_simple(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM dealers 
    WHERE email = email_to_check
  );
$$;

-- 3. Grant execute permissions to both functions
GRANT EXECUTE ON FUNCTION public.check_dealer_email_exists(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_email_simple(TEXT) TO authenticated, anon;

-- 4. Test both functions
SELECT 'Main function test:' as test_type, public.check_dealer_email_exists('ravi.abhinavyadav@gmail.com') as result;
SELECT 'Simple function test:' as test_type, public.check_email_simple('ravi.abhinavyadav@gmail.com') as result;

-- 5. Test with non-existing email
SELECT 'Main function (non-existing):' as test_type, public.check_dealer_email_exists('nonexistent@example.com') as result;
SELECT 'Simple function (non-existing):' as test_type, public.check_email_simple('nonexistent@example.com') as result;
