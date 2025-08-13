import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IndianRupee, 
  MapPin, 
  Calendar, 
  Fuel, 
  Settings, 
  Users,
  Palette,
  Gauge,
  Star,
  Phone,
  MessageCircle,
  Share2,
  Car
} from 'lucide-react';
import { format } from 'date-fns';

export default function OverviewTab({ vehicle, dealer }) {
  if (!vehicle) return <div>Loading...</div>;

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700",
      live: "bg-green-100 text-green-700", 
      in_deal: "bg-blue-100 text-blue-700",
      sold: "bg-purple-100 text-purple-700",
      archived: "bg-slate-100 text-slate-500"
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Gauge, label: 'Kilometers', value: vehicle.kilometers ? `${vehicle.kilometers.toLocaleString()} km` : 'Not specified' },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuel_type },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Users, label: 'Ownership', value: `${vehicle.ownership} owner` },
    { icon: Palette, label: 'Color', value: vehicle.color || 'Not specified' },
    { icon: Car, label: 'Vehicle Type', value: vehicle.vehicle_type ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1) : 'Not specified' }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Vehicle Images */}
        <Card>
          <CardContent className="p-0">
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                {vehicle.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img 
                      src={typeof image === 'string' ? image : image.url} 
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
                {vehicle.images.length > 6 && (
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500 font-medium">
                      +{vehicle.images.length - 6} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-slate-500">No images available</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {specs.map((spec, index) => {
                const Icon = spec.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Icon className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-xs text-slate-500">{spec.label}</div>
                      <div className="font-medium capitalize">{spec.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {vehicle.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{vehicle.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              {vehicle.location_city}, {vehicle.location_state}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Price & Status */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div>
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-slate-900">
                  <IndianRupee className="w-6 h-6" />
                  {formatPrice(vehicle.asking_price)}
                </div>
                <div className="text-sm text-slate-600">Asking Price</div>
              </div>
              
              <Badge className={`${getStatusColor(vehicle.status)} px-3 py-1`}>
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </Badge>

              {vehicle.market_price_min && vehicle.market_price_max && (
                <div className="text-sm text-slate-600 pt-2 border-t">
                  Market Range: {formatPrice(vehicle.market_price_min)} - {formatPrice(vehicle.market_price_max)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dealer Information */}
        {dealer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dealer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">{dealer.business_name}</div>
                <div className="text-sm text-slate-600">{dealer.owner_name}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm">{dealer.rating || '4.2'}</span>
                <span className="text-sm text-slate-500">({dealer.total_deals || 0} deals)</span>
              </div>
              
              <div className="text-sm text-slate-600">
                <div>{dealer.city}, {dealer.state}</div>
                {dealer.avg_response_time && (
                  <div className="mt-1">Avg response: {dealer.avg_response_time}</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Share Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Generate Share Link
            </Button>
          </CardContent>
        </Card>

        {/* Listing Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Listed on:</span>
              <span>{format(new Date(vehicle.created_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Last updated:</span>
              <span>{format(new Date(vehicle.updated_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Vehicle ID:</span>
              <span className="font-mono text-xs">{vehicle.id.slice(-8)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}