import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, Mail, Phone, FileText, CreditCard, 
  Info, CheckCircle, AlertTriangle, Loader2 
} from 'lucide-react';
import InfoTooltip from '../ui/InfoTooltip';

// TypeScript interfaces for the form data
interface BasicDetailsData {
  organizationName?: string;
  ownerName?: string;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  isGSTRegistered?: boolean;
  gstin?: string;
  panNumber?: string;
  businessAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface BasicDetailsFormProps {
  data: BasicDetailsData;
  updateData: (updates: Partial<BasicDetailsData>) => void;
}

export default function BasicDetailsForm({ data, updateData }: BasicDetailsFormProps) {
  const [gstinLookupLoading, setGstinLookupLoading] = useState(false);
  const [gstinVerified, setGstinVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Real-time validation
  useEffect(() => {
    validateFields();
  }, [data.organizationName, data.ownerName, data.email, data.contactNumber, data.gstin, data.panNumber]);

  const validateFields = () => {
    const errors: Record<string, string> = {};
    
    // Organization name validation
    if (data.organizationName && data.organizationName.trim().length < 2) {
      errors.organizationName = 'Organization name must be at least 2 characters long';
    }
    
    // Owner name validation
    if (data.ownerName && data.ownerName.trim().length < 2) {
      errors.ownerName = 'Owner name must be at least 2 characters long';
    }
    
    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (data.contactNumber && !/^[6-9]\d{9}$/.test(data.contactNumber)) {
      errors.contactNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    // GSTIN validation
    if (data.isGSTRegistered && data.gstin) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstin)) {
        errors.gstin = 'Please enter a valid 15-character GSTIN';
      }
    }
    
    // PAN validation
    if (data.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
      errors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }
    
    setValidationErrors(errors);
  };

  const handleGSTINLookup = async (gstin: string) => {
    if (!gstin || gstin.length !== 15) return;
    
    setGstinLookupLoading(true);
    setGstinVerified(false);
    
    try {
      // Mock GSTIN API lookup - in real app would call GST API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const mockData = {
        organizationName: "Sample Motors Pvt Ltd",
        panNumber: gstin.substring(2, 12)
      };
      
      updateData({
        ...mockData,
        gstin
      });
      
      setGstinVerified(true);
      
    } catch (error) {
      console.error('GSTIN lookup error:', error);
    } finally {
      setGstinLookupLoading(false);
    }
  };

  const handleInputChange = (field: keyof BasicDetailsData, value: string | boolean) => {
    updateData({ [field]: value });
    
    // Auto-lookup GSTIN when complete
    if (field === 'gstin' && typeof value === 'string' && value.length === 15) {
      handleGSTINLookup(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Business Details</h2>
        <p className="text-slate-600">
          Tell us about your organization so we can set up your account properly.
        </p>
      </div>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="flex items-center gap-1">
                Organization Name *
                <InfoTooltip>
                  This will be displayed to other dealers and customers on the platform.
                </InfoTooltip>
              </Label>
              <Input
                id="organizationName"
                value={data.organizationName || ''}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Enter your business/organization name"
                className={validationErrors.organizationName ? 'border-red-300' : ''}
              />
              {validationErrors.organizationName && (
                <p className="text-sm text-red-600">{validationErrors.organizationName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName" className="flex items-center gap-1">
                Owner Name *
                <InfoTooltip>
                  The name of the business owner/proprietor.
                </InfoTooltip>
              </Label>
              <Input
                id="ownerName"
                value={data.ownerName || data.fullName || ''}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder="Enter owner name"
                className={validationErrors.ownerName ? 'border-red-300' : ''}
              />
              {validationErrors.ownerName && (
                <p className="text-sm text-red-600">{validationErrors.ownerName}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email Address *
                <InfoTooltip>
                  This email will be used for important account notifications and communications.
                </InfoTooltip>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`pl-10 ${validationErrors.email ? 'border-red-300' : ''}`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="flex items-center gap-1">
                Contact Number *
                <InfoTooltip>
                  Primary contact number for business communications and OTP verification.
                </InfoTooltip>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="contactNumber"
                  value={data.contactNumber || ''}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`pl-10 ${validationErrors.contactNumber ? 'border-red-300' : ''}`}
                />
              </div>
              {validationErrors.contactNumber && (
                <p className="text-sm text-red-600">{validationErrors.contactNumber}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GST Registration Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                GST Registered Business
                <InfoTooltip>
                  Enable this if your business is registered under GST. This helps with tax calculations and compliance.
                </InfoTooltip>
              </Label>
              <p className="text-sm text-slate-600">
                Are you registered for Goods & Services Tax?
              </p>
            </div>
                         <Switch
               checked={data.isGSTRegistered || false}
               onCheckedChange={(checked) => {
                 updateData({ 
                   isGSTRegistered: checked,
                   ...((!checked && { gstin: '' }))
                 });
               }}
             />
          </div>

          {/* GSTIN Field */}
          {data.isGSTRegistered && (
            <div className="space-y-2">
              <Label htmlFor="gstin" className="flex items-center gap-1">
                GSTIN *
                <InfoTooltip>
                   15-character GST identification number. We&apos;ll auto-verify this and fetch your business details.
                </InfoTooltip>
              </Label>
              <div className="relative">
                <Input
                  id="gstin"
                  value={data.gstin || ''}
                  onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                  placeholder="15-character GSTIN (e.g., 22AAAAA0000A1Z5)"
                  maxLength={15}
                  className={`${validationErrors.gstin ? 'border-red-300' : gstinVerified ? 'border-green-300' : ''}`}
                />
                {gstinLookupLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                )}
                {gstinVerified && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                )}
              </div>
              {validationErrors.gstin && (
                <p className="text-sm text-red-600">{validationErrors.gstin}</p>
              )}
              {gstinLookupLoading && (
                <p className="text-sm text-blue-600">Verifying GSTIN and fetching business details...</p>
              )}
              {gstinVerified && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    GSTIN verified successfully! Business details have been auto-filled.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* PAN Number */}
          <div className="space-y-2">
            <Label htmlFor="panNumber" className="flex items-center gap-1">
              PAN Number *
              <InfoTooltip>
                Permanent Account Number for tax identification. Required for all business transactions.
              </InfoTooltip>
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="panNumber"
                value={data.panNumber || ''}
                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                placeholder="10-character PAN (e.g., ABCDE1234F)"
                maxLength={10}
                className={`pl-10 ${validationErrors.panNumber ? 'border-red-300' : ''}`}
              />
            </div>
            {validationErrors.panNumber && (
              <p className="text-sm text-red-600">{validationErrors.panNumber}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Why do we need this information?</strong> This helps us:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verify your business identity and build trust with other dealers</li>
            <li>Enable tax-compliant transactions and invoicing</li>
            <li>Provide better customer support and account management</li>
            <li>Comply with regulatory requirements for automotive trade</li>
          </ul>
        </AlertDescription>
      </Alert>

             {/* Validation Summary */}
       {Object.keys(validationErrors).length > 0 && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertDescription>
             Please fix the following errors before proceeding:
             <ul className="list-disc list-inside mt-2">
               {Object.values(validationErrors).map((error: string, index: number) => (
                 <li key={index}>{error}</li>
               ))}
             </ul>
           </AlertDescription>
         </Alert>
       )}
    </div>
  );
}