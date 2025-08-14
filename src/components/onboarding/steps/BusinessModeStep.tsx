import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { onboardingAPI } from '@/api/onboardingAPI';

interface BusinessModeStepProps {
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

const BusinessModeStep: React.FC<BusinessModeStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const businessModes = onboardingAPI.getBusinessModes();
  const vehicleSegments = onboardingAPI.getVehicleSegments();

  const handleBusinessModeSelect = (modeId: string) => {
    const businessMode = { mode: modeId };
    updateData({ ...data, trading_preferences: businessMode });
  };

  const handleSegmentToggle = (segmentId: string, checked: boolean) => {
    const currentSegments = data.trading_preferences?.segments || data.businessMode?.segments || [];
    let newSegments;
    
    if (checked) {
      newSegments = [...currentSegments, segmentId];
    } else {
      newSegments = currentSegments.filter((id: string) => id !== segmentId);
    }
    
    const businessMode = { 
      ...(data.trading_preferences || data.businessMode), 
      segments: newSegments 
    };
    updateData({ ...data, trading_preferences: businessMode });
  };

  const handleContinue = () => {
    const businessModeData = data.trading_preferences || data.businessMode;
    if (businessModeData?.mode && businessModeData?.segments?.length > 0) {
      onNext(businessModeData);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">What do you trade?</h2>
        <p className="text-slate-600 mt-2">Select your business mode and vehicle segments</p>
      </div>

      {/* Business Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Business Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businessModes.map((mode) => (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                (data.trading_preferences?.mode || data.businessMode?.mode) === mode.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => handleBusinessModeSelect(mode.id)}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-slate-900">{mode.label}</h4>
                  {(data.trading_preferences?.mode || data.businessMode?.mode) === mode.id && (
                    <div className="text-blue-600 text-sm font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Vehicle Segments Selection */}
      {(data.trading_preferences?.mode || data.businessMode?.mode) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Vehicle Segments</h3>
          <p className="text-slate-600">Select all vehicle types you deal with</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleSegments.map((segment) => (
              <div key={segment.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={segment.id}
                  checked={(data.trading_preferences?.segments || data.businessMode?.segments)?.includes(segment.id) || false}
                  onCheckedChange={(checked) => handleSegmentToggle(segment.id, checked as boolean)}
                />
                <label
                  htmlFor={segment.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {segment.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {((data.trading_preferences?.mode || data.businessMode?.mode) && (data.trading_preferences?.segments || data.businessMode?.segments)?.length > 0) && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
          <p className="text-sm text-slate-600">
            Business Mode: <span className="font-medium">
              {businessModes.find(m => m.id === (data.trading_preferences?.mode || data.businessMode?.mode))?.label}
            </span>
          </p>
          <p className="text-sm text-slate-600">
            Vehicle Segments: <span className="font-medium">
              {(data.trading_preferences?.segments || data.businessMode?.segments || []).map((id: string) => 
                vehicleSegments.find(s => s.id === id)?.label
              ).join(', ')}
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
          disabled={isSaving || !(data.trading_preferences?.mode || data.businessMode?.mode) || !(data.trading_preferences?.segments || data.businessMode?.segments)?.length}
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default BusinessModeStep;
