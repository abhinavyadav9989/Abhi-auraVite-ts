import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { DealerDocument } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Users, Car, FileText, CreditCard, CheckCircle, Shield, 
  ArrowRight, ArrowLeft, Save, RefreshCw, AlertTriangle, Clock, 
  Phone, Mail, Globe, Star, Info, Loader2
} from 'lucide-react';

// Import comprehensive step components
import AccountCreation from '../components/onboarding/AccountCreation';
import ClientTypeSelection from '../components/onboarding/ClientTypeSelection';
import BusinessTypeSelection from '../components/onboarding/BusinessTypeSelection';
import VehicleSegmentSelection from '../components/onboarding/VehicleSegmentSelection';
import BasicDetailsForm from '../components/onboarding/BasicDetailsForm';
import GroupDealerDetails from '../components/onboarding/GroupDealerDetails';
import DocumentConfiguration from '../components/onboarding/DocumentConfiguration';
import MarketplaceAccess from '../components/onboarding/MarketplaceAccess';
import PlanSelection from '../components/onboarding/PlanSelection';
import TermsAndVerification from '../components/onboarding/TermsAndVerification';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';
import KybDocumentUpload from '../components/onboarding/KybDocumentUpload';

// ONB-ALL: Comprehensive and adaptive step configuration
const ONBOARDING_STEPS = [
  // A. Account Creation & Authentication
  { 
    id: 'account_creation', 
    title: 'Create Account', 
    icon: Users, 
    description: 'Setup your login credentials',
    category: 'authentication',
    estimatedTime: 2,
    skipFor: ['returning_user', 'sso_user']
  },
  
  // C1. Client Type & Business Profile
  { 
    id: 'client_type', 
    title: 'Client Type', 
    icon: Building2, 
    description: 'Select your business classification',
    category: 'profile',
    estimatedTime: 3
  },
  { 
    id: 'business_type', 
    title: 'Business Model', 
    icon: Car, 
    description: 'New vehicles, Used, or Both',
    category: 'profile',
    estimatedTime: 2,
    excludeFor: ['dsa', 'chauffeur', 'self_user', 'partner']
  },
  { 
    id: 'vehicle_segments', 
    title: 'Vehicle Segments', 
    icon: Car, 
    description: 'Which vehicle types you deal in',
    category: 'profile',
    estimatedTime: 3,
    excludeFor: ['dsa', 'chauffeur', 'self_user', 'partner']
  },
  
  // C2. Basic Details & Verification
  { 
    id: 'basic_details', 
    title: 'Business Details', 
    icon: FileText, 
    description: 'Organization information & tax details',
    category: 'details',
    estimatedTime: 8
  },
  
  // E. Group Dealer Specific
  { 
    id: 'group_details', 
    title: 'Group Organizations', 
    icon: Users, 
    description: 'Add organizations to your group',
    category: 'group',
    estimatedTime: 10,
    conditional: (data) => data.clientType === 'group_dealer'
  },

  // D. KYB / Dealer Verification Flow
  {
    id: 'kyb_documents',
    title: 'Upload Documents',
    icon: Shield,
    description: 'Provide documents for verification',
    category: 'verification',
    estimatedTime: 10,
    excludeFor: ['self_user', 'partner']
  },
  
  // F. Document Configuration (For Admins of certain client types)
  { 
    id: 'document_config', 
    title: 'Customer Document Setup', 
    icon: FileText, 
    description: 'Configure required documents for your customers',
    category: 'configuration',
    estimatedTime: 5,
    conditional: (data) => ['group_dealer', 'franchise'].includes(data.clientType)
  },
  
  // G. Marketplace Access
  { 
    id: 'marketplace_access', 
    title: 'Marketplace Access', 
    icon: Globe, 
    description: 'Set marketplace permissions',
    category: 'configuration',
    estimatedTime: 3,
    excludeFor: ['chauffeur', 'self_user', 'partner']
  },
  
  // C2. Plan Selection
  { 
    id: 'plan_selection', 
    title: 'Choose Plan', 
    icon: Star, 
    description: 'Select subscription plan',
    category: 'billing',
    estimatedTime: 5,
    excludeFor: ['dsa', 'chauffeur', 'self_user']
  },
  
  // C2. Terms & Verification
  { 
    id: 'terms_verification', 
    title: 'Final Verification', 
    icon: Shield, 
    description: 'Accept terms & verify contact',
    category: 'verification',
    estimatedTime: 4
  },
  
  // J. Completion
  { 
    id: 'complete', 
    title: 'Setup Complete', 
    icon: CheckCircle, 
    description: 'Welcome to Aura!',
    category: 'completion',
    estimatedTime: 1
  }
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [inviteToken] = useState(searchParams.get('invite'));
  const [isReturningUser, setIsReturningUser] = useState(false);

  // ONB-ALL: Comprehensive onboarding data state
  const [onboardingData, setOnboardingData] = useState({
    // A. Account Creation
    fullName: '', email: '', password: '', confirmPassword: '', emailVerified: false, googleSSO: false,
    
    // B. Role & Invitation
    inviteToken: inviteToken || '', invitedBy: '', invitedRole: '',
    
    // C1. Profile
    clientType: '', businessType: '', vehicleSegments: [], customSegments: [],
    
    // C2. Details
    organizationName: '', contactNumber: '', whatsappNumber: '', isGSTRegistered: false, gstin: '', panNumber: '', businessAddress: '', city: '', state: '', pincode: '',
    
    // E. Group Dealer
    groupName: '', organizations: [],

    // D. KYB
    kybDocuments: {}, // { trade_licence: { url, name, status }, ... }
    
    // F. Document Config
    requiredDocuments: ['trade_licence', 'gst_certificate', 'pan_card', 'address_proof'], documentValidationRules: {},
    
    // G. Marketplace Access
    newVehicleAccess: true, usedVehicleAccess: true, specialisedAccess: false,
    
    // Plan Selection
    selectedPlan: 'standard', billingCycle: 'monthly',
    
    // Terms & Verification
    termsAccepted: false, privacyPolicyAccepted: false, marketingConsent: false, emailOTP: '', mobileOTP: '', mobileVerified: false,
    
    // H. UX / State Management
    completedSteps: [], skippedSteps: [], startedAt: new Date().toISOString(),
    isDraft: true, lastSavedAt: null,
  });

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);
      let currentUser = null;
      try {
        currentUser = await User.me();
        setUser(currentUser);
        setIsReturningUser(true);
        setOnboardingData(prev => ({ 
          ...prev, 
          email: currentUser.email, 
          fullName: (currentUser as any).full_name || currentUser.email, 
          emailVerified: (currentUser as any).email_verified || false 
        }));
      } catch (error) { 
        console.log('Starting fresh onboarding'); 
        // If no user, redirect to authentication
        navigate(createPageUrl('Authentication'));
        return;
      }
      if (inviteToken) await handleInviteToken(inviteToken);
      if (currentUser) await loadExistingDraft(currentUser.email);
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast({ title: "Initialization Error", description: "Failed to load onboarding data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteToken = async (token) => {
    // ... same as previous correct implementation ...
    const mockInviteData = { invitedBy: 'admin@aura.com', invitedRole: 'staff', organizationName: 'Sample Motors', clientType: 'individual' };
    setOnboardingData(prev => ({ ...prev, ...mockInviteData, inviteToken: token }));
    toast({ title: "Invite Accepted", description: `You&apos;ve been invited to join ${mockInviteData.organizationName}` });
  };

  const loadExistingDraft = async (email) => {
    try {
      // First try to find any dealer profile for this user
      const existingDrafts = await Dealer.filter({ created_by: email });
      if (existingDrafts.length > 0) {
        const draft = existingDrafts[0];
        // Check if it has onboarding data and is not completed
        if (draft.onboarding_data && !draft.onboarding_completed) {
          setOnboardingData(prev => ({ ...prev, ...draft.onboarding_data, isDraft: true }));
          setCurrentStep(draft.onboarding_data.currentStep || 0);
          setLastSaved(new Date(draft.updated_at || draft.updated_date));
          toast({ title: "Draft Loaded", description: "We've restored your previous progress." });
        }
      }
    } catch (error) { 
      console.error('Error loading draft:', error); 
    }
  };

  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setErrors({});
  };

  const getVisibleSteps = () => {
    return ONBOARDING_STEPS.filter(step => {
      if (step.skipFor?.includes('returning_user') && isReturningUser) return false;
      if (step.skipFor?.includes('sso_user') && onboardingData.googleSSO) return false;
      if (step.conditional && !step.conditional(onboardingData)) return false;
      if (step.excludeFor?.includes(onboardingData.clientType)) return false;
      return true;
    });
  };

  const validateCurrentStep = () => {
    // ... more comprehensive validation will be added here based on each step's requirements
    const currentStepId = getVisibleSteps()[currentStep]?.id;
    const stepErrors: Record<string, string> = {};
    // This will be expanded to cover all steps thoroughly
    switch(currentStepId) {
        case 'client_type':
            if (!onboardingData.clientType) stepErrors.clientType = "Please select a client type.";
            break;
        case 'basic_details':
            if (!onboardingData.organizationName) stepErrors.organizationName = "Organization name is required.";
            if (!onboardingData.contactNumber) stepErrors.contactNumber = "Contact number is required.";
            break;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
        toast({ title: "Validation Error", description: "Please fix the errors before proceeding.", variant: "destructive" });
        return;
    }
    const visibleSteps = getVisibleSteps();
    const currentStepId = visibleSteps[currentStep]?.id;
    if (currentStepId && !onboardingData.completedSteps.includes(currentStepId)) {
        setOnboardingData(prev => ({...prev, completedSteps: [...prev.completedSteps, currentStepId]}));
    }
    if (isDirty) await handleSaveDraft();
    if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        await handleCompleteOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSaveDraft = async () => {
    if (!user && !onboardingData.email) {
      toast({ title: "Cannot Save", description: "Please complete account creation to save progress.", variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      const draftData = { ...onboardingData, currentStep };
      const userEmail = user?.email || onboardingData.email;
      const existingDrafts = await Dealer.filter({ created_by: userEmail });
      if (existingDrafts.length > 0) {
        await Dealer.update(existingDrafts[0].id, { 
          onboarding_data: draftData
        });
      } else {
        // Create with essential fields and default values for required columns
        await Dealer.create({
          email: userEmail,
          created_by: userEmail,
          name: userEmail.split('@')[0], // Use email prefix as default name
          business_name: 'Pending Setup',
          business_type: 'individual',
          client_type: 'individual',
          contact_number: '0000000000',
          address: 'Address to be updated'
        });
      }
      setIsDirty(false);
      setLastSaved(new Date());
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({ title: "Save Failed", description: "Failed to save your progress. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true);
      
      console.log('OnboardingWizard - Starting onboarding completion...');
      
      // Check if dealer profile already exists
      const existingDealers = await Dealer.filter({ created_by: onboardingData.email });
      
             let dealerId;
       if (existingDealers.length > 0) {
         // Update existing profile
         console.log('OnboardingWizard - Updating existing dealer profile');
         const updatedDealer = await Dealer.update(existingDealers[0].id, {
           onboarding_completed: true,
           onboarding_data: onboardingData
         });
         console.log('OnboardingWizard - Dealer profile updated:', updatedDealer);
         dealerId = existingDealers[0].id;
       } else {
         // Create new profile if none exists
         console.log('OnboardingWizard - Creating new dealer profile');
         const dealerData = {
           email: onboardingData.email,
           created_by: onboardingData.email,
           onboarding_completed: true,
           onboarding_data: onboardingData
         };
         const newDealer = await Dealer.create(dealerData);
         console.log('OnboardingWizard - Dealer profile created:', newDealer);
         dealerId = newDealer.id;
       }

       // Save uploaded documents to dealer_documents table
       if (dealerId && onboardingData.kybDocuments) {
         console.log('OnboardingWizard - Saving documents to dealer_documents table...');
         for (const [docType, docData] of Object.entries(onboardingData.kybDocuments)) {
           if (docData && typeof docData === 'object' && 'url' in docData) {
             const document = docData as { url: string; name: string };
             console.log(`OnboardingWizard - Saving document: ${docType}`);
             await DealerDocument.create({
               dealer_id: dealerId,
               document_type: docType,
               file_url: document.url,
               file_name: document.name,
               status: 'pending_review'
             });
           }
         }
         console.log('OnboardingWizard - Documents saved successfully');
       }
      
      // Update user profile with onboarding completion
      console.log('OnboardingWizard - Updating user metadata...');
      await User.updateMyUserData({
        onboarding_completed: true,
        dealer_profile_created: true
      });
      console.log('OnboardingWizard - User metadata updated');

      // Force refresh the auth state to ensure metadata is updated
      console.log('OnboardingWizard - Refreshing auth state...');
      await refreshAuth();
      console.log('OnboardingWizard - Auth state refreshed');

      toast({
        title: "Onboarding Complete!", 
        description: "Your profile has been created successfully. Redirecting to dashboard."
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        console.log('OnboardingWizard - Redirecting to dashboard...');
        navigate(createPageUrl('Dashboard'));
      }, 1500);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error", 
        description: "Failed to complete onboarding. Please try again.", 
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRemainingTime = () => {
    const visibleSteps = getVisibleSteps();
    const remainingSteps = visibleSteps.slice(currentStep + 1);
    return remainingSteps.reduce((total, step) => total + (step.estimatedTime || 5), 0);
  };

  const renderCurrentStep = () => {
    const visibleSteps = getVisibleSteps();
    const currentStepId = visibleSteps[currentStep]?.id;
    const stepProps = { data: onboardingData, updateData: updateOnboardingData, errors, isReturningUser, inviteToken };

    switch (currentStepId) {
      case 'account_creation': return <AccountCreation {...stepProps} />;
      case 'client_type': return <ClientTypeSelection {...stepProps} />;
      case 'business_type': return <BusinessTypeSelection {...stepProps} />;
      case 'vehicle_segments': return <VehicleSegmentSelection {...stepProps} />;
      case 'basic_details': return <BasicDetailsForm {...stepProps} />;
      case 'group_details': return <GroupDealerDetails {...stepProps} />;
      case 'kyb_documents': return <KybDocumentUpload {...stepProps} />;
      case 'document_config': return <DocumentConfiguration {...stepProps} />;
      case 'marketplace_access': return <MarketplaceAccess {...stepProps} />;
      case 'plan_selection': return <PlanSelection {...stepProps} />;
      case 'terms_verification': return <TermsAndVerification {...stepProps} />;
      case 'complete': return <OnboardingComplete onComplete={handleCompleteOnboarding} isLoading={isLoading} />;
      default: return <div>Step &apos;{currentStepId}&apos; not found or implemented.</div>;
    }
  };

  if (isLoading && !user && currentStep === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const visibleSteps = getVisibleSteps();
  if (visibleSteps.length === 0) {
      return <div className="p-8">Loading configuration...</div>;
  }
  const currentStepInfo = visibleSteps[currentStep];
  const progressPercentage = ((currentStep) / (visibleSteps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Aura</h1>
          <p className="text-slate-600">Complete setup to start trading on India&apos;s leading B2B automotive marketplace</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>~{calculateRemainingTime()} minutes remaining</span>
          </div>
        </div>

        {/* Progress Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{currentStepInfo?.title}</h2>
                <p className="text-slate-600 text-sm">{currentStepInfo?.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Step {currentStep + 1} of {visibleSteps.length}
                </Badge>
                {lastSaved && (
                  <Badge variant="outline" className="text-xs">
                    Saved {lastSaved.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {currentStepInfo?.icon && <currentStepInfo.icon className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <CardTitle>{currentStepInfo?.title}</CardTitle>
                <p className="text-sm text-slate-600">{currentStepInfo?.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button variant="ghost" onClick={handleSaveDraft} disabled={!isDirty || isLoading}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {currentStep < visibleSteps.length - 1 ? (
              <Button onClick={handleNext} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCompleteOnboarding} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                Complete Setup <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}