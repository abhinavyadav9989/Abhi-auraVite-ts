import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanSelectionStepProps {
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

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  isSaving,
  dealer
}) => {
  const [selectedPlan, setSelectedPlan] = useState(data.planSelection?.plan || 'basic');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(Array.isArray(data.planSelection?.features) ? data.planSelection.features : []);

  // Sync local state with data prop when it changes (e.g., when navigating back)
  React.useEffect(() => {
    if (data.planSelection) {
      setSelectedPlan(data.planSelection.plan || 'basic');
      setSelectedFeatures(Array.isArray(data.planSelection.features) ? data.planSelection.features : []);
    }
  }, [data.planSelection]);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      icon: '🚀',
      description: 'Perfect for getting started',
      features: [
        'Add up to 10 vehicles',
        'Browse marketplace',
        'Basic analytics',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 999,
      icon: '⭐',
      description: 'Most popular choice',
      features: [
        'Add up to 100 vehicles',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2999,
      icon: '👑',
      description: 'For large organizations',
      features: [
        'Unlimited vehicles',
        'Custom integrations',
        'Dedicated support',
        'White-label solution',
        'Advanced security'
      ],
      popular: false
    }
  ];

  const additionalFeatures = [
    { id: 'bulk_upload', name: 'Bulk Vehicle Upload', price: 299 },
    { id: 'advanced_analytics', name: 'Advanced Analytics', price: 199 },
    { id: 'custom_integrations', name: 'Custom Integrations', price: 499 },
    { id: 'priority_support', name: 'Priority Support', price: 99 }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleNext = () => {
    const planData = {
      plan: selectedPlan,
      features: selectedFeatures,
      selectedPlanDetails: plans.find(p => p.id === selectedPlan),
      selectedFeaturesDetails: additionalFeatures.filter(f => selectedFeatures.includes(f.id))
    };

    updateData({ ...data, planSelection: planData });
    onNext(planData);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const totalPrice = (selectedPlanData?.price || 0) + 
    additionalFeatures
      .filter(f => selectedFeatures.includes(f.id))
      .reduce((sum, f) => sum + f.price, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Choose Your Plan</h2>
        <p className="text-slate-600 mt-2">
          Select the plan that best fits your business needs
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-blue-500 border-blue-500' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            <CardHeader className="text-center">
              {plan.popular && (
                <Badge className="mb-2 mx-auto" variant="secondary">
                  Most Popular
                </Badge>
              )}
              <div className="text-3xl mb-2">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-slate-900">
                ₹{plan.price}
                <span className="text-sm font-normal text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Additional Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalFeatures.map((feature) => (
            <div 
              key={feature.id}
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
              onClick={() => handleFeatureToggle(feature.id)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={selectedFeatures.includes(feature.id)}
                  onChange={() => handleFeatureToggle(feature.id)}
                />
                <div>
                  <p className="font-medium text-slate-900">{feature.name}</p>
                </div>
              </div>
              <span className="text-slate-600">₹{feature.price}/month</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Plan Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Selected Plan:</span>
              <span className="font-medium">{selectedPlanData?.name}</span>
            </div>
            {selectedFeatures.length > 0 && (
              <div className="flex justify-between">
                <span>Additional Features:</span>
                <span className="font-medium">{selectedFeatures.length} selected</span>
              </div>
            )}
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Monthly:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default PlanSelectionStep;
