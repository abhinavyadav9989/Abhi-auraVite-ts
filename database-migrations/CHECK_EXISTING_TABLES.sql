-- Check all existing tables and their structures
-- Run this in your Supabase SQL Editor to understand the current database schema

-- 1. List all tables in the public schema
SELECT '=== ALL TABLES IN PUBLIC SCHEMA ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

output:

[
  {
    "table_name": "app_configs",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "audit_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "bank_accounts",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "bank_details",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "branches",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_documents",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_hours",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_inquiries",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_preferences",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_reviews",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealers",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "logistics_orders",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "onboarding_audit_log",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "payments",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "rto_applications",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "shortlists",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "team_members",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "transactions",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "user_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "vehicle_assets",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "vehicle_inspections",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "vehicles",
    "table_type": "BASE TABLE"
  }
]

-- 2. Check dealers table structure
SELECT '=== DEALERS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'dealers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

output:
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "character_maximum_length": null
  },
  {
    "column_name": "owner_user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "business_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "column_name": "created_by",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "onboarding_completed",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "onboarding_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'active'::text",
    "character_maximum_length": null
  },
  {
    "column_name": "business_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "client_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "contact_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "city",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "state",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "owner_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "gstin",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "pan_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "whatsapp",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "tagline",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "website",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "logo_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "banner_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "verification_status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'pending'::text",
    "character_maximum_length": null
  },
  {
    "column_name": "submitted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "subscription_plan",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "verification_notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "pincode",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "email_verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "phone_verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "kyb_completed",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "kyb_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "bank_details",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "payment_methods",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "business_hours",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "specializations",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "certifications",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "rating",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "total_reviews",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0",
    "character_maximum_length": null
  },
  {
    "column_name": "total_vehicles",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0",
    "character_maximum_length": null
  },
  {
    "column_name": "total_sales",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0",
    "character_maximum_length": null
  },
  {
    "column_name": "is_featured",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "is_verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "is_premium",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "draft_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "verified_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "verified_by",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "user_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "access_level",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": "'L1'::access_level",
    "character_maximum_length": null
  },
  {
    "column_name": "onboarding_progress",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "character_maximum_length": null
  },
  {
    "column_name": "business_mode",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "verification_status_new",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'pending'::character varying",
    "character_maximum_length": 20
  },
  {
    "column_name": "plan_selection",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "consent_receipt",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "onboarding_started_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "onboarding_completed_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "current_onboarding_step",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1",
    "character_maximum_length": null
  }
]

-- 3. Check dealer_documents table structure
SELECT '=== DEALER_DOCUMENTS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'dealer_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

output:
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "character_maximum_length": null
  },
  {
    "column_name": "dealer_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "document_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "file_url",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "file_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'pending_review'::text",
    "character_maximum_length": null
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "column_name": "file_size",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "column_name": "file_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "rejection_reason",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  }
]

-- 4. Check bank_details table structure
SELECT '=== BANK_DETAILS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'bank_details' 
AND table_schema = 'public'
ORDER BY ordinal_position;

output:
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "character_maximum_length": null
  },
  {
    "column_name": "dealer_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "account_holder_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": 255
  },
  {
    "column_name": "account_number",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": 50
  },
  {
    "column_name": "ifsc_code",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": 20
  },
  {
    "column_name": "bank_name",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 255
  },
  {
    "column_name": "cancelled_cheque_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "column_name": "is_verified",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false",
    "character_maximum_length": null
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  }
]

-- 5. Check if there are any other related tables
SELECT '=== OTHER RELATED TABLES ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND (
    table_name LIKE '%dealer%' OR 
    table_name LIKE '%bank%' OR 
    table_name LIKE '%document%' OR
    table_name LIKE '%kyb%' OR
    table_name LIKE '%onboarding%'
)
ORDER BY table_name;

output:
[
  {
    "table_name": "bank_accounts",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "bank_details",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_documents",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_hours",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_inquiries",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_preferences",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealer_reviews",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "dealers",
    "table_type": "BASE TABLE"
  },
  {
    "table_name": "onboarding_audit_log",
    "table_type": "BASE TABLE"
  }
]

-- 6. Check sample data in dealers table
SELECT '=== SAMPLE DEALERS DATA ===' as info;
SELECT 
    id,
    name,
    email,
    created_by,
    onboarding_completed,
    verification_status_new,
    user_type,
    access_level,
    created_at
FROM dealers 
LIMIT 5;

output:
[
  {
    "id": "2d579638-0ae5-450c-922b-ab8dfe42848f",
    "name": "polova1469",
    "email": "polova1469@blaxion.com",
    "created_by": "polova1469@blaxion.com",
    "onboarding_completed": false,
    "verification_status_new": "pending",
    "user_type": "individual_org",
    "access_level": "L1",
    "created_at": "2025-08-11 10:34:27.873847+00"
  },
  {
    "id": "3f234aa4-6407-47a3-aac3-69b250f3f05c",
    "name": "waforox261",
    "email": "waforox261@bizmud.com",
    "created_by": "waforox261@bizmud.com",
    "onboarding_completed": false,
    "verification_status_new": "documents_submitted",
    "user_type": "individual_org",
    "access_level": "L1",
    "created_at": "2025-08-11 11:15:25.356296+00"
  },
  {
    "id": "e9684e73-a0b1-4f27-8873-d1d70ddf6880",
    "name": "lemonat729",
    "email": "lemonat729@bizmud.com",
    "created_by": "lemonat729@bizmud.com",
    "onboarding_completed": false,
    "verification_status_new": "pending",
    "user_type": "individual_org",
    "access_level": "L1",
    "created_at": "2025-08-12 06:07:49.791584+00"
  },
  {
    "id": "fa46117b-3519-4d50-ab8c-9f8c4ff76179",
    "name": "nohah81124",
    "email": "nohah81124@blaxion.com",
    "created_by": "nohah81124@blaxion.com",
    "onboarding_completed": true,
    "verification_status_new": "documents_submitted",
    "user_type": "individual_org",
    "access_level": "L1",
    "created_at": "2025-08-12 05:57:49.118051+00"
  },
  {
    "id": "a6ff94a2-2213-45d5-9a33-388201694f5c",
    "name": "gohirem942",
    "email": "gohirem942@blaxion.com",
    "created_by": "gohirem942@blaxion.com",
    "onboarding_completed": true,
    "verification_status_new": "verified",
    "user_type": "individual_org",
    "access_level": "L3",
    "created_at": "2025-08-12 07:24:11.392676+00"
  }
]

-- 7. Check sample data in dealer_documents table
SELECT '=== SAMPLE DEALER_DOCUMENTS DATA ===' as info;
SELECT 
    id,
    dealer_id,
    document_type,
    file_url,
    file_name,
    status,
    created_at
FROM dealer_documents 
LIMIT 5;

output:
[
  {
    "id": "3a8faf6b-4306-426a-ac76-eef6bcb65c0d",
    "dealer_id": "6f8006c7-d926-4736-98fd-90e8df0f218a",
    "document_type": "cancelled_cheque",
    "file_url": "https://uyahditchuyudbpphfry.supabase.co/storage/v1/object/public/uploads/uploads/1754993727083_cancelled%20cheque.jpg",
    "file_name": "cancelled cheque.jpg",
    "status": "pending_review",
    "created_at": "2025-08-12 10:16:26.897743+00"
  },
  {
    "id": "e82e8b8a-ff17-4606-886d-0a9ee3ca3e05",
    "dealer_id": "fa46117b-3519-4d50-ab8c-9f8c4ff76179",
    "document_type": "trade_licence",
    "file_url": "https://uyahditchuyudbpphfry.supabase.co/storage/v1/object/public/uploads/uploads/1754995597577_pan.jpg",
    "file_name": "pan.jpg",
    "status": "pending",
    "created_at": "2025-08-12 10:46:38.192719+00"
  },
  {
    "id": "9a0010f5-05c0-4bf9-b62e-6c0f857861d2",
    "dealer_id": "fa46117b-3519-4d50-ab8c-9f8c4ff76179",
    "document_type": "gst_certificate",
    "file_url": "https://uyahditchuyudbpphfry.supabase.co/storage/v1/object/public/uploads/uploads/1754995607506_pan.jpg",
    "file_name": "pan.jpg",
    "status": "pending",
    "created_at": "2025-08-12 10:46:47.730215+00"
  },
  {
    "id": "2b9e03bb-f7e3-43af-83d8-a300f919f9f7",
    "dealer_id": "fa46117b-3519-4d50-ab8c-9f8c4ff76179",
    "document_type": "pan_card",
    "file_url": "https://uyahditchuyudbpphfry.supabase.co/storage/v1/object/public/uploads/uploads/1754995614800_pan.jpg",
    "file_name": "pan.jpg",
    "status": "pending",
    "created_at": "2025-08-12 10:46:55.139972+00"
  },
  {
    "id": "9efa7cdd-eff6-4e38-b138-8bdb020d6ebb",
    "dealer_id": "fa46117b-3519-4d50-ab8c-9f8c4ff76179",
    "document_type": "address_proof",
    "file_url": "https://uyahditchuyudbpphfry.supabase.co/storage/v1/object/public/uploads/uploads/1754995621780_pan.jpg",
    "file_name": "pan.jpg",
    "status": "pending",
    "created_at": "2025-08-12 10:47:03.256972+00"
  }
]

