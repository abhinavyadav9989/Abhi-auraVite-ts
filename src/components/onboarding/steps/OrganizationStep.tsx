import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_STATES } from '@/constants/indianStates';

interface OrganizationStepProps {
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

const OrganizationStep: React.FC<OrganizationStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const [formData, setFormData] = React.useState({
    organizationName: data.organization_details?.organizationName || data.organization?.organizationName || dealer?.name || '',
    gstin: data.organization_details?.gstin || data.organization?.gstin || '',
    pan: data.organization_details?.pan || data.organization?.pan || '',
    address: data.organization_details?.address || data.organization?.address || '',
    city: data.organization_details?.city || data.organization?.city || '',
    state: data.organization_details?.state || data.organization?.state || '',
    pincode: data.organization_details?.pincode || data.organization?.pincode || '',
    contactNumber: data.organization_details?.contactNumber || data.organization?.contactNumber || '',
    email: data.organization_details?.email || data.organization?.email || dealer?.email || ''
  });

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    const organizationData = data.organization_details || data.organization;
    if (organizationData) {
      setFormData({
        organizationName: organizationData.organizationName || dealer?.name || '',
        gstin: organizationData.gstin || '',
        pan: organizationData.pan || '',
        address: organizationData.address || '',
        city: organizationData.city || '',
        state: organizationData.state || '',
        pincode: organizationData.pincode || '',
        contactNumber: organizationData.contactNumber || '',
        email: organizationData.email || dealer?.email || ''
      });
    }
  }, [data.organization_details, data.organization, dealer]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateData({ ...data, organization_details: newFormData });
  };

  const handleSubmit = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Organization Details</h2>
        <p className="text-slate-600 mt-2">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            placeholder="Enter organization name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN</Label>
          <Input
            id="gstin"
            value={formData.gstin}
            onChange={(e) => handleInputChange('gstin', e.target.value)}
            placeholder="Enter GSTIN (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pan">PAN Number *</Label>
          <Input
            id="pan"
            value={formData.pan}
            onChange={(e) => handleInputChange('pan', e.target.value)}
            placeholder="Enter PAN number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number *</Label>
          <Input
            id="contactNumber"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            placeholder="Enter contact number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="Enter pincode"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter complete address"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state} onValueChange={(v) => handleInputChange('state', v)}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationStep;
