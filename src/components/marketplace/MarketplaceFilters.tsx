import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, X, Filter, TrendingDown, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function MarketplaceFilters({ 
  filters = {
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
    kms_max: ""
  }, 
  setFilters, 
  resultsCount = 0, 
  allVehicles = [], 
  userClientType = 'individual' 
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({
    price: false,
    vehicle: false,
    specs: false,
    condition: false
  });

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    return [...new Set(allVehicles.map(v => v[key]).filter(Boolean))].sort();
  };

  const updateFilter = (key, value) => {
    if (setFilters) {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const updateArrayFilter = (key, value, checked) => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        [key]: checked 
          ? [...(prev[key] || []), value]
          : (prev[key] || []).filter(item => item !== value)
      }));
    }
  };

  const clearFilters = () => {
    if (setFilters) {
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
        kms_max: ""
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value && value !== ""
  ).length;

  const FilterSection = ({ title, children, sectionKey, defaultExpanded = false }) => {
    const isOpen = expandedSections[sectionKey] !== undefined ? expandedSections[sectionKey] : defaultExpanded;
    
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

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
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
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 text-slate-600"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        {isExpanded && (
          <div className="space-y-4">
            <Separator />

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
            <FilterSection title="Vehicle Type" sectionKey="vehicle">
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
            <FilterSection title="Specifications" sectionKey="specs">
              <div className="space-y-4">
                {/* Make */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Make</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {getUniqueValues('make').slice(0, 12).map(make => (
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
              </div>
            </FilterSection>

            {/* Condition & History */}
            <FilterSection title="Condition & History" sectionKey="condition">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}