import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, MapPin, DollarSign, Star } from 'lucide-react';

type WhyThisCardProps = {
  vehicle?: any;
  dealer?: any;
  userClientType?: 'individual' | 'dealer' | 'self_user' | string;
};

export default function WhyThisCard({ 
  vehicle = {}, 
  dealer = {}, 
  userClientType = 'individual' 
}: WhyThisCardProps) {
  // Safe property access
  const safeVehicle: any = vehicle || {};
  const vehicleData = {
    make: safeVehicle.make || '',
    model: safeVehicle.model || '',
    year: safeVehicle.year || new Date().getFullYear(),
    asking_price: Number(safeVehicle.asking_price || 0),
    location_city: safeVehicle.location_city || '',
    vehicle_category: safeVehicle.vehicle_category || 'sedan'
  };

  const safeDealer: any = dealer || {};
  const dealerData = {
    rating: Number(safeDealer.rating || 0),
    total_deals: Number(safeDealer.total_deals || 0),
    verification_status: safeDealer.verification_status || 'pending'
  };

  // Generate reasons based on vehicle and dealer data
  const generateReasons = () => {
    const reasons = [];

    // Price competitiveness (mock logic)
    if (vehicleData.asking_price > 0) {
      const isCompetitive = Math.random() > 0.4;
      if (isCompetitive) {
        reasons.push({
          icon: DollarSign,
          text: "Competitively priced for this model",
          type: "price"
        });
      }
    }

    // Location match (mock logic)
    if (vehicleData.location_city) {
      reasons.push({
        icon: MapPin,
        text: `Available in ${vehicleData.location_city}`,
        type: "location"
      });
    }

    // Dealer reliability
    if (dealerData.verification_status === 'verified') {
      reasons.push({
        icon: Star,
        text: "From verified dealer",
        type: "trust"
      });
    }

    // High demand model (mock logic)
    const popularModels = ['Swift', 'Baleno', 'Creta', 'Verna', 'City'];
    if (popularModels.some(model => vehicleData.model.toLowerCase().includes(model.toLowerCase()))) {
      reasons.push({
        icon: TrendingUp,
        text: "High demand model in your segment",
        type: "demand"
      });
    }

    // Vehicle category match (mock logic)
    if (userClientType !== 'self_user') {
      reasons.push({
        icon: Target,
        text: `Matches your ${vehicleData.vehicle_category} preference`,
        type: "preference"
      });
    }

    return reasons.slice(0, 3); // Show max 3 reasons
  };

  const reasons = generateReasons();

  if (reasons.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-blue-800 mb-2">
            Why this vehicle?
          </div>
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                <Icon className="w-3 h-3" />
                <span>{reason.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}