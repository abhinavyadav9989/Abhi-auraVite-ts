import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Camera,
  Scan
} from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';

const DOCUMENT_TYPES = [
  {
    id: 'gstin',
    name: 'GST Certificate',
    description: 'Valid GST registration certificate',
    required: true,
    formats: ['pdf', 'jpg', 'png'],
    extractable: true,
    fields: ['gstin', 'business_name', 'registration_date']
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Business or individual PAN card',
    required: true,
    formats: ['pdf', 'jpg', 'png'],
    extractable: true,
    fields: ['pan_number', 'name']
  },
  {
    id: 'aadhar',
    name: 'Aadhar Card',
    description: 'Owner Aadhar card (both sides)',
    required: true,
    formats: ['pdf', 'jpg', 'png'],
    extractable: true,
    fields: ['aadhar_number', 'name', 'address']
  },
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Last 3 months bank statement',
    required: true,
    formats: ['pdf'],
    extractable: false
  },
  {
    id: 'shop_license',
    name: 'Shop & Establishment License',
    description: 'Valid trade license',
    required: false,
    formats: ['pdf', 'jpg', 'png'],
    extractable: true,
    fields: ['license_number', 'validity_date']
  }
];

export default function DocumentUploader({ dealer, onComplete, onDataExtracted }) {
  const [documents, setDocuments] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [uploading, setUploading] = useState({});
  const [extracting, setExtracting] = useState({});
  const [dragOver, setDragOver] = useState(null);

  const handleFileUpload = useCallback(async (files, docType) => {
    const file = files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [docType]: true }));
    
    try {
      // Upload file
      const { file_url } = await UploadFile({ file });
      
      // Update documents state
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file_url,
          file_name: file.name,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          status: 'uploaded'
        }
      }));

      // Extract data if document supports it
      const docConfig = DOCUMENT_TYPES.find(d => d.id === docType);
      if (docConfig?.extractable) {
        await extractDocumentData(file_url, docType, docConfig.fields);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setDocuments(prev => ({
        ...prev,
        [docType]: { 
          error: 'Upload failed. Please try again.',
          status: 'error'
        }
      }));
    }
    
    setUploading(prev => ({ ...prev, [docType]: false }));
  }, []);

  const extractDocumentData = async (fileUrl, docType, fields) => {
    setExtracting(prev => ({ ...prev, [docType]: true }));
    
    try {
      const schema = {
        type: "object",
        properties: fields.reduce((acc, field) => ({
          ...acc,
          [field]: { type: "string" }
        }), {})
      };

      const result = await ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: schema
      });

      if (result.status === 'success') {
        setExtractedData(prev => ({
          ...prev,
          [docType]: result.output
        }));
        
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            ...prev[docType],
            status: 'extracted',
            extracted_data: result.output
          }
        }));

        // Callback for parent component
        onDataExtracted?.(docType, result.output);
      }
    } catch (error) {
      console.error('Data extraction failed:', error);
    }
    
    setExtracting(prev => ({ ...prev, [docType]: false }));
  };

  const handleDragOver = useCallback((e, docType) => {
    e.preventDefault();
    setDragOver(docType);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e, docType) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files, docType);
    }
  }, [handleFileUpload]);

  const removeDocument = (docType) => {
    setDocuments(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    setExtractedData(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
  };

  const getCompletionStatus = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => documents[d.id]?.status === 'uploaded' || documents[d.id]?.status === 'extracted');
    return {
      completed: uploadedRequired.length,
      total: requiredDocs.length,
      percentage: Math.round((uploadedRequired.length / requiredDocs.length) * 100)
    };
  };

  const completionStatus = getCompletionStatus();
  const canComplete = completionStatus.percentage === 100;

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Your Data is Secure</h3>
              <p className="text-sm text-blue-800">
                <Lock className="w-3 h-3 inline mr-1" />
                All documents are encrypted and only visible to authorized Aura staff for verification.
                We never share your personal information with third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>KYB Verification Progress</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {completionStatus.completed}/{completionStatus.total} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={completionStatus.percentage} className="w-full" />
            <p className="text-sm text-slate-600">
              {canComplete 
                ? "All required documents uploaded! Verification will begin within 24 hours."
                : `Upload ${completionStatus.total - completionStatus.completed} more required documents to complete KYB.`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Grid */}
      <div className="grid gap-6">
        {DOCUMENT_TYPES.map(docType => {
          const doc = documents[docType.id];
          const isUploading = uploading[docType.id];
          const isExtracting = extracting[docType.id];
          const isDragOver = dragOver === docType.id;
          const extractedInfo = extractedData[docType.id];

          return (
            <Card key={docType.id} className={`${
              doc?.status === 'extracted' ? 'border-green-200 bg-green-50' :
              doc?.status === 'uploaded' ? 'border-blue-200 bg-blue-50' :
              doc?.error ? 'border-red-200 bg-red-50' :
              docType.required ? 'border-orange-200 bg-orange-50' :
              'border-slate-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {docType.name}
                    {docType.required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  {doc?.status === 'extracted' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {doc?.error && (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{docType.description}</p>

                {!doc ? (
                  /* Upload Area */
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragOver ? 'border-blue-500 bg-blue-50' :
                      isUploading ? 'border-blue-300 bg-blue-25' :
                      'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, docType.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, docType.id)}
                    onClick={() => {
                      if (isUploading) return;
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = docType.formats.map(f => `.${f}`).join(',');
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        const files = target.files ? Array.from(target.files) : [];
                        handleFileUpload(files, docType.id);
                      };
                      input.click();
                    }}
                  >
                    {isUploading ? (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-blue-500 mx-auto animate-pulse" />
                        <p className="text-blue-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-slate-600 mb-1">
                            Drop files here or click to upload
                          </p>
                          <p className="text-xs text-slate-500">
                            Supports: {docType.formats.join(', ').toUpperCase()}
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="outline">
                            <Camera className="w-3 h-3 mr-1" />
                            Camera
                          </Button>
                          {docType.extractable && (
                            <Button size="sm" variant="outline">
                              <Scan className="w-3 h-3 mr-1" />
                              Auto-fill
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Uploaded Document Display */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="font-medium text-sm">{doc.file_name}</div>
                          <div className="text-xs text-slate-500">
                            {(doc.file_size / 1024).toFixed(1)} KB • Uploaded
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeDocument(docType.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Extraction Status */}
                    {docType.extractable && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        {isExtracting ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Scan className="w-4 h-4 animate-pulse" />
                            <span className="text-sm">Extracting data...</span>
                          </div>
                        ) : extractedInfo ? (
                          <div>
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Data extracted successfully</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {(Object.entries(extractedInfo) as [string, unknown][]).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-slate-600 capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600">
                            Auto-extraction available for this document type
                          </div>
                        )}
                      </div>
                    )}

                    {doc.error && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{doc.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Actions */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">Ready for Verification</h3>
              <p className="text-sm text-green-800">
                {canComplete 
                  ? "All documents uploaded. Click submit to begin verification process."
                  : "Upload all required documents to submit for verification."
                }
              </p>
            </div>
            <Button 
              onClick={onComplete}
              disabled={!canComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              {canComplete ? 'Submit for Verification' : 'Complete Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}