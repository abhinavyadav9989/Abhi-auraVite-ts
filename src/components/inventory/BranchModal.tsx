import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_STATES } from '@/constants/indianStates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  X
} from 'lucide-react';

interface Branch {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contact_number: string;
  working_hours?: any;
  manager_id?: string | undefined;
  is_default?: boolean;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onSubmit: (data: Branch) => void;
  isEdit?: boolean;
}

export default function BranchModal({ 
  isOpen, 
  onClose, 
  branch, 
  onSubmit, 
  isEdit = false 
}: BranchModalProps) {
  const [formData, setFormData] = useState<Branch>({
    name: '',
    address: '',
    city: '',
    state: '',
    contact_number: '',
    working_hours: {},
    manager_id: undefined,
    is_default: false,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (branch && isEdit) {
      setFormData(branch);
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        contact_number: '',
        working_hours: {},
        manager_id: undefined,
        is_default: false,
      });
    }
    setErrors({});
  }, [branch, isEdit, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    }

    // City and state are optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      contact_number: '',
      working_hours: {},
      manager_id: undefined,
      is_default: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="branch-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>{isEdit ? 'Edit Branch' : 'Add New Branch'}</span>
          </DialogTitle>
          <p id="branch-modal-description" className="text-sm text-gray-600">
            {isEdit ? 'Update your branch information below.' : 'Fill in the details to create a new branch.'}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Branch Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter branch name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number *</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  placeholder="Enter contact number"
                  className={errors.contact_number ? 'border-red-500' : ''}
                />
                {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData(prev => ({ ...prev, state: v }))}>
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

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter complete address"
                rows={3}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
          </div>

          {/* Default Branch Option */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>Set as Main Branch</span>
            </Label>
            <p className="text-sm text-gray-600">
              The main branch will be highlighted and used as the default location for new vehicles.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'Update Branch' : 'Create Branch'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
