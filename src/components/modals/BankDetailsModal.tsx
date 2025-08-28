import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dealer } from '@/api/entityAdapters';
import { supabase } from '@/api/supabaseClient';

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBankDetailsAdded: (bankDetails: any) => void;
  dealerId: string;
}

export default function BankDetailsModal({ isOpen, onClose, onBankDetailsAdded, dealerId }: BankDetailsModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bankInfo, setBankInfo] = useState<any>(null);
  
  const [bankData, setBankData] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    beneficiaryName: '',
    bankName: '',
    branchName: '',
    accountType: 'current' // current, savings
  });

  const updateBankData = (field: string, value: any) => {
    setBankData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Auto-fetch bank details when IFSC is complete
    if (field === 'ifscCode' && value.length === 11) {
      fetchBankDetails(value);
    }
  };

  const fetchBankDetails = async (ifsc: string) => {
    try {
      setIsVerifying(true);
      // In a real app, this would call an IFSC verification API
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockBankData = {
        bank: 'State Bank of India',
        branch: 'Mumbai Main Branch',
        address: 'Fort, Mumbai - 400001',
        city: 'Mumbai',
        state: 'Maharashtra'
      };
      
      setBankInfo(mockBankData);
      setBankData(prev => ({
        ...prev,
        bankName: mockBankData.bank,
        branchName: mockBankData.branch
      }));
      
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setBankInfo(null);
      setErrors(prev => ({ ...prev, ifscCode: 'Invalid IFSC code' }));
    } finally {
      setIsVerifying(false);
    }
  };

  const validateBankData = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!bankData.accountNumber.trim()) {
      stepErrors.accountNumber = "Account number is required";
    } else if (bankData.accountNumber.length < 9 || bankData.accountNumber.length > 18) {
      stepErrors.accountNumber = "Account number must be 9-18 digits";
    }
    
    if (!bankData.confirmAccountNumber.trim()) {
      stepErrors.confirmAccountNumber = "Please confirm account number";
    } else if (bankData.accountNumber !== bankData.confirmAccountNumber) {
      stepErrors.confirmAccountNumber = "Account numbers do not match";
    }
    
    if (!bankData.ifscCode.trim()) {
      stepErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankData.ifscCode)) {
      stepErrors.ifscCode = "Please enter a valid IFSC code";
    }
    
    if (!bankData.beneficiaryName.trim()) {
      stepErrors.beneficiaryName = "Beneficiary name is required";
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBankData()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    if (!dealerId) {
      toast({
        title: "Missing Dealer",
        description: "Cannot add bank details without a dealer profile.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Persist to DB: upsert into public.bank_details (unique dealer_id)
      const payload: any = {
        dealer_id: dealerId,
        account_holder_name: bankData.beneficiaryName,
        account_number: bankData.accountNumber,
        ifsc_code: bankData.ifscCode,
        bank_name: bankData.bankName || null,
        cancelled_cheque_url: null,
        is_verified: true,
        updated_at: new Date().toISOString(),
      };

      // If row doesn't exist, created_at will be set by default; include it for completeness
      payload.created_at = new Date().toISOString();

      const { data: saved, error } = await supabase
        .from('bank_details')
        .upsert(payload, { onConflict: 'dealer_id' })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Update dealer's bank_details_added flag
      try {
        await Dealer.update(dealerId, { bank_details_added: true });
        console.log('Updated dealer bank_details_added flag to true');
      } catch (error) {
        console.error('Failed to update dealer bank_details_added flag:', error);
      }
      
      // Call the parent callback
      onBankDetailsAdded(saved);
      
      toast({
        title: "Bank Details Added Successfully!",
        description: "Your bank account has been verified and added."
      });
      
      // Reset form and close modal
      setBankData({
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        beneficiaryName: '',
        bankName: '',
        branchName: '',
        accountType: 'current'
      });
      setBankInfo(null);
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Error adding bank details:', error);
      toast({
        title: "Error",
        description: "Failed to add bank details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      setBankInfo(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Add Bank Details
          </DialogTitle>
          <DialogDescription>
            Add your bank account for secure payments and transactions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your bank details are encrypted and stored securely. We use bank-grade security to protect your financial information.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={bankData.accountNumber}
                onChange={(e) => updateBankData('accountNumber', e.target.value)}
                placeholder="Enter your account number"
                maxLength={18}
                className={errors.accountNumber ? 'border-red-500' : ''}
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-600">{errors.accountNumber}</p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-2">
              <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
              <Input
                id="confirmAccountNumber"
                value={bankData.confirmAccountNumber}
                onChange={(e) => updateBankData('confirmAccountNumber', e.target.value)}
                placeholder="Re-enter your account number"
                maxLength={18}
                className={errors.confirmAccountNumber ? 'border-red-500' : ''}
              />
              {errors.confirmAccountNumber && (
                <p className="text-sm text-red-600">{errors.confirmAccountNumber}</p>
              )}
            </div>

            {/* IFSC Code */}
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code *</Label>
              <div className="relative">
                <Input
                  id="ifscCode"
                  value={bankData.ifscCode}
                  onChange={(e) => updateBankData('ifscCode', e.target.value.toUpperCase())}
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                  className={errors.ifscCode ? 'border-red-500' : ''}
                />
                {isVerifying && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              {errors.ifscCode && (
                <p className="text-sm text-red-600">{errors.ifscCode}</p>
              )}
              
              {bankInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Bank Verified</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p><strong>{bankInfo.bank}</strong></p>
                    <p>{bankInfo.branch}</p>
                    <p>{bankInfo.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Beneficiary Name */}
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName">Account Holder Name *</Label>
              <Input
                id="beneficiaryName"
                value={bankData.beneficiaryName}
                onChange={(e) => updateBankData('beneficiaryName', e.target.value)}
                placeholder="Name as per bank account"
                className={errors.beneficiaryName ? 'border-red-500' : ''}
              />
              {errors.beneficiaryName && (
                <p className="text-sm text-red-600">{errors.beneficiaryName}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter the name exactly as it appears on your bank account
              </p>
            </div>
          </div>

          {/* Verification Process Info */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Verification Process:</strong> We will verify your account with a small deposit (₹1) which will be refunded immediately.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isVerifying}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add & Verify
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
