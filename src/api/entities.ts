// Import from Supabase adapters instead of Base44
import {
  Dealer,
  Vehicle,
  VehicleAsset,
  Transaction,
  Payment,
  LogisticsOrder,
  RTOApplication,
  BankAccount,
  DealerPreferences,
  UserSession,
  TeamMember,
  DealerDocument,
  DealerHours,
  DealerReview,
  DealerInquiry,
  AuditLog,
  Shortlist,
  VehicleInspection,
  AppConfig,
  User
} from './entityAdapters';

// Re-export all entities to maintain the same interface
export {
  Dealer,
  Vehicle,
  VehicleAsset,
  Transaction,
  Payment,
  LogisticsOrder,
  RTOApplication,
  BankAccount,
  DealerPreferences,
  UserSession,
  TeamMember,
  DealerDocument,
  DealerHours,
  DealerReview,
  DealerInquiry,
  AuditLog,
  Shortlist,
  VehicleInspection,
  AppConfig,
  User
};

