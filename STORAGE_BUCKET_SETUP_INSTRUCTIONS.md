# Vehicle Documents Storage Bucket Setup Instructions

## Overview
The vehicle documents storage bucket needs to be created in the Supabase dashboard. This document provides step-by-step instructions.

## Step 1: Create the Storage Bucket

### Via Supabase Dashboard
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/uyahditchuyudbpphfry
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `vehicle-documents`
   - **Public bucket**: ✅ **Enable** (so documents can be accessed via URLs)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `application/pdf,image/jpeg,image/jpg,image/png`
5. Click **"Create bucket"**

## Step 2: Create Storage Policies

### Policy 1: Upload Policy
**Name**: `Users can upload documents for their vehicles`

**Policy Type**: INSERT

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'vehicle-documents'::text
) AND (
  auth.uid() IN (
    SELECT tm.user_id 
    FROM team_members tm
    JOIN vehicles v ON v.dealer_id = tm.dealer_id
    WHERE v.id::text = (storage.foldername(name))[1]
  )
)
```

### Policy 2: View Policy
**Name**: `Users can view documents for vehicles they have access to`

**Policy Type**: SELECT

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'vehicle-documents'::text
) AND (
  auth.uid() IN (
    SELECT tm.user_id 
    FROM team_members tm
    JOIN vehicles v ON v.dealer_id = tm.dealer_id
    WHERE v.id::text = (storage.foldername(name))[1]
  )
)
```

### Policy 3: Delete Policy
**Name**: `Users can delete documents for their vehicles`

**Policy Type**: DELETE

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'vehicle-documents'::text
) AND (
  auth.uid() IN (
    SELECT tm.user_id 
    FROM team_members tm
    JOIN vehicles v ON v.dealer_id = tm.dealer_id
    WHERE v.id::text = (storage.foldername(name))[1]
  )
)
```

## Step 3: Alternative - Using Supabase CLI

If you have the Supabase CLI installed, you can create the bucket programmatically:

### Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Create the bucket
```bash
supabase storage create bucket vehicle-documents --project-ref uyahditchuyudbpphfry --public
```

### Create policies via CLI
```bash
# Upload policy
supabase storage policy create vehicle-documents "Users can upload documents for their vehicles" --project-ref uyahditchuyudbpphfry --insert --role authenticated --definition "(bucket_id = 'vehicle-documents'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"

# View policy
supabase storage policy create vehicle-documents "Users can view documents for vehicles they have access to" --project-ref uyahditchuyudbpphfry --select --role authenticated --definition "(bucket_id = 'vehicle-documents'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"

# Delete policy
supabase storage policy create vehicle-documents "Users can delete documents for their vehicles" --project-ref uyahditchuyudbpphfry --delete --role authenticated --definition "(bucket_id = 'vehicle-documents'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"
```

## Step 4: Verify Setup

### Test the bucket creation
```sql
-- Run this in the Supabase SQL editor to verify the bucket exists
SELECT * FROM storage.buckets WHERE name = 'vehicle-documents';
```

### Test the policies
```sql
-- Check if policies are created
SELECT * FROM storage.policies WHERE bucket_id = 'vehicle-documents';
```

## Step 5: Update Frontend Configuration

The frontend code is already configured to use the `vehicle-documents` bucket. The `DocumentUploadService` will automatically use this bucket name.

## File Structure

Documents will be stored in the following structure:
```
vehicle-documents/
├── {vehicle_id}/
│   ├── rc_20241201_143022.pdf
│   ├── insurance_20241201_143045.jpg
│   ├── puc_20241201_143100.png
│   └── service_record_20241201_143115.pdf
```

## Security Considerations

1. **Authentication Required**: Only authenticated users can upload/view/delete documents
2. **Vehicle Ownership**: Users can only access documents for vehicles they own (via team_members table)
3. **File Type Validation**: Only PDF, JPG, PNG files are allowed
4. **File Size Limit**: Maximum 10MB per file
5. **Secure Paths**: File paths include vehicle ID and timestamp for uniqueness

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Ensure the bucket name is exactly `vehicle-documents`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**
   - Verify that storage policies are correctly created
   - Check that the user is authenticated
   - Ensure the user has access to the vehicle (via team_members table)

3. **"File too large" error**
   - Check that the file is under 10MB
   - Verify the bucket's file size limit is set to 10MB

4. **"Invalid file type" error**
   - Ensure the file is PDF, JPG, or PNG
   - Check the bucket's allowed MIME types

### Testing Upload

After setup, you can test the upload functionality:

1. Go to the vehicle adding flow
2. Save a vehicle as draft
3. Go to the Documents step
4. Try uploading a document
5. Check the Supabase Storage dashboard to see the uploaded file

## Next Steps

Once the storage bucket is created:

1. **Test Document Upload**: Try uploading documents in the vehicle adding flow
2. **Verify Permissions**: Test with different user accounts
3. **Monitor Usage**: Check storage usage in the Supabase dashboard
4. **Set Up Monitoring**: Consider setting up alerts for storage usage

The storage bucket setup is now complete and ready for use with the document upload functionality!
