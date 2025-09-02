-- Create vehicle_documents table if it doesn't exist
-- This ensures the table structure is correct for document uploads

BEGIN;

-- Create vehicle_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document identification
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(100),
  
  -- Vehicle relationship
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- OCR and verification data
  ocr_data JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint for document_type
ALTER TABLE vehicle_documents 
DROP CONSTRAINT IF EXISTS vehicle_documents_document_type_check;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_document_type ON vehicle_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_uploaded_at ON vehicle_documents(uploaded_at);

-- Add RLS policies
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents for vehicles they have access to
CREATE POLICY "Users can view vehicle documents" ON vehicle_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN dealers d ON v.dealer_id = d.id
    WHERE v.id = vehicle_documents.vehicle_id
    AND d.created_by = auth.jwt() ->> 'email'
  )
);

-- Policy: Users can insert documents for vehicles they have access to
CREATE POLICY "Users can insert vehicle documents" ON vehicle_documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN dealers d ON v.dealer_id = d.id
    WHERE v.id = vehicle_documents.vehicle_id
    AND d.created_by = auth.jwt() ->> 'email'
  )
);

-- Policy: Users can update documents for vehicles they have access to
CREATE POLICY "Users can update vehicle documents" ON vehicle_documents
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN dealers d ON v.dealer_id = d.id
    WHERE v.id = vehicle_documents.vehicle_id
    AND d.created_by = auth.jwt() ->> 'email'
  )
);

-- Policy: Users can delete documents for vehicles they have access to
CREATE POLICY "Users can delete vehicle documents" ON vehicle_documents
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM vehicles v
    JOIN dealers d ON v.dealer_id = d.id
    WHERE v.id = vehicle_documents.vehicle_id
    AND d.created_by = auth.jwt() ->> 'email'
  )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_documents_updated_at 
  BEFORE UPDATE ON vehicle_documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Success message
SELECT 'Vehicle documents table created/updated successfully!' as status;
