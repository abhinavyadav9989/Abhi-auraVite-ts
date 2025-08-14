-- Fix Function Overload Issue
-- Run this in your Supabase SQL Editor

-- 1. Drop all existing versions of the function
DROP FUNCTION IF EXISTS update_onboarding_progress(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS update_onboarding_progress(UUID, TEXT, JSONB, INTEGER);

-- 2. Create a single, clear version of the function
CREATE OR REPLACE FUNCTION update_onboarding_progress(
  p_dealer_id UUID,
  p_step TEXT,
  p_data JSONB,
  p_current_step INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE dealers 
  SET 
    onboarding_progress = onboarding_progress || jsonb_build_object(p_step, p_data),
    current_onboarding_step = COALESCE(p_current_step, current_onboarding_step),
    onboarding_started_at = COALESCE(onboarding_started_at, NOW()),
    updated_at = NOW()
  WHERE id = p_dealer_id;
  
  -- Log the action
  PERFORM log_onboarding_action(p_dealer_id, 'progress_update', p_step, NULL, p_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verify the function was created correctly
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_onboarding_progress';

-- Success message
SELECT 'Function overload issue fixed!' as status;
