import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CounterOfferPanel({ currentOffer, userRole, onCounter, onCancel }) {
  const [counterAmount, setCounterAmount] = useState(currentOffer);
  
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCounterAmount(Number(value));
  };
  
  const adjustOffer = (adjustment) => {
    setCounterAmount(prev => Math.max(0, prev + adjustment));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCounter(counterAmount);
  };
  
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle>Counter Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="counter-offer-amount">Your Counter Offer Amount</Label>
            <div className="flex items-center gap-2 mt-1">
               {/* MP-15: Quick Offer Buttons */}
              <Button type="button" variant="outline" size="icon" onClick={() => adjustOffer(-10000)}>
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Input
                id="counter-offer-amount"
                type="text"
                value={formatCurrency(counterAmount)}
                onChange={handleAmountChange}
                className="text-center text-lg font-bold"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => adjustOffer(10000)}>
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Submit Counter Offer</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}