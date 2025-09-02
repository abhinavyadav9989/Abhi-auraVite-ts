import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  Eye,
  Trash2,
  Shield,
  Clock
} from 'lucide-react';
import { documentUploadService } from '@/api/services/documentUploadService';
import type { VehicleDocument } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { DocumentOCR } from '@/components/ui/DocumentOCR';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';

interface DocumentsStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

export default function DocumentsStep({ data, updateData, dealer }: DocumentsStepProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const { toast } = useToast();

  // Activation system hook
  const { checkFeatureAccess } = useDealerActivationSettings();

  // Check if OCR features are enabled
  const hasOCR = checkFeatureAccess('ocr_processing');

  const handleDocumentToggle = (field: string, value: boolean) => {
    updateData({ [field]: value });
  };

  const handleDateChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  // Map any UI-specific field names to canonical document_type values used in DB
  const toCanonicalDocumentType = (type: string): string => {
    if (type.startsWith('rc')) return 'rc';
    if (type.startsWith('insurance')) return 'insurance';
    if (type.startsWith('puc')) return 'puc';
    return 'other';
  };

  // Handle OCR data extraction
  const handleRCDataExtracted = (extractedData: any) => {
    const updates: any = {};

    // Map RC fields to form data
    if (extractedData.registration_number) {
      updates.registration_number = extractedData.registration_number;
    }
    if (extractedData.owner_name) {
      updates.owner_name = extractedData.owner_name;
    }
    if (extractedData.vehicle_make) {
      updates.make = extractedData.vehicle_make;
    }
    if (extractedData.vehicle_model) {
      updates.model = extractedData.vehicle_model;
    }
    if (extractedData.vehicle_variant) {
      updates.variant = extractedData.vehicle_variant;
    }
    if (extractedData.manufacturing_year) {
      updates.year = extractedData.manufacturing_year;
    }
    if (extractedData.fuel_type) {
      updates.fuel_type = extractedData.fuel_type;
    }
    if (extractedData.seating_capacity) {
      updates.seating_capacity = extractedData.seating_capacity;
    }
    if (extractedData.body_type) {
      updates.body_type = extractedData.body_type;
    }
    if (extractedData.color) {
      updates.color = extractedData.color;
    }

    if (Object.keys(updates).length > 0) {
      updateData(updates);

      toast({
        title: "RC Data Extracted",
        description: `Auto-filled ${Object.keys(updates).length} fields from registration certificate.`,
      });
    }
  };

  const handleInsuranceDataExtracted = (extractedData: any) => {
    const updates: any = {};

    // Map insurance fields to form data
    if (extractedData.insurance_provider) {
      updates.insurance_provider = extractedData.insurance_provider;
    }
    if (extractedData.policy_number) {
      updates.insurance_policy_number = extractedData.policy_number;
    }
    if (extractedData.policy_end_date) {
      updates.insurance_valid_until = extractedData.policy_end_date;
    }
    if (extractedData.insured_amount) {
      updates.insured_amount = extractedData.insured_amount;
    }

    if (Object.keys(updates).length > 0) {
      updateData(updates);

      toast({
        title: "Insurance Data Extracted",
        description: `Auto-filled ${Object.keys(updates).length} fields from insurance policy.`,
      });
    }
  };

  const handlePUCDataExtracted = (extractedData: any) => {
    const updates: any = {};

    // Map PUC fields to form data
    if (extractedData.puc_valid_until) {
      updates.puc_valid_until = extractedData.puc_valid_until;
    }

    if (Object.keys(updates).length > 0) {
      updateData(updates);

      toast({
        title: "PUC Data Extracted",
        description: "PUC validity date auto-filled.",
      });
    }
  };

  const handleDocumentUpload = (documentType: string, result: { file_url: string; file_name: string }) => {
    // Store document upload information
    updateData({
      [`${documentType}_uploaded`]: true,
      [`${documentType}_file_url`]: result.file_url,
      [`${documentType}_file_name`]: result.file_name,
    });
  };

  // Load existing documents when component mounts or vehicle ID changes
  useEffect(() => {
    if (data.id) {
      loadExistingDocuments();
    }
  }, [data.id]);

  const loadExistingDocuments = async () => {
    if (!data.id) return;
    
    setLoadingDocuments(true);
    try {
      const docs = await documentUploadService.getVehicleDocuments(data.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load existing documents.",
        variant: "destructive"
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!data.id) {
      toast({
        title: "Error",
        description: "Vehicle must be saved before uploading documents.",
        variant: "destructive"
      });
      return;
    }

    setUploading(documentType);
    setUploadProgress(0);

    try {
      const canonicalType = toCanonicalDocumentType(documentType);
      const result = await documentUploadService.uploadVehicleDocument(
        data.id,
        file,
        canonicalType as any,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        // Update local documents list
        await loadExistingDocuments();
        
        // Update form data with document status (keep UI field keys for local state)
        updateData({
          ...data,
          [`${documentType}_uploaded`]: true,
          [`${documentType}_file_name`]: file.name,
          [`${documentType}_ocr_data`]: result.ocrData
        });

        toast({
          title: "Document Uploaded",
          description: `${canonicalType.toUpperCase()} document uploaded successfully.`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload document.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during upload.",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = await documentUploadService.deleteVehicleDocument(documentId);
      if (success) {
        await loadExistingDocuments();
        toast({
          title: "Document Deleted",
          description: "Document has been removed successfully.",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete document.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Document deletion error:', error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const renderDocumentItem = (
    field: string,
    label: string,
    description: string,
    icon: React.ReactNode,
    hasDate?: boolean,
    dateField?: string
  ) => {
    const value = data[field];
    const uploaded = data[`${field}_uploaded`];
    const fileName = data[`${field}_file_name`];
    const ocrData = data[`${field}_ocr_data`];

    return (
      <div className="space-y-3 p-3 md:p-4 border rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <Label className="text-sm md:text-base font-medium">{label}</Label>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 self-start sm:self-center">
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => handleDocumentToggle(field, checked)}
            />
            <Badge variant={value === true ? 'default' : 'secondary'} className="text-xs">
              {value === true ? 'Available' : 'Not Available'}
            </Badge>
          </div>
        </div>

        {value === true && (
          <div className="space-y-3">
            {hasDate && dateField && (
              <div className="space-y-2">
                <Label htmlFor={dateField} className="text-sm md:text-base font-medium">
                  Valid Until
                </Label>
                <Input
                  id={dateField}
                  type="date"
                  value={data[dateField] || ''}
                  onChange={(e) => handleDateChange(dateField, e.target.value)}
                  className="text-base md:text-sm h-11 md:h-10"
                />
              </div>
            )}

            {!data.id && (
              <Alert className="mb-3 md:mb-4 py-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Save your vehicle as a draft first to upload documents.
                </AlertDescription>
              </Alert>
            )}

            {uploaded ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800 truncate">
                      {fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(fileName, '_blank')}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileName;
                        link.download = fileName.split('/').pop() || 'document';
                        link.click();
                      }}
                      className="p-2"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const canonicalType = toCanonicalDocumentType(field);
                        const doc = documents.find(d => d.document_type === canonicalType);
                        if (doc) {
                          handleDeleteDocument(doc.id);
                        }
                      }}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {ocrData && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Auto-extracted data:</p>
                    <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                      {Object.entries(ocrData).map(([key, value]) => {
                        const displayValue =
                          value === null || value === undefined
                            ? ''
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value);
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{displayValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload Document</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(field, file);
                      }
                    }}
                    className="hidden"
                    id={`upload-${field}`}
                  />
                  <label htmlFor={`upload-${field}`} className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </label>
                </div>
              </div>
            )}

            {uploading === field && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500">
                  Extracting data using OCR...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getDocumentStats = () => {
    const documents = ['rc_available', 'insurance_status', 'puc_available', 'service_records_uploaded'];
    const available = documents.filter(doc => data[doc] === true || (data[doc] && data[doc] !== '')).length;
    const total = documents.length;
    
    return { available, total, percentage: Math.round((available / total) * 100) };
  };

  const stats = getDocumentStats();

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Vehicle Documents</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Upload and verify important vehicle documents. This builds trust with buyers.
        </p>
      </div>

      {/* Document Completion Status */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Shield className="w-4 h-4 md:w-5 md:h-5" />
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm md:text-base font-medium">Document Completion</span>
              <span className="text-xs md:text-sm text-gray-600">
                {stats.available} of {stats.total} documents
              </span>
            </div>
            <Progress value={stats.percentage} className="w-full h-2 md:h-3" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm">
              <Badge variant={stats.percentage >= 75 ? 'default' : 'secondary'} className="self-start">
                {stats.percentage >= 75 ? 'Good' : 'Incomplete'}
              </Badge>
              <span className="text-gray-600 leading-relaxed">
                {stats.percentage >= 75
                  ? 'Most documents are ready'
                  : 'Add more documents to build trust'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Required Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
          {/* RC with OCR */}
          {hasOCR ? (
            <div className="space-y-3 p-3 md:p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm md:text-base font-medium">Registration Certificate (RC)</Label>
                    <p className="text-xs md:text-sm text-gray-600">Upload RC for automatic data extraction</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs self-start sm:self-center">
                  OCR Enabled
                </Badge>
              </div>

              <DocumentOCR
                documentType="rc"
                onDataExtracted={handleRCDataExtracted}
                onUploadComplete={(result) => handleDocumentUpload('rc', result)}
                existingValue={data.registration_number}
                label=""
                placeholder="Upload RC for auto-fill"
              />
            </div>
          ) : (
            renderDocumentItem(
              'rc_available',
              'Registration Certificate (RC)',
              'Original RC book or smart card',
              <FileText className="w-5 h-5 text-blue-600" />
            )
          )}

          {/* Insurance with OCR */}
          {hasOCR ? (
            <div className="space-y-3 p-3 md:p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm md:text-base font-medium">Insurance Policy</Label>
                    <p className="text-xs md:text-sm text-gray-600">Upload insurance for automatic data extraction</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs self-start sm:self-center">
                  OCR Enabled
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_status" className="text-sm md:text-base">Insurance Status</Label>
                  <select
                    id="insurance_status"
                    value={data.insurance_status || ''}
                    onChange={(e) => updateData({ insurance_status: e.target.value })}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-base md:text-sm h-11 md:h-10"
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_valid_until" className="text-sm md:text-base">Valid Until</Label>
                  <Input
                    id="insurance_valid_until"
                    type="date"
                    value={data.insurance_valid_until || ''}
                    onChange={(e) => handleDateChange('insurance_valid_until', e.target.value)}
                    className="text-base md:text-sm h-11 md:h-10"
                  />
                </div>
              </div>

              <DocumentOCR
                documentType="insurance"
                onDataExtracted={handleInsuranceDataExtracted}
                onUploadComplete={(result) => handleDocumentUpload('insurance', result)}
                existingValue={data.insurance_policy_number}
                label=""
                placeholder="Upload insurance policy for auto-fill"
              />
            </div>
          ) : (
            renderDocumentItem(
              'insurance_status',
              'Insurance',
              'Valid insurance policy',
              <Shield className="w-5 h-5 text-green-600" />,
              true,
              'insurance_valid_until'
            )
          )}
          
          {/* PUC with OCR */}
          {hasOCR ? (
            <div className="space-y-3 p-3 md:p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm md:text-base font-medium">PUC Certificate</Label>
                    <p className="text-xs md:text-sm text-gray-600">Upload PUC certificate for automatic validity extraction</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs self-start sm:self-center">
                  OCR Enabled
                </Badge>
              </div>

              <div className="space-y-2 mb-3 md:mb-4">
                <Label htmlFor="puc_valid_until" className="text-sm md:text-base">PUC Valid Until</Label>
                <Input
                  id="puc_valid_until"
                  type="date"
                  value={data.puc_valid_until || ''}
                  onChange={(e) => handleDateChange('puc_valid_until', e.target.value)}
                  className="text-base md:text-sm h-11 md:h-10"
                />
              </div>

              <DocumentOCR
                documentType="puc"
                onDataExtracted={handlePUCDataExtracted}
                onUploadComplete={(result) => handleDocumentUpload('puc', result)}
                existingValue={data.puc_valid_until}
                label=""
                placeholder="Upload PUC certificate for auto-fill"
              />
            </div>
          ) : (
            renderDocumentItem(
              'puc_available',
              'PUC Certificate',
              'Pollution Under Control certificate',
              <Calendar className="w-5 h-5 text-orange-600" />,
              true,
              'puc_valid_until'
            )
          )}
          
          {renderDocumentItem(
            'service_records_uploaded',
            'Service Records',
            'Service history and maintenance records',
            <FileText className="w-5 h-5 text-purple-600" />
          )}
        </CardContent>
      </Card>

      {/* Document Tips */}
      <Alert className="mx-4 md:mx-0 py-3">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="font-medium text-sm md:text-base">Document Upload Tips:</p>
            <ul className="text-xs md:text-sm space-y-1 list-disc list-inside leading-relaxed">
              <li>Ensure documents are clear and readable</li>
              <li>Upload high-resolution images or PDFs</li>
              <li>Make sure all dates are current and valid</li>
              <li>We use OCR to auto-fill vehicle details from your documents</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Privacy Notice */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Shield className="w-4 h-4 md:w-5 md:h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
              <strong>Your documents are secure:</strong> All uploaded documents are encrypted and stored securely.
              Only you and authorized team members can access them. We use OCR technology to extract vehicle
              information automatically, but your original documents remain private.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
