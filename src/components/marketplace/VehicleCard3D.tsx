import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Fuel, 
  Settings2, 
  Eye, 
  IndianRupee,
  Star,
  ShieldCheck,
  Zap,
  Camera,
  GitCompareArrows
} from 'lucide-react';
import { Shortlist } from '@/api/entities';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

type VehicleCard3DProps = {
  vehicle: any;
  dealer: any;
  currentDealer: any;
  onCompareToggle: (vehicleId: string) => void;
  isInCompare: boolean;
  onMakeOffer: (vehicle: any) => void;
  isUserVerified: boolean;
  isUnderReview?: boolean;
};

export default function VehicleCard3D({
  vehicle = {},
  dealer = {},
  currentDealer = null,
  onCompareToggle = () => {},
  isInCompare = false,
  onMakeOffer = () => {},
  isUserVerified = false,
  isUnderReview = false,
}: VehicleCard3DProps) {
  
  const [isShortlisting, setIsShortlisting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Safe property access with proper defaults
  const vehicleData = {
    id: vehicle?.id || '',
    make: vehicle?.make || 'N/A',
    model: vehicle?.model || 'N/A',
    year: vehicle?.year || 'N/A',
    asking_price: vehicle?.asking_price || 0,
    kilometers: vehicle?.kilometers || 0,
    fuel_type: vehicle?.fuel_type || 'N/A',
    transmission: vehicle?.transmission || 'N/A',
    location_city: vehicle?.location_city || 'N/A',
    images: Array.isArray(vehicle?.images) ? vehicle.images : [],
    hero_image_url: vehicle?.hero_image_url || '',
    created_date: vehicle?.created_date || new Date().toISOString(),
    status: vehicle?.status || 'draft',
    dealer_id: vehicle?.dealer_id || '',
  };

  const dealerData = {
    verification_status: dealer?.verification_status || 'pending',
    business_name: dealer?.business_name || 'Unknown Dealer'
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'On Request';
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  useEffect(() => {
    const checkShortlist = async () => {
      if (!currentDealer?.id || !vehicleData.id) return;
      try {
        const shortlists = await Shortlist.filter({ 
          dealer_id: currentDealer.id, 
          vehicle_id: vehicleData.id 
        });
        // You can add state to track if vehicle is shortlisted
      } catch (error) {
        console.error('Error checking shortlist:', error);
      }
    };
    checkShortlist();
  }, [currentDealer?.id, vehicleData.id]);

  const handleShortlist = async () => {
    if (!currentDealer?.id || !vehicleData.id) {
      toast({
        title: "Error",
        description: "Please log in to shortlist vehicles",
        variant: "destructive"
      });
      return;
    }

    setIsShortlisting(true);
    try {
      await Shortlist.create({
        dealer_id: currentDealer.id,
        vehicle_id: vehicleData.id,
        notes: ''
      });
      toast({
        title: "Success",
        description: "Vehicle added to shortlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to shortlist",
        variant: "destructive"
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  const isNew = () => {
    const createdDate = new Date(vehicleData.created_date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const heroImage = vehicleData.hero_image_url || (vehicleData.images.length > 0 ? vehicleData.images[0] : null);

  return (
    <CardContainer className="w-full h-full">
      <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border hover:shadow-xl transition-all duration-300 flex flex-col">
        {/* Vehicle Image */}
        <Link to={createPageUrl(`VehicleDetail?id=${vehicleData.id}`)} className="block">
          <CardItem translateZ="50" className="w-full">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden rounded-t-xl">
              {heroImage ? (
                <img 
                  src={heroImage} 
                  alt={`${vehicleData.make} ${vehicleData.model}`}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const nextSibling = target.nextSibling as HTMLElement;
                    if (nextSibling) {
                      nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center text-slate-400" 
                   style={{ display: heroImage ? 'none' : 'flex' }}>
                <Camera className="w-12 h-12" />
              </div>
            </div>
          </CardItem>
        </Link>

        {/* Badges */}
        <CardItem translateZ="60" className="absolute top-3 left-3 flex gap-2">
          {isNew() && (
            <Badge className="bg-green-500 text-white">New</Badge>
          )}
          {dealerData.verification_status === 'verified' && (
            <Badge className="bg-blue-100 text-blue-700 gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </CardItem>

        {/* Action buttons */}
        <CardItem translateZ="70" className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShortlist}
            disabled={isShortlisting}
            className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCompareToggle(vehicleData.id)}
            className={`w-8 h-8 ${isInCompare ? 'bg-blue-500 text-white' : 'bg-white/80 backdrop-blur-sm hover:bg-white'}`}
          >
            <GitCompareArrows className="w-4 h-4" />
          </Button>
        </CardItem>

        {/* Vehicle Details */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <CardItem translateZ="40" className="space-y-1">
            <h3 className="font-semibold text-lg text-slate-900 group-hover/card:text-blue-600 transition-colors">
              {vehicleData.make} {vehicleData.model}
            </h3>
            <p className="text-sm text-slate-600">{vehicleData.year}</p>
          </CardItem>

          <CardItem translateZ="45" className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{vehicleData.location_city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{vehicleData.kilometers?.toLocaleString()} km</span>
            </div>
          </CardItem>

          <CardItem translateZ="50" className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Fuel className="w-4 h-4" />
              <span>{vehicleData.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings2 className="w-4 h-4" />
              <span>{vehicleData.transmission}</span>
            </div>
          </CardItem>

          <CardItem translateZ="55" className="flex items-center justify-between">
            <div className="text-lg font-bold text-slate-900 flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {formatPrice(vehicleData.asking_price)}
            </div>
            <div className="text-sm text-slate-600">
              {dealerData.business_name}
            </div>
          </CardItem>

          {/* Action Buttons */}
          <CardItem translateZ="60" className="flex gap-2 pt-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl(`VehicleDetail?id=${vehicleData.id}`))}
              className="flex-1 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View Details
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onMakeOffer(vehicle)}
              disabled={!isUserVerified || isUnderReview}
              className="flex-1 flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Make Offer
            </Button>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
