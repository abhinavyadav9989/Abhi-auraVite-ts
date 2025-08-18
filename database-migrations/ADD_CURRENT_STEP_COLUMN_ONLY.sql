-- Add current_onboarding_step column to dealers table (only)
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER DEFAULT 1;

-- Update existing dealers to have step 1 as default
UPDATE dealers SET current_onboarding_step = 1 WHERE current_onboarding_step IS NULL;

-- Success message
SELECT 'Current onboarding step column added successfully!' as status;
