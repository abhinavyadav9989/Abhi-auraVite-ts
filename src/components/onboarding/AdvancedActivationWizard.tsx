import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Car,
  Truck,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Info,
  Star,
  Users,
  MapPin,
  Clock,
  Calculator,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';

interface AdvancedActivationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  dealer: any;
  onComplete: (settings: ActivationSettings) => void;
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
  models: string[];
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
  bandTiers: PriceBand[];
  multiStage: boolean;
  autoApprovalLimit?: number;
}

interface PriceBand {
  min: number;
  max: number;
  requiresApproval: boolean;
  approverRole: string;
}

interface AnalyticsSettings {
  dashboardType: 'basic' | 'advanced' | 'custom';
  keyMetrics: string[];
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  exportFormats: string[];
}

interface ThemingSettings {
  customBranding: boolean;
  consistentTheme: boolean;
  branchSpecificColors: boolean;
  logoRequired: boolean;
}

const STEPS = [
  {
    id: 'business_type',
    title: 'Business Focus',
    description: 'Tell us about your dealership type',
    icon: Building2
  },
  {
    id: 'branches_team',
    title: 'Branches & Team',
    description: 'Current setup and growth plans',
    icon: MapPin
  },
  {
    id: 'brands_coverage',
    title: 'Brand Coverage',
    description: 'Which brands do you sell/service?',
    icon: Car,
    conditional: true // Only show for new car dealers
  },
  {
    id: 'transfers_logistics',
    title: 'Transfers & Logistics',
    description: 'How do you move vehicles between branches?',
    icon: Truck
  },
  {
    id: 'inspections',
    title: 'Quality Control',
    description: 'Inspection and quality workflows',
    icon: Shield
  },
  {
    id: 'bulk_operations',
    title: 'Data Management',
    description: 'Bulk operations and data imports',
    icon: Calculator
  },
  {
    id: 'approvals',
    title: 'Approvals & Controls',
    description: 'Price approvals and quality gates',
    icon: CheckCircle2
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    description: 'Business intelligence preferences',
    icon: BarChart3
  },
  {
    id: 'theming',
    title: 'Branding & Theme',
    description: 'Visual customization preferences',
    icon: Star
  },
  {
    id: 'summary',
    title: 'Activation Summary',
    description: 'Review your selections',
    icon: Zap
  }
];

