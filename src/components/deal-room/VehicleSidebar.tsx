import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Users,
  MapPin,
  IndianRupee
} from 'lucide-react';

export default function VehicleSidebar({ vehicle }) {
  if (!vehicle) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Gauge, label: 'Kilometers', value: vehicle.kilometers ? `${vehicle.kilometers.toLocaleString()} km` : 'Not specified' },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Users, label: 'Ownership', value: `${vehicle.ownership} owner` },
    { icon: MapPin, label: 'Location', value: `${vehicle.location_city}, ${vehicle.location_state}` }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Car className="w-4 h-4" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Image */}
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={typeof vehicle.images[0] === 'string' ? vehicle.images[0] : vehicle.images[0].url}
            alt="Vehicle"
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <Car className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.variant && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{vehicle.variant}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">{vehicle.registration_number}</p>
        </div>

        {/* Price */}
        <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-blue-900 dark:text-slate-100">
            <IndianRupee className="w-4 h-4" />
            {formatPrice(vehicle.asking_price)}
          </div>
          <div className="text-xs text-blue-700 dark:text-slate-300">Asking Price</div>
        </div>

        {/* Specifications */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-200">Specifications</h4>
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">{spec.label}:</span>
                <span className="font-medium capitalize dark:text-slate-100">{spec.value}</span>
              </div>
            );
          })}
        </div>

        {/* Color if available */}
        {vehicle.color && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Color:</span>
            <Badge variant="secondary" className="capitalize">
              {vehicle.color}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}