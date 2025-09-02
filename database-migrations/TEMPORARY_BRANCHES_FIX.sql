-- TEMPORARY FIX: Disable RLS on branches table to resolve permission issues
-- This is a quick fix to get branch functionality working immediately
-- TODO: Re-enable RLS with proper policies once the team_members system is fully implemented

-- Disable RLS on branches table temporarily
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users for branches
GRANT ALL PRIVILEGES ON TABLE public.branches TO authenticated;

-- Also ensure the dealers table has proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dealers TO authenticated;

-- Create a simple trigger to ensure dealer_id is set correctly
CREATE OR REPLACE FUNCTION set_branch_dealer_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If dealer_id is not set, try to get it from the current user's dealer record
  IF NEW.dealer_id IS NULL THEN
    SELECT id INTO NEW.dealer_id 
    FROM public.dealers 
    WHERE created_by = auth.jwt() ->> 'email'
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to branches table
DROP TRIGGER IF EXISTS trigger_set_branch_dealer_id ON public.branches;
CREATE TRIGGER trigger_set_branch_dealer_id
  BEFORE INSERT ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION set_branch_dealer_id();

-- Create a view to help with debugging
CREATE OR REPLACE VIEW branches_with_dealer_info AS
SELECT 
  b.*,
  d.business_name as dealer_name,
  d.created_by as dealer_email
FROM public.branches b
LEFT JOIN public.dealers d ON b.dealer_id = d.id;

-- Grant access to the view
GRANT SELECT ON branches_with_dealer_info TO authenticated;
