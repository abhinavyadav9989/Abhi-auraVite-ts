import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import MarginGauge from './MarginGauge';

const formatCurrency = (amount) => amount ? `₹${(amount / 100000).toFixed(2)}L` : '₹0.00L';

export default function DealRoomPricingRibbon({ transaction, vehicle, userRole }) {
  if (!transaction || !vehicle) return null;

  const calculatePlatformFee = (price, feeRule) => {
    if (!price || !feeRule) return 0;
    if (feeRule.type === 'percentage') return (price * feeRule.value) / 100;
    if (feeRule.type === 'flat') return feeRule.value;
    return 0;
  };

  const platformFee = calculatePlatformFee(transaction.current_offer, {
    type: vehicle.listing_fee_type,
    value: vehicle.listing_fee_value,
  });

  // Seller's View
  if (userRole === 'seller') {
    const netEarnings = transaction.current_offer - platformFee;
    return (
      <div className="p-3 bg-green-50 dark:bg-emerald-900/30 rounded-lg border border-green-200 dark:border-emerald-800 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-800 dark:text-emerald-200">
            <TrendingDown className="w-5 h-5" />
            <span className="font-semibold">Your Net Earnings</span>
          </div>
          <span className="text-xl font-bold text-green-800 dark:text-emerald-200">{formatCurrency(netEarnings)}</span>
        </div>
        <p className="text-xs text-green-600 dark:text-emerald-300/80 text-right mt-1">
          After {formatCurrency(platformFee)} platform fee
        </p>
      </div>
    );
  }

  // Buyer's View
  if (userRole === 'buyer') {
    const landedCost = transaction.current_offer + platformFee; // Simplified, excludes transport
    const markupPrice = landedCost * 1.10; // Assuming 10% default markup for preview
    const margin = markupPrice - landedCost;
    const marginPct = landedCost > 0 ? (margin / landedCost) * 100 : 0;

    return (
      <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700 w-full space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-800 dark:text-slate-100">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Projected Landed Cost</span>
          </div>
          <span className="text-xl font-bold text-blue-800 dark:text-slate-100">{formatCurrency(landedCost)}</span>
        </div>
        <div className="pt-2 border-t border-blue-100 dark:border-slate-700">
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">Potential Margin Preview (at 10% markup)</div>
          <MarginGauge margin={marginPct} />
          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-200 mt-1">
            <span>{formatCurrency(margin)}</span>
            <span>{marginPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}