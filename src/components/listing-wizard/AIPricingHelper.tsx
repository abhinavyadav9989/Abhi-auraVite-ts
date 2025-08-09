import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Zap,
  IndianRupee,
  BarChart3
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AIPricingHelper({ 
  vehicleData, 
  currentPrice, 
  onPriceChange, 
  marketData 
}) {
  const [suggestedRange, setSuggestedRange] = useState({ min: 0, max: 0, median: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [comparables, setComparables] = useState([]);

  useEffect(() => {
    if (vehicleData.make && vehicleData.model && vehicleData.year) {
      generatePriceSuggestion();
    }
  }, [vehicleData.make, vehicleData.model, vehicleData.year, vehicleData.kilometers]);

  const generatePriceSuggestion = async () => {
    setIsLoading(true);
    
    // Mock AI price suggestion based on vehicle data
    const basePrice = getBasePrice(vehicleData);
    const depreciationFactor = getDepreciationFactor(vehicleData.year);
    const kmsFactor = getKmsFactor(vehicleData.kilometers);
    
    const median = Math.round(basePrice * depreciationFactor * kmsFactor);
    const min = Math.round(median * 0.85);
    const max = Math.round(median * 1.15);
    
    setSuggestedRange({ min, max, median });
    
    // Mock comparable vehicles
    setComparables([
      {
        id: 1,
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        kms: vehicleData.kilometers - 5000,
        price: median + 15000,
        sold_days_ago: 3
      },
      {
        id: 2,
        year: vehicleData.year - 1,
        make: vehicleData.make,
        model: vehicleData.model,
        kms: vehicleData.kilometers + 10000,
        price: median - 25000,
        sold_days_ago: 7
      }
    ]);
    
    setIsLoading(false);
    
    // Auto-set the median price if no price is set
    if (!currentPrice) {
      onPriceChange(median);
    }
  };

  const getBasePrice = (vehicle) => {
    // Mock base pricing logic
    const basePrices = {
      'Swift': 600000,
      'Dzire': 700000,
      'City': 1200000,
      'Creta': 1400000,
      'Innova': 1800000
    };
    return basePrices[vehicle.model] || 800000;
  };

  const getDepreciationFactor = (year) => {
    const age = new Date().getFullYear() - year;
    return Math.max(0.4, 1 - (age * 0.12));
  };

  const getKmsFactor = (kms) => {
    if (!kms) return 1;
    const kmsNum = parseInt(kms);
    if (kmsNum < 20000) return 1;
    if (kmsNum < 50000) return 0.95;
    if (kmsNum < 80000) return 0.9;
    return 0.85;
  };

  const getPriceRecommendation = () => {
    if (!currentPrice || !suggestedRange.median) return null;
    
    const price = parseInt(currentPrice);
    const { min, max, median } = suggestedRange;
    
    if (price < min) return { type: 'low', message: 'Price is below market range' };
    if (price > max) return { type: 'high', message: 'Price is above market range' };
    if (price >= min && price <= median) return { type: 'good', message: 'Competitive pricing' };
    if (price > median && price <= max) return { type: 'premium', message: 'Premium pricing' };
    
    return null;
  };

  const formatPrice = (price) => `₹${(price / 100000).toFixed(1)}L`;

  const recommendation = getPriceRecommendation();

  if (!vehicleData.make || !vehicleData.model) {
    return (
      <Card className="border-dashed border-2 border-slate-200">
        <CardContent className="p-6 text-center">
          <Zap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600">Add vehicle details to get AI pricing suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
            <Zap className="w-4 h-4 text-white" />
          </div>
          AI Price Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-slate-600 mt-2">Analyzing market data...</p>
          </div>
        ) : suggestedRange.median > 0 ? (
          <div className="space-y-4">
            {/* Price Range Visualization */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Market Range</span>
                <span className="font-medium">{formatPrice(suggestedRange.min)} - {formatPrice(suggestedRange.max)}</span>
              </div>
              
              <div className="relative">
                <div className="h-2 bg-slate-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <div 
                  className="absolute top-0 w-1 h-2 bg-purple-600 rounded-full"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                />
              </div>
              
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-600">Min: {formatPrice(suggestedRange.min)}</span>
                <span className="text-purple-600 font-medium">Sweet Spot: {formatPrice(suggestedRange.median)}</span>
                <span className="text-blue-600">Max: {formatPrice(suggestedRange.max)}</span>
              </div>
            </div>

            {/* Current Price Feedback */}
            {recommendation && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                recommendation.type === 'low' ? 'bg-red-50 text-red-700' :
                recommendation.type === 'high' ? 'bg-orange-50 text-orange-700' :
                recommendation.type === 'good' ? 'bg-green-50 text-green-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {recommendation.type === 'low' ? <TrendingDown className="w-4 h-4" /> :
                 recommendation.type === 'high' ? <TrendingUp className="w-4 h-4" /> :
                 <BarChart3 className="w-4 h-4" />}
                <span className="font-medium">{recommendation.message}</span>
              </div>
            )}

            {/* Quick Price Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPriceChange(suggestedRange.min)}
                className="flex-1"
              >
                Min {formatPrice(suggestedRange.min)}
              </Button>
              <Button
                size="sm"
                onClick={() => onPriceChange(suggestedRange.median)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Sweet Spot {formatPrice(suggestedRange.median)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPriceChange(suggestedRange.max)}
                className="flex-1"
              >
                Max {formatPrice(suggestedRange.max)}
              </Button>
            </div>

            {/* Comparables */}
            {comparables.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white p-3 rounded-lg cursor-help">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Recent Sales</span>
                        <Info className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      {comparables.map((comp) => (
                        <div key={comp.id} className="text-xs">
                          {comp.year} {comp.make} {comp.model} • {comp.kms.toLocaleString()} km
                          <br />
                          Sold for {formatPrice(comp.price)} • {comp.sold_days_ago} days ago
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}