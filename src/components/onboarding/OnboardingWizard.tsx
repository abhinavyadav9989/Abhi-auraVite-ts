import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { onboardingAPI, OnboardingProgress } from '@/api/onboardingAPI';
import { Dealer } from '@/api/entityAdapters';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

// Import step components
import ClientTypeStep from './steps/ClientTypeStep';
import BusinessModeStep from './steps/BusinessModeStep';
import OrganizationStep from './steps/OrganizationStep';
import BranchesStep from './steps/BranchesStep';
import TeamStep from './steps/TeamStep';
import KYBDocumentsStep from './steps/KYBDocumentsStep';
import BankDetailsStep from './steps/BankDetailsStep';
import PlanSelectionStep from './steps/PlanSelectionStep';
import TermsConsentStep from './steps/TermsConsentStep';

interface OnboardingData {
  clientType?: string;
  businessMode?: any;
  organization?: any;
  branches?: any[];
  team?: any[];
  kybDocuments?: any;
  bankDetails?: any;
  planSelection?: any;
  consent?: any;
}

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealer, setDealer] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  const steps = [
    { id: 1, component: ClientTypeStep, title: "Business Type", description: "What type of business are you?" },
    { id: 2, component: BusinessModeStep, title: "Trading Preferences", description: "What do you trade?" },
    { id: 3, component: OrganizationStep, title: "Organization Details", description: "Your business information" },
    { id: 4, component: BranchesStep, title: "Branches", description: "Add your business locations (optional)" },
    { id: 5, component: TeamStep, title: "Team", description: "Invite team members (optional)" },
    { id: 6, component: KYBDocumentsStep, title: "KYB Documents", description: "Upload required documents" },
    { id: 7, component: BankDetailsStep, title: "Bank Details", description: "Payment and settlement information" },
    { id: 8, component: PlanSelectionStep, title: "Access & Plans", description: "Choose your plan and features" },
    { id: 9, component: TermsConsentStep, title: "Terms & Consent", description: "Legal agreements and permissions" }
  ];

  // Load dealer and existing progress on mount
  useEffect(() => {
    loadDealerAndProgress();
  }, [user]);

    const loadDealerAndProgress = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      console.log('Loading dealer for user:', user.email);
      console.log('User metadata:', user.user_metadata);
      console.log('User full name from metadata:', user.user_metadata?.full_name);
      
      // Load dealer data
      const dealerProfiles = await Dealer.filter({ created_by: user.email });
      console.log('Found dealer profiles:', dealerProfiles);
      
      if (dealerProfiles.length > 0) {
        const dealerData = dealerProfiles[0];
        console.log('Using existing dealer:', dealerData);
        setDealer(dealerData);
        await loadProgress(dealerData.id);
      } else {
        console.log('No dealer found, creating new one...');
        
        // Check if there's already a dealer with this email to avoid duplicates
        const existingDealers = await Dealer.filter({ email: user.email });
        if (existingDealers.length > 0) {
          console.log('Found existing dealer with email, using it:', existingDealers[0]);
          setDealer(existingDealers[0]);
          await loadProgress(existingDealers[0].id);
          return;
        }
        
        // If no dealer exists, create one
        const dealerData = {
          email: user.email, // Required field
          name: user.user_metadata?.full_name || user.email.split('@')[0], // Required field - use full name from metadata or email prefix
          created_by: user.email,
          user_type: 'individual_org',
          access_level: 'L1',
          onboarding_progress: {},
          verification_status_new: 'pending',
          onboarding_completed: false
        };
        console.log('Creating dealer with data:', dealerData);
        
        try {
          const newDealer = await Dealer.create(dealerData);
          console.log('New dealer created:', newDealer);
          setDealer(newDealer);
        } catch (createError) {
          console.error('Error creating dealer:', createError);
          
          // If creation failed due to duplicate, try to find the existing dealer
          if (createError.code === '23505' || createError.message?.includes('duplicate')) {
            console.log('Duplicate dealer detected, trying to find existing dealer...');
            const existingDealers = await Dealer.filter({ email: user.email });
            if (existingDealers.length > 0) {
              console.log('Found existing dealer after creation error:', existingDealers[0]);
              setDealer(existingDealers[0]);
              await loadProgress(existingDealers[0].id);
              return;
            }
          }
          
          throw createError;
        }
      }
    } catch (error) {
      console.error('Error loading dealer:', error);
      toast.error('Failed to load dealer data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async (dealerId: string) => {
    try {
      const progressData = await onboardingAPI.getProgress(dealerId);
      setProgress(progressData);
      setOnboardingData(progressData.data);
      
      // Set current step to next incomplete step
      if (progressData.currentStep <= steps.length) {
        setCurrentStep(progressData.currentStep);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load onboarding progress');
    }
  };

  const saveStep = async (stepData: any, stepName: string) => {
    if (!dealer?.id) return;

    try {
      setIsSaving(true);
      await onboardingAPI.saveStep(dealer.id, stepName, stepData, currentStep);
      
      // Update local state
      setOnboardingData(prev => ({ ...prev, [stepName]: stepData }));
      
      // If this is organization step, also update dealer table fields immediately
      if (stepName === 'organization_details' && stepData) {
        const dealerUpdateData = mapOnboardingDataToDealerFields({ organization: stepData });
        console.log('Updating dealer table with organization data:', dealerUpdateData);
        await Dealer.update(dealer.id, dealerUpdateData);
      }
      
      // If this is bank details step, save to bank_details table
      if (stepName === 'bank_details' && stepData) {
        console.log('Saving bank details:', stepData);
        try {
          // First, try to delete any existing bank details for this dealer
          const { error: deleteError } = await supabase
            .from('bank_details')
            .delete()
            .eq('dealer_id', dealer.id);
          
          if (deleteError) {
            console.error('Error deleting existing bank details:', deleteError);
          }
          
          // Then insert new bank details
          const { error: insertError } = await supabase
            .from('bank_details')
            .insert({
              dealer_id: dealer.id,
              account_holder_name: stepData.accountHolderName,
              account_number: stepData.accountNumber,
              ifsc_code: stepData.ifscCode,
              bank_name: stepData.bankName,
              cancelled_cheque_url: stepData.cancelledCheque?.url || null,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error inserting bank details:', insertError);
          } else {
            console.log('Bank details saved successfully');
          }
        } catch (error) {
          console.error('Error saving bank details:', error);
        }
      }
      
      // Reload progress
      await loadProgress(dealer.id);
      
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      const stepName = steps[currentStep - 1].title.toLowerCase().replace(/\s+/g, '_');
      await saveStep(stepData, stepName);
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Update the current step in the database
      await onboardingAPI.saveStep(dealer.id, 'current_step', { step: nextStep }, nextStep);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      const previousStep = currentStep - 1;
      setCurrentStep(previousStep);
      // Update the current step in the database
      await onboardingAPI.saveStep(dealer.id, 'current_step', { step: previousStep }, previousStep);
    }
  };

  const handleSkip = async () => {
    const stepName = steps[currentStep - 1].title.toLowerCase().replace(/\s+/g, '_');
    await saveStep({ skipped: true }, stepName);
    handleNext();
  };

  const completeOnboarding = async () => {
    if (!dealer?.id) {
      toast.error('No dealer found');
      return;
    }

    try {
      console.log('Starting onboarding completion for dealer:', dealer.id);
      setIsSaving(true);
      
      // First, let's try to save the current step data
      const stepName = steps[currentStep - 1].title.toLowerCase().replace(/\s+/g, '_');
      console.log('Saving final step data:', stepName, onboardingData);
      
      await onboardingAPI.saveStep(dealer.id, stepName, onboardingData);
      
      // Map onboarding data to dealer table fields
      const dealerUpdateData = mapOnboardingDataToDealerFields(onboardingData);
      console.log('Mapped dealer data:', dealerUpdateData);
      
      // Update dealer table with the mapped data
      await Dealer.update(dealer.id, dealerUpdateData);
      
      // Documents are now uploaded directly to dealer_documents table during upload
      // No migration needed anymore
      console.log('Documents already uploaded to dealer_documents table during onboarding steps');
      
      // Then complete the onboarding
      console.log('Calling onboardingAPI.complete...');
      await onboardingAPI.complete(dealer.id);
      
      // Update user metadata to reflect completed onboarding
      console.log('Updating user metadata...');
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            dealer_profile_created: true,
            dealer_id: dealer.id
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        } else {
          console.log('User metadata updated successfully');
        }
      } catch (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
      
      console.log('Onboarding completed successfully!');
      toast.success('Onboarding completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(`Failed to complete onboarding: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Map onboarding data to dealer table fields
  const mapOnboardingDataToDealerFields = (data: OnboardingData) => {
    const mappedData: any = {
      onboarding_completed: true,
      verification_status_new: 'pending'
    };

    // Map organization data
    if (data.organization) {
      mappedData.business_name = data.organization.businessName || data.organization.organizationName;
      mappedData.owner_name = data.organization.ownerName || data.organization.contactPerson;
      mappedData.gstin = data.organization.gstin;
      mappedData.pan_number = data.organization.panNumber;
      mappedData.phone = data.organization.phone || data.organization.contactNumber;
      mappedData.whatsapp = data.organization.whatsapp || data.organization.whatsappNumber;
      mappedData.address = data.organization.address || data.organization.businessAddress;
      mappedData.city = data.organization.city;
      mappedData.state = data.organization.state;
      mappedData.pincode = data.organization.pincode;
      mappedData.website = data.organization.website;
      mappedData.description = data.organization.description || data.organization.aboutBusiness;
    }

    // Map bank details
    if (data.bankDetails) {
      // Bank details will be saved to bank_details table separately
      // but we can store a reference in dealer table if needed
    }

    // Map user type and access level
    if (data.clientType) {
      mappedData.user_type = data.clientType;
    }

    console.log('Mapping onboarding data to dealer fields:', { data, mappedData });
    return mappedData;
  };

  const getStepStatus = (stepId: number) => {
    if (!progress) return 'pending';
    
    const stepName = steps[stepId - 1].title.toLowerCase().replace(/\s+/g, '_');
    const stepData = progress.data[stepName];
    
    if (stepData && (stepData === true || (typeof stepData === 'object' && !stepData.skipped))) {
      return 'completed';
    } else if (stepData && stepData.skipped) {
      return 'skipped';
    } else {
      return 'pending';
    }
  };

  // Calculate progress based on current step and completed steps
  const calculateProgress = () => {
    if (!progress) return 0;
    
    const completedSteps = steps.filter((_, index) => {
      const stepId = index + 1;
      const status = getStepStatus(stepId);
      return status === 'completed';
    }).length;
    
    // Add current step if it's not completed yet
    const currentStepStatus = getStepStatus(currentStep);
    const totalProgress = currentStepStatus === 'completed' ? completedSteps : completedSteps + 1;
    
    return Math.round((totalProgress / steps.length) * 100);
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
          <p className="text-slate-600 mt-2">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Progress: {calculateProgress()}%
            </span>
            <span className="text-sm text-slate-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    status === 'completed' 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : status === 'skipped'
                      ? 'bg-yellow-500 border-yellow-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-slate-300 text-slate-500'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      status === 'completed' ? 'bg-green-500' : 'bg-slate-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {CurrentStepComponent && (
              <CurrentStepComponent 
                data={onboardingData}
                updateData={setOnboardingData}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isSaving={isSaving}
                currentStep={currentStep}
                totalSteps={steps.length}
                dealer={dealer}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation is now handled by individual step components */}
      </div>
    </div>
  );
};

export default OnboardingWizard;
