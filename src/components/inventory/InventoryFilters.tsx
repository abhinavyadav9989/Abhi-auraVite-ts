import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";

type InventoryFiltersProps = {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  onlyMine: boolean;
  setOnlyMine: React.Dispatch<React.SetStateAction<boolean>>;
  vehicles?: any[];
}

export default function InventoryFilters({ 
  priceRange = [0, 5000000], 
  setPriceRange = () => {}, 
  onlyMine = false, 
  setOnlyMine = () => {}, 
  vehicles = [] 
}: InventoryFiltersProps) {
  const SliderAny: any = Slider;
  // Safe calculation of maxPrice with proper fallback
  const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
  const prices = vehiclesArray
    .map(v => v?.asking_price || 0)
    .filter(price => price > 0);
  
  const maxPrice = prices.length > 0 ? Math.max(...prices, 5000000) : 5000000;
  
  // Ensure priceRange is valid array with proper bounds
  const safePriceRange = Array.isArray(priceRange) && priceRange.length >= 2 
    ? [
        Math.max(0, priceRange[0] || 0),
        Math.min(maxPrice, priceRange[1] || maxPrice)
      ]
    : [0, maxPrice];

  const handlePriceRangeChange = (newRange: number[] | [number, number]) => {
    if (Array.isArray(newRange) && newRange.length >= 2) {
      setPriceRange([
        Math.max(0, newRange[0]),
        Math.min(maxPrice, newRange[1])
      ]);
    }
  };

  // Safe calculation of average price
  const validPrices = vehiclesArray.filter(v => v?.asking_price > 0);
  const averagePrice = validPrices.length > 0 
    ? validPrices.reduce((sum, v) => sum + v.asking_price, 0) / validPrices.length
    : 0;

  // Safe calculation of live vehicles count
  const liveVehiclesCount = vehiclesArray.filter(v => v?.status === 'live').length;

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="px-3">
            <SliderAny
              value={safePriceRange as unknown as number[]}
              onValueChange={(val: number[]) => handlePriceRangeChange(val)}
              max={maxPrice}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {(safePriceRange[0] / 100000).toFixed(1)}L
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {(safePriceRange[1] / 100000).toFixed(1)}L
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="only-mine" 
              checked={onlyMine}
              onCheckedChange={(checked) => setOnlyMine(checked === true)}
            />
            <Label htmlFor="only-mine" className="text-sm">Only my vehicles</Label>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Stats</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Avg: ₹{averagePrice > 0 ? (averagePrice / 100000).toFixed(1) : '0'}L
            </Badge>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              Live: {liveVehiclesCount}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}