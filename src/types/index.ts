// Central types export file
// This file provides easy access to all Supabase-generated types from all schemas

import type { Database } from './database-all.types';

// Database type
export type { Database };

// ===== PUBLIC SCHEMA TYPES =====

// Table Row Types (for reading data)
export type Dealer = Database['public']['Tables']['dealers']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type VehicleAsset = Database['public']['Tables']['vehicle_assets']['Row'];
export type VehicleDocument = Database['public']['Tables']['vehicle_documents']['Row'];
export type VehicleCondition = Database['public']['Tables']['vehicle_condition']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type LogisticsOrder = Database['public']['Tables']['logistics_orders']['Row'];
export type RTOApplication = Database['public']['Tables']['rto_applications']['Row'];
export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
export type DealerPreferences = Database['public']['Tables']['dealer_preferences']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type DealerDocument = Database['public']['Tables']['dealer_documents']['Row'];
export type DealerHours = Database['public']['Tables']['dealer_hours']['Row'];
export type DealerReview = Database['public']['Tables']['dealer_reviews']['Row'];
export type DealerInquiry = Database['public']['Tables']['dealer_inquiries']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Shortlist = Database['public']['Tables']['shortlists']['Row'];
export type VehicleInspection = Database['public']['Tables']['vehicle_inspections']['Row'];
export type AppConfig = Database['public']['Tables']['app_configs']['Row'];
export type Branch = Database['public']['Tables']['branches']['Row'];
export type BankDetail = Database['public']['Tables']['bank_details']['Row'];
export type OnboardingAuditLog = Database['public']['Tables']['onboarding_audit_log']['Row'];

