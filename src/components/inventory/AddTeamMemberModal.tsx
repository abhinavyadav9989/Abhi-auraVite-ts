import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Building2, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield,
  CheckCircle,
  X
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  is_default?: boolean;
}

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  onSubmit: (data: TeamMemberData) => void;
  prefillBranchId?: string;
}

interface TeamMemberData {
  full_name: string;
  email: string;
  mobile_number: string;
  aadhar_number: string;
  role: string;
  branch_id: string;
  permissions: string[];
}

const ROLES = [
  { value: 'manager', label: 'Branch Manager', permissions: ['view', 'edit', 'delete', 'manage_team'] },
  { value: 'sales', label: 'Sales Executive', permissions: ['view', 'edit'] },
  { value: 'inventory', label: 'Inventory Manager', permissions: ['view', 'edit', 'manage_inventory'] },
  { value: 'staff', label: 'Staff Member', permissions: ['view'] },
];

const PERMISSIONS = [
  { value: 'view', label: 'View Vehicles' },
  { value: 'edit', label: 'Edit Vehicles' },
  { value: 'delete', label: 'Delete Vehicles' },
  { value: 'manage_inventory', label: 'Manage Inventory' },
  { value: 'manage_team', label: 'Manage Team' },
  { value: 'view_reports', label: 'View Reports' },
  { value: 'manage_branches', label: 'Manage Branches' },
];

export default function AddTeamMemberModal({ 
  isOpen, 
  onClose, 
  branches, 
  onSubmit,
  prefillBranchId
}: AddTeamMemberModalProps) {
  const [step, setStep] = useState<'branch' | 'details'>('branch');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<TeamMemberData>({
    full_name: '',
    email: '',
    mobile_number: '',
    aadhar_number: '',
    role: 'staff',
    branch_id: '',
    permissions: ['view'],
  });

  // If prefillBranchId provided, skip branch selection and preselect
  React.useEffect(() => {
    if (isOpen && prefillBranchId) {
      const branch = branches.find(b => b.id === prefillBranchId) || null;
      if (branch) {
        setSelectedBranch(branch);
        setFormData(prev => ({ ...prev, branch_id: branch.id }));
        setStep('details');
      }
    }
  }, [isOpen, prefillBranchId, branches]);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData(prev => ({ ...prev, branch_id: branch.id }));
    setStep('details');
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setStep('branch');
    setSelectedBranch(null);
    setFormData({
      full_name: '',
      email: '',
      mobile_number: '',
      aadhar_number: '',
      role: 'staff',
      branch_id: '',
      permissions: ['view'],
    });
    onClose();
  };

  const selectedRole = ROLES.find(r => r.value === formData.role);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="team-member-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Add Team Member</span>
          </DialogTitle>
          <p id="team-member-modal-description" className="text-sm text-gray-600">
            Select a branch and fill in the team member details below.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'branch' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'branch' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {step === 'branch' ? '1' : <CheckCircle className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium">Select Branch</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className={`flex items-center space-x-2 ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Member Details</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'branch' ? (
              <motion.div
                key="branch"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Branch</h3>
                  <p className="text-gray-600">Choose which branch this team member will be assigned to.</p>
                </div>

                <div className="grid gap-4">
                  {branches.map((branch) => (
                    <motion.div
                      key={branch.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer border-2 hover:border-blue-300 transition-colors"
                        onClick={() => handleBranchSelect(branch)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{branch.name}</div>
                                <div className="text-sm text-gray-600">{branch.address}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {branch.is_default && (
                                <Badge variant="secondary">Main Branch</Badge>
                              )}
                              <Button size="sm" variant="outline">
                                Select
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Selected Branch Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{selectedBranch?.name}</div>
                          <div className="text-sm text-gray-600">{selectedBranch?.address}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setStep('branch')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Details Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number *</Label>
                    <Input
                      id="mobile_number"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadhar_number">Aadhar Number</Label>
                    <Input
                      id="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, aadhar_number: e.target.value }))}
                      placeholder="Enter Aadhar number"
                      maxLength={12}
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <Label>Role & Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((role) => (
                      <motion.div
                        key={role.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer border-2 transition-colors ${
                            formData.role === role.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            role: role.value,
                            permissions: role.permissions 
                          }))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900">{role.label}</div>
                              {formData.role === role.value && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((perm) => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Custom Permissions */}
                <div className="space-y-3">
                  <Label>Custom Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map((permission) => (
                      <label key={permission.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={step === 'branch' ? handleClose : () => setStep('branch')}
            >
              {step === 'branch' ? 'Cancel' : 'Back'}
            </Button>
            
            {step === 'details' && (
              <Button onClick={handleSubmit} disabled={!formData.full_name || !formData.email || !formData.mobile_number}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
