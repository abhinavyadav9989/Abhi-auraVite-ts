# Database Migrations & Documentation

This folder contains all SQL migration files and related documentation for the Aura project database.

## 📁 File Categories

### 🔧 Core Database Setup
- `SUPABASE_DATABASE_SETUP.sql` - Main database schema setup
- `SUPABASE_CONFIG.md` - Supabase configuration documentation
- `DATABASE_SCHEMA_ANALYSIS.md` - Database schema analysis
- `DATABASE_TABLES.md` - Table structure documentation

### 🔐 Authentication & Email Validation
- `CHECK_DEALER_EMAIL_EXISTS.sql` - Email existence check function
- `CHECK_DEALER_EMAIL_EXISTS_SIMPLE.sql` - Simple email check function
- `FIX_BOTH_FUNCTIONS.sql` - Function fixes and updates
- `AUTHENTICATION_MIGRATION_SUMMARY.md` - Auth system documentation

### 🏢 Dealers & Business Logic
- `COMPLETE_DEALERS_TABLE_FIX.sql` - Dealers table fixes
- `COMPREHENSIVE_DEALERS_FIX.sql` - Comprehensive dealer fixes
- `FIX_DEALERS_TABLE_STRUCTURE.sql` - Dealers table structure fixes
- `ENHANCE_BRANCHES_AND_TEAM.sql` - Branch and team enhancements
- `CREATE_ADMIN_DEALER.sql` - Admin dealer creation

### 🚗 Vehicles & Inventory
- `COMPLETE_VEHICLES_TABLE_FIX.sql` - Vehicles table fixes
- `FINAL_VEHICLES_TABLE_COMPLETE.sql` - Final vehicles table setup
- `FIX_VEHICLES_TABLE.sql` - Vehicle table fixes
- `ADD_VEHICLE_TYPE_COLUMN.sql` - Vehicle type column addition

### 💰 Banking & Payments
- `COMPLETE_BANK_ACCOUNTS_TABLE_FIX.sql` - Bank accounts table fixes
- `FIX_BANK_DETAILS_CONSTRAINT.sql` - Bank details constraint fixes
- `FIX_BANK_DETAILS_SAVE.sql` - Bank details save fixes
- `MIGRATE_EXISTING_BANK_DETAILS.sql` - Bank details migration

### 📄 Documents & Storage
- `CREATE_STORAGE_BUCKET.sql` - Storage bucket creation
- `CREATE_UPLOADS_BUCKET.sql` - Uploads bucket creation
- `CREATE_DEALER_DOCUMENTS_TABLE.sql` - Dealer documents table
- `MIGRATE_EXISTING_DOCUMENTS.sql` - Document migration
- `DOCUMENT_MIGRATION_FIX_SUMMARY.md` - Document migration summary

### 🔍 Data Validation & Checks
- `CHECK_EXISTING_TABLES.sql` - Table existence checks
- `CHECK_PROFILE_DATA.sql` - Profile data validation
- `CHECK_TABLE_SCHEMA.sql` - Schema validation
- `VERIFY_ENUM_AND_TABLES.sql` - Enum and table verification

### 🛠️ Fixes & Updates
- `FIX_TEAM_MEMBERS_STATUS.sql` - Team member status fixes
- `FIX_SHORTLISTS_TABLE.sql` - Shortlists table fixes
- `FIX_AUDIT_LOGS_TABLE.sql` - Audit logs fixes
- `FIX_FUNCTION_OVERLOAD.sql` - Function overload fixes

### 📊 Analytics & Monitoring
- `ADMIN_RLS_POLICIES.sql` - Admin RLS policies
- `CLEANUP_DEALERS_POLICIES.sql` - Policy cleanup

### 🚀 Migration & Deployment
- `SUPABASE_MIGRATION.md` - Migration guide
- `SUPABASE_MIGRATION_SAFE.sql` - Safe migration script
- `RUN_SUPABASE_MIGRATION.md` - Migration execution guide
- `MIGRATION_COMPLETE.md` - Migration completion status

### 📋 Planning & Documentation
- `PHASE_BY_PHASE_PLAN.md` - Phase-by-phase migration plan
- `COMPREHENSIVE_WORKFLOW_PLAN.md` - Comprehensive workflow
- `WORKFLOW_UPDATE_PLAN.md` - Workflow updates
- `ONBOARDING_FIXES_SUMMARY.md` - Onboarding fixes summary

### 🔄 Schema Updates
- `ADD_MISSING_COLUMNS.sql` - Missing columns addition
- `ADD_CURRENT_STEP_COLUMN.sql` - Current step column
- `ADD_LIVE_TO_VEHICLE_STATUS.sql` - Live status addition
- `REFRESH_SCHEMA_CACHE.sql` - Schema cache refresh

## 🚀 Usage

1. **For New Setup**: Start with `SUPABASE_DATABASE_SETUP.sql`
2. **For Email Validation**: Use `CHECK_DEALER_EMAIL_EXISTS.sql`
3. **For Fixes**: Apply relevant fix files based on issues
4. **For Migration**: Follow `SUPABASE_MIGRATION.md`

## 📝 Notes

- All SQL files are tested and safe to run
- Backup your database before running migrations
- Run files in the order specified in migration guides
- Check the documentation files for detailed explanations