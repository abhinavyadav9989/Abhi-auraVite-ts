import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Star, Crown, Zap } from 'lucide-react';

interface PlanSectionProps {
  dealer: any;
}

const PlanSection: React.FC<PlanSectionProps> = ({ dealer }) => {
  // Prefer simple subscription_plan field; fallback to plan_selection.plan
  // Normalize plan keys across screens: standard->basic, pro->premium
  const rawPlanKey: string | undefined = (dealer?.subscription_plan || dealer?.plan_selection?.plan || '').toLowerCase();
  const planKey = rawPlanKey === 'standard' ? 'basic' : rawPlanKey === 'pro' ? 'premium' : rawPlanKey;
  
  // Debug logging (safe)
  const planSelection = dealer?.plan_selection || {};
  console.log('PlanSection - dealer:', dealer);
  console.log('PlanSection - plan_selection:', planSelection);
  console.log('PlanSection - plan_selection.plan:', (planSelection as any)?.plan);
  console.log('PlanSection - plan_selection.features:', (planSelection as any)?.features);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      icon: Shield,
      description: 'Perfect for getting started',
      features: [
        'Add vehicles',
        'Browse marketplace'
      ],
      color: 'text-blue-600'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 999,
      icon: Star,
      description: 'Most popular choice',
      features: [
        'All basic features',
        'Analytics',
        'Priority support'
      ],
      color: 'text-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2999,
      icon: Crown,
      description: 'For large organizations',
      features: [
        'All premium features',
        'Custom integrations',
        'Dedicated support'
      ],
      color: 'text-orange-600'
    }
  ];

  const additionalFeatures = [
    { id: 'bulk_upload', name: 'Bulk Vehicle Upload', price: 299, icon: Zap },
    { id: 'advanced_analytics', name: 'Advanced Analytics', price: 199, icon: Zap },
    { id: 'custom_integrations', name: 'Custom Integrations', price: 499, icon: Zap },
    { id: 'priority_support', name: 'Priority Support', price: 99, icon: Zap }
  ];

  const getSelectedPlan = () => {
    if (!planKey) return null;
    return plans.find(plan => plan.id === planKey);
  };

  const getSelectedFeatures = () => {
    const feats: string[] = (planSelection as any)?.features || [];
    if (!feats || feats.length === 0) return [];
    return additionalFeatures.filter(f => feats.includes(f.id));
  };

  const selectedPlan = getSelectedPlan();
  const selectedFeatures = getSelectedFeatures();

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subscription Plan</h2>
          <p className="text-slate-600 mt-1">Your current plan and additional features</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = selectedPlan.icon;
                    return <IconComponent className={`w-8 h-8 ${selectedPlan.color}`} />;
                  })()}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedPlan.name}</h3>
                    <p className="text-slate-600">{selectedPlan.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {formatPrice(selectedPlan.price)}
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(planSelection as any)?.selectedAt && (
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Subscribed on: {new Date((planSelection as any).selectedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No plan selected</p>
              <p className="text-sm">Complete onboarding to select your plan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Features */}
      {selectedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Additional Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-700">{feature.name}</p>
                        <p className="text-sm text-slate-500">{formatPrice(feature.price)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Active
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default PlanSection;
