
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components
import {
  ArrowLeft, Heart, Share2, Download, Eye, Phone, MessageCircle, Calculator,
  IndianRupee, Calendar, Gauge, Fuel, Settings, Users, MapPin, Star,
  ChevronDown, ChevronUp, Info, Shield, Clock, Truck, FileText,
  Car, Wrench, Zap, Palette, Award, CheckCircle, AlertTriangle, Loader2 // Added Loader2
} from 'lucide-react';

// Import components
import VehicleMediaGallery from '../components/vehicle-view/VehicleMediaGallery';
import EMICalculator from '../components/vehicle-view/EMICalculator';
import AccessoriesSection from '../components/vehicle-view/AccessoriesSection';
import ServiceSection from '../components/vehicle-view/ServiceSection';
import MarketplaceMetrics from '../components/vehicle-view/MarketplaceMetrics';
import OfferModal from '../components/marketplace/OfferModal';
import ShareModal from '../components/vehicle-view/ShareModal';
import FullScreenGallery from '../components/vehicle-view/FullScreenGallery'; // Added FullScreenGallery

export default function VehicleView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vehicle, setVehicle] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [user, setUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  
  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false); // New state for full screen gallery
  
  const vehicleId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle ID provided.');
      setIsLoading(false);
      return;
    }
    fetchVehicleData();
    trackVehicleView();
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      const [currentUser, vehicleData] = await Promise.all([
        User.me().catch(() => null), // Allow anonymous viewing
        Vehicle.get(vehicleId)
      ]);
      
      if (!vehicleData) {
        setError('Vehicle not found.');
        return;
      }
      
      setUser(currentUser);
      setVehicle(vehicleData);
      
      const [dealerData, currentDealerData] = await Promise.all([
        Dealer.get(vehicleData.dealer_id),
        currentUser ? Dealer.filter({ created_by: currentUser.email }) : Promise.resolve([])
      ]);
      
      setDealer(dealerData);
      if (currentDealerData.length > 0) setCurrentDealer(currentDealerData[0]);

    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError('Failed to load vehicle details.');
    } finally {
      setIsLoading(false);
    }
  };

  const trackVehicleView = async () => {
    try {
      // Mock view tracking - in real app would increment view counter
      setViewCount(Math.floor(Math.random() * 50) + 10);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleSaveVehicle = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to save vehicles to your shortlist." });
      return;
    }
    
    setIsSaved(!isSaved);
    toast({ 
      title: isSaved ? "Removed from Shortlist" : "Saved to Shortlist",
    });
  };

  const handleExpressInterest = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to express interest in vehicles." });
      return;
    }

    toast({ 
      title: "Interest recorded", 
      description: `We've notified ${dealer.business_name} about your interest.`
    });
  };

  const handleContactDealer = () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to contact dealers directly." });
      return;
    }
    
    // In real app, would open phone dialer or messaging interface
    toast({ title: "Contact initiated", description: "Opening contact options..." });
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!vehicle) return null; // Added check for vehicle being null after loading

  const isOwner = currentDealer?.id === vehicle?.dealer_id;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
            <p className="text-sm text-slate-600">{vehicle.registration_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSaveVehicle}>
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowShareModal(true)}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Vehicle Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Media Gallery */}
          <VehicleMediaGallery 
            images={vehicle.images || []}
            videos={vehicle.videos || []}
            onImageClick={() => setShowGallery(true)}
          />

          {/* Finance Information */}
          <EMICalculator vehiclePrice={vehicle.asking_price || 0} onClose={() => {}} />

          {/* Insurance & Warranty */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provider</span>
                  <span className="font-medium">HDFC ERGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type</span>
                  <Badge className="bg-green-100 text-green-700">Zero Dip</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Expires</span>
                  <span className="font-medium">Dec 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">IDV</span>
                  <span className="font-medium">₹8.5L</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                  Warranty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Type</span>
                  <span className="font-medium">Manufacturer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-medium">2 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid Until</span>
                  <span className="font-medium">March 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kilometers</span>
                  <span className="font-medium">40,000 km</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accessories */}
          <AccessoriesSection />

          {/* Service & Maintenance */}
          <ServiceSection />
        </div>

        {/* Right Column - Pricing & Actions */}
        <div className="lg:col-span-2 space-y-6"> {/* Adjusted column span for right column */}
          {/* Price Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-slate-600 mb-1">Asking Price</div>
                  <div className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-1">
                    <IndianRupee className="w-6 h-6" />
                    {formatPrice(vehicle.asking_price)}
                  </div>
                </div>

                {/* Marketplace Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-green-700">Marketplace Price:</span>
                    <span className="font-semibold">₹{((vehicle.asking_price || 0) * 1.03 / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-green-700">Discount (5%):</span>
                    <span className="font-semibold">-₹{((vehicle.asking_price || 0) * 0.05 / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-green-700">Effective Price:</span>
                    <span className="font-semibold">₹{((vehicle.asking_price || 0) * 0.98 / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="bg-green-200 h-px w-full my-2" />
                  <div className="flex justify-between">
                    <span className="text-green-700">Commission:</span>
                    <span className="font-semibold">₹{((vehicle.asking_price || 0) * 0.02 / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {!isOwner && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white" 
                      onClick={() => setShowOfferModal(true)}
                      disabled={vehicle.status !== 'live'}
                    >
                      Make Offer
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleExpressInterest}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Express Interest
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleContactDealer}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Dealer
                  </Button>
                </div>

                {/* Dealer Information */}
                {dealer && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {dealer.business_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{dealer.business_name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{dealer.rating?.toFixed(1) || '4.2'}</span>
                          <span>({dealer.total_deals || 15} deals)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>{dealer.city}, {dealer.state}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Avg response: 2 hours</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Metrics */}
          <MarketplaceMetrics 
            viewCount={viewCount}
            saveCount={Math.floor(Math.random() * 15) + 5}
            inquiryCount={Math.floor(Math.random() * 8) + 2}
            isOwner={isOwner}
          />

          {/* Vehicle Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year
                  </span>
                  <span className="font-medium">{vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Kilometers
                  </span>
                  <span className="font-medium">{vehicle.kilometers?.toLocaleString() || 'N/A'} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Fuel className="w-4 h-4" />
                    Fuel Type
                  </span>
                  <span className="font-medium capitalize">{vehicle.fuel_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Transmission
                  </span>
                  <span className="font-medium capitalize">{vehicle.transmission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Ownership
                  </span>
                  <span className="font-medium">{vehicle.ownership} owner</span>
                </div>
                {vehicle.color && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Color
                    </span>
                    <span className="font-medium capitalize">{vehicle.color}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODALS */}
      {showGallery && (
        <FullScreenGallery 
          images={vehicle.images}
          onClose={() => setShowGallery(false)}
        />
      )}

      {showOfferModal && (
        <OfferModal 
          vehicle={vehicle} 
          dealer={dealer} 
          currentDealer={currentDealer} 
          onClose={() => setShowOfferModal(false)} 
        />
      )}
      
      {showShareModal && (
        <ShareModal 
          vehicle={vehicle} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
}
