#!/bin/bash

# Vehicle Documents Storage Bucket Setup Script
# This script helps set up the storage bucket for vehicle documents

set -e

PROJECT_REF="uyahditchuyudbpphfry"
BUCKET_NAME="vehicle-documents"

echo "🚀 Setting up Vehicle Documents Storage Bucket"
echo "Project: $PROJECT_REF"
echo "Bucket: $BUCKET_NAME"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase CLI"
    echo "Please login first:"
    echo "supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase CLI"

# Create the storage bucket
echo "📦 Creating storage bucket: $BUCKET_NAME"
if supabase storage create bucket $BUCKET_NAME --project-ref $PROJECT_REF --public; then
    echo "✅ Storage bucket created successfully"
else
    echo "⚠️  Bucket might already exist or there was an error"
fi

echo ""

# Create storage policies
echo "🔐 Creating storage policies..."

# Upload policy
echo "Creating upload policy..."
supabase storage policy create $BUCKET_NAME "Users can upload documents for their vehicles" \
    --project-ref $PROJECT_REF \
    --insert \
    --role authenticated \
    --definition "(bucket_id = '$BUCKET_NAME'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"

# View policy
echo "Creating view policy..."
supabase storage policy create $BUCKET_NAME "Users can view documents for vehicles they have access to" \
    --project-ref $PROJECT_REF \
    --select \
    --role authenticated \
    --definition "(bucket_id = '$BUCKET_NAME'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"

# Delete policy
echo "Creating delete policy..."
supabase storage policy create $BUCKET_NAME "Users can delete documents for their vehicles" \
    --project-ref $PROJECT_REF \
    --delete \
    --role authenticated \
    --definition "(bucket_id = '$BUCKET_NAME'::text) AND (auth.uid() IN (SELECT tm.user_id FROM team_members tm JOIN vehicles v ON v.dealer_id = tm.dealer_id WHERE v.id::text = (storage.foldername(name))[1]))"

echo "✅ Storage policies created successfully"
echo ""

# Verify the setup
echo "🔍 Verifying setup..."

# Check if bucket exists
if supabase storage list buckets --project-ref $PROJECT_REF | grep -q $BUCKET_NAME; then
    echo "✅ Bucket '$BUCKET_NAME' exists"
else
    echo "❌ Bucket '$BUCKET_NAME' not found"
fi

# Check policies
echo "Checking policies..."
POLICIES=$(supabase storage policy list $BUCKET_NAME --project-ref $PROJECT_REF 2>/dev/null || echo "")
if echo "$POLICIES" | grep -q "Users can upload documents for their vehicles"; then
    echo "✅ Upload policy exists"
else
    echo "❌ Upload policy missing"
fi

if echo "$POLICIES" | grep -q "Users can view documents for vehicles they have access to"; then
    echo "✅ View policy exists"
else
    echo "❌ View policy missing"
fi

if echo "$POLICIES" | grep -q "Users can delete documents for their vehicles"; then
    echo "✅ Delete policy exists"
else
    echo "❌ Delete policy missing"
fi

echo ""
echo "🎉 Storage bucket setup complete!"
echo ""
echo "Next steps:"
echo "1. Test document upload in the vehicle adding flow"
echo "2. Verify documents are stored correctly"
echo "3. Check permissions work as expected"
echo ""
echo "For manual setup, see: STORAGE_BUCKET_SETUP_INSTRUCTIONS.md"
