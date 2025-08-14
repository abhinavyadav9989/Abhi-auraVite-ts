import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

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
      workingHours: {}
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

  const handleContinue = () => {
    onNext(branches);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Branch Locations</h2>
        <p className="text-slate-600 mt-2">Add your business locations (optional)</p>
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
            <div key={branch.id} className="border rounded-lg p-6 space-y-4">
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