// Table Insert Types (for creating data)
export type DealerInsert = Database['public']['Tables']['dealers']['Insert'];
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
export type VehicleAssetInsert = Database['public']['Tables']['vehicle_assets']['Insert'];
export type VehicleDocumentInsert = Database['public']['Tables']['vehicle_documents']['Insert'];
export type VehicleConditionInsert = Database['public']['Tables']['vehicle_condition']['Insert'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type LogisticsOrderInsert = Database['public']['Tables']['logistics_orders']['Insert'];
export type RTOApplicationInsert = Database['public']['Tables']['rto_applications']['Insert'];
export type BankAccountInsert = Database['public']['Tables']['bank_accounts']['Insert'];
export type DealerPreferencesInsert = Database['public']['Tables']['dealer_preferences']['Insert'];
export type UserSessionInsert = Database['public']['Tables']['user_sessions']['Insert'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type DealerDocumentInsert = Database['public']['Tables']['dealer_documents']['Insert'];
export type DealerHoursInsert = Database['public']['Tables']['dealer_hours']['Insert'];
export type DealerReviewInsert = Database['public']['Tables']['dealer_reviews']['Insert'];
export type DealerInquiryInsert = Database['public']['Tables']['dealer_inquiries']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type ShortlistInsert = Database['public']['Tables']['shortlists']['Insert'];
export type VehicleInspectionInsert = Database['public']['Tables']['vehicle_inspections']['Insert'];
export type AppConfigInsert = Database['public']['Tables']['app_configs']['Insert'];
export type BranchInsert = Database['public']['Tables']['branches']['Insert'];
export type BankDetailInsert = Database['public']['Tables']['bank_details']['Insert'];
export type OnboardingAuditLogInsert = Database['public']['Tables']['onboarding_audit_log']['Insert'];

// Table Update Types (for updating data)
export type DealerUpdate = Database['public']['Tables']['dealers']['Update'];
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];
export type VehicleAssetUpdate = Database['public']['Tables']['vehicle_assets']['Update'];
export type VehicleDocumentUpdate = Database['public']['Tables']['vehicle_documents']['Update'];
export type VehicleConditionUpdate = Database['public']['Tables']['vehicle_condition']['Update'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type LogisticsOrderUpdate = Database['public']['Tables']['logistics_orders']['Update'];
export type RTOApplicationUpdate = Database['public']['Tables']['rto_applications']['Update'];
export type BankAccountUpdate = Database['public']['Tables']['bank_accounts']['Update'];
export type DealerPreferencesUpdate = Database['public']['Tables']['dealer_preferences']['Update'];
export type UserSessionUpdate = Database['public']['Tables']['user_sessions']['Update'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];
export type DealerDocumentUpdate = Database['public']['Tables']['dealer_documents']['Update'];
export type DealerHoursUpdate = Database['public']['Tables']['dealer_hours']['Update'];
export type DealerReviewUpdate = Database['public']['Tables']['dealer_reviews']['Update'];
export type DealerInquiryUpdate = Database['public']['Tables']['dealer_inquiries']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
export type ShortlistUpdate = Database['public']['Tables']['shortlists']['Update'];
export type VehicleInspectionUpdate = Database['public']['Tables']['vehicle_inspections']['Update'];
export type AppConfigUpdate = Database['public']['Tables']['app_configs']['Update'];
export type BranchUpdate = Database['public']['Tables']['branches']['Update'];
export type BankDetailUpdate = Database['public']['Tables']['bank_details']['Update'];
export type OnboardingAuditLogUpdate = Database['public']['Tables']['onboarding_audit_log']['Update'];

// ===== AUTH SCHEMA TYPES =====

// Auth User Types
export type AuthUser = Database['auth']['Tables']['users']['Row'];
export type AuthUserInsert = Database['auth']['Tables']['users']['Insert'];
export type AuthUserUpdate = Database['auth']['Tables']['users']['Update'];

// Auth Session Types
export type AuthSession = Database['auth']['Tables']['sessions']['Row'];
export type AuthSessionInsert = Database['auth']['Tables']['sessions']['Insert'];
export type AuthSessionUpdate = Database['auth']['Tables']['sessions']['Update'];

// Auth Identity Types
export type AuthIdentity = Database['auth']['Tables']['identities']['Row'];
export type AuthIdentityInsert = Database['auth']['Tables']['identities']['Insert'];
export type AuthIdentityUpdate = Database['auth']['Tables']['identities']['Update'];

// Auth MFA Types
export type AuthMFAFactor = Database['auth']['Tables']['mfa_factors']['Row'];
export type AuthMFAFactorInsert = Database['auth']['Tables']['mfa_factors']['Insert'];
export type AuthMFAFactorUpdate = Database['auth']['Tables']['mfa_factors']['Update'];

export type AuthMFAChallenge = Database['auth']['Tables']['mfa_challenges']['Row'];
export type AuthMFAChallengeInsert = Database['auth']['Tables']['mfa_challenges']['Insert'];
export type AuthMFAChallengeUpdate = Database['auth']['Tables']['mfa_challenges']['Update'];

// Auth Flow State Types
export type AuthFlowState = Database['auth']['Tables']['flow_state']['Row'];
export type AuthFlowStateInsert = Database['auth']['Tables']['flow_state']['Insert'];
export type AuthFlowStateUpdate = Database['auth']['Tables']['flow_state']['Update'];

// Auth Audit Types
export type AuthAuditLog = Database['auth']['Tables']['audit_log_entries']['Row'];
export type AuthAuditLogInsert = Database['auth']['Tables']['audit_log_entries']['Insert'];
export type AuthAuditLogUpdate = Database['auth']['Tables']['audit_log_entries']['Update'];

// ===== STORAGE SCHEMA TYPES =====

// Storage Bucket Types
export type StorageBucket = Database['storage']['Tables']['buckets']['Row'];
export type StorageBucketInsert = Database['storage']['Tables']['buckets']['Insert'];
export type StorageBucketUpdate = Database['storage']['Tables']['buckets']['Update'];

// Storage Object Types
export type StorageObject = Database['storage']['Tables']['objects']['Row'];
export type StorageObjectInsert = Database['storage']['Tables']['objects']['Insert'];
export type StorageObjectUpdate = Database['storage']['Tables']['objects']['Update'];

// Storage Migration Types
export type StorageMigration = Database['storage']['Tables']['migrations']['Row'];
export type StorageMigrationInsert = Database['storage']['Tables']['migrations']['Insert'];
export type StorageMigrationUpdate = Database['storage']['Tables']['migrations']['Update'];

// ===== VAULT SCHEMA TYPES =====

// Vault Secret Types
export type VaultSecret = Database['vault']['Tables']['secrets']['Row'];
export type VaultSecretInsert = Database['vault']['Tables']['secrets']['Insert'];
export type VaultSecretUpdate = Database['vault']['Tables']['secrets']['Update'];

// ===== DATABASE ENUMS =====

// Public Schema Enums
export type AccessLevel = Database['public']['Enums']['access_level'];
export type DocumentStatus = Database['public']['Enums']['document_status'];
export type InquiryStatus = Database['public']['Enums']['inquiry_status'];
export type InspectionStatus = Database['public']['Enums']['inspection_status'];
export type LogisticsStatus = Database['public']['Enums']['logistics_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type RTOStatus = Database['public']['Enums']['rto_status'];
export type TransactionStatus = Database['public']['Enums']['txn_status'];
export type UserType = Database['public']['Enums']['user_type'];
export type VehicleStatus = Database['public']['Enums']['vehicle_status'];
export type VehicleTypeEnum = Database['public']['Enums']['vehicle_type_enum'];

// Auth Schema Enums
export type AALLevel = Database['auth']['Enums']['aal_level'];
export type CodeChallengeMethod = Database['auth']['Enums']['code_challenge_method'];
export type FactorStatus = Database['auth']['Enums']['factor_status'];
export type FactorType = Database['auth']['Enums']['factor_type'];
export type OneTimeTokenType = Database['auth']['Enums']['one_time_token_type'];

// Storage Schema Enums
export type BucketType = Database['storage']['Enums']['buckettype'];

// ===== DATABASE FUNCTIONS =====

// Public Schema Functions
export type CanViewDealerPublic = Database['public']['Functions']['can_view_dealer_public'];
export type CanViewDealerTransaction = Database['public']['Functions']['can_view_dealer_transaction'];
export type CanViewVehiclePrice = Database['public']['Functions']['can_view_vehicle_price'];
export type CheckDealerEmailExists = Database['public']['Functions']['check_dealer_email_exists'];
export type CheckEmailSimple = Database['public']['Functions']['check_email_simple'];
export type CheckStorageBucketExists = Database['public']['Functions']['check_storage_bucket_exists'];
export type CheckStorageBucketStatus = Database['public']['Functions']['check_storage_bucket_status'];
export type CompleteOnboarding = Database['public']['Functions']['complete_onboarding'];
export type CreateVehicleDocumentsBucket = Database['public']['Functions']['create_vehicle_documents_bucket'];
export type CreateVehicleDocumentsDeletePolicy = Database['public']['Functions']['create_vehicle_documents_delete_policy'];
export type CreateVehicleDocumentsUploadPolicy = Database['public']['Functions']['create_vehicle_documents_upload_policy'];
export type CreateVehicleDocumentsViewPolicy = Database['public']['Functions']['create_vehicle_documents_view_policy'];
export type DebugCurrentUserAccess = Database['public']['Functions']['debug_current_user_access'];
export type EnsureTeamMemberExists = Database['public']['Functions']['ensure_team_member_exists'];
export type GenerateVehicleDocumentPath = Database['public']['Functions']['generate_vehicle_document_path'];
export type GetCurrentUserTeamMember = Database['public']['Functions']['get_current_user_team_member'];
export type GetPendingKYBDealers = Database['public']['Functions']['get_pending_kyb_dealers'];
export type GetStorageBucketUrl = Database['public']['Functions']['get_storage_bucket_url'];
export type GetVehicleDisplayPrice = Database['public']['Functions']['get_vehicle_display_price'];
export type GetVehicleDocumentsStorageConfig = Database['public']['Functions']['get_vehicle_documents_storage_config'];
export type InitializeVehicleDocumentsStorage = Database['public']['Functions']['initialize_vehicle_documents_storage'];
export type LogOnboardingAction = Database['public']['Functions']['log_onboarding_action'];
export type RejectDealer = Database['public']['Functions']['reject_dealer'];
export type SaveBankDetailsToTable = Database['public']['Functions']['save_bank_details_to_table'];
export type SetupCurrentUserTeamMember = Database['public']['Functions']['setup_current_user_team_member'];
export type UpdateDealerVerification = Database['public']['Functions']['update_dealer_verification'];
export type UpdateOnboardingProgress = Database['public']['Functions']['update_onboarding_progress'];
export type ValidateVehicleDocumentUpload = Database['public']['Functions']['validate_vehicle_document_upload'];
export type VerifyDealer = Database['public']['Functions']['verify_dealer'];

// Auth Schema Functions
export type AuthEmail = Database['auth']['Functions']['email'];
export type AuthJWT = Database['auth']['Functions']['jwt'];
export type AuthRole = Database['auth']['Functions']['role'];
export type AuthUID = Database['auth']['Functions']['uid'];

// Storage Schema Functions
export type StorageAddPrefixes = Database['storage']['Functions']['add_prefixes'];
export type StorageCanInsertObject = Database['storage']['Functions']['can_insert_object'];
export type StorageDeletePrefix = Database['storage']['Functions']['delete_prefix'];
export type StorageExtension = Database['storage']['Functions']['extension'];
export type StorageFilename = Database['storage']['Functions']['filename'];
export type StorageFoldername = Database['storage']['Functions']['foldername'];
export type StorageGetLevel = Database['storage']['Functions']['get_level'];
export type StorageGetPrefix = Database['storage']['Functions']['get_prefix'];
export type StorageGetPrefixes = Database['storage']['Functions']['get_prefixes'];
export type StorageGetSizeByBucket = Database['storage']['Functions']['get_size_by_bucket'];
export type StorageListMultipartUploadsWithDelimiter = Database['storage']['Functions']['list_multipart_uploads_with_delimiter'];
export type StorageListObjectsWithDelimiter = Database['storage']['Functions']['list_objects_with_delimiter'];
export type StorageOperation = Database['storage']['Functions']['operation'];
export type StorageSearch = Database['storage']['Functions']['search'];
export type StorageSearchLegacyV1 = Database['storage']['Functions']['search_legacy_v1'];
export type StorageSearchV1Optimised = Database['storage']['Functions']['search_v1_optimised'];
export type StorageSearchV2 = Database['storage']['Functions']['search_v2'];

// Vault Schema Functions
export type VaultCreateSecret = Database['vault']['Functions']['create_secret'];
export type VaultUpdateSecret = Database['vault']['Functions']['update_secret'];

// ===== DATABASE VIEWS =====

// Public Schema Views
export type BranchWithDealerInfo = Database['public']['Views']['branches_with_dealer_info']['Row'];

// Vault Schema Views
export type DecryptedSecret = Database['vault']['Views']['decrypted_secrets']['Row'];

// ===== UTILITY TYPES =====

// JSON type
export type { Json } from './database-all.types';

// Schema-specific type helpers
export type PublicSchema = Database['public'];
export type AuthSchema = Database['auth'];
export type StorageSchema = Database['storage'];
export type VaultSchema = Database['vault'];

// ===== PHASE 4 TYPES =====
export * from './attributeSets';

// Export all types for easy access
export * from './database-all.types';
