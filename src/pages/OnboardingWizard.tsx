import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, Users, Car, CheckCircle, ArrowRight, ArrowLeft, Clock, 
  Phone, Mail, MapPin, Info, Loader2, Zap
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Progressive Disclosure: Minimal onboarding steps for immediate dashboard access
const MINIMAL_ONBOARDING_STEPS = [
  { 
    id: 'organization_details', 
    title: 'Organization Setup', 
    icon: Building2, 
    description: 'Basic business information to get started',
    estimatedTime: 3
  },
  { 
    id: 'complete', 
    title: 'Setup Complete', 
    icon: CheckCircle, 
    description: 'Welcome to Aura Dashboard!',
    estimatedTime: 1
  }
];

// Business type options for quick setup
const BUSINESS_TYPES = [
  { value: 'dealer_single', label: 'Single Dealer', description: 'Individual car dealer' },
  { value: 'dealer_network', label: 'Dealer Network', description: 'Multiple dealerships' },
  { value: 'franchise_dealer', label: 'Franchise Dealer', description: 'Brand franchise' },
  { value: 'multi_brand_dealer', label: 'Multi-Brand Dealer', description: 'Multiple car brands' },
  { value: 'park_and_sell', label: 'Park & Sell', description: 'Consignment business' },
  { value: 'auctions', label: 'Auction House', description: 'Vehicle auctions' }
];

// Indian states for address selection
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  interface ValidationErrors {
    organizationName?: string;
    legalName?: string;
    businessType?: string;
    contactPhone?: string;
    contactEmail?: string;
    city?: string;
    state?: string;
    address?: string;
    pincode?: string;
    termsAccepted?: string;
    privacyAccepted?: string;
  }
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDealerId, setExistingDealerId] = useState<string | null>(null);

  // Minimal onboarding data for immediate dashboard access
  const [organizationData, setOrganizationData] = useState({
    // Essential organization details only
    organizationName: '',
    legalName: '',
    businessType: '',
    contactPhone: '',
    contactEmail: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    
    // Basic flags
    termsAccepted: false,
    privacyAccepted: false
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
        
        // Pre-fill with user data
        setOrganizationData(prev => ({ 
          ...prev, 
          contactEmail: currentUser.email
        }));

        // Check if user already has a COMPLETE dealer profile
        const existingDealers = await Dealer.filter({ created_by: currentUser.email });
        if (existingDealers.length > 0) {
          const dealerProfile = existingDealers[0];
          
          // Check if dealer has complete minimal required information
          const hasMinimalProfile = !!(
            dealerProfile.business_name && 
            dealerProfile.business_type && 
            dealerProfile.email && 
            dealerProfile.onboarding_completed === true
          );
          
          console.log('OnboardingWizard - Checking existing dealer profile:', {
            business_name: dealerProfile.business_name,
            business_type: dealerProfile.business_type,
            email: dealerProfile.email,
            onboarding_completed: dealerProfile.onboarding_completed,
            hasMinimalProfile
          });
          
          if (hasMinimalProfile) {
            // User has complete profile, redirect to dashboard
            console.log('OnboardingWizard - User has complete dealer profile, redirecting to dashboard');
            setTimeout(() => {
              navigate(createPageUrl('Dashboard'), { replace: true });
            }, 100);
            return;
          } else {
            // User has incomplete profile, store ID for updating and pre-fill form
            console.log('User has incomplete dealer profile, pre-filling form');
            setExistingDealerId(dealerProfile.id);
            setOrganizationData(prev => ({
              ...prev,
              organizationName: dealerProfile.business_name || '',
              legalName: dealerProfile.name || '',              // 'name' column stores legal_name
              businessType: dealerProfile.business_type || '',
              contactPhone: dealerProfile.phone || '',
              contactEmail: dealerProfile.email || currentUser.email,
              city: dealerProfile.city || '',
              state: dealerProfile.state || '',
              address: dealerProfile.address || '',
              pincode: dealerProfile.pincode || ''
            }));
          }
        }
      } catch (error) { 
        console.log('No authenticated user, redirecting to authentication'); 
        navigate(createPageUrl('Authentication'));
        return;
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast({ title: "Initialization Error", description: "Failed to load onboarding data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganizationData = (field: string, value: any) => {
    setOrganizationData(prev => ({ ...prev, [field]: value }));
    // Clear any existing errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateOrganizationDetails = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!organizationData.organizationName.trim()) {
      stepErrors.organizationName = "Organization name is required";
    }
    
    if (!organizationData.legalName.trim()) {
      stepErrors.legalName = "Legal name is required";
    }
    
    if (!organizationData.businessType) {
      stepErrors.businessType = "Please select a business type";
    }
    
    if (!organizationData.contactPhone.trim()) {
      stepErrors.contactPhone = "Contact phone is required";
    }
    
    if (!organizationData.city.trim()) {
      stepErrors.city = "City is required";
    }
    
    if (!organizationData.state) {
      stepErrors.state = "Please select a state";
    }
    
    if (!organizationData.address.trim()) {
      stepErrors.address = "Business address is required";
    }
    
    if (!organizationData.pincode.trim()) {
      stepErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(organizationData.pincode)) {
      stepErrors.pincode = "Pincode must be 6 digits";
    }
    
    if (!organizationData.termsAccepted) {
      stepErrors.termsAccepted = "Please accept the terms and conditions";
    }
    
    if (!organizationData.privacyAccepted) {
      stepErrors.privacyAccepted = "Please accept the privacy policy";
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate organization details
      if (!validateOrganizationDetails()) {
        toast({ 
          title: "Validation Error", 
          description: "Please fill all required fields correctly.", 
          variant: "destructive" 
        });
        return;
    }
      setCurrentStep(1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);
      console.log('OnboardingWizard - Creating minimal dealer profile...');
      
      // Create dealer profile with minimal required data
      const dealerData = {
        // Use actual database columns
        business_name: organizationData.organizationName,
        name: organizationData.legalName,           // legal_name is stored as 'name' in schema
        business_type: organizationData.businessType,
        email: organizationData.contactEmail,
        phone: organizationData.contactPhone,
        address: organizationData.address,
        city: organizationData.city,
        state: organizationData.state,
        pincode: organizationData.pincode,
        created_by: user?.email || organizationData.contactEmail,
        
        // Progressive disclosure flags (use existing columns)
        onboarding_completed: true,          // Minimal onboarding complete
        kyc_completed: false,               // KYC pending (for price viewing)
        bank_details_added: false,         // Bank details pending (for deals)
        branches_added: false,             // Branches pending (for adding vehicles)
        
        // Store additional data and kyb_completed (since that column doesn't exist)
        onboarding_data: {
          ...organizationData,
          progressive_verification: {
            kyb_completed: false,               // KYB pending (stored in JSON as column doesn't exist)
          }
        }
      };

      let dealerResult;
      
      if (existingDealerId) {
        // Update existing dealer profile
        console.log('OnboardingWizard - Updating existing dealer profile:', existingDealerId);
        dealerResult = await Dealer.update(existingDealerId, dealerData);
        console.log('OnboardingWizard - Dealer profile updated:', dealerResult);
      } else {
        // Create new dealer profile
        console.log('OnboardingWizard - Creating new dealer profile with data:', dealerData);
        dealerResult = await Dealer.create(dealerData);
        console.log('OnboardingWizard - Dealer profile created:', dealerResult);
      }
      
      // Update user profile with onboarding completion
      console.log('OnboardingWizard - Updating user metadata...');
      await User.updateMyUserData({
        onboarding_completed: true,
        dealer_profile_created: true,
        dealer_id: dealerResult.id
      });
      console.log('OnboardingWizard - User metadata updated');

      // Force refresh the auth state to ensure metadata is updated
      console.log('OnboardingWizard - Refreshing auth state...');
      await refreshAuth();
      console.log('OnboardingWizard - Auth state refreshed');

      toast({
        title: "Welcome to Aura!", 
        description: "Your organization is set up. Complete verification steps as needed to unlock features."
      });
      
      // Redirect to dashboard immediately
      setTimeout(() => {
        console.log('OnboardingWizard - Redirecting to dashboard...');
        navigate(createPageUrl('Dashboard'));
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Setup Failed", 
        description: "Failed to create your organization profile. Please try again.", 
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={organizationData.organizationName}
                onChange={(e) => updateOrganizationData('organizationName', e.target.value)}
                placeholder="e.g., ABC Motors"
                className={errors.organizationName ? 'border-red-500' : ''}
              />
              {errors.organizationName && (
                <p className="text-sm text-red-600">{errors.organizationName}</p>
              )}
            </div>

            {/* Legal Name */}
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name *</Label>
              <Input
                id="legalName"
                value={organizationData.legalName}
                onChange={(e) => updateOrganizationData('legalName', e.target.value)}
                placeholder="e.g., ABC Motors Pvt Ltd"
                className={errors.legalName ? 'border-red-500' : ''}
              />
              {errors.legalName && (
                <p className="text-sm text-red-600">{errors.legalName}</p>
              )}
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select 
                value={organizationData.businessType} 
                onValueChange={(value) => updateOrganizationData('businessType', value)}
              >
                <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-sm text-red-600">{errors.businessType}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  value={organizationData.contactPhone}
                  onChange={(e) => updateOrganizationData('contactPhone', e.target.value)}
                  placeholder="+91-9876543210"
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-600">{errors.contactPhone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={organizationData.contactEmail}
                  onChange={(e) => updateOrganizationData('contactEmail', e.target.value)}
                  placeholder="contact@organization.com"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-600">{errors.contactEmail}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <Textarea
                id="address"
                value={organizationData.address}
                onChange={(e) => updateOrganizationData('address', e.target.value)}
                placeholder="Street address, building number, landmarks"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={organizationData.city}
                  onChange={(e) => updateOrganizationData('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select 
                  value={organizationData.state} 
                  onValueChange={(value) => updateOrganizationData('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={organizationData.pincode}
                  onChange={(e) => updateOrganizationData('pincode', e.target.value)}
                  placeholder="400001"
                  maxLength={6}
                  className={errors.pincode ? 'border-red-500' : ''}
                />
                {errors.pincode && (
                  <p className="text-sm text-red-600">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4 border-t pt-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={organizationData.termsAccepted}
                  onChange={(e) => updateOrganizationData('termsAccepted', e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
                  I accept the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> *
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-600 ml-6">{errors.termsAccepted}</p>
              )}

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacyAccepted"
                  checked={organizationData.privacyAccepted}
                  onChange={(e) => updateOrganizationData('privacyAccepted', e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="privacyAccepted" className="text-sm leading-relaxed">
                  I accept the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                </Label>
              </div>
              {errors.privacyAccepted && (
                <p className="text-sm text-red-600 ml-6">{errors.privacyAccepted}</p>
              )}
            </div>
          </div>

          {/* Progressive Disclosure Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Setup:</strong> This is all we need to get you started! 
              You can complete additional verification steps later to unlock more features like viewing marketplace prices, making deals, and adding vehicles.
            </AlertDescription>
          </Alert>
        </div>
      );
    } else {
      // Completion step
      return (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Aura!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your organization "{organizationData.organizationName}" is now set up and ready to use.
            </p>
            <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps - Unlock Features:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Add a branch</strong> - Required to add vehicles to inventory</li>
                <li>• <strong>Complete KYC</strong> - View marketplace prices and dealer details</li>
                <li>• <strong>Add bank details</strong> - Participate in deals and transactions</li>
                <li>• <strong>Complete KYB</strong> - Access all premium features</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Setting up your onboarding...</p>
        </div>
      </div>
    );
  }
  
  const currentStepInfo = MINIMAL_ONBOARDING_STEPS[currentStep];
  const progressPercentage = (currentStep / (MINIMAL_ONBOARDING_STEPS.length - 1)) * 100;
  const remainingTime = MINIMAL_ONBOARDING_STEPS.slice(currentStep).reduce((total, step) => total + step.estimatedTime, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Car className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Aura</h1>
          <p className="text-slate-600 dark:text-slate-300">Quick setup to get you started immediately</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>~{remainingTime} minutes remaining</span>
          </div>
        </div>

        {/* Progress Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{currentStepInfo?.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{currentStepInfo?.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Step {currentStep + 1} of {MINIMAL_ONBOARDING_STEPS.length}
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Quick Setup
                  </Badge>
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
                <p className="text-sm text-slate-600 dark:text-slate-300">{currentStepInfo?.description}</p>
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
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 0 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {currentStep < MINIMAL_ONBOARDING_STEPS.length - 1 ? (
              <Button 
                onClick={handleNext} 
                disabled={isSubmitting} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleCompleteOnboarding} 
                disabled={isSubmitting} 
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                Complete Setup <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}