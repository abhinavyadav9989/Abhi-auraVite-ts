import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { DealerDocument } from '@/api/entities';
import { toast } from 'sonner';

interface UploadedCheque {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  url: string;
  storagePath: string;
  dbRecord: unknown;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  cancelledCheque: UploadedCheque | null;
}

interface OnboardingData {
  bankDetails?: BankDetails;
  [key: string]: unknown;
}

interface BankDetailsStepProps {
  data: OnboardingData;
  updateData: (data: OnboardingData) => void;
  onNext: (data: BankDetails) => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving: boolean;
  currentStep: number;
  totalSteps: number;
  dealer?: { id?: string };
}

const BankDetailsStep: React.FC<BankDetailsStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const [bankData, setBankData] = React.useState<BankDetails>(data.bankDetails || {
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    cancelledCheque: null
  });

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (data.bankDetails) {
      setBankData(data.bankDetails);
    }
  }, [data.bankDetails]);

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    const newBankData = { ...bankData, [field]: value };
    setBankData(newBankData);
    updateData({ ...data, bankDetails: newBankData });
  };

  const handleChequeUpload = async (file: File) => {
    if (!dealer?.id) {
      toast.error('Dealer information not available. Please try again.');
      return;
    }

    try {
      console.log('Uploading cheque file:', file.name, file.size, file.type);
      
      // Use the existing UploadFile function
      const response = await UploadFile({ file });
      
      if (response.file_url) {
        console.log('File upload successful:', response);
        
        // Create document record in database directly (like Profile component)
        const newDoc = {
          dealer_id: dealer.id,
          document_type: 'cancelled_cheque',
          file_url: response.file_url,
          file_name: file.name,
          file_size: file.size || 0,
          file_type: file.type,
          status: 'pending'
        };

        console.log('Creating cancelled cheque document record:', newDoc);
        
        // Check if document already exists and update it, or create new
        const existingDocs = await DealerDocument.filter({
          dealer_id: dealer.id,
          document_type: 'cancelled_cheque'
        });

        let createdDoc;
        if (existingDocs.length > 0) {
          // Update existing document
          createdDoc = await DealerDocument.update(existingDocs[0].id, newDoc);
          console.log('Updated existing cancelled cheque document:', createdDoc);
        } else {
          // Create new document
          createdDoc = await DealerDocument.create(newDoc);
          console.log('Created new cancelled cheque document:', createdDoc);
        }

        // Also store in local state for UI consistency
        const uploadedCheque = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          url: response.file_url,
          storagePath: response.path,
          dbRecord: createdDoc // Store the database record reference
        };
        
        console.log('Successfully uploaded cheque:', uploadedCheque);
        
        const newBankData = { ...bankData, cancelledCheque: uploadedCheque };
        setBankData(newBankData);
        updateData({ ...data, bankDetails: newBankData });
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error("Upload failed to return a URL.");
      }
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to upload ${file.name}: ${message}`);
    }
  };

  const removeCheque = () => {
    const newBankData = { ...bankData, cancelledCheque: null };
    setBankData(newBankData);
    updateData({ ...data, bankDetails: newBankData });
    toast.success('Cheque removed successfully');
  };

  const handleContinue = () => {
    onNext(bankData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Bank Details</h2>
        <p className="text-slate-600 mt-2">Payment and settlement information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">Account Holder Name *</Label>
          <Input
            id="accountHolderName"
            value={bankData.accountHolderName}
            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            placeholder="Enter account holder name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            value={bankData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            placeholder="Enter account number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ifscCode">IFSC Code *</Label>
          <Input
            id="ifscCode"
            value={bankData.ifscCode}
            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
            placeholder="Enter IFSC code"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value={bankData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            placeholder="Enter bank name"
            required
          />
        </div>
      </div>

      {/* Cancelled Cheque Upload */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Cancelled Cheque *</Label>
          <p className="text-sm text-slate-500 mt-1">
            Upload a cancelled cheque for verification
          </p>
        </div>

        {bankData.cancelledCheque ? (
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">{bankData.cancelledCheque.fileName}</p>
              <p className="text-sm text-green-700">
                {(bankData.cancelledCheque.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-green-600">✓ Uploaded</div>
              <button
                onClick={removeCheque}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="cancelled-cheque"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleChequeUpload(file);
                }
              }}
            />
            <label
              htmlFor="cancelled-cheque"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Click to upload</p>
                <p className="text-xs text-slate-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Bank Details Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Account holder name should match your business name</li>
          <li>• IFSC code should be valid and correct</li>
          <li>• Cancelled cheque should be clear and legible</li>
          <li>• Bank details will be verified for security</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isSaving || !bankData.accountHolderName || !bankData.accountNumber || !bankData.ifscCode || !bankData.bankName || !bankData.cancelledCheque}
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsStep;
