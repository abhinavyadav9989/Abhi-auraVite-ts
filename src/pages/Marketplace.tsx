
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dealer, Vehicle } from '@/api/entities';
import type { Database } from '@/types';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type DealerRow = Database['public']['Tables']['dealers']['Row'];
type UserRow = Database['auth']['Tables']['users']['Row'];
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  Calendar, 
  IndianRupee,
  Eye,
  EyeOff,
  Shield,
  Crown,
  CheckCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';

import { usePermissions } from '@/components/security/usePermissions';
import FilterDrawer from '@/components/marketplace/FilterDrawer';
import VehicleCard from '@/components/marketplace/VehicleCard';

// Enhanced Marketplace component with policy enforcement
function MarketplaceContent() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [comparedVehicles, setComparedVehicles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isUnderReview, setIsUnderReview] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasPermission, isLoading: permissionsLoading, userRole, dealerRole, verificationStatus } = usePermissions();

  const hasActiveFilters = Object.values(selectedFilters).some(value => value !== '');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Update price visibility based on permissions
  useEffect(() => {
    if (!permissionsLoading) {
      setShowPrices(hasPermission('marketplace.view_prices'));
    }
  }, [hasPermission, permissionsLoading]);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);

      const currentUser = await User.me();
      let currentDealerData = null;
      
      if (currentUser) {
        const dealerProfiles = await Dealer.filter({ created_by: currentUser.email });
        if (dealerProfiles.length > 0) {
          currentDealerData = dealerProfiles[0];
          setCurrentDealer(currentDealerData);
          
          // Check if user is verified (either verification_status or verification_status_new)
          const isVerified = currentDealerData.verification_status === 'verified' || currentDealerData.verification_status_new === 'verified';
          const isUnderReview = currentDealerData.verification_status === 'documents_submitted' || currentDealerData.verification_status_new === 'documents_submitted';
          const isUnverified = !isVerified && !isUnderReview;
          
          setIsUserVerified(isVerified);
          setIsUnderReview(isUnderReview);
          
          console.log('User verification status:', {
            verification_status: currentDealerData.verification_status,
            verification_status_new: currentDealerData.verification_status_new,
            isVerified: isVerified,
            isUnderReview: isUnderReview,
            isUnverified: isUnverified
          });
        }
      }

      // Load only public, live vehicles from all dealers EXCEPT current user's vehicles
      let vehicles = await Vehicle.filter({ status: 'live', inventory_type: 'public' });
      
      // Filter out current user's vehicles so they don't see their own cars in marketplace
      if (currentDealerData) {
        vehicles = vehicles.filter(vehicle => vehicle.dealer_id !== currentDealerData.id);
      }

      setAllVehicles(vehicles);
      setFilteredVehicles(vehicles);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter vehicles based on search and filters
  useEffect(() => {
    let filtered = allVehicles;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    const {
      vehicle_category,
      fuel_type,
      make,
      transmission,
      ownership,
      verified_only,
      specialised_only,
      price_drops_only,
      financing_available,
      price_min,
      price_max,
      year_min,
      year_max,
      kms_min,
      kms_max,
      location,
      body_type,
      color,
      document_status
    } = selectedFilters;

    // Filter by vehicle category
    if (vehicle_category.length > 0) {
      filtered = filtered.filter(vehicle =>
        vehicle_category.includes(vehicle.vehicle_category) ||
        vehicle_category.includes(vehicle.body_type)
      );
    }

    // Filter by fuel type
    if (fuel_type.length > 0) {
      filtered = filtered.filter(vehicle =>
        fuel_type.includes(vehicle.fuel_type)
      );
    }

    // Filter by make
    if (make.length > 0) {
      filtered = filtered.filter(vehicle =>
        make.includes(vehicle.make)
      );
    }

    // Filter by transmission
    if (transmission.length > 0) {
      filtered = filtered.filter(vehicle =>
        transmission.includes(vehicle.transmission)
      );
    }

    // Filter by ownership
    if (ownership.length > 0) {
      filtered = filtered.filter(vehicle =>
        ownership.includes(vehicle.ownership)
      );
    }

    // Filter by body type
    if (body_type.length > 0) {
      filtered = filtered.filter(vehicle =>
        body_type.includes(vehicle.body_type)
      );
    }

    // Filter by color
    if (color.length > 0) {
      filtered = filtered.filter(vehicle =>
        color.includes(vehicle.color)
      );
    }

    // Filter by verified only
    if (verified_only) {
      filtered = filtered.filter(vehicle => vehicle.verification_status === 'verified');
    }

    // Filter by specialised only
    if (specialised_only) {
      filtered = filtered.filter(vehicle => vehicle.vehicle_category === 'specialised');
    }

    // Filter by price range
    if (price_min || price_max) {
      filtered = filtered.filter(vehicle => {
        const price = vehicle.asking_price || vehicle.ex_showroom_price || 0;
        const minPrice = price_min ? parseFloat(price_min) * 100000 : 0;
        const maxPrice = price_max ? parseFloat(price_max) * 100000 : Number.MAX_VALUE;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by year range
    if (year_min || year_max) {
      filtered = filtered.filter(vehicle => {
        const year = parseInt(vehicle.year);
        const minYear = year_min ? parseInt(year_min) : 0;
        const maxYear = year_max ? parseInt(year_max) : new Date().getFullYear();
        return year >= minYear && year <= maxYear;
      });
    }

    // Filter by kilometers
    if (kms_min || kms_max) {
      filtered = filtered.filter(vehicle => {
        const kms = vehicle.kilometers || 0;
        const minKms = kms_min ? parseInt(kms_min) : 0;
        const maxKms = kms_max ? parseInt(kms_max) : Number.MAX_VALUE;
        return kms >= minKms && kms <= maxKms;
      });
    }

    // Filter by location
    if (location.length > 0) {
      filtered = filtered.filter(vehicle =>
        location.some(loc =>
          vehicle.location_city?.toLowerCase().includes(loc.toLowerCase()) ||
          vehicle.location?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Filter by document status (for dealers)
    if (document_status.length > 0) {
      filtered = filtered.filter(vehicle =>
        document_status.includes(vehicle.document_status)
      );
    }

    // Filter by price drops (mock - would need actual price history)
    if (price_drops_only) {
      filtered = filtered.filter(vehicle => vehicle.price_drop_indicator === true);
    }

    // Filter by financing available (mock - would need actual financing data)
    if (financing_available) {
      filtered = filtered.filter(vehicle => vehicle.financing_available === true);
    }

    setFilteredVehicles(filtered);
  }, [searchTerm, selectedFilters, allVehicles]);

  const handleVehicleClick = (vehicleId: string) => {
    navigate(createPageUrl(`VehicleDetail?id=${vehicleId}`));
  };

  const handleMakeOffer = (vehicle: VehicleRow) => {
    if (!hasPermission('marketplace.create_offer')) {
      toast({
        title: 'Permission Required',
        description: 'You need permission to create offers. Contact your administrator.',
        variant: 'destructive'
      });
      return;
    }
    navigate(createPageUrl(`DealRoom?vehicleId=${vehicle.id}`));
  };

  const handleCompareToggle = (vehicleId: string) => {
    setComparedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else if (prev.length < 4) {
        return [...prev, vehicleId];
      } else {
        toast({
          title: 'Compare Limit Reached',
          description: 'You can compare up to 4 vehicles at once.',
          variant: 'destructive'
        });
        return prev;
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilters({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vehicle Marketplace</h1>
            <p className="text-slate-600 mt-2">
              Discover and connect with verified dealers across India
            </p>
          </div>

        {/* Access Level Banner for Unverified Users */}
        {!isUserVerified && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                  Limited Access - Complete Verification for Full Features
                </h3>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>
                    <span className="font-medium">✓ Browse vehicles:</span> Available
                    <span className="font-medium ml-4">✗ Vehicle prices:</span> "Price on request"
                    <span className="font-medium ml-4">✗ Dealer contacts:</span> Hidden
                  </p>
                  <p className="text-xs">
                    Complete your business verification to unlock pricing, dealer details, and make offers.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => window.location.href = createPageUrl('KYBWizard')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Complete Verification
              </Button>
            </div>
          </div>
        )}
          
          {/* Verification Status */}
          <div className="flex items-center gap-2">
            {isUserVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : isUnderReview ? (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Under Review
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600">
                <Shield className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
            
            {showPrices ? (
              <Badge variant="outline" className="text-green-600">
                <Eye className="w-3 h-3 mr-1" />
                Prices Visible
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600">
                <EyeOff className="w-3 h-3 mr-1" />
                Prices Hidden
              </Badge>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search vehicles by brand, model, or variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                  {hasActiveFilters}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>



      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {filteredVehicles.length} vehicles found
          </h2>
          <div className="text-sm text-slate-600">
            Showing {filteredVehicles.length} of {allVehicles.length} vehicles
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No vehicles found</h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                dealer={null} // We need to fetch dealer data for each vehicle
                currentDealer={currentDealer}
                onCompareToggle={handleCompareToggle}
                isInCompare={comparedVehicles.includes(vehicle.id)}
                onMakeOffer={handleMakeOffer}
                isUserVerified={isUserVerified}
                isUnderReview={isUnderReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={selectedFilters}
        setFilters={setSelectedFilters}
        resultsCount={filteredVehicles.length}
        allVehicles={allVehicles}
        userClientType={userRole === 'dealer' ? 'dealer' : 'individual'}
        isUserVerified={verificationStatus === 'verified'}
        isDealer={dealerRole !== null}
      />
    </div>
  );
}

// Export the marketplace content directly without policy enforcement
// Policy restrictions are applied at the component level (prices, dealer contacts)
export default function Marketplace() {
  return <MarketplaceContent />;
}
