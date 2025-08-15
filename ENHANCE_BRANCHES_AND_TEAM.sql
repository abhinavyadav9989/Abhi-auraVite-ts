-- Enhance Branches and Team Members Tables
-- This script adds new fields to support enhanced onboarding data

-- 1. Update branches table to ensure working_hours column exists and is properly structured
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}';

-- Add comment to explain the working_hours structure
COMMENT ON COLUMN branches.working_hours IS 'JSONB object with day numbers (0-6) as keys and {isOpen: boolean, openTime: string, closeTime: string} as values';

-- 2. Update team_members table to add new fields
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(12);

-- Add comments to explain the new fields
COMMENT ON COLUMN team_members.full_name IS 'Full name of the team member';
COMMENT ON COLUMN team_members.email IS 'Email address of the team member';
COMMENT ON COLUMN team_members.mobile_number IS 'Mobile phone number of the team member';
COMMENT ON COLUMN team_members.aadhar_number IS '12-digit Aadhar number of the team member';

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_mobile ON team_members(mobile_number);
CREATE INDEX IF NOT EXISTS idx_team_members_aadhar ON team_members(aadhar_number);

-- 4. Add constraints for data validation (using DO block to handle existing constraints)
DO $$
BEGIN
    -- Add Aadhar length constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_aadhar_length'
    ) THEN
        ALTER TABLE team_members 
        ADD CONSTRAINT check_aadhar_length 
        CHECK (aadhar_number IS NULL OR length(aadhar_number) = 12);
    END IF;

    -- Add mobile length constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_mobile_length'
    ) THEN
        ALTER TABLE team_members 
        ADD CONSTRAINT check_mobile_length 
        CHECK (mobile_number IS NULL OR length(mobile_number) >= 10);
    END IF;
END $$;

-- 5. Update existing records to have default values
UPDATE team_members 
SET full_name = COALESCE(full_name, 'Unknown Member')
WHERE full_name IS NULL;

-- 6. Verify the changes
SELECT 
    'branches' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'branches' 
AND column_name IN ('working_hours')
UNION ALL
SELECT 
    'team_members' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'team_members' 
AND column_name IN ('full_name', 'email', 'mobile_number', 'aadhar_number')
ORDER BY table_name, column_name;

-- 7. Show sample data structure for working_hours
SELECT 
    'Sample working_hours structure:' as info,
    '{
        "0": {"isOpen": false, "openTime": "09:00", "closeTime": "18:00"},
        "1": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
        "2": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
        "3": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
        "4": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
        "5": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
        "6": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"}
    }' as example;
