
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { InvokeLLM } from '@/api/integrations';

// Import step components
import RegistrationInputStep from '@/components/listing-wizard/RegistrationInputStep';
import AIVehicleDetailsStep from '@/components/listing-wizard/AIVehicleDetailsStep';
import CategorySpecificsStep from '@/components/listing-wizard/CategorySpecificsStep';
import ConditionAndHistoryStep from '@/components/listing-wizard/ConditionAndHistoryStep';
import PhotosAndVideosStep from '@/components/listing-wizard/PhotosAndVideosStep';
import PricingStep from '@/components/listing-wizard/PricingStep';
import PublishSettingsStep from '@/components/listing-wizard/PublishSettingsStep';
import FinalReviewStep from '@/components/listing-wizard/FinalReviewStep';

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

const STEPS = [
  { id: 'reg_input', title: 'Registration Number', component: RegistrationInputStep },
  { id: 'ai_details', title: 'Vehicle Details', component: AIVehicleDetailsStep },
  { id: 'category_specifics', title: 'Category Details', component: CategorySpecificsStep }, // New step
  { id: 'condition', title: 'Condition & History', component: ConditionAndHistoryStep },
  { id: 'media', title: 'Photos & Videos', component: PhotosAndVideosStep },
  { id: 'pricing', title: 'Set Price', component: PricingStep },
  { id: 'publish', title: 'Publish Settings', component: PublishSettingsStep },
  { id: 'review', title: 'Final Review', component: FinalReviewStep },
];

export default function AddVehicle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [vehicleData, setVehicleData] = useState<any>({
    registration_number: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    fuel_type: '',
    transmission: '',
    kilometers: '',
    ownership: 'first',
    color: '',
    description: '',
    service_history: [],
    inspection_report_url: '',
    images: [],
    videos: [],
    hero_image_url: '',
    landed_cost_components: { procurement: 0, refurbishment: 0, logistics: 0, other: 0 },
    asking_price: 0,
    market_data: {},
    inventory_type: 'public',
    publish_at: null,
    status: 'draft',
    ai_metadata: { fetched_from_reg: false, photo_suggestions: [] },
    vehicle_category: [], // New field
    custom_attributes: {}, // New field
  });

  useEffect(() => {
    loadDealer();
  }, []);

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
  
  const updateVehicleData = (updates: any) => {
    setVehicleData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      if (STEPS[currentStep].id === 'reg_input') {
        await fetchVehicleDetails();
      }
      // Skip category step if no categories are applicable based on some logic (future enhancement)
      // For now, always show it.
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
    setIsSubmitting(true);
    try {
      const finalPayload = { 
        ...vehicleData, 
        status, 
        dealer_id: dealer.id,
        location_city: dealer.city,
        location_state: dealer.state
      };
      
      await Vehicle.create(finalPayload);
      
      toast({
        title: `Listing ${status === 'draft' ? 'Saved' : 'Published'}!`,
        description: `Your vehicle has been successfully ${status === 'draft' ? 'saved as a draft' : 'added to the marketplace'}.`,
      });
      
      navigate(createPageUrl('Inventory'));
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
  
  const CurrentStepComponent: any = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(createPageUrl('Inventory'))} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Add New Vehicle</h1>
          <p className="text-slate-600">Follow the steps to create a new listing.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
          <p className="text-sm text-center mt-2 text-slate-500">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </div>
        
        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600">Fetching vehicle details...</p>
              </div>
            ) : (
              <CurrentStepComponent 
                data={vehicleData} 
                updateData={updateVehicleData} 
                dealer={dealer} 
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="ghost"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save as Draft
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting || isLoading || 
                (STEPS[currentStep].id === 'category_specifics' && 
                 Object.keys(vehicleData.custom_attributes || {}).length === 0 && 
                 (vehicleData.vehicle_category || []).some(cat => CATEGORY_FIELDS[cat]))}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === STEPS.length - 1 ? (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Publish Now
                </span>
              ) : (
                'Next Step'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