-- 8. Check sample data in bank_details table
SELECT '=== SAMPLE BANK_DETAILS DATA ===' as info;
SELECT 
    id,
    dealer_id,
    account_holder_name,
    bank_name,
    is_verified,
    created_at
FROM bank_details 
LIMIT 5;

output:
[
  {
    "info": "=== SAMPLE BANK_DETAILS DATA ==="
  }
]

-- 9. Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('dealers', 'dealer_documents', 'bank_details')
ORDER BY tablename, policyname;

output:
[
  {
    "schemaname": "public",
    "tablename": "bank_details",
    "policyname": "Admins can view all bank details",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM dealers\n  WHERE ((dealers.created_by = (auth.jwt() ->> 'email'::text)) AND (dealers.access_level = ANY (ARRAY['L6'::access_level, 'L7'::access_level])))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "bank_details",
    "policyname": "Users can delete their own bank details",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "bank_details",
    "policyname": "Users can insert their own bank details",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "bank_details",
    "policyname": "Users can update their own bank details",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "bank_details",
    "policyname": "Users can view their own bank details",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealer_documents",
    "policyname": "Admin can view all dealer documents",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((auth.jwt() ->> 'role'::text) = 'admin'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealer_documents",
    "policyname": "Dealers can delete own documents",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealer_documents",
    "policyname": "Dealers can insert own documents",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "dealer_documents",
    "policyname": "Dealers can update own documents",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealer_documents",
    "policyname": "Dealers can view own documents",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(dealer_id IN ( SELECT dealers.id\n   FROM dealers\n  WHERE (dealers.created_by = (auth.jwt() ->> 'email'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Admin can view all dealers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((auth.jwt() ->> 'email'::text) = 'ravi.abhinavyadav@gmail.com'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Anyone can view dealers of public live vehicles or transaction ",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(can_view_dealer_public(id) OR can_view_dealer_transaction(id))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Dealers can delete own data",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(created_by = (auth.jwt() ->> 'email'::text))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Dealers can insert own data",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(created_by = (auth.jwt() ->> 'email'::text))"
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Dealers can update own data",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(created_by = (auth.jwt() ->> 'email'::text))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "dealers",
    "policyname": "Dealers can view own data",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(created_by = (auth.jwt() ->> 'email'::text))",
    "with_check": null
  }
]

-- 10. Check if uploads bucket exists
SELECT '=== STORAGE BUCKETS ===' as info;
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

output:
[
  {
    "id": "uploads",
    "name": "uploads",
    "public": true,
    "file_size_limit": null,
    "allowed_mime_types": null
  }
]

-- 11. Check sample files in uploads bucket
SELECT '=== SAMPLE FILES IN UPLOADS BUCKET ===' as info;
SELECT 
    id,
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'uploads'
LIMIT 5;

output:
[
  {
    "id": "da7178e3-2370-47d0-b266-3306b6aa7ce8",
    "name": "kyb-documents/1754906420144-2023-05-08.png",
    "bucket_id": "uploads",
    "owner": "d6b85df6-8ffd-44f3-b751-48318238c756",
    "created_at": "2025-08-11 10:00:20.409514+00",
    "updated_at": "2025-08-11 10:00:20.409514+00",
    "last_accessed_at": "2025-08-11 10:00:20.409514+00",
    "metadata": {
      "eTag": "\"d4e9114494aa769308bceb82e353a30e\"",
      "size": 552049,
      "mimetype": "image/png",
      "cacheControl": "max-age=3600",
      "lastModified": "2025-08-11T10:00:21.000Z",
      "contentLength": 552049,
      "httpStatusCode": 200
    }
  },
  {
    "id": "0d389c18-6e68-45ce-ba46-904778bb0ed0",
    "name": "uploads/1754994435115_6.png",
    "bucket_id": "uploads",
    "owner": "416c276d-810b-49c3-a3b4-e1cef9dc331e",
    "created_at": "2025-08-12 10:27:15.850675+00",
    "updated_at": "2025-08-12 10:27:15.850675+00",
    "last_accessed_at": "2025-08-12 10:27:15.850675+00",
    "metadata": {
      "eTag": "\"c53dd0c3389136a26cb96e28643a7d7f\"",
      "size": 70483,
      "mimetype": "image/png",
      "cacheControl": "max-age=3600",
      "lastModified": "2025-08-12T10:27:16.000Z",
      "contentLength": 70483,
      "httpStatusCode": 200
    }
  },
  {
    "id": "762cf2a6-7ef8-47be-b298-f8c8053c353a",
    "name": "kyb-documents/1754906430603-2023-05-08.png",
    "bucket_id": "uploads",
    "owner": "d6b85df6-8ffd-44f3-b751-48318238c756",
    "created_at": "2025-08-11 10:00:30.909122+00",
    "updated_at": "2025-08-11 10:00:30.909122+00",
    "last_accessed_at": "2025-08-11 10:00:30.909122+00",
    "metadata": {
      "eTag": "\"d4e9114494aa769308bceb82e353a30e\"",
      "size": 552049,
      "mimetype": "image/png",
      "cacheControl": "max-age=3600",
      "lastModified": "2025-08-11T10:00:31.000Z",
      "contentLength": 552049,
      "httpStatusCode": 200
    }
  },
  {
    "id": "8e09b5e4-7c79-4388-a0d7-fdc39eb99279",
    "name": "uploads/1755065700689_Screenshot 2023-02-02 104433 - Copy.png",
    "bucket_id": "uploads",
    "owner": "ed3614eb-21f7-417e-97b9-9113fb0cdf12",
    "created_at": "2025-08-13 06:14:58.63517+00",
    "updated_at": "2025-08-13 06:14:58.63517+00",
    "last_accessed_at": "2025-08-13 06:14:58.63517+00",
    "metadata": {
      "eTag": "\"c75ec872eb5106bf1af09f7c54d1a434\"",
      "size": 302847,
      "mimetype": "image/png",
      "cacheControl": "max-age=3600",
      "lastModified": "2025-08-13T06:14:59.000Z",
      "contentLength": 302847,
      "httpStatusCode": 200
    }
  },
  {
    "id": "010d8e08-c846-4f4d-bd90-71000cde006e",
    "name": "kyb-documents/1754906442426-2023-03-27.png",
    "bucket_id": "uploads",
    "owner": "d6b85df6-8ffd-44f3-b751-48318238c756",
    "created_at": "2025-08-11 10:00:43.074217+00",
    "updated_at": "2025-08-11 10:00:43.074217+00",
    "last_accessed_at": "2025-08-11 10:00:43.074217+00",
    "metadata": {
      "eTag": "\"2ef866f2dd698a2a41159d8cfe861747\"",
      "size": 1279357,
      "mimetype": "image/png",
      "cacheControl": "max-age=3600",
      "lastModified": "2025-08-11T10:00:43.000Z",
      "contentLength": 1279357,
      "httpStatusCode": 200
    }
  }
]
