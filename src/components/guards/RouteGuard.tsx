import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission,
  getUserRoles 
} from '@/lib/permissions';

// Route Guard Types
export type RouteGuardType = 
  | 'permission' 
  | 'verification' 
  | 'onboarding' 
  | 'branch' 
  | 'admin' 
  | 'dealer';

interface RouteGuardProps {
  children: React.ReactNode;
  type: RouteGuardType;
  permissions?: Array<keyof typeof import('@/lib/permissions').PERMISSIONS>;
  requireAll?: boolean;
  verificationLevel?: 'kyc' | 'kyb' | 'premium';
  fallback?: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
  customMessage?: string;
}

export default function RouteGuard({ 
  children, 
  type, 
  permissions = [],
  requireAll = true,
  verificationLevel,
  fallback,
  redirectTo,
  showMessage = false,
  customMessage
}: RouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dealerRole, setDealerRole] = useState<string | null>(null);
  const [dealer, setDealer] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, [type, permissions, verificationLevel, user, isAuthenticated]);

  const checkAccess = async () => {
    if (loading) return;
    
    setIsChecking(true);
    
    try {
      // Check authentication first
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        }
        return;
      }

      // Load user roles
      const { userRole: userR, dealerRole: dealerR } = await getUserRoles();
      setUserRole(userR);
      setDealerRole(dealerR);

      // Load dealer data for verification checks
      if (type === 'verification' || type === 'dealer') {
        const dealerProfiles = await Dealer.filter({ created_by: user.email });
        if (dealerProfiles.length > 0) {
          setDealer(dealerProfiles[0]);
        }
      }

      let access = false;

      switch (type) {
        case 'permission':
          if (permissions.length > 0) {
            access = requireAll 
              ? hasAllPermissions(userR, dealerR, permissions)
              : hasAnyPermission(userR, dealerR, permissions);
          } else {
            access = true; // No specific permissions required
          }
          break;

        case 'verification':
          if (dealer && verificationLevel) {
            switch (verificationLevel) {
              case 'kyc':
                access = dealer.verification_status === 'verified' || 
                        dealer.verification_status === 'premium' ||
                        dealer.verification_status_new === 'verified';
                break;
              case 'kyb':
                access = dealer.verification_status === 'premium' ||
                        dealer.verification_status_new === 'premium';
                break;
              case 'premium':
                access = dealer.verification_status === 'premium' ||
                        dealer.verification_status_new === 'premium';
                break;
            }
          }
          break;

        case 'onboarding':
          access = dealer?.onboarding_completed === true;
          break;

        case 'branch':
          // Check if user has at least one branch
          const { db } = await import('@/api/supabaseClient');
          const { data: branches } = await db
            .from('branches')
            .select('id')
            .eq('dealer_id', dealer?.id)
            .limit(1);
          access = branches && branches.length > 0;
          break;

        case 'admin':
          access = userR === 'admin';
          break;

        case 'dealer':
          access = dealer !== null;
          break;

        default:
          access = true;
      }

      setHasAccess(access);

      // Redirect if no access and redirectTo is specified
      if (!access && redirectTo) {
        navigate(redirectTo, { replace: true });
      }

    } catch (error) {
      console.error('Error checking route access:', error);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading while checking
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (!hasAccess && showMessage) {
    return (
      <Card className="border-red-200 bg-red-50 max-w-md mx-auto mt-8">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900 text-lg">Access Denied</CardTitle>
              <p className="text-sm text-red-700">
                {customMessage || getDefaultMessage(type, verificationLevel)}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-800">User Role:</span>
                <Badge variant="secondary" className="text-red-700">
                  {userRole || 'No Role'}
                </Badge>
              </div>
              {dealerRole && dealerRole !== userRole && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-800">Dealer Role:</span>
                  <Badge variant="outline" className="text-red-600">
                    {dealerRole}
                  </Badge>
                </div>
              )}
              {dealer && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-800">Verification:</span>
                  <Badge variant="outline" className="text-red-600">
                    {dealer.verification_status || 'unverified'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {type === 'verification' && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl('KYBWizard'))}
              >
                <Shield className="w-4 h-4 mr-2" />
                Complete Verification
              </Button>
            )}
            
            {type === 'onboarding' && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl('OnboardingWizard'))}
              >
                <Shield className="w-4 h-4 mr-2" />
                Complete Onboarding
              </Button>
            )}
            
            {type === 'branch' && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl('BranchFirst'))}
              >
                <Shield className="w-4 h-4 mr-2" />
                Setup Branch
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full"
              onClick={() => navigate(createPageUrl('Dashboard'))}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show fallback or render children
  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Helper function to get default messages
function getDefaultMessage(type: RouteGuardType, verificationLevel?: string): string {
  switch (type) {
    case 'permission':
      return 'You don\'t have the required permissions to access this page.';
    case 'verification':
      return `This page requires ${verificationLevel?.toUpperCase()} verification.`;
    case 'onboarding':
      return 'Please complete your onboarding to access this page.';
    case 'branch':
      return 'You need to set up at least one branch to access this page.';
    case 'admin':
      return 'This page is restricted to administrators only.';
    case 'dealer':
      return 'You need to complete your dealer profile to access this page.';
    default:
      return 'Access denied.';
  }
}

// Higher-order component for route protection
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  type: RouteGuardType,
  options?: {
    permissions?: Array<keyof typeof import('@/lib/permissions').PERMISSIONS>;
    requireAll?: boolean;
    verificationLevel?: 'kyc' | 'kyb' | 'premium';
    redirectTo?: string;
    showMessage?: boolean;
    customMessage?: string;
  }
) {
  return function RouteGuardedComponent(props: P) {
    return (
      <RouteGuard 
        type={type}
        permissions={options?.permissions}
        requireAll={options?.requireAll}
        verificationLevel={options?.verificationLevel}
        redirectTo={options?.redirectTo}
        showMessage={options?.showMessage}
        customMessage={options?.customMessage}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Specific route guards for common use cases
export const withPermissionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  permissions: Array<keyof typeof import('@/lib/permissions').PERMISSIONS>
) => withRouteGuard(Component, 'permission', { permissions });

export const withVerificationGuard = <P extends object>(
  Component: React.ComponentType<P>,
  level: 'kyc' | 'kyb' | 'premium'
) => withRouteGuard(Component, 'verification', { verificationLevel: level });

export const withOnboardingGuard = <P extends object>(
  Component: React.ComponentType<P>
) => withRouteGuard(Component, 'onboarding', { 
  redirectTo: createPageUrl('OnboardingWizard'),
  showMessage: true 
});

export const withBranchGuard = <P extends object>(
  Component: React.ComponentType<P>
) => withRouteGuard(Component, 'branch', { 
  redirectTo: createPageUrl('BranchFirst'),
  showMessage: true 
});

export const withAdminGuard = <P extends object>(
  Component: React.ComponentType<P>
) => withRouteGuard(Component, 'admin', { 
  redirectTo: createPageUrl('Dashboard'),
  showMessage: true 
});
