import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin, CheckCircle } from 'lucide-react';
import { Dealer } from '@/api/entityAdapters';
import { supabase } from '@/api/supabaseClient';

interface BranchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealerId: string;
  onBranchAdded?: (branch: any) => void;
  onBranchUpdated?: (branch: any) => void;
  branch?: any; // when provided, modal works in edit mode
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export default function BranchSetupModal({ isOpen, onClose, onBranchAdded, onBranchUpdated, dealerId, branch }: BranchSetupModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: Log when modal props change
  useEffect(() => {
    console.log('BranchSetupModal - Props changed:', { isOpen, dealerId });
  }, [isOpen, dealerId]);
  
  const [branchData, setBranchData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    isDefault: true // First branch is always default
  });

  // Working hours per day index 0..6
  const [workingHours, setWorkingHours] = useState<Record<number, { isOpen: boolean; openTime: string; closeTime: string }>>({});

  // Initialize form in edit mode
  useEffect(() => {
    if (branch) {
      setBranchData({
        name: branch.name || '',
        city: branch.city || '',
        state: branch.state || '',
        address: branch.address || '',
        pincode: branch.pincode || '',
        phone: branch.contact_number || '',
        email: branch.email || '',
        isDefault: !!branch.is_default,
      });
      if (branch.working_hours && typeof branch.working_hours === 'object') {
        setWorkingHours(branch.working_hours);
      }
    }
  }, [branch]);

  const updateBranchData = (field: string, value: any) => {
    setBranchData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateBranchData = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!branchData.name.trim()) {
      stepErrors.name = "Branch name is required";
    }
    
    if (!branchData.city.trim()) {
      stepErrors.city = "City is required";
    }
    
    if (!branchData.state) {
      stepErrors.state = "Please select a state";
    }
    
    if (!branchData.address.trim()) {
      stepErrors.address = "Address is required";
    }
    
    if (!branchData.pincode.trim()) {
      stepErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(branchData.pincode)) {
      stepErrors.pincode = "Pincode must be 6 digits";
    }
    
    if (branchData.phone && !/^[+]?[\d\s-()]+$/.test(branchData.phone)) {
      stepErrors.phone = "Please enter a valid phone number";
    }
    
    if (branchData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(branchData.email)) {
      stepErrors.email = "Please enter a valid email address";
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBranchData()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Build payload
      const payload = {
        dealer_id: dealerId,
        name: branchData.name,
        address: branchData.address,
        city: branchData.city,
        state: branchData.state,
        contact_number: branchData.phone,
        working_hours: workingHours || {},
        is_default: branchData.isDefault,
        updated_at: new Date().toISOString(),
      } as any;

      let savedBranch: any = null;

      if (branch?.id) {
        // EDIT MODE
        const { data, error } = await supabase
          .from('branches')
          .update(payload)
          .eq('id', branch.id)
          .select()
          .single();
        if (error) throw error;
        savedBranch = data;
      } else {
        // CREATE MODE
        const { data, error } = await supabase
          .from('branches')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        savedBranch = data;
      }
      
      // If setting default, unset others for this dealer first to enforce single Main branch
      if (payload.is_default === true) {
        try {
          await supabase
            .from('branches')
            .update({ is_default: false })
            .eq('dealer_id', dealerId)
            .neq('id', savedBranch.id);
        } catch (e) {
          console.error('Failed to unset other default branches:', e);
        }
      }

      // Update dealer's branches_added flag
      try {
        await Dealer.update(dealerId, { branches_added: true });
        console.log('Updated dealer branches_added flag to true');
      } catch (error) {
        console.error('Failed to update dealer branches_added flag:', error);
      }
      
      // Call the parent callback with the actual database record
      if (branch?.id) {
        onBranchUpdated && onBranchUpdated(savedBranch);
      } else {
        onBranchAdded && onBranchAdded(savedBranch);
      }
      
      toast({
        title: "Branch Added Successfully!",
        description: `${branchData.name} has been added to your organization.`
      });
      
      // Reset form and close modal
      setBranchData({
        name: '',
        city: '',
        state: '',
        address: '',
        pincode: '',
        phone: '',
        email: '',
        isDefault: false
      });
      setWorkingHours({});
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to add branch. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  // Debug: Log render
  console.log('BranchSetupModal - Rendering with isOpen:', isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {branch?.id ? 'Edit Branch' : 'Add Branch Location'}
          </DialogTitle>
          <DialogDescription>
            {branch?.id ? 'Update your branch details and working hours' : 'Add your first branch location to start managing vehicle inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Branch Name */}
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input
                id="branchName"
                value={branchData.name}
                onChange={(e) => updateBranchData('name', e.target.value)}
                placeholder="e.g., Main Showroom, City Center Branch"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchCity">City *</Label>
                <Input
                  id="branchCity"
                  value={branchData.city}
                  onChange={(e) => updateBranchData('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchState">State *</Label>
                <Select 
                  value={branchData.state} 
                  onValueChange={(value) => updateBranchData('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="branchAddress">Address *</Label>
              <Textarea
                id="branchAddress"
                value={branchData.address}
                onChange={(e) => updateBranchData('address', e.target.value)}
                placeholder="Complete address with street, building number, landmarks"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="branchPincode">Pincode *</Label>
              <Input
                id="branchPincode"
                value={branchData.pincode}
                onChange={(e) => updateBranchData('pincode', e.target.value)}
                placeholder="400001"
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && (
                <p className="text-sm text-red-600">{errors.pincode}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchPhone">Phone (Optional)</Label>
                <Input
                  id="branchPhone"
                  value={branchData.phone}
                  onChange={(e) => updateBranchData('phone', e.target.value)}
                  placeholder="+91-9876543210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchEmail">Email (Optional)</Label>
                <Input
                  id="branchEmail"
                  type="email"
                  value={branchData.email}
                  onChange={(e) => updateBranchData('email', e.target.value)}
                  placeholder="branch@organization.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-3">
              <Label>Working Hours</Label>
              <div className="space-y-2">
                {[0,1,2,3,4,5,6].map((idx) => {
                  const dayLabels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                  const dh = (workingHours as any)[idx] || { isOpen: false, openTime: '09:00', closeTime: '18:00' };
                  return (
                    <div key={idx} className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-4 text-sm text-slate-700">{dayLabels[idx]}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          id={`open-${idx}`}
                          type="checkbox"
                          checked={!!dh.isOpen}
                          onChange={(e) => setWorkingHours((prev) => ({ ...prev, [idx]: { ...(prev as any)[idx], isOpen: e.target.checked, openTime: (dh as any).openTime || '09:00', closeTime: (dh as any).closeTime || '18:00' } }))}
                        />
                        <Label htmlFor={`open-${idx}`} className="text-sm">Open</Label>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="time"
                          value={(dh as any).openTime}
                          onChange={(e) => setWorkingHours((prev) => ({ ...prev, [idx]: { ...(prev as any)[idx], isOpen: (dh as any).isOpen, openTime: e.target.value, closeTime: (dh as any).closeTime } }))}
                          disabled={!dh.isOpen}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="time"
                          value={(dh as any).closeTime}
                          onChange={(e) => setWorkingHours((prev) => ({ ...prev, [idx]: { ...(prev as any)[idx], isOpen: (dh as any).isOpen, openTime: (dh as any).openTime, closeTime: e.target.value } }))}
                          disabled={!dh.isOpen}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Branch...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Branch
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
