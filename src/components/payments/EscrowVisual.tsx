import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Truck, FileText } from 'lucide-react';

export default function EscrowVisual({ status, amountPaid = 0, finalPrice = 0 }) {
  const getProgress = () => {
    if (!finalPrice || finalPrice === 0) return 0;
    
    switch (status) {
      case 'accepted':
      case 'payment_pending':
        return (amountPaid / finalPrice) * 100;
      case 'paid':
      case 'picked_up':
      case 'in_transit':
      case 'delivered':
      case 'rto_done':
        return 100;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'accepted':
      case 'payment_pending':
        return amountPaid > 0 ? "Partially Paid" : "Awaiting Payment";
      case 'paid':
        return "Payment Held in Escrow";
      case 'picked_up':
      case 'in_transit':
        return "Funds Secured";
      case 'delivered':
        return "Awaiting RTO";
      case 'rto_done':
        return "Ready for Release";
      case 'completed':
        return "Funds Released to Seller";
      default:
        return "Escrow Inactive";
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paid':
      case 'picked_up':
      case 'in_transit':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
      case 'rto_done':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Lock className="w-4 h-4 text-slate-500" />;
    }
  };

  const progress = getProgress();

  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700 flex items-center gap-2">
          {getIcon()}
          Escrow Status
        </span>
        <span className="text-slate-500">{getStatusText()}</span>
      </div>
      <Progress value={progress} />
      <div className="text-xs text-slate-500 text-right">
        ₹{(amountPaid / 100).toLocaleString()} / ₹{(finalPrice / 100).toLocaleString()}
      </div>
    </div>
  );
}