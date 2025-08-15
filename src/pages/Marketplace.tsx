
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lightbulb, Plus, SlidersHorizontal, Loader2, ArrowUp, Ghost, WifiOff, Heart, Eye, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import FuzzySearchBar from "../components/marketplace/FuzzySearchBar";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import VehicleCard from "../components/marketplace/VehicleCard";
import ComparePanel from "../components/marketplace/ComparePanel";
import NoResultsState from "../components/marketplace/NoResultsState";
import OfferModal from "../components/marketplace/OfferModal";
import ShareLinkModal from "../components/marketplace/ShareLinkModal";
import InsightsSidebar from "../components/marketplace/InsightsSidebar";
import ExpressInterestModal from "../components/marketplace/ExpressInterestModal";

const INITIAL_FILTERS_STATE = {
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
};

export default function Marketplace() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [dealers, setDealers] = useState({});
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS_STATE);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isUnderReview, setIsUnderReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);

      const currentUser = await User.me();
      if (currentUser) {
        const dealerProfiles = await Dealer.filter({ created_by: currentUser.email });
        if (dealerProfiles.length > 0) {
          const dealer = dealerProfiles[0];
          setCurrentDealer(dealer);
          
          // Check if user is verified (either verification_status or verification_status_new)
          const isVerified = dealer.verification_status === 'verified' || dealer.verification_status_new === 'verified';
          const isUnderReview = dealer.verification_status === 'documents_submitted' || dealer.verification_status_new === 'documents_submitted';
          const isUnverified = !isVerified && !isUnderReview;
          
          setIsUserVerified(isVerified);
          setIsUnderReview(isUnderReview);
          
          console.log('User verification status:', {
            verification_status: dealer.verification_status,
            verification_status_new: dealer.verification_status_new,
            isVerified: isVerified,
            isUnderReview: isUnderReview,
            isUnverified: isUnverified
          });
        }
      }

      // Load only public, live vehicles from all dealers
      const vehicles = await Vehicle.filter({ status: 'live', inventory_type: 'public' });
      // Sort newest first client-side and keep as-is (can paginate later)
      const sorted = (vehicles || []).sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime());
      setAllVehicles(sorted);

      const dealerIds = [...new Set(vehicles.map(v => v.dealer_id).filter(Boolean))];
      const dealersData = await Promise.all(dealerIds.map(id => Dealer.get(id).catch(() => null)));
      const dealersMap = {};
      dealersData.forEach(dealer => {
        if (dealer) dealersMap[dealer.id] = dealer;
      });
      setDealers(dealersMap);

    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast({ title: 'Error', description: 'Failed to load marketplace data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let results = [...allVehicles];

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(vehicle => {
        const searchableText = [
          vehicle.make, vehicle.model, vehicle.variant, vehicle.registration_number, vehicle.location_city,
          dealers[vehicle.dealer_id]?.business_name
        ].join(' ').toLowerCase();
        return searchableText.includes(query);
      });
    }

    // Advanced Filters
    results = results.filter(vehicle => {
      const { vehicle_category, fuel_type, make, transmission, ownership, verified_only, price_min, price_max, year_min, year_max, kms_min, kms_max } = filters;

      // Category filter logic
      if ((vehicle_category || []).length > 0) {
        const vehicleCats = Array.isArray(vehicle.vehicle_category)
            ? vehicle.vehicle_category
            : (typeof vehicle.vehicle_category === 'string' ? [vehicle.vehicle_category] : []);
        
        const hasMatch = vehicle_category.some(filterCat => vehicleCats.includes(filterCat));
        if (!hasMatch) return false;
      }
      
      if ((fuel_type || []).length > 0 && !fuel_type.includes(vehicle.fuel_type)) return false;
      if ((make || []).length > 0 && !make.includes(vehicle.make)) return false;
      if ((transmission || []).length > 0 && !transmission.includes(vehicle.transmission)) return false;
      if ((ownership || []).length > 0 && !ownership.includes(vehicle.ownership)) return false;
      
      if (verified_only && dealers[vehicle.dealer_id]?.verification_status !== 'verified') return false;

      if (price_min && vehicle.asking_price < parseInt(price_min) * 100000) return false;
      if (price_max && vehicle.asking_price > parseInt(price_max) * 100000) return false;
      
      if (year_min && vehicle.year < parseInt(year_min)) return false;
      if (year_max && vehicle.year > parseInt(year_max)) return false;

      if (kms_min && vehicle.kilometers < parseInt(kms_min)) return false;
      if (kms_max && vehicle.kilometers > parseInt(kms_max)) return false;
      
      return true;
    });

    // Sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (a.asking_price || 0) - (b.asking_price || 0);
        case 'price_high': return (b.asking_price || 0) - (a.asking_price || 0);
        case 'year_new': return (b.year || 0) - (a.year || 0);
        case 'year_old': return (a.year || 0) - (b.year || 0);
        case 'kms_low': return (a.kilometers || 0) - (b.kilometers || 0);
        case 'newest': default: return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
      }
    });

    setFilteredVehicles(results);
  }, [allVehicles, searchQuery, sortBy, dealers, filters]);

  const handleCompareToggle = (vehicleId) => {
    setCompareList(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else if (prev.length < 3) {
        return [...prev, vehicleId];
      } else {
        toast({ title: 'Compare Limit', description: 'You can compare up to 3 vehicles at a time', variant: 'destructive' });
        return prev;
      }
    });
  };

  const handleMakeOffer = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowOfferModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KYB Verification Banner for Unverified Users */}
        {!isUserVerified && currentDealer && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">
                    {currentDealer.verification_status === 'documents_submitted' || currentDealer.verification_status_new === 'documents_submitted' 
                      ? 'Verification Under Review' 
                      : 'Complete KYB Verification'
                    }
                  </h3>
                  <p className="text-sm text-amber-700">
                    {currentDealer.verification_status === 'documents_submitted' || currentDealer.verification_status_new === 'documents_submitted'
                      ? 'Your business verification is being reviewed. You can still browse vehicles but pricing is hidden.'
                      : 'Vehicle prices and dealer details are hidden until you complete KYB verification'
                    }
                  </p>
                </div>
              </div>
              <Link to={currentDealer.verification_status === 'documents_submitted' || currentDealer.verification_status_new === 'documents_submitted' 
                ? createPageUrl("Profile") 
                : createPageUrl("OnboardingWizard")
              }>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  {currentDealer.verification_status === 'documents_submitted' || currentDealer.verification_status_new === 'documents_submitted'
                    ? 'View Profile'
                    : 'Complete KYB'
                  }
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
            <p className="text-slate-600 mt-1">{filteredVehicles.length} vehicles available for you</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("AddVehicle")}>
              <Button className="gap-2"><Plus className="w-4 h-4" /> List Vehicle</Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <FuzzySearchBar 
              onSearch={setSearchQuery}
              currentDealer={currentDealer}
              placeholder="Search by make, model, city, or dealer..."
            />
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm">
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="year_new">Year: Newest First</option>
              <option value="year_old">Year: Oldest First</option>
              <option value="kms_low">Kilometers: Low to High</option>
            </select>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <MarketplaceFilters 
            filters={filters}
            setFilters={setFilters}
            resultsCount={filteredVehicles.length}
            allVehicles={allVehicles}
            userClientType={currentDealer?.client_type}
          />
        )}

        {compareList.length > 0 && (
          <ComparePanel
            vehicleIds={compareList}
            vehicles={allVehicles}
            dealers={dealers}
            onRemove={handleCompareToggle}
            onClear={() => setCompareList([])}
          />
        )}

        {filteredVehicles.length === 0 ? (
          <NoResultsState 
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
            setFilters={() => setFilters(INITIAL_FILTERS_STATE)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                dealer={dealers[vehicle.dealer_id]}
                currentDealer={currentDealer}
                isInCompare={compareList.includes(vehicle.id)}
                onCompareToggle={() => handleCompareToggle(vehicle.id)}
                onMakeOffer={() => handleMakeOffer(vehicle)}
                isUserVerified={isUserVerified}
                isUnderReview={isUnderReview}
              />
            ))}
          </div>
        )}
      </div>

      {showOfferModal && selectedVehicle && isUserVerified && (
        <OfferModal
          vehicle={selectedVehicle}
          dealer={dealers[selectedVehicle.dealer_id]}
          currentDealer={currentDealer}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}
