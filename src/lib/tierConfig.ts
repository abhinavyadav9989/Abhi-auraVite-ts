import type { Dealer } from '@/types';

// Export Dealer type for use in other components
export type { Dealer };

/**
 * Tier Configuration System for Aura Inventory
 * Defines caps, limits, and feature access for Basic vs Advanced tiers
 */

// ===== TIER DEFINITIONS =====

// Tenant States & Flags (as per specification)
export type TenantStage = 'no_kyc' | 'kyc_pending' | 'kyc_complete';
export type TenantTier = 'basic' | 'advanced';
export type ViewMode = 'basic_view' | 'advanced_view';
export type VehicleExposureMode = 'public' | 'masked' | 'b2b';
export type VehicleMarketStatus = 'draft' | 'queued_kyc' | 'live' | 'unlisted';

export type TierLevel = 'basic' | 'advanced'; // Updated to match specification

export interface TierLimits {
  maxBranches: number;
  maxBulkUploadRows: number;
  maxMediaPerVehicle: number;
  features: string[];
  marketplaceModes: string[];
  analyticsLevel: 'lite' | 'full';
  transferLogistics: boolean;
  inspections: boolean;
  dataOps: boolean;
  attributeSets: boolean;
  branchHierarchy: boolean;
  theming: boolean;
  approvals: boolean;
  b2bMode: boolean;
}

// Basic Tier (≤2 branches, capped features)
export const BASIC_TIER: TierLimits = {
  maxBranches: 2,
  maxBulkUploadRows: 200,
  maxMediaPerVehicle: 10,
  features: [
    'inventory_management',
    'basic_analytics',
    'bulk_import',
    'transfer_between_branches',
    'basic_logistics',
    'marketplace_basic'
  ],
  marketplaceModes: ['masked', 'public'],
  analyticsLevel: 'lite',
  transferLogistics: true,
  inspections: false,
  dataOps: false,
  attributeSets: false,
  branchHierarchy: false,
  theming: false,
  approvals: false,
  b2bMode: false
};

// Advanced Tier (unlimited, full features)
export const ADVANCED_TIER: TierLimits = {
  maxBranches: -1, // unlimited
  maxBulkUploadRows: 5000,
  maxMediaPerVehicle: 50,
  features: [
    'inventory_management',
    'advanced_analytics',
    'bulk_import',
    'transfer_advanced',
    'logistics_full',
    'inspections',
    'data_ops',
    'attribute_sets',
    'branch_hierarchy',
    'theming',
    'marketplace_full',
    'approvals',
    'b2b_mode'
  ],
  marketplaceModes: ['masked', 'public', 'b2b'],
  analyticsLevel: 'full',
  transferLogistics: true,
  inspections: true,
  dataOps: true,
  attributeSets: true,
  branchHierarchy: true,
  theming: true,
  approvals: true,
  b2bMode: true
};

// Backward compatibility alias
export const CUSTOMISED_TIER = ADVANCED_TIER;

// ===== TIER DETECTION & ENFORCEMENT =====

/**
 * Determines the current tier for a dealer
 */
/**
 * Determines the current tenant stage based on KYC status
 */
export function getTenantStage(dealer: Dealer | null): TenantStage {
  if (!dealer) return 'no_kyc';

  if (dealer.verification_status === 'verified') return 'kyc_complete';
  if (dealer.verification_status === 'documents_submitted' ||
      dealer.verification_status_new === 'documents_submitted') return 'kyc_pending';

  return 'no_kyc';
}

/**
 * Determines the current tier for a dealer
 */
export function getDealerTier(dealer: Dealer | null): TierLevel {
  if (!dealer) return 'basic';

  // Advanced tier is available if they have completed activation/customization
  const hasOptedForAdvanced = dealer?.activation_completed === true;

  return hasOptedForAdvanced ? 'advanced' : 'basic';
}

/**
 * Gets the limits for a specific tier
 */
export function getTierLimits(tier: TierLevel): TierLimits {
  return tier === 'advanced' ? ADVANCED_TIER : BASIC_TIER;
}

/**
 * Checks if a dealer can create more branches
 */
export function canCreateMoreBranches(dealer: Dealer | null, currentBranchCount: number): boolean {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  if (limits.maxBranches === -1) return true; // unlimited
  return currentBranchCount < limits.maxBranches;
}

/**
 * Checks if a dealer can perform bulk upload with given row count
 */
export function canPerformBulkUpload(dealer: Dealer | null, rowCount: number): boolean {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  return rowCount <= limits.maxBulkUploadRows;
}

/**
 * Checks if a dealer has access to a specific feature
 */
export function hasFeatureAccess(dealer: Dealer | null, feature: string): boolean {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  return limits.features.includes(feature);
}

/**
 * Gets the maximum media uploads allowed per vehicle
 */
export function getMaxMediaPerVehicle(dealer: Dealer | null): number {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  return limits.maxMediaPerVehicle;
}

/**
 * Gets available marketplace modes for a dealer
 */
export function getAvailableMarketplaceModes(dealer: Dealer | null): string[] {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  return limits.marketplaceModes;
}

// ===== TIER UPGRADE LOGIC =====

/**
 * Checks if dealer should be prompted to upgrade
 */
