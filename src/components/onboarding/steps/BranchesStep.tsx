import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Clock } from 'lucide-react';

interface BranchesStepProps {
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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const TIME_OPTIONS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

const BranchesStep: React.FC<BranchesStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  onSkip,
  isSaving,
  dealer
}) => {
  const [branches, setBranches] = React.useState(Array.isArray(data.branches) ? data.branches : []);

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (Array.isArray(data.branches)) {
      setBranches(data.branches);
    }
  }, [data.branches]);

  const addBranch = () => {
    const newBranch = {
      id: Date.now(),
      name: '',
      address: '',
      city: '',
      state: '',
      contactNumber: '',
      workingHours: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day.value] = {
          isOpen: day.value >= 1 && day.value <= 6, // Monday to Saturday open by default
          openTime: '09:00',
          closeTime: '18:00'
        };
        return acc;
      }, {})
    };
    setBranches([...branches, newBranch]);
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const updateBranch = (index: number, field: string, value: string) => {
    const updatedBranches = [...branches];
    updatedBranches[index] = { ...updatedBranches[index], [field]: value };
    setBranches(updatedBranches);
    updateData({ ...data, branches: updatedBranches });
  };

  const updateWorkingHours = (branchIndex: number, dayValue: number, field: string, value: any) => {
    const updatedBranches = [...branches];
    if (!updatedBranches[branchIndex].workingHours) {
      updatedBranches[branchIndex].workingHours = {};
    }
    updatedBranches[branchIndex].workingHours[dayValue] = {
      ...updatedBranches[branchIndex].workingHours[dayValue],
      [field]: value
    };
    setBranches(updatedBranches);
    updateData({ ...data, branches: updatedBranches });
  };

  const handleContinue = () => {
    onNext(branches);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Branch Locations</h2>
        <p className="text-slate-600 mt-2">Add your business locations with working hours</p>
      </div>

      {!Array.isArray(branches) || branches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">No branches added yet</p>
          <Button onClick={addBranch} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add First Branch
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(branches) && branches.map((branch: any, index: number) => (
            <div key={branch.id} className="border rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Branch {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBranch(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Basic Branch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`branch-name-${index}`}>Branch Name *</Label>
                  <Input
                    id={`branch-name-${index}`}
                    value={branch.name}
                    onChange={(e) => updateBranch(index, 'name', e.target.value)}
                    placeholder="Enter branch name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`branch-contact-${index}`}>Contact Number</Label>
                  <Input
                    id={`branch-contact-${index}`}
                    value={branch.contactNumber}
                    onChange={(e) => updateBranch(index, 'contactNumber', e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`branch-address-${index}`}>Address</Label>
                <Textarea
                  id={`branch-address-${index}`}
                  value={branch.address}
                  onChange={(e) => updateBranch(index, 'address', e.target.value)}
                  placeholder="Enter branch address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`branch-city-${index}`}>City</Label>
                  <Input
                    id={`branch-city-${index}`}
                    value={branch.city}
                    onChange={(e) => updateBranch(index, 'city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`branch-state-${index}`}>State</Label>
                  <Input
                    id={`branch-state-${index}`}
                    value={branch.state}
                    onChange={(e) => updateBranch(index, 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              {/* Working Hours Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h4 className="text-lg font-semibold">Working Hours</h4>
                </div>
                
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = branch.workingHours?.[day.value] || {
                      isOpen: day.value >= 1 && day.value <= 6,
                      openTime: '09:00',
                      closeTime: '18:00'
                    };

                    return (
                      <div key={day.value} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Switch
                            checked={dayHours.isOpen}
                            onCheckedChange={(checked) => 
                              updateWorkingHours(index, day.value, 'isOpen', checked)
                            }
                          />
                          <span className="text-sm font-medium">{day.label}</span>
                        </div>
                        
                        {dayHours.isOpen ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={dayHours.openTime}
                              onValueChange={(value) => 
                                updateWorkingHours(index, day.value, 'openTime', value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-slate-500">to</span>
                            <Select
                              value={dayHours.closeTime}
                              onValueChange={(value) => 
                                updateWorkingHours(index, day.value, 'closeTime', value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addBranch} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Another Branch
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={handleContinue} disabled={isSaving}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BranchesStep;
