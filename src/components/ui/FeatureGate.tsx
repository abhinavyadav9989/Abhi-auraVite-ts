import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADVANCED_TIER, BASIC_TIER } from '@/lib/tierConfig';
import {
  Lock,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Crown,
  Building2,
  Upload,
  BarChart3,
  Truck,
  FileCheck,
  Database,
  Palette,
  Settings,
  Sparkles,
  Wrench,
  Users,
  Shield,
  Workflow,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  getDealerTier,
  getTenantStage,
  hasFeatureAccess,
  shouldPromptUpgrade,
  getUpgradeBenefits,
  type Dealer,
  type TierLevel
} from '@/lib/tierConfig';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';

// ===== TYPES =====

interface FeatureGateProps {
  feature: string;
  dealer?: Dealer | null;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  useActivationSystem?: boolean; // Enable new activation-based logic
  upgradeContext?: {
    attemptingBranchCreation?: boolean;
    bulkUploadRowCount?: number;
    requestedFeature?: string;
  };
  className?: string;
}

interface UpgradePromptProps {
  feature: string;
  benefits: string[];
  onUpgrade: () => void;
  onClose: () => void;
  context?: {
    attemptingBranchCreation?: boolean;
    bulkUploadRowCount?: number;
    requestedFeature?: string;
  };
}

// ===== FEATURE ICONS & LABELS =====

