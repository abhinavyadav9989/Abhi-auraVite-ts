import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Dealer } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function BusinessVerification() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [dealer, setDealer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const current = await User.me();
      setUser(current);
      const list = await Dealer.filter({ created_by: current.email });
      if (list.length > 0) {
        setDealer(list[0]);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!dealer?.id) return;
    try {
      setIsSaving(true);
      await Dealer.update(dealer.id, { kyb_completed: true });
      toast({ title: 'Business Verification Complete', description: 'Your verification is completed successfully.' });
      window.location.href = createPageUrl('Dashboard');
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', description: 'Unable to complete verification.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !dealer) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Business Verification</h1>
          <p className="text-slate-600">Review and accept the terms to finish your business verification</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-slate-700">
              <p>
                By proceeding, you agree to Aura&apos;s Terms of Service and Privacy Policy. You
                confirm that the information submitted is accurate and you have authority to
                complete business verification for this account.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>All information provided must be accurate and up-to-date.</li>
                <li>You can update your business information anytime from Settings &gt; Profile.</li>
                <li>Abuse or fraudulent activity may lead to account suspension.</li>
                <li>Your business verification status will be reviewed by our team.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? 'Submitting...' : 'Complete Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


