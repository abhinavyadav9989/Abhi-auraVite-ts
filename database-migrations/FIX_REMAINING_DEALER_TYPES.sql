-- Fix remaining "dealer" business types to use new format
-- This converts all remaining "dealer" values to "used" as the default mapping

-- Update records that still have "dealer" in JSON format
UPDATE dealers 
SET business_type = '["used"]'
WHERE business_type = '["dealer"]';

-- Also handle any other old formats that might exist
UPDATE dealers 
SET business_type = '["used"]'
WHERE business_type = 'dealer' OR business_type = '"dealer"';

-- Verify the update
SELECT id, business_name, business_type 
FROM dealers 
WHERE business_type IS NOT NULL 
ORDER BY created_at DESC
LIMIT 10;

-- Show summary of business types after update
SELECT 
  business_type,
  COUNT(*) as count
FROM dealers 
WHERE business_type IS NOT NULL 
GROUP BY business_type
ORDER BY count DESC;
