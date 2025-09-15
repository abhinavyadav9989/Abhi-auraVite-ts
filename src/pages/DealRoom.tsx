
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Transaction, Vehicle, Dealer, Payment, LogisticsOrder, RTOApplication } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  IndianRupee,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Phone,
  MessageCircle,
  RefreshCw,
  Share2 // New Icon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ChatMessages from "../components/deal-room/ChatMessages";
import VehicleSidebar from "../components/deal-room/VehicleSidebar";
import ActionPanel from "../components/deal-room/ActionPanel";
import LogisticsBookingModal from "../components/deals/LogisticsBookingModal";
import RTOApplicationModal from "../components/deals/RTOApplicationModal";
import DealerRatingSystem from '../components/ratings/DealerRatingSystem';
import { DealerRating } from '@/api/entities';
import DisputeModal from '../components/deals/DisputeModal'; // New import
import PaymentBreakdownModal from '../components/payments/PaymentBreakdownModal'; // New import
import DealRoomPricingRibbon from '../components/deal-room/DealRoomPricingRibbon'; // Import the new ribbon
import RetailShareModal from '../components/marketplace/RetailShareModal'; // Import for B2C share

export default function DealRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [showRTOModal, setShowRTOModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false); // New
  const [showPaymentModal, setShowPaymentModal] = useState(false); // New
  const [paymentAmount, setPaymentAmount] = useState(0); // New
  const [showRetailShareModal, setShowRetailShareModal] = useState(false); // New state for modal


  useEffect(() => {
    loadDealRoomData();

    // Set up real-time updates (mock WebSocket)
    const wsInterval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(wsInterval);
  }, [location.search]);

  const loadDealRoomData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const transactionId = params.get('id');

      if (!transactionId) {
        setError('No transaction ID provided.');
        setIsLoading(false);
        return;
      }

      const user = await User.me();
      setCurrentUser(user);

      const dealerProfile = await Dealer.filter({ created_by: user.email });
      if (dealerProfile.length > 0) {
        setCurrentDealer(dealerProfile[0]);
      } else {
        setError("Could not find your dealer profile.");
        setIsLoading(false);
        return;
      }

      const transactionData = await Transaction.get(transactionId);
      if (!transactionData) {
        setError('Transaction not found.');
        setIsLoading(false);
        return;
      }

      setTransaction(transactionData);

      // Determine user role
      const role = dealerProfile[0].id === transactionData.buyer_id
        ? 'buyer'
        : 'seller';
      setUserRole(role);

      // Load related data
      const [vehicleData, buyerData, sellerData] = await Promise.all([
        Vehicle.get(transactionData.vehicle_id),
        Dealer.get(transactionData.buyer_id),
        Dealer.get(transactionData.seller_id)
      ]);

      setVehicle(vehicleData);
      setBuyer(buyerData);
      setSeller(sellerData);

    } catch (err) {
      console.error('Error loading deal room data:', err);
      setError('Failed to load deal details.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!transaction) return;

    setIsRefreshing(true);
    try {
      const updatedTransaction = await Transaction.get(transaction.id);
      setTransaction(updatedTransaction);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setIsRefreshing(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentDealer) return;

    try {
      const message = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user_id: currentDealer.id,
        type: 'message',
        content: newMessage.trim(),
        metadata: {
          user_name: currentDealer.business_name
        }
      };

      const updatedMessages = [...(transaction.messages || []), message];

      await Transaction.update(transaction.id, {
        messages: updatedMessages,
        last_action_by: currentDealer.id
      });

      setTransaction(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogisticsBooked = async (logisticsId) => {
    try {
      await Transaction.update(transaction.id, {
        logistics_id: logisticsId,
        status: 'picked_up' // Assuming booking implies immediate pickup for simplicity
      });
      setShowLogisticsModal(false);
      refreshData();
    } catch (e) {
      console.error("Failed to update transaction after logistics booking", e);
    }
  };

  const handleRTOSubmitted = async (rtoId) => {
    try {
      await Transaction.update(transaction.id, {
        rto_id: rtoId,
        status: 'rto_done'
      });
      setShowRTOModal(false);
      refreshData();
    } catch (e) {
      console.error("Failed to update transaction after RTO submission", e);
    }
  };

  const handleRatingSubmitted = async (ratingData) => {
    try {
      // Insert into dealer_ratings (aggregates update via trigger)
      const ratedDealerId = userRole === 'buyer' ? seller?.id : buyer?.id;
      const raterDealerId = currentDealer?.id;
      if (!ratedDealerId || !raterDealerId) throw new Error('Missing dealer ids for rating');

      const payload = {
        rated_dealer_id: ratedDealerId,
        rater_dealer_id: raterDealerId,
        transaction_id: transaction.id,
        overall: Math.round((ratingData.overall_rating ?? ratingData.rating) as number),
        communication: ratingData.category_ratings?.communication,
        vehicle_condition: ratingData.category_ratings?.vehicle_condition,
        professionalism: ratingData.category_ratings?.professionalism,
        transaction_experience: ratingData.category_ratings?.transaction,
        comment: ratingData.review_text ?? ratingData.comment ?? null
      } as any;

      // Idempotent upsert: update existing rating if present
      const existing = await DealerRating.filter({
        rater_dealer_id: raterDealerId,
        rated_dealer_id: ratedDealerId,
        transaction_id: transaction.id
      });
      if (Array.isArray(existing) && existing.length > 0) {
        await DealerRating.update(existing[0].id, payload);
      } else {
        await DealerRating.create(payload);
      }

      const ratingField = userRole === 'buyer' ? 'buyer_rated' : 'seller_rated';
      await Transaction.update(transaction.id, { [ratingField]: true });

      setShowRatingModal(false);
      // Refresh dealer summaries
      const [buyerData, sellerData] = await Promise.all([
        Dealer.get(transaction.buyer_id),
        Dealer.get(transaction.seller_id)
      ]);
      setBuyer(buyerData);
      setSeller(sellerData);
      refreshData();
    } catch (e) {
      console.error("Failed to submit rating", e);
    }
  };
  
  const handleRaiseDispute = async (reason) => {
    try {
      await Transaction.update(transaction.id, {
        status: 'disputed',
        dispute_reason: reason,
        last_action_by: currentDealer.id,
      });
      setShowDisputeModal(false);
      refreshData();
    } catch (e) {
      console.error("Failed to raise dispute", e);
    }
  };
  
  const handleInitiatePayment = (amount) => {
    setPaymentAmount(amount);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentDetails) => {
    try {
      const newAmountPaid = (transaction.amount_paid || 0) + paymentDetails.amount;
      const newStatus = newAmountPaid >= transaction.final_price ? 'paid' : 'payment_pending';
      
      await Transaction.update(transaction.id, {
        status: newStatus,
        amount_paid: newAmountPaid,
        last_action_by: currentDealer.id
      });
      
      setShowPaymentModal(false);
      refreshData();
    } catch(e) {
      console.error("Failed to update transaction after payment", e);
    }
  };


  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-4">{error}</h2>
        <Link to={createPageUrl('Deals')}>
          <Button>Back to Deals</Button>
        </Link>
      </div>
    );
  }

  const counterParty = userRole === 'buyer' ? seller : buyer;
  // const formatPrice = (price) => price ? `₹${(price / 100000).toFixed(1)}L` : 'N/A'; // This is now handled by the ribbon

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Deals")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(transaction.status)} font-medium`}
                >
                  {transaction.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">
                  {vehicle?.registration_number}
                </span>
                {/* Price display moved to DealRoomPricingRibbon */}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* New Pricing Ribbon */}
          <div className="mb-6">
            <DealRoomPricingRibbon
              transaction={transaction}
              vehicle={vehicle}
              userRole={userRole}
            />
          </div>
          
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Vehicle & Party Details */}
            <div className="lg:col-span-1 space-y-6">
              <VehicleSidebar vehicle={vehicle} />

              {/* Add Share to Customer button for buyer */}
              {userRole === 'buyer' && transaction.status === 'paid' && (
                  <Button 
                    className="w-full gap-2"
                    onClick={() => setShowRetailShareModal(true)}
                  >
                    <Share2 className="w-4 h-4"/>
                    Share to Customer
                  </Button>
              )}
              {/* Counter Party Info */}
              {counterParty && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {counterParty.business_name?.[0]?.toUpperCase() || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{counterParty.business_name}</div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{counterParty.rating || '4.2'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{counterParty.phone}</span>
                      </div>
                      <div className="text-slate-600">
                        {counterParty.city}, {counterParty.state}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-2">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Center - Chat & Timeline */}
            <div className="lg:col-span-2 min-h-0">
              <Card className="h-[600px] flex flex-col min-h-0">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Negotiation & Updates</CardTitle>
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <ChatMessages
                      messages={transaction.messages || []}
                      timeline={transaction.timeline || []}
                      currentUserId={currentDealer?.id}
                      dealers={{ [buyer?.id]: buyer, [seller?.id]: seller }}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="resize-none bg-white dark:bg-slate-800 dark:text-slate-100"
                        rows={2}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right - Action Panel */}
            <div className="lg:col-span-1">
              <ActionPanel
                transaction={transaction}
                userRole={userRole}
                currentDealer={currentDealer}
                onUpdate={refreshData}
                onBookTransport={() => setShowLogisticsModal(true)}
                onStartRTO={() => setShowRTOModal(true)}
                onRateDeal={() => setShowRatingModal(true)}
                onRaiseDispute={() => setShowDisputeModal(true)}
                onInitiatePayment={handleInitiatePayment}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLogisticsModal && (
        <LogisticsBookingModal
          transaction={transaction}
          vehicle={vehicle}
          buyer={buyer}
          seller={seller}
          onClose={() => setShowLogisticsModal(false)}
          onComplete={handleLogisticsBooked}
        />
      )}

      {showRTOModal && (
        <RTOApplicationModal
          transaction={transaction}
          buyer={buyer}
          seller={seller}
          onClose={() => setShowRTOModal(false)}
          onComplete={handleRTOSubmitted}
        />
      )}

      {showRatingModal && (
        <DealerRatingSystem
          dealerId={counterParty?.id}
          dealerName={counterParty?.business_name}
          transactionId={transaction.id}
          userRole={userRole}
          onSubmitRating={handleRatingSubmitted}
        />
      )}

      {showDisputeModal && (
        <DisputeModal
          onClose={() => setShowDisputeModal(false)}
          onSubmit={handleRaiseDispute}
        />
      )}

      {showPaymentModal && (
        <PaymentBreakdownModal
          amount={paymentAmount}
          finalPrice={transaction.final_price}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentComplete}
        />
      )}
      
      {showRetailShareModal && (
          <RetailShareModal
              vehicle={vehicle}
              transaction={transaction}
              onClose={() => setShowRetailShareModal(false)}
          />
      )}

    </div>
  );
}

// Helper function for status colors
function getStatusColor(status) {
  const colors = {
    offer_made: "bg-blue-100 text-blue-700",
    negotiating: "bg-orange-100 text-orange-700",
    accepted: "bg-green-100 text-green-700",
    payment_pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-purple-100 text-purple-700",
    picked_up: "bg-indigo-100 text-indigo-700",
    in_transit: "bg-cyan-100 text-cyan-700",
    delivered: "bg-emerald-100 text-emerald-700",
    rto_done: "bg-pink-100 text-pink-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-red-100 text-red-700"
  };
  return colors[status] || "bg-slate-100 text-slate-700";
}
