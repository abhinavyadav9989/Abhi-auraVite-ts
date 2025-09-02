import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BranchSetupModal from '@/components/modals/BranchSetupModal';
import BankDetailsModal from '@/components/modals/BankDetailsModal';
import { 
  MapPin, Shield, CreditCard, CheckCircle, Clock, 
  Car, Eye, Handshake, Zap, ArrowRight 
} from 'lucide-react';

interface ProgressiveVerificationCardsProps {
  dealer: any;
  user: any;
  onUpdate?: () => void;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
  unlocks: string[];
  estimatedTime: string;
  action: () => void;
}

export default function ProgressiveVerificationCards({ dealer, user, onUpdate }: ProgressiveVerificationCardsProps) {
  const navigate = useNavigate();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const handleBranchAdded = (branch: any) => {
    console.log('Branch added:', branch);
    // In a real app, update the dealer profile
    onUpdate?.();
  };

  const handleBankDetailsAdded = (bankDetails: any) => {
    console.log('Bank details added:', bankDetails);
    // In a real app, update the dealer profile
    onUpdate?.();
  };

  const verificationSteps: VerificationStep[] = [
    {
      id: 'branch',
      title: 'Add Branch Location',
      description: 'Required to add vehicles to your inventory',
      icon: MapPin,
      completed: dealer?.branches_added || false,
      required: true,
      unlocks: ['Add Vehicles', 'Inventory Management'],
      estimatedTime: '2 min',
      action: () => setShowBranchModal(true)
    },
    {
      id: 'kyc',
      title: 'Complete KYC',
      description: 'Identity verification to view marketplace prices',
      icon: Shield,
      completed: dealer?.kyc_completed || false,
      required: false,
      unlocks: ['View Prices', 'Dealer Details', 'Market Insights'],
      estimatedTime: '5 min',
      action: () => navigate(createPageUrl('KYBWizard'))
    },
    {
      id: 'bank',
      title: 'Add Bank Details',
      description: 'Required for secure payments and deals',
      icon: CreditCard,
      completed: dealer?.bank_details_added || false,
      required: false,
      unlocks: ['Make Deals', 'Receive Payments', 'Escrow Services'],
      estimatedTime: '3 min',
      action: () => setShowBankModal(true)
    },
    {
      id: 'kyb',
      title: 'Complete KYB',
      description: 'Business verification for full platform access',
      icon: Shield,
      completed: dealer?.kyb_completed || false,
      required: false,
      unlocks: ['Premium Features', 'API Access', 'White-label Solutions'],
      estimatedTime: '15 min',
      action: () => navigate(createPageUrl('KYBWizard'))
    }
  ];

  const completedSteps = verificationSteps.filter(step => step.completed).length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Verification Progress
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete verification steps to unlock features
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Verification Steps */}
          <div className="space-y-4">
            {verificationSteps.map((step) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : step.required 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white border-2 border-gray-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <div className="flex items-center gap-2">
                        {step.required && !step.completed && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Unlocks:</span>
                        <span className="text-blue-600 font-medium">
                          {step.unlocks.slice(0, 2).join(', ')}
                          {step.unlocks.length > 2 && ` +${step.unlocks.length - 2} more`}
                        </span>
                      </div>
                      
                      {!step.completed && (
                        <Button 
                          size="sm" 
                          onClick={step.action}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {step.required ? 'Complete Now' : 'Start'}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions for Incomplete Required Steps */}
          {verificationSteps.some(step => step.required && !step.completed) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Action Required</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Complete required steps to unlock core features like adding vehicles.
              </p>
              <div className="flex gap-2">
                {verificationSteps
                  .filter(step => step.required && !step.completed)
                  .map(step => (
                    <Button 
                      key={step.id}
                      size="sm" 
                      onClick={step.action}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {step.title}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* All Complete State */}
          {completedSteps === totalSteps && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800 mb-1">All Set!</h4>
              <p className="text-sm text-green-700">
                You've completed all verification steps and have access to all features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BranchSetupModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onBranchAdded={handleBranchAdded}
        dealerId={dealer?.id || ''}
      />

      <BankDetailsModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onBankDetailsAdded={handleBankDetailsAdded}
        dealerId={dealer?.id || ''}
      />
    </>
  );
}

// Hook for checking feature access
export function useFeatureAccess(dealer: any) {
  return {
    canAddVehicles: dealer?.branches_added || false,
    canViewPrices: dealer?.kyc_completed || false,
    canMakeDeals: dealer?.bank_details_added || false,
    hasFullAccess: dealer?.kyb_completed || false,
    
    // Requirements
    needsBranch: !dealer?.branches_added,
    needsKYC: !dealer?.kyc_completed,
    needsBankDetails: !dealer?.bank_details_added,
    needsKYB: !dealer?.kyb_completed
  };
}