const FEATURE_INFO = {
  // Legacy tier-based features
  'advanced_analytics': {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'BI dashboards, cohort analysis, and detailed reporting',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'inspections': {
    icon: FileCheck,
    title: 'Inspection Workflows',
    description: 'Professional checklists, vendor reports, and quality control',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'data_ops': {
    icon: Database,
    title: 'Data Operations',
    description: 'Automated imports, scheduled syncs, and error management',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'attribute_sets': {
    icon: Settings,
    title: 'Attribute Sets',
    description: 'Custom vehicle specifications and VIN mapping rules',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  'logistics_full': {
    icon: Truck,
    title: 'Full Logistics',
    description: 'Carrier management, tracking, and delivery confirmations',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  'branch_hierarchy': {
    icon: Building2,
    title: 'Branch Hierarchy',
    description: 'Sub-branches, regional grouping, and advanced organization',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  'theming': {
    icon: Palette,
    title: 'Branch Theming',
    description: 'Custom colors, logos, and branded experiences',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  'marketplace_b2b': {
    icon: Crown,
    title: 'B2B Marketplace',
    description: 'Dealer-to-dealer pricing and verified buyer access',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },

  // New activation-based features
  'unlimited_branches': {
    icon: Building2,
    title: 'Unlimited Branches',
    description: 'Create as many branches as your business needs',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  'driver_assignment': {
    icon: Truck,
    title: 'Driver Assignment',
    description: 'Assign drivers and track vehicle movements',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200'
  },
  'photo_verification': {
    icon: Shield,
    title: 'Photo Verification',
    description: 'Secure photo verification for all transfers',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  'approvals': {
    icon: CheckCircle,
    title: 'Approval Workflows',
    description: 'Multi-stage approvals for listings and changes',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200'
  },
  'price_bands': {
    icon: Target,
    title: 'Price Bands',
    description: 'Set price ranges and approval thresholds',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
  'bulk_operations': {
    icon: Upload,
    title: 'Bulk Operations',
    description: 'Handle large data imports and exports',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  'scheduled_reports': {
    icon: BarChart3,
    title: 'Scheduled Reports',
    description: 'Automated reporting and data exports',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  'vin_mapping': {
    icon: Workflow,
    title: 'VIN Mapping',
    description: 'Advanced VIN decoding and data mapping',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  },
  'brand_coverage': {
    icon: Sparkles,
    title: 'Brand Coverage',
    description: 'Multi-brand support with specialized workflows',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  'branch_theming': {
    icon: Palette,
    title: 'Branch Theming',
    description: 'Customize each branch with unique branding',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  'analytics': {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and insights',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

// ===== UPGRADE PROMPT COMPONENT =====

const UpgradePrompt: React.FC<UpgradePromptProps & { useActivationSystem?: boolean }> = ({
  feature,
  benefits,
  onUpgrade,
  onClose,
  context,
  useActivationSystem = false
}) => {
  const featureInfo = FEATURE_INFO[feature] || {
    icon: Zap,
    title: 'Advanced Feature',
    description: useActivationSystem
      ? 'Complete the Advanced Activation Wizard to unlock this feature'
      : 'Unlock this powerful feature with Advanced tier',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  };

  const IconComponent = featureInfo.icon;

  // Get context-specific messaging based on system type
  const getContextMessage = () => {
    const isActivation = useActivationSystem;

    if (context?.attemptingBranchCreation) {
      return {
        title: "Ready to Expand?",
        subtitle: isActivation
          ? "Complete the Advanced Activation Wizard to create unlimited branches."
          : "You've reached the branch limit for Basic tier. Upgrade to create unlimited branches."
      };
    }
    if (context?.bulkUploadRowCount && context.bulkUploadRowCount > 200) {
      return {
        title: "Large Import Detected",
        subtitle: isActivation
          ? `Complete activation to handle large imports like this ${context.bulkUploadRowCount} vehicle batch.`
          : `You're trying to upload ${context.bulkUploadRowCount} vehicles. Upgrade to handle large imports.`
      };
    }
    return {
      title: isActivation ? "Activate Advanced Features" : "Unlock Advanced Features",
      subtitle: isActivation
        ? "Complete the Advanced Activation Wizard to unlock this feature and customize your inventory."
        : "Upgrade to Advanced tier to access this feature and many more."
    };
  };

  const contextMessage = getContextMessage();

  return (
    <Card className={`${featureInfo.borderColor} ${featureInfo.bgColor} border-2`}>
      <CardHeader className="text-center space-y-4">
        <div className={`mx-auto w-16 h-16 ${featureInfo.bgColor} rounded-full flex items-center justify-center`}>
          <IconComponent className={`w-8 h-8 ${featureInfo.color}`} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            {contextMessage.title}
          </CardTitle>
          <p className="text-slate-600">
            {contextMessage.subtitle}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feature Info */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <IconComponent className={`w-5 h-5 ${featureInfo.color}`} />
            <h4 className="font-semibold text-slate-900">{featureInfo.title}</h4>
          </div>
          <p className="text-sm text-slate-600">{featureInfo.description}</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">What you'll unlock:</h4>
          <div className="space-y-2">
            {benefits.slice(0, 4).map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">{benefit}</span>
              </div>
            ))}
            {benefits.length > 4 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">And {benefits.length - 4} more features...</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onUpgrade}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {useActivationSystem ? 'Start Activation' : 'Upgrade to Advanced'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>

        {/* Current Status Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            {useActivationSystem ? 'Advanced Features Available' : 'Current: Basic Tier'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== DEFAULT FALLBACK COMPONENT =====

const FeatureLockedFallback: React.FC<{
  feature: string;
  onUpgrade?: () => void;
}> = ({ feature, onUpgrade }) => {
  const featureInfo = FEATURE_INFO[feature] || {
    icon: Lock,
    title: 'Advanced Feature',
    description: 'This feature requires an Advanced tier subscription.',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  };

  const IconComponent = featureInfo.icon;

  return (
    <Alert className={`${featureInfo.bgColor} ${featureInfo.borderColor} border`}>
      <IconComponent className={`w-4 h-4 ${featureInfo.color}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">{featureInfo.title}</span>
          <span className="text-slate-600 ml-2">{featureInfo.description}</span>
        </div>
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade} className="ml-4">
            <Zap className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

// ===== MAIN FEATURE GATE COMPONENT =====

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  dealer,
  children,
  fallback,
  showUpgradePrompt = true,
  useActivationSystem = false,
  upgradeContext,
  className = ''
}) => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [tier, setTier] = useState<TierLevel>('basic');

  // Use new activation system if enabled
  const { checkFeatureAccess, activationStatus, isLoading } = useDealerActivationSettings();

  useEffect(() => {
    const currentTier = getDealerTier(dealer);
    setTier(currentTier);
  }, [dealer]);

  // Determine access based on system type
  const hasAccess = useActivationSystem
    ? checkFeatureAccess(feature)
    : hasFeatureAccess(dealer, feature);

  const shouldShowUpgrade = showUpgradePrompt && shouldPromptUpgrade(dealer, upgradeContext);
  const benefits = getUpgradeBenefits(upgradeContext);

  // If user has access, render children
  if (hasAccess && children) {
    return <>{children}</>;
  }

  // Handle upgrade action
  const handleUpgrade = () => {
    if (useActivationSystem) {
      // Use new activation wizard
      navigate(createPageUrl('Inventory?upgrade=true'));
    } else {
      // Use legacy tier upgrade
      navigate(createPageUrl('settings?tab=subscription'));
    }
  };

  const handleClosePrompt = () => {
    setShowPrompt(false);
  };

  // Show upgrade prompt if conditions met
  if (shouldShowUpgrade && showPrompt) {
    return (
      <div className={className}>
        <UpgradePrompt
          feature={feature}
          benefits={benefits}
          onUpgrade={handleUpgrade}
          onClose={handleClosePrompt}
          context={upgradeContext}
          useActivationSystem={useActivationSystem}
        />
      </div>
    );
  }

  // Show custom fallback or default locked message
  if (fallback) {
    return (
      <div className={className}>
        {typeof fallback === 'function' ? (fallback as any)({ onUpgrade: handleUpgrade }) : fallback}
      </div>
    );
  }

  // Show default fallback
  return (
    <div className={className}>
      <FeatureLockedFallback
        feature={feature}
        onUpgrade={shouldShowUpgrade ? handleUpgrade : undefined}
      />
    </div>
  );
};

// ===== HOOK FOR FEATURE CHECKING =====

export function useFeatureAccess(dealer?: Dealer | null, useActivationSystem: boolean = false) {
  const tier = getDealerTier(dealer);
  const tenantStage = getTenantStage(dealer);
  const limits = (tier === 'advanced') ? ADVANCED_TIER : BASIC_TIER;

  // Use activation system if enabled
  const { checkFeatureAccess: checkActivationFeature, activationStatus } = useDealerActivationSettings();

  const hasFeature = (feature: string) => {
    // Basic inventory features are always available
    const basicFeatures = [
      'inventory_management',
      'basic_analytics',
      'bulk_import',
      'transfer_between_branches',
      'basic_logistics',
      'marketplace_basic'
    ];

    if (basicFeatures.includes(feature)) {
      return true; // Always available
    }

    // Advanced features require activation
    return useActivationSystem
      ? checkActivationFeature(feature)
      : hasFeatureAccess(dealer, feature);
  };

  const canCreateBranch = (currentCount: number) => {
    if (useActivationSystem) {
      // Check if unlimited_branches feature is unlocked
      return checkActivationFeature('unlimited_branches') || currentCount < 2;
    }
    const { canCreateMoreBranches } = require('@/lib/tierConfig');
    return canCreateMoreBranches(dealer, currentCount);
  };

  const canBulkUpload = (rowCount: number) => {
    if (useActivationSystem) {
      // Check if bulk_operations feature is unlocked
      return checkActivationFeature('bulk_operations') || rowCount <= 200;
    }
    const { canPerformBulkUpload } = require('@/lib/tierConfig');
    return canPerformBulkUpload(dealer, rowCount);
  };

  return {
    tier,
    limits,
    activationStatus,
    hasFeature,
    canCreateBranch,
    canBulkUpload,
    shouldUpgrade: (context?: any) => shouldPromptUpgrade(dealer, context),
    upgradeBenefits: (context?: any) => getUpgradeBenefits(context)
  };
}

// ===== EXPORT DEFAULT =====

export default FeatureGate;
