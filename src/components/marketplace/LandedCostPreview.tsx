import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calculator, IndianRupee, Truck, Wrench, FileText } from 'lucide-react';

export default function LandedCostPreview({ vehicle = {}, userClientType = 'individual' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Safe property access
  const vehicleData = {
    asking_price: vehicle.asking_price || 0,
    landed_cost_components: vehicle.landed_cost_components || {
      procurement: 0,
      refurbishment: 0,
      logistics: 0,
      other: 0
    },
    location_city: vehicle.location_city || '',
    location_state: vehicle.location_state || ''
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '₹0';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  // Calculate estimated landed costs
  const estimateLandedCosts = () => {
    const basePrice = vehicleData.asking_price;
    
    // Default estimates if not provided
    const estimates = {
      logistics: vehicleData.landed_cost_components.logistics || Math.max(15000, basePrice * 0.02),
      refurbishment: vehicleData.landed_cost_components.refurbishment || basePrice * 0.05,
      registration: basePrice * 0.08, // RTO fees
      insurance: basePrice * 0.03,
      other: vehicleData.landed_cost_components.other || basePrice * 0.02
    };

    const totalAdditional = Object.values(estimates).reduce((sum, cost) => sum + cost, 0);
    const totalLanded = basePrice + totalAdditional;

    return {
      basePrice,
      estimates,
      totalAdditional,
      totalLanded
    };
  };

  const costs = estimateLandedCosts();

  // Don't show if price is 0 or very low
  if (vehicleData.asking_price < 50000) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <Calculator className="w-3 h-3 mr-1" />
          Landed: {formatPrice(costs.totalLanded)}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Estimated Landed Cost</h4>
            <p className="text-xs text-slate-600">
              Total cost including logistics, registration, and other expenses
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Vehicle Price</span>
              <span className="font-semibold">{formatPrice(costs.basePrice)}</span>
            </div>

            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-600" />
                  <span>Logistics & Transport</span>
                </div>
                <span>{formatPrice(costs.estimates.logistics)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-green-600" />
                  <span>RTO & Registration</span>
                </div>
                <span>{formatPrice(costs.estimates.registration)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-orange-600" />
                  <span>Refurbishment</span>
                </div>
                <span>{formatPrice(costs.estimates.refurbishment)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Insurance</span>
                <span>{formatPrice(costs.estimates.insurance)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Other Expenses</span>
                <span>{formatPrice(costs.estimates.other)}</span>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Landed Cost</span>
                <span className="text-blue-600">{formatPrice(costs.totalLanded)}</span>
              </div>
            </div>

            {/* Margin Preview */}
            {userClientType !== 'self_user' && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-green-700 mb-1">Potential Margin</div>
                <div className="text-sm font-semibold text-green-800">
                  ~{formatPrice(costs.totalLanded * 0.15)} (15% markup)
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            *Estimates based on location and vehicle type. Actual costs may vary.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}