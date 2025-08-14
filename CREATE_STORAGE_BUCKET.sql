-- Create documents storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/*', 'application/pdf']
);

-- Create storage policies for the documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own documents
CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Allow authenticated users to update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Success message
SELECT 'Documents storage bucket created successfully!' as status;
