import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, User } from 'lucide-react';
import { onboardingAPI } from '@/api/onboardingAPI';

interface TeamStepProps {
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

const TeamStep: React.FC<TeamStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  onSkip,
  isSaving,
  dealer
}) => {
  const [teamMembers, setTeamMembers] = React.useState(Array.isArray(data.team) ? data.team : []);
  const teamRoles = onboardingAPI.getTeamRoles();

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (Array.isArray(data.team)) {
      setTeamMembers(data.team);
    }
  }, [data.team]);

  const addTeamMember = () => {
    const newMember = {
      id: Date.now(),
      fullName: '',
      email: '',
      mobileNumber: '',
      aadharNumber: '',
      role: '',
      status: 'pending'
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
    updateData({ ...data, team: updatedMembers });
  };

  const handleContinue = () => {
    onNext(teamMembers);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Team Members</h2>
        <p className="text-slate-600 mt-2">Add team members with complete details</p>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">No team members added yet</p>
          <Button onClick={addTeamMember} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add First Team Member
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(teamMembers) && teamMembers.map((member: any, index: number) => (
            <div key={member.id} className="border rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold">Team Member {index + 1}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-slate-700">Personal Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`member-name-${index}`}>Full Name *</Label>
                    <Input
                      id={`member-name-${index}`}
                      value={member.fullName}
                      onChange={(e) => updateTeamMember(index, 'fullName', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`member-email-${index}`}>Email Address *</Label>
                    <Input
                      id={`member-email-${index}`}
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`member-mobile-${index}`}>Mobile Number *</Label>
                    <Input
                      id={`member-mobile-${index}`}
                      type="tel"
                      value={member.mobileNumber}
                      onChange={(e) => updateTeamMember(index, 'mobileNumber', e.target.value)}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`member-aadhar-${index}`}>Aadhar Number *</Label>
                    <Input
                      id={`member-aadhar-${index}`}
                      value={member.aadharNumber}
                      onChange={(e) => updateTeamMember(index, 'aadharNumber', e.target.value)}
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength={12}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-slate-700">Role & Permissions</h4>
                
                <div className="space-y-2">
                  <Label htmlFor={`member-role-${index}`}>Role *</Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateTeamMember(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addTeamMember} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Another Team Member
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

export default TeamStep;
