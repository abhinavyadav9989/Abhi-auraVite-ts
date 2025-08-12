-- Create Admin Dealer and Set Admin Role
-- Run this in your Supabase SQL Editor

-- Step 1: Create dealer record for ravi.abhinavyadav@gmail.com
INSERT INTO dealers (
  name,
  email,
  business_name,
  owner_name,
  phone,
  address,
  city,
  state,
  business_type,
  verification_status,
  onboarding_completed,
  created_by,
  status
) VALUES (
  'Ravi Abhinav Yadav',
  'ravi.abhinavyadav@gmail.com',
  'Ravi Motors',
  'Ravi Abhinav Yadav',
  '+91-9876543210',
  'Mumbai, Maharashtra',
  'Mumbai',
  'Maharashtra',
  'dealership',
  'verified',
  true,
  'ravi.abhinavyadav@gmail.com',
  'active'
);

-- Step 2: Update the user's role to admin in auth.users
-- Note: This requires service_role access or direct database access
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'ravi.abhinavyadav@gmail.com';

-- Step 3: Also update the user_metadata for consistency
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'ravi.abhinavyadav@gmail.com';

-- Step 4: Verify the changes
SELECT 
  email,
  raw_user_meta_data->>'role' as role_from_raw,
  user_metadata->>'role' as role_from_metadata
FROM auth.users 
WHERE email = 'ravi.abhinavyadav@gmail.com';

-- Step 5: Check dealer record
SELECT 
  name,
  email,
  business_name,
  verification_status,
  onboarding_completed
FROM dealers 
WHERE email = 'ravi.abhinavyadav@gmail.com';
