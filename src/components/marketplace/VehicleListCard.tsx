import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  IndianRupee, 
  MapPin, 
  Calendar, 
  Fuel, 
  Gauge, 
  Building2,
  Shield,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VehicleListCard({
  vehicle,
  dealer,
  currentDealer,
  isInCompare,
  onCompareToggle,
  onMakeOffer,
  isUserVerified,
  isUnderReview,
  soldInfo
}) {
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on request';
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  const formatKilometers = (kms: number | null | undefined) => {
    if (!kms) return 'N/A';
    return `${kms}k km`;
  };

  const isNewVehicle = () => {
    const createdDate = new Date(vehicle.created_date || '');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const hasPriceDrop = vehicle.original_price && vehicle.asking_price && vehicle.asking_price < vehicle.original_price;

  const isSold = !!vehicle?.sold;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-black">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          {/* Vehicle Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              {vehicle.images && vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Badges */}
            <div className="absolute -top-1 -left-1 flex flex-col gap-1">
              {isNewVehicle() && (
                <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                  New
                </Badge>
              )}
              {isSold && (
                <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
                  Sold
                </Badge>
              )}
              {dealer?.verification_status === 'verified' && (
                <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {hasPriceDrop && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Price Drop
                </Badge>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                  {vehicle.variant && `${vehicle.variant} • `}
                  {vehicle.registration_number}
                </p>
              </div>
              
              {/* Price */}
              <div className="flex-shrink-0 ml-4 text-right">
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {isSold ? 'Sold' : (isUserVerified ? formatPrice(vehicle.asking_price) : 'Price Hidden')}
                </div>
                {isSold && soldInfo?.buyer_name && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">to {soldInfo.buyer_name}</div>
                )}
                {hasPriceDrop && isUserVerified && (
                  <div className="text-sm text-red-600 line-through">
                    {formatPrice(vehicle.original_price)}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <Calendar className="w-3 h-3" />
                <span>{vehicle.year}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <Fuel className="w-3 h-3" />
                <span className="capitalize">{vehicle.fuel_type}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <Gauge className="w-3 h-3" />
                <span>{formatKilometers(vehicle.kilometers)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="w-3 h-3" />
                <span>{[vehicle.rto_location_city || vehicle.location_city, vehicle.rto_location_state || vehicle.location_state].filter(Boolean).join(', ') || 'N/A'}</span>
              </div>
            </div>

            {/* Dealer Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {dealer?.business_name || 'Pending Setup'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isUserVerified && !isSold && (
              <Button
                onClick={() => onMakeOffer(vehicle)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
              >
                Make Offer
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCompareToggle}
              className={`gap-2 ${
                isInCompare 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInCompare ? 'fill-current' : ''}`} />
              {isInCompare ? 'Added' : 'Compare'}
            </Button>
            
            <Link to={createPageUrl('VehicleDetail')}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
