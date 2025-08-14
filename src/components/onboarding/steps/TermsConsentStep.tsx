import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';

interface TermsConsentStepProps {
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

const TermsConsentStep: React.FC<TermsConsentStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const [consents, setConsents] = useState({
    terms: data.consent?.terms || false,
    privacy: data.consent?.privacy || false,
    marketing: data.consent?.marketing || false,
    dataSharing: data.consent?.dataSharing || false,
    kyc: data.consent?.kyc || false
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (data.consent) {
      setConsents({
        terms: data.consent.terms || false,
        privacy: data.consent.privacy || false,
        marketing: data.consent.marketing || false,
        dataSharing: data.consent.dataSharing || false,
        kyc: data.consent.kyc || false
      });
    }
  }, [data.consent]);

  const handleConsentChange = (key: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const consentData = {
      ...consents,
      timestamp: new Date().toISOString(),
      ipAddress: 'captured-on-server',
      userAgent: navigator.userAgent
    };

    updateData({ ...data, consent: consentData });
    onNext(consentData);
  };

  const allRequiredConsentsAccepted = consents.terms && consents.privacy && consents.kyc;

  const termsText = `
    TERMS OF SERVICE

    1. ACCEPTANCE OF TERMS
    By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.

    2. USE LICENSE
    Permission is granted to temporarily download one copy of the materials (information or software) on this platform for personal, non-commercial transitory viewing only.

    3. DISCLAIMER
    The materials on this platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

    4. LIMITATIONS
    In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this platform.

    5. ACCURACY OF MATERIALS
    The materials appearing on this platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on this platform are accurate, complete or current.

    6. LINKS
    We have not reviewed all of the sites linked to this platform and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site.

    7. MODIFICATIONS
    We may revise these terms of service for this platform at any time without notice. By using this platform you are agreeing to be bound by the then current version of these Terms of Service.

    8. GOVERNING LAW
    These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
  `;

  const privacyText = `
    PRIVACY POLICY

    1. INFORMATION WE COLLECT
    We collect information you provide directly to us, such as when you create an account, complete your profile, or contact us for support.

    2. HOW WE USE YOUR INFORMATION
    We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.

    3. INFORMATION SHARING
    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

    4. DATA SECURITY
    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

    5. COOKIES AND TRACKING
    We use cookies and similar tracking technologies to track activity on our service and hold certain information.

    6. THIRD-PARTY SERVICES
    We may use third-party service providers to help us operate our business and the service or administer activities on our behalf.

    7. CHILDREN'S PRIVACY
    Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.

    8. CHANGES TO THIS POLICY
    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

    9. CONTACT US
    If you have any questions about this Privacy Policy, please contact us.
  `;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Terms & Consent</h2>
        <p className="text-slate-600 mt-2">
          Please review and accept our terms and privacy policy
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You must accept the required consents to continue with your registration.
        </AlertDescription>
      </Alert>

      {/* Required Consents */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Consents</h3>
          
          <div className="space-y-4">
            {/* Terms of Service */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={consents.terms}
                onCheckedChange={(checked) => handleConsentChange('terms', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm font-medium text-slate-900 cursor-pointer">
                  I accept the Terms of Service
                </label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    {showTerms ? 'Hide Terms' : 'View Terms'}
                  </Button>
                </div>
                {showTerms && (
                  <div className="h-64 w-full mt-2 p-4 border rounded-md bg-slate-50 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">{termsText}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={consents.privacy}
                onCheckedChange={(checked) => handleConsentChange('privacy', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="privacy" className="text-sm font-medium text-slate-900 cursor-pointer">
                  I accept the Privacy Policy
                </label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                  >
                    {showPrivacy ? 'Hide Privacy Policy' : 'View Privacy Policy'}
                  </Button>
                </div>
                {showPrivacy && (
                  <div className="h-64 w-full mt-2 p-4 border rounded-md bg-slate-50 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">{privacyText}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="kyc"
                checked={consents.kyc}
                onCheckedChange={(checked) => handleConsentChange('kyc', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="kyc" className="text-sm font-medium text-slate-900 cursor-pointer">
                  I consent to KYC verification and document processing
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  You agree to provide accurate information and documents for verification purposes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Consents */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Optional Consents</h3>
          
          <div className="space-y-4">
            {/* Marketing Communications */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={consents.marketing}
                onCheckedChange={(checked) => handleConsentChange('marketing', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="marketing" className="text-sm font-medium text-slate-900 cursor-pointer">
                  I agree to receive marketing communications
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  Receive updates about new features, promotions, and industry insights.
                </p>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataSharing"
                checked={consents.dataSharing}
                onCheckedChange={(checked) => handleConsentChange('dataSharing', checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="dataSharing" className="text-sm font-medium text-slate-900 cursor-pointer">
                  I agree to share data with trusted partners
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  Allow sharing of non-personal data with trusted partners for service improvement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Summary */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Consent Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {consents.terms ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-red-300 rounded-full" />
              )}
              <span className="text-sm">Terms of Service</span>
            </div>
            <div className="flex items-center space-x-2">
              {consents.privacy ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-red-300 rounded-full" />
              )}
              <span className="text-sm">Privacy Policy</span>
            </div>
            <div className="flex items-center space-x-2">
              {consents.kyc ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-red-300 rounded-full" />
              )}
              <span className="text-sm">KYC Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              {consents.marketing ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
              )}
              <span className="text-sm">Marketing Communications (Optional)</span>
            </div>
            <div className="flex items-center space-x-2">
              {consents.dataSharing ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
              )}
              <span className="text-sm">Data Sharing (Optional)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isSaving || !allRequiredConsentsAccepted}
          className={!allRequiredConsentsAccepted ? 'opacity-50' : ''}
        >
          {isSaving ? 'Saving...' : 'Complete Onboarding'}
        </Button>
      </div>

      {!allRequiredConsentsAccepted && (
        <p className="text-sm text-red-600 text-center">
          Please accept all required consents to continue.
        </p>
      )}
    </div>
  );
};

export default TermsConsentStep;
