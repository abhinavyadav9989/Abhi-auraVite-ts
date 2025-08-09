import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, IndianRupee, Truck, FileText, CheckCircle, X, ShieldQuestion, Star, Loader2 } from "lucide-react";
import CounterOfferPanel from './CounterOfferPanel';
import { Transaction, Payment } from '@/api/entities';
import EscrowVisual from '../payments/EscrowVisual';
import { useToast } from "@/components/ui/use-toast";

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

  // Critical Fix: Only allow counter party to take action
  const canTakeAction = () => {
    const currentDealerId = currentDealer?.id;
    if (!currentDealerId) return false;
    
    // The person who made the last action should NOT be able to take action again
    return transaction.last_action_by !== currentDealerId;
  };

  const isBuyer = userRole === 'buyer';
  const isSeller = userRole === 'seller';

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
          const remainingAmount = transaction.final_price - (transaction.amount_paid || 0);
          const tokenAmount = transaction.final_price * 0.1;
          
          return (
            <div className="space-y-2">
              <p className="text-sm text-center font-medium">Payment Required</p>
              {transaction.amount_paid < tokenAmount && (
                 <Button 
                   className="w-full" 
                   onClick={() => onInitiatePayment(tokenAmount)}
                 >
                   Pay 10% Token (₹{(tokenAmount/100000).toFixed(1)}L)
                 </Button>
              )}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => onInitiatePayment(remainingAmount)}
              >
                {transaction.amount_paid > 0 ? `Pay Remaining Balance` : 'Pay Full Amount'}
              </Button>
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