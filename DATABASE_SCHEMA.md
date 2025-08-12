# Base44 Database Schema Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication Tables](#authentication-tables)
3. [Core Business Tables](#core-business-tables)
4. [Transaction Tables](#transaction-tables)
5. [Support Tables](#support-tables)
6. [Configuration Tables](#configuration-tables)
7. [Audit & Logging Tables](#audit--logging-tables)
8. [Relationships](#relationships)
9. [Indexes](#indexes)
10. [Policies](#policies)

## Overview

The Base44 application uses Supabase (PostgreSQL) as its database backend. The schema is designed to support a comprehensive vehicle marketplace platform with dealer management, vehicle inventory, transactions, and customer interactions.

### Database Features
- **Row Level Security (RLS)**: All tables have RLS enabled for data protection
- **Real-time subscriptions**: Support for real-time data updates
- **Full-text search**: Optimized search capabilities
- **JSONB support**: Flexible data storage for complex objects
- **Audit logging**: Comprehensive audit trail for all changes

## Authentication Tables

### auth.users (Supabase Auth)

The main user authentication table managed by Supabase Auth.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key, user ID |
| `email` | `text` | User email address |
| `email_confirmed_at` | `timestamp` | Email confirmation timestamp |
| `phone` | `text` | Phone number |
| `phone_confirmed_at` | `timestamp` | Phone confirmation timestamp |
| `created_at` | `timestamp` | Account creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |
| `last_sign_in_at` | `timestamp` | Last sign-in timestamp |
| `role` | `text` | User role (user, dealer, admin) |
| `metadata` | `jsonb` | Additional user metadata |

#### Indexes
- Primary key on `id`
- Unique index on `email`
- Index on `role`

### user_sessions

Tracks user sessions and activity.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Reference to auth.users |
| `session_token` | `text` | Session token |
| `device_info` | `jsonb` | Device information |
| `ip_address` | `inet` | IP address |
| `user_agent` | `text` | User agent string |
| `created_at` | `timestamp` | Session creation timestamp |
| `expires_at` | `timestamp` | Session expiration timestamp |
| `is_active` | `boolean` | Session active status |

#### Indexes
- Primary key on `id`
- Index on `user_id`
- Index on `session_token`
- Index on `expires_at`

## Core Business Tables

### dealers

Stores dealer information and business details.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Reference to auth.users |
| `business_name` | `text` | Business name |
| `legal_name` | `text` | Legal business name |
| `gst_number` | `text` | GST registration number |
| `pan_number` | `text` | PAN number |
| `address` | `jsonb` | Business address |
| `contact_info` | `jsonb` | Contact information |
| `kyb_status` | `enum` | KYB verification status |
| `kyb_verified_at` | `timestamp` | KYB verification timestamp |
| `business_type` | `text` | Type of business |
| `years_in_business` | `integer` | Years in business |
| `annual_turnover` | `numeric` | Annual turnover |
| `bank_details` | `jsonb` | Bank account details |
| `preferences` | `jsonb` | Dealer preferences |
| `status` | `enum` | Dealer status (active, suspended, inactive) |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |

#### Enums
```sql
CREATE TYPE dealer_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE kyb_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
```

#### Indexes
- Primary key on `id`
- Unique index on `user_id`
- Index on `gst_number`
- Index on `kyb_status`
- Index on `status`

### vehicles

Core vehicle inventory table.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `make` | `text` | Vehicle make |
| `model` | `text` | Vehicle model |
| `variant` | `text` | Vehicle variant |
| `year` | `integer` | Manufacturing year |
| `registration_number` | `text` | Vehicle registration number |
| `chassis_number` | `text` | Chassis number |
| `engine_number` | `text` | Engine number |
| `fuel_type` | `enum` | Fuel type |
| `transmission` | `enum` | Transmission type |
| `body_type` | `enum` | Body type |
| `color` | `text` | Vehicle color |
| `kilometers_driven` | `integer` | Kilometers driven |
| `price` | `numeric` | Selling price |
| `description` | `text` | Vehicle description |
| `features` | `jsonb` | Vehicle features |
| `condition` | `enum` | Vehicle condition |
| `status` | `enum` | Vehicle status |
| `inspection_report` | `jsonb` | Inspection report |
| `documents` | `jsonb` | Vehicle documents |
| `images` | `jsonb` | Vehicle images |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |

#### Enums
```sql
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng');
CREATE TYPE transmission AS ENUM ('manual', 'automatic', 'cvt', 'dct');
CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'hatchback', 'wagon', 'coupe', 'convertible', 'pickup', 'van');
CREATE TYPE vehicle_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE vehicle_status AS ENUM ('available', 'sold', 'reserved', 'inspection', 'maintenance');
```

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `make`
- Index on `model`
- Index on `registration_number`
- Index on `status`
- Index on `price`
- Full-text search index on `make`, `model`, `description`

### vehicle_assets

Stores vehicle images and documents.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `asset_type` | `enum` | Asset type (image, document, video) |
| `file_name` | `text` | Original file name |
| `file_path` | `text` | Storage path |
| `file_size` | `bigint` | File size in bytes |
| `mime_type` | `text` | MIME type |
| `metadata` | `jsonb` | Additional metadata |
| `is_primary` | `boolean` | Primary asset flag |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE asset_type AS ENUM ('image', 'document', 'video');
```

#### Indexes
- Primary key on `id`
- Index on `vehicle_id`
- Index on `asset_type`
- Index on `is_primary`

### vehicle_inspections

Stores vehicle inspection reports.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `inspector_id` | `uuid` | Inspector user ID |
| `inspection_date` | `date` | Inspection date |
| `inspection_type` | `enum` | Type of inspection |
| `overall_rating` | `integer` | Overall rating (1-5) |
| `categories` | `jsonb` | Inspection categories and scores |
| `notes` | `text` | Inspection notes |
| `recommendations` | `text` | Recommendations |
| `status` | `enum` | Inspection status |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE inspection_type AS ENUM ('pre_sale', 'post_sale', 'periodic', 'damage');
CREATE TYPE inspection_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
```

#### Indexes
- Primary key on `id`
- Index on `vehicle_id`
- Index on `inspector_id`
- Index on `inspection_date`
- Index on `status`

## Transaction Tables

### transactions

Main transaction table for vehicle sales and purchases.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `buyer_id` | `uuid` | Buyer user ID |
| `seller_id` | `uuid` | Seller dealer ID |
| `transaction_type` | `enum` | Transaction type |
| `amount` | `numeric` | Transaction amount |
| `currency` | `text` | Currency code |
| `payment_method` | `enum` | Payment method |
| `status` | `enum` | Transaction status |
| `transaction_date` | `timestamp` | Transaction date |
| `completion_date` | `timestamp` | Completion date |
| `notes` | `text` | Transaction notes |
| `metadata` | `jsonb` | Additional metadata |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE transaction_type AS ENUM ('sale', 'purchase', 'exchange', 'auction');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'cheque', 'card', 'upi', 'financing');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'failed');
```

#### Indexes
- Primary key on `id`
- Index on `vehicle_id`
- Index on `buyer_id`
- Index on `seller_id`
- Index on `transaction_date`
- Index on `status`

### payments

Tracks payment details for transactions.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `transaction_id` | `uuid` | Reference to transactions |
| `payment_type` | `enum` | Payment type |
| `amount` | `numeric` | Payment amount |
| `currency` | `text` | Currency code |
| `payment_method` | `enum` | Payment method |
| `reference_number` | `text` | Payment reference |
| `status` | `enum` | Payment status |
| `payment_date` | `timestamp` | Payment date |
| `gateway_response` | `jsonb` | Payment gateway response |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE payment_type AS ENUM ('advance', 'full_payment', 'installment', 'refund');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
```

#### Indexes
- Primary key on `id`
- Index on `transaction_id`
- Index on `reference_number`
- Index on `payment_date`
- Index on `status`

### logistics_orders

Tracks vehicle logistics and delivery.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `transaction_id` | `uuid` | Reference to transactions |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `pickup_location` | `jsonb` | Pickup location details |
| `delivery_location` | `jsonb` | Delivery location details |
| `logistics_provider` | `text` | Logistics provider |
| `tracking_number` | `text` | Tracking number |
| `estimated_delivery` | `timestamp` | Estimated delivery date |
| `actual_delivery` | `timestamp` | Actual delivery date |
| `status` | `enum` | Logistics status |
| `cost` | `numeric` | Logistics cost |
| `notes` | `text` | Logistics notes |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE logistics_status AS ENUM ('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'delivered', 'cancelled');
```

#### Indexes
- Primary key on `id`
- Index on `transaction_id`
- Index on `vehicle_id`
- Index on `tracking_number`
- Index on `status`

### rto_applications

Tracks RTO transfer applications.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `transaction_id` | `uuid` | Reference to transactions |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `application_number` | `text` | RTO application number |
| `rto_office` | `text` | RTO office |
| `application_type` | `enum` | Application type |
| `status` | `enum` | Application status |
| `submission_date` | `date` | Submission date |
| `approval_date` | `date` | Approval date |
| `documents` | `jsonb` | Required documents |
| `fees` | `numeric` | RTO fees |
| `notes` | `text` | Application notes |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE rto_application_type AS ENUM ('ownership_transfer', 'registration_renewal', 'duplicate_rc', 'address_change');
CREATE TYPE rto_application_status AS ENUM ('pending', 'submitted', 'under_review', 'approved', 'rejected');
```

#### Indexes
- Primary key on `id`
- Index on `transaction_id`
- Index on `vehicle_id`
- Index on `application_number`
- Index on `status`

## Support Tables

### dealer_hours

Stores dealer business hours.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `day_of_week` | `integer` | Day of week (0-6) |
| `open_time` | `time` | Opening time |
| `close_time` | `time` | Closing time |
| `is_closed` | `boolean` | Closed on this day |
| `created_at` | `timestamp` | Creation timestamp |

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `day_of_week`

### dealer_reviews

Stores customer reviews for dealers.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `reviewer_id` | `uuid` | Reviewer user ID |
| `rating` | `integer` | Rating (1-5) |
| `title` | `text` | Review title |
| `content` | `text` | Review content |
| `is_verified` | `boolean` | Verified purchase |
| `status` | `enum` | Review status |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
```

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `reviewer_id`
- Index on `rating`
- Index on `status`

### dealer_inquiries

Stores customer inquiries for vehicles.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `inquirer_id` | `uuid` | Inquirer user ID |
| `inquiry_type` | `enum` | Type of inquiry |
| `message` | `text` | Inquiry message |
| `contact_preference` | `enum` | Contact preference |
| `status` | `enum` | Inquiry status |
| `response` | `text` | Dealer response |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE inquiry_type AS ENUM ('price_inquiry', 'test_drive', 'availability', 'general');
CREATE TYPE contact_preference AS ENUM ('phone', 'email', 'whatsapp', 'any');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'responded', 'closed');
```

#### Indexes
- Primary key on `id`
- Index on `vehicle_id`
- Index on `inquirer_id`
- Index on `status`

### shortlists

Stores user vehicle shortlists.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | User ID |
| `vehicle_id` | `uuid` | Reference to vehicles |
| `notes` | `text` | User notes |
| `created_at` | `timestamp` | Creation timestamp |

#### Indexes
- Primary key on `id`
- Index on `user_id`
- Index on `vehicle_id`
- Unique constraint on `user_id` and `vehicle_id`

### team_members

Stores dealer team member information.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `user_id` | `uuid` | Reference to auth.users |
| `role` | `enum` | Team member role |
| `permissions` | `jsonb` | Role permissions |
| `is_active` | `boolean` | Active status |
| `joined_at` | `timestamp` | Join date |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE team_role AS ENUM ('owner', 'manager', 'sales_agent', 'admin');
```

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `user_id`
- Index on `role`

## Configuration Tables

### app_configs

Stores application configuration settings.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `config_key` | `text` | Configuration key |
| `config_value` | `jsonb` | Configuration value |
| `config_type` | `text` | Configuration type |
| `description` | `text` | Configuration description |
| `is_active` | `boolean` | Active status |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `config_key`
- Index on `config_type`
- Index on `is_active`

### dealer_preferences

Stores dealer-specific preferences and settings.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `preference_key` | `text` | Preference key |
| `preference_value` | `jsonb` | Preference value |
| `created_at` | `timestamp` | Creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `preference_key`

### bank_accounts

Stores dealer bank account information.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `dealer_id` | `uuid` | Reference to dealers |
| `account_holder_name` | `text` | Account holder name |
| `account_number` | `text` | Account number |
| `ifsc_code` | `text` | IFSC code |
| `bank_name` | `text` | Bank name |
| `branch_name` | `text` | Branch name |
| `account_type` | `enum` | Account type |
| `is_primary` | `boolean` | Primary account flag |
| `is_verified` | `boolean` | Verification status |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE account_type AS ENUM ('savings', 'current', 'business');
```

#### Indexes
- Primary key on `id`
- Index on `dealer_id`
- Index on `account_number`
- Index on `is_primary`

## Audit & Logging Tables

### audit_logs

Comprehensive audit trail for all data changes.

#### Columns
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `table_name` | `text` | Affected table |
| `record_id` | `uuid` | Affected record ID |
| `action` | `enum` | Action performed |
| `user_id` | `uuid` | User who performed action |
| `old_values` | `jsonb` | Previous values |
| `new_values` | `jsonb` | New values |
| `ip_address` | `inet` | IP address |
| `user_agent` | `text` | User agent |
| `created_at` | `timestamp` | Creation timestamp |

#### Enums
```sql
CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete', 'login', 'logout');
```

#### Indexes
- Primary key on `id`
- Index on `table_name`
- Index on `record_id`
- Index on `user_id`
- Index on `action`
- Index on `created_at`

## Relationships

### Foreign Key Relationships

```sql
-- Dealers
dealers.user_id -> auth.users(id)

-- Vehicles
vehicles.dealer_id -> dealers(id)

-- Vehicle Assets
vehicle_assets.vehicle_id -> vehicles(id)

-- Vehicle Inspections
vehicle_inspections.vehicle_id -> vehicles(id)
vehicle_inspections.inspector_id -> auth.users(id)

-- Transactions
transactions.vehicle_id -> vehicles(id)
transactions.buyer_id -> auth.users(id)
transactions.seller_id -> dealers(id)

-- Payments
payments.transaction_id -> transactions(id)

-- Logistics
logistics_orders.transaction_id -> transactions(id)
logistics_orders.vehicle_id -> vehicles(id)

-- RTO Applications
rto_applications.transaction_id -> transactions(id)
rto_applications.vehicle_id -> vehicles(id)

-- Support Tables
dealer_hours.dealer_id -> dealers(id)
dealer_reviews.dealer_id -> dealers(id)
dealer_reviews.reviewer_id -> auth.users(id)
dealer_inquiries.vehicle_id -> vehicles(id)
dealer_inquiries.inquirer_id -> auth.users(id)
shortlists.user_id -> auth.users(id)
shortlists.vehicle_id -> vehicles(id)
team_members.dealer_id -> dealers(id)
team_members.user_id -> auth.users(id)
dealer_preferences.dealer_id -> dealers(id)
bank_accounts.dealer_id -> dealers(id)
```

## Indexes

### Performance Indexes

```sql
-- Full-text search indexes
CREATE INDEX idx_vehicles_search ON vehicles USING gin(to_tsvector('english', make || ' ' || model || ' ' || description));

-- Composite indexes for common queries
CREATE INDEX idx_vehicles_dealer_status ON vehicles(dealer_id, status);
CREATE INDEX idx_vehicles_price_range ON vehicles(price) WHERE status = 'available';
CREATE INDEX idx_transactions_dates ON transactions(transaction_date, status);

-- Partial indexes for active records
CREATE INDEX idx_vehicles_active ON vehicles(id) WHERE status = 'available';
CREATE INDEX idx_dealers_active ON dealers(id) WHERE status = 'active';

-- JSONB indexes for efficient querying
CREATE INDEX idx_vehicles_features ON vehicles USING gin(features);
CREATE INDEX idx_dealers_address ON dealers USING gin(address);
```

## Policies

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

```sql
-- Dealers can only see their own data
CREATE POLICY "Dealers can view own data" ON dealers
    FOR SELECT USING (auth.uid() = user_id);

-- Dealers can only update their own data
CREATE POLICY "Dealers can update own data" ON dealers
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view available vehicles
CREATE POLICY "Users can view available vehicles" ON vehicles
    FOR SELECT USING (status = 'available');

-- Dealers can manage their own vehicles
CREATE POLICY "Dealers can manage own vehicles" ON vehicles
    FOR ALL USING (dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
    ));

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        seller_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
    );
```

### Data Validation

```sql
-- Check constraints
ALTER TABLE vehicles ADD CONSTRAINT check_price_positive CHECK (price > 0);
ALTER TABLE vehicles ADD CONSTRAINT check_year_valid CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1);
ALTER TABLE dealer_reviews ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Unique constraints
ALTER TABLE vehicles ADD CONSTRAINT unique_registration UNIQUE (registration_number);
ALTER TABLE dealers ADD CONSTRAINT unique_gst UNIQUE (gst_number);
```

## Data Types and Formats

### JSONB Schemas

```json
// Address format
{
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India"
}

// Contact info format
{
  "phone": "+91 9876543210",
  "email": "contact@dealer.com",
  "website": "https://dealer.com",
  "whatsapp": "+91 9876543210"
}

// Vehicle features format
{
  "interior": ["leather_seats", "sunroof", "navigation"],
  "exterior": ["alloy_wheels", "fog_lights", "rear_camera"],
  "safety": ["abs", "airbags", "esp"],
  "comfort": ["ac", "power_windows", "central_locking"]
}

// Inspection categories format
{
  "exterior": {
    "score": 4,
    "issues": ["minor_scratch"],
    "notes": "Overall good condition"
  },
  "interior": {
    "score": 5,
    "issues": [],
    "notes": "Excellent condition"
  }
}
```

## Backup and Recovery

### Backup Strategy

1. **Daily backups**: Automated daily backups using Supabase's built-in backup system
2. **Point-in-time recovery**: Support for point-in-time recovery up to 7 days
3. **Cross-region replication**: Data replicated across multiple regions for disaster recovery

### Data Retention

- **Active data**: Indefinite retention for active records
- **Deleted records**: Soft delete with 30-day retention
- **Audit logs**: 7-year retention for compliance
- **User sessions**: 90-day retention

## Performance Optimization

### Query Optimization

1. **Index usage**: All common queries are indexed
2. **Query planning**: Regular analysis of query performance
3. **Connection pooling**: Efficient connection management
4. **Caching**: Application-level caching for frequently accessed data

### Monitoring

1. **Query performance**: Monitor slow queries and optimize
2. **Index usage**: Track index effectiveness
3. **Storage usage**: Monitor database growth
4. **Connection limits**: Track connection pool usage

## Security Considerations

### Data Protection

1. **Encryption**: All data encrypted at rest and in transit
2. **Access control**: Row-level security on all tables
3. **Audit logging**: Comprehensive audit trail
4. **Data masking**: Sensitive data masked in logs

### Compliance

1. **GDPR compliance**: Data subject rights support
2. **Data localization**: Data stored in specified regions
3. **Retention policies**: Configurable data retention
4. **Access logging**: All access attempts logged

For additional database support or questions, refer to the [Supabase documentation](https://supabase.com/docs) or contact the development team.