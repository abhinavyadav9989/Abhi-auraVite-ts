-- Fix vehicle_documents document_type constraint
-- This migration fixes the check constraint violation for document types

BEGIN;

-- First, let's check if the constraint exists and what it currently allows
DO $$
BEGIN
  -- Check if the constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vehicle_documents_document_type_check' 
    AND table_name = 'vehicle_documents'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE vehicle_documents DROP CONSTRAINT vehicle_documents_document_type_check;
    RAISE NOTICE 'Dropped existing document_type check constraint';
  ELSE
    RAISE NOTICE 'No existing document_type check constraint found';
  END IF;
END $$;

-- Now add a new constraint that allows the document types we're actually using
ALTER TABLE vehicle_documents 
ADD CONSTRAINT vehicle_documents_document_type_check 
CHECK (document_type IN (
  'rc',                    -- Registration Certificate
  'insurance',             -- Insurance
  'puc',                   -- Pollution Under Control
  'service_records',       -- Service Records
  'inspection_report',     -- Inspection Report
  'fitness_certificate',   -- Fitness Certificate
  'permit',                -- Permit
  'noc',                   -- No Objection Certificate
  'other'                  -- Other documents
));

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT vehicle_documents_document_type_check ON vehicle_documents 
IS 'Ensures document_type contains valid document categories for vehicle documentation';

-- Verify the constraint was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vehicle_documents_document_type_check' 
    AND table_name = 'vehicle_documents'
  ) THEN
    RAISE NOTICE 'Successfully added new document_type check constraint';
  ELSE
    RAISE EXCEPTION 'Failed to add document_type check constraint';
  END IF;
END $$;

COMMIT;

-- Success message
SELECT 'Vehicle documents document_type constraint fixed successfully!' as status;
