import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  MapPin, 
  Calendar, 
  IndianRupee,
  Gauge,
  Star,
  Shield,
  Palette
} from 'lucide-react';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur'
];

const COLORS = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown', 'Gold'
];

export default function AdvancedFilters({ 
  filters, 
  setFilters, 
  vehicles = [], 
  onClose,
  onApply,
  onClear 
}) {
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'price_range') return value[0] > 0 || value[1] < 5000000;
    if (key === 'year_range') return value[0] > 2000 || value[1] < 2024;
    if (key === 'km_range') return value[0] > 0 || value[1] < 200000;
    if (key === 'verified_only' || key === 'featured_only') return value;
    if (Array.isArray(value)) return value.length > 0;
    return value !== 'all' && value !== '';
  }).length;

  const priceRange = filters.price_range || [0, 5000000];
  const yearRange = filters.year_range || [2010, 2024];
  const kmRange = filters.km_range || [0, 150000];

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key, value) => {
    const currentValues = filters[key] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilter(key, updatedValues);
  };

  const clearAllFilters = () => {
    setFilters({
      vehicle_category: 'all',
      make: 'all',
      fuel_type: 'all',
      transmission: 'all',
      ownership: 'all',
      cities: [],
      colors: [],
      price_range: [0, 5000000],
      year_range: [2010, 2024],
      km_range: [0, 150000],
      verified_only: false,
      featured_only: false,
      rating_min: 0
    });
    onClear?.();
  };

  // Get unique values from vehicles for dynamic filters
  const getUniqueValues = (field) => {
    return [...new Set(vehicles.map(v => v[field]).filter(Boolean))].sort();
  };

  const makes = getUniqueValues('make');
  const models = getUniqueValues('model');

  return (
    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <CardTitle>Advanced Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 overflow-y-auto max-h-96">
        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Price Range
            </Label>
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={(value) => updateFilter('price_range', value)}
                max={5000000}
                min={0}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-1">
                <span>₹{(priceRange[0] / 100000).toFixed(1)}L</span>
                <span>₹{(priceRange[1] / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Model Year
            </Label>
            <div className="px-3">
              <Slider
                value={yearRange}
                onValueChange={(value) => updateFilter('year_range', value)}
                max={2024}
                min={2000}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-1">
                <span>{yearRange[0]}</span>
                <span>{yearRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Kilometers Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Kilometers Driven
            </Label>
            <div className="px-3">
              <Slider
                value={kmRange}
                onValueChange={(value) => updateFilter('km_range', value)}
                max={200000}
                min={0}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-1">
                <span>{(kmRange[0] / 1000).toFixed(0)}K km</span>
                <span>{(kmRange[1] / 1000).toFixed(0)}K km</span>
              </div>
            </div>
          </div>

          {/* Make & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Make</Label>
              <Select 
                value={filters.make || 'all'} 
                onValueChange={(value) => updateFilter('make', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select 
                value={filters.fuel_type || 'all'} 
                onValueChange={(value) => updateFilter('fuel_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuels</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transmission & Ownership */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select 
                value={filters.transmission || 'all'} 
                onValueChange={(value) => updateFilter('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="amt">AMT</SelectItem>
                  <SelectItem value="cvt">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ownership</Label>
              <Select 
                value={filters.ownership || 'all'} 
                onValueChange={(value) => updateFilter('ownership', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="first">1st Owner</SelectItem>
                  <SelectItem value="second">2nd Owner</SelectItem>
                  <SelectItem value="third">3rd Owner</SelectItem>
                  <SelectItem value="fourth_plus">4+ Owners</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cities */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Cities
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {CITIES.map(city => {
                const isSelected = (filters.cities || []).includes(city);
                return (
                  <Button
                    key={city}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('cities', city)}
                    className={isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {city}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map(color => {
                const isSelected = (filters.colors || []).includes(color);
                return (
                  <Button
                    key={color}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('colors', color)}
                    className={isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {color}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Trust & Quality Filters */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Trust & Quality
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified_only"
                  checked={filters.verified_only || false}
                  onCheckedChange={(checked) => updateFilter('verified_only', checked)}
                />
                <Label htmlFor="verified_only" className="text-sm">
                  Verified dealers only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured_only"
                  checked={filters.featured_only || false}
                  onCheckedChange={(checked) => updateFilter('featured_only', checked)}
                />
                <Label htmlFor="featured_only" className="text-sm">
                  Featured listings only
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Minimum dealer rating</Label>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Slider
                    value={[filters.rating_min || 0]}
                    onValueChange={(value) => updateFilter('rating_min', value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8">
                    {(filters.rating_min || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-4 border-t bg-slate-50 flex justify-between">
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => { onApply(); onClose(); }}>
            Apply Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}