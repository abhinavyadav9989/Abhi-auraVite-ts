import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  SlidersHorizontal,
  X,
  Filter,
  TrendingDown,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Calendar,
  Fuel,
  Settings2,
  IndianRupee,
  Shield,
  Crown,
  CheckCircle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    vehicle_category: string[];
    fuel_type: string[];
    make: string[];
    transmission: string[];
    ownership: string[];
    verified_only: boolean;
    specialised_only: boolean;
    price_drops_only: boolean;
    financing_available: boolean;
    price_min: string;
    price_max: string;
    year_min: string;
    year_max: string;
    kms_min: string;
    kms_max: string;
    location: string[];
    body_type: string[];
    color: string[];
    document_status: string[];
  };
  setFilters: (filters: any) => void;
  resultsCount: number;
  allVehicles: any[];
  userClientType?: string;
  isUserVerified?: boolean;
  isDealer?: boolean;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resultsCount,
  allVehicles,
  userClientType = 'individual',
  isUserVerified = false,
  isDealer = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    vehicle: true,
    specs: true,
    condition: true,
    location: false,
    dealer: false
  });

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;

    if (isLeftSwipe) {
      onClose();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trapping
      if (e.key === 'Tab' && isOpen) {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first element when drawer opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Get unique values for filter options
  const getUniqueValues = (key: string) => {
    return [...new Set(allVehicles.map(v => v[key]).filter(Boolean))].sort();
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateArrayFilter = (key: string, value: string, checked: boolean | string) => {
    // Convert checked to boolean, treating "indeterminate" as false
    const isChecked = checked === true;
    
    setFilters((prev: any) => ({
      ...prev,
      [key]: isChecked
        ? [...(prev[key] || []), value]
        : (prev[key] || []).filter((item: string) => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      vehicle_category: [],
      fuel_type: [],
      make: [],
      transmission: [],
      ownership: [],
      verified_only: false,
      specialised_only: false,
      price_drops_only: false,
      financing_available: false,
      price_min: "",
      price_max: "",
      year_min: "",
      year_max: "",
      kms_min: "",
      kms_max: "",
      location: [],
      body_type: [],
      color: [],
      document_status: []
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFilterCount = Object.values(filters).filter(value =>
    Array.isArray(value) ? value.length > 0 : value && value !== ""
  ).length;

  const FilterSection = ({
    title,
    children,
    sectionKey,
    defaultExpanded = false
  }: {
    title: string;
    children: React.ReactNode;
    sectionKey: string;
    defaultExpanded?: boolean;
  }) => {
    const isOpen = expandedSections[sectionKey as keyof typeof expandedSections] !== undefined
      ? expandedSections[sectionKey as keyof typeof expandedSections]
      : defaultExpanded;

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <span className="font-medium text-sm text-slate-700">{title}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {activeFilterCount} active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-50">
                  {resultsCount} results
                </Badge>
                <Button
                  ref={firstFocusableRef}
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Filters - Always Visible */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id="verified-only"
                  checked={filters.verified_only}
                  onCheckedChange={(checked) => updateFilter('verified_only', checked)}
                />
                <Label htmlFor="verified-only" className="text-sm font-medium cursor-pointer">
                  Verified Sellers
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id="specialised-only"
                  checked={filters.specialised_only}
                  onCheckedChange={(checked) => updateFilter('specialised_only', checked)}
                />
                <Label htmlFor="specialised-only" className="text-sm font-medium cursor-pointer">
                  Include Specialised
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id="price-drops"
                  checked={filters.price_drops_only}
                  onCheckedChange={(checked) => updateFilter('price_drops_only', checked)}
                />
                <Label htmlFor="price-drops" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  Recent Drops
                </Label>
              </div>

              {['exclusive_buyer', 'self_user'].includes(userClientType) && (
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="financing-available"
                    checked={filters.financing_available}
                    onCheckedChange={(checked) => updateFilter('financing_available', checked)}
                  />
                  <Label htmlFor="financing-available" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    Financing
                  </Label>
                </div>
              )}
            </div>

            <Separator />

            {/* Filter Sections */}
            <div className="space-y-4">
              {/* Price Range Section */}
              <FilterSection title="Price Range" sectionKey="price" defaultExpanded={true}>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="price-min" className="text-xs text-slate-600 mb-1 block">
                        Min Price (₹ Lakh)
                      </Label>
                      <Input
                        id="price-min"
                        type="number"
                        placeholder="e.g. 5"
                        value={filters.price_min}
                        onChange={(e) => updateFilter('price_min', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-max" className="text-xs text-slate-600 mb-1 block">
                        Max Price (₹ Lakh)
                      </Label>
                      <Input
                        id="price-max"
                        type="number"
                        placeholder="e.g. 15"
                        value={filters.price_max}
                        onChange={(e) => updateFilter('price_max', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Vehicle Type Section */}
              <FilterSection title="Vehicle Type" sectionKey="vehicle" defaultExpanded={true}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'two_wheeler', label: '2 Wheeler', icon: '🏍️' },
                    { value: 'hatchback', label: 'Hatchback', icon: '🚗' },
                    { value: 'sedan', label: 'Sedan', icon: '🚙' },
                    { value: 'suv', label: 'SUV', icon: '🚙' },
                    { value: 'muv', label: 'MUV', icon: '🚐' },
                    { value: 'luxury', label: 'Luxury', icon: '🏎️' },
                    { value: 'commercial_light', label: 'LCV', icon: '🚚' },
                    { value: 'specialised', label: 'Specialised', icon: '🏗️' }
                  ].map(category => (
                    <div key={category.value} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={(filters.vehicle_category || []).includes(category.value)}
                        onCheckedChange={(checked) => updateArrayFilter('vehicle_category', category.value, checked)}
                      />
                      <Label htmlFor={`category-${category.value}`} className="text-sm cursor-pointer flex items-center gap-1">
                        <span>{category.icon}</span>
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </FilterSection>

              {/* Vehicle Specifications */}
              <FilterSection title="Specifications" sectionKey="specs" defaultExpanded={true}>
                <div className="space-y-4">
                  {/* Make */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Make</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {getUniqueValues('make').slice(0, 12).map((make: string) => (
                        <div key={make} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          <Checkbox
                            id={`make-${make}`}
                            checked={(filters.make || []).includes(make)}
                            onCheckedChange={(checked) => updateArrayFilter('make', make, checked)}
                          />
                          <Label htmlFor={`make-${make}`} className="text-sm cursor-pointer">{make}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Fuel Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['petrol', 'diesel', 'cng', 'electric', 'hybrid'].map(fuel => (
                        <div key={fuel} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          <Checkbox
                            id={`fuel-${fuel}`}
                            checked={(filters.fuel_type || []).includes(fuel)}
                            onCheckedChange={(checked) => updateArrayFilter('fuel_type', fuel, checked)}
                          />
                          <Label htmlFor={`fuel-${fuel}`} className="text-sm cursor-pointer capitalize">{fuel}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transmission */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Transmission</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['manual', 'automatic', 'amt', 'cvt'].map(trans => (
                        <div key={trans} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          <Checkbox
                            id={`trans-${trans}`}
                            checked={(filters.transmission || []).includes(trans)}
                            onCheckedChange={(checked) => updateArrayFilter('transmission', trans, checked)}
                          />
                          <Label htmlFor={`trans-${trans}`} className="text-sm cursor-pointer capitalize">{trans}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body Type */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Body Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {getUniqueValues('body_type').slice(0, 8).map((bodyType: string) => (
                        <div key={bodyType} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          <Checkbox
                            id={`body-${bodyType}`}
                            checked={(filters.body_type || []).includes(bodyType)}
                            onCheckedChange={(checked) => updateArrayFilter('body_type', bodyType, checked)}
                          />
                          <Label htmlFor={`body-${bodyType}`} className="text-sm cursor-pointer capitalize">{bodyType}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Condition & History */}
              <FilterSection title="Condition & History" sectionKey="condition" defaultExpanded={true}>
                <div className="space-y-4">
                  {/* Year Range */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Year Range</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={filters.year_min} onValueChange={(value) => updateFilter('year_min', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => 2024 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filters.year_max} onValueChange={(value) => updateFilter('year_max', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => 2024 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Kilometers */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Kilometers Driven</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Min KMs"
                          value={filters.kms_min}
                          onChange={(e) => updateFilter('kms_min', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Max KMs"
                          value={filters.kms_max}
                          onChange={(e) => updateFilter('kms_max', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ownership */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Ownership</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['first', 'second', 'third', 'fourth_plus'].map(owner => (
                        <div key={owner} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          <Checkbox
                            id={`owner-${owner}`}
                            checked={(filters.ownership || []).includes(owner)}
                            onCheckedChange={(checked) => updateArrayFilter('ownership', owner, checked)}
                          />
                          <Label htmlFor={`owner-${owner}`} className="text-sm cursor-pointer capitalize">
                            {owner.replace('_', ' ')} owner
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Location Section */}
              <FilterSection title="Location" sectionKey="location" defaultExpanded={false}>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">City/State</Label>
                    <Input
                      placeholder="Enter location..."
                      value={filters.location?.[0] || ''}
                      onChange={(e) => updateFilter('location', [e.target.value])}
                      className="text-sm"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Dealer Filters (for verified dealers) */}
              {isDealer && isUserVerified && (
                <FilterSection title="Dealer Options" sectionKey="dealer" defaultExpanded={false}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md">
                      <Checkbox
                        id="dealer-certified"
                        checked={filters.document_status?.includes('certified') || false}
                        onCheckedChange={(checked) => updateArrayFilter('document_status', 'certified', checked)}
                      />
                      <Label htmlFor="dealer-certified" className="text-sm cursor-pointer flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        Certified Dealers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-md">
                      <Checkbox
                        id="dealer-premium"
                        checked={filters.document_status?.includes('premium') || false}
                        onCheckedChange={(checked) => updateArrayFilter('document_status', 'premium', checked)}
                      />
                      <Label htmlFor="dealer-premium" className="text-sm cursor-pointer flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-600" />
                        Premium Dealers
                      </Label>
                    </div>
                  </div>
                </FilterSection>
              )}
            </div>
          </CardContent>

          {/* Footer with Apply/Clear buttons */}
          <div className="border-t p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
                disabled={activeFilterCount === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Apply Filters
              </Button>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {resultsCount} vehicles match your criteria
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
