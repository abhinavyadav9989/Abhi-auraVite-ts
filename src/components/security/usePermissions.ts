import { useState, useEffect } from 'react';
import { getUserRoles, hasPermission as checkPermission, hasAllPermissions as checkAllPermissions, hasAnyPermission as checkAnyPermission } from '@/lib/permissions';

export interface UserPermissions {
  userRole: string | null;
  dealerRole: string | null;
  verificationStatus: string | null;
  permissions: string[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const usePermissions = (): UserPermissions => {
  const [userData, setUserData] = useState<{
    userRole: string | null;
    dealerRole: string | null;
    verificationStatus: string | null;
    permissions: string[];
  }>({
    userRole: null,
    dealerRole: null,
    verificationStatus: null,
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const data = await getUserRoles();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      // Set minimal permissions for error case
      setUserData({
        userRole: null,
        dealerRole: null,
        verificationStatus: null,
        permissions: ['marketplace.view']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return userData.permissions.includes(permission);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userData.permissions.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userData.permissions.includes(permission));
  };

  return {
    ...userData,
    isLoading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };
};

// Export the hook as default
export default usePermissions;
