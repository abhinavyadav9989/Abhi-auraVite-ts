# Supabase Migration Guide

## Overview
This document outlines the migration from Base44 to Supabase while maintaining the same API interface.

## Database Schema Setup

### Required Tables
Create these tables in your Supabase database:

```sql
-- Dealers table
CREATE TABLE dealers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  business_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle assets (images, videos)
CREATE TABLE vehicle_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  buyer_id UUID REFERENCES dealers(id),
  seller_id UUID REFERENCES dealers(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add more tables as needed for other entities...
```

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Edge Functions

Create these Edge Functions in your Supabase project:

### 1. invoke-llm
```typescript
// supabase/functions/invoke-llm/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { prompt, options } = await req.json()
  
  // Integrate with your preferred LLM service
  // Example: OpenAI, Anthropic, etc.
  
  return new Response(
    JSON.stringify({ result: "LLM response" }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

### 2. send-email
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { to, subject, body, options } = await req.json()
  
  // Integrate with your preferred email service
  // Example: SendGrid, Mailgun, etc.
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

### 3. extract-data
```typescript
// supabase/functions/extract-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { fileUrl, options } = await req.json()
  
  // Integrate with OCR/document processing service
  // Example: AWS Textract, Google Vision API, etc.
  
  return new Response(
    JSON.stringify({ extractedData: {} }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

## Storage Buckets

Create these storage buckets:

```sql
-- Create uploads bucket for file storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true);
```

## Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables

-- Example policy for dealers
CREATE POLICY "Dealers can view their own data" ON dealers
  FOR SELECT USING (auth.uid()::text = id::text);
```

## Migration Steps

1. **Setup Supabase Project**
   - Create new Supabase project
   - Copy project URL and anon key
   - Update environment variables

2. **Create Database Schema**
   - Run the SQL commands above
   - Set up RLS policies
   - Create storage buckets

3. **Deploy Edge Functions**
   - Deploy the edge functions
   - Configure external service integrations

4. **Test Migration**
   - Verify all entities work
   - Test authentication
   - Test file uploads
   - Test integrations

5. **Remove Base44 Dependencies**
   - Remove @base44/sdk from package.json
   - Delete old base44Client.ts
   - Clean up unused imports

## Benefits of Migration

- **Better Performance**: Supabase's PostgreSQL backend
- **Real-time Features**: Built-in real-time subscriptions
- **Better Auth**: Supabase Auth with social providers
- **Cost Effective**: Generous free tier
- **Open Source**: Self-hostable if needed
- **Better Developer Experience**: Excellent documentation and tooling
