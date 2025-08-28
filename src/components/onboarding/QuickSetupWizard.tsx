
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, ArrowRight, SkipForward, Zap, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function QuickSetupWizard({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [formData, setFormData] = useState<any>({
    business_name: '',
    owner_name: '',
    phone: '',
    whatsapp: '',
    gstin: '',
    pan_number: '',
    address: '',
    city: '',
    state: '',
    documents: {}
  });

  const { toast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.business_name || formData.owner_name || formData.phone) {
        autoSave();
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('aura-wizard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  const autoSave = async () => {
    setIsAutoSaving(true);
    toast({
      title: "Auto-saving...",
      description: "Your progress is being saved.",
    });
    
    // Simulate auto-save to localStorage (demo purposes)
    localStorage.setItem('aura-wizard-data', JSON.stringify(formData));
    
    // Simulate server save delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsAutoSaving(false);
    setLastSaved(new Date());
    toast({
      title: "✓ Progress Saved",
      description: `Your draft was saved at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // OCR simulation with demo badge
  const simulateOCR = async (field) => {
    const mockData = {
      gstin: '27AAAAA0000A1Z5',
      pan_number: 'AAAAA0000A',
      owner_name: 'Demo Business Owner'
    };

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFormData(prev => ({
      ...prev,
      [field]: mockData[field] || 'Auto-filled value',
      [`${field}_ocr`]: true // Flag for OCR badge
    }));
  };

  const handleSkipDocuments = () => {
    onSkip?.();
  };

  const handleComplete = async () => {
    await autoSave();
    localStorage.removeItem('aura-wizard-data'); // Clear saved data
    onComplete?.(formData);
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Quick Setup</h2>
              <p className="text-sm text-slate-600">Get your dealer account ready in under 5 minutes</p>
            </div>
            <div className="flex items-center gap-2">
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Save className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !isAutoSaving && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Last saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Your dealership name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name *</Label>
                <div className="relative">
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    placeholder="Business owner name"
                  />
                  {(formData as any).owner_name_ocr && (
                    <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-filled by OCR (demo)
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => simulateOCR('owner_name')}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  OCR Fill (Demo)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!formData.business_name || !formData.owner_name || !formData.phone}
              >
                Next: Business Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <div className="relative">
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                    placeholder="27AAAAA0000A1Z5"
                  />
                  {(formData as any).gstin_ocr && (
                    <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-filled by OCR (demo)
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => simulateOCR('gstin')}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  OCR Fill (Demo)
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number *</Label>
                <div className="relative">
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value)}
                    placeholder="AAAAA0000A"
                  />
                  {(formData as any).pan_number_ocr && (
                    <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-filled by OCR (demo)
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => simulateOCR('pan_number')}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  OCR Fill (Demo)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Complete business address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="kolkata">Kolkata</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="west-bengal">West Bengal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!formData.gstin || !formData.pan_number || !formData.address || !formData.city || !formData.state}
              >
                Next: Documents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Docs encrypted – only admins can view.</h3>
                  <p className="text-sm text-blue-700">Your documents are secured with bank-level encryption and are only accessible to verified Aura administrators for KYB verification purposes.</p>
                </div>
              </div>
            </div>

            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Document Upload Coming Soon</h3>
              <p className="text-slate-600 mb-6">You can complete document verification later from your profile.</p>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Previous
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSkipDocuments}
                  className="gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip for Now
                </Button>
                <Button 
                  onClick={handleComplete}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
