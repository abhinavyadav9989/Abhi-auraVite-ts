import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';

// Permission definitions with granular control
export const PERMISSIONS: Record<string, string[]> = {
  // Vehicle permissions
  'vehicle.create': ['owner', 'staff', 'inventory_manager'],
  'vehicle.edit': ['owner', 'staff', 'inventory_manager'],
  'vehicle.delete': ['owner', 'admin'],
  'vehicle.view': ['owner', 'staff', 'viewer', 'sales_exec'],
  'vehicle.publish': ['owner', 'staff', 'inventory_manager'],
  'vehicle.transfer': ['owner', 'branch_manager'],
  'vehicle.bulk_operations': ['owner', 'inventory_manager'],
  
  // Deal permissions
  'deal.create': ['owner', 'staff', 'sales_exec'],
  'deal.manage': ['owner', 'staff', 'sales_exec'],
  'deal.view': ['owner', 'staff', 'viewer', 'sales_exec'],
  'deal.approve': ['owner', 'admin'],
  'deal.cancel': ['owner', 'admin'],
  
  // Analytics permissions
  'analytics.view': ['owner', 'admin', 'analyst'],
  'analytics.export': ['owner', 'admin'],
  'metrics.view': ['owner', 'admin', 'analyst'],
  'market_trends.view': ['owner', 'admin', 'analyst'],
  
  // Team permissions
  'team.manage': ['owner', 'admin'],
  'team.invite': ['owner', 'admin'],
  'team.remove': ['owner', 'admin'],
  'team.assign_roles': ['owner', 'admin'],
  
  // Branch permissions
  'branch.create': ['owner', 'admin'],
  'branch.edit': ['owner', 'branch_manager'],
  'branch.delete': ['owner', 'admin'],
  'branch.view': ['owner', 'staff', 'viewer'],
  'branch.transfer_vehicles': ['owner', 'branch_manager'],
  
  // Admin permissions
  'admin.access': ['admin'],
  'admin.kyb': ['admin'],
  'admin.disputes': ['admin'],
  'admin.audit': ['admin'],
  'admin.users': ['admin'],
  'admin.system': ['admin'],
  
  // Profile permissions
  'profile.edit': ['owner', 'admin'],
  'profile.view': ['owner', 'staff', 'viewer'],
  'profile.documents': ['owner', 'admin'],
  
  // Marketplace permissions
  'marketplace.view': ['owner', 'staff', 'viewer', 'buyer'],
  'marketplace.create_offer': ['owner', 'staff', 'buyer'],
  'marketplace.view_prices': ['owner', 'staff', 'verified_buyer'],
  'marketplace.analytics': ['owner', 'admin'],
  
  // Financial permissions
  'financial.view': ['owner', 'admin', 'finance_manager'],
  'financial.edit': ['owner', 'admin'],
  'financial.approve': ['owner', 'admin'],
  
  // Document permissions
  'documents.upload': ['owner', 'staff', 'inventory_manager'],
  'documents.view': ['owner', 'staff', 'viewer'],
  'documents.approve': ['owner', 'admin'],
  'documents.delete': ['owner', 'admin'],
  
  // Settings permissions
  'settings.view': ['owner', 'admin'],
  'settings.edit': ['owner', 'admin'],
  'settings.system': ['admin'],
  
  // Onboarding permissions
  'onboarding.complete': ['owner'],
  'onboarding.verify': ['admin'],
  'onboarding.approve': ['admin']
};

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  'Vehicle Management': [
    'vehicle.create', 'vehicle.edit', 'vehicle.delete', 'vehicle.view',
    'vehicle.publish', 'vehicle.transfer', 'vehicle.bulk_operations'
  ],
  'Deal Management': [
    'deal.create', 'deal.manage', 'deal.view', 'deal.approve', 'deal.cancel'
  ],
  'Analytics & Reports': [
    'analytics.view', 'analytics.export', 'metrics.view', 'market_trends.view'
  ],
  'Team Management': [
    'team.manage', 'team.invite', 'team.remove', 'team.assign_roles'
  ],
  'Branch Management': [
    'branch.create', 'branch.edit', 'branch.delete', 'branch.view',
    'branch.transfer_vehicles'
  ],
  'Administration': [
    'admin.access', 'admin.kyb', 'admin.disputes', 'admin.audit',
    'admin.users', 'admin.system'
  ],
  'Profile & Settings': [
    'profile.edit', 'profile.view', 'profile.documents',
    'settings.view', 'settings.edit', 'settings.system'
  ],
  'Marketplace': [
    'marketplace.view', 'marketplace.create_offer', 'marketplace.view_prices',
    'marketplace.analytics'
  ],
  'Financial': [
    'financial.view', 'financial.edit', 'financial.approve'
  ],
  'Documents': [
    'documents.upload', 'documents.view', 'documents.approve', 'documents.delete'
  ],
  'Onboarding': [
    'onboarding.complete', 'onboarding.verify', 'onboarding.approve'
  ]
} as const;

// Role hierarchy and inheritance
export const ROLE_HIERARCHY: Record<string, string[]> = {
  'admin': ['admin', 'owner', 'staff', 'viewer'],
  'owner': ['owner', 'staff', 'viewer'],
  'branch_manager': ['branch_manager', 'staff', 'viewer'],
  'inventory_manager': ['inventory_manager', 'staff', 'viewer'],
  'sales_exec': ['sales_exec', 'viewer'],
  'finance_manager': ['finance_manager', 'viewer'],
  'analyst': ['analyst', 'viewer'],
  'staff': ['staff', 'viewer'],
  'viewer': ['viewer']
};

// Permission check function
export const hasPermission = (
  userRole: string | null, 
  dealerRole: string | null, 
  permission: keyof typeof PERMISSIONS
): boolean => {
  // Admin users have all permissions
  if (userRole === 'admin') return true;
  
  // Check if permission exists
  if (!PERMISSIONS[permission]) return false;
  
  // For admin permissions, only admins are allowed
  if (permission.startsWith('admin.') && userRole !== 'admin') {
    return false;
  }
  
  // Check dealer-level permissions
  const allowedRoles = PERMISSIONS[permission];
  
  // Check direct role match
  if (dealerRole && allowedRoles.includes(dealerRole as any)) {
    return true;
  }
  
  // Check role hierarchy inheritance
  if (dealerRole && ROLE_HIERARCHY[dealerRole]) {
    const inheritedRoles = ROLE_HIERARCHY[dealerRole];
    return inheritedRoles.some(role => allowedRoles.includes(role as any));
  }
  
  return false;
};

// Check multiple permissions (all must be true)
export const hasAllPermissions = (
  userRole: string | null,
  dealerRole: string | null,
  permissions: Array<keyof typeof PERMISSIONS>
): boolean => {
  return permissions.every(permission => hasPermission(userRole, dealerRole, permission));
};

// Check multiple permissions (any can be true)
export const hasAnyPermission = (
  userRole: string | null,
  dealerRole: string | null,
  permissions: Array<keyof typeof PERMISSIONS>
): boolean => {
  return permissions.some(permission => hasPermission(userRole, dealerRole, permission));
};

// Get all permissions for a role
export const getRolePermissions = (role: string): Array<keyof typeof PERMISSIONS> => {
  const permissions: Array<keyof typeof PERMISSIONS> = [];
  
  Object.entries(PERMISSIONS).forEach(([permission, allowedRoles]) => {
    if (hasPermission(role, role, permission as keyof typeof PERMISSIONS)) {
      permissions.push(permission as keyof typeof PERMISSIONS);
    }
  });
  
  return permissions;
};

// Get missing permissions for a role
export const getMissingPermissions = (
  userRole: string | null,
  dealerRole: string | null,
  requiredPermissions: Array<keyof typeof PERMISSIONS>
): Array<keyof typeof PERMISSIONS> => {
  return requiredPermissions.filter(
    permission => !hasPermission(userRole, dealerRole, permission)
  );
};

// Permission context type
export interface PermissionContext {
  userRole: string | null;
  dealerRole: string | null;
  isLoading: boolean;
  hasPermission: (permission: keyof typeof PERMISSIONS) => boolean;
  hasAllPermissions: (permissions: Array<keyof typeof PERMISSIONS>) => boolean;
  hasAnyPermission: (permissions: Array<keyof typeof PERMISSIONS>) => boolean;
  getMissingPermissions: (permissions: Array<keyof typeof PERMISSIONS>) => Array<keyof typeof PERMISSIONS>;
}

// Enhanced user role mapping based on database schema
export const getUserRoles = async (): Promise<{
  userRole: string | null;
  dealerRole: string | null;
  verificationStatus: string | null;
  permissions: string[]
}> => {
  try {
    const currentUser = await User.me();

    // Check if user is admin (from user metadata or custom field)
    const userRole = currentUser?.role || currentUser?.user_metadata?.role || null;

    // If admin, return admin role
    if (userRole === 'admin') {
      return {
        userRole: 'admin',
        dealerRole: 'admin',
        verificationStatus: 'verified',
        permissions: Object.keys(PERMISSIONS) as string[]
      };
    }

    // Load dealer profiles for the current user
    const dealers = await Dealer.filter({ created_by: currentUser.email });

    if (dealers.length === 0) {
      // User has no dealer profile - they're a guest/individual user
      return {
        userRole: 'individual',
        dealerRole: null,
        verificationStatus: null,
        permissions: ['marketplace.view']
      };
    }

    // Get the primary dealer (first one)
    const primaryDealer = dealers[0];

    // Determine dealer role based on verification status
    let dealerRole: string | null = null;
    let permissions: string[] = ['marketplace.view'];

    // Map verification status to roles
    switch (primaryDealer.verification_status || primaryDealer.verification_status_new) {
      case 'verified':
        dealerRole = 'owner'; // Verified dealer owner
        permissions = [
          'vehicle.create', 'vehicle.edit', 'vehicle.delete', 'vehicle.view', 'vehicle.publish',
          'deal.create', 'deal.manage', 'deal.view', 'deal.approve',
          'marketplace.view', 'marketplace.create_offer', 'marketplace.view_prices',
          'profile.edit', 'documents.upload', 'documents.view'
        ];
        break;

      case 'documents_submitted':
      case 'under_review':
        dealerRole = 'unverified_owner'; // Unverified dealer owner
        permissions = [
          'vehicle.create', 'vehicle.edit', 'vehicle.view',
          'marketplace.view',
          'profile.edit'
        ];
        break;

      default:
        dealerRole = 'prospect'; // Prospect dealer
        permissions = ['marketplace.view'];
        break;
    }

    // Check for team member roles (if we have team member system)
    // This would require a team_members table in the database
    // For now, we assume single-user dealers

    return {
      userRole: dealerRole ? 'dealer' : 'individual',
      dealerRole,
      verificationStatus: primaryDealer.verification_status || primaryDealer.verification_status_new,
      permissions
    };

  } catch (error) {
    console.error('Error loading user roles:', error);
    return {
      userRole: null,
      dealerRole: null,
      verificationStatus: null,
      permissions: ['marketplace.view'] // Basic permissions for error cases
    };
  }
};

// Note: Enhanced permission checking with database integration is available via getUserRoles()
// The sync hasPermission function above should be used for backward compatibility


