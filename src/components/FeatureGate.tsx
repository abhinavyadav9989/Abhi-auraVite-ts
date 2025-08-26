import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Car, Eye, Handshake, Shield, CreditCard, MapPin, 
  ArrowRight, Lock, CheckCircle, AlertTriangle 
} from 'lucide-react';

interface FeatureGateProps {
  feature: 'add_vehicle' | 'view_prices' | 'make_deal' | 'full_access';
  user: any; // Replace with proper user type
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface FeatureRequirement {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}

const FEATURE_REQUIREMENTS: Record<string, FeatureRequirement[]> = {
  add_vehicle: [
    {
      key: 'has_branch',
      title: 'Add Branch Location',
      description: 'Vehicle inventory requires at least one branch location',
      icon: MapPin,
      estimatedTime: '2 minutes',
      actionUrl: '/quick-setup/branch',
      priority: 'high'
    }
  ],
  view_prices: [
    {
      key: 'kyc_completed',
      title: 'Complete KYC Verification',
      description: 'Identity verification required to view dealer prices',
      icon: Shield,
      estimatedTime: '5 minutes',
      actionUrl: '/verification/kyc',
      priority: 'high'
    }
  ],
  make_deal: [
    {
      key: 'bank_verified',
      title: 'Add Bank Details',
      description: 'Bank account required for secure transactions',
      icon: CreditCard,
      estimatedTime: '3 minutes',
      actionUrl: '/quick-setup/bank',
      priority: 'high'
    }
  ],
  full_access: [
    {
      key: 'kyb_completed',
      title: 'Complete KYB Verification',
      description: 'Business verification for full platform access',
      icon: Shield,
      estimatedTime: '15 minutes',
      actionUrl: '/verification/kyb',
      priority: 'medium'
    }
  ]
};

const FEATURE_DESCRIPTIONS = {
  add_vehicle: {
    title: 'Add Vehicle to Inventory',
    description: 'Manage your vehicle inventory and listings'
  },
  view_prices: {
    title: 'View Marketplace Prices',
    description: 'Access dealer pricing and vehicle details'
  },
  make_deal: {
    title: 'Participate in Deals',
    description: 'Make offers and complete transactions'
  },
  full_access: {
    title: 'Full Platform Access',
    description: 'Unlock all premium features and tools'
  }
};

function checkUserRequirements(user: any, requirements: FeatureRequirement[]): FeatureRequirement[] {
  if (!user) return requirements;
  
  return requirements.filter(req => {
    switch (req.key) {
      case 'has_branch':
        return !getVerificationStatus(user, 'branches_added');
      case 'kyc_completed':
        return !getVerificationStatus(user, 'kyc_completed');
      case 'bank_verified':
        return !getVerificationStatus(user, 'bank_details_added');
      case 'kyb_completed':
        return !getVerificationStatus(user, 'kyb_completed');
      default:
        return true;
    }
  });
}

// Helper function to get progressive verification status
function getVerificationStatus(user: any, key: string): boolean {
  // Most verification flags exist as direct columns: kyc_completed, bank_details_added, branches_added
  if (user && typeof user[key] === 'boolean') {
    return user[key];
  }
  
  // kyb_completed doesn't exist as a column, so check JSON field
  if (key === 'kyb_completed' && user?.onboarding_data?.progressive_verification) {
    return user.onboarding_data.progressive_verification[key] === true;
  }
  
  // Default to false if not found
  return false;
}

export function FeatureGate({ feature, user, children, fallback }: FeatureGateProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const requirements = FEATURE_REQUIREMENTS[feature] || [];
  const missingRequirements = checkUserRequirements(user, requirements);
  
  // If all requirements are met, render children
  if (missingRequirements.length === 0) {
    return <>{children}</>;
  }
  
  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  const featureInfo = FEATURE_DESCRIPTIONS[feature];
  
  return (
    <>
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {featureInfo.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {featureInfo.description}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-sm">
              {missingRequirements.length} step{missingRequirements.length > 1 ? 's' : ''} required
            </Badge>
          </div>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Unlock Feature <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
        requirements={missingRequirements}
        featureInfo={featureInfo}
      />
    </>
  );
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requirements: FeatureRequirement[];
  featureInfo: any;
}

function UpgradeModal({ isOpen, onClose, feature, requirements, featureInfo }: UpgradeModalProps) {
  const totalTime = requirements.reduce((total, req) => {
    const time = parseInt(req.estimatedTime);
    return total + (isNaN(time) ? 5 : time);
  }, 0);

  const handleStartVerification = (requirement: FeatureRequirement) => {
    // In a real app, this would navigate to the verification flow
    console.log(`Starting verification: ${requirement.key}`);
    onClose();
    // For now, we'll just close the modal
    // In the real implementation, this would navigate to the specific verification page
    window.location.href = requirement.actionUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Unlock {featureInfo.title}
          </DialogTitle>
          <DialogDescription>
            Complete the following steps to access this feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Estimated time:</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                ~{totalTime} minutes
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {requirements.map((requirement, index) => (
              <Card key={requirement.key} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <requirement.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {requirement.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {requirement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            requirement.priority === 'high' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {requirement.estimatedTime}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartVerification(requirement)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={() => handleStartVerification(requirements[0])} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Action Card component for dashboard
interface ActionCardProps {
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

export function ActionCard({ 
  title, 
  description, 
  action, 
  icon: Icon, 
  onClick, 
  priority = 'medium',
  estimatedTime 
}: ActionCardProps) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50'
  };

  const priorityTextColors = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-blue-700'
  };

  return (
    <Card className={`${priorityColors[priority]} border-2 hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{title}</h4>
              {estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  {estimatedTime}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              {action} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FeatureGate;
