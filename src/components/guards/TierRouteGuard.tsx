import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Zap, ArrowLeft, Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  getDealerTier,
  hasFeatureAccess,
  shouldPromptUpgrade,
  getUpgradeBenefits,
  type Dealer,
  type TierLevel
} from '@/lib/tierConfig';
import UpgradeWizard from '@/components/ui/UpgradeWizard';

interface TierRouteGuardProps {
  children: React.ReactNode;
  requiredTier?: TierLevel;
  requiredFeature?: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  redirectTo?: string;
}

/**
 * Route guard that checks tier and feature access before rendering content
 * Redirects or shows upgrade prompts for insufficient access
 */
export default function TierRouteGuard({
  children,
  requiredTier,
  requiredFeature,
  fallback,
  showUpgradePrompt = true,
  redirectTo
}: TierRouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [currentTier, setCurrentTier] = useState<TierLevel>('basic');
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setIsLoading(true);

      // Get current dealer
      const { Dealer: DealerAPI } = await import('@/api/entities');
      const dealers = await DealerAPI.filter({ limit: 1 });

      if (dealers.length === 0) {
        setError('No dealer profile found');
        return;
      }

      const dealerData = dealers[0];
      setDealer(dealerData);

      // Check tier
      const tier = getDealerTier(dealerData);
      setCurrentTier(tier);

      // Check access requirements
      let accessGranted = true;

      if (requiredTier && tier !== requiredTier) {
        accessGranted = false;
      }

      if (requiredFeature && !hasFeatureAccess(dealerData, requiredFeature)) {
        accessGranted = false;
      }

      setHasAccess(accessGranted);

    } catch (err) {
      console.error('Error checking access:', err);
      setError('Failed to verify access permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
  };

  const handleGoBack = () => {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate(-1);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <CardTitle className="text-red-900">Access Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">{error}</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show upgrade wizard
  if (showWizard) {
    return (
      <UpgradeWizard
        onClose={handleCloseWizard}
        initialFeature={requiredFeature}
      />
    );
  }

  // Has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // No access - show custom fallback or default
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  const benefits = getUpgradeBenefits({
    requestedFeature: requiredFeature
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">
            Advanced Feature Required
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="text-amber-700">
              Current: {currentTier === 'basic' ? 'Basic Tier' : 'Advanced Tier'}
            </Badge>
            <Badge variant="outline" className="text-green-700">
              Required: Advanced Tier
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Info */}
          {requiredFeature && (
            <Alert className="bg-blue-50 border-blue-200">
              <Crown className="w-4 h-4" />
              <AlertDescription className="text-blue-800">
                <strong>This feature requires an Advanced tier subscription.</strong>
                {requiredFeature === 'branch_hierarchy' && ' Create unlimited branches for your growing business.'}
                {requiredFeature === 'data_ops' && ' Import large datasets and manage data operations.'}
                {requiredFeature === 'analytics.view' && ' Access advanced analytics and BI dashboards.'}
                {requiredFeature === 'inspections' && ' Use professional inspection and quality control workflows.'}
                {requiredFeature === 'logistics_full' && ' Manage carriers and track deliveries professionally.'}
                {requiredFeature === 'attribute_sets' && ' Create custom vehicle specifications and rules.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">What you'll unlock:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.slice(0, 6).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Advanced
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Current Plan Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Current Plan:</span>
              <Badge variant="secondary">
                {currentTier === 'basic' ? 'Basic Tier' : 'Advanced Tier'}
              </Badge>
            </div>
            {currentTier === 'basic' && (
              <div className="mt-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Branches:</span>
                  <span>Limited to 2</span>
                </div>
                <div className="flex justify-between">
                  <span>Bulk Upload:</span>
                  <span>Limited to 200</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics:</span>
                  <span>Basic only</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== HIGHER-ORDER COMPONENT =====

/**
 * HOC that wraps components with tier-based route guarding
 */
export function withTierGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredTier?: TierLevel;
    requiredFeature?: string;
    showUpgradePrompt?: boolean;
    redirectTo?: string;
  }
) {
  return function TierGuardedComponent(props: P) {
    return (
      <TierRouteGuard {...options}>
        <Component {...props} />
      </TierRouteGuard>
    );
  };
}

// ===== PRE-CONFIGURED GUARDS =====

/**
 * Guard for Advanced tier only
 */
export function withAdvancedTier<P extends object>(Component: React.ComponentType<P>) {
  return withTierGuard(Component, { requiredTier: 'advanced' });
}

/**
 * Guard for specific features
 */
export function withFeatureGuard<P extends object>(
  Component: React.ComponentType<P>,
  feature: string
) {
  return withTierGuard(Component, { requiredFeature: feature });
}

// ===== UTILITY HOOKS =====

/**
 * Hook to check current tier and feature access
 */
export function useTierAccess() {
  const [tier, setTier] = useState<TierLevel>('basic');
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTier();
  }, []);

  const checkTier = async () => {
    try {
      const { Dealer: DealerAPI } = await import('@/api/entities');
      const dealers = await DealerAPI.filter({ limit: 1 });

      if (dealers.length > 0) {
        const dealerData = dealers[0];
        setDealer(dealerData);
        setTier(getDealerTier(dealerData));
      }
    } catch (error) {
      console.error('Error checking tier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tier,
    dealer,
    isLoading,
    hasFeature: (feature: string) => hasFeatureAccess(dealer, feature),
    canUpgrade: shouldPromptUpgrade(dealer),
    upgradeBenefits: getUpgradeBenefits()
  };
}
