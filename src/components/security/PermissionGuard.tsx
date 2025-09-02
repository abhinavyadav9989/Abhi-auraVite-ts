import React from 'react';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  getMissingPermissions,
  getUserRoles,
  type PermissionContext 
} from '@/lib/permissions';

// Permission Guard Component
type PermissionGuardProps = {
  permission: keyof typeof import('@/lib/permissions').PERMISSIONS;
  permissions?: Array<keyof typeof import('@/lib/permissions').PERMISSIONS>;
  requireAll?: boolean; // true = all permissions required, false = any permission
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  showUpgradePrompt?: boolean;
  customMessage?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
};

export default function PermissionGuard({
  permission,
  permissions = [],
  requireAll = true,
  children = null,
  fallback = null,
  showMessage = false,
  showUpgradePrompt = false,
  customMessage,
  actionButton
}: PermissionGuardProps) {
  const [userData, setUserData] = React.useState<{
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const userInfo = await getUserRoles();
      setUserData(userInfo);

      // Check permissions based on loaded data
      const allPermissions = permissions.length > 0 ? permissions : [permission];
      const accessGranted = requireAll
        ? allPermissions.every(perm => userInfo.permissions.includes(perm))
        : allPermissions.some(perm => userInfo.permissions.includes(perm));

      setHasAccess(accessGranted);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      setHasAccess(false);
    }
    setIsLoading(false);
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-200 rounded h-8 w-full" />
    );
  }

  if (!hasAccess) {
    if (showMessage) {
      const allPermissions = permissions.length > 0 ? permissions : [permission];
      const missingPermissions = allPermissions.filter(perm => !userData.permissions.includes(perm));

      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-orange-900 text-lg">Access Restricted</CardTitle>
                <p className="text-sm text-orange-700">
                  {customMessage || `You don't have permission to access this feature.`}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Missing Permissions */}
            {missingPermissions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-800">Required Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {missingPermissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-orange-700 border-orange-300">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Current Role Info */}
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-800">Current Role:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-orange-700">
                    {userData.userRole || 'No Role'}
                  </Badge>
                  {userData.dealerRole && userData.dealerRole !== userData.userRole && (
                    <Badge variant="outline" className="text-orange-600">
                      {userData.dealerRole}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upgrade Prompt */}
            {showUpgradePrompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Upgrade Available</span>
                </div>
                <p className="text-sm text-blue-700">
                  Contact your administrator to request additional permissions or upgrade your account.
                </p>
              </div>
            )}
            
            {/* Action Button */}
            {actionButton && (
              <Button 
                variant={actionButton.variant || "outline"}
                onClick={actionButton.onClick}
                className="w-full"
              >
                {actionButton.text}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    return fallback;
  }
  
  return <>{children}</>;
}

// Hook for checking permissions
export const usePermissions = (): PermissionContext => {
  const [permissions, setPermissions] = React.useState<PermissionContext>({
    userRole: null,
    dealerRole: null,
    isLoading: true,
    hasPermission: () => false,
    hasAllPermissions: () => false,
    hasAnyPermission: () => false,
    getMissingPermissions: () => []
  });
  
  React.useEffect(() => {
    loadPermissions();
  }, []);
  
  const loadPermissions = async () => {
    try {
      const { userRole, dealerRole } = await getUserRoles();
      
      setPermissions({
        userRole,
        dealerRole,
        isLoading: false,
        hasPermission: (permission) => hasPermission(userRole, dealerRole, permission),
        hasAllPermissions: (permissions) => hasAllPermissions(userRole, dealerRole, permissions),
        hasAnyPermission: (permissions) => hasAnyPermission(userRole, dealerRole, permissions),
        getMissingPermissions: (permissions) => getMissingPermissions(userRole, dealerRole, permissions)
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  return permissions;
};

// Higher-order component for permission-based rendering
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  permission: keyof typeof import('@/lib/permissions').PERMISSIONS,
  options?: {
    fallback?: React.ReactNode;
    showMessage?: boolean;
    showUpgradePrompt?: boolean;
  }
) {
  return function PermissionGuardedComponent(props: P) {
    return (
      <PermissionGuard 
        permission={permission}
        showMessage={options?.showMessage}
        showUpgradePrompt={options?.showUpgradePrompt}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// Utility component for showing permission requirements
export function PermissionRequirements({ 
  permissions, 
  showCurrentRole = true 
}: { 
  permissions: Array<keyof typeof import('@/lib/permissions').PERMISSIONS>;
  showCurrentRole?: boolean;
}) {
  const { userRole, dealerRole, hasPermission, getMissingPermissions } = usePermissions();
  const missingPermissions = getMissingPermissions(permissions);
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-blue-900 text-lg">Permission Requirements</CardTitle>
            <p className="text-sm text-blue-700">
              The following permissions are required to access this feature.
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Required Permissions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-800">Required Permissions:</p>
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <Badge 
                key={perm} 
                variant={hasPermission(perm) ? "default" : "outline"}
                className={hasPermission(perm) ? "bg-green-100 text-green-800" : "text-blue-700 border-blue-300"}
              >
                {perm}
                {hasPermission(perm) && <span className="ml-1">✓</span>}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Current Role */}
        {showCurrentRole && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Current Role:</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-blue-700">
                  {userRole || 'No Role'}
                </Badge>
                {dealerRole && dealerRole !== userRole && (
                  <Badge variant="outline" className="text-blue-600">
                    {dealerRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Missing Permissions Summary */}
        {missingPermissions.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>{missingPermissions.length}</strong> permission(s) missing. 
              Contact your administrator to request access.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}