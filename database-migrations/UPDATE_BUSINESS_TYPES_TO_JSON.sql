-- Migration: Update business_type column to support multiple business types as JSON
-- This allows organizations to have multiple business types: used, new, service

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dealers' AND column_name = 'business_type';

-- Update the business_type column to be more flexible for JSON storage
-- Note: PostgreSQL's TEXT type can store JSON strings
-- We'll keep it as TEXT but update existing data to JSON format

-- Convert existing single business types to JSON array format
UPDATE dealers 
SET business_type = CASE 
  WHEN business_type IS NULL OR business_type = '' THEN NULL
  WHEN business_type = 'dealer_single' THEN '["used"]'
  WHEN business_type = 'dealer_network' THEN '["used"]'
  WHEN business_type = 'franchise_dealer' THEN '["new"]'
  WHEN business_type = 'multi_brand_dealer' THEN '["used", "new"]'
  WHEN business_type = 'park_and_sell' THEN '["used"]'
  WHEN business_type = 'auctions' THEN '["used"]'
  ELSE CONCAT('["', business_type, '"]')
END
WHERE business_type IS NOT NULL AND business_type != '';

-- Add a comment to the column to document the new format
COMMENT ON COLUMN dealers.business_type IS 'JSON array of business types: ["used", "new", "service"]. Examples: ["used"], ["new"], ["used", "new"], ["service"], ["used", "new", "service"]';

-- Verify the update
SELECT id, business_name, business_type 
FROM dealers 
WHERE business_type IS NOT NULL 
LIMIT 5;
