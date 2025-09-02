import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  X,
  Heart,
  MapPin,
  Calendar,
  Fuel,
  Settings2,
  IndianRupee,
  Star,
  ShieldCheck,
  Zap,
  Camera,
  GitCompareArrows,
  Phone,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ExpandedVehicleCardProps {
  vehicle: any;
  dealer: any;
  isOpen: boolean;
  onClose: () => void;
  onCompareToggle: (vehicleId: string) => void;
  isInCompare: boolean;
  onMakeOffer: (vehicle: any) => void;
  isUserVerified: boolean;
  isDealer: boolean;
}

const ExpandedVehicleCard: React.FC<ExpandedVehicleCardProps> = ({
  vehicle = {},
  dealer = {},
  isOpen,
  onClose,
  onCompareToggle,
  isInCompare,
  onMakeOffer,
  isUserVerified,
  isDealer: userIsDealer
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInShortlist, setIsInShortlist] = useState(false);

  // Safe property access with proper defaults
  const vehicleData = {
    id: vehicle?.id || '',
    make: vehicle?.make || 'N/A',
    model: vehicle?.model || 'N/A',
    variant: vehicle?.variant || '',
    year: vehicle?.year || 'N/A',
    asking_price: vehicle?.asking_price || 0,
    kilometers: vehicle?.kilometers || 0,
    fuel_type: vehicle?.fuel_type || 'N/A',
    transmission: vehicle?.transmission || 'N/A',
    location_city: vehicle?.location_city || 'N/A',
    images: Array.isArray(vehicle?.images) ? vehicle.images : [],
    hero_image_url: vehicle?.hero_image_url || '',
    color: vehicle?.color || 'N/A',
    ownership: vehicle?.ownership || 'N/A',
    body_type: vehicle?.body_type || 'N/A',
    created_at: vehicle?.created_at || new Date().toISOString(),
    status: vehicle?.status || 'draft',
    dealer_id: vehicle?.dealer_id || '',
    description: vehicle?.description || 'No description available.',
    engine_displacement: vehicle?.engine_displacement || 'N/A',
    power: vehicle?.power || 'N/A',
    torque: vehicle?.torque || 'N/A',
    mileage: vehicle?.mileage || 'N/A',
    seating_capacity: vehicle?.seating_capacity || 'N/A',
    features: Array.isArray(vehicle?.features) ? vehicle.features : []
  };

  const dealerData = {
    verification_status: dealer?.verification_status || 'pending',
    business_name: dealer?.business_name || 'Unknown Dealer',
    rating: dealer?.rating || 0,
    total_reviews: dealer?.total_reviews || 0,
    phone: dealer?.phone || '',
    whatsapp: dealer?.whatsapp || ''
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return 'On Request';
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const formatKilometers = (kms: number) => {
    if (!kms || kms === 0) return '0 km';
    if (kms >= 1000) return `${(kms / 1000).toFixed(1)}k km`;
    return `${kms} km`;
  };

  const daysAgo = vehicleData.created_at
    ? Math.floor((new Date().getTime() - new Date(vehicleData.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isNew = daysAgo <= 7;

  const allImages = vehicleData.hero_image_url
    ? [vehicleData.hero_image_url, ...vehicleData.images.filter(img => img !== vehicleData.hero_image_url)]
    : vehicleData.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Expanded Card Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h3 className="font-semibold text-lg">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </h3>
                <p className="text-sm text-slate-600">{vehicleData.variant}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCompareToggle(vehicleData.id)}
                className={isInCompare ? 'bg-blue-100' : ''}
              >
                <GitCompareArrows className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            <div className="relative aspect-[4/3] bg-slate-100">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${vehicleData.make} ${vehicleData.model}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      {/* Image Dots */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isNew && (
                      <Badge className="bg-green-500 text-white">New</Badge>
                    )}
                    {dealerData.verification_status === 'verified' && (
                      <Badge className="bg-blue-100 text-blue-700 gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>

            {/* Price & Key Actions */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(vehicleData.asking_price)}
                </div>
                <div className="text-sm text-slate-600">
                  {vehicleData.location_city}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to={createPageUrl(`VehicleDetail?id=${vehicleData.id}`)}>
                  <Button className="w-full" size="lg">
                    View Full Details
                  </Button>
                </Link>
                {isUserVerified ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => onMakeOffer(vehicle)}
                  >
                    Make Offer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => window.location.href = '/OnboardingWizard'}
                  >
                    Complete KYB First
                  </Button>
                )}
              </div>
            </div>

            {/* Key Specs */}
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-3">Key Specifications</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Year:</span>
                  <span className="font-medium">{vehicleData.year}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Fuel className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Fuel:</span>
                  <span className="font-medium capitalize">{vehicleData.fuel_type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Transmission:</span>
                  <span className="font-medium capitalize">{vehicleData.transmission}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">KMs:</span>
                  <span className="font-medium">{formatKilometers(vehicleData.kilometers)}</span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-3">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {isNew && <Badge variant="secondary">New Arrival</Badge>}
                {vehicleData.ownership === 'first' && <Badge variant="secondary">First Owner</Badge>}
                {dealerData.verification_status === 'verified' && <Badge variant="secondary">Certified Dealer</Badge>}
                {vehicleData.features?.includes('Service History') && <Badge variant="secondary">Service History</Badge>}
                {vehicleData.features?.includes('Insurance') && <Badge variant="secondary">Insurance Available</Badge>}
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-3">Seller Information</h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{dealerData.business_name}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{dealerData.rating || 'N/A'}</span>
                    </div>
                    {dealerData.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-xs">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {isUserVerified && dealerData.phone && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-4">
              <h4 className="font-semibold mb-3">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {vehicleData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpandedVehicleCard;
