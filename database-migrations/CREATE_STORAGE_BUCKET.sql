-- Create vehicle-documents storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-documents',
  'vehicle-documents',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/*', 'application/pdf']
);

-- Create storage policies for the vehicle-documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload vehicle documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own documents
CREATE POLICY "Allow authenticated users to view vehicle documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'vehicle-documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Allow authenticated users to update vehicle documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Allow authenticated users to delete vehicle documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-documents' AND 
  auth.role() = 'authenticated'
);

-- Success message
SELECT 'Vehicle documents storage bucket created successfully!' as status;
