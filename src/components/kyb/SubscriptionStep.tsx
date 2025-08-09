import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'Free',
    description: 'For individual dealers getting started.',
    features: ['Up to 20 active listings', 'Standard marketplace access', 'Email support']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹2,999/mo',
    description: 'For growing businesses who need more.',
    features: ['Unlimited listings', 'Priority marketplace visibility', 'AI market insights', 'Phone & chat support'],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large chains and custom needs.',
    features: ['All Pro features', 'Dedicated account manager', 'API access', 'Custom integrations']
  }
];

export default function SubscriptionStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-slate-600">Select a plan that fits your business needs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all duration-200 ${data.plan === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => onChange({ plan: plan.id })}
          >
            <CardHeader>
              {plan.isPopular && <div className="absolute top-0 right-4 -mt-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>}
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                {plan.name}
              </CardTitle>
              <p className="text-2xl font-bold">{plan.price}</p>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}