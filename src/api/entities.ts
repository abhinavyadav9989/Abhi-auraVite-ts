import { base44 } from './base44Client';


export const Dealer = base44.entities.Dealer;

export const Vehicle = base44.entities.Vehicle;

export const VehicleAsset = base44.entities.VehicleAsset;

export const Transaction = base44.entities.Transaction;

export const Payment = base44.entities.Payment;

export const LogisticsOrder = base44.entities.LogisticsOrder;

export const RTOApplication = base44.entities.RTOApplication;

export const BankAccount = base44.entities.BankAccount;

export const DealerPreferences = base44.entities.DealerPreferences;

export const UserSession = base44.entities.UserSession;

export const TeamMember = base44.entities.TeamMember;

export const DealerDocument = base44.entities.DealerDocument;

export const DealerHours = base44.entities.DealerHours;

export const DealerReview = base44.entities.DealerReview;

export const DealerInquiry = base44.entities.DealerInquiry;

export const AuditLog = base44.entities.AuditLog;

export const Shortlist = base44.entities.Shortlist;

export const VehicleInspection = base44.entities.VehicleInspection;

export const AppConfig = base44.entities.AppConfig;



// auth sdk:
// Cast to any to allow admin pages to call list() without restricting auth SDK typings
export const User: any = base44.auth as any;