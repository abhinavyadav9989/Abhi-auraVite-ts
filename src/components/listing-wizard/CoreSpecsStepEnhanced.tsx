import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Car,
  Settings,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Palette,
  Gauge,
  Users,
  Fuel,
  Cog,
  Shield,
  Eye,
  FileCheck,
  Camera,
  RotateCcw,
  Zap as ElectricIcon,
  Truck,
  Crown
} from 'lucide-react';
import DynamicField from '@/components/ui/DynamicField';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { AttributeSet, VehicleAttributeSet } from '@/api/entities';
import { AttributeField, FieldDependency, DependencyEvaluationContext } from '@/types/attributeSets';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';

interface CoreSpecsStepEnhancedProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
  vehicleType?: 'new' | 'used';
}

const VEHICLE_CATEGORIES = {
  basic: [
    { id: 'compact', name: 'Compact Car', icon: Car },
    { id: 'sedan', name: 'Sedan', icon: Car },
    { id: 'suv', name: 'SUV', icon: Car },
    { id: 'hatchback', name: 'Hatchback', icon: Car },
    { id: 'mpv', name: 'MPV/Van', icon: Car },
    { id: 'pickup', name: 'Pickup Truck', icon: Truck },
    { id: 'commercial', name: 'Commercial Vehicle', icon: Truck }
  ],
  advanced: [
    { id: 'luxury', name: 'Luxury', icon: Crown },
    { id: 'sports', name: 'Sports Car', icon: Zap },
    { id: 'electric', name: 'Electric Vehicle', icon: ElectricIcon },
    { id: 'hybrid', name: 'Hybrid', icon: Zap }
  ]
};

