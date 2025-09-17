import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Transaction } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle, Minus, Plus } from 'lucide-react';
import Numpad from './Numpad';
import { NotificationService } from '@/services/notificationService';

const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN')}`;

export default function OfferModal({ vehicle, dealer, currentDealer, onClose }) {
  const [offerAmount, setOfferAmount] = useState(vehicle.asking_price || 0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // MP-16: Lowball threshold (70% of asking price or AI median)
  const aiMedian = (vehicle.market_price_min + vehicle.market_price_max) / 2 || vehicle.asking_price;
  const lowballThreshold = Math.min(vehicle.asking_price * 0.7, aiMedian * 0.7);

  const handleOfferSubmit = async () => {
    if (offerAmount < lowballThreshold) {
      setShowWarning(true);
      return;
    }
    await proceedWithOffer();
  };
  
  const proceedWithOffer = async () => {
    setShowWarning(false);
    setIsSubmitting(true);
    
    try {
      const newTransaction = await Transaction.create({
        vehicle_id: vehicle.id,
        seller_id: vehicle.dealer_id,
        buyer_id: currentDealer.id,
        status: 'offer_made',
        amount: offerAmount,
        initial_offer: offerAmount,
        current_offer: offerAmount,
        timeline: [{
          timestamp: new Date().toISOString(),
          status: 'offer_made',
          user_id: currentDealer.id,
          details: `Initial offer of ${formatCurrency(offerAmount)} made.`
        }]
      });
      
      // Notify seller about new deal/offer
      try {
        await NotificationService.createNewDealNotification(
          vehicle.dealer_id, // recipient (seller)
          currentDealer.id,  // sender (buyer)
          newTransaction.id,
          `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          currentDealer?.business_name || 'Buyer'
        );
      } catch (e) { console.warn('Notification create failed', e); }

      toast({
        title: 'Offer Sent!',
        description: `Your offer for the ${vehicle.make} ${vehicle.model} has been sent.`,
      });
      
      navigate(createPageUrl('DealRoom') + `?id=${newTransaction.id}`);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Offer Failed',
        description: 'There was an error sending your offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  // MP-15: Quick offer adjustment buttons
  const quickAdjust = (amount) => {
    const newAmount = Math.max(0, offerAmount + amount);
    setOfferAmount(newAmount);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              For {vehicle.year} {vehicle.make} {vehicle.model} from {dealer.business_name}.
              <br />
              Asking Price: {formatCurrency(vehicle.asking_price)}
              {aiMedian !== vehicle.asking_price && (
                <span className="block text-sm text-blue-600 dark:text-blue-400 mt-1">
                  AI Market Value: {formatCurrency(aiMedian)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* MP-17: Mobile numpad or desktop input */}
          {isMobile ? (
            <Numpad
              value={offerAmount}
              onChange={setOfferAmount}
              onSubmit={handleOfferSubmit}
            />
          ) : (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="offer-amount" className="dark:text-slate-200">Your Offer</Label>
                <div className="flex items-center gap-2">
                  {/* MP-15: Quick adjustment buttons */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => quickAdjust(-10000)}
                    disabled={offerAmount <= 10000}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="offer-amount"
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="flex-1 text-center font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    step="1000"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => quickAdjust(10000)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => quickAdjust(-25000)}
                    className="text-xs"
                  >
                    -₹25K
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => quickAdjust(-50000)}
                    className="text-xs"
                  >
                    -₹50K
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => quickAdjust(25000)}
                    className="text-xs"
                  >
                    +₹25K
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => quickAdjust(50000)}
                    className="text-xs"
                  >
                    +₹50K
                  </Button>
                </div>
                <p className="text-center text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(offerAmount)}
                </p>
              </div>
            </div>
          )}

          {!isMobile && (
            <DialogFooter>
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
              <Button type="button" onClick={handleOfferSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {/* MP-16: Lowball Warning */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Low Offer Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your offer of {formatCurrency(offerAmount)} is significantly below the market value 
              ({formatCurrency(lowballThreshold)}). This may be automatically rejected or viewed unfavorably.
              <br /><br />
              Consider increasing your offer to improve your chances of acceptance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Edit Offer</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithOffer}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}