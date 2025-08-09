import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, Calendar, Fuel, Settings, Users, Palette, Gauge } from 'lucide-react';

export default function VehicleComparison({ vehicles, onClose }) {
  if (!vehicles || vehicles.length === 0) return null;

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const getComparisonValue = (field, vehicle) => {
    switch (field) {
      case 'asking_price':
        return vehicle.asking_price || 0;
      case 'year':
        return vehicle.year || 0;
      case 'kilometers':
        return vehicle.kilometers || 0;
      default:
        return vehicle[field] || 'N/A';
    }
  };

  const getBestValue = (field, vehicles) => {
    const values = vehicles.map(v => getComparisonValue(field, v));
    
    switch (field) {
      case 'asking_price':
        return Math.min(...values.filter(v => v > 0));
      case 'year':
        return Math.max(...values);
      case 'kilometers':
        return Math.min(...values.filter(v => v > 0));
      default:
        return null;
    }
  };

  const getRowDiffClass = (field, value, vehicles) => {
    const bestValue = getBestValue(field, vehicles);
    if (bestValue === null || bestValue === value) return '';
    
    switch (field) {
      case 'asking_price':
        return value === bestValue ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
      case 'year':
        return value === bestValue ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
      case 'kilometers':
        return value === bestValue ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  const comparisonFields = [
    { key: 'asking_price', label: 'Price', icon: IndianRupee, format: formatPrice },
    { key: 'year', label: 'Year', icon: Calendar, format: (v) => v || 'N/A' },
    { key: 'kilometers', label: 'Kilometers', icon: Gauge, format: (v) => v ? `${v.toLocaleString()} km` : 'N/A' },
    { key: 'fuel_type', label: 'Fuel Type', icon: Fuel, format: (v) => v || 'N/A' },
    { key: 'transmission', label: 'Transmission', icon: Settings, format: (v) => v || 'N/A' },
    { key: 'ownership', label: 'Ownership', icon: Users, format: (v) => v ? `${v} owner` : 'N/A' },
    { key: 'color', label: 'Color', icon: Palette, format: (v) => v || 'N/A' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Vehicle Comparison</CardTitle>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Vehicle Headers */}
              <div className="grid grid-cols-1 gap-0 border-b">
                <div className="flex">
                  <div className="w-32 p-4 bg-slate-50 border-r font-medium">
                    Vehicle
                  </div>
                  {vehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className="flex-1 p-4 border-r last:border-r-0">
                      <div className="space-y-2">
                        <div className="font-bold text-lg">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-slate-600">
                          {vehicle.variant || 'Base variant'}
                        </div>
                        {vehicle.images?.[0] && (
                          <img 
                            src={vehicle.images[0]} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Rows */}
              {comparisonFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="flex border-b">
                    <div className="w-32 p-4 bg-slate-50 border-r">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-sm">{field.label}</span>
                      </div>
                    </div>
                    {vehicles.map((vehicle) => {
                      const value = getComparisonValue(field.key, vehicle);
                      const diffClass = getRowDiffClass(field.key, value, vehicles);
                      
                      return (
                        <div 
                          key={`${vehicle.id}-${field.key}`} 
                          className={`flex-1 p-4 border-r last:border-r-0 transition-colors ${diffClass}`}
                        >
                          <div className="font-medium">
                            {field.format(value)}
                          </div>
                          {diffClass.includes('green') && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mt-1">
                              Best
                            </Badge>
                          )}
                          {diffClass.includes('red') && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs mt-1">
                              Higher
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Location Row */}
              <div className="flex border-b">
                <div className="w-32 p-4 bg-slate-50 border-r">
                  <div className="font-medium text-sm">Location</div>
                </div>
                {vehicles.map((vehicle) => (
                  <div key={`${vehicle.id}-location`} className="flex-1 p-4 border-r last:border-r-0">
                    <div className="text-sm">
                      {vehicle.location_city}, {vehicle.location_state}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Row */}
              <div className="flex">
                <div className="w-32 p-4 bg-slate-50 border-r">
                  <div className="font-medium text-sm">Actions</div>
                </div>
                {vehicles.map((vehicle) => (
                  <div key={`${vehicle.id}-actions`} className="flex-1 p-4 border-r last:border-r-0">
                    <div className="space-y-2">
                      <Button size="sm" className="w-full">
                        Make Offer
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}