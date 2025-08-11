# Supabase Migration Guide

## **IMPORTANT: Run this SQL script in your Supabase dashboard**

The console errors show 400 status errors when trying to save data to Supabase. This is because the database tables and Row Level Security (RLS) policies are not properly configured.

## **Steps to Fix:**

### 1. Go to your Supabase Dashboard
- Open your Supabase project at: https://supabase.com/dashboard
- Navigate to your project: `uyahditchuyudbpphfry`

### 2. Run the SQL Migration
- Go to **SQL Editor** in the left sidebar
- Click **New Query**
- Copy the entire contents of `SUPABASE_MIGRATION_SAFE.sql`
- Paste it into the SQL editor
- Click **Run** to execute the script

### 3. What this script does:
- Creates missing tables (if they don't exist)
- Adds missing columns to existing tables
- Sets up proper Row Level Security (RLS) policies
- Creates necessary indexes
- Sets up storage buckets and policies

### 4. Verify the migration:
After running the script, you should see:
- No errors in the SQL execution
- Tables created/updated successfully
- RLS policies applied

### 5. Test the application:
- Refresh your application
- Try the onboarding flow again
- Check the console for any remaining errors

## **Key Issues Fixed:**

1. **RLS Policies**: The original policies were using `owner_user_id` but the actual table uses `created_by`
2. **Missing Tables**: Some tables referenced in the code didn't exist
3. **Column Mismatches**: The policies were checking for columns that didn't exist
4. **Authentication Context**: Fixed how the policies check for user authentication

## **If you still see errors:**
1. Check the console logs for specific table names causing issues
2. Verify that all tables exist in your Supabase dashboard
3. Check that RLS is enabled on all tables
4. Ensure your environment variables are correct

The debugging logs I added will help identify exactly which operations are failing.
