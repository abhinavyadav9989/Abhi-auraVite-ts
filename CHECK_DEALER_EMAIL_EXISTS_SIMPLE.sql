-- Simple function to check if email exists in dealers table
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_email_simple(TEXT) TO authenticated, anon;

-- Test the function
SELECT public.check_email_simple('ravi.abhinavyadav@gmail.com') as test_result;
