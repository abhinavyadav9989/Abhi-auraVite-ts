import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Upload,
  Camera,
  Car,
  Shield,
  Award,
  CreditCard,
  Save
} from 'lucide-react';

export default function ProfileOverview({ 
  dealer, 
  profileForm, 
  setProfileForm, 
  bankData,
  setBankData,
  vehicles = [], 
  isEditing, 
  canEdit, 
  onFileUpload,
  onBankDataUpdate,
  uploadingDoc,
  inspectionCoverage = 0 
}) {
  const handleInputChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankDataChange = (field, value) => {
    setBankData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!dealer) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-slate-500">Loading dealer information...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Main Profile Info */}
      <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-1 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                {isEditing ? (
                  <Input
                    id="business_name"
                    value={profileForm.business_name || ''}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">{dealer.business_name || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                {isEditing ? (
                  <Input
                    id="owner_name"
                    value={profileForm.owner_name || ''}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">{dealer.owner_name || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              {isEditing ? (
                <Input
                  id="tagline"
                  value={profileForm.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="e.g., Your trusted car partner"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-300">{dealer.tagline || 'No tagline set'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Business</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={profileForm.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Tell customers about your dealership..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-300">{dealer.description || 'No description available'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileForm.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <p className="text-slate-900 dark:text-white">{dealer.phone || 'Not set'}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                {isEditing ? (
                  <Input
                    id="whatsapp"
                    value={profileForm.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{dealer.whatsapp || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={profileForm.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  {dealer.website ? (
                    <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {dealer.website}
                    </a>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No website set</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={profileForm.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-slate-900 dark:text-white">{dealer.address || 'Address not set'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={profileForm.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{dealer.city || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={profileForm.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{dealer.state || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                {isEditing ? (
                  <Input
                    id="account_holder_name"
                    value={bankData?.account_holder_name || ''}
                    onChange={(e) => handleBankDataChange('account_holder_name', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{bankData?.account_holder_name || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                {isEditing ? (
                  <Input
                    id="account_number"
                    value={bankData?.account_number || ''}
                    onChange={(e) => handleBankDataChange('account_number', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{bankData?.account_number || 'Not set'}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                {isEditing ? (
                  <Input
                    id="ifsc_code"
                    value={bankData?.ifsc_code || ''}
                    onChange={(e) => handleBankDataChange('ifsc_code', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{bankData?.ifsc_code || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                {isEditing ? (
                  <Input
                    id="bank_name"
                    value={bankData?.bank_name || ''}
                    onChange={(e) => handleBankDataChange('bank_name', e.target.value)}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{bankData?.bank_name || 'Not set'}</p>
                )}
              </div>
            </div>
            {isEditing && onBankDataUpdate && (
              <Button 
                onClick={onBankDataUpdate}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Bank Details
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:space-y-6 order-2 lg:order-2 lg:border-l lg:border-slate-200 dark:lg:border-slate-700 lg:pl-6">
        {/* Debug: Sidebar Content */}
        <div className="lg:hidden text-xs text-slate-500 dark:text-slate-400 mb-2">
          Sidebar Content (Mobile View)
        </div>
        
        {/* Banner Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                {dealer.banner_url ? (
                  <img 
                    src={dealer.banner_url} 
                    alt="Business Banner" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p className="text-xs text-slate-500">Upload banner image</p>
                    </div>
                  </div>
                )}
              </div>
              {canEdit && (
                <label className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    disabled={uploadingDoc === 'banner'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingDoc === 'banner' ? 'Uploading...' : 'Upload Banner'}
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload(file, 'banner');
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Live Vehicles</span>
              </div>
              <Badge variant="secondary" className="text-xs">{vehicles.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">Inspection Coverage</span>
              </div>
              <Badge variant="secondary" className="text-xs">{inspectionCoverage}%</Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Profile Completion</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trust Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Verified Business</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">KYB Completed</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Trust indicators help other dealers feel confident about trading with you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}