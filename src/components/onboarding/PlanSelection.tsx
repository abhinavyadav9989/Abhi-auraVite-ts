import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  { id: 'standard', name: 'Standard', price: 'Free', features: ['Up to 20 listings', 'Standard support'] },
  { id: 'pro', name: 'Pro', price: '₹2,999/mo', features: ['Unlimited listings', 'AI market insights', 'Priority support'], isPopular: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['All Pro features', 'API access', 'Dedicated manager'] }
];

export default function PlanSelection({ data, updateData }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {PLANS.map(plan => (
        <Card
          key={plan.id}
          className={`flex flex-col cursor-pointer transition-all ${data.selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => updateData({ selectedPlan: plan.id })}
        >
          <CardHeader>
             {plan.isPopular && <div className="absolute top-0 right-4 -mt-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>}
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-3xl font-bold">{plan.price}</p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <ul className="space-y-2 text-sm text-slate-600 mb-4">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />{feature}</li>
              ))}
            </ul>
            <Button variant={data.selectedPlan === plan.id ? 'default' : 'outline'} className="w-full">
              {data.selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}