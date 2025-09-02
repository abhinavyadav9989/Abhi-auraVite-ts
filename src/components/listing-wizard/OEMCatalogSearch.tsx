import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, CheckCircle, AlertCircle, Car, DollarSign, Settings, Users } from 'lucide-react';
import { oemCatalogService, OEMVehicleAPI, OEMCatalogSearchParams } from '@/api/services/oemCatalogService';

interface OEMCatalogSearchProps {
  onVehicleSelect: (vehicle: OEMVehicleAPI) => void;
  selectedVehicle?: OEMVehicleAPI | null;
  dealer: any;
}

export default function OEMCatalogSearch({
  onVehicleSelect,
  selectedVehicle,
  dealer
}: OEMCatalogSearchProps) {
  const [searchParams, setSearchParams] = useState<OEMCatalogSearchParams>({});
  const [searchResults, setSearchResults] = useState<OEMVehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [popularVehicles, setPopularVehicles] = useState<OEMVehicle[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (searchParams.make) {
      loadModels(searchParams.make);
    } else {
      setModels([]);
      setVariants([]);
    }
  }, [searchParams.make]);

  // Load variants when model changes
  useEffect(() => {
    if (searchParams.make && searchParams.model) {
      loadVariants(searchParams.make, searchParams.model);
    } else {
      setVariants([]);
    }
  }, [searchParams.make, searchParams.model]);

  const loadInitialData = async () => {
    try {
      const [makesList, popular] = await Promise.all([
        oemCatalogService.getMakes(),
        oemCatalogService.getPopularVehicles(6)
      ]);
      setMakes(makesList);
      setPopularVehicles(popular);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load catalog data');
    }
  };

  const loadModels = async (make: string) => {
    try {
      const modelsList = await oemCatalogService.getModels(make);
      setModels(modelsList);
    } catch (error) {
      console.error('Failed to load models:', error);
      setModels([]);
    }
  };

  const loadVariants = async (make: string, model: string) => {
    try {
      const variantsList = await oemCatalogService.getVariants(make, model);
      setVariants(variantsList);
    } catch (error) {
      console.error('Failed to load variants:', error);
      setVariants([]);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    try {
      const result = await oemCatalogService.searchCatalog(searchParams);
      setSearchResults(result.vehicles);
      setSearchPerformed(true);

      if (result.vehicles.length === 0) {
        setError('No vehicles found matching your criteria');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVehicleSelect = (vehicle: OEMVehicle) => {
    onVehicleSelect(vehicle);
  };

  const updateSearchParam = (key: keyof OEMCatalogSearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const formatPriceRange = (vehicle: OEMVehicle) => {
    if (!vehicle.price_range) return 'Price on request';
    const { ex_showroom_min, ex_showroom_max } = vehicle.price_range;
    return `₹${ex_showroom_min.toLocaleString()} - ₹${ex_showroom_max.toLocaleString()}`;
  };

  const getVehicleBadge = (vehicle: OEMVehicle) => {
    if (vehicle.year === new Date().getFullYear()) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">2024 Model</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            OEM Catalog Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Select value={searchParams.make || ''} onValueChange={(value) => updateSearchParam('make', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={searchParams.model || ''}
                onValueChange={(value) => updateSearchParam('model', value)}
                disabled={!searchParams.make}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Select
                value={searchParams.variant || ''}
                onValueChange={(value) => updateSearchParam('variant', value)}
                disabled={!searchParams.make || !searchParams.model}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map(variant => (
                    <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={searchParams.year?.toString() || ''} onValueChange={(value) => updateSearchParam('year', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              size="lg"
              className="px-8"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Catalog
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Popular Vehicles (when no search performed) */}
      {!searchPerformed && popularVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Popular New Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularVehicles.map((vehicle, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-sm text-gray-600">{vehicle.variant}</p>
                    </div>
                    {getVehicleBadge(vehicle)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{vehicle.fuel_type} • {vehicle.transmission}</p>
                    <p className="font-medium text-green-600">{formatPriceRange(vehicle)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchPerformed && searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((vehicle, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedVehicle?.make === vehicle.make &&
                    selectedVehicle?.model === vehicle.model &&
                    selectedVehicle?.variant === vehicle.variant
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h4>
                        {selectedVehicle?.make === vehicle.make &&
                         selectedVehicle?.model === vehicle.model &&
                         selectedVehicle?.variant === vehicle.variant && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-gray-600">{vehicle.variant} • {vehicle.year}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{vehicle.fuel_type}</span>
                        <span>{vehicle.transmission}</span>
                        <span>{vehicle.engine_capacity}cc</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getVehicleBadge(vehicle)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      {formatPriceRange(vehicle)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Settings className="w-4 h-4" />
                      {vehicle.power} hp • {vehicle.torque} Nm
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {vehicle.seating_capacity} seats
                    </div>
                  </div>

                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {vehicle.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{vehicle.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Vehicle Summary */}
      {selectedVehicle && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Selected:</strong> {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.variant} ({selectedVehicle.year})
            <br />
            <span className="text-sm text-gray-600">
              Specs from OEM catalog • Ex-showroom: {formatPriceRange(selectedVehicle)}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
