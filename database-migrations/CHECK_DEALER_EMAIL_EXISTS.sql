-- Drop the existing function first
DROP FUNCTION IF EXISTS public.check_dealer_email_exists(TEXT);

-- Function to check if email exists in dealers table
-- This function safely checks email existence in the public dealers table
CREATE OR REPLACE FUNCTION public.check_dealer_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
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

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.check_dealer_email_exists(TEXT) TO authenticated, anon;

-- Test the function with the known existing email
SELECT public.check_dealer_email_exists('ravi.abhinavyadav@gmail.com') as test_result;

-- Also test with a non-existing email
SELECT public.check_dealer_email_exists('nonexistent@example.com') as test_result_2;
