import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle, CheckCircle2, ArrowRight, ArrowLeft, Zap, Crown, Building2, Database, BarChart3,
  Truck, Settings, Users, MapPin, Clock, Calculator, Shield, Star, Info,
  Lock, Unlock, Car, Wrench, Store, Warehouse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';

interface UpgradeWizardProps {
  onClose: () => void;
  dealer: any;
  onComplete?: (settings: ActivationSettings) => void;
}

interface ActivationSettings {
  businessType: 'used' | 'new' | 'both';
  currentBranches: number;
  expectedGrowth: 'stable' | 'growing' | 'expanding';
  hasSubBranches: boolean;
  branchTypes: string[];
  brandCoverage: BrandCoverage[];
  transferLogistics: LogisticsSettings;
  inspectionWorkflows: InspectionSettings;
  bulkOperations: BulkSettings;
  approvalWorkflows: ApprovalSettings;
  analyticsPreferences: AnalyticsSettings;
  themingPreferences: ThemingSettings;
}

interface BrandCoverage {
  brand: string;
  exclusive: boolean;
  branches: string[];
}

interface LogisticsSettings {
  useDrivers: boolean;
  useCarriers: boolean;
  carriers: string[];
  checklistRequired: boolean;
  photoVerification: boolean;
}

interface InspectionSettings {
  intakeChecks: boolean;
  pdiRequired: boolean;
  checklistTemplates: string[];
  autoCreateJobs: boolean;
}

interface BulkSettings {
  expectedVolume: 'small' | 'medium' | 'large';
  dataSources: string[];
  automationLevel: 'manual' | 'semi' | 'full';
}

interface ApprovalSettings {
  priceBands: boolean;
  multiStage: boolean;
  autoApprovalLimit?: number;
}

interface AnalyticsSettings {
  dashboardType: 'basic' | 'customised' | 'custom';
  keyMetrics: string[];
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

interface ThemingSettings {
  customBranding: boolean;
  consistentTheme: boolean;
  branchSpecificColors: boolean;
}

// Available brands for selection
const AVAILABLE_BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Honda', 'Mahindra', 'Tata', 'Toyota', 'Ford', 'Volkswagen',
  'Kia', 'MG', 'Renault', 'Nissan', 'Jeep', 'Skoda', 'Audi', 'BMW', 'Mercedes-Benz'
];

// Available carriers
const AVAILABLE_CARRIERS = [
  'Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'DHL', 'Aramex', 'Gati', 'VRL Logistics'
];

// Checklist templates
const CHECKLIST_TEMPLATES = [
  'PDI (Pre-Delivery Inspection)',
  'Intake Inspection',
  'Maintenance Check',
  'Damage Assessment',
  'Trade-in Evaluation'
];

const STEPS = [
  {
    id: 'business_type',
    title: 'Business Focus',
    description: 'Tell us about your dealership type',
    icon: Building2,
    required: true
  },
  {
    id: 'branches_team',
    title: 'Branches & Team',
    description: 'Current setup and growth plans',
    icon: MapPin,
    required: true
  },
  {
    id: 'brands_coverage',
    title: 'Brand Coverage',
    description: 'Which brands do you sell/service?',
    icon: Car,
    required: false, // Only for new car dealers
    conditional: true
  },
  {
    id: 'attributes',
    title: 'Vehicle Specs',
            description: 'Customised specifications and smart fields',
    icon: Settings,
    required: false
  },
  {
    id: 'transfers_logistics',
    title: 'Transfers & Logistics',
    description: 'How do you move vehicles between branches?',
    icon: Truck,
    required: true
  },
  {
    id: 'inspections',
    title: 'Quality Control',
    description: 'Inspection and quality workflows',
    icon: Shield,
    required: true
  },
  {
    id: 'bulk_operations',
    title: 'Data Management',
    description: 'Bulk operations and data imports',
    icon: Database,
    required: true
  },
  {
    id: 'approvals',
    title: 'Price Controls',
    description: 'Approval workflows and price bands',
    icon: Calculator,
    required: true
  },
  {
    id: 'analytics',
    title: 'Business Intelligence',
    description: 'Analytics and reporting preferences',
    icon: BarChart3,
    required: true
  },
  {
    id: 'theming',
    title: 'Visual Branding',
    description: 'Branch theming and customization',
    icon: Star,
    required: false
  },
  {
    id: 'complete',
    title: 'Activation Complete',
    description: 'Review what you\'ve unlocked',
    icon: CheckCircle,
    required: true
  }
];

const FEATURES_PREVIEW = [
  { id: 'unlimited_branches', name: 'Unlimited Branches', description: 'Create as many branches as needed', unlocked: false },
  { id: 'branch_hierarchy', name: 'Branch Hierarchy', description: 'Organize with parent/child relationships', unlocked: false },
  { id: 'brand_coverage', name: 'Brand Coverage', description: 'Brand-specific fields and filters', unlocked: false },
  { id: 'attribute_sets', name: 'Attribute Sets', description: 'Custom vehicle specifications', unlocked: false },
  { id: 'vin_mapping', name: 'VIN Mapping', description: 'Automatic data population', unlocked: false },
  { id: 'driver_assignment', name: 'Driver Assignment', description: 'Professional transport management', unlocked: false },
  { id: 'photo_verification', name: 'Photo Verification', description: 'Before/after transfer photos', unlocked: false },
  { id: 'inspections', name: 'Inspection Workflows', description: 'PDI and quality control', unlocked: false },
  { id: 'bulk_operations', name: 'Bulk Operations', description: 'Import up to 5,000 vehicles', unlocked: false },
          { id: 'data_ops', name: 'Data Ops', description: 'Customised import/export tools', unlocked: false },
  { id: 'approvals', name: 'Approval Workflows', description: 'Multi-stage price approvals', unlocked: false },
  { id: 'price_bands', name: 'Price Bands', description: 'Automated pricing guidelines', unlocked: false },
          { id: 'analytics', name: 'Customised Analytics', description: 'BI dashboards and reporting', unlocked: false },
  { id: 'scheduled_reports', name: 'Scheduled Reports', description: 'Automated report delivery', unlocked: false },
  { id: 'branch_theming', name: 'Branch Theming', description: 'Custom branding per branch', unlocked: false }
];

export default function UpgradeWizard({ onClose, dealer, onComplete }: UpgradeWizardProps) {
  const navigate = useNavigate();
  const {
    saveSettings,
    checkFeatureAccess,
    settings,
    isLoading: isSettingsLoading
  } = useDealerActivationSettings();

  // Check if user has already completed activation
  const hasCompletedActivation = dealer?.activation_completed || settings?.activation_completed;

  // If user has already completed activation, show edit mode
  if (hasCompletedActivation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-700">Customised Inventory Active</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                Your Customised Inventory is already activated with advanced features.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={onClose} variant="outline">
                  Continue to Inventory
                </Button>
                <Button
                  onClick={() => {
                    // Show edit mode (for now just close, but could implement edit mode later)
                    onClose();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - initialized with dealer's existing settings if available
  const [activationData, setActivationData] = useState<ActivationSettings>({
    businessType: 'used',
    currentBranches: dealer?.current_branches || 1,
    expectedGrowth: 'stable',
    hasSubBranches: false,
    branchTypes: [],
    brandCoverage: [],
    transferLogistics: {
      useDrivers: false,
      useCarriers: false,
      carriers: [],
      checklistRequired: false,
      photoVerification: false
    },
    inspectionWorkflows: {
      intakeChecks: false,
      pdiRequired: false,
      checklistTemplates: [],
      autoCreateJobs: false
    },
    bulkOperations: {
      expectedVolume: 'small',
      dataSources: [],
      automationLevel: 'manual'
    },
    approvalWorkflows: {
      priceBands: false,
      multiStage: false
    },
    analyticsPreferences: {
      dashboardType: 'basic',
      keyMetrics: [],
      reportFrequency: 'weekly'
    },
    themingPreferences: {
      customBranding: false,
      consistentTheme: false,
      branchSpecificColors: false
    }
  });

  // Track unlocked features for preview
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set());

  // Update unlocked features based on current step
  useEffect(() => {
    const newUnlockedFeatures = new Set<string>();

    // Step-based feature unlocking
    if (currentStep >= 1) { // After business type
      newUnlockedFeatures.add('unlimited_branches');
    }

    if (currentStep >= 1) { // After branches & team
      newUnlockedFeatures.add('branch_hierarchy');
    }

    if (currentStep >= 2 && (activationData.businessType === 'new' || activationData.businessType === 'both')) {
      newUnlockedFeatures.add('brand_coverage');
    }

    if (currentStep >= 3) { // After attributes
      newUnlockedFeatures.add('attribute_sets');
      newUnlockedFeatures.add('vin_mapping');
    }

    if (currentStep >= 4) { // After transfers & logistics
      newUnlockedFeatures.add('driver_assignment');
      newUnlockedFeatures.add('photo_verification');
    }

    if (currentStep >= 5) { // After inspections
      newUnlockedFeatures.add('inspections');
    }

    if (currentStep >= 6) { // After bulk operations
      newUnlockedFeatures.add('bulk_operations');
      newUnlockedFeatures.add('data_ops');
    }

    if (currentStep >= 7) { // After approvals
      newUnlockedFeatures.add('approvals');
      newUnlockedFeatures.add('price_bands');
    }

    if (currentStep >= 8) { // After analytics
      newUnlockedFeatures.add('analytics');
      newUnlockedFeatures.add('scheduled_reports');
    }

    if (currentStep >= 9) { // After theming
      newUnlockedFeatures.add('branch_theming');
    }

    setUnlockedFeatures(newUnlockedFeatures);
  }, [currentStep, activationData.businessType]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip optional steps
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Convert wizard data to API format
      const settingsToSave = {
        dealer_id: dealer?.id || '',
        activation_completed: true,
        activation_date: new Date().toISOString(),
        business_type: activationData.businessType,
        current_branches: activationData.currentBranches,
        expected_growth: activationData.expectedGrowth,
        has_sub_branches: activationData.hasSubBranches,
        branch_types: activationData.branchTypes,
        brand_coverage: activationData.brandCoverage,
        advanced_specs_enabled: activationData.transferLogistics.photoVerification, // Using as proxy
        conditional_fields_enabled: activationData.inspectionWorkflows.autoCreateJobs, // Using as proxy
        use_internal_drivers: activationData.transferLogistics.useDrivers,
        use_external_carriers: activationData.transferLogistics.useCarriers,
        preferred_carriers: activationData.transferLogistics.carriers,
        checklist_required: activationData.transferLogistics.checklistRequired,
        photo_verification: activationData.transferLogistics.photoVerification,
        intake_checks: activationData.inspectionWorkflows.intakeChecks,
        pdi_required: activationData.inspectionWorkflows.pdiRequired,
        checklist_templates: activationData.inspectionWorkflows.checklistTemplates,
        auto_create_inspection_jobs: activationData.inspectionWorkflows.autoCreateJobs,
        bulk_volume_expected: activationData.bulkOperations.expectedVolume,
        data_sources: activationData.bulkOperations.dataSources,
        automation_level: activationData.bulkOperations.automationLevel,
        price_bands_enabled: activationData.approvalWorkflows.priceBands,
        multi_stage_approvals: activationData.approvalWorkflows.multiStage,
        auto_approval_limit: activationData.approvalWorkflows.autoApprovalLimit,
        dashboard_type: activationData.analyticsPreferences.dashboardType,
        key_metrics: activationData.analyticsPreferences.keyMetrics,
        report_frequency: activationData.analyticsPreferences.reportFrequency,
        custom_branding: activationData.themingPreferences.customBranding,
        consistent_theme: activationData.themingPreferences.consistentTheme,
        branch_specific_colors: activationData.themingPreferences.branchSpecificColors
      };

      // Save activation settings using the hook
      const success = await saveSettings(settingsToSave as any);

      if (success) {
        // Call onComplete callback if provided
        if (onComplete) {
          await onComplete(activationData);
        }

        // Navigate back to inventory to show customised features immediately
        setTimeout(() => {
          onClose();
          navigate(createPageUrl('Inventory'));
        }, 1500);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error completing activation:', error);
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateActivationData = (updates: Partial<ActivationSettings>) => {
    setActivationData(prev => ({ ...prev, ...updates }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'business_type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Which describes you best?
              </h3>
              <p className="text-slate-600">
                So we only ask what's relevant. Used-car dealers don't need brand-per-branch setup.
              </p>
            </div>

            <RadioGroup
              value={activationData.businessType}
              onValueChange={(value: 'used' | 'new' | 'both') =>
                updateActivationData({ businessType: value })
              }
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value="used" id="used" />
                  <div className="flex-1">
                    <Label htmlFor="used" className="font-medium cursor-pointer">
                      Used cars (multi-brand)
                    </Label>
                    <p className="text-sm text-slate-600">Focus on pre-owned vehicles</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value="new" id="new" />
                  <div className="flex-1">
                    <Label htmlFor="new" className="font-medium cursor-pointer">
                      New cars (single or multi brand)
                    </Label>
                    <p className="text-sm text-slate-600">Deal with new vehicle inventory</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value="both" id="both" />
                  <div className="flex-1">
                    <Label htmlFor="both" className="font-medium cursor-pointer">
                      Both new and used
                    </Label>
                    <p className="text-sm text-slate-600">Full-service dealership</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 'branches_team':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Current setup and growth plans
              </h3>
              <p className="text-slate-600">
                To enable unlimited branches, group them logically, and show the right tools per location type.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentBranches">How many branches do you operate now?</Label>
                  <Input
                    id="currentBranches"
                    type="number"
                    min="1"
                    value={activationData.currentBranches}
                    onChange={(e) => updateActivationData({
                      currentBranches: parseInt(e.target.value) || 1
                    })}
                  />
                </div>

                <div>
                  <Label>Will you add more soon?</Label>
                  <RadioGroup
                    value={activationData.expectedGrowth}
                    onValueChange={(value: 'stable' | 'growing' | 'expanding') =>
                      updateActivationData({ expectedGrowth: value })
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stable" id="stable" />
                        <Label htmlFor="stable">Stable - keeping current branches</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="growing" id="growing" />
                        <Label htmlFor="growing">Growing - adding a few more</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expanding" id="expanding" />
                        <Label htmlFor="expanding">Expanding - significant growth planned</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subBranches"
                    checked={activationData.hasSubBranches}
                    onCheckedChange={(checked) =>
                      updateActivationData({ hasSubBranches: !!checked })
                    }
                  />
                  <Label htmlFor="subBranches">Do you use sub-branches?</Label>
                </div>

                <div>
                  <Label>Branch types (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'showroom', label: 'Showroom', icon: Store },
                      { id: 'workshop', label: 'Workshop', icon: Wrench },
                      { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
                      { id: 'kiosk', label: 'Kiosk', icon: MapPin }
                    ].map((type) => (
                      <div
                        key={type.id}
                        className={`flex items-center space-x-2 p-2 border rounded cursor-pointer ${
                          activationData.branchTypes.includes(type.id)
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          const newTypes = activationData.branchTypes.includes(type.id)
                            ? activationData.branchTypes.filter(t => t !== type.id)
                            : [...activationData.branchTypes, type.id];
                          updateActivationData({ branchTypes: newTypes });
                        }}
                      >
                        <Checkbox
                          checked={activationData.branchTypes.includes(type.id)}
                        />
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'brands_coverage':
        // Only show for new car dealers
        if (activationData.businessType === 'used') {
          return (
            <div className="text-center py-12">
              <Info className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Brand Setup Skipped
              </h3>
              <p className="text-slate-600">
                Since you selected "Used cars", brand-per-branch setup is not required.
                You'll still have access to all brand coverage features if needed later.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Which brands do you sell/service?
              </h3>
              <p className="text-slate-600">
                This lets us show brand-specific fields only where they apply and keeps forms clean.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Select brands and assign to branches:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_BRANDS.map((brand) => (
                  <div
                    key={brand}
                    className={`p-3 border rounded-lg cursor-pointer text-center ${
                      activationData.brandCoverage.some(bc => bc.brand === brand)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      const existingIndex = activationData.brandCoverage.findIndex(bc => bc.brand === brand);
                      if (existingIndex >= 0) {
                        // Remove brand
                        const newCoverage = activationData.brandCoverage.filter((_, i) => i !== existingIndex);
                        updateActivationData({ brandCoverage: newCoverage });
                      } else {
                        // Add brand
                        const newCoverage = [...activationData.brandCoverage, {
                          brand,
                          exclusive: false,
                          branches: []
                        }];
                        updateActivationData({ brandCoverage: newCoverage });
                      }
                    }}
                  >
                    <div className="font-medium text-sm">{brand}</div>
                  </div>
                ))}
              </div>

              {activationData.brandCoverage.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-3">Configure selected brands:</h4>
                  <div className="space-y-3">
                    {activationData.brandCoverage.map((brandCoverage, index) => (
                      <div key={brandCoverage.brand} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{brandCoverage.brand}</span>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`exclusive-${index}`}
                              checked={brandCoverage.exclusive}
                              onCheckedChange={(checked) =>
                                updateActivationData({
                                  brandCoverage: activationData.brandCoverage.map((bc, i) =>
                                    i === index ? { ...bc, exclusive: !!checked } : bc
                                  )
                                })
                              }
                            />
                            <Label htmlFor={`exclusive-${index}`} className="text-sm">
                              Exclusive dealership
                            </Label>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Available at branches:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {/* Would show branch selection here */}
                            <span className="text-xs text-slate-500">All branches (configurable later)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Customised Inventory Activated!
              </h3>
              <p className="text-slate-600 mb-6">
                Here's everything you've unlocked with your Customised Inventory activation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Features Unlocked:</h4>
                <div className="space-y-2">
                  {FEATURES_PREVIEW.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-3 p-2 rounded ${
                        unlockedFeatures.has(feature.id)
                          ? 'bg-green-50 text-green-800'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {unlockedFeatures.has(feature.id) ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs opacity-75">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Quick Actions:</h4>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      handleComplete();
                      // Could add logic to navigate to specific features
                    }}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Create 3rd Branch
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      handleComplete();
                    }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Start a Transfer
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      handleComplete();
                    }}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Open Data Ops
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'attributes':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Customised specifications and smart fields
              </h3>
              <p className="text-slate-600">
                Richer specs improve discovery, trust, and analytics—without overwhelming your team.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customised_specs"
                  checked={activationData.transferLogistics.photoVerification}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      transferLogistics: {
                        ...activationData.transferLogistics,
                        photoVerification: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="customised_specs" className="font-medium cursor-pointer">
                    Enable customised vehicle specifications
                  </Label>
                  <p className="text-sm text-slate-600">Powertrain, Dimensions, Safety, Infotainment, Emissions</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conditional_fields"
                  checked={activationData.inspectionWorkflows.autoCreateJobs}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      inspectionWorkflows: {
                        ...activationData.inspectionWorkflows,
                        autoCreateJobs: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="conditional_fields" className="font-medium cursor-pointer">
                    Smart conditional fields
                  </Label>
                  <p className="text-sm text-slate-600">Show Battery Capacity only for EV vehicles</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'transfers_logistics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                How do you move vehicles between branches?
              </h3>
              <p className="text-slate-600">
                To automate handovers and protect you with before/after photo proof.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_drivers"
                    checked={activationData.transferLogistics.useDrivers}
                    onCheckedChange={(checked) =>
                      updateActivationData({
                        transferLogistics: {
                          ...activationData.transferLogistics,
                          useDrivers: !!checked
                        }
                      })
                    }
                  />
                  <Label htmlFor="use_drivers" className="cursor-pointer">Use internal drivers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_carriers"
                    checked={activationData.transferLogistics.useCarriers}
                    onCheckedChange={(checked) =>
                      updateActivationData({
                        transferLogistics: {
                          ...activationData.transferLogistics,
                          useCarriers: !!checked
                        }
                      })
                    }
                  />
                  <Label htmlFor="use_carriers" className="cursor-pointer">Use external carriers</Label>
                </div>
              </div>

              {activationData.transferLogistics.useCarriers && (
                <div>
                  <Label>Select preferred carriers:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {AVAILABLE_CARRIERS.map((carrier) => (
                      <div
                        key={carrier}
                        className={`flex items-center space-x-2 p-2 border rounded cursor-pointer ${
                          activationData.transferLogistics.carriers.includes(carrier)
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          const newCarriers = activationData.transferLogistics.carriers.includes(carrier)
                            ? activationData.transferLogistics.carriers.filter(c => c !== carrier)
                            : [...activationData.transferLogistics.carriers, carrier];
                          updateActivationData({
                            transferLogistics: {
                              ...activationData.transferLogistics,
                              carriers: newCarriers
                            }
                          });
                        }}
                      >
                        <Checkbox
                          checked={activationData.transferLogistics.carriers.includes(carrier)}
                        />
                        <span className="text-sm">{carrier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="photo_checklist"
                  checked={activationData.transferLogistics.checklistRequired}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      transferLogistics: {
                        ...activationData.transferLogistics,
                        checklistRequired: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="photo_checklist" className="font-medium cursor-pointer">
                    Require photo checklist for transfers
                  </Label>
                  <p className="text-sm text-slate-600">12-angle photos + odometer + damage tags</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inspections':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Inspection and quality workflows
              </h3>
              <p className="text-slate-600">
                To ensure quality and protect you with documented inspections.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intake_checks"
                  checked={activationData.inspectionWorkflows.intakeChecks}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      inspectionWorkflows: {
                        ...activationData.inspectionWorkflows,
                        intakeChecks: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="intake_checks" className="font-medium cursor-pointer">
                    Enable intake inspections
                  </Label>
                  <p className="text-sm text-slate-600">Check vehicles when they arrive</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdi_required"
                  checked={activationData.inspectionWorkflows.pdiRequired}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      inspectionWorkflows: {
                        ...activationData.inspectionWorkflows,
                        pdiRequired: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="pdi_required" className="font-medium cursor-pointer">
                    Require PDI (Pre-Delivery Inspection)
                  </Label>
                  <p className="text-sm text-slate-600">Quality check before delivery</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_create_jobs"
                  checked={activationData.inspectionWorkflows.autoCreateJobs}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      inspectionWorkflows: {
                        ...activationData.inspectionWorkflows,
                        autoCreateJobs: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="auto_create_jobs" className="font-medium cursor-pointer">
                    Auto-create inspection jobs
                  </Label>
                  <p className="text-sm text-slate-600">Automatically create jobs for new arrivals</p>
                </div>
              </div>

              {(activationData.inspectionWorkflows.intakeChecks || activationData.inspectionWorkflows.pdiRequired) && (
                <div>
                  <Label>Available checklist templates:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {CHECKLIST_TEMPLATES.map((template) => (
                      <div
                        key={template}
                        className={`flex items-center space-x-2 p-3 border rounded cursor-pointer ${
                          activationData.inspectionWorkflows.checklistTemplates.includes(template)
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          const newTemplates = activationData.inspectionWorkflows.checklistTemplates.includes(template)
                            ? activationData.inspectionWorkflows.checklistTemplates.filter(t => t !== template)
                            : [...activationData.inspectionWorkflows.checklistTemplates, template];
                          updateActivationData({
                            inspectionWorkflows: {
                              ...activationData.inspectionWorkflows,
                              checklistTemplates: newTemplates
                            }
                          });
                        }}
                      >
                        <Checkbox
                          checked={activationData.inspectionWorkflows.checklistTemplates.includes(template)}
                        />
                        <span className="text-sm">{template}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'bulk_operations':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Bulk operations and data imports
              </h3>
              <p className="text-slate-600">
                To speed up large updates and reduce manual work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>How many vehicles do you import at once?</Label>
                  <Select
                    value={activationData.bulkOperations.expectedVolume}
                    onValueChange={(value: 'small' | 'medium' | 'large') =>
                      updateActivationData({
                        bulkOperations: {
                          ...activationData.bulkOperations,
                          expectedVolume: value
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (up to 500 vehicles)</SelectItem>
                      <SelectItem value="medium">Medium (500-2,000 vehicles)</SelectItem>
                      <SelectItem value="large">Large (2,000+ vehicles)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Automation level:</Label>
                  <RadioGroup
                    value={activationData.bulkOperations.automationLevel}
                    onValueChange={(value: 'manual' | 'semi' | 'full') =>
                      updateActivationData({
                        bulkOperations: {
                          ...activationData.bulkOperations,
                          automationLevel: value
                        }
                      })
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Manual - I review everything</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="semi" id="semi" />
                        <Label htmlFor="semi">Semi-automatic - Some automation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full">Full automation - Hands-off processing</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Data sources you plan to use:</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      'CSV files',
                      'Google Sheets',
                      'Dealer management system',
                      'External APIs'
                    ].map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={source.toLowerCase().replace(' ', '_')}
                          checked={activationData.bulkOperations.dataSources.includes(source)}
                          onCheckedChange={(checked) => {
                            const newSources = checked
                              ? [...activationData.bulkOperations.dataSources, source]
                              : activationData.bulkOperations.dataSources.filter(s => s !== source);
                            updateActivationData({
                              bulkOperations: {
                                ...activationData.bulkOperations,
                                dataSources: newSources
                              }
                            });
                          }}
                        />
                        <Label htmlFor={source.toLowerCase().replace(' ', '_')} className="text-sm">
                          {source}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Customised Inventory unlocks:</strong> Bulk upload up to 5,000 vehicles, saved mappings, and scheduled syncs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'approvals':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Approval workflows and price bands
              </h3>
              <p className="text-slate-600">
                Keep pricing consistent and safe, without micro-managing every edit.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price_bands"
                  checked={activationData.approvalWorkflows.priceBands}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      approvalWorkflows: {
                        ...activationData.approvalWorkflows,
                        priceBands: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="price_bands" className="font-medium cursor-pointer">
                    Enable price bands and guidelines
                  </Label>
                  <p className="text-sm text-slate-600">Set min/max prices for different vehicle categories</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multi_stage"
                  checked={activationData.approvalWorkflows.multiStage}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      approvalWorkflows: {
                        ...activationData.approvalWorkflows,
                        multiStage: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="multi_stage" className="font-medium cursor-pointer">
                    Multi-stage approval workflow
                  </Label>
                  <p className="text-sm text-slate-600">Manager → Senior Manager → Director approval chain</p>
                </div>
              </div>

              {activationData.approvalWorkflows.priceBands && (
                <div className="p-4 border border-slate-200 rounded-lg">
                  <Label className="font-medium">Auto-approval limit:</Label>
                  <p className="text-sm text-slate-600 mt-1 mb-3">
                    Prices below this threshold don't require approval
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">₹</span>
                    <Input
                      type="number"
                      value={activationData.approvalWorkflows.autoApprovalLimit || ''}
                      onChange={(e) =>
                        updateActivationData({
                          approvalWorkflows: {
                            ...activationData.approvalWorkflows,
                            autoApprovalLimit: parseInt(e.target.value) || undefined
                          }
                        })
                      }
                      placeholder="500000"
                      className="w-32"
                    />
                    <span className="text-sm text-slate-600">and below</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-teal-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Analytics and reporting preferences
              </h3>
              <p className="text-slate-600">
                Focus the BI on what you care about and automate reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Dashboard type:</Label>
                  <RadioGroup
                    value={activationData.analyticsPreferences.dashboardType}
                    onValueChange={(value: 'basic' | 'customised' | 'custom') =>
                      updateActivationData({
                        analyticsPreferences: {
                          ...activationData.analyticsPreferences,
                          dashboardType: value
                        }
                      })
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="basic_dash" />
                        <Label htmlFor="basic_dash">Basic - Key metrics only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="customised" id="customised_dash" />
                <Label htmlFor="customised_dash">Customised - Full BI suite</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom_dash" />
                        <Label htmlFor="custom_dash">Custom - Build my own</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Report frequency:</Label>
                  <RadioGroup
                    value={activationData.analyticsPreferences.reportFrequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      updateActivationData({
                        analyticsPreferences: {
                          ...activationData.analyticsPreferences,
                          reportFrequency: value
                        }
                      })
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Daily reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Weekly reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Monthly reports</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Key metrics to track:</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      'Stock aging analysis',
                      'Time to sell',
                      'Model mix performance',
                      'Source ROI tracking',
                      'Branch performance',
                      'Market trends'
                    ].map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric.toLowerCase().replace(' ', '_')}
                          checked={activationData.analyticsPreferences.keyMetrics.includes(metric)}
                          onCheckedChange={(checked) => {
                            const newMetrics = checked
                              ? [...activationData.analyticsPreferences.keyMetrics, metric]
                              : activationData.analyticsPreferences.keyMetrics.filter(m => m !== metric);
                            updateActivationData({
                              analyticsPreferences: {
                                ...activationData.analyticsPreferences,
                                keyMetrics: newMetrics
                              }
                            });
                          }}
                        />
                        <Label htmlFor={metric.toLowerCase().replace(' ', '_')} className="text-sm">
                          {metric}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'theming':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Branch theming and customization
              </h3>
              <p className="text-slate-600">
                Different branches feel distinct without changing your workflows.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom_branding"
                  checked={activationData.themingPreferences.customBranding}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      themingPreferences: {
                        ...activationData.themingPreferences,
                        customBranding: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="custom_branding" className="font-medium cursor-pointer">
                    Enable custom branding
                  </Label>
                  <p className="text-sm text-slate-600">Upload logos and custom colors per branch</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consistent_theme"
                  checked={activationData.themingPreferences.consistentTheme}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      themingPreferences: {
                        ...activationData.themingPreferences,
                        consistentTheme: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="consistent_theme" className="font-medium cursor-pointer">
                    Maintain consistent theme across branches
                  </Label>
                  <p className="text-sm text-slate-600">Same look and feel everywhere</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branch_colors"
                  checked={activationData.themingPreferences.branchSpecificColors}
                  onCheckedChange={(checked) =>
                    updateActivationData({
                      themingPreferences: {
                        ...activationData.themingPreferences,
                        branchSpecificColors: !!checked
                      }
                    })
                  }
                />
                <div>
                  <Label htmlFor="branch_colors" className="font-medium cursor-pointer">
                    Branch-specific accent colors
                  </Label>
                  <p className="text-sm text-slate-600">Each branch has its own color scheme</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Theming options can be configured later in Settings after activation.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Info className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Step Content Coming Soon
            </h3>
            <p className="text-slate-600 mt-2">
              This step is under development and will be available soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StepIcon className="w-6 h-6" />
                <div>
                  <h1 className="text-xl font-bold">{currentStepData.title}</h1>
                  <p className="text-blue-100 text-sm">{currentStepData.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white text-blue-600">
                Step {currentStep + 1} of {STEPS.length}
              </Badge>
            </div>

            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-blue-100">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Customised Inventory Activation</span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {renderStepContent()}
          </div>

          <div className="border-t p-6 bg-slate-50">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStepData.id === 'complete' ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Activating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Activation
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    {!currentStepData.required && (
                      <Button variant="ghost" onClick={handleSkip}>
                        Skip
                      </Button>
                    )}
                    <Button onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-80 border-l bg-slate-50 p-6 overflow-y-auto">
          <div className="sticky top-0">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Features Unlocking
            </h3>

            <div className="space-y-2">
              {FEATURES_PREVIEW.map((feature) => (
                <div
                  key={feature.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    unlockedFeatures.has(feature.id)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  {unlockedFeatures.has(feature.id) ? (
                    <Unlock className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${
                      unlockedFeatures.has(feature.id) ? 'text-green-800' : 'text-slate-600'
                    }`}>
                      {feature.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Pro tip:</strong> Complete all steps to unlock the full Customised Inventory experience with all premium features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