export default function AdvancedActivationWizard({
  isOpen,
  onClose,
  dealer,
  onComplete
}: AdvancedActivationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState<Partial<ActivationSettings>>({
    businessType: 'both',
    currentBranches: 1,
    expectedGrowth: 'stable',
    hasSubBranches: false,
    branchTypes: [],
    brandCoverage: [],
    transferLogistics: {
      useDrivers: false,
      useCarriers: false,
      carriers: [],
      checklistRequired: true,
      photoVerification: true
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
      bandTiers: [],
      multiStage: false
    },
    analyticsPreferences: {
      dashboardType: 'basic',
      keyMetrics: ['sales', 'inventory_turnover'],
      reportFrequency: 'weekly',
      exportFormats: ['pdf']
    },
    themingPreferences: {
      customBranding: false,
      consistentTheme: true,
      branchSpecificColors: false,
      logoRequired: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentStepData = STEPS[currentStep];
  const CurrentIcon = currentStepData.icon;

  // Skip brand step for used-car only dealers
  const shouldSkipStep = (stepId: string) => {
    if (stepId === 'brands_coverage' && settings.businessType === 'used') {
      return true;
    }
    return false;
  };

  const getNextStep = () => {
    let nextIndex = currentStep + 1;
    while (nextIndex < STEPS.length && shouldSkipStep(STEPS[nextIndex].id)) {
      nextIndex++;
    }
    return Math.min(nextIndex, STEPS.length - 1);
  };

  const getPrevStep = () => {
    let prevIndex = currentStep - 1;
    while (prevIndex >= 0 && shouldSkipStep(STEPS[prevIndex].id)) {
      prevIndex--;
    }
    return Math.max(prevIndex, 0);
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = getPrevStep();
    if (prevStep !== currentStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically save to backend
      console.log('Activating advanced features with settings:', settings);

      toast({
        title: "Advanced Features Activated!",
        description: "Your dealership is now configured with advanced capabilities.",
      });

      onComplete(settings as ActivationSettings);
      onClose();
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSettings = (updates: Partial<ActivationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'business_type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">What type of dealership do you run?</h3>
              <p className="text-gray-600">This helps us customize the features for your business needs.</p>
            </div>

            <RadioGroup
              value={settings.businessType}
              onValueChange={(value: 'used' | 'new' | 'both') =>
                updateSettings({ businessType: value })
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Label className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <RadioGroupItem value="used" className="sr-only" />
                <Car className="w-8 h-8 mb-2 text-green-600" />
                <span className="font-medium">Used Cars</span>
                <span className="text-sm text-gray-600 text-center">Multi-brand used vehicle sales</span>
              </Label>

              <Label className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <RadioGroupItem value="new" className="sr-only" />
                <Star className="w-8 h-8 mb-2 text-blue-600" />
                <span className="font-medium">New Cars</span>
                <span className="text-sm text-gray-600 text-center">New vehicle sales & service</span>
              </Label>

              <Label className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <RadioGroupItem value="both" className="sr-only" />
                <Building2 className="w-8 h-8 mb-2 text-purple-600" />
                <span className="font-medium">Both</span>
                <span className="text-sm text-gray-600 text-center">New & used vehicle operations</span>
              </Label>
            </RadioGroup>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <strong>Note:</strong> Used car dealers can skip brand-specific setup. New car dealers will configure brand coverage next.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'branches_team':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Branch Setup</h3>
              <p className="text-gray-600">Tell us about your current operations and growth plans.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current_branches">How many branches do you currently have?</Label>
                  <Select
                    value={settings.currentBranches?.toString()}
                    onValueChange={(value) => updateSettings({ currentBranches: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 branch</SelectItem>
                      <SelectItem value="2">2 branches</SelectItem>
                      <SelectItem value="3">3 branches</SelectItem>
                      <SelectItem value="4">4 branches</SelectItem>
                      <SelectItem value="5">5+ branches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="growth">Expected growth in next 12 months?</Label>
                  <Select
                    value={settings.expectedGrowth}
                    onValueChange={(value: 'stable' | 'growing' | 'expanding') =>
                      updateSettings({ expectedGrowth: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stable">Stable (no new branches)</SelectItem>
                      <SelectItem value="growing">Growing (1-2 new branches)</SelectItem>
                      <SelectItem value="expanding">Expanding (3+ new branches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sub_branches"
                    checked={settings.hasSubBranches}
                    onCheckedChange={(checked) =>
                      updateSettings({ hasSubBranches: checked === true })
                    }
                  />
                  <Label htmlFor="sub_branches">Do you have sub-branches or satellite locations?</Label>
                </div>

                <div>
                  <Label>What types of branches do you operate?</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { id: 'showroom', label: 'Showroom', desc: 'Vehicle display & sales' },
                      { id: 'workshop', label: 'Workshop', desc: 'Service & repairs' },
                      { id: 'warehouse', label: 'Warehouse', desc: 'Parts & inventory' },
                      { id: 'kiosk', label: 'Kiosk', desc: 'Small sales point' }
                    ].map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={settings.branchTypes?.includes(type.id)}
                          onCheckedChange={(checked) => {
                            const currentTypes = settings.branchTypes || [];
                            if (checked) {
                              updateSettings({ branchTypes: [...currentTypes, type.id] });
                            } else {
                              updateSettings({ branchTypes: currentTypes.filter(t => t !== type.id) });
                            }
                          }}
                        />
                        <div>
                          <Label htmlFor={type.id} className="font-medium">{type.label}</Label>
                          <p className="text-sm text-gray-600">{type.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'brands_coverage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Brand Coverage Setup</h3>
              <p className="text-gray-600">Configure which brands your branches sell and service.</p>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                This step is skipped for used-car dealers since brand setup is not required.
              </AlertDescription>
            </Alert>

            {/* Brand coverage form would go here */}
            <div className="text-center py-8 text-gray-500">
              Brand coverage configuration will be available here for new car dealers.
            </div>
          </div>
        );

      case 'transfers_logistics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Transfer & Logistics Setup</h3>
              <p className="text-gray-600">How do you move vehicles between your branches?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_drivers"
                    checked={settings.transferLogistics?.useDrivers}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        transferLogistics: {
                          ...settings.transferLogistics,
                          useDrivers: checked === true
                        }
                      })
                    }
                  />
                  <Label htmlFor="use_drivers">Use internal drivers for transfers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_carriers"
                    checked={settings.transferLogistics?.useCarriers}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        transferLogistics: {
                          ...settings.transferLogistics,
                          useCarriers: checked === true
                        }
                      })
                    }
                  />
                  <Label htmlFor="use_carriers">Use third-party carriers</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="checklist_required"
                  checked={settings.transferLogistics?.checklistRequired}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      transferLogistics: {
                        ...settings.transferLogistics,
                        checklistRequired: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="checklist_required">Require handover checklists for all transfers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="photo_verification"
                  checked={settings.transferLogistics?.photoVerification}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      transferLogistics: {
                        ...settings.transferLogistics,
                        photoVerification: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="photo_verification">Require photo verification before/after transfers</Label>
              </div>
            </div>
          </div>
        );

      case 'inspections':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Quality Control & Inspections</h3>
              <p className="text-gray-600">Set up inspection workflows for quality assurance.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intake_checks"
                  checked={settings.inspectionWorkflows?.intakeChecks}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      inspectionWorkflows: {
                        ...settings.inspectionWorkflows,
                        intakeChecks: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="intake_checks">Perform intake quality checks on new arrivals</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdi_required"
                  checked={settings.inspectionWorkflows?.pdiRequired}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      inspectionWorkflows: {
                        ...settings.inspectionWorkflows,
                        pdiRequired: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="pdi_required">Require Pre-Delivery Inspection (PDI) for all vehicles</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_create_jobs"
                  checked={settings.inspectionWorkflows?.autoCreateJobs}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      inspectionWorkflows: {
                        ...settings.inspectionWorkflows,
                        autoCreateJobs: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="auto_create_jobs">Auto-create inspection jobs when vehicles arrive</Label>
              </div>
            </div>
          </div>
        );

      case 'bulk_operations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bulk Operations & Data Management</h3>
              <p className="text-gray-600">Configure how you handle large-scale data operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expected_volume">Expected bulk operation volume?</Label>
                <Select
                  value={settings.bulkOperations?.expectedVolume}
                  onValueChange={(value: 'small' | 'medium' | 'large') =>
                    updateSettings({
                      bulkOperations: {
                        ...settings.bulkOperations,
                        expectedVolume: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (up to 200 vehicles)</SelectItem>
                    <SelectItem value="medium">Medium (200-2,000 vehicles)</SelectItem>
                    <SelectItem value="large">Large (2,000+ vehicles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="automation_level">Automation level for imports?</Label>
                <Select
                  value={settings.bulkOperations?.automationLevel}
                  onValueChange={(value: 'manual' | 'semi' | 'full') =>
                    updateSettings({
                      bulkOperations: {
                        ...settings.bulkOperations,
                        automationLevel: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual processing</SelectItem>
                    <SelectItem value="semi">Semi-automated (review required)</SelectItem>
                    <SelectItem value="full">Fully automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Data sources you'll import from:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {['CSV Files', 'Excel Spreadsheets', 'DMS Systems', 'Third-party APIs', 'Manual Entry'].map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={source.toLowerCase().replace(' ', '_')}
                      checked={settings.bulkOperations?.dataSources?.includes(source)}
                      onCheckedChange={(checked) => {
                        const currentSources = settings.bulkOperations?.dataSources || [];
                        if (checked) {
                          updateSettings({
                            bulkOperations: {
                              ...settings.bulkOperations,
                              dataSources: [...currentSources, source]
                            }
                          });
                        } else {
                          updateSettings({
                            bulkOperations: {
                              ...settings.bulkOperations,
                              dataSources: currentSources.filter(s => s !== source)
                            }
                          });
                        }
                      }}
                    />
                    <Label htmlFor={source.toLowerCase().replace(' ', '_')} className="text-sm">
                      {source}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'approvals':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Approval Workflows</h3>
              <p className="text-gray-600">Set up quality gates and approval processes.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price_bands"
                  checked={settings.approvalWorkflows?.priceBands}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      approvalWorkflows: {
                        ...settings.approvalWorkflows,
                        priceBands: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="price_bands">Enable price band approvals</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multi_stage"
                  checked={settings.approvalWorkflows?.multiStage}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      approvalWorkflows: {
                        ...settings.approvalWorkflows,
                        multiStage: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="multi_stage">Use multi-stage approval workflows</Label>
              </div>

              {settings.approvalWorkflows?.priceBands && (
                <div>
                  <Label htmlFor="auto_approval_limit">Auto-approval limit (₹)</Label>
                  <Input
                    id="auto_approval_limit"
                    type="number"
                    value={settings.approvalWorkflows?.autoApprovalLimit || ''}
                    onChange={(e) =>
                      updateSettings({
                        approvalWorkflows: {
                          ...settings.approvalWorkflows,
                          autoApprovalLimit: parseInt(e.target.value) || undefined
                        }
                      })
                    }
                    placeholder="500000"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Analytics & Reporting</h3>
              <p className="text-gray-600">Configure your business intelligence preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dashboard_type">Dashboard type</Label>
                <Select
                  value={settings.analyticsPreferences?.dashboardType}
                  onValueChange={(value: 'basic' | 'advanced' | 'custom') =>
                    updateSettings({
                      analyticsPreferences: {
                        ...settings.analyticsPreferences,
                        dashboardType: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic dashboard</SelectItem>
                    <SelectItem value="advanced">Advanced analytics</SelectItem>
                    <SelectItem value="custom">Custom dashboards</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="report_frequency">Report frequency</Label>
                <Select
                  value={settings.analyticsPreferences?.reportFrequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                    updateSettings({
                      analyticsPreferences: {
                        ...settings.analyticsPreferences,
                        reportFrequency: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily reports</SelectItem>
                    <SelectItem value="weekly">Weekly reports</SelectItem>
                    <SelectItem value="monthly">Monthly reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'theming':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Branding & Visual Theme</h3>
              <p className="text-gray-600">Customize how your dealership appears to customers.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom_branding"
                  checked={settings.themingPreferences?.customBranding}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      themingPreferences: {
                        ...settings.themingPreferences,
                        customBranding: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="custom_branding">Enable custom branding across branches</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consistent_theme"
                  checked={settings.themingPreferences?.consistentTheme}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      themingPreferences: {
                        ...settings.themingPreferences,
                        consistentTheme: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="consistent_theme">Maintain consistent theme across all branches</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branch_colors"
                  checked={settings.themingPreferences?.branchSpecificColors}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      themingPreferences: {
                        ...settings.themingPreferences,
                        branchSpecificColors: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="branch_colors">Allow branch-specific color schemes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="logo_required"
                  checked={settings.themingPreferences?.logoRequired}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      themingPreferences: {
                        ...settings.themingPreferences,
                        logoRequired: checked === true
                      }
                    })
                  }
                />
                <Label htmlFor="logo_required">Require logo for all branches</Label>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Review Your Advanced Setup</h3>
              <p className="text-gray-600">Please review your selections before activating advanced features.</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Business Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Business Type:</span>
                      <p className="text-gray-600 capitalize">{settings.businessType}</p>
                    </div>
                    <div>
                      <span className="font-medium">Current Branches:</span>
                      <p className="text-gray-600">{settings.currentBranches}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enabled Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {settings.transferLogistics?.useDrivers && (
                      <Badge variant="secondary">Driver Logistics</Badge>
                    )}
                    {settings.inspectionWorkflows?.pdiRequired && (
                      <Badge variant="secondary">PDI Workflows</Badge>
                    )}
                    {settings.bulkOperations?.expectedVolume === 'large' && (
                      <Badge variant="secondary">High-Volume Operations</Badge>
                    )}
                    {settings.approvalWorkflows?.multiStage && (
                      <Badge variant="secondary">Multi-Stage Approvals</Badge>
                    )}
                    {settings.analyticsPreferences?.dashboardType === 'advanced' && (
                      <Badge variant="secondary">Advanced Analytics</Badge>
                    )}
                    {settings.themingPreferences?.customBranding && (
                      <Badge variant="secondary">Custom Branding</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Step content not found</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CurrentIcon className="w-6 h-6 text-blue-600" />
            <div>
              <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
              <p className="text-slate-600 text-sm">{currentStepData.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              {STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={`${
                    index <= currentStep ? 'text-blue-600 font-medium' : ''
                  } ${index === currentStep ? 'text-blue-700' : ''}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="text-sm text-slate-600">
              Step {currentStep + 1} of {STEPS.length}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Activate Advanced Features
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
