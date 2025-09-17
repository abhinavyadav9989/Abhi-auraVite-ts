import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check } from 'lucide-react';

const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN')}`;

export default function Numpad({ value, onChange, onSubmit }) {
  const handleNumpadClick = (digit) => {
    if (digit === 'del') {
      onChange(Math.floor(value / 10));
    } else {
      const newValue = value * 10 + digit;
      onChange(newValue);
    }
  };

  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'del'];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-lg text-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(value)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {numpadKeys.map((key) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            className="h-14 text-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={() => handleNumpadClick(key)}
            disabled={key === '.'} // Assuming we only deal with whole numbers for now
          >
            {key === 'del' ? <ArrowLeft className="w-6 h-6" /> : key}
          </Button>
        ))}
      </div>
      <Button size="lg" onClick={onSubmit} className="h-14 bg-blue-600 hover:bg-blue-700 text-white">
        <Check className="w-6 h-6 mr-2" />
        Submit Offer
      </Button>
    </div>
  );
}