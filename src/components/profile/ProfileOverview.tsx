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
  Award
} from 'lucide-react';

export default function ProfileOverview({ 
  dealer, 
  profileForm, 
  setProfileForm, 
  vehicles = [], 
  isEditing, 
  canEdit, 
  onFileUpload,
  uploadingDoc,
  inspectionCoverage = 0 
}) {
  const handleInputChange = (field, value) => {
    setProfileForm(prev => ({
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
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Profile Info */}
      <div className="lg:col-span-2 space-y-6">
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
                  <p className="text-slate-900 font-medium">{dealer.business_name || 'Not set'}</p>
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
                  <p className="text-slate-900 font-medium">{dealer.owner_name || 'Not set'}</p>
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
                <p className="text-slate-600">{dealer.tagline || 'No tagline set'}</p>
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
                <p className="text-slate-600">{dealer.description || 'No description available'}</p>
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
                    <p className="text-slate-900">{dealer.phone || 'Not set'}</p>
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
                  <p className="text-slate-900">{dealer.whatsapp || 'Not set'}</p>
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
                    <p className="text-slate-500">No website set</p>
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
                <p className="text-slate-900">{dealer.address || 'Address not set'}</p>
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
                  <p className="text-slate-900">{dealer.city || 'Not set'}</p>
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
                  <p className="text-slate-900">{dealer.state || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Banner Upload */}
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Cover Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  {dealer.banner_url ? (
                    <img 
                      src={dealer.banner_url} 
                      alt="Business Banner" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-500">Upload banner image</p>
                      </div>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    className="w-full"
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Live Vehicles</span>
              </div>
              <Badge variant="secondary">{vehicles.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">Inspection Coverage</span>
              </div>
              <Badge variant="secondary">{inspectionCoverage}%</Badge>
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
            <CardTitle>Trust Score</CardTitle>
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
            <p className="text-xs text-slate-600 mt-2">
              Trust indicators help other dealers feel confident about trading with you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}