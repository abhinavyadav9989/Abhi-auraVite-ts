
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Vehicle, VehicleAsset, VehicleDocument, VehicleCondition } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { InvokeLLM } from '@/api/integrations';
import PasswordConfirmationModal from "@/components/ui/password-confirmation-modal";

// Import step components
import BranchSelectionStep from '@/components/addvehicle/BranchSelectionStep';
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
  { id: 'branch_selection', title: 'Select Branch', component: BranchSelectionStep },
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [preloadedAssets, setPreloadedAssets] = useState(false);
  const [preloadedDocuments, setPreloadedDocuments] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'live' | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<any>({
    branch_id: '', // New field for branch association
    registration_number: '',
    registration_date: null,
    make: '',
    model: '',
    variant: '',
    year: '',
    fuel_type: '',
    transmission: '',
    drivetrain: null,
    engine_cc: '',
    kilometers: '',
    ownership: 'first',
    owner_count: 1,
    color: '',
    vehicle_type: 'personal',
    description: '',
    rto_location_city: '',
    rto_location_state: '',
    insurance_available: false,
    insurance_valid_until: null,
    permit_type: null,
    service_history: [],
    inspection_report_url: '',
    images: [],
    videos: [],
    audio: [],
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

  // Check for edit mode parameters
  useEffect(() => {
    const id = searchParams.get('id');
    const mode = searchParams.get('mode');
    
    if (id && mode === 'edit') {
      setIsEditMode(true);
      setVehicleId(id);
    }
  }, [searchParams]);

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
      // Prefill existing engine audio assets
      try {
        const assets = await VehicleAsset.filter({ vehicle_id: vehicleId });
        const existingAudio = (assets || [])
          .filter((a: any) => a.media_type === 'audio')
          .map((a: any) => a.file_url);
        // Prefill existing documents
        let rcDocs: string[] = [];
        let insDocs: string[] = [];
        try {
          const docs = await VehicleDocument.filter({ vehicle_id: vehicleId });
          rcDocs = (docs || []).filter((d: any) => d.document_type === 'rc').map((d: any) => d.file_url);
          insDocs = (docs || []).filter((d: any) => d.document_type === 'insurance').map((d: any) => d.file_url);
          setPreloadedDocuments(true);
        } catch {}
        setVehicleData({ ...vehicle, audio: existingAudio, rc_docs: rcDocs, insurance_docs: insDocs });
        setPreloadedAssets(true);
      } catch {
        setVehicleData(vehicle);
      }
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
      navigate(createPageUrl('Inventory'));
    } finally {
      setIsLoading(false);
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
    // Show password confirmation modal first
    setShowPasswordModal(true);
    setPendingStatus(status);
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
      if (cleanData.airbags_count === '') cleanData.airbags_count = null;
      if (cleanData.condition_rating === '') cleanData.condition_rating = null;
      if (cleanData.engine_cc === '') cleanData.engine_cc = null;
      
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
      
      // Remove UI-only and condition fields not present in vehicles table
      const {
        audio,
        rc_docs,
        insurance_docs,
        tyres_ok,
        brakes_ok,
        flood_damage,
        accident_history,
        structural_damage,
        number_of_keys,
        condition_rating,
        condition_notes,
        ...dbData
      } = cleanData as any;

      // Normalize service history records
      if (Array.isArray(dbData.service_history)) {
        const normalized = dbData.service_history
          .filter((r: any) => r && (r.date || r.details))
          .map((r: any) => ({
            date: r.date || null,
            kms: r.kms !== '' && r.kms !== undefined ? Number(r.kms) : null,
            details: r.details || ''
          }));
        dbData.service_history = normalized.length > 0 ? normalized : null;
      }

      const finalPayload = { 
        ...dbData, 
        status: pendingStatus, 
        dealer_id: dealer.id,
        location_city: dealer.city,
        location_state: dealer.state
      };
      
      console.log('AddVehicle - Dealer object:', dealer);
      console.log('AddVehicle - Dealer ID being used:', dealer.id);
      console.log('AddVehicle - Final payload being sent to database:', finalPayload);
      
      let createdOrUpdated: any;
      if (isEditMode && vehicleId) {
        createdOrUpdated = await Vehicle.update(vehicleId, finalPayload);
        toast({
          title: `Listing ${pendingStatus === 'draft' ? 'Saved' : 'Published'}!`,
          description: `Your vehicle has been successfully ${pendingStatus === 'draft' ? 'saved as a draft' : 'updated'}.`,
        });
      } else {
        createdOrUpdated = await Vehicle.create(finalPayload);
        toast({
          title: `Listing ${pendingStatus === 'draft' ? 'Saved' : 'Published'}!`,
          description: `Your vehicle has been successfully ${pendingStatus === 'draft' ? 'saved as a draft' : 'added to the marketplace'}.`,
        });
      }

      const currentVehicleId = isEditMode && vehicleId ? vehicleId : createdOrUpdated?.id;

      // Sync engine audio assets: insert new and delete removed
      if (currentVehicleId) {
        try {
          const desiredUrls: string[] = (vehicleData.audio || []) as string[];
          if (!isEditMode || preloadedAssets) {
            const existingAssets = await VehicleAsset.filter({ vehicle_id: currentVehicleId });
            const existingAudio = (existingAssets || []).filter((a: any) => a.media_type === 'audio');
            const existingUrls = new Set(existingAudio.map((a: any) => a.file_url));
            const desiredSet = new Set(desiredUrls);

            const toInsert = [...desiredSet].filter((u) => !existingUrls.has(u));
            const toDelete = existingAudio.filter((a: any) => !desiredSet.has(a.file_url));

            if (toInsert.length > 0) {
              const rows = toInsert.map((url: string) => ({
                vehicle_id: currentVehicleId,
                file_url: url,
                file_type: 'audio',
                media_type: 'audio',
                purpose: 'engine_idle',
                transcoding_status: 'ready',
                is_primary: false,
              }));
              await VehicleAsset.create(rows);
            }
            for (const a of toDelete) {
              try { await VehicleAsset.delete(a.id); } catch {}
            }
          } else {
            // Preload failed (likely RLS); avoid deletions and append desired audio only
            if (desiredUrls.length > 0) {
              const rows = desiredUrls.map((url: string) => ({
                vehicle_id: currentVehicleId,
                file_url: url,
                file_type: 'audio',
                media_type: 'audio',
                purpose: 'engine_idle',
                transcoding_status: 'ready',
                is_primary: false,
              }));
              await VehicleAsset.create(rows);
            }
          }
        } catch (e) {
          console.error('Failed syncing audio assets:', e);
        }
      }

      // Sync RC/Insurance documents
      if (currentVehicleId) {
        const desiredRcs: string[] = (vehicleData.rc_docs || []) as string[];
        const desiredIns: string[] = (vehicleData.insurance_docs || []) as string[];
        try {
          if (!isEditMode || preloadedDocuments) {
            const existingDocs = await VehicleDocument.filter({ vehicle_id: currentVehicleId });
            const existingMap = new Map<string, any>();
            for (const d of existingDocs || []) {
              existingMap.set(`${d.document_type}|${d.file_url}`, d);
            }
            const desiredPairs: Array<{ type: string; url: string }> = [];
            for (const url of desiredRcs) desiredPairs.push({ type: 'rc', url });
            for (const url of desiredIns) desiredPairs.push({ type: 'insurance', url });
            const desiredKeySet = new Set(desiredPairs.map(p => `${p.type}|${p.url}`));
            const toInsertRows = desiredPairs
              .filter(p => !existingMap.has(`${p.type}|${p.url}`))
              .map(p => ({ vehicle_id: currentVehicleId, document_type: p.type, file_url: p.url }));
            const toDeleteRows = (existingDocs || [])
              .filter((d: any) => !desiredKeySet.has(`${d.document_type}|${d.file_url}`));
            if (toInsertRows.length > 0) {
              await VehicleDocument.create(toInsertRows);
            }
            for (const d of toDeleteRows) {
              try { await VehicleDocument.delete(d.id); } catch {}
            }
          } else {
            // Preload failed (likely due to RLS earlier). Avoid deletions; only append desired docs.
            const rows: any[] = [];
            for (const url of desiredRcs) rows.push({ vehicle_id: currentVehicleId, document_type: 'rc', file_url: url });
            for (const url of desiredIns) rows.push({ vehicle_id: currentVehicleId, document_type: 'insurance', file_url: url });
            if (rows.length > 0) await VehicleDocument.create(rows);
          }
        } catch (e) {
          console.error('Failed syncing vehicle documents:', e);
        }
      }

      // Upsert vehicle_condition from wizard fields (subset)
      if (currentVehicleId) {
        const conditionPayload: any = {
          vehicle_id: currentVehicleId,
          tyres_ok: !!vehicleData.tyres_ok,
          brakes_ok: !!vehicleData.brakes_ok,
          flood_damage: !!vehicleData.flood_damage,
          accident_history: !!vehicleData.accident_history,
          structural_damage: !!vehicleData.structural_damage,
          number_of_keys: vehicleData.number_of_keys ?? null,
          overall_rating: vehicleData.condition_rating ?? null,
          notes: vehicleData.condition_notes ?? null,
        };
        try { const up = await VehicleCondition.upsert(conditionPayload); console.log('Condition upserted:', up); } catch (e) { console.error('Failed upserting condition:', e); }
      }
      
      
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

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingStatus(null);
  };

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Setting up vehicle listing...</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 overflow-x-hidden">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {isEditMode 
              ? `Editing vehicle: ${vehicleData.registration_number || 'Loading...'}`
              : 'Follow the steps to create a new listing.'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
          <p className="text-sm text-center mt-2 text-slate-500 dark:text-slate-400">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </div>
        
        {/* Step Content */}
        <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-300">Fetching vehicle details...</p>
              </div>
            ) : (
              STEPS[currentStep].id === 'branch_selection' ? (
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
                />
              )
            )}
          </CardContent>
        </Card>

        {/* Navigation - Hide for branch selection step as it has its own buttons */}
        {STEPS[currentStep].id !== 'branch_selection' && (
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={(currentStep === 0 && !isEditMode) || (currentStep === 1 && isEditMode) || isSubmitting}
            >
            Back
          </Button>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="ghost"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex items-center gap-2 w-full sm:w-auto"
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
              className="min-w-[120px] w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === STEPS.length - 1 ? (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> {isEditMode ? 'Update Vehicle' : 'Publish Now'}
                </span>
              ) : (
                'Next Step'
              )}
            </Button>
          </div>
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
