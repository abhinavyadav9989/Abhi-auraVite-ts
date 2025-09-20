-- Fix all remaining business type formats to use the new standard
-- Convert old formats to new business types: used, new, service

-- Update "individual" to "used" (individual dealers typically deal in used vehicles)
UPDATE dealers 
SET business_type = '["used"]'
WHERE business_type = '["individual"]';

-- Update "both" to "used" and "new" (both new and used vehicles)
UPDATE dealers 
SET business_type = '["used", "new"]'
WHERE business_type = '["both"]';

-- Handle any other potential old formats
UPDATE dealers 
SET business_type = '["used"]'
WHERE business_type = 'individual' OR business_type = '"individual"';

UPDATE dealers 
SET business_type = '["used", "new"]'
WHERE business_type = 'both' OR business_type = '"both"';

-- Verify the update
SELECT 
  business_type,
  COUNT(*) as count
FROM dealers 
WHERE business_type IS NOT NULL 
GROUP BY business_type
ORDER BY count DESC;

-- Show sample records after update
SELECT id, business_name, business_type 
FROM dealers 
WHERE business_type IS NOT NULL 
ORDER BY created_at DESC
LIMIT 10;