export function shouldPromptUpgrade(dealer: Dealer | null, context?: {
  attemptingBranchCreation?: boolean;
  bulkUploadRowCount?: number;
  requestedFeature?: string;
}): boolean {
  if (!dealer) return false;

  const tier = getDealerTier(dealer);
  if (tier === 'advanced') return false;

  // Check specific contexts
  if (context?.attemptingBranchCreation) {
    // Get current branch count somehow - this would need to be passed in
    return true; // Always prompt for branch creation in basic
  }

  if (context?.bulkUploadRowCount) {
    return context.bulkUploadRowCount > BASIC_TIER.maxBulkUploadRows;
  }

  if (context?.requestedFeature) {
    return !hasFeatureAccess(dealer, context.requestedFeature);
  }

  return false;
}

/**
 * Gets upgrade benefits for a specific context
 */
export function getUpgradeBenefits(context?: {
  attemptingBranchCreation?: boolean;
  bulkUploadRowCount?: number;
  requestedFeature?: string;
}): string[] {
  const benefits = [
    'Unlimited branches',
    'Bulk upload up to 5,000 vehicles',
    'Advanced analytics & dashboards',
    'Inspection workflows',
    'Full logistics management',
    'Data operations center',
    'Attribute sets & VIN mapping',
    'Branch theming & customization',
    'B2B marketplace access'
  ];

  // Add context-specific benefits
  if (context?.attemptingBranchCreation) {
    benefits.unshift('Create unlimited branches for your growing business');
  }

  if (context?.bulkUploadRowCount && context.bulkUploadRowCount > BASIC_TIER.maxBulkUploadRows) {
    benefits.unshift(`Upload your ${context.bulkUploadRowCount} vehicles in one go`);
  }

  if (context?.requestedFeature) {
    switch (context.requestedFeature) {
      case 'inspections':
        benefits.unshift('Professional inspection workflows & checklists');
        break;
      case 'data_ops':
        benefits.unshift('Automated data imports & scheduled syncs');
        break;
      case 'attribute_sets':
        benefits.unshift('Custom vehicle specifications & VIN mapping');
        break;
      case 'advanced_analytics':
        benefits.unshift('BI dashboards & detailed analytics');
        break;
      case 'approvals':
        benefits.unshift('Multi-stage approval workflows');
        break;
      case 'b2b_mode':
        benefits.unshift('Dealer-to-dealer marketplace access');
        break;
      case 'branch_hierarchy':
        benefits.unshift('Hierarchical branch management');
        break;
      case 'theming':
        benefits.unshift('Custom branch theming & branding');
        break;
    }
  }

  return benefits;
}

// ===== ENFORCEMENT HELPERS =====

/**
 * Enforces tier limits and throws appropriate errors
 */
export function enforceTierLimits(dealer: Dealer | null, action: string, params?: any): void {
  const tier = getDealerTier(dealer);
  const limits = getTierLimits(tier);

  switch (action) {
    case 'create_branch':
      if (!canCreateMoreBranches(dealer, params?.currentBranchCount || 0)) {
        throw new Error(`Basic Inventory allows maximum ${limits.maxBranches} branches. Upgrade to Customised for unlimited branches.`);
      }
      break;

    case 'bulk_upload':
      if (!canPerformBulkUpload(dealer, params?.rowCount || 0)) {
        throw new Error(`Basic Inventory allows maximum ${limits.maxBulkUploadRows} rows per upload. Upgrade to Customised for up to ${CUSTOMISED_TIER.maxBulkUploadRows} rows.`);
      }
      break;

    case 'feature_access':
      if (!hasFeatureAccess(dealer, params?.feature)) {
        throw new Error(`This feature requires Customised Inventory.`);
      }
      break;

    default:
      break;
  }
}

// ===== VEHICLE EXPOSURE & MARKET STATUS LOGIC =====

/**
 * Determines the market status for a vehicle based on exposure mode and KYC stage
 */
export function getVehicleMarketStatus(
  exposureMode: VehicleExposureMode,
  tenantStage: TenantStage
): VehicleMarketStatus {
  if (exposureMode === 'masked') {
    return 'live'; // Masked vehicles go live immediately
  }

  if (exposureMode === 'public') {
    // Public vehicles are queued until KYC is complete
    return tenantStage === 'kyc_complete' ? 'live' : 'queued_kyc';
  }

  if (exposureMode === 'b2b') {
    return 'live'; // B2B vehicles go live immediately for verified dealers
  }

  return 'draft';
}

/**
 * Gets available exposure modes for a tenant tier
 */
export function getAvailableExposureModes(tier: TierLevel): VehicleExposureMode[] {
  const limits = getTierLimits(tier);
  return limits.marketplaceModes as VehicleExposureMode[];
}

/**
 * Checks if a tenant can publish vehicles with a specific exposure mode
 */
export function canPublishExposureMode(
  exposureMode: VehicleExposureMode,
  tier: TierLevel,
  tenantStage: TenantStage
): boolean {
  // Check if exposure mode is available for this tier
  const availableModes = getAvailableExposureModes(tier);
  if (!availableModes.includes(exposureMode)) return false;

  // Check KYC requirements
  if (exposureMode === 'public' && tenantStage !== 'kyc_complete') {
    return false; // Public requires KYC completion
  }

  if (exposureMode === 'b2b' && tier !== 'advanced') {
    return false; // B2B requires advanced tier
  }

  return true;
}

// ===== TYPE EXPORTS =====

export interface TierContext {
  tier: TierLevel;
  limits: TierLimits;
  canUpgrade: boolean;
  upgradeBenefits: string[];
}
