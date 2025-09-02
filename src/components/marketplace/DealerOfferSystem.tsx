import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Handshake,
  Clock,
  DollarSign,
  MessageSquare,
  Calendar,
  Truck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Send,
  Calculator,
  Percent,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { Transaction, Dealer } from '@/api/entities';

import { Database } from '@/types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Dealer = Database['public']['Tables']['dealers']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

interface DealerOfferSystemProps {
  vehicle: Vehicle;
  seller: Dealer;
  buyer: Dealer;
  isOpen: boolean;
  onClose: () => void;
  onOfferSubmitted: (offer: Transaction) => void;
}

interface OfferConfig {
  offerAmount: number;
  holdDuration: number; // hours
  paymentTerms: string;
  deliveryTimeline: string;
  specialConditions: string;
  financingRequested: boolean;
  insuranceRequested: boolean;
  rtoRequested: boolean;
  logisticsRequested: boolean;
}

const DealerOfferSystem: React.FC<DealerOfferSystemProps> = ({
  vehicle,
  seller,
  buyer,
  isOpen,
  onClose,
  onOfferSubmitted
}) => {
  const [offerConfig, setOfferConfig] = useState<OfferConfig>({
    offerAmount: vehicle?.asking_price || 0,
    holdDuration: 24,
    paymentTerms: 'immediate',
    deliveryTimeline: 'immediate',
    specialConditions: '',
    financingRequested: false,
    insuranceRequested: false,
    rtoRequested: false,
    logisticsRequested: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerType, setOfferType] = useState<'offer' | 'hold_request'>('offer');
  const { toast } = useToast();

  useEffect(() => {
    if (vehicle?.asking_price) {
      setOfferConfig(prev => ({
        ...prev,
        offerAmount: vehicle.asking_price
      }));
    }
  }, [vehicle]);

  const handleOfferAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setOfferConfig(prev => ({
      ...prev,
      offerAmount: amount
    }));
  };

  const handleHoldDurationChange = (value: number[]) => {
    setOfferConfig(prev => ({
      ...prev,
      holdDuration: value[0]
    }));
  };

  const calculateOfferPercentage = () => {
    if (!vehicle?.asking_price) return 0;
    const percentage = ((offerConfig.offerAmount - vehicle.asking_price) / vehicle.asking_price) * 100;
    return percentage;
  };

  const getOfferTypeColor = () => {
    const percentage = calculateOfferPercentage();
    if (percentage > 10) return 'text-red-600 bg-red-50';
    if (percentage < -10) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getOfferTypeLabel = () => {
    const percentage = calculateOfferPercentage();
    if (percentage > 10) return 'Premium Offer';
    if (percentage < -10) return 'Discount Offer';
    return 'Market Offer';
  };

  const submitOffer = async () => {
    if (!buyer || !seller || !vehicle) {
      toast({
        title: 'Error',
        description: 'Missing required information.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const timeline = [{
        timestamp: new Date().toISOString(),
        status: offerType === 'offer' ? 'offer_made' : 'hold_requested',
        user_id: buyer.id,
        details: offerType === 'offer'
          ? `Offer of ₹${offerConfig.offerAmount.toLocaleString()} made with ${offerConfig.holdDuration}h hold`
          : `Hold request for ${offerConfig.holdDuration}h on vehicle`
      }];

      const transactionData = {
        vehicle_id: vehicle.id,
        seller_id: seller.id,
        buyer_id: buyer.id,
        status: offerType === 'offer' ? 'offer_made' : 'hold_requested',
        amount: offerConfig.offerAmount,
        initial_offer: offerConfig.offerAmount,
        current_offer: offerConfig.offerAmount,
        timeline: timeline,
        metadata: {
          offer_config: offerConfig,
          offer_type: offerType,
          special_conditions: offerConfig.specialConditions,
          financing_requested: offerConfig.financingRequested,
          insurance_requested: offerConfig.insuranceRequested,
          rto_requested: offerConfig.rtoRequested,
          logistics_requested: offerConfig.logisticsRequested
        },
        notes: `Dealer ${offerType === 'offer' ? 'offer' : 'hold request'} submitted`
      };

      const newTransaction = await Transaction.create(transactionData);

      toast({
        title: offerType === 'offer' ? 'Offer Submitted!' : 'Hold Request Submitted!',
        description: `Your ${offerType === 'offer' ? 'offer' : 'hold request'} has been sent to the seller.`,
      });

      onOfferSubmitted?.(newTransaction);
      onClose();

    } catch (error) {
      console.error('Error submitting offer:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your offer. Please try again.',
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

  const percentage = calculateOfferPercentage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            {offerType === 'offer' ? 'Make Dealer Offer' : 'Request Vehicle Hold'}
          </DialogTitle>
          <DialogDescription>
            {offerType === 'offer'
              ? 'Submit a competitive offer for this vehicle'
              : 'Request a temporary hold on this vehicle'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Offer Type Toggle */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="offer"
                name="offerType"
                checked={offerType === 'offer'}
                onChange={() => setOfferType('offer')}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="offer" className="flex items-center gap-2 cursor-pointer">
                <DollarSign className="w-4 h-4" />
                Make Offer
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="hold"
                name="offerType"
                checked={offerType === 'hold_request'}
                onChange={() => setOfferType('hold_request')}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="hold" className="flex items-center gap-2 cursor-pointer">
                <Clock className="w-4 h-4" />
                Request Hold
              </Label>
            </div>
          </div>

          {/* Vehicle Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {vehicle?.year} {vehicle?.make} {vehicle?.model}
                  </h3>
                  <p className="text-slate-600">{vehicle?.variant}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>📍 {vehicle?.location_city}</span>
                    <span>⛽ {vehicle?.fuel_type}</span>
                    <span>⚙️ {vehicle?.transmission}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Asking Price</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(vehicle?.asking_price || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price & Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {offerType === 'offer' ? 'Offer Details' : 'Hold Request'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {offerType === 'offer' && (
                  <>
                    {/* Offer Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="offer-amount">Your Offer Amount (₹)</Label>
                      <Input
                        id="offer-amount"
                        type="number"
                        value={offerConfig.offerAmount}
                        onChange={(e) => handleOfferAmountChange(e.target.value)}
                        placeholder="Enter offer amount"
                        className="text-lg"
                      />
                    </div>

                    {/* Offer Analysis */}
                    <div className={`p-3 rounded-lg ${getOfferTypeColor()}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getOfferTypeLabel()}</span>
                        <Badge variant="outline">
                          {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">
                        {percentage > 10 && 'Above market value - may reduce acceptance chance'}
                        {percentage < -10 && 'Below market value - competitive pricing'}
                        {percentage >= -10 && percentage <= 10 && 'Fair market offer'}
                      </p>
                    </div>
                  </>
                )}

                {/* Hold Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Hold Duration</Label>
                    <Badge variant="outline">{offerConfig.holdDuration}h</Badge>
                  </div>
                  <Slider
                    value={[offerConfig.holdDuration]}
                    onValueChange={handleHoldDurationChange}
                    max={168} // 7 days
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1h</span>
                    <span>24h</span>
                    <span>72h</span>
                    <span>168h (7 days)</span>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={offerConfig.paymentTerms}
                    onValueChange={(value) => setOfferConfig(prev => ({ ...prev, paymentTerms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate Payment</SelectItem>
                      <SelectItem value="7_days">Within 7 days</SelectItem>
                      <SelectItem value="15_days">Within 15 days</SelectItem>
                      <SelectItem value="30_days">Within 30 days</SelectItem>
                      <SelectItem value="financing">Through Financing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Timeline */}
                <div className="space-y-2">
                  <Label>Delivery Timeline</Label>
                  <Select
                    value={offerConfig.deliveryTimeline}
                    onValueChange={(value) => setOfferConfig(prev => ({ ...prev, deliveryTimeline: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="3_days">Within 3 days</SelectItem>
                      <SelectItem value="7_days">Within 7 days</SelectItem>
                      <SelectItem value="14_days">Within 14 days</SelectItem>
                      <SelectItem value="30_days">Within 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Additional Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="financing" className="flex items-center gap-2 cursor-pointer">
                      <Percent className="w-4 h-4" />
                      Financing
                    </Label>
                    <Switch
                      id="financing"
                      checked={offerConfig.financingRequested}
                      onCheckedChange={(checked) =>
                        setOfferConfig(prev => ({ ...prev, financingRequested: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="insurance" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" />
                      Insurance
                    </Label>
                    <Switch
                      id="insurance"
                      checked={offerConfig.insuranceRequested}
                      onCheckedChange={(checked) =>
                        setOfferConfig(prev => ({ ...prev, insuranceRequested: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="rto" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="w-4 h-4" />
                      RTO Transfer
                    </Label>
                    <Switch
                      id="rto"
                      checked={offerConfig.rtoRequested}
                      onCheckedChange={(checked) =>
                        setOfferConfig(prev => ({ ...prev, rtoRequested: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="logistics" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="w-4 h-4" />
                      Logistics
                    </Label>
                    <Switch
                      id="logistics"
                      checked={offerConfig.logisticsRequested}
                      onCheckedChange={(checked) =>
                        setOfferConfig(prev => ({ ...prev, logisticsRequested: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Special Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="conditions">Special Conditions or Notes</Label>
                  <Textarea
                    id="conditions"
                    placeholder="Any special conditions, trade-in details, or additional notes..."
                    value={offerConfig.specialConditions}
                    onChange={(e) => setOfferConfig(prev => ({ ...prev, specialConditions: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{seller?.business_name}</h4>
                  <p className="text-sm text-slate-600">{seller?.city}, {seller?.state}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {seller?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                    {seller?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{seller.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={seller?.verification_status === 'verified' ? 'default' : 'secondary'}>
                    {seller?.verification_status === 'verified' ? 'Verified Dealer' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={submitOffer}
            disabled={isSubmitting || !offerConfig.offerAmount}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {offerType === 'offer' ? 'Submit Offer' : 'Request Hold'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealerOfferSystem;
