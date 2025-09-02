// Phase 1: Customised Inventory Settings Management Component
// Allows users to view and edit their activation settings after setup

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings, Building2, Car, Truck, Shield, Database, Calculator,
  BarChart3, Star, CheckCircle, AlertTriangle, Info, Save, RefreshCw
} from 'lucide-react';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';
import { useToast } from '@/components/ui/use-toast';

interface AdvancedInventorySettingsProps {
  onSettingsChanged?: () => void;
}

export default function AdvancedInventorySettings({ onSettingsChanged }: AdvancedInventorySettingsProps) {
  const {
    settings,
    activationStatus,
    unlockedFeatures,
    isLoading,
    error,
    updateSettings,
    checkFeatureAccess,
    getFeatureExplanation,
    refreshSettings
  } = useDealerActivationSettings();

  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);
    try {
      const success = await updateSettings(pendingChanges);
      if (success) {
        setPendingChanges({});
        onSettingsChanged?.();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSettings}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No activation settings found. Please complete the Customised Inventory activation first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Customised Inventory Settings
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your Customised Inventory configuration and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Unsaved changes
            </Badge>
          )}

          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Activation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Activation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-slate-600">Business Type</div>
              <div className="text-lg font-semibold capitalize">{settings.business_type}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600">Current Branches</div>
              <div className="text-lg font-semibold">{settings.current_branches}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600">Features Unlocked</div>
              <div className="text-lg font-semibold">{unlockedFeatures.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Business Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Business Type:</span>
                      <span className="font-medium capitalize">{settings.business_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Branches:</span>
                      <span className="font-medium">{settings.current_branches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Expected Growth:</span>
                      <span className="font-medium capitalize">{settings.expected_growth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sub-branches:</span>
                      <span className="font-medium">{settings.has_sub_branches ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Feature Status</h4>
                  <div className="space-y-2">
                    {unlockedFeatures.slice(0, 8).map((feature) => (
                      <div key={feature.feature_id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{feature.feature_id.replace('_', ' ')}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Unlocked
                        </Badge>
                      </div>
                    ))}
                    {unlockedFeatures.length > 8 && (
                      <div className="text-sm text-slate-500 text-center">
                        +{unlockedFeatures.length - 8} more features unlocked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Branch Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {settings.branch_types?.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    )) || <span className="text-slate-500">No branch types configured</span>}
                  </div>
                </div>

                {settings.business_type !== 'used' && settings.brand_coverage && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Brand Coverage</h4>
                    <div className="space-y-2">
                      {settings.brand_coverage.map((brand, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{brand.brand}</div>
                            <div className="text-sm text-slate-600">
                              {brand.exclusive ? 'Exclusive dealership' : 'Non-exclusive'}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {brand.branches.length} branches
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Transfer & Logistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Internal Drivers:</span>
                    <Badge variant={settings.use_internal_drivers ? "default" : "secondary"}>
                      {settings.use_internal_drivers ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">External Carriers:</span>
                    <Badge variant={settings.use_external_carriers ? "default" : "secondary"}>
                      {settings.use_external_carriers ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Photo Verification:</span>
                    <Badge variant={settings.photo_verification ? "default" : "secondary"}>
                      {settings.photo_verification ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                </div>

                {settings.preferred_carriers && settings.preferred_carriers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Preferred Carriers</h4>
                    <div className="flex flex-wrap gap-2">
                      {settings.preferred_carriers.map((carrier, index) => (
                        <Badge key={index} variant="outline">{carrier}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-600">Expected Volume</div>
                  <div className="text-lg font-semibold capitalize">{settings.bulk_volume_expected}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Automation Level</div>
                  <div className="text-lg font-semibold capitalize">{settings.automation_level}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Data Sources</div>
                  <div className="text-sm">
                    {settings.data_sources?.length > 0
                      ? settings.data_sources.join(', ')
                      : 'None configured'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Quality & Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Intake Checks:</span>
                    <Badge variant={settings.intake_checks ? "default" : "secondary"}>
                      {settings.intake_checks ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">PDI Required:</span>
                    <Badge variant={settings.pdi_required ? "default" : "secondary"}>
                      {settings.pdi_required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auto-create Jobs:</span>
                    <Badge variant={settings.auto_create_inspection_jobs ? "default" : "secondary"}>
                      {settings.auto_create_inspection_jobs ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                {settings.checklist_templates && settings.checklist_templates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Checklist Templates</h4>
                    <div className="flex flex-wrap gap-2">
                      {settings.checklist_templates.map((template, index) => (
                        <Badge key={index} variant="outline">{template}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Approval Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Price Bands:</span>
                    <Badge variant={settings.price_bands_enabled ? "default" : "secondary"}>
                      {settings.price_bands_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Multi-stage Approvals:</span>
                    <Badge variant={settings.multi_stage_approvals ? "default" : "secondary"}>
                      {settings.multi_stage_approvals ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                {settings.auto_approval_limit && (
                  <div>
                    <div className="text-sm font-medium text-slate-600">Auto-approval Limit</div>
                    <div className="text-lg font-semibold">₹{settings.auto_approval_limit.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">Prices below this amount don't require approval</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-slate-600">Dashboard Type</div>
                  <div className="text-lg font-semibold capitalize">{settings.dashboard_type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600">Report Frequency</div>
                  <div className="text-lg font-semibold capitalize">{settings.report_frequency}</div>
                </div>
              </div>

              {settings.key_metrics && settings.key_metrics.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-3">Key Metrics Tracked</h4>
                  <div className="flex flex-wrap gap-2">
                    {settings.key_metrics.map((metric, index) => (
                      <Badge key={index} variant="outline">{metric}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Theming & Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Custom Branding:</span>
                  <Badge variant={settings.custom_branding ? "default" : "secondary"}>
                    {settings.custom_branding ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Consistent Theme:</span>
                  <Badge variant={settings.consistent_theme ? "default" : "secondary"}>
                    {settings.consistent_theme ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Branch Colors:</span>
                  <Badge variant={settings.branch_specific_colors ? "default" : "secondary"}>
                    {settings.branch_specific_colors ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Explanations */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Explanations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedFeatures.map((feature) => (
              <div key={feature.feature_id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{feature.feature_id.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-slate-600">
                  {getFeatureExplanation(feature.feature_id)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
