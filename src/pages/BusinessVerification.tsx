import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Dealer } from '@/api/entities';
import SubscriptionStep from '@/components/kyb/SubscriptionStep';
import { createPageUrl } from '@/utils';

export default function BusinessVerification() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [plan, setPlan] = useState<'standard' | 'pro' | 'enterprise' | string>('standard');
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<0 | 1>(0); // 0 = plan, 1 = T&C

  useEffect(() => {
    (async () => {
      const current = await User.me();
      setUser(current);
      const list = await Dealer.filter({ created_by: current.email });
      if (list.length > 0) {
        setDealer(list[0]);
        if (list[0].subscription_plan) setPlan(list[0].subscription_plan);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!dealer?.id) return;
    try {
      setIsSaving(true);
      // Try to persist subscription_plan; gracefully degrade if column is missing in prod
      try {
        await Dealer.update(dealer.id, { subscription_plan: plan, kyb_completed: true });
      } catch (err: any) {
        const code = err?.code || err?.message;
        if (code === 'PGRST204' || String(err?.message || '').includes('subscription_plan')) {
          console.warn('subscription_plan column missing on backend; saving kyb_completed only');
          await Dealer.update(dealer.id, { kyb_completed: true });
          toast({
            title: 'Saved with limited fields',
            description: 'Plan will be stored once the backend adds subscription_plan.',
          });
        } else {
          throw err;
        }
      }
      toast({ title: 'Business Verification Complete', description: 'Your plan is saved and verification completed.' });
      window.location.href = createPageUrl('Dashboard');
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', description: 'Unable to save plan.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !dealer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Business Verification</h1>
          <p className="text-slate-600 dark:text-slate-300">{step === 0 ? 'Choose your plan to unlock full access' : 'Review and accept the terms to finish'}</p>
        </div>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Choose Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionStep data={{ plan }} onChange={(v: any) => setPlan(v.plan)} />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(1)} className="bg-blue-600 hover:bg-blue-700">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-slate-700">
                <p>
                  By proceeding, you agree to Aura&apos;s Terms of Service and Privacy Policy. You
                  confirm that the information submitted is accurate and you have authority to
                  select a plan for this business account.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Billing for paid plans may begin immediately upon activation.</li>
                  <li>You can change or cancel your plan anytime from Settings &gt; Billing.</li>
                  <li>Abuse or fraudulent activity may lead to account suspension.</li>
                </ul>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


