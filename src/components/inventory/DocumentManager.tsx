import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { VehicleAsset } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';

const DOCUMENT_TYPES = [
  { 
    key: 'rc', 
    label: 'Registration Certificate', 
    required: true,
    extractable: true,
    fields: ['registration_number', 'owner_name', 'engine_number', 'chassis_number']
  },
  { 
    key: 'insurance', 
    label: 'Insurance Certificate', 
    required: true,
    extractable: true,
    fields: ['policy_number', 'expiry_date', 'insurer_name']
  },
  { 
    key: 'puc', 
    label: 'PUC Certificate', 
    required: false,
    extractable: true,
    fields: ['certificate_number', 'expiry_date', 'emission_norms']
  },
  { 
    key: 'service_history', 
    label: 'Service Records', 
    required: false,
    extractable: false,
    fields: []
  },
  { 
    key: 'other', 
    label: 'Other Documents', 
    required: false,
    extractable: false,
    fields: []
  }
];

export default function DocumentManager({ vehicleId, onDocumentsChange }) {
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [vehicleId]);

  const loadDocuments = async () => {
    try {
      const assets = await VehicleAsset.filter({ 
        vehicle_id: vehicleId, 
        asset_type: 'document' 
      }, '-created_date');
      setDocuments(assets || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    const uploadId = `${documentType}-${Date.now()}`;
    
    try {
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
      
      // Upload file
      const { file_url } = await UploadFile({ file });
      setUploadProgress(prev => ({ ...prev, [uploadId]: 50 }));
      
      // Create asset record
      const assetData = {
        vehicle_id: vehicleId,
        asset_type: 'document',
        document_type: documentType,
        original_url: file_url,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'ready'
      };

      const newAsset = await VehicleAsset.create(assetData);
      setUploadProgress(prev => ({ ...prev, [uploadId]: 75 }));

      // Extract data if document type supports it
      const docConfig = DOCUMENT_TYPES.find(d => d.key === documentType);
      if (docConfig?.extractable && docConfig.fields.length > 0) {
        await extractDocumentData(newAsset, docConfig);
      }

      setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[uploadId];
          return newProgress;
        });
      }, 2000);

      await loadDocuments();
      onDocumentsChange?.();
      
      toast({
        title: "Document Uploaded",
        description: `${docConfig?.label} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload document. Please try again.",
        variant: "destructive"
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[uploadId];
        return newProgress;
      });
    }
  };

  const extractDocumentData = async (asset, docConfig) => {
    try {
      const schema = {
        type: "object",
        properties: docConfig.fields.reduce((acc, field) => ({
          ...acc,
          [field]: { type: "string" }
        }), {})
      };

      const result = await ExtractDataFromUploadedFile({
        file_url: asset.original_url,
        json_schema: schema
      });

      if (result.status === 'success' && result.output) {
        setExtractedData(prev => ({
          ...prev,
          [asset.id]: result.output
        }));

        // Update asset with extracted metadata
        await VehicleAsset.update(asset.id, {
          ai_metadata: {
            extracted_data: result.output,
            extraction_confidence: 0.9,
            extracted_at: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Data extraction failed:', error);
    }
  };

  const handleDeleteDocument = async (assetId) => {
    try {
      await VehicleAsset.delete(assetId);
      await loadDocuments();
      onDocumentsChange?.();
      toast({
        title: "Document Deleted",
        description: "Document has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete document.",
        variant: "destructive"
      });
    }
  };

  const getDocumentStatus = (docType) => {
    const docs = documents.filter(d => d.document_type === docType);
    if (docs.length === 0) return 'missing';
    
    const latestDoc = docs[0];
    const extractedInfo = extractedData[latestDoc.id];
    
    // Check if document is expiring soon (for insurance, PUC)
    if (extractedInfo?.expiry_date) {
      const expiryDate = new Date(extractedInfo.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry < 30) return 'expiring';
      if (daysToExpiry < 0) return 'expired';
    }
    
    return 'valid';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700';
      case 'expiring': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'missing': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'expiring': case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'missing': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vehicle Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {DOCUMENT_TYPES.map(docType => {
              const status = getDocumentStatus(docType.key);
              const docs = documents.filter(d => d.document_type === docType.key);
              const latestDoc = docs[0];
              const extractedInfo = extractedData[latestDoc?.id];

              return (
                <div key={docType.key} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{docType.label}</h4>
                      {docType.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {latestDoc && (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDocument(latestDoc.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                      
                      <label className="cursor-pointer">
                        <Button size="sm" variant={latestDoc ? "outline" : "default"}>
                          <Upload className="w-4 h-4 mr-1" />
                          {latestDoc ? 'Replace' : 'Upload'}
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType.key, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {Object.entries(uploadProgress)
                    .filter(([id]) => id.startsWith(docType.key))
                    .map(([id, progress]) => (
                      <div key={id} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}

                  {/* Extracted Data Display */}
                  {extractedInfo && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2">Extracted Information</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(extractedInfo).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-blue-700 font-medium">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span className="text-blue-800 ml-1">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expiry Alerts */}
                  {extractedInfo?.expiry_date && (
                    <ExpiryAlert expiryDate={extractedInfo.expiry_date} docType={docType.label} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for expiry alerts
function ExpiryAlert({ expiryDate, docType }) {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysToExpiry > 30) return null;

  const isExpired = daysToExpiry < 0;
  const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;

  return (
    <Alert className={`mt-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription className={isExpired ? 'text-red-700' : 'text-yellow-700'}>
        {isExpired 
          ? `${docType} expired ${Math.abs(daysToExpiry)} days ago. Immediate renewal required.`
          : `${docType} expires in ${daysToExpiry} days. Plan for renewal.`
        }
      </AlertDescription>
    </Alert>
  );
}