import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
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
      email: '',
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
        <p className="text-slate-600 mt-2">Invite team members to collaborate (optional)</p>
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
            <div key={member.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Member {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
