-- Create uploads bucket for file storage
-- Run this in your Supabase SQL editor

-- Create the uploads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the uploads bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'uploads' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'uploads' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND 
  auth.role() = 'authenticated'
);

-- Success message
SELECT 'Uploads bucket created successfully!' as status;
