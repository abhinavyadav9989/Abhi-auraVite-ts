import React from 'react';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Permission definitions
const PERMISSIONS = {
  // Vehicle permissions
  'vehicle.create': ['owner', 'staff'],
  'vehicle.edit': ['owner', 'staff'],
  'vehicle.delete': ['owner'],
  'vehicle.view': ['owner', 'staff', 'viewer'],
  'vehicle.publish': ['owner', 'staff'],
  
  // Deal permissions
  'deal.create': ['owner', 'staff'],
  'deal.manage': ['owner', 'staff'],
  'deal.view': ['owner', 'staff', 'viewer'],
  
  // Analytics permissions
  'analytics.view': ['owner'],
  'metrics.view': ['owner'],
  
  // Team permissions
  'team.manage': ['owner'],
  'team.invite': ['owner'],
  
  // Admin permissions
  'admin.access': ['admin'],
  'admin.kyb': ['admin'],
  'admin.disputes': ['admin'],
  'admin.audit': ['admin'],
  
  // Profile permissions
  'profile.edit': ['owner'],
  'profile.view': ['owner', 'staff', 'viewer']
};

// Check if user has permission
export const hasPermission = (userRole, dealerRole, permission) => {
  // Admin users have all permissions
  if (userRole === 'admin') return true;
  
  // Check if permission exists
  if (!PERMISSIONS[permission]) return false;
  
  // For admin permissions, only admins are allowed
  if (permission.startsWith('admin.') && userRole !== 'admin') {
    return false;
  }
  
  // Check dealer-level permissions
  return PERMISSIONS[permission].includes(dealerRole);
};

// Permission Guard Component
type PermissionGuardProps = {
  permission: string
  children?: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export default function PermissionGuard({ 
  permission, 
  children = null, 
  fallback = null, 
  showMessage = false 
}: PermissionGuardProps) {
  const [user, setUser] = React.useState(null);
  const [dealerRole, setDealerRole] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    loadUserPermissions();
  }, []);
  
  const loadUserPermissions = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // For admin users, they have all permissions
      if (currentUser.role === 'admin') {
        setDealerRole('admin');
        setIsLoading(false);
        return;
      }
      
      // Load dealer role for regular users
      const dealers = await Dealer.filter({ created_by: currentUser.email });
      if (dealers.length > 0) {
        // For now, assuming the first dealer profile determines the role
        setDealerRole('owner'); // Default to owner for main dealer profile
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
    setIsLoading(false);
  };
  
  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 rounded h-8" />;
  }
  
  const hasAccess = hasPermission(user?.role, dealerRole, permission);
  
  if (!hasAccess) {
    if (showMessage) {
      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">Access Restricted</h4>
                <p className="text-sm text-orange-700">
                  You don&apos;t have permission to access this feature.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return fallback;
  }
  
  return children;
}

// Hook for checking permissions
export const usePermissions = () => {
  const [permissions, setPermissions] = React.useState({
    userRole: null,
    dealerRole: null,
    isLoading: true
  });
  
  React.useEffect(() => {
    loadPermissions();
  }, []);
  
  const loadPermissions = async () => {
    try {
      const currentUser = await User.me();
      
      if (currentUser.role === 'admin') {
        setPermissions({
          userRole: 'admin',
          dealerRole: 'admin',
          isLoading: false
        });
        return;
      }
      
      const dealers = await Dealer.filter({ created_by: currentUser.email });
      setPermissions({
        userRole: currentUser.role,
        dealerRole: dealers.length > 0 ? 'owner' : null,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const checkPermission = (permission) => {
    return hasPermission(permissions.userRole, permissions.dealerRole, permission);
  };
  
  return {
    ...permissions,
    hasPermission: checkPermission
  };
};