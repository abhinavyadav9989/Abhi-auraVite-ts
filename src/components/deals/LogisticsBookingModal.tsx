import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, MapPin, Building2, User, Loader2 } from 'lucide-react';
import { LogisticsOrder } from '@/api/entities';

const MOCK_PROVIDERS = [
  { id: 'delhivery', name: 'Delhivery Surface', cost: 8500, time: '5-7 days' },
  { id: 'rivigo', name: 'Rivigo Express', cost: 12000, time: '3-4 days' },
  { id: 'safexpress', name: 'Safexpress Premium', cost: 15500, time: '2-3 days' },
];

export default function LogisticsBookingModal({ transaction, vehicle, buyer, seller, onClose, onComplete }) {
  const [provider, setProvider] = useState(MOCK_PROVIDERS[0].id);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  const selectedProvider = MOCK_PROVIDERS.find(p => p.id === provider);

  const handleBooking = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const logisticsData = {
        transaction_id: transaction.id,
        provider: selectedProvider.name,
        status: 'booked',
        pickup_address: `${seller.address}, ${seller.city}, ${seller.state}`,
        delivery_address: `${buyer.address}, ${buyer.city}, ${buyer.state}`,
        tracking_number: `AURATRACK${Date.now()}`
      };
      
      const newOrder = await LogisticsOrder.create(logisticsData);
      onComplete(newOrder.id);
    } catch (e) {
      console.error("Logistics booking failed:", e);
      setError("Booking failed. Please try again.");
    }
    setIsBooking(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Book Vehicle Transport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Addresses */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-slate-500"><Building2 className="w-3 h-3" /> Pickup From</Label>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-semibold">{seller.business_name}</p>
                <p>{seller.address}</p>
                <p>{seller.city}, {seller.state}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" /> Deliver To</Label>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-semibold">{buyer.business_name}</p>
                <p>{buyer.address}</p>
                <p>{buyer.city}, {buyer.state}</p>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Select Logistics Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - ₹{p.cost.toLocaleString()} ({p.time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleBooking} disabled={isBooking}>
              {isBooking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Truck className="w-4 h-4 mr-2" />
              )}
              Confirm Booking (₹{selectedProvider.cost.toLocaleString()})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}