import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const formatCurrency = (amount) => amount ? `₹${(amount / 100000).toFixed(2)}L` : '₹0.00L';

export default function PaymentBreakdownModal({ amount, finalPrice, onClose, onConfirm }) {
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'token'
  const [tokenAmount, setTokenAmount] = useState(finalPrice * 0.1); // 10% token
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { toast } = useToast();

  const platformFee = finalPrice * 0.02; // 2% platform fee
  const escrowFee = finalPrice * 0.005; // 0.5% escrow fee
  const gst = (platformFee + escrowFee) * 0.18; // 18% GST on fees
  
  const paymentAmount = paymentType === 'full' ? finalPrice : tokenAmount;
  const totalWithFees = paymentAmount + platformFee + escrowFee + gst;

  const handleConfirmPayment = () => {
    if (!agreeTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive"
      });
      return;
    }

    const paymentDetails = {
      amount: paymentAmount,
      platformFee,
      escrowFee,
      gst,
      totalAmount: totalWithFees,
      type: paymentType,
      landedCost: totalWithFees
    };

    onConfirm(paymentDetails);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Breakdown
          </DialogTitle>
          <DialogDescription>
            Review the complete cost breakdown before making payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Payment Option</Label>
            <div className="grid gap-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentType === 'full' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setPaymentType('full')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Full Payment</h3>
                    <p className="text-sm text-slate-600">Pay complete amount now</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(finalPrice)}</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentType === 'token' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setPaymentType('token')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Token Payment (10%)</h3>
                    <p className="text-sm text-slate-600">Secure the deal, pay balance later</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(tokenAmount)}</div>
                    <div className="text-xs text-slate-500">Balance: {formatCurrency(finalPrice - tokenAmount)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-slate-900">Cost Breakdown</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicle Price ({paymentType === 'token' ? 'Token' : 'Full'})</span>
                <span className="font-medium">{formatCurrency(paymentAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Fee (2%)</span>
                <span className="font-medium">{formatCurrency(platformFee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Escrow Fee (0.5%)
                </span>
                <span className="font-medium">{formatCurrency(escrowFee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">GST (18% on fees)</span>
                <span className="font-medium">{formatCurrency(gst)}</span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total Payable</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {formatCurrency(totalWithFees)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Landed Cost */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Your Total Landed Cost</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {formatCurrency(totalWithFees)}
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This is your complete cost including all fees and taxes.
            </p>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agree-terms" 
              checked={agreeTerms}
              onCheckedChange={setAgreeTerms}
            />
            <label htmlFor="agree-terms" className="text-sm text-slate-600 leading-relaxed">
              I agree to the <span className="text-blue-600 underline cursor-pointer">Terms & Conditions</span> and 
              understand that platform fees are non-refundable. Escrow will be released upon successful delivery.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPayment}
            disabled={!agreeTerms}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}