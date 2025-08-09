import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BankAccount } from '@/api/entities';
import { Upload, CheckCircle, Save } from 'lucide-react';

export default function BankingSettings({ dealerId }) {
  const [bankAccount, setBankAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAccount = async () => {
      if (!dealerId) {
        setIsLoading(false);
        return;
      };
      try {
        const accounts = await BankAccount.filter({ dealer_id: dealerId });
        if (accounts.length > 0) {
          setBankAccount(accounts[0]);
        } else {
          setBankAccount({ account_number: '', ifsc_code: '', account_holder_name: '', bank_name: '', branch_name: '' });
        }
      } catch (error) {
        console.error("Failed to load bank account", error);
        toast({ title: "Error", description: "Could not load banking details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadAccount();
  }, [dealerId, toast]);

  const handleInputChange = (field, value) => {
    setBankAccount(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (bankAccount.id) {
        await BankAccount.update(bankAccount.id, bankAccount);
      } else {
        const newAccount = await BankAccount.create({ ...bankAccount, dealer_id: dealerId });
        setBankAccount(newAccount);
      }
      toast({ title: "Success", description: "Banking details saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save details.", variant: "destructive" });
    }
  };
  
  if (isLoading) return <div>Loading banking details...</div>;
  if (!dealerId) return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Bank Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600">Please complete your business profile before adding bank details.</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Bank Account</CardTitle>
        <CardDescription>This is the account where funds from your sales will be deposited.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input id="account_holder_name" value={bankAccount?.account_holder_name} onChange={e => handleInputChange('account_holder_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input id="account_number" value={bankAccount?.account_number} onChange={e => handleInputChange('account_number', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input id="ifsc_code" value={bankAccount?.ifsc_code} onChange={e => handleInputChange('ifsc_code', e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" value={bankAccount?.bank_name} onChange={e => handleInputChange('bank_name', e.target.value)} />
            </div>
        </div>
         <div className="space-y-2">
            <Label>Cancelled Cheque</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <Button variant="outline" size="sm">Upload Cheque Image</Button>
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}