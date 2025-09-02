import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  TrendingUp,
  TrendingDown,
  Handshake,
  AlertTriangle,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Transaction, Dealer } from '@/api/entities';
import { formatDistanceToNow, format } from 'date-fns';

interface NegotiationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'buyer' | 'seller';
  message: string;
  offer_amount?: number;
  timestamp: string;
  type: 'message' | 'offer' | 'counter_offer' | 'accept' | 'reject' | 'hold_request';
}

import { Database } from '@/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type User = Database['auth']['Tables']['users']['Row'];

interface DealerNegotiationPanelProps {
  transaction: Transaction;
  currentUser: User;
  onNegotiationUpdate: (updatedTransaction: Transaction) => void;
}

const DealerNegotiationPanel: React.FC<DealerNegotiationPanelProps> = ({
  transaction,
  currentUser,
  onNegotiationUpdate
}) => {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newOfferAmount, setNewOfferAmount] = useState(transaction?.current_offer || transaction?.amount || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [buyer, setBuyer] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const { toast } = useToast();

  // Determine if current user is buyer or seller
  const isBuyer = currentUser?.id === transaction?.buyer_id;
  const isSeller = currentUser?.id === transaction?.seller_id;

  useEffect(() => {
    loadNegotiationData();
  }, [transaction]);

  const loadNegotiationData = async () => {
    try {
      // Load buyer and seller information
      if (transaction?.buyer_id) {
        const buyerData = await Dealer.get(transaction.buyer_id);
        setBuyer(buyerData);
      }
      if (transaction?.seller_id) {
        const sellerData = await Dealer.get(transaction.seller_id);
        setSeller(sellerData);
      }

      // Load negotiation messages from timeline
      if (transaction?.timeline && Array.isArray(transaction.timeline)) {
        const negotiationMessages: NegotiationMessage[] = (transaction.timeline as Array<{
          timestamp: string;
          status: string;
          user_id: string;
          details?: string;
          amount?: number;
        }>).map((entry, index: number) => ({
          id: `msg_${index}`,
          sender_id: entry.user_id,
          sender_name: getUserName(entry.user_id),
          sender_type: entry.user_id === transaction.buyer_id ? 'buyer' : 'seller',
          message: entry.details || '',
          offer_amount: entry.amount,
          timestamp: entry.timestamp,
          type: entry.status === 'offer_made' ? 'offer' :
                entry.status === 'counter_offer' ? 'counter_offer' :
                entry.status === 'accept' ? 'accept' :
                entry.status === 'reject' ? 'reject' :
                entry.status === 'hold_requested' ? 'hold_request' : 'message'
        }));
        setMessages(negotiationMessages);
      }
    } catch (error) {
      console.error('Error loading negotiation data:', error);
    }
  };

  const getUserName = (userId: string) => {
    if (userId === transaction?.buyer_id && buyer) {
      return buyer.business_name || 'Buyer';
    }
    if (userId === transaction?.seller_id && seller) {
      return seller.business_name || 'Seller';
    }
    return 'Unknown User';
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        status: 'message',
        user_id: currentUser.id,
        details: newMessage
      };

      const updatedTimeline = [...(transaction.timeline || []), newTimelineEntry];
      const updatedTransaction = await Transaction.update(transaction.id, {
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      });

      // Add to local messages
      const message: NegotiationMessage = {
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: getUserName(currentUser.id),
        sender_type: isBuyer ? 'buyer' : 'seller',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      onNegotiationUpdate(updatedTransaction);

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message Failed',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeOffer = async (offerType: 'offer' | 'counter_offer') => {
    if (!newOfferAmount || newOfferAmount <= 0) {
      toast({
        title: 'Invalid Offer',
        description: 'Please enter a valid offer amount.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const status = offerType === 'offer' ? 'offer_made' : 'counter_offer';
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        status: status,
        user_id: currentUser.id,
        amount: newOfferAmount,
        details: `${offerType === 'offer' ? 'New offer' : 'Counter-offer'} of ₹${newOfferAmount.toLocaleString()}`
      };

      const updatedTimeline = [...(transaction.timeline || []), newTimelineEntry];
      const updatedTransaction = await Transaction.update(transaction.id, {
        current_offer: newOfferAmount,
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      });

      // Add to local messages
      const message: NegotiationMessage = {
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: getUserName(currentUser.id),
        sender_type: isBuyer ? 'buyer' : 'seller',
        message: `${offerType === 'offer' ? 'New offer' : 'Counter-offer'} of ₹${newOfferAmount.toLocaleString()}`,
        offer_amount: newOfferAmount,
        timestamp: new Date().toISOString(),
        type: offerType
      };

      setMessages(prev => [...prev, message]);
      setIsMakingOffer(false);
      onNegotiationUpdate(updatedTransaction);

      toast({
        title: `${offerType === 'offer' ? 'Offer' : 'Counter-offer'} Sent`,
        description: `Your ${offerType === 'offer' ? 'offer' : 'counter-offer'} has been sent successfully.`,
      });
    } catch (error) {
      console.error('Error making offer:', error);
      toast({
        title: 'Offer Failed',
        description: 'Failed to send offer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptOffer = async () => {
    setIsSubmitting(true);
    try {
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        status: 'accept',
        user_id: currentUser.id,
        amount: transaction.current_offer,
        details: `Offer accepted for ₹${transaction.current_offer?.toLocaleString()}`
      };

      const updatedTimeline = [...(transaction.timeline || []), newTimelineEntry];
      const updatedTransaction = await Transaction.update(transaction.id, {
        status: 'offer_accepted',
        final_price: transaction.current_offer,
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      });

      // Add to local messages
      const message: NegotiationMessage = {
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: getUserName(currentUser.id),
        sender_type: isBuyer ? 'buyer' : 'seller',
        message: `Offer accepted for ₹${transaction.current_offer?.toLocaleString()}`,
        offer_amount: transaction.current_offer,
        timestamp: new Date().toISOString(),
        type: 'accept'
      };

      setMessages(prev => [...prev, message]);
      onNegotiationUpdate(updatedTransaction);

      toast({
        title: 'Offer Accepted',
        description: 'Congratulations! The deal has been finalized.',
      });
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: 'Acceptance Failed',
        description: 'Failed to accept offer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectOffer = async () => {
    setIsSubmitting(true);
    try {
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        status: 'reject',
        user_id: currentUser.id,
        details: 'Offer rejected'
      };

      const updatedTimeline = [...(transaction.timeline || []), newTimelineEntry];
      const updatedTransaction = await Transaction.update(transaction.id, {
        status: 'offer_rejected',
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      });

      // Add to local messages
      const message: NegotiationMessage = {
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: getUserName(currentUser.id),
        sender_type: isBuyer ? 'buyer' : 'seller',
        message: 'Offer rejected',
        timestamp: new Date().toISOString(),
        type: 'reject'
      };

      setMessages(prev => [...prev, message]);
      onNegotiationUpdate(updatedTransaction);

      toast({
        title: 'Offer Rejected',
        description: 'The offer has been rejected.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject offer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'offer': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'counter_offer': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'accept': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'reject': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'hold_request': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'offer': return <Badge variant="outline" className="text-blue-600 border-blue-200">Offer</Badge>;
      case 'counter_offer': return <Badge variant="outline" className="text-orange-600 border-orange-200">Counter-offer</Badge>;
      case 'accept': return <Badge variant="outline" className="text-green-600 border-green-200">Accepted</Badge>;
      case 'reject': return <Badge variant="outline" className="text-red-600 border-red-200">Rejected</Badge>;
      case 'hold_request': return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Hold Request</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Negotiation Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Negotiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Current Offer: <span className="font-semibold text-lg">{formatCurrency(transaction?.current_offer || transaction?.amount || 0)}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Last updated {transaction?.updated_at ? formatDistanceToNow(new Date(transaction.updated_at), { addSuffix: true }) : 'N/A'}
              </p>
            </div>
            <Badge variant={transaction?.status === 'offer_accepted' ? 'default' : 'secondary'}>
              {transaction?.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Negotiation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No negotiation messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender_type === (isBuyer ? 'buyer' : 'seller') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-md ${message.sender_type === (isBuyer ? 'buyer' : 'seller') ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {message.sender_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`space-y-1 ${message.sender_type === (isBuyer ? 'buyer' : 'seller') ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{message.sender_name}</span>
                        {getMessageTypeBadge(message.type)}
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender_type === (isBuyer ? 'buyer' : 'seller')
                          ? 'bg-blue-50 text-blue-900'
                          : 'bg-slate-50 text-slate-900'
                      }`}>
                        <div className="flex items-start gap-2">
                          {getMessageTypeIcon(message.type)}
                          <div className="flex-1">
                            <p className="text-sm">{message.message}</p>
                            {message.offer_amount && (
                              <p className="text-lg font-bold mt-1">
                                {formatCurrency(message.offer_amount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {transaction?.status !== 'offer_accepted' && transaction?.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {!isMakingOffer ? (
                <Button
                  onClick={() => setIsMakingOffer(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {isBuyer ? 'Make Counter-offer' : 'Make New Offer'}
                </Button>
              ) : (
                <div className="flex gap-3 flex-1">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newOfferAmount}
                    onChange={(e) => setNewOfferAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => makeOffer(isBuyer ? 'counter_offer' : 'offer')}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                  <Button
                    onClick={() => setIsMakingOffer(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Accept/Reject buttons for sellers */}
              {isSeller && transaction?.current_offer && transaction?.status === 'offer_made' && (
                <>
                  <Button
                    onClick={acceptOffer}
                    disabled={isSubmitting}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Offer
                  </Button>
                  <Button
                    onClick={rejectOffer}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Offer
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSubmitting}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Seller</h4>
              <div className="space-y-1">
                <p className="text-sm">{seller?.business_name || 'N/A'}</p>
                <p className="text-sm text-slate-600">{seller?.phone || 'N/A'}</p>
                <p className="text-sm text-slate-600">{seller?.email || 'N/A'}</p>
                {seller?.phone && (
                  <Button variant="outline" size="sm" className="mt-2 gap-2">
                    <Phone className="w-3 h-3" />
                    Call Seller
                  </Button>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Buyer</h4>
              <div className="space-y-1">
                <p className="text-sm">{buyer?.business_name || 'N/A'}</p>
                <p className="text-sm text-slate-600">{buyer?.phone || 'N/A'}</p>
                <p className="text-sm text-slate-600">{buyer?.email || 'N/A'}</p>
                {buyer?.phone && (
                  <Button variant="outline" size="sm" className="mt-2 gap-2">
                    <Phone className="w-3 h-3" />
                    Call Buyer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealerNegotiationPanel;
