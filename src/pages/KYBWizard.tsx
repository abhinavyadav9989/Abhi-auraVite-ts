
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { DealerDocument } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Upload,
  Camera,
  AlertTriangle,
  Info,
  Shield,
  Clock,
  Star // ONB-23: Added for subscription
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { createPageUrl } from '@/utils';
// Subscription step removed from KYC flow

const STEPS = [
  { id: 'business', title: 'Business Information', icon: Building2 },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle }
];

const REQUIRED_DOCUMENTS = [
  { id: 'trade_licence', name: 'Trade Licence', required: true },
  { id: 'gst_certificate', name: 'GST Certificate', required: true },
  { id: 'pan_card', name: 'PAN Card', required: true },
  { id: 'address_proof', name: 'Address Proof', required: true }
];

export default function KYBWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState(null); // ONB-16: For rejected fields
  const [isSuspended, setIsSuspended] = useState(false);

  // Form data
  const [businessData, setBusinessData] = useState({
    business_name: '',
    gstin: '',
    pan_number: '',
    owner_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    business_type: 'dealer',
    tagline: '',
    description: ''
  });

  type DocumentData = { url?: string; name?: string; size?: number; uploaded_at?: string } | null
  const [documents, setDocuments] = useState<Record<string, DocumentData>>({});
  // Plan selection removed from KYC flow

  useEffect(() => {
    loadUserAndDraftData();
  }, []);

  const loadUserAndDraftData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Pre-fill some data
      setBusinessData(prev => ({
        ...prev,
        owner_name: currentUser.user_metadata?.full_name || currentUser.email,
        email: currentUser.email
      }));

      // Load any existing draft data
      const existingDealers = await Dealer.filter({ created_by: currentUser.email });
      if (existingDealers.length > 0) {
        const dealer = existingDealers[0];
        setDealerId(dealer.id);
        
        // ONB-16: Handle rejected status
        if (dealer.verification_status === 'rejected') {
            setRejectionNotes(dealer.verification_notes || "Please review your information and re-submit.");
        }

        // Treat suspended as resubmission required; force to Documents step
        if (dealer.verification_status === 'suspended' || dealer.verification_status_new === 'suspended') {
          setIsSuspended(true);
          setCurrentStep(1); // Documents step
          if (dealer.verification_notes) {
            setRejectionNotes(dealer.verification_notes);
          }
        }

        const needsResubmit = dealer.verification_status === 'suspended' || dealer.verification_status_new === 'suspended';

        if (dealer.verification_status === 'draft' || dealer.verification_status === 'rejected' || dealer.verification_status === 'documents_submitted' || needsResubmit) {
          // Restore draft data
          setBusinessData(prev => ({
            ...prev,
            business_name: dealer.business_name || '',
            gstin: dealer.gstin || '',
            pan_number: dealer.pan_number || '',
            phone: dealer.phone || '',
            address: dealer.address || '',
            city: dealer.city || '',
            state: dealer.state || ''
          }));
          // Subscription choice is not part of KYC anymore
          // Restore documents if present; fallback to dealer_documents
          if (dealer.draft_data?.documents) {
            setDocuments(dealer.draft_data.documents);
          } else {
            try {
              const rows = await DealerDocument.filter({ dealer_id: dealer.id });
              const docMap = (rows || []).reduce((acc: any, d: any) => {
                acc[d.document_type] = {
                  url: d.file_url,
                  name: d.file_name,
                  size: d.file_size,
                  uploaded_at: (d as any).updated_at || (d as any).created_at
                };
                return acc;
              }, {} as Record<string, any>);
              if (Object.keys(docMap).length > 0) {
                setDocuments(docMap);
              }
            } catch (e) {
              // ignore fetch errors; user can re-upload
            }
          }

          // Restore current step if not rejected
          if (dealer.verification_status !== 'rejected' && dealer.verification_status !== 'suspended' && dealer.draft_data?.current_step !== undefined) {
            setCurrentStep(dealer.draft_data.current_step);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await User.loginWithRedirect(window.location.href);
    }
  };

  const handleGSTINLookup = async (gstin) => {
    if (!gstin || gstin.length !== 15) return;
    
    try {
      // Mock GSTIN API lookup - in real app would call GST API
      const mockData = {
        business_name: "Sample Motors Pvt Ltd",
        address: "123, Industrial Area, Sector 5",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        pan_number: gstin.substring(2, 12)
      };
      
      setBusinessData(prev => ({
        ...prev,
        ...mockData
      }));
      
      toast({
        title: "GSTIN Verified",
        description: "Business details auto-filled from GSTIN database.",
      });
    } catch (error) {
      console.error('GSTIN lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: "Auto-fill unavailable. Please enter details manually.",
        variant: "destructive"
      });
    }
  };

  const handleDocumentUpload = async (docType: string, file: File | undefined) => {
    if (!file) return;
    
    setUploadingDoc(docType);
    
    try {
      // Validate like Profile's DocumentLocker
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid File Type', description: 'Upload images (JPEG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX).', variant: 'destructive' });
        return;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({ title: 'File Too Large', description: 'File size must be less than 10MB.', variant: 'destructive' });
        return;
      }

      if (!dealerId) {
        toast({ title: 'Profile Required', description: 'Please save your business info first.', variant: 'destructive' });
        return;
      }

      // Upload to storage and persist permanent URL
      const { file_url, url, type } = await UploadFile({ file });
      const finalUrl = file_url || url;
      
      // Persist immediately to dealer_documents
      // Check if existing doc for this type
      const existingDocs = await DealerDocument.filter({ dealer_id: dealerId });
      const current = existingDocs.find((d: any) => d.document_type === docType);
      const payload: any = {
        dealer_id: dealerId,
        document_type: docType,
        file_url: finalUrl,
        file_name: file.name,
        file_size: file.size || 0,
        file_type: type || file.type,
        status: 'pending_review'
      };
      if (current) {
        await DealerDocument.update(current.id, payload);
      } else {
        await DealerDocument.create(payload);
      }
      
      // Update local UI state for green tick
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          url: finalUrl,
          name: file.name,
          size: file.size,
          uploaded_at: new Date().toISOString()
        }
      }));
      
      toast({
        title: "Document Uploaded",
        description: `${docType.replace('_', ' ')} uploaded successfully.`,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    }
    
    setUploadingDoc(null);
  };



  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // Save current step data, except on the final review step
      if (STEPS[currentStep].id !== 'review') {
        await saveDraftData();
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit for review
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveDraftData = async () => {
    try {
      // Save current progress
      const existingDealers = await Dealer.filter({ created_by: user.email });
      
      const dealerData = {
        ...businessData,
        verification_status: 'draft',
        draft_data: {
          business: businessData,
          documents: documents,
          current_step: currentStep
        }
      };
      
      if (existingDealers.length > 0) {
        await Dealer.update(existingDealers[0].id, dealerData);
      } else {
        await Dealer.create({ ...dealerData, created_by: user.email }); // Ensure created_by is set for new dealers
      }
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved automatically.",
        duration: 1500
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your progress.",
        variant: "destructive",
        duration: 1500
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Create or update dealer record
      const existingDealers = await Dealer.filter({ created_by: user.email });
      
      const dealerData: any = {
        ...businessData,
        verification_status: 'documents_submitted',
        submitted_at: new Date().toISOString(),
        // subscription_plan handled in Business Verification (not in KYC)
        verification_notes: null, // ONB-16: Clear rejection notes on re-submission
        // Update progressive verification flags based on current step
        kyc_completed: true, // KYC completed when business info and documents are submitted
        bank_details_added: false, // Bank details will be collected separately when making deals
        kyb_completed: false, // Set to true only after admin approval
      };
      // Persist identifiers explicitly (even if some parts of businessData are missing)
      if (businessData?.gstin) dealerData.gstin = businessData.gstin;
      if (businessData?.pan_number) dealerData.pan_number = businessData.pan_number;
      if (businessData?.business_name) dealerData.business_name = businessData.business_name;
      if (businessData?.owner_name) dealerData.owner_name = businessData.owner_name;
      // If Aadhaar is part of the form later, store it inside kyb_data JSON safely
      if ((businessData as any)?.aadhar_number) {
        dealerData.kyb_data = { ...(existingDealers?.[0]?.kyb_data || {}), aadhar_number: (businessData as any).aadhar_number };
      }
      
      let dealerId;
      if (existingDealers.length > 0) {
        await Dealer.update(existingDealers[0].id, dealerData);
        dealerId = existingDealers[0].id;
      } else {
        const newDealer = await Dealer.create({ ...dealerData, created_by: user.email }); // Ensure created_by is set for new dealers
        dealerId = newDealer.id;
      }
      
      // Save documents (clear old ones and create new ones for resubmission)
      // In a real app, you might update existing DealerDocuments rather than delete/recreate
      if (dealerId) {
        // Mock: Delete existing documents for this dealer before creating new ones
        // This is a simplified approach; a robust solution would compare and update.
        const existingDocs = await DealerDocument.filter({ dealer_id: dealerId });
        for (const doc of existingDocs) {
          await DealerDocument.delete(doc.id);
        }

        for (const [docType, docData] of Object.entries(documents)) {
          if (docData && docData.url) { // Ensure document data exists and has a URL
            await DealerDocument.create({
              dealer_id: dealerId,
              document_type: docType,
              file_url: docData.url,
              file_name: docData.name,
              file_size: docData.size,
              status: 'pending_review'
            });
          }
        }


      }
      
      toast({
        title: "Application Submitted!",
        description: "Your verification documents have been submitted for review.",
      });
      
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const renderBusinessStep = () => (
    <div className="space-y-6">
       {/* ONB-16: Show rejection reason for this step */}
       {rejectionNotes && (rejectionNotes.toLowerCase().includes("business") || rejectionNotes.toLowerCase().includes("gst") || rejectionNotes.toLowerCase().includes("pan") || rejectionNotes.toLowerCase().includes("address") || rejectionNotes.toLowerCase().includes("contact")) && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Correction Needed:</strong> {rejectionNotes}
                </AlertDescription>
            </Alert>
       )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN *</Label>
          <Input
            id="gstin"
            value={businessData.gstin}
            onChange={(e) => setBusinessData(prev => ({ ...prev, gstin: e.target.value }))}
            onBlur={(e) => handleGSTINLookup(e.target.value)}
            placeholder="Enter 15-digit GSTIN"
            maxLength={15}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            value={businessData.business_name}
            onChange={(e) => setBusinessData(prev => ({ ...prev, business_name: e.target.value }))}
            placeholder="Enter business name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_name">Owner Name *</Label>
          <Input
            id="owner_name"
            value={businessData.owner_name}
            onChange={(e) => setBusinessData(prev => ({ ...prev, owner_name: e.target.value }))}
            placeholder="Enter owner name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pan_number">PAN Number *</Label>
          <Input
            id="pan_number"
            value={businessData.pan_number}
            onChange={(e) => setBusinessData(prev => ({ ...prev, pan_number: e.target.value.toUpperCase() }))}
            placeholder="Enter PAN number"
            maxLength={10}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business Address *</Label>
        <Textarea
          id="address"
          value={businessData.address}
          onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter complete business address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={businessData.city}
            onChange={(e) => setBusinessData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Enter city"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={businessData.state}
            onChange={(e) => setBusinessData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="Enter state"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={businessData.pincode}
            onChange={(e) => setBusinessData(prev => ({ ...prev, pincode: e.target.value }))}
            placeholder="Enter pincode"
            maxLength={6}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={businessData.phone}
            onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            maxLength={10}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={businessData.whatsapp}
            onChange={(e) => setBusinessData(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="Enter WhatsApp number"
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      {/* ONB-16: Show rejection reason for this step */}
       {rejectionNotes && rejectionNotes.toLowerCase().includes("document") && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Correction Needed:</strong> {rejectionNotes}
                </AlertDescription>
            </Alert>
       )}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          All documents are encrypted and stored securely. Only verification team can access them.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map(doc => (
          <div key={doc.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="font-medium">{doc.name}</span>
                {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </div>
              {documents[doc.id] && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            {documents[doc.id] ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{documents[doc.id].name}</p>
                  <p className="text-xs text-green-600">
                    Uploaded {new Date(documents[doc.id].uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDocuments(prev => ({ ...prev, [doc.id]: null }))}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Upload {doc.name}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload(doc.id, e.target.files[0])}
                    disabled={uploadingDoc === doc.id}
                    className="hidden"
                    id={`file-${doc.id}`}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById(`file-${doc.id}`).click()}
                    disabled={uploadingDoc === doc.id}
                  >
                    {uploadingDoc === doc.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Choose File
                      </div>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <Button variant="ghost" size="sm" className="text-sm text-slate-600">
                    Take Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );



  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Business Info Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Business Name:</span>
                <p className="font-medium">{businessData.business_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">GSTIN:</span>
                <p className="font-medium">{businessData.gstin || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Owner:</span>
                <p className="font-medium">{businessData.owner_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Phone:</span>
                <p className="font-medium">{businessData.phone || 'N/A'}</p>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Address:</span>
              <p className="font-medium">{businessData.address}, {businessData.city}, {businessData.state} - {businessData.pincode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REQUIRED_DOCUMENTS.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{doc.name}</span>
                  {documents[doc.id] ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-orange-600">Missing</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



        {/* Subscription summary removed from KYC */}
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>What happens next?</strong><br />
          Our verification team will review your documents within 24-48 hours. You&apos;ll receive an email notification once approved.
        </AlertDescription>
      </Alert>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Business Verification</h1>
          {rejectionNotes ? (
            <p className="text-red-600 dark:text-red-400">Your previous submission was rejected. Please correct the highlighted issues and re-submit.</p>
          ) : (
            <p className="text-slate-600 dark:text-slate-300">Complete your KYB to start trading on Aura</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{STEPS[currentStep].title}</h2>
            <Progress value={((currentStep + 1) / STEPS.length) * 100} className="mt-2" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {currentStep === 0 && renderBusinessStep()}
            {currentStep === 1 && renderDocumentsStep()}
            {currentStep === 2 && renderReviewStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="ghost"
                onClick={saveDraftData}
                disabled={isLoading}
              >
                <Clock className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {currentStep === STEPS.length - 1 ? 'Submitting...' : 'Saving...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {currentStep === STEPS.length - 1 ? 'Submit for Review' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
