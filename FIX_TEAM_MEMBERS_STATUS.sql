-- Fix Team Members Table - Add Missing Status Column
-- This script adds the missing status column that's causing the error

-- 1. Add the missing status column
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- 2. Add comment to explain the status column
COMMENT ON COLUMN team_members.status IS 'Status of the team member: pending, active, inactive';

-- 3. Update existing records to have a default status
UPDATE team_members 
SET status = 'pending'
WHERE status IS NULL;

-- 4. Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'team_members' 
AND column_name = 'status';

-- 5. Show current team_members table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;
