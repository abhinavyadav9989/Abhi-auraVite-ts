import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { DealerDocument } from '@/api/entities';
import { toast } from 'sonner';

interface KYBDocumentsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: (data: any) => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving: boolean;
  currentStep: number;
  totalSteps: number;
  dealer?: any; // Add dealer prop to access registration data
}

const KYBDocumentsStep: React.FC<KYBDocumentsStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const [documents, setDocuments] = React.useState(data.kybDocuments || {});
  const [uploading, setUploading] = React.useState<string | null>(null);

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (data.kybDocuments) {
      setDocuments(data.kybDocuments);
    }
  }, [data.kybDocuments]);

  const requiredDocuments = [
    { id: 'trade_licence', label: 'Trade License', required: true },
    { id: 'gst_certificate', label: 'GST Certificate', required: true },
    { id: 'pan_card', label: 'PAN Card', required: true },
    { id: 'address_proof', label: 'Address Proof', required: true },
    { id: 'bank_statement', label: 'Bank Statement', required: false },
    { id: 'other', label: 'Other Documents', required: false }
  ];

  const handleFileUpload = async (docType: string, file: File) => {
    if (!dealer?.id) {
      toast.error('Dealer information not available. Please try again.');
      return;
    }

    setUploading(docType);
    
    try {
      console.log(`Uploading ${docType} file:`, file.name, file.size, file.type);
      
      // Use the existing UploadFile function
      const response = await UploadFile({ file });
      
      if (response.file_url) {
        console.log(`File upload successful:`, response);
        
        // Create document record in database directly (like Profile component)
        const newDoc = {
          dealer_id: dealer.id,
          document_type: docType,
          file_url: response.file_url,
          file_name: file.name,
          file_size: file.size || 0,
          file_type: file.type,
          status: 'pending'
        };

        console.log(`Creating document record for ${docType}:`, newDoc);
        
        // Check if document already exists and update it, or create new
        const existingDocs = await DealerDocument.filter({
          dealer_id: dealer.id,
          document_type: docType
        });

        let createdDoc;
        if (existingDocs.length > 0) {
          // Update existing document
          createdDoc = await DealerDocument.update(existingDocs[0].id, newDoc);
          console.log(`Updated existing document for ${docType}:`, createdDoc);
        } else {
          // Create new document
          createdDoc = await DealerDocument.create(newDoc);
          console.log(`Created new document for ${docType}:`, createdDoc);
        }

        // Also store in local state for UI consistency
        const uploadedDoc = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          url: response.file_url,
          storagePath: response.path,
          dbRecord: createdDoc // Store the database record reference
        };
        
        console.log(`Successfully uploaded ${docType}:`, uploadedDoc);
        
        setDocuments(prev => ({
          ...prev,
          [docType]: uploadedDoc
        }));
        
        updateData({ ...data, kybDocuments: { ...documents, [docType]: uploadedDoc } });
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error("Upload failed to return a URL.");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const removeDocument = (docType: string) => {
    const newDocuments = { ...documents };
    delete newDocuments[docType];
    setDocuments(newDocuments);
    updateData({ ...data, kybDocuments: newDocuments });
    toast.success('Document removed successfully');
  };

  const handleContinue = () => {
    onNext(documents);
  };

  const isFormValid = () => {
    return requiredDocuments
      .filter(doc => doc.required)
      .every(doc => documents[doc.id]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">KYB Documents</h2>
        <p className="text-slate-600 mt-2">Upload required documents for verification</p>
      </div>

      <div className="space-y-6">
        {requiredDocuments.map((doc) => (
          <div key={doc.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Label className="text-base font-medium">
                  {doc.label}
                  {doc.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <p className="text-sm text-slate-500 mt-1">
                  {doc.required ? 'Required for verification' : 'Optional'}
                </p>
              </div>
              
              {documents[doc.id] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {documents[doc.id] ? (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{documents[doc.id].fileName}</p>
                  <p className="text-sm text-green-700">
                    {(documents[doc.id].fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="text-green-600">
                  ✓ Uploaded
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id={`file-${doc.id}`}
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(doc.id, file);
                    }
                  }}
                  disabled={uploading === doc.id}
                />
                <label
                  htmlFor={`file-${doc.id}`}
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {uploading === doc.id ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {uploading === doc.id ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Document Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All documents should be clear and legible</li>
          <li>• File size should not exceed 10MB</li>
          <li>• Supported formats: PNG, JPG, PDF</li>
          <li>• Documents will be verified within 24-48 hours</li>
        </ul>
      </div>

      {/* KYB Completion Status */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Complete KYB Verification</h3>
              <p className="text-sm text-orange-700">Finish verification to unlock full trading capabilities</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-900">
              {Math.round((Object.keys(documents).filter(key => documents[key]).length / requiredDocuments.filter(doc => doc.required).length) * 100)}%
            </div>
            <div className="text-sm text-orange-700">Complete</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {requiredDocuments.filter(doc => doc.required).map((doc) => (
            <div key={doc.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  documents[doc.id] ? 'bg-green-500' : 'bg-orange-200'
                }`}>
                  {documents[doc.id] ? (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  )}
                </div>
                <span className="text-sm text-orange-800">{doc.label}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                documents[doc.id] 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {documents[doc.id] ? 'Uploaded' : 'Required'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-orange-200">
          <p className="text-sm text-orange-700 mb-3">
            {isFormValid() 
              ? "✓ All required documents uploaded! Your verification will be processed within 24-48 hours."
              : `Upload ${requiredDocuments.filter(doc => doc.required && !documents[doc.id]).length} more required documents to complete KYB verification.`
            }
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isSaving || !isFormValid()}
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default KYBDocumentsStep;
