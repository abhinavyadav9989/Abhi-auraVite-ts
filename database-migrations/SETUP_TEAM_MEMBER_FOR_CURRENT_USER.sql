-- Setup team member record for current user to fix RLS policies
-- This ensures the current user has proper access to branches and other tables

-- Function to setup team member for current user
CREATE OR REPLACE FUNCTION setup_current_user_team_member()
RETURNS BOOLEAN AS $$
DECLARE
  current_user_email TEXT;
  dealer_record RECORD;
  team_member_record RECORD;
BEGIN
  -- Get current user email
  current_user_email := auth.jwt() ->> 'email';
  
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;
  
  -- Find the dealer record for this user
  SELECT * INTO dealer_record 
  FROM public.dealers 
  WHERE created_by = current_user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No dealer record found for user: %', current_user_email;
  END IF;
  
  -- Check if team member record already exists
  SELECT * INTO team_member_record 
  FROM public.team_members 
  WHERE email = current_user_email AND dealer_id = dealer_record.id;
  
  -- If team member doesn't exist, create one
  IF NOT FOUND THEN
    INSERT INTO public.team_members (
      dealer_id,
      email,
      role,
      status,
      invited_at,
      joined_at,
      created_at
    ) VALUES (
      dealer_record.id,
      current_user_email,
      'owner', -- Default to owner role for the person who created the dealer
      'active',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created team member record for user: % with dealer_id: %', current_user_email, dealer_record.id;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Team member record already exists for user: %', current_user_email;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION setup_current_user_team_member() TO authenticated;

-- Function to get current user's team member info
CREATE OR REPLACE FUNCTION get_current_user_team_member()
RETURNS TABLE (
  team_member_id UUID,
  dealer_id UUID,
  email TEXT,
  role TEXT,
  status TEXT,
  dealer_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id as team_member_id,
    tm.dealer_id,
    tm.email,
    tm.role,
    tm.status,
    d.business_name as dealer_name
  FROM public.team_members tm
  JOIN public.dealers d ON tm.dealer_id = d.id
  WHERE tm.email = auth.jwt() ->> 'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_team_member() TO authenticated;

-- Function to debug current user's access
CREATE OR REPLACE FUNCTION debug_current_user_access()
RETURNS TABLE (
  user_email TEXT,
  dealer_id UUID,
  dealer_name TEXT,
  team_member_id UUID,
  team_member_role TEXT,
  team_member_status TEXT,
  has_branches_access BOOLEAN,
  branches_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.jwt() ->> 'email' as user_email,
    d.id as dealer_id,
    d.business_name as dealer_name,
    tm.id as team_member_id,
    tm.role as team_member_role,
    tm.status as team_member_status,
    CASE WHEN tm.id IS NOT NULL THEN TRUE ELSE FALSE END as has_branches_access,
    COUNT(b.id)::INTEGER as branches_count
  FROM public.dealers d
  LEFT JOIN public.team_members tm ON tm.dealer_id = d.id AND tm.email = auth.jwt() ->> 'email'
  LEFT JOIN public.branches b ON b.dealer_id = d.id
  WHERE d.created_by = auth.jwt() ->> 'email'
  GROUP BY d.id, d.business_name, tm.id, tm.role, tm.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_current_user_access() TO authenticated;