export default function CoreSpecsStepEnhanced({
  data,
  updateData,
  dealer,
  vehicleType = 'used'
}: CoreSpecsStepEnhancedProps) {
  // Note: This component handles core specifications EXCEPT for:
  // - make, model, year (handled in IdentifyStep)
  // - variant, body_type (handled in IdentifyStep)
  // - fuel_type, transmission (handled in IdentifyStep)
  // - engine_capacity (handled in IdentifyStep)
  // This prevents duplication and ensures data consistency
  const [activeCategory, setActiveCategory] = useState('basic');
  const [selectedAttributeSet, setSelectedAttributeSet] = useState<string>('');
  const [attributeSets, setAttributeSets] = useState<any[]>([]);
  const [availableFields, setAvailableFields] = useState<AttributeField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Activation system hooks
  const { checkFeatureAccess, activationStatus } = useDealerActivationSettings();

  // Check advanced features using activation system
  const hasAdvancedFeatures = checkFeatureAccess('attribute_sets');
  const hasBrandCoverage = checkFeatureAccess('brand_coverage');
  const hasDynamicForms = checkFeatureAccess('dynamic_forms');
  const hasInspectionWorkflows = checkFeatureAccess('inspections');

  // Define basic fields that are always available
  // Note: make, model, year, fuel_type, and transmission are handled in the IdentifyStep, so we don't duplicate them here
  const baseBasicFields: AttributeField[] = [
    {
      id: 'mileage',
      name: 'mileage',
      label: vehicleType === 'new' ? 'Expected Mileage' : 'Mileage (km)',
      type: 'number',
      placeholder: vehicleType === 'new' ? 'Expected km/l' : 'Current mileage',
      unit: vehicleType === 'new' ? 'km/l' : 'km',
      validation: { required: true, min: 0 },
      order: 1,
      isRequired: true,
      isVisible: true,
      category: 'performance'
    },
    {
      id: 'engine_capacity',
      name: 'engine_capacity',
      label: 'Engine Capacity',
      type: 'number',
      placeholder: 'Engine capacity in CC',
      unit: 'cc',
      validation: { required: false, min: 500, max: 10000 },
      order: 2,
      isRequired: false,
      isVisible: true,
      category: 'engine'
    },
    {
      id: 'power',
      name: 'power',
      label: 'Power',
      type: 'number',
      placeholder: 'Power in bhp',
      unit: 'bhp',
      validation: { required: false, min: 20, max: 2000 },
      order: 3,
      isRequired: false,
      isVisible: true,
      category: 'performance'
    },
    {
      id: 'torque',
      name: 'torque',
      label: 'Torque',
      type: 'number',
      placeholder: 'Torque in Nm',
      unit: 'Nm',
      validation: { required: false, min: 50, max: 2000 },
      order: 4,
      isRequired: false,
      isVisible: true,
      category: 'performance'
    },
    {
      id: 'seating_capacity',
      name: 'seating_capacity',
      label: 'Seating Capacity',
      type: 'select',
      placeholder: 'Select seating capacity',
      options: [
        { label: '2 Seater', value: '2' },
        { label: '4 Seater', value: '4' },
        { label: '5 Seater', value: '5' },
        { label: '6 Seater', value: '6' },
        { label: '7 Seater', value: '7' },
        { label: '8+ Seater', value: '8+' }
      ],
      validation: { required: true },
      order: 5,
      isRequired: true,
      isVisible: true,
      category: 'interior'
    },
    {
      id: 'color',
      name: 'color',
      label: 'Color',
      type: 'select',
      placeholder: 'Select color',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Black', value: 'black' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gray', value: 'gray' },
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Brown', value: 'brown' },
        { label: 'Beige', value: 'beige' },
        { label: 'Other', value: 'other' }
      ],
      validation: { required: true },
      order: 6,
      isRequired: true,
      isVisible: true,
      category: 'exterior'
    }
  ];

  // Add conditional fields based on activation settings
  const conditionalFields: AttributeField[] = [];
  if (hasInspectionWorkflows) {
    conditionalFields.push({
      id: 'inspection_status',
      name: 'inspection_status',
      label: 'Inspection Status',
      type: 'select',
      placeholder: 'Select inspection status',
      options: [
        { label: 'Not Inspected', value: 'not_inspected' },
        { label: 'Pre-Delivery Inspection (PDI)', value: 'pdi' },
        { label: 'Intake Inspection', value: 'intake' },
        { label: 'Full Inspection', value: 'full' }
      ],
      validation: { required: false },
      order: 7,
      isRequired: false,
      isVisible: true,
      category: 'inspection',
      tooltip: 'Track the inspection status of this vehicle'
    });
  }

  if (hasBrandCoverage && vehicleType === 'new') {
    conditionalFields.push({
      id: 'brand_exclusivity',
      name: 'brand_exclusivity',
      label: 'Brand Exclusivity',
      type: 'select',
      placeholder: 'Select brand exclusivity',
      options: [
        { label: 'Exclusive Dealer', value: 'exclusive' },
        { label: 'Multi-Brand Dealer', value: 'multi_brand' },
        { label: 'Authorized Dealer', value: 'authorized' }
      ],
      validation: { required: false },
      order: 13,
      isRequired: false,
      isVisible: true,
      category: 'brand',
      tooltip: 'Specify your relationship with this brand'
    });
  }

  if (hasDynamicForms) {
    conditionalFields.push({
      id: 'custom_attributes',
      name: 'custom_attributes',
      label: 'Custom Attributes',
      type: 'textarea',
      placeholder: 'Add custom vehicle attributes',
      validation: { required: false },
      order: 14,
      isRequired: false,
      isVisible: true,
      category: 'advanced',
      tooltip: 'Add custom attributes specific to your business needs'
    });
  }

  // Combine basic and conditional fields
  const basicFields: AttributeField[] = useMemo(() => {
    return [...baseBasicFields, ...conditionalFields];
  }, [conditionalFields]);

  // Define dependencies for basic fields
  const basicDependencies: FieldDependency[] = [
    {
      id: 'electric_battery',
      source_field_id: 'fuel_type',
      target_field_id: 'battery_capacity',
      condition: {
        operator: 'equals',
        value: 'electric'
      },
      action: {
        type: 'show',
        message: 'Battery capacity is required for electric vehicles'
      },
      priority: 10,
      enabled: true
    },
    {
      id: 'hybrid_battery',
      source_field_id: 'fuel_type',
      target_field_id: 'battery_capacity',
      condition: {
        operator: 'equals',
        value: 'hybrid'
      },
      action: {
        type: 'show'
      },
      priority: 9,
      enabled: true
    },
    {
      id: 'hide_battery_non_electric',
      source_field_id: 'fuel_type',
      target_field_id: 'battery_capacity',
      condition: {
        operator: 'not_equals',
        value: 'electric'
      },
      action: {
        type: 'hide'
      },
      priority: 8,
      enabled: true
    }
  ];

  // Add battery capacity field
  basicFields.push({
    id: 'battery_capacity',
    name: 'battery_capacity',
    label: 'Battery Capacity',
    type: 'number',
    placeholder: 'Battery capacity in kWh',
    unit: 'kWh',
    validation: { required: false, min: 10, max: 200 },
    order: 12,
    isRequired: false,
    isVisible: false, // Initially hidden
    category: 'electric'
  });

  // Initialize dynamic form
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleFieldChange,
    handleFieldBlur,
    validateForm
  } = useDynamicForm({
    fields: [...basicFields, ...availableFields],
    dependencies: basicDependencies,
    initialValues: data,
    validateOnChange: true,
    validateOnBlur: true
  });

  // Load attribute sets if user has advanced features
  useEffect(() => {
    if (hasAdvancedFeatures) {
      loadAttributeSets();
    }
  }, [hasAdvancedFeatures]);

  // Update parent data when values change
  useEffect(() => {
    updateData(values);
  }, [values, updateData]);

  const loadAttributeSets = async () => {
    try {
      setIsLoading(true);
      const result = await AttributeSet.list();
      if (result.error) throw result.error;
      setAttributeSets(result.data || []);
    } catch (error) {
      console.error('Failed to load attribute sets:', error);
      toast({
        title: "Error",
        description: "Failed to load custom attribute sets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttributeSetChange = async (attributeSetId: string) => {
    setSelectedAttributeSet(attributeSetId);
    if (!attributeSetId) {
      setAvailableFields([]);
      return;
    }

    try {
      const result = await AttributeSet.get(attributeSetId);
      if (result.error) throw result.error;

      const attributeSet = result.data;
      if (attributeSet && attributeSet.fields) {
        setAvailableFields(attributeSet.fields);
        toast({
          title: "Attribute Set Applied",
          description: `${attributeSet.fields.length} additional fields added`,
        });
      }
    } catch (error) {
      console.error('Failed to load attribute set:', error);
      toast({
        title: "Error",
        description: "Failed to apply attribute set",
        variant: "destructive",
      });
    }
  };

  const getFieldIcon = (category: string) => {
    switch (category) {
      case 'engine': return Wrench;
      case 'performance': return Gauge;
      case 'interior': return Users;
      case 'exterior': return Palette;
      case 'electric': return Zap;
      case 'safety': return Shield;
      case 'comfort': return Settings;
      default: return Car;
    }
  };

  const groupedFields = useMemo(() => {
    const allFields = [...basicFields, ...availableFields];
    const groups: Record<string, AttributeField[]> = {};

    allFields.forEach(field => {
      const category = field.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(field);
    });

    return groups;
  }, [basicFields, availableFields]);

  const evaluationContext: DependencyEvaluationContext = {
    field_values: values,
    dealer_tier: hasAdvancedFeatures ? 'advanced' : 'basic',
    user_role: 'dealer'
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Vehicle Specifications</h2>
        <p className="text-gray-600 text-sm md:text-base">
          {vehicleType === 'new'
            ? 'Configure the specifications for this new vehicle'
            : 'Enter the detailed specifications for this used vehicle'
          }
        </p>
      </div>

      {/* Category Selection for Advanced Features */}
      {hasAdvancedFeatures && (
        <Card className="mx-4 md:mx-0">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
              Vehicle Category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-2 h-10 md:h-11">
                <TabsTrigger value="basic" className="text-sm">Basic</TabsTrigger>
                <TabsTrigger value="advanced" className="text-sm">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 md:space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {VEHICLE_CATEGORIES.basic.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                          data.vehicle_category === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateData({ vehicle_category: category.id })}
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs md:text-sm font-medium text-center leading-tight">{category.name}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-3 md:space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {VEHICLE_CATEGORIES.advanced.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                          data.vehicle_category === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateData({ vehicle_category: category.id })}
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs md:text-sm font-medium text-center leading-tight">{category.name}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Attribute Set Selection */}
      {hasAdvancedFeatures && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Custom Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="attribute_set">Apply Custom Attribute Set (Optional)</Label>
                <Select value={selectedAttributeSet} onValueChange={handleAttributeSetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an attribute set to add custom fields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No custom fields</SelectItem>
                    {attributeSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name} ({set.fields?.length || 0} fields)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAttributeSet && availableFields.length > 0 && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    {availableFields.length} custom fields have been added to the form below.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Fields by Category */}
      <div className="space-y-4 md:space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => {
          const Icon = getFieldIcon(category);
          const visibleFields = fields.filter(field => field.isVisible);

          if (visibleFields.length === 0) return null;

          return (
            <Card key={category} className="mx-4 md:mx-0">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="flex items-center gap-2 capitalize text-lg md:text-xl">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  {category === 'basic' ? 'Basic Information' : category.replace('_', ' ')}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {visibleFields.length} fields
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {visibleFields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <DynamicField
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        onChange={handleFieldChange}
                        onBlur={handleFieldBlur}
                        error={errors[field.id]}
                        context={evaluationContext}
                        showMessages={true}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Form Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mx-4 md:mx-0">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            Please fix the following errors before continuing:
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="leading-relaxed">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Advanced Features Status */}
      {(hasInspectionWorkflows || hasBrandCoverage || hasDynamicForms) && (
        <Card className="border-amber-200 bg-amber-50/50 mx-4 md:mx-0">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-lg md:text-xl">
              <Crown className="w-4 h-4 md:w-5 md:h-5" />
              Advanced Features Activated
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {hasInspectionWorkflows && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Inspection Workflows</span>
                </div>
              )}
              {hasBrandCoverage && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Brand Coverage</span>
                </div>
              )}
              {hasDynamicForms && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Dynamic Forms</span>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-600 mt-3 leading-relaxed">
              Your activated features have enhanced this form with additional capabilities tailored to your business needs.
            </p>
          </CardContent>
        </Card>
      )}

      {/* VIN Auto-fill Information */}
      {data.vin && (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>
            Some fields may be auto-filled from the VIN. You can override any values as needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
