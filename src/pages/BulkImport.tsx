import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  Save,
  X,
  Zap,
  Info,
  Lock
} from 'lucide-react';
import { ExtractDataFromUploadedFile, UploadFile } from '@/api/integrations';
import {
  getDealerTier,
  canPerformBulkUpload,
  shouldPromptUpgrade,
  getUpgradeBenefits,
  type TierLevel
} from '@/lib/tierConfig';
import { FeatureGate } from '@/components/ui/FeatureGate';


// Template configurations for different vehicle types
const BULK_TEMPLATES = {
  used: {
    name: 'Used Vehicles',
    description: 'Import pre-owned vehicles with condition and pricing details',
    headers: [
      'registration_number', 'vin', 'make', 'model', 'variant', 'year', 'fuel_type',
      'transmission', 'kilometers', 'ownership', 'color', 'body_type', 'seating_capacity',
      'condition_tyres_ok', 'condition_paint_ok', 'condition_accident_history', 'condition_service_history',
      'asking_price', 'exposure_mode', 'description'
    ],
    sampleData: [
      ['MH12AB1234', '1HGCM82633A123456', 'Maruti', 'Swift', 'VXI', '2020', 'petrol', 'manual', '25000', 'first', 'white', 'hatchback', '5', 'true', 'true', 'false', 'true', '550000', 'masked', 'Well maintained car'],
      ['DL01CD5678', '2HGCM82633A654321', 'Hyundai', 'Creta', 'SX', '2021', 'diesel', 'automatic', '18000', 'first', 'red', 'suv', '5', 'true', 'true', 'false', 'true', '1250000', 'public', 'Single owner, all records available']
    ]
  },
  new: {
    name: 'New Vehicles',
    description: 'Import new vehicles with OEM specifications and pricing',
    headers: [
      'make', 'model', 'variant', 'year', 'fuel_type', 'transmission', 'color',
      'ex_showroom_price', 'rto_city', 'on_road_price', 'stock_type', 'allotment_id',
      'eta', 'exposure_mode', 'description'
    ],
    sampleData: [
      ['Maruti', 'Swift', 'VXI', '2024', 'petrol', 'manual', 'Pearl White', '650000', 'Mumbai', '720000', 'dealer_stock', '', '', 'public', 'Brand new Swift VXI'],
      ['Hyundai', 'Creta', 'SX', '2024', 'diesel', 'automatic', 'Phantom Black', '1200000', 'Delhi', '1350000', 'incoming_allocation', 'ALT2024001', '2024-02-15', 'public', 'Latest Creta SX with all features']
    ]
  }
};

export default function BulkImport() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dealer, setDealer] = useState(null);
  const [tier, setTier] = useState<TierLevel>('basic');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importAsLive, setImportAsLive] = useState(false);
  const [step, setStep] = useState('template'); // 'template', 'upload', 'preview', 'importing', 'complete'
  const [importSummary, setImportSummary] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'used' | 'new'>('used');




  useEffect(() => {
    loadDealer();
  }, []);

  const loadDealer = async () => {
    try {
      const user = await User.me();
      const dealerProfile = await Dealer.filter({ created_by: user.email });

      if (dealerProfile.length > 0) {
        const dealerData = dealerProfile[0];
        setDealer(dealerData);

        // Set tier based on dealer data
        const currentTier = getDealerTier(dealerData);
        setTier(currentTier);
      } else {
        navigate(createPageUrl('Profile'));
      }
    } catch (error) {
      console.error('Error loading dealer:', error);
    }
    setIsLoading(false);
  };

  const handleUpgrade = () => {
    navigate(createPageUrl('settings?tab=subscription'));
    setShowUpgradePrompt(false);
  };

  const handleCloseUpgrade = () => {
    setShowUpgradePrompt(false);
  };

  const generateTemplate = () => {
    const templateData = BULK_TEMPLATES[selectedTemplate];
    const csvContent = [
      templateData.headers.join(','),
      ...templateData.sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate}_vehicle_import_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Template Downloaded', description: 'CSV template with sample data downloaded.' });
  };

  const parseCSVLocally = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || '');
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length === 0) return resolve([]);
          const headers = lines[0].split(',').map((h) => h.trim());
          const rows = lines.slice(1);
          const data = rows.map((row) => {
            const values = row.split(',');
            const obj: Record<string, any> = {};
            headers.forEach((h, i) => {
              const v = values[i];
              obj[h] = v === undefined ? '' : v.trim();
            });
            // Coerce some common numeric fields
            if (obj.year) obj.year = Number(obj.year);
            if (obj.kilometers) obj.kilometers = Number(obj.kilometers);
            if (obj.asking_price) obj.asking_price = Number(obj.asking_price);
            return obj;
          });

          // Check tier limits before resolving
          const rowCount = data.length;
          if (!canPerformBulkUpload(dealer, rowCount)) {
            setShowUpgradePrompt(true);
            reject(new Error(`Bulk upload limit exceeded. ${tier === 'basic' ? 'Basic tier allows up to 200 rows' : 'Advanced tier allows up to 5,000 rows'}. You have ${rowCount} rows.`));
            return;
          }

          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({ title: 'Invalid File', description: 'Please upload a CSV file.', variant: 'destructive' });
      return;
    }



    try {
      setIsLoading(true);
      // Fast path: parse locally for immediate preview
      const localData = await parseCSVLocally(file);
      if (localData.length > 0) {

        
        setUploadedFile(file);
        setPreviewData(localData);
        validateData(localData);
        setStep('preview');
      } else {
        // Fallback to uploading + server extract if local parsing produced nothing
        const uploadResult = await UploadFile({ file });
        const extractResult = await ExtractDataFromUploadedFile(uploadResult.file_url, {
          json_schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                registration_number: { type: "string" },
                make: { type: "string" },
                model: { type: "string" },
                variant: { type: "string" },
                year: { type: "number" },
                fuel_type: { type: "string" },
                transmission: { type: "string" },
                kilometers: { type: "number" },
                ownership: { type: "string" },
                color: { type: "string" },
                asking_price: { type: "number" },
                vehicle_category: { type: "string" },
                inventory_type: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        });
        if ((extractResult as any)?.status === 'success') {
          const output = (extractResult as any).output || [];
          setUploadedFile(file);
          setPreviewData(output);
          validateData(output);
          setStep('preview');
        } else {
          throw new Error((extractResult as any)?.details || 'Failed to extract data');
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({ title: 'Error', description: 'Failed to process CSV file. Please check the format.', variant: 'destructive' });
    }
    setIsLoading(false);
    // reset the input so selecting the same file again triggers onChange
    try { (event.target as HTMLInputElement).value = ''; } catch {}
  };

  const validateData = (data) => {
    const results = data.map((row, index) => {
      const errors = [];
      const warnings = [];

      // Required field validation
      if (!row.registration_number) errors.push('Registration number is required');
      if (!row.make) errors.push('Make is required');
      if (!row.model) errors.push('Model is required');
      if (!row.year || row.year < 1990 || row.year > new Date().getFullYear()) {
        errors.push('Valid year is required');
      }
      if (!row.fuel_type) errors.push('Fuel type is required');

      // Data format validation
      if (row.asking_price && row.asking_price < 10000) {
        warnings.push('Price seems unusually low');
      }
      if (row.kilometers && row.kilometers > 500000) {
        warnings.push('High mileage vehicle');
      }

      // Enum validation
      const validFuelTypes = ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'];
      if (row.fuel_type && !validFuelTypes.includes(row.fuel_type.toLowerCase())) {
        errors.push('Invalid fuel type');
      }

      return {
        index,
        errors,
        warnings,
        isValid: errors.length === 0
      };
    });

    setValidationResults(results);
  };

  const startImport = async () => {
    const validRows = previewData.filter((_, index) => validationResults[index]?.isValid);
    
    if (validRows.length === 0) {
      toast({ title: 'No Valid Rows', description: 'Please fix validation errors before importing.', variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    setStep('importing');
    
    let successful = 0;
    let failed = 0;
    const failedRows = [];

    const normalizeRow = (row: any) => {
      const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
      const lower = (v: any) => toStr(v).toLowerCase();
      const arrayify = (v: any) => Array.isArray(v) ? v : (toStr(v) ? [toStr(v)] : []);
      return {
        registration_number: toStr(row.registration_number),
        make: toStr(row.make),
        model: toStr(row.model),
        variant: toStr(row.variant),
        year: Number(row.year),
        fuel_type: lower(row.fuel_type),
        transmission: lower(row.transmission),
        kilometers: Number(row.kilometers),
        ownership: lower(row.ownership),
        color: toStr(row.color),
        asking_price: Number(row.asking_price),
        vehicle_category: arrayify(row.vehicle_category).map((x: any) => lower(x)),
        inventory_type: lower(row.inventory_type || 'public'),
        description: toStr(row.description),
      };
    };

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      try {
        const normalized = normalizeRow(row);
        await Vehicle.create({
          ...normalized,
          dealer_id: dealer.id,
          status: importAsLive ? 'live' : 'draft',
          location_city: dealer.city,
          location_state: dealer.state,
          images: [], // Start with empty images array
          tags: normalized.inventory_type === 'specialised' ? ['Bulk Import'] : []
        });
        
        successful++;
      } catch (error) {
        console.error(`Failed to import row ${i + 1}:`, error);
        failed++;
        failedRows.push({ row: i + 1, data: row, error: error.message });
      }
      
      // Update progress
      setImportProgress(((i + 1) / validRows.length) * 100);
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setImportSummary({
      total: validRows.length,
      successful,
      failed,
      failedRows,
      status: importAsLive ? 'live' : 'draft'
    });
    
    setIsImporting(false);
    setStep('complete');
    
    toast({
      title: 'Import Complete',
      description: `Successfully imported ${successful} vehicles. ${failed} failed.`,
      variant: failed > 0 ? 'destructive' : 'default'
    });
  };

  const handleDownloadTemplate = () => {
    // Generate CSV from selected template
    const template = BULK_TEMPLATES[selectedTemplate];
    const csvContent = [
      template.headers.join(','),
      ...template.sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}_vehicles_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `Downloaded ${template.name} template with sample data`,
    });
  };

  const handleViewSample = () => {
    const template = BULK_TEMPLATES[selectedTemplate];
    toast({
      title: `${template.name} Sample`,
      description: `Template has ${template.headers.length} columns with sample data. Click download to get the full template.`,
    });
  };

  const resetImport = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setValidationResults([]);
    setImportProgress(0);
    setImportSummary(null);
    setStep('template');
  };

  if (isLoading && !dealer) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Inventory")}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Bulk Import Vehicles
                  </h1>
                  <Badge variant="outline" className={tier === 'basic' ? 'text-amber-600 border-amber-200' : 'text-green-600 border-green-200'}>
                    {tier === 'basic' ? `Basic (${tier === 'basic' ? '200' : '5,000'} max)` : 'Advanced'}
                  </Badge>
                </div>
                <p className="text-slate-600 mt-1">
                  {step === 'template' ? 'Choose vehicle type and template' : 'Import multiple vehicles from CSV file'}
                </p>
              </div>
            </div>

            {/* Tier Info */}
            {tier === 'basic' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Basic Tier Limits</span>
                </div>
                <p className="text-xs text-amber-700 mb-2">
                  You're limited to 200 vehicles per upload. Upgrade to Advanced for up to 5,000 vehicles.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgrade}
                  className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>

          {/* Upgrade Prompt */}
          {showUpgradePrompt && (
            <FeatureGate
              feature="data_ops"
              dealer={dealer}
              upgradeContext={{ bulkUploadRowCount: previewData.length }}
              showUpgradePrompt={true}
            >
              {/* Empty children - FeatureGate will show upgrade prompt */}
            </FeatureGate>
          )}

          {/* Progress Steps */}
          {step !== 'template' && (
            <div className="flex items-center justify-center space-x-4 py-6">
              {['Upload', 'Preview', 'Import', 'Complete'].map((stepName, index) => {
                const stepIndex = ['upload', 'preview', 'importing', 'complete'].indexOf(step);
                const isActive = index === stepIndex;
                const isCompleted = index < stepIndex;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    {stepName}
                  </span>
                  {index < 3 && <div className="w-8 h-px bg-slate-300 mx-4" />}
                </div>
              );
            })}
          </div>
          )}

          {step === 'template' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Choose Import Template
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Select the type of vehicles you want to import and get the appropriate CSV template
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Used Vehicles Template */}
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedTemplate === 'used'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate('used')}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {BULK_TEMPLATES.used.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {BULK_TEMPLATES.used.description}
                        </p>
                      </div>
                      {selectedTemplate === 'used' && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong className="text-gray-700">Required Fields:</strong>
                        <div className="mt-1 space-y-1">
                          {BULK_TEMPLATES.used.headers.slice(0, 8).map((header, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                              {header.replace('_', ' ')}
                            </Badge>
                          ))}
                          {BULK_TEMPLATES.used.headers.length > 8 && (
                            <Badge variant="outline" className="text-xs">
                              +{BULK_TEMPLATES.used.headers.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Perfect for: Dealerships, Used car lots, Individual sellers
                      </div>
                    </div>
                  </div>

                  {/* New Vehicles Template */}
                  <div
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedTemplate === 'new'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate('new')}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {BULK_TEMPLATES.new.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {BULK_TEMPLATES.new.description}
                        </p>
                      </div>
                      {selectedTemplate === 'new' && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong className="text-gray-700">Required Fields:</strong>
                        <div className="mt-1 space-y-1">
                          {BULK_TEMPLATES.new.headers.slice(0, 8).map((header, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                              {header.replace('_', ' ')}
                            </Badge>
                          ))}
                          {BULK_TEMPLATES.new.headers.length > 8 && (
                            <Badge variant="outline" className="text-xs">
                              +{BULK_TEMPLATES.new.headers.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Perfect for: New car dealerships, Showrooms, OEM partners
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewSample}
                      className="text-sm"
                    >
                      View Sample Data
                    </Button>
                  </div>

                  <Button
                    onClick={() => setStep('upload')}
                    className="flex items-center gap-2"
                  >
                    Continue to Upload
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload CSV File
                </CardTitle>
                

              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center border-2 border-dashed border-slate-300 rounded-lg p-8">
                  <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Choose your CSV file
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Upload a CSV file with your vehicle data
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Select CSV File</span>
                    </Button>
                  </label>
                </div>

                <div className="flex items-center justify-center">
                  <Button variant="outline" onClick={generateTemplate} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Make sure your CSV includes the required columns: registration_number, make, model, year, fuel_type.
                    Use the template above for the correct format.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Preview & Validate
                    </CardTitle>
                    <Button variant="outline" onClick={resetImport}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Found {previewData.length} rows in CSV
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="import-as-live" className="text-sm">
                        Import as Live Listings
                      </Label>
                      <Switch
                        id="import-as-live"
                        checked={importAsLive}
                        onCheckedChange={setImportAsLive}
                      />
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {validationResults.filter(r => r.isValid).length}
                      </div>
                      <div className="text-sm text-slate-600">Valid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {validationResults.filter(r => !r.isValid).length}
                      </div>
                      <div className="text-sm text-slate-600">Invalid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {validationResults.filter(r => r.warnings?.length > 0).length}
                      </div>
                      <div className="text-sm text-slate-600">Warnings</div>
                    </div>
                  </div>

                  {/* Data Preview Table */}
                  <div className="max-h-96 overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 border-b">Status</th>
                          <th className="text-left p-2 border-b">Reg #</th>
                          <th className="text-left p-2 border-b">Make</th>
                          <th className="text-left p-2 border-b">Model</th>
                          <th className="text-left p-2 border-b">Year</th>
                          <th className="text-left p-2 border-b">Price</th>
                          <th className="text-left p-2 border-b">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => {
                          const validation = validationResults[index];
                          return (
                            <tr key={index} className={validation?.isValid ? 'bg-green-50' : 'bg-red-50'}>
                              <td className="p-2 border-b">
                                {validation?.isValid ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                )}
                              </td>
                              <td className="p-2 border-b">{row.registration_number}</td>
                              <td className="p-2 border-b">{row.make}</td>
                              <td className="p-2 border-b">{row.model}</td>
                              <td className="p-2 border-b">{row.year}</td>
                              <td className="p-2 border-b">₹{row.asking_price?.toLocaleString()}</td>
                              <td className="p-2 border-b">
                                {validation?.errors?.length > 0 && (
                                  <div className="text-xs text-red-600">
                                    {validation.errors.join(', ')}
                                  </div>
                                )}
                                {validation?.warnings?.length > 0 && (
                                  <div className="text-xs text-yellow-600">
                                    {validation.warnings.join(', ')}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={resetImport}>
                      Start Over
                    </Button>
                    <Button 
                      onClick={startImport}
                      disabled={validationResults.filter(r => r.isValid).length === 0}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Import {validationResults.filter(r => r.isValid).length} Vehicles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'importing' && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Importing Vehicles...
                </h3>
                <p className="text-slate-600 mb-6">
                  Please wait while we process your vehicles
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={importProgress} className="mb-2" />
                  <p className="text-sm text-slate-600">
                    {Math.round(importProgress)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'complete' && importSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {importSummary.successful}
                    </div>
                    <div className="text-sm text-green-700">Successfully Imported</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {importSummary.failed}
                    </div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>

                {importSummary.failedRows.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Failed Imports:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {importSummary.failedRows.map((failure, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded">
                          Row {failure.row}: {failure.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Link to={createPageUrl("Inventory")}>
                    <Button>View Inventory</Button>
                  </Link>
                  <Button variant="outline" onClick={resetImport}>
                    Import More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
  );
}