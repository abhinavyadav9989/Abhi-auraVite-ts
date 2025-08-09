import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { DealerInquiry } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Users, 
  Phone, 
  Mail, 
  MessageCircle,
  IndianRupee,
  Shield,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import OTPModal from '../components/public/OTPModal';

const formatCurrency = (amount) => amount ? `₹${(amount / 100000).toFixed(2)}L` : 'Price on Request';

export default function PublicVehicleView() {
  const location = useLocation();
  const { toast } = useToast();
  
  const [vehicle, setVehicle] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrice, setShowPrice] = useState(true);
  const [retailPrice, setRetailPrice] = useState(null);
  
  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    message: 'I am interested in this vehicle. Please share more details.'
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  useEffect(() => {
    loadVehicleData();
  }, [location.search]);

  const loadVehicleData = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const vehicleId = params.get('id');
      const priceToken = params.get('token');
      const hidePriceParam = params.get('hp');

      if (!vehicleId) {
        setError('Vehicle not found.');
        setIsLoading(false);
        return;
      }

      // F-C1: Decode price from token if provided
      if (priceToken) {
        try {
          const decodedPrice = JSON.parse(atob(priceToken));
          setRetailPrice(decodedPrice.price);
        } catch (e) {
          console.error('Invalid price token:', e);
        }
      }

      // F-C1: Check if price should be hidden
      setShowPrice(hidePriceParam !== '1');

      const vehicleData = await Vehicle.get(vehicleId);
      if (!vehicleData || vehicleData.status !== 'live') {
        setError('Vehicle not available.');
        setIsLoading(false);
        return;
      }

      setVehicle(vehicleData);

      const dealerData = await Dealer.get(vehicleData.dealer_id);
      setDealer(dealerData);

    } catch (err) {
      console.error('Error loading vehicle:', err);
      setError('Failed to load vehicle details.');
    }
    setIsLoading(false);
  };

  const handleInquirySubmit = async (otpVerified = false) => {
    if (!otpVerified) {
      // First, show OTP modal for phone verification
      setShowOTPModal(true);
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      await DealerInquiry.create({
        dealer_id: dealer.id,
        customer_name: inquiryForm.customer_name,
        customer_phone: inquiryForm.customer_phone,
        customer_email: inquiryForm.customer_email,
        message: inquiryForm.message,
        source: 'vehicle_listing',
        vehicle_interest: vehicle.id,
        status: 'new'
      });

      toast({
        title: "Inquiry Sent!",
        description: `${dealer.business_name} will contact you shortly.`,
      });

      setShowInquiryForm(false);
      setInquiryForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        message: 'I am interested in this vehicle. Please share more details.'
      });

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive"
      });
    }
    setIsSubmittingInquiry(false);
    setShowOTPModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-12 h-12 mx-auto text-slate-400 mb-4 animate-pulse" />
          <p className="text-slate-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Vehicle Not Available</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const displayPrice = retailPrice || vehicle.asking_price;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-blue-600">Aura Motors</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">Verified Dealer Network</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Images */}
            <Card>
              <CardContent className="p-0">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img 
                      src={vehicle.images[0]} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <Car className="w-20 h-20 text-slate-400" />
                  </div>
                )}
                
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4 px-4 pb-4">
                    {vehicle.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-100 rounded overflow-hidden">
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.variant && ` ${vehicle.variant}`}
                </CardTitle>
                <div className="flex items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vehicle.location_city}, {vehicle.location_state}
                  </span>
                  <span>Reg: {vehicle.registration_number}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Year</div>
                      <div className="font-medium">{vehicle.year}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Kilometers</div>
                      <div className="font-medium">{vehicle.kilometers?.toLocaleString() || 'N/A'} km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Fuel Type</div>
                      <div className="font-medium capitalize">{vehicle.fuel_type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Transmission</div>
                      <div className="font-medium capitalize">{vehicle.transmission}</div>
                    </div>
                  </div>
                </div>

                {vehicle.description && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-slate-700 leading-relaxed">{vehicle.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-6 text-center">
                {showPrice ? (
                  <>
                    <div className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-1 mb-2">
                      <IndianRupee className="w-8 h-8" />
                      {formatCurrency(displayPrice)}
                    </div>
                    {retailPrice && (
                      <Badge className="bg-green-100 text-green-700">
                        Special Retail Price
                      </Badge>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-bold text-blue-900 mb-2">
                    Price on Request
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowInquiryForm(true)}
                >
                  Get Best Price
                </Button>
              </CardContent>
            </Card>

            {/* Dealer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Verified Dealer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">{dealer?.business_name}</div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{dealer?.rating || '4.5'}</span>
                    <span>({dealer?.total_deals || 12} deals)</span>
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    {dealer?.city}, {dealer?.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Responds in ~2 hours
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Choose Aura?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">100% Verified Dealers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Secure Payment Process</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Transparent Pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Professional Inspection</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
              <p className="text-sm text-slate-600">
                Share your details and {dealer?.business_name} will contact you with the best price.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Name *</label>
                <Input
                  value={inquiryForm.customer_name}
                  onChange={(e) => setInquiryForm(prev => ({...prev, customer_name: e.target.value}))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  value={inquiryForm.customer_phone}
                  onChange={(e) => setInquiryForm(prev => ({...prev, customer_phone: e.target.value}))}
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email (Optional)</label>
                <Input
                  type="email"
                  value={inquiryForm.customer_email}
                  onChange={(e) => setInquiryForm(prev => ({...prev, customer_email: e.target.value}))}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm(prev => ({...prev, message: e.target.value}))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInquiryForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleInquirySubmit(false)}
                  disabled={!inquiryForm.customer_name || !inquiryForm.customer_phone || isSubmittingInquiry}
                  className="flex-1"
                >
                  {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          phoneNumber={inquiryForm.customer_phone}
          onClose={() => setShowOTPModal(false)}
          onVerified={() => handleInquirySubmit(true)}
        />
      )}
    </div>
  );
}