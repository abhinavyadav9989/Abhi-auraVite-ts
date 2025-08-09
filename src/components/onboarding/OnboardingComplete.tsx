import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingComplete({ onComplete, isLoading }) {
  return (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
      <h2 className="text-2xl font-bold mb-2">Setup Almost Complete!</h2>
      <p className="text-slate-600 mb-6">
        Just one final step. Click below to create your account and go to your dashboard.
      </p>
      <Button onClick={onComplete} disabled={isLoading} size="lg">
        {isLoading ? 'Finalizing...' : 'Go to My Dashboard'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
      
      <Card className="mt-8 text-left">
          <CardContent className="p-6">
              <h3 className="font-semibold mb-3">What&apos;s Next?</h3>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>Complete your Business Verification (KYB) from your profile.</li>
                  <li>Add your first vehicle to the inventory.</li>
                  <li>Explore the marketplace to find deals.</li>
                  <li>Customize your notification and business preferences in Settings.</li>
              </ul>
          </CardContent>
      </Card>
    </div>
  );
}