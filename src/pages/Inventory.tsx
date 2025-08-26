
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, SlidersHorizontal, Upload, ArrowUpDown, Globe, Car, Lock, Wrench, AlertTriangle, Loader2, Grid3X3, List, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureGate } from "@/components/FeatureGate";
import InventoryFilters from "../components/inventory/InventoryFilters";
import VehicleCard from "../components/inventory/VehicleCard";
import VehicleListCard from "../components/marketplace/VehicleListCard";
import BulkToolbar from "../components/inventory/BulkToolbar";
import EmptyState from "../components/inventory/EmptyState";
import ShareLinkModal from '../components/inventory/ShareLinkModal';
import InventoryTypeSwitcher from '../components/inventory/InventoryTypeSwitcher';
import { useToast } from "@/components/ui/use-toast";
import PasswordConfirmationModal from "@/components/ui/password-confirmation-modal";
import { supabase } from "@/api/supabaseClient";

const INVENTORY_TYPE_FILTERS = [
  { value: 'all', label: 'All', icon: Globe },
  { value: 'public', label: 'Public', icon: Car },
  { value: 'private', label: 'Private', icon: Lock },
  { value: 'service', label: 'Service', icon: Wrench },
  { value: 'aging', label: 'Aging', icon: AlertTriangle },
];

export default function Inventory() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [dealer, setDealer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [showTypeSwitcher, setShowTypeSwitcher] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [inventoryType, setInventoryType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [sharingVehicle, setSharingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states for InventoryFilters component
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  
  // Branch filter states
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [branchVehicleCounts, setBranchVehicleCounts] = useState<{[key: string]: number}>({});

  useEffect(() => { loadInventory(); }, []);
  useEffect(() => { filterAndSortVehicles(); }, [vehicles, searchQuery, sortBy, inventoryType, priceRange, onlyMine, selectedBranch]); // Add selectedBranch to dependencies
  useEffect(() => { setShowBulkToolbar(selectedVehicles.size > 0); }, [selectedVehicles]);
  useEffect(() => { loadBranches(); }, [dealer]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      if (dealerProfile.length > 0) {
        setDealer(dealerProfile[0]);
        // Load vehicles with branch information
        const { data: vehicleData, error } = await supabase
          .from('vehicles')
          .select(`
            *,
            branches(name, is_default)
          `)
          .eq('dealer_id', dealerProfile[0].id);
        
        if (error) throw error;
        setVehicles(vehicleData || []);
      }
    } catch (error) { console.error("Error loading inventory:", error); }
    setIsLoading(false);
  };

  const loadBranches = async () => {
    if (!dealer?.id) return;
    
    try {
      // Load branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: true });
      
      if (branchesError) throw branchesError;
      setBranches(branchesData || []);
      
      // Load vehicle counts per branch
      const { data: vehicleCounts, error: countsError } = await supabase
        .from('vehicles')
        .select('branch_id')
        .eq('dealer_id', dealer.id);
      
      if (countsError) throw countsError;
      
      // Calculate counts
      const counts: {[key: string]: number} = {};
      (vehicleCounts || []).forEach(vehicle => {
        const branchId = vehicle.branch_id || 'unassigned';
        counts[branchId] = (counts[branchId] || 0) + 1;
      });
      
      setBranchVehicleCounts(counts);
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  };

  const filterAndSortVehicles = () => {
    const agingAlertDays = 60;
    let filtered = vehicles.filter(vehicle => {
      // Safe property access
      const vehicleMake = vehicle?.make || '';
      const vehicleModel = vehicle?.model || '';
      const vehicleYear = vehicle?.year || '';
      const vehicleReg = vehicle?.registration_number || '';
      
      const searchableString = `${vehicleMake} ${vehicleModel} ${vehicleYear} ${vehicleReg}`.toLowerCase();
      const matchesSearch = searchQuery === "" || searchableString.includes(searchQuery.toLowerCase());
      
      const vehicleCreatedDate = vehicle?.created_date ? new Date(vehicle.created_date) : new Date();
      const nowMs = Date.now();
      const createdMs = vehicleCreatedDate.getTime();
      const isAging = (nowMs - createdMs) / (1000 * 60 * 60 * 24) > agingAlertDays;
      const matchesType = inventoryType === "all" || (inventoryType === "aging" ? isAging : vehicle?.inventory_type === inventoryType);
      
      // Price range filter
      const vehiclePrice = vehicle?.asking_price || 0;
      const withinPriceRange = vehiclePrice >= priceRange[0] && vehiclePrice <= priceRange[1];
      
      // Branch filter
      const matchesBranch = selectedBranch === "all" || vehicle?.branch_id === selectedBranch;
      
      return matchesSearch && matchesType && withinPriceRange && matchesBranch;
    });

    // Safe sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": 
          return new Date(b?.created_date || 0).getTime() - new Date(a?.created_date || 0).getTime(); // Use getTime() for date comparison
        case "price_high": 
          return (b?.asking_price || 0) - (a?.asking_price || 0);
        case "price_low": 
          return (a?.asking_price || 0) - (b?.asking_price || 0);
        default: 
          return 0;
      }
    });
    
    setFilteredVehicles(filtered);
  };

  const handleArchiveSelected = async () => { /* ... existing logic ... */ };
  
  const handleVehicleSelect = (vehicleId: string, selected: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (selected) {
      newSelected.add(vehicleId);
    } else {
      newSelected.delete(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    setDeletingVehicle(vehicleId);
    setShowPasswordModal(true);
  };

  const confirmDeleteVehicleWithPassword = async () => {
    if (!deletingVehicle) return;

    try {
      await Vehicle.delete(deletingVehicle);
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been successfully deleted.",
      });
      // Remove from local state
      setVehicles(prev => prev.filter(v => v.id !== deletingVehicle));
      // Remove from selected if it was selected
      setSelectedVehicles(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(deletingVehicle);
        return newSelected;
      });
      // Refresh branch data to update counts
      loadBranches();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingVehicle(null);
      setShowPasswordModal(false);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setDeletingVehicle(null);
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelected = checked ? new Set(filteredVehicles.map(v => v.id)) : new Set();
    setSelectedVehicles(newSelected);
  };

  const handleBulkTypeChange = () => {
    if (selectedVehicles.size === 0) {
      toast({ title: "No Selection", description: "Please select vehicles to change their type.", variant: "destructive" });
      return;
    }
    setShowTypeSwitcher(true);
  };

  const getSelectedVehicles = () => vehicles.filter(v => selectedVehicles.has(v.id));
  
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Digital Godown</h1>
            <p className="text-slate-600 mt-1">Total control over your vehicle inventory</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("BulkImport")}><Button variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Bulk Import</Button></Link>
            <FeatureGate feature="add_vehicle" user={dealer}>
              <Link to={createPageUrl("AddVehicle")}><Button className="gap-2"><Plus className="w-4 h-4" /> Add Vehicle</Button></Link>
            </FeatureGate>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {INVENTORY_TYPE_FILTERS.map(type => (
             <button key={type.value} onClick={() => setInventoryType(type.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                inventoryType === type.value ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}>
              <type.icon className="w-4 h-4" /> {type.label}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by make, model, year, or registration..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Branch Filter */}
                <Select value={selectedBranch} onValueChange={(v) => setSelectedBranch(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        All Branches ({vehicles.length})
                      </div>
                    </SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {branch.name}
                            {branch.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Main</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 ml-2">
                            ({branchVehicleCounts[branch.id] || 0})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <InventoryFilters 
                vehicles={vehicles} // This prop might not be necessary inside filters if state is managed externally, but kept as per original
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onlyMine={onlyMine}
                setOnlyMine={setOnlyMine}
              />
            )}
          </CardContent>
        </Card>

        {showBulkToolbar && (
          <BulkToolbar 
            selectedCount={selectedVehicles.size} 
            onClearSelection={() => { setSelectedVehicles(new Set()); }} 
            onArchive={handleArchiveSelected}
            onTypeChange={handleBulkTypeChange}
          />
        )}

        {isLoading ? <div><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10"/></div> : (
          filteredVehicles.length > 0 ? (
            <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={selectedVehicles.size === filteredVehicles.length && filteredVehicles.length > 0} 
                      className="w-4 h-4 rounded" 
                    /> 
                    Select all
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">View:</span>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <List className="w-4 h-4" />
                        List
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Listings */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard 
                        key={vehicle.id} 
                        vehicle={vehicle} 
                        isSelected={selectedVehicles.has(vehicle.id)} 
                        onSelect={handleVehicleSelect} 
                        onShare={() => setSharingVehicle(vehicle)} 
                        onDelete={handleDeleteVehicle} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleListCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        dealer={dealer}
                        currentDealer={dealer}
                        isInCompare={false}
                        onCompareToggle={() => {}}
                        onMakeOffer={() => {}}
                        isUserVerified={true}
                        isUnderReview={false}
                      />
                    ))}
                  </div>
                )}
            </div>
          ) : <EmptyState dealer={dealer} />
        )}
        
        {sharingVehicle && <ShareLinkModal vehicle={sharingVehicle} onClose={() => setSharingVehicle(null)} />}
        
        {showTypeSwitcher && (
          <InventoryTypeSwitcher
            vehicles={getSelectedVehicles()}
            isOpen={showTypeSwitcher}
            onClose={() => setShowTypeSwitcher(false)}
            onSuccess={() => { 
              loadInventory(); 
              loadBranches(); 
              setSelectedVehicles(new Set()); 
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deletingVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Delete Vehicle</h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this vehicle? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setDeletingVehicle(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDeleteVehicleWithPassword}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <PasswordConfirmationModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
          onConfirm={confirmDeleteVehicleWithPassword}
          title="Delete Vehicle Listing"
          description="This action cannot be undone. Please enter your password to permanently delete this vehicle listing."
          confirmText="Delete Listing"
          actionType="delete"
        />
      </div>
    </div>
  );
}
