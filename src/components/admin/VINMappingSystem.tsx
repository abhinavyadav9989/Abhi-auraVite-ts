import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Settings,
  Edit,
  Trash2,
  Play,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
  Code,
  TestTube,
  Car,
  Hash,
  ArrowRight
} from 'lucide-react';
import {
  VINMappingRule,
  VINDecodeResult,
  AttributeField
} from '@/types/attributeSets';
import { VINMapping as VINMappingEntity, AttributeSet as AttributeSetEntity } from '@/api/entityAdapters';

interface VINMappingSystemProps {
  dealerId: string;
}

const POPULAR_BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Mahindra', 'Tata', 'Toyota', 'Honda',
  'Ford', 'Volkswagen', 'Renault', 'Nissan', 'Kia', 'MG', 'Skoda',
  'BMW', 'Mercedes-Benz', 'Audi', 'Jeep', 'Volvo'
];

export default function VINMappingSystem({ dealerId }: VINMappingSystemProps) {
  const [mappingRules, setMappingRules] = useState<VINMappingRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<VINMappingRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testVIN, setTestVIN] = useState('');
  const [testResult, setTestResult] = useState<VINDecodeResult | null>(null);
  const [availableFields, setAvailableFields] = useState<AttributeField[]>([]);
  const { toast } = useToast();

  // Form states
  const [ruleForm, setRuleForm] = useState({
    brand: '',
    model: '',
    yearRange: { start: 2000, end: new Date().getFullYear() + 1 },
    vinPattern: '',
    priority: 1,
    isActive: true,
    fieldMappings: {} as Record<string, string>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load mapping rules
      const { data: rules, error: rulesError } = await VINMappingEntity.list();
      if (rulesError) throw rulesError;

      // Load available fields from attribute sets
      const { data: attributeSets, error: setsError } = await AttributeSetEntity.list();
      if (setsError) throw setsError;

      const fields: AttributeField[] = [];
      attributeSets?.forEach(set => {
        set.fields.forEach(field => {
          if (!fields.find(f => f.name === field.name)) {
            fields.push(field);
          }
        });
      });

      setMappingRules(rules || []);
      setAvailableFields(fields);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load VIN mapping data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!ruleForm.brand || !ruleForm.vinPattern) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRule: Omit<VINMappingRule, 'id' | 'createdAt' | 'updatedAt'> = {
        brand: ruleForm.brand,
        model: ruleForm.model || undefined,
        yearRange: ruleForm.yearRange,
        vinPattern: ruleForm.vinPattern,
        fieldMappings: ruleForm.fieldMappings,
        isActive: ruleForm.isActive,
        priority: ruleForm.priority
      };

      const { data, error } = await VINMappingEntity.create({
        ...newRule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setMappingRules(prev => [...prev, data]);
      resetRuleForm();
      setShowCreateDialog(false);

      toast({
        title: "Success",
        description: `VIN mapping rule for ${data.brand} created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create VIN mapping rule",
        variant: "destructive",
      });
    }
  };

  const handleTestVIN = async () => {
    if (!testVIN.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a VIN to test",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await VINMappingEntity.decodeVIN(testVIN);

      if (error) throw error;

      setTestResult(data);

      toast({
        title: "VIN Test Complete",
        description: data?.success
          ? `Successfully decoded VIN with ${data.confidence}% confidence`
          : "VIN could not be decoded with available rules",
        variant: data?.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to decode VIN",
        variant: "destructive",
      });
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      brand: '',
      model: '',
      yearRange: { start: 2000, end: new Date().getFullYear() + 1 },
      vinPattern: '',
      priority: 1,
      isActive: true,
      fieldMappings: {}
    });
  };

  const generateVINPattern = (brand: string, model?: string) => {
    // Common VIN patterns for Indian market
    const patterns: Record<string, string> = {
      'Maruti Suzuki': 'MA[13][A-Z0-9]{14}',
      'Hyundai': 'MAL[A-Z0-9]{14}',
      'Mahindra': 'MAJ[A-Z0-9]{14}',
      'Tata': 'MAT[A-Z0-9]{14}',
      'Toyota': 'JT[A-Z0-9]{14}',
      'Honda': 'JH2[A-Z0-9]{13}',
      'Ford': 'MAJ[A-Z0-9]{14}',
      'Volkswagen': 'WVW[A-Z0-9]{14}',
      'Renault': 'VF1[A-Z0-9]{14}',
      'Nissan': 'JN[A-Z0-9]{15}',
      'Kia': 'KNA[A-Z0-9]{14}',
      'MG': 'LSJ[A-Z0-9]{14}',
      'Skoda': 'TMB[A-Z0-9]{14}',
      'BMW': 'WBA[A-Z0-9]{14}',
      'Mercedes-Benz': 'WDD[A-Z0-9]{14}',
      'Audi': 'WAU[A-Z0-9]{14}',
      'Jeep': '1C4[A-Z0-9]{14}',
      'Volvo': 'YV1[A-Z0-9]{14}'
    };

    const basePattern = patterns[brand] || '[A-Z0-9]{17}';
    return basePattern;
  };

  const getVINPositionInfo = (vin: string) => {
    if (vin.length !== 17) return null;

    return {
      wmi: vin.substring(0, 3), // World Manufacturer Identifier
      vds: vin.substring(3, 9), // Vehicle Descriptor Section
      vis: vin.substring(9, 17), // Vehicle Identifier Section
      year: vin.charAt(9), // Model year
      plant: vin.charAt(10), // Assembly plant
      serial: vin.substring(11) // Serial number
    };
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await VINMappingEntity.delete(ruleId);
      if (error) throw error;

      setMappingRules(prev => prev.filter(rule => rule.id !== ruleId));

      toast({
        title: "Rule Deleted",
        description: "VIN mapping rule has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete VIN mapping rule",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            VIN Mapping System
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Automatically populate vehicle specifications from VIN numbers
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowTestDialog(true)}
            variant="outline"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test VIN
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Mapping Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapping Rules List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>VIN Mapping Rules</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mappingRules.length} active rules
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {mappingRules.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No mapping rules created yet</p>
                  <p className="text-sm">Create your first rule to get started</p>
                </div>
              ) : (
                mappingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRule?.id === rule.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {rule.brand}
                      </h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Priority {rule.priority}
                        </Badge>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {rule.model || 'All models'}
                    </p>
                    <div className="text-xs text-slate-500">
                      Pattern: {rule.vinPattern}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {Object.keys(rule.fieldMappings).length} field mappings
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rule Details */}
        <div className="lg:col-span-2">
          {selectedRule ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      {selectedRule.brand}
                      {selectedRule.model && ` - ${selectedRule.model}`}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Years: {selectedRule.yearRange.start} - {selectedRule.yearRange.end}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={selectedRule.isActive ? "default" : "secondary"}>
                      {selectedRule.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRule(selectedRule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* VIN Pattern */}
                <div>
                  <Label className="text-sm font-medium">VIN Pattern</Label>
                  <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-sm">
                    {selectedRule.vinPattern}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Regular expression pattern for matching VINs
                  </p>
                </div>

                {/* Field Mappings */}
                <div>
                  <Label className="text-sm font-medium">Field Mappings</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedRule.fieldMappings).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No field mappings defined</p>
                    ) : (
                      Object.entries(selectedRule.fieldMappings).map(([position, fieldId]) => {
                        const field = availableFields.find(f => f.name === fieldId);
                        return (
                          <div key={position} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-mono">Position {position}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">
                                {field ? field.label : fieldId}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">--</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">VINs Decoded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedRule.priority}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Priority Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(selectedRule.fieldMappings).length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Mapped Fields</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Code className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a VIN Mapping Rule
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Choose a rule from the list to view its configuration and field mappings
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create VIN Mapping Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule_brand">Brand *</Label>
                <Select
                  value={ruleForm.brand}
                  onValueChange={(value) => {
                    setRuleForm(prev => ({
                      ...prev,
                      brand: value,
                      vinPattern: generateVINPattern(value)
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rule_model">Model (Optional)</Label>
                <Input
                  id="rule_model"
                  value={ruleForm.model}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., Swift, Creta, Scorpio"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year_start">Year Range Start</Label>
                <Input
                  id="year_start"
                  type="number"
                  value={ruleForm.yearRange.start}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    yearRange: { ...prev.yearRange, start: parseInt(e.target.value) }
                  }))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <Label htmlFor="year_end">Year Range End</Label>
                <Input
                  id="year_end"
                  type="number"
                  value={ruleForm.yearRange.end}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    yearRange: { ...prev.yearRange, end: parseInt(e.target.value) }
                  }))}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vin_pattern">VIN Pattern (Regex) *</Label>
              <Input
                id="vin_pattern"
                value={ruleForm.vinPattern}
                onChange={(e) => setRuleForm(prev => ({ ...prev, vinPattern: e.target.value }))}
                placeholder="e.g., MA[13][A-Z0-9]{14}"
              />
              <p className="text-xs text-slate-500 mt-1">
                Regular expression pattern to match VINs. Use [A-Z0-9] for alphanumeric characters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={ruleForm.priority}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Higher priority rules are checked first
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="rule_active"
                  checked={ruleForm.isActive}
                  onCheckedChange={(checked) => setRuleForm(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="rule_active">Active Rule</Label>
              </div>
            </div>

            {/* Field Mappings */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Field Mappings</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                {availableFields.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No fields available. Create attribute sets first.</p>
                ) : (
                  availableFields.map((field) => (
                    <div key={field.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-slate-500">{field.name}</div>
                      </div>
                      <Input
                        placeholder="VIN position (0-16)"
                        value={ruleForm.fieldMappings[field.name] || ''}
                        onChange={(e) => setRuleForm(prev => ({
                          ...prev,
                          fieldMappings: {
                            ...prev.fieldMappings,
                            [field.name]: e.target.value
                          }
                        }))}
                        className="w-32"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetRuleForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule} className="bg-blue-600 hover:bg-blue-700">
              Create Mapping Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIN Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test VIN Decoding</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="test_vin">Enter VIN to Test</Label>
              <Input
                id="test_vin"
                value={testVIN}
                onChange={(e) => setTestVIN(e.target.value.toUpperCase())}
                placeholder="e.g., MA3EXDE1S00123456"
                maxLength={17}
              />
              <p className="text-xs text-slate-500 mt-1">
                VIN should be 17 characters long (letters and numbers only)
              </p>
            </div>

            <Button
              onClick={handleTestVIN}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Test VIN Decoding
            </Button>

            {testResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Decoding Successful' : 'Decoding Failed'}
                  </span>
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.confidence}% confidence
                  </Badge>
                </div>

                {testResult.success && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Brand</Label>
                      <p className="text-sm">{testResult.brand || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Model</Label>
                      <p className="text-sm">{testResult.model || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Year</Label>
                      <p className="text-sm">{testResult.year || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Source</Label>
                      <p className="text-sm capitalize">{testResult.source?.replace('_', ' ') || 'Unknown'}</p>
                    </div>
                  </div>
                )}

                {testResult.decodedValues && Object.keys(testResult.decodedValues).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Decoded Values</Label>
                    <div className="space-y-2">
                      {Object.entries(testResult.decodedValues).map(([field, value]) => (
                        <div key={field} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <span className="text-sm font-medium">{field}</span>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTestDialog(false);
              setTestVIN('');
              setTestResult(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
