
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Save, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { InvokeLLM } from '@/api/integrations';
import PasswordConfirmationModal from "@/components/ui/password-confirmation-modal";

// Import step components
import VehicleTypeSelectionStep from '@/components/listing-wizard/VehicleTypeSelectionStep';
import BranchSelectionStep from '@/components/addvehicle/BranchSelectionStep';
import IdentifyStep from '@/components/listing-wizard/IdentifyStep';
import StockContextStep from '@/components/listing-wizard/StockContextStep';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';
import CoreSpecsStep from '@/components/listing-wizard/CoreSpecsStepEnhanced';
import ConditionStep from '@/components/listing-wizard/ConditionStep';
import DocumentsStep from '@/components/listing-wizard/DocumentsStep';
import PhotosAndVideosStep from '@/components/listing-wizard/PhotosAndVideosStep';
import PricingStep from '@/components/listing-wizard/PricingStep';
import PublishSettingsStep from '@/components/listing-wizard/PublishSettingsStep';
import FinalReviewStep from '@/components/listing-wizard/FinalReviewStep';

// Import new UI components
import { StepProgress, VEHICLE_ADDING_STEPS, VEHICLE_ADDING_STEPS_MOBILE } from '@/components/ui/StepProgress';
import { AutoFillDisplay } from '@/components/ui/AutoFillDisplay';
import { MarginPrivacy } from '@/components/ui/MarginPrivacy';
import { DocumentUpload } from '@/components/ui/DocumentUpload';

// This is a placeholder for CATEGORY_FIELDS. 
// In a real application, this would likely be imported from a shared constants/config file
// or be defined based on an API response. It maps category IDs to whether they require specific custom attributes.
const CATEGORY_FIELDS = {
  // Example: 'luxury' category might require specific custom fields, 'commercial' as well.
  // The value 'true' indicates that this category *can* have associated custom fields.
  // The actual fields themselves would be managed within CategorySpecificsStep based on selected categories.
  'Luxury': true,
  'Commercial': true,
  'Electric': true,
  // Add other categories that might require custom fields
};

const ALL_STEPS = [
  { id: 'vehicle_type', title: 'Vehicle Type', component: VehicleTypeSelectionStep },
  { id: 'branch_selection', title: 'Select Branch', component: BranchSelectionStep },
  { id: 'identify', title: 'Identify Vehicle', component: IdentifyStep },
  { id: 'stock_context', title: 'Stock Information', component: StockContextStep, vehicleTypes: ['new'] },
  { id: 'core_specs', title: 'Core Specifications', component: CoreSpecsStep },
  { id: 'condition', title: 'Condition', component: ConditionStep, vehicleTypes: ['used'] },
  { id: 'documents', title: 'Documents', component: DocumentsStep },
  { id: 'media', title: 'Photos & Videos', component: PhotosAndVideosStep },
  { id: 'pricing', title: 'Pricing & Exposure', component: PricingStep },
  { id: 'publish', title: 'Publish Settings', component: PublishSettingsStep },
  { id: 'review', title: 'Review & Publish', component: FinalReviewStep },
];

// Dynamically filter steps based on vehicle type
const getFilteredSteps = (vehicleType: 'new' | 'used') => {
  return ALL_STEPS.filter(step => {
    if (!step.vehicleTypes) return true; // Show step for all vehicle types
    return step.vehicleTypes.includes(vehicleType);
  });
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'live' | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<'new' | 'used'>('used');
  const [filteredSteps, setFilteredSteps] = useState(() => getFilteredSteps('used'));
  const [vehicleData, setVehicleData] = useState<any>({
    // Branch and identification
    branch_id: '',
    identification_method: 'manual', // 'reg_number', 'vin', 'manual'
    
    // Basic vehicle info
    registration_number: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    fuel_type: '',
    transmission: '',
    body_type: '',
    kilometers: '',
    ownership: 'first',
    color: '',
    
    // Condition fields
    tyres_ok: null,
    paint_ok: null,
    accident_history: null,
    service_history_available: null,
    condition_notes: '',
    
    // Document fields
    rc_available: false,
    insurance_status: '',
    insurance_valid_until: null,
    puc_valid_until: null,
    service_records_uploaded: false,
    
    // Stock context fields (for new vehicles)
    stock_type: 'dealer_stock', // 'dealer_stock' or 'incoming_allocation'
    allotment_id: null,
    eta: null,
    allocation_status: 'allocated', // 'allocated', 'confirmed', 'in_production', etc.

    // Pricing fields
    base_cost: null,
    dealer_margin_target: null,
    dealer_net: null,
    shown_price: null,
    dealer_price: null,
    exposure_mode: 'masked', // 'retail', 'b2b', 'masked'
    consignment_terms: null,
    
    // Media
    images: [],
    videos: [],
    hero_image_url: '',
    
    // Legacy fields (for backward compatibility)
    vehicle_type: 'personal',
    description: '',
    service_history: [],
    inspection_report_url: '',
    landed_cost_components: { procurement: 0, refurbishment: 0, logistics: 0, other: 0 },
    asking_price: 0,
    market_data: {},
    inventory_type: 'public',
    publish_at: null,
    status: 'draft',
    ai_metadata: { fetched_from_reg: false, photo_suggestions: [] },
    vehicle_category: [],
    custom_attributes: {},
    
    // Auto-fill tracking
    auto_filled_fields: {},
  });

  // Check for edit mode parameters
  useEffect(() => {
    const id = searchParams.get('id');
    const mode = searchParams.get('mode');

    if (id && mode === 'edit') {
      setIsEditMode(true);
      setVehicleId(id);
    }
  }, [searchParams]);

  // Update filtered steps when vehicle type changes
  useEffect(() => {
    const newFilteredSteps = getFilteredSteps(vehicleType);
    setFilteredSteps(newFilteredSteps);

    // Adjust current step if it's no longer valid after filtering
    if (currentStep >= newFilteredSteps.length) {
      setCurrentStep(Math.max(0, newFilteredSteps.length - 1));
    }
  }, [vehicleType, currentStep]);

  useEffect(() => {
    loadDealer();
  }, []);

  // Load existing vehicle data if in edit mode
  useEffect(() => {
    if (isEditMode && vehicleId && dealer) {
      loadExistingVehicle();
    }
  }, [isEditMode, vehicleId, dealer]);

  // Set initial step based on edit mode
  useEffect(() => {
    if (isEditMode) {
      setCurrentStep(1); // Start from vehicle details step (skip registration input)
    }
  }, [isEditMode]);

  const loadDealer = async () => {
    try {
      setIsInitializing(true);
      const user = await User.me();
      const dealers = await Dealer.filter({ created_by: user.email });
      
      if (dealers.length === 0) {
        toast({ 
          title: "Setup Required", 
          description: "Please complete your dealer profile first.", 
          variant: "destructive" 
        });
        navigate(createPageUrl('Profile'));
        return;
      }

      const dealerProfile = dealers[0];
      
      // Note: We no longer block users without branches - the BranchSelectionStep handles this
      // We keep other verification checks for serious issues
      
      // Check if dealer verification allows listing
      if (!dealerProfile.verification_status || dealerProfile.verification_status === 'rejected') {
        toast({ 
          title: "Verification Required", 
          description: "Complete KYB verification to list vehicles.", 
          variant: "destructive" 
        });
        navigate(createPageUrl('KYBWizard'));
        return;
      }

      if (dealerProfile.verification_status === 'suspended') {
        toast({ 
          title: "Account Suspended", 
          description: "Your account is suspended. Contact support.", 
          variant: "destructive" 
        });
        navigate(createPageUrl('Dashboard'));
        return;
      }

      setDealer(dealerProfile);
    } catch (error) {
      console.error('Error loading dealer:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load dealer information.", 
        variant: "destructive" 
      });
      navigate(createPageUrl('Dashboard'));
    } finally {
      setIsInitializing(false);
    }
  };

  const loadExistingVehicle = async () => {
    if (!vehicleId) return;
    setIsLoading(true);
    try {
      const vehicle = await Vehicle.get(vehicleId);
      setVehicleData(vehicle);
      setIsEditMode(true);
      toast({
        title: "Editing Existing Vehicle",
        description: `You are editing vehicle: ${vehicle.registration_number}`,
      });
    } catch (error) {
      console.error('Error loading existing vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicle details for editing.",
        variant: "destructive",
      });
      navigate(createPageUrl('Inventory') + '?refresh=true');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateVehicleData = (updates: any) => {
    setVehicleData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    // Special validation for vehicle type step
    if (filteredSteps[currentStep]?.id === 'vehicle_type') {
      if (!vehicleData.vehicleType) {
        toast({
          title: "Vehicle Type Required",
          description: "Please select whether you're adding a Used or New vehicle.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < filteredSteps.length - 1) {
      if (filteredSteps[currentStep]?.id === 'identify' && vehicleData.registration_number) {
        await fetchVehicleDetails();
      }
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit('live');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const fetchVehicleDetails = async () => {
    if (!vehicleData.registration_number) return;
    setIsLoading(true);
    
    try {
      // Check for duplicates
      const existing = await Vehicle.filter({ 
        registration_number: vehicleData.registration_number, 
        dealer_id: dealer.id 
      });
      
      if (existing.length > 0) {
        toast({
          title: "Duplicate Vehicle",
          description: "You already have a listing with this registration number.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Fetch AI details
      const response = await InvokeLLM({
        prompt: `Based on the Indian vehicle registration number "${vehicleData.registration_number}", provide the vehicle's make, model, variant, manufacturing year, fuel type, and transmission. Also suggest vehicle categories from this list: ${[...new Set(Object.keys(CATEGORY_FIELDS))].join(', ')}.`,
        response_json_schema: {
          type: "object",
          properties: {
            make: { type: "string" },
            model: { type: "string" },
            variant: { type: "string" },
            year: { type: "number" },
            fuel_type: { type: "string", enum: ["petrol", "diesel", "cng", "lpg", "electric", "hybrid"] },
            transmission: { type: "string", enum: ["manual", "automatic", "amt", "cvt"] },
            suggested_categories: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      updateVehicleData({ 
        ...response, 
        vehicle_category: response.suggested_categories || [],
        ai_metadata: { ...vehicleData.ai_metadata, fetched_from_reg: true } 
      });
      
      toast({ 
        title: "Vehicle Details Fetched", 
        description: "Please verify the auto-filled information and categories." 
      });
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast({ 
        title: "Fetch Failed", 
        description: "Could not retrieve details. Please enter them manually.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };
  
  const handleSubmit = async (status: 'draft' | 'live') => {
    // Show password confirmation modal first
    setShowPasswordModal(true);
    setPendingStatus(status);
  };

  const saveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      // Clean the data before sending to database
      const cleanData = { ...vehicleData };
      
      // Convert empty strings to null for integer fields
      if (cleanData.kilometers === '') cleanData.kilometers = null;
      if (cleanData.mileage === '') cleanData.mileage = null;
      if (cleanData.year === '') cleanData.year = null;
      if (cleanData.seating_capacity === '') cleanData.seating_capacity = null;
      if (cleanData.condition_rating === '') cleanData.condition_rating = null;
      
      // Convert empty strings to null for decimal fields
      if (cleanData.price === '') cleanData.price = null;
      if (cleanData.asking_price === '') cleanData.asking_price = null;
      if (cleanData.market_price_min === '') cleanData.market_price_min = null;
      if (cleanData.market_price_max === '') cleanData.market_price_max = null;
      if (cleanData.listing_fee_value === '') cleanData.listing_fee_value = null;
      
      // Convert empty strings to null for date fields
      if (cleanData.insurance_valid_until === '') cleanData.insurance_valid_until = null;
      if (cleanData.publish_at === '') cleanData.publish_at = null;
      if (cleanData.publish_schedule === '') cleanData.publish_schedule = null;
      
      const finalPayload = { 
        ...cleanData, 
        status: 'draft', 
        dealer_id: dealer.id,
        location_city: dealer.city,
        location_state: dealer.state
      };
      
      console.log('AddVehicle - Saving draft with payload:', finalPayload);
      console.log('AddVehicle - Selected branch:', selectedBranch);
      console.log('AddVehicle - Vehicle data branch_id:', vehicleData.branch_id);
      
      if (isEditMode && vehicleId) {
        console.log('AddVehicle - Updating existing vehicle:', vehicleId);
        const result = await Vehicle.update(vehicleId, finalPayload);
        console.log('AddVehicle - Update result:', result);
        setVehicleData(result);
        toast({
          title: "Draft Saved!",
          description: "Your vehicle draft has been updated successfully.",
        });
      } else {
        console.log('AddVehicle - Creating new vehicle');
        const result = await Vehicle.create(finalPayload);
        console.log('AddVehicle - Create result:', result);
        console.log('AddVehicle - New vehicle ID:', result.id);
        setVehicleData(result);
        setVehicleId(result.id);
        setIsEditMode(true);
        toast({
          title: "Draft Saved!",
          description: `Your vehicle has been saved as a draft with ID: ${result.id}`,
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({ 
        title: "Save Failed", 
        description: "There was an error saving your draft.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Clean the data before sending to database
      const cleanData = { ...vehicleData };
      
      // Convert empty strings to null for integer fields
      if (cleanData.kilometers === '') cleanData.kilometers = null;
      if (cleanData.mileage === '') cleanData.mileage = null;
      if (cleanData.year === '') cleanData.year = null;
      if (cleanData.seating_capacity === '') cleanData.seating_capacity = null;
      if (cleanData.condition_rating === '') cleanData.condition_rating = null;
      
      // Convert empty strings to null for decimal fields
      if (cleanData.price === '') cleanData.price = null;
      if (cleanData.asking_price === '') cleanData.asking_price = null;
      if (cleanData.market_price_min === '') cleanData.market_price_min = null;
      if (cleanData.market_price_max === '') cleanData.market_price_max = null;
      if (cleanData.listing_fee_value === '') cleanData.listing_fee_value = null;
      
      // Convert empty strings to null for date fields
      if (cleanData.insurance_valid_until === '') cleanData.insurance_valid_until = null;
      if (cleanData.publish_at === '') cleanData.publish_at = null;
      if (cleanData.publish_schedule === '') cleanData.publish_schedule = null;
      
      const finalPayload = { 
        ...cleanData, 
        status: pendingStatus, 
        dealer_id: dealer.id,
        location_city: dealer.city,
        location_state: dealer.state
      };
      
      console.log('AddVehicle - Dealer object:', dealer);
      console.log('AddVehicle - Dealer ID being used:', dealer.id);
      console.log('AddVehicle - Final payload being sent to database:', finalPayload);
      
      if (isEditMode && vehicleId) {
        await Vehicle.update(vehicleId, finalPayload);
        toast({
          title: `Listing ${pendingStatus === 'draft' ? 'Saved' : 'Published'}!`,
          description: `Your vehicle has been successfully ${pendingStatus === 'draft' ? 'saved as a draft' : 'updated'}.`,
        });
      } else {
        await Vehicle.create(finalPayload);
        toast({
          title: `Listing ${pendingStatus === 'draft' ? 'Saved' : 'Published'}!`,
          description: `Your vehicle has been successfully ${pendingStatus === 'draft' ? 'saved as a draft' : 'added to the marketplace'}.`,
        });
      }

      console.log('AddVehicle - Vehicle published/updated successfully, navigating to inventory');
      navigate(createPageUrl('Inventory') + '?refresh=true');
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast({ 
        title: "Submission Failed", 
        description: "There was an error submitting your listing.", 
        variant: "destructive" 
      });
    }
    setIsSubmitting(false);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingStatus(null);
  };

  // Enhanced navigation functions
  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const canProceedToNext = () => {
    const currentStepData = filteredSteps[currentStep];
    
    // Basic validation for each step
    switch (currentStepData.id) {
      case 'identify':
        return vehicleData.make && vehicleData.model && vehicleData.year;
      case 'core_specs':
        return vehicleData.fuel_type && vehicleData.transmission && vehicleData.kilometers;
      case 'condition':
        return true; // Optional step
      case 'documents':
        return true; // Optional step
      case 'media':
        return vehicleData.images && vehicleData.images.length > 0;
      case 'pricing':
        return vehicleData.shown_price && vehicleData.shown_price > 0;
      case 'publish':
        return vehicleData.exposure_mode;
      case 'review':
        return true; // Final step
      default:
        return true;
    }
  };

  const getAutoFilledFields = () => {
    const fields = [];
    
    if (vehicleData.auto_filled_fields) {
      Object.entries(vehicleData.auto_filled_fields).forEach(([key, value]: [string, any]) => {
        if (value && value.source) {
          fields.push({
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value.value,
            source: value.source,
            confidence: value.confidence,
            validated: value.validated,
            editable: true
          });
        }
      });
    }
    
    return fields;
  };

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Setting up vehicle listing...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if dealer check failed (navigation will happen)
  if (!dealer) {
    return null;
  }
  
  const CurrentStepComponent: any = filteredSteps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl('Inventory'))}
            className="mb-3 md:mb-4 text-sm md:text-base py-2 px-3 md:px-4"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            <span className="hidden sm:inline">Back to Inventory</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            {isEditMode
              ? `Editing vehicle: ${vehicleData.registration_number || 'Loading...'}`
              : 'Follow the steps to create a new listing.'
            }
          </p>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-6 md:mb-8">
          <StepProgress
            steps={VEHICLE_ADDING_STEPS.slice(0, filteredSteps.length)}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            variant="mobile"
            className="mb-3 md:mb-4"
          />
          <div className="text-center px-4 md:px-0">
            <p className="text-xs md:text-sm text-slate-500">
              Step {currentStep + 1} of {filteredSteps.length}: {filteredSteps[currentStep]?.title}
            </p>
          </div>
        </div>
        
        {/* Step Content */}
        <Card className="mx-4 md:mx-0">
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[300px]">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-blue-600 mb-3 md:mb-4" />
                <p className="text-slate-600 text-sm md:text-base">Fetching vehicle details...</p>
              </div>
            ) : (
              <>
                {/* Auto-Filled Fields Display */}
                {getAutoFilledFields().length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <AutoFillDisplay
                      fields={getAutoFilledFields()}
                      onEditField={(key, value) => {
                        updateVehicleData({ [key]: value });
                      }}
                      variant="compact"
                      title="Auto-Filled Information"
                    />
                  </div>
                )}
                
                {filteredSteps[currentStep]?.id === 'branch_selection' ? (
                  <BranchSelectionStep
                    selectedBranch={selectedBranch}
                    onBranchSelect={(branchId) => {
                      setSelectedBranch(branchId);
                      setVehicleData(prev => ({ ...prev, branch_id: branchId }));
                    }}
                    onNext={() => setCurrentStep(currentStep + 1)}
                    onBack={() => navigate(createPageUrl('Dashboard'))}
                    dealer={dealer}
                    onDealerUpdate={loadDealer}
                  />
                ) : (
                  <CurrentStepComponent
                    data={vehicleData}
                    updateData={updateVehicleData}
                    dealer={dealer}
                    vehicleType={vehicleType}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        {filteredSteps[currentStep]?.id !== 'branch_selection' && (
          <div className="mt-6 md:mt-8 mx-4 md:mx-0">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 md:gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={(currentStep === 0 && !isEditMode) || (currentStep === 1 && isEditMode) || isSubmitting}
                className="flex items-center justify-center gap-2 text-sm md:text-base py-2.5 md:py-2 flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
                {/* Save Draft Button */}
                {currentStep < filteredSteps.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleSubmit('draft')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 text-sm md:text-base py-2.5 md:py-2"
                  >
                    <Save className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Save as Draft</span>
                    <span className="sm:hidden">Save Draft</span>
                  </Button>
                )}

                {/* Next/Publish Button */}
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || isLoading || !canProceedToNext()}
                  className="min-w-[120px] flex items-center justify-center gap-2 text-sm md:text-base py-2.5 md:py-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  ) : currentStep === filteredSteps.length - 1 ? (
                    <>
                      <Send className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{isEditMode ? 'Update Vehicle' : 'Publish Now'}</span>
                      <span className="sm:hidden">{isEditMode ? 'Update' : 'Publish'}</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Next Step</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Margin Privacy Component - Show on pricing step */}
        {filteredSteps[currentStep]?.id === 'pricing' && (
          <div className="mt-6 md:mt-8 mx-4 md:mx-0">
            <MarginPrivacy
              dealerNet={vehicleData.dealer_net || 0}
              baseCost={vehicleData.base_cost || 0}
              shownPrice={vehicleData.shown_price || 0}
              dealerPrice={vehicleData.dealer_price || 0}
              stockType={vehicleData.stock_type || 'owned'}
              exposureMode={vehicleData.exposure_mode || 'masked'}
            />
          </div>
        )}
      </div>

      <PasswordConfirmationModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        title={isEditMode ? 'Update Vehicle Listing' : 'Publish Vehicle Listing'}
        description={
          isEditMode 
            ? 'Please enter your password to update this vehicle listing.'
            : 'Please enter your password to publish this vehicle listing.'
        }
        confirmText={isEditMode ? 'Update Vehicle' : 'Publish Listing'}
        actionType="edit"
      />
    </div>
  );
}
