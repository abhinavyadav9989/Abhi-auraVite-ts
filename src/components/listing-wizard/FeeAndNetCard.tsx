import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, Tag, TrendingDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const formatCurrency = (amount) => {
  if (!amount) return '₹0.00L';
  return amount >= 100000 ? `₹${(amount / 100000).toFixed(2)}L` : `₹${amount.toLocaleString('en-IN')}`;
};

export default function FeeAndNetCard({ askingPrice, feeRule, onFeePreferenceChange }) {
  const calculateFee = () => {
    if (!askingPrice || !feeRule) return 0;
    if (feeRule.type === 'percentage') {
      return (askingPrice * feeRule.value) / 100;
    }
    if (feeRule.type === 'flat') {
      return feeRule.value;
    }
    return 0;
  };

  const platformFee = calculateFee();
  const netToYou = askingPrice - platformFee;

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Pricing Breakdown</h3>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Your Asking Price</span>
          <span className="font-medium text-slate-800 flex items-center gap-1">
            <IndianRupee className="w-4 h-4" /> {formatCurrency(askingPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" /> Platform Fee
          </span>
          <span className="font-medium text-slate-800">
            {feeRule.type === 'percentage'
              ? `${feeRule.value}%`
              : formatCurrency(feeRule.value)}
          </span>
        </div>
        <div className="border-t border-slate-200 my-2" />
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" /> Net Earnings for You
          </span>
          <span className="text-green-700 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" /> {formatCurrency(netToYou)}
          </span>
        </div>
        <div className="pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-fee" onCheckedChange={(checked) => onFeePreferenceChange(checked)} />
            <label htmlFor="remember-fee" className="text-sm font-medium leading-none text-slate-700">
              Remember this fee choice for future listings
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}