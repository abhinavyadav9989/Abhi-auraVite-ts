-- =====================================================
-- ADD BRANCH_ID TO VEHICLES TABLE
-- =====================================================

-- Add branch_id column to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON vehicles(branch_id);

-- Update existing vehicles to have a default branch if dealer has branches
UPDATE vehicles 
SET branch_id = (
  SELECT b.id 
  FROM branches b 
  WHERE b.dealer_id = vehicles.dealer_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE branch_id IS NULL 
AND dealer_id IN (SELECT DISTINCT dealer_id FROM branches);

-- Verify the change
SELECT 'Vehicles table structure after adding branch_id:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;
