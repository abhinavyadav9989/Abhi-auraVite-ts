import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Database } from '@/types';
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
  GitCompareArrows,
  Hand
} from 'lucide-react';
import { Shortlist } from '@/api/entities';
import ExpandedVehicleCard from './ExpandedVehicleCard';
import DealerOfferSystem from './DealerOfferSystem';


type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Dealer = Database['public']['Tables']['dealers']['Row'];

type VehicleCardProps = {
  vehicle: Vehicle;
  dealer: Dealer;
  currentDealer: Dealer | null;
  onCompareToggle: (vehicleId: string) => void;
  isInCompare: boolean;
  onMakeOffer: (vehicle: Vehicle) => void;
  isUserVerified: boolean;
  isUnderReview?: boolean;
};

export default function VehicleCard({
  vehicle = {},
  dealer = {},
  currentDealer = null,
  onCompareToggle = () => {},
  isInCompare = false,
  onMakeOffer = () => {},
  isUserVerified = false,
  isUnderReview = false,
}: VehicleCardProps) {
  const [isInShortlist, setIsInShortlist] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const { toast } = useToast();

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
            created_at: vehicle?.created_at || new Date().toISOString(),
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
        const shortlists = await Shortlist.filter({ dealer_id: currentDealer.id });
        const isInAnyShortlist = Array.isArray(shortlists) && shortlists.some(shortlist => {
          const vehicleIds = Array.isArray(shortlist?.vehicle_ids) ? shortlist.vehicle_ids : [];
          return vehicleIds.includes(vehicleData.id);
        });
        setIsInShortlist(isInAnyShortlist);
      } catch (error) {
        // Error checking shortlist - handled gracefully
        setIsInShortlist(false);
      }
    };
    checkShortlist();
  }, [currentDealer, vehicleData.id]);

  const handleToggleShortlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentDealer) {
      toast({ title: "Login Required", description: "Please log in to manage your shortlist.", variant: "destructive" });
      return;
    }
    
    setIsShortlisting(true);
    
    try {
      let shortlists = await Shortlist.filter({ dealer_id: currentDealer.id, name: 'My Favorites' });
      let favShortlist = Array.isArray(shortlists) ? shortlists[0] : null;
      
      if (!favShortlist) {
        favShortlist = await Shortlist.create({ 
          name: 'My Favorites', 
          dealer_id: currentDealer.id, 
          vehicle_ids: [] 
        });
      }

      const vehicleIds = Array.isArray(favShortlist?.vehicle_ids) ? favShortlist.vehicle_ids : [];
      const isCurrentlyInList = vehicleIds.includes(vehicleData.id);

      const updatedIds = isCurrentlyInList
        ? vehicleIds.filter(id => id !== vehicleData.id)
        : [...vehicleIds, vehicleData.id];

      await Shortlist.update(favShortlist.id, { vehicle_ids: updatedIds });
      setIsInShortlist(!isCurrentlyInList);
      
      toast({
        title: !isCurrentlyInList ? "Added to Shortlist" : "Removed from Shortlist",
        description: `${vehicleData.make} ${vehicleData.model} has been updated in your favorites.`,
      });
    } catch (error) {
      // Failed to update shortlist - handled gracefully
      toast({ title: "Error", description: "Could not update shortlist.", variant: "destructive" });
    }
    
    setIsShortlisting(false);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onCompareToggle(vehicleData.id);
  };

  const handleMakeOfferClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onMakeOffer(vehicle);
  };
  
          const daysAgo = vehicleData.created_at
          ? Math.floor((new Date().getTime() - new Date(vehicleData.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isNew = daysAgo <= 7;
  // Use hero_image_url if available, otherwise fall back to first image
  const heroImage = vehicleData.hero_image_url || (vehicleData.images.length > 0 ? vehicleData.images[0] : null);

  return (
          <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 flex flex-col">
      <div className="relative">
        <Link to={createPageUrl(`VehicleDetail?id=${vehicleData.id}`)} className="block">
          <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {heroImage ? (
              <img 
                src={heroImage} 
                alt={`${vehicleData.make} ${vehicleData.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
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

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="bg-slate-50/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={handleToggleShortlist}
            disabled={isShortlisting}
          >
            <Heart className={`w-4 h-4 ${isInShortlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`bg-slate-50/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 ${isInCompare ? 'bg-blue-100' : ''}`}
            onClick={handleCompareClick}
          >
            <GitCompareArrows className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-slate-50/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <Link to={createPageUrl(`VehicleDetail?id=${vehicleData.id}`)} className="block">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {vehicleData.year} {vehicleData.make} {vehicleData.model}
            </h3>

            {/* Price - Permission-based display */}
            {(() => {
              // Check if user has permission to view prices
              const canViewPrices = isUserVerified; // Simplified - in real app, check specific permissions

              if (canViewPrices && vehicleData.asking_price) {
                return (
                  <div className="text-xl font-bold text-blue-600">
                    {formatPrice(vehicleData.asking_price)}
                  </div>
                );
              } else if (isUnderReview) {
                // User is under review - show pending message
                return (
                  <div className="text-sm text-amber-600 font-medium">
                    Verification in progress...
                  </div>
                );
              } else {
                // User cannot view prices - show "Price on request"
                return (
                  <div className="text-sm text-slate-600 font-medium">
                    Price on request
                  </div>
                );
              }
            })()}

            {/* Key specs */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{vehicleData.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span className="capitalize">{vehicleData.fuel_type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings2 className="w-4 h-4" />
                <span>{vehicleData.kilometers > 0 ? `${Math.floor(vehicleData.kilometers / 1000)}k km` : '0k km'}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>{vehicleData.location_city}</span>
              {isUserVerified && (
                <>
                  <span>•</span>
                  <span>{dealerData.business_name}</span>
                </>
              )}
            </div>

            {/* KYB Verification Notice for Unverified Users */}
            {!isUserVerified && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center justify-between gap-2 text-amber-700 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    <span>
                      {isUnderReview
                        ? 'Verification under review - View profile for updates'
                        : 'Complete KYB verification to view dealer details and pricing'
                      }
                    </span>
                  </div>
                  {!isUnderReview && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = createPageUrl('KYBWizard');
                      }}
                      className="text-amber-700 hover:text-amber-800 font-medium underline text-xs"
                    >
                      Complete Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Action footer */}
        <div className="mt-4 pt-3 border-t flex gap-2">
          {isUserVerified ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleMakeOfferClick}
              title="Make an offer on this vehicle"
            >
              Make Offer
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => window.location.href = isUnderReview ? '/Profile' : '/OnboardingWizard'}
              title={isUnderReview ? "View profile for verification updates" : "Complete KYB verification to make offers"}
            >
              {isUnderReview ? "View Profile" : "Complete KYB First"}
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          {isUserVerified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOfferModalOpen(true);
              }}
              title="Make dealer offer"
            >
              <Hand className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>

      {/* Expanded Vehicle Card */}
      <ExpandedVehicleCard
        vehicle={vehicle}
        dealer={dealer}
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        onCompareToggle={onCompareToggle}
        isInCompare={isInCompare}
        onMakeOffer={onMakeOffer}
        isUserVerified={isUserVerified}
        isDealer={!!currentDealer}
      />

      {/* Dealer Offer System */}
      <DealerOfferSystem
        vehicle={vehicle}
        seller={dealer}
        buyer={currentDealer}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onOfferSubmitted={(offer) => {
          console.log('Offer submitted:', offer);
          setIsOfferModalOpen(false);
        }}
      />
    </Card>
  );
}