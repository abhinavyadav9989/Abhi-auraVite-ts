import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, IndianRupee, Truck, FileText, CheckCircle, X, ShieldQuestion, Star, Loader2 } from "lucide-react";
import CounterOfferPanel from './CounterOfferPanel';
import { Transaction, Payment } from '@/api/entities';
import EscrowVisual from '../payments/EscrowVisual';
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from '@/utils';
import { Download, Eye } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ActionPanel({ 
  transaction, 
  userRole, 
  currentDealer, 
  onUpdate, 
  onBookTransport, 
  onStartRTO, 
  onRateDeal, 
  onRaiseDispute, 
  onInitiatePayment 
}) {
  const [showCounter, setShowCounter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMeta, setPaymentMeta] = useState<{ id: string; timestamp: string; mode: string } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Critical Fix: Only allow counter party to take action
  const canTakeAction = () => {
    const currentDealerId = currentDealer?.id;
    if (!currentDealerId) return false;
    
    // The person who made the last action should NOT be able to take action again
    return transaction.last_action_by !== currentDealerId;
  };

  const isBuyer = userRole === 'buyer';
  const isSeller = userRole === 'seller';

  const formatLakh = (amount?: number) => (amount ? `₹${(amount / 100000).toFixed(2)}L` : '₹0.00L');

  const downloadReceipt = async () => {
    if (!paymentMeta) return;
    setIsGeneratingPdf(true);
    const mount = document.createElement('div');
    mount.id = 'receipt-inline-print';
    mount.className = 'p-6 w-[900px] bg-white text-slate-900';
    mount.innerHTML = `
      <div style="font-family: ui-sans-serif, system-ui;">
        <h1 style="font-size:20px; font-weight:700; margin-bottom:8px;">Payment Receipt</h1>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style=\"padding:6px; font-weight:600; background:#f1f5f9; width:220px;\">Transaction ID</td><td style=\"padding:6px;\">${paymentMeta.id}</td></tr>
          <tr><td style=\"padding:6px; font-weight:600; background:#f1f5f9;\">Payment Time</td><td style=\"padding:6px;\">${new Date(paymentMeta.timestamp).toLocaleString()}</td></tr>
          <tr><td style=\"padding:6px; font-weight:600; background:#f1f5f9;\">Payment Mode</td><td style=\"padding:6px;\">${paymentMeta.mode}</td></tr>
          <tr><td style=\"padding:6px; font-weight:600; background:#f1f5f9;\">Amount</td><td style=\"padding:6px;\">${formatLakh(transaction.final_price || transaction.current_offer)}</td></tr>
        </table>
      </div>
    `;

    document.body.appendChild(mount);
    try {
      const canvas = await html2canvas(mount, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Payment_Receipt_${paymentMeta.id}.pdf`);
    } finally {
      document.body.removeChild(mount);
      setIsGeneratingPdf(false);
    }
  };

  const handleAction = async (newStatus, updateData = {}, details) => {
    setIsProcessing(true);
    try {
      const timelineEvent = {
        timestamp: new Date().toISOString(),
        status: newStatus,
        user_id: currentDealer.id,
        details: details || `Deal status updated to ${newStatus.replace(/_/g, ' ')}.`,
      };
      
      const updatedTimeline = [...(transaction.timeline || []), timelineEvent];

      await Transaction.update(transaction.id, {
        status: newStatus,
        last_action_by: currentDealer.id,
        timeline: updatedTimeline,
        ...updateData,
      });
      
      onUpdate();
      setShowCounter(false);
      
      // Show success message
      toast({
        title: "Action Successful",
        description: details || `Deal status updated successfully.`,
      });

    } catch (error) {
      console.error(`Failed to perform action: ${newStatus}`, error);
      toast({ 
        title: "Action Failed", 
        description: "Could not update the deal. Please try again.", 
        variant: "destructive" 
      });
    }
    setIsProcessing(false);
  };
  
  const simulatePayment = async () => {
    if (!isBuyer) return;
    setIsProcessing(true);
    const txnId = `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    try {
      const updatedTimeline = [
        ...(transaction.timeline || []),
        { timestamp, status: 'paid', user_id: currentDealer.id, details: `Payment processed (${txnId}).` },
        { timestamp, status: 'completed', user_id: currentDealer.id, details: 'Deal closed after payment.' }
      ];

      await Transaction.update(transaction.id, {
        status: 'completed',
        amount_paid: transaction.final_price || transaction.current_offer,
        last_action_by: currentDealer.id,
        timeline: updatedTimeline,
        payment_method: 'bank_transfer',
        transaction_date: timestamp,
        metadata: {
          ...(transaction.metadata || {}),
          payment: {
            txn_id: txnId,
            mode: 'bank_transfer',
            paid_at: timestamp,
            amount: transaction.final_price || transaction.current_offer,
            currency: transaction.currency || 'INR'
          }
        }
      });

      // Best-effort mark vehicle as sold
      try {
        // @ts-ignore Vehicle imported from entities
        const { Vehicle } = await import('@/api/entities');
        await Vehicle.update(transaction.vehicle_id, {
          sold: true,
          sold_at: timestamp,
          sold_to_dealer_id: transaction.buyer_id,
          inventory_type: 'private'
        });
      } catch {}

      setPaymentMeta({ id: txnId, timestamp, mode: 'Bank Transfer' });
      toast({ title: 'Payment Successful', description: 'Receipt is ready below.' });
      onUpdate();
    } catch (error) {
      console.error('Payment simulation failed', error);
      toast({ title: 'Payment failed', description: 'Please try again.', variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  const renderActionButtons = () => {
    const canAct = canTakeAction();

    switch (transaction.status) {
      case 'offer_made':
        // Only seller can respond to initial buyer offer
        if (isSeller && canAct) {
          return (
            <div className="space-y-2">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => handleAction('accepted', { final_price: transaction.current_offer }, "Offer accepted.")}
              >
                Accept Offer (₹{(transaction.current_offer/100000).toFixed(1)}L)
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowCounter(true)}
              >
                Counter Offer
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700" 
                onClick={() => handleAction('rejected', {}, "Offer rejected.")}
              >
                Reject Offer
              </Button>
            </div>
          );
        }
        if (isBuyer) {
          return (
            <div className="text-center">
              <p className="text-sm text-slate-500">Waiting for seller&apos;s response...</p>
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => handleAction('cancelled', {}, "Offer withdrawn.")}
              >
                Withdraw Offer
              </Button>
            </div>
          );
        }
        return null;
      
      case 'negotiating':
        if (!canAct) {
          return <p className="text-sm text-center text-slate-500">Waiting for response...</p>;
        }
        return (
          <div className="space-y-2">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => handleAction('accepted', { final_price: transaction.current_offer }, "Counter offer accepted.")}
            >
              Accept Counter-Offer
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowCounter(true)}
            >
              Make Counter Offer
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700" 
              onClick={() => handleAction('rejected', {}, "Counter offer rejected.")}
            >
              Reject
            </Button>
          </div>
        );
      
      case 'accepted':
      case 'payment_pending': {
        if (isBuyer) {
          if (paymentMeta) {
            return (
              <div className="space-y-2">
                <p className="text-sm text-center text-green-600 dark:text-green-400">Payment successful</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowReceipt(v => !v)}>
                    <Eye className="w-4 h-4" /> {showReceipt ? 'Hide Receipt' : 'View Receipt'}
                  </Button>
                  <Button className="flex-1 gap-2" onClick={downloadReceipt} disabled={isGeneratingPdf}>
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              <p className="text-sm text-center font-medium">Payment Required</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => {
                  // Navigate to the dedicated payment checkout page
                  navigate(createPageUrl('PaymentCheckout') + `?id=${transaction.id}`);
                }}
                disabled={isProcessing}
              >
                Proceed to Payment
              </Button>
              {showReceipt && paymentMeta && (
                <div className="text-xs p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <div className="font-medium mb-1">Receipt</div>
                  <div>Transaction ID: {paymentMeta.id}</div>
                  <div>Payment Time: {new Date(paymentMeta.timestamp).toLocaleString()}</div>
                  <div>Mode: {paymentMeta.mode}</div>
                  <div>Amount: {formatLakh(transaction.final_price || transaction.current_offer)}</div>
                </div>
              )}
            </div>
          );
        }
        return <p className="text-sm text-center text-slate-500">Waiting for buyer&apos;s payment...</p>;
      }

      case 'paid':
        if (isSeller) {
          return (
            <Button 
              className="w-full" 
              onClick={onBookTransport}
            >
              <Truck className="w-4 h-4 mr-2" />
              Book Transport
            </Button>
          );
        }
        return <p className="text-sm text-center text-slate-500">Seller is arranging transport...</p>;

      case 'picked_up':
      case 'in_transit':
        return (
          <div className="text-center">
            <Truck className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-sm text-slate-500">Vehicle is in transit</p>
            <p className="text-xs text-slate-400 mt-1">Check timeline for updates</p>
          </div>
        );
      
      case 'delivered':
        if (isBuyer) {
          return (
            <Button 
              className="w-full" 
              onClick={onStartRTO}
            >
              <FileText className="w-4 h-4 mr-2" />
              Initiate RTO Transfer
            </Button>
          );
        }
        return <p className="text-sm text-center text-slate-500">Awaiting RTO initiation from buyer.</p>;

      case 'rto_done':
        return (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => handleAction('completed', {}, "Deal completed.")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Deal as Completed
          </Button>
        );

      case 'completed': {
        const hasRated = isBuyer ? transaction.buyer_rated : transaction.seller_rated;
        if (hasRated) {
          return (
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-slate-500">Deal Completed!</p>
              <p className="text-xs text-slate-400 mt-1">Thanks for rating!</p>
            </div>
          );
        }
        return (
          <Button 
            className="w-full" 
            onClick={onRateDeal}
          >
            <Star className="w-4 h-4 mr-2" />
            Rate {isBuyer ? 'Seller' : 'Buyer'}
          </Button>
        );
      }

      case 'disputed':
        return (
          <div className="text-center space-y-2">
            <ShieldQuestion className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-sm text-slate-600">This deal is in dispute</p>
            <p className="text-xs text-slate-400">An admin will review and mediate</p>
            <Button variant="outline" size="sm">Upload Evidence</Button>
          </div>
        );

      case 'cancelled':
      case 'rejected':
        return (
          <div className="text-center">
            <X className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-sm text-slate-500">This deal is closed</p>
          </div>
        );

      default:
        return <p className="text-sm text-center text-slate-500">No actions available</p>;
    }
  };

  const canRaiseDispute = ['paid', 'picked_up', 'in_transit', 'delivered', 'rto_done'].includes(transaction.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
        
        {showCounter ? (
          <CounterOfferPanel
            currentOffer={transaction.current_offer}
            userRole={userRole}
            onCounter={(amount) => {
              handleAction('negotiating', { current_offer: amount }, `Counter offer of ₹${(amount / 100000).toFixed(1)}L made.`);
            }}
            onCancel={() => setShowCounter(false)}
          />
        ) : renderActionButtons()}

        <EscrowVisual 
          status={transaction.status} 
          amountPaid={transaction.amount_paid} 
          finalPrice={transaction.final_price} 
        />

        {canRaiseDispute && (
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-red-600 hover:text-red-700" 
              onClick={onRaiseDispute}
            >
              <ShieldQuestion className="w-4 h-4 mr-2" />
              Raise a Dispute
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}