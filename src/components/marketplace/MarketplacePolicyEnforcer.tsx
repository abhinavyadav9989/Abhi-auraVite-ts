import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Zap,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePermissions } from '@/components/security/PermissionGuard';

interface MarketplacePolicyEnforcerProps {
  children: React.ReactNode;
  policy: 'price_visibility' | 'deal_participation' | 'inventory_access' | 'analytics_access' | 'marketplace_view' | 'offer_creation';
  fallback?: React.ReactNode;
  showMessage?: boolean;
  showUpgradePrompt?: boolean;
  customMessage?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
}

const POLICY_CONFIG = {
  price_visibility: {
    title: 'Price Visibility',
    description: 'View dealer prices and market insights',
    requiredPermissions: ['marketplace.view_prices'] as const,
    requiredVerification: 'kyc_completed' as const,
    icon: Eye,
    upgradeBenefit: 'Access to real-time pricing and market data'
  },
  deal_participation: {
    title: 'Deal Participation',
    description: 'Make offers and participate in transactions',
    requiredPermissions: ['marketplace.create_offer'] as const,
    requiredVerification: 'kyb_completed' as const,
    icon: Shield,
    upgradeBenefit: 'Participate in deals and negotiations'
  },
  inventory_access: {
    title: 'Inventory Access',
    description: 'Access to full vehicle inventory and details',
    requiredPermissions: ['marketplace.view'] as const,
    requiredVerification: 'kyc_completed' as const,
    icon: Building2,
    upgradeBenefit: 'Browse complete vehicle inventory'
  },
  analytics_access: {
    title: 'Analytics Access',
    description: 'Market trends and performance analytics',
    requiredPermissions: ['marketplace.analytics'] as const,
    requiredVerification: 'kyc_completed' as const,
    icon: TrendingUp,
    upgradeBenefit: 'Advanced market analytics and insights'
  },
  marketplace_view: {
    title: 'Marketplace Access',
    description: 'Browse vehicles in the marketplace',
    requiredPermissions: ['marketplace.view'] as const,
    requiredVerification: 'none' as const,
    icon: Users,
    upgradeBenefit: 'Full marketplace access with pricing and dealer details'
  },
  offer_creation: {
    title: 'Offer Creation',
    description: 'Create and manage offers on vehicles',
    requiredPermissions: ['marketplace.create_offer'] as const,
    requiredVerification: 'kyb_completed' as const,
    icon: Shield,
    upgradeBenefit: 'Create and manage vehicle offers'
  }
};

export default function MarketplacePolicyEnforcer({
  children,
  policy,
  fallback,
  showMessage = true,
  showUpgradePrompt = true,
  customMessage,
  actionButton
}: MarketplacePolicyEnforcerProps) {
  const { user } = useAuth();
  const {
    hasPermission,
    hasAllPermissions,
    verificationStatus,
    dealerRole,
    userRole,
    isLoading
  } = usePermissions();
  const navigate = useNavigate();

  // Get dealer verification status from the permissions hook
  const dealerVerificationStatus = dealerRole || 'unverified';

  // Only show verification status for users who are verified or in verification process
  const shouldShowVerificationStatus = dealerRole && dealerRole !== 'prospect';

  // Show loading state while permissions are being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const config = POLICY_CONFIG[policy];
  const Icon = config.icon;

  // Check permissions using the new permission system
  const hasRequiredPermissions = hasAllPermissions([...config.requiredPermissions]);

  // Check verification status using the new system
  let hasRequiredVerification = false;

  switch (config.requiredVerification) {
    case 'none':
      // No verification required
      hasRequiredVerification = true;
      break;
    case 'kyc_completed':
      // KYC is completed if user has any dealer role (even unverified)
      hasRequiredVerification = dealerRole !== null || userRole === 'admin';
      break;
    case 'kyb_completed':
      // KYB is completed only for verified dealers
      hasRequiredVerification = verificationStatus === 'verified' || userRole === 'admin';
      break;
    default:
      hasRequiredVerification = false;
  }

  // Special case for admin users
  if (userRole === 'admin') {
    hasRequiredVerification = true;
  }

  // Check if policy is satisfied
  const isPolicySatisfied = hasRequiredPermissions && hasRequiredVerification;

  if (!isPolicySatisfied) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-slate-700">
            {config.title}
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {customMessage || config.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Policy Requirements */}
          <div className="space-y-3">
            {/* Permission Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Required Permissions:</span>
                <Badge variant={hasRequiredPermissions ? "default" : "secondary"}>
                  {hasRequiredPermissions ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {config.requiredPermissions.length} permission(s)
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {config.requiredPermissions.map((permission) => (
                  <Badge 
                    key={permission} 
                    variant={hasPermission(permission) ? "default" : "outline"}
                    className={`text-xs ${hasPermission(permission) ? 'bg-green-100 text-green-800' : 'text-slate-600'}`}
                  >
                    {permission}
                    {hasPermission(permission) && <CheckCircle className="w-2 h-2 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Verification Requirements */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Verification:</span>
              <Badge variant={hasRequiredVerification ? "default" : "secondary"}>
                {hasRequiredVerification ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {config.requiredVerification.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Current Status - Only show for verified or verifying users */}
          {showMessage && shouldShowVerificationStatus && (
            <Alert className="bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {dealerVerificationStatus}
                </Badge>
                {dealerVerificationStatus === 'premium' && <Crown className="w-3 h-3 text-amber-500" />}
                {dealerVerificationStatus === 'verified' && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
            </div>
          </Alert>
        )}

          {/* Upgrade Benefits */}
          {showUpgradePrompt && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Upgrade Benefits</span>
              </div>
              <p className="text-sm text-blue-700">
                {config.upgradeBenefit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!hasRequiredVerification && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(createPageUrl('KYBWizard'))}
              >
                <Shield className="w-4 h-4 mr-2" />
                Complete Verification
              </Button>
            )}
            
            {actionButton && (
              <Button 
                variant={actionButton.variant || "outline"}
                onClick={actionButton.onClick}
                className="w-full"
              >
                {actionButton.text}
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

  return <>{children}</>;
}

// Higher-order component for wrapping components with policy enforcement
export function withPolicyEnforcement<P extends object>(
  Component: React.ComponentType<P>,
  policy: keyof typeof POLICY_CONFIG,
  options?: {
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
    customMessage?: string;
    actionButton?: {
      text: string;
      onClick: () => void;
      variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    };
  }
) {
  return function PolicyEnforcedComponent(props: P) {
    return (
      <MarketplacePolicyEnforcer 
        policy={policy}
        fallback={options?.fallback}
        showUpgradePrompt={options?.showUpgradePrompt}
        customMessage={options?.customMessage}
        actionButton={options?.actionButton}
      >
        <Component {...props} />
      </MarketplacePolicyEnforcer>
    );
  };
}

// Utility component for showing policy requirements
export function PolicyRequirements({ 
  policy,
  showCurrentStatus = true 
}: { 
  policy: keyof typeof POLICY_CONFIG;
  showCurrentStatus?: boolean;
}) {
  const { hasPermission, hasAllPermissions } = usePermissions();
  const config = POLICY_CONFIG[policy];
  
  const hasRequiredPermissions = hasAllPermissions([...config.requiredPermissions]);
  const missingPermissions = [...config.requiredPermissions].filter(perm => !hasPermission(perm));
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <config.icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-blue-900 text-lg">{config.title} Requirements</CardTitle>
            <p className="text-sm text-blue-700">
              {config.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Required Permissions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-800">Required Permissions:</p>
          <div className="flex flex-wrap gap-2">
            {config.requiredPermissions.map((permission) => (
              <Badge 
                key={permission} 
                variant={hasPermission(permission) ? "default" : "outline"}
                className={hasPermission(permission) ? "bg-green-100 text-green-800" : "text-blue-700 border-blue-300"}
              >
                {permission}
                {hasPermission(permission) && <CheckCircle className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Verification Requirements */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-800">Verification Required:</p>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            {config.requiredVerification.replace('_', ' ')}
          </Badge>
        </div>
        
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
