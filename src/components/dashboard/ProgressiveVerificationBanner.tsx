import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Shield, CreditCard, CheckCircle, Clock, ArrowRight, 
  Car, Eye, Handshake, Zap, Building2, AlertTriangle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BranchSetupModal from '@/components/modals/BranchSetupModal';
import BankDetailsModal from '@/components/modals/BankDetailsModal';

interface ProgressiveVerificationBannerProps {
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
  priority: 'high' | 'medium' | 'low';
}

export default function ProgressiveVerificationBanner({ dealer, user, onUpdate }: ProgressiveVerificationBannerProps) {
  const navigate = useNavigate();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const verificationSteps: VerificationStep[] = [
    {
      id: 'branch',
      title: 'Add Branch Location',
      description: 'Required to add vehicles to your inventory',
      icon: Building2,
      completed: dealer?.branches_added || false,
      required: true,
      unlocks: ['🚗 Add Vehicles', '📊 Inventory Management', '📍 Location Tags'],
      estimatedTime: '2 min',
      priority: 'high',
      action: () => setShowBranchModal(true)
    },
    {
      id: 'kyc',
      title: 'Complete KYC Verification',
      description: 'Identity verification to view marketplace prices',
      icon: Shield,
      completed: dealer?.kyc_completed || false,
      required: false,
      unlocks: ['💰 View Market Prices', '👥 Dealer Contact Details', '📈 Market Insights', '🔍 Advanced Filters'],
      estimatedTime: '5 min',
      priority: 'high',
      action: () => navigate(createPageUrl('KYBWizard'))
    },
    {
      id: 'bank',
      title: 'Add Bank Details',
      description: 'Required for secure payments and deals',
      icon: CreditCard,
      completed: dealer?.bank_details_added || false,
      required: false,
      unlocks: ['🤝 Make Deals', '💳 Receive Payments', '🔒 Escrow Services', '📋 Transaction History'],
      estimatedTime: '3 min',
      priority: 'high',
      action: () => setShowBankModal(true)
    },
    {
      id: 'kyb',
      title: 'Complete Business Verification',
      description: 'Business verification for full platform access',
      icon: Shield,
      completed: dealer?.kyb_completed || false,
      required: false,
      unlocks: ['⭐ Premium Features', '🔗 API Access', '🏷️ White-label Solutions', '📊 Advanced Analytics'],
      estimatedTime: '15 min',
      priority: 'low',
      action: () => navigate(createPageUrl('BusinessVerification'))
    }
  ];

  const completedSteps = verificationSteps.filter(step => step.completed).length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const nextStep = verificationSteps.find(step => !step.completed);
  const incompleteSteps = verificationSteps.filter(step => !step.completed);

  // Always show for debugging purposes - we can add condition back later
  // if (completedSteps === totalSteps) {
  //   return null;
  // }
  
  console.log('ProgressiveVerificationBanner - Dealer object:', dealer);
  console.log('ProgressiveVerificationBanner - Verification steps:', verificationSteps.map(s => ({ id: s.id, completed: s.completed })));

  const handleBranchAdded = (branch: any) => {
    console.log('Branch added:', branch);
    onUpdate?.();
    setShowBranchModal(false);
  };

  const handleBankDetailsAdded = (bankDetails: any) => {
    console.log('Bank details added:', bankDetails);
    onUpdate?.();
    setShowBankModal(false);
  };

  if (isCollapsed) {
    return (
      <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 shadow-lg backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">
                  {incompleteSteps.length} verification step{incompleteSteps.length > 1 ? 's' : ''} pending
                </span>
                <div className="text-sm text-gray-600">
                  Complete to unlock more features • {Math.round(progressPercentage)}% done
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="bg-white/50 hover:bg-white/80 border-gray-200"
            >
              Show Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        
        <CardHeader className="pb-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Unlock Platform Features
                  {nextStep?.priority === 'high' && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse">
                      Action Required
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Complete verification steps to access advanced functionality
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {completedSteps}/{totalSteps}
                </div>
                <div className="text-sm text-gray-500 font-medium">Complete</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-gray-600 hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">Overall Progress</span>
              <span className="font-bold text-lg">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-4 bg-gray-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-80" 
                   style={{width: `${progressPercentage}%`}}></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Next Action Section */}
          {nextStep && (
            <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <nextStep.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{nextStep.title}</h3>
                      <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700">
                        ⏱️ {nextStep.estimatedTime}
                      </Badge>
                      {nextStep.priority === 'high' && (
                        <Badge className="text-xs bg-red-500 hover:bg-red-600 text-white animate-pulse">
                          🚨 Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{nextStep.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">🔓 This will unlock:</p>
                      <div className="flex flex-wrap gap-2">
                        {nextStep.unlocks.map((unlock) => (
                          <Badge key={unlock} className="text-xs bg-green-100 text-green-700 border-green-200">
                            ✨ {unlock}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={nextStep.action}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* All Steps Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Verification Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    step.completed
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm'
                      : step.id === nextStep?.id
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 border-2 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.id === nextStep?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      step.completed 
                        ? 'bg-green-200 text-green-700'
                        : step.id === nextStep?.id
                        ? 'bg-blue-200 text-blue-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{step.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Unlocks:</p>
                    <div className="flex flex-wrap gap-1">
                      {step.unlocks.slice(0, 2).map((unlock) => (
                        <Badge key={unlock} variant="outline" className="text-xs">
                          {unlock}
                        </Badge>
                      ))}
                      {step.unlocks.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{step.unlocks.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showBranchModal && (
        <BranchSetupModal
          isOpen={showBranchModal}
          onClose={() => setShowBranchModal(false)}
          dealerId={dealer?.id}
          onBranchAdded={handleBranchAdded}
        />
      )}

      {showBankModal && (
        <BankDetailsModal
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          dealerId={dealer?.id}
          onBankDetailsAdded={handleBankDetailsAdded}
        />
      )}
    </>
  );
}
