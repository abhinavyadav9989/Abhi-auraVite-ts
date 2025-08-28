import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, Handshake, CreditCard, Truck } from 'lucide-react';
import { Transaction } from '@/api/entities';
import { AuditLog } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/components/formatters';

// Define valid state transitions for transactions
const TRANSACTION_STATE_MACHINE = {
  offer_made: ['negotiating', 'accepted', 'rejected', 'expired'],
  negotiating: ['accepted', 'rejected', 'expired'],
  accepted: ['payment_pending', 'cancelled'],
  payment_pending: ['paid', 'payment_timeout', 'cancelled'],
  paid: ['picked_up', 'cancelled', 'disputed'],
  picked_up: ['in_transit', 'cancelled', 'disputed'],
  in_transit: ['delivered', 'cancelled', 'disputed'],
  delivered: ['rto_done', 'disputed'],
  rto_done: ['completed'],
  completed: ['archived'],
  cancelled: ['archived'],
  disputed: ['in_transit', 'cancelled', 'completed'], // Dispute resolution paths
  archived: [], // Final state
  expired: ['archived'],
  payment_timeout: ['payment_pending', 'cancelled', 'archived'],
  rejected: ['archived']
};

const STATUS_COLORS = {
  offer_made: 'bg-blue-100 text-blue-700',
  negotiating: 'bg-orange-100 text-orange-700',
  accepted: 'bg-green-100 text-green-700',
  payment_pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-purple-100 text-purple-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  in_transit: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  rto_done: 'bg-pink-100 text-pink-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  disputed: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-700',
  expired: 'bg-gray-100 text-gray-700',
  payment_timeout: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700'
};

const STATUS_ICONS = {
  offer_made: Handshake,
  negotiating: AlertTriangle,
  accepted: CheckCircle,
  payment_pending: CreditCard,
  paid: CheckCircle,
  picked_up: Truck,
  in_transit: Truck,
  delivered: CheckCircle,
  rto_done: CheckCircle,
  completed: CheckCircle,
  cancelled: AlertTriangle,
  disputed: AlertTriangle,
  archived: Clock,
  expired: Clock,
  payment_timeout: AlertTriangle,
  rejected: AlertTriangle
};

export default function TransactionStateManager({ transaction, user, userRole, onStateChange }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const currentStatus = transaction?.status || 'offer_made';
  const allowedTransitions = TRANSACTION_STATE_MACHINE[currentStatus] || [];
  
  const handleStatusTransition = async (newStatus, additionalData = {}) => {
    if (!transaction?.id) return;
    
    setIsProcessing(true);
    try {
      // Update transaction with new status and timestamp
      const updateData: any = {
        status: newStatus,
        last_action_by: user?.id,
        ...additionalData
      };
      
      // Add timeline entry
      const timelineEntry = {
        timestamp: new Date().toISOString(),
        status: newStatus,
        user_id: user?.id,
        details: `Transaction status changed to ${newStatus.replace('_', ' ')}`,
        evidence: []
      };
      
      const existingTimeline = (transaction as any)?.timeline || [];
      updateData.timeline = [...existingTimeline, timelineEntry];
      
      await Transaction.update(transaction.id, updateData);
      
      // Log the status change
      await AuditLog.create({
        target_id: transaction.id,
        target_type: 'Transaction',
        actor_email: user?.email || 'system',
        action: 'status_change',
        details: `Transaction status changed from ${currentStatus} to ${newStatus}`,
        changes: {
          status: {
            from: currentStatus,
            to: newStatus
          }
        }
      });
      
      toast({
        title: "Status Updated",
        description: `Deal status changed to ${newStatus.replace('_', ' ')}`
      });
      
      if (onStateChange) {
        onStateChange(newStatus);
      }
      
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Error",
        description: "Failed to update deal status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getActionButtons = () => {
    const buttons = [];
    
    // Role-based action buttons
    if (currentStatus === 'offer_made' && userRole === 'seller') {
      buttons.push(
        <Button 
          key="accept"
          onClick={() => handleStatusTransition('accepted')}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          Accept Offer
        </Button>
      );
      buttons.push(
        <Button 
          key="reject"
          variant="outline"
          onClick={() => handleStatusTransition('rejected')}
          disabled={isProcessing}
        >
          Reject Offer
        </Button>
      );
    }
    
    if (currentStatus === 'accepted' && userRole === 'buyer') {
      buttons.push(
        <Button 
          key="proceed-payment"
          onClick={() => handleStatusTransition('payment_pending')}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Proceed to Payment
        </Button>
      );
    }
    
    if (currentStatus === 'payment_pending' && userRole === 'buyer') {
      buttons.push(
        <Button 
          key="mark-paid"
          onClick={() => handleStatusTransition('paid', { 
            amount_paid: transaction.final_price,
            payment_date: new Date().toISOString()
          })}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          Mark as Paid
        </Button>
      );
    }
    
    if (currentStatus === 'paid' && userRole === 'seller') {
      buttons.push(
        <Button 
          key="arrange-pickup"
          onClick={() => handleStatusTransition('picked_up')}
          disabled={isProcessing}
        >
          Arrange Pickup
        </Button>
      );
    }
    
    if (currentStatus === 'delivered' && userRole === 'buyer') {
      buttons.push(
        <Button 
          key="confirm-delivery"
          onClick={() => handleStatusTransition('rto_done')}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          Confirm Delivery
        </Button>
      );
    }
    
    // Common actions available to both parties
    if (['offer_made', 'negotiating', 'accepted'].includes(currentStatus)) {
      buttons.push(
        <Button 
          key="cancel"
          variant="outline"
          onClick={() => handleStatusTransition('cancelled')}
          disabled={isProcessing}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Cancel Deal
        </Button>
      );
    }
    
    if (['paid', 'picked_up', 'in_transit', 'delivered'].includes(currentStatus)) {
      buttons.push(
        <Button 
          key="dispute"
          variant="outline"
          onClick={() => handleStatusTransition('disputed')}
          disabled={isProcessing}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Raise Dispute
        </Button>
      );
    }
    
    return buttons;
  };
  
  const getCurrentStatusIcon = () => {
    const Icon = STATUS_ICONS[currentStatus] || Clock;
    return <Icon className="w-4 h-4" />;
  };
  
  const getStatusDescription = (status) => {
    const descriptions = {
      offer_made: 'Initial offer has been made and is awaiting response',
      negotiating: 'Both parties are negotiating the deal terms',
      accepted: 'Offer has been accepted, awaiting payment',
      payment_pending: 'Payment is pending from buyer',
      paid: 'Payment completed, ready for pickup/delivery',
      picked_up: 'Vehicle has been picked up for transport',
      in_transit: 'Vehicle is in transit to buyer location',
      delivered: 'Vehicle has been delivered to buyer',
      rto_done: 'RTO transfer completed successfully',
      completed: 'Deal completed successfully',
      cancelled: 'Deal has been cancelled',
      disputed: 'Deal is under dispute resolution',
      archived: 'Deal has been archived',
      expired: 'Deal offer has expired',
      payment_timeout: 'Payment timed out',
      rejected: 'Offer was rejected'
    };
    return descriptions[status] || 'Unknown status';
  };
  
  if (!transaction) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Transaction data not available</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCurrentStatusIcon()}
          Deal Status: {currentStatus.replace('_', ' ').toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={STATUS_COLORS[currentStatus]}>
            {currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-sm text-slate-600">
            as {userRole === 'buyer' ? 'Buyer' : 'Seller'}
          </span>
        </div>
        
        <p className="text-sm text-slate-600">
          {getStatusDescription(currentStatus)}
        </p>
        
        {transaction.final_price && (
          <p className="text-sm">
            <span className="font-medium">Deal Amount:</span> {formatCurrency(transaction.final_price)}
          </p>
        )}
        
        {transaction.expires_at && ['offer_made', 'negotiating'].includes(currentStatus) && (
          <p className="text-sm text-orange-600">
            <span className="font-medium">Expires:</span> {formatDate(transaction.expires_at, 'datetime')}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 pt-2">
          {getActionButtons()}
        </div>
        
        {isProcessing && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>Processing status change...</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}