import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { onboardingAPI } from '@/api/onboardingAPI';

interface ClientTypeStepProps {
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

const ClientTypeStep: React.FC<ClientTypeStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const clientTypes = onboardingAPI.getClientTypes();

  const handleSelect = (clientType: string) => {
    updateData({ ...data, business_type: clientType });
  };

  const handleContinue = () => {
    const selectedType = data.business_type || data.clientType;
    if (selectedType) {
      onNext({ clientType: selectedType });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">What type of business are you?</h2>
        <p className="text-slate-600 mt-2">Select the option that best describes your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              (data.business_type || data.clientType) === type.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-slate-50'
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="text-4xl">{type.icon}</div>
                <h3 className="font-semibold text-slate-900">{type.label}</h3>
                <p className="text-sm text-slate-600">{type.description}</p>
                {(data.business_type || data.clientType) === type.id && (
                  <div className="text-blue-600 text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(data.business_type || data.clientType) && (
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Selected: <span className="font-medium text-slate-900">
              {clientTypes.find(t => t.id === (data.business_type || data.clientType))?.label}
            </span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isSaving || !(data.business_type || data.clientType)}
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default ClientTypeStep;
