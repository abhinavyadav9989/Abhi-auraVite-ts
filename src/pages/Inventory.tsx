
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, SlidersHorizontal, Upload, ArrowUpDown, Globe, Car, Lock, Wrench, AlertTriangle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InventoryFilters from "../components/inventory/InventoryFilters";
import VehicleCard from "../components/inventory/VehicleCard";
import BulkToolbar from "../components/inventory/BulkToolbar";
import EmptyState from "../components/inventory/EmptyState";
import ShareLinkModal from '../components/inventory/ShareLinkModal';
import InventoryTypeSwitcher from '../components/inventory/InventoryTypeSwitcher';
import { useToast } from "@/components/ui/use-toast";

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
  
  // Filter states for InventoryFilters component
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);

  useEffect(() => { loadInventory(); }, []);
  useEffect(() => { filterAndSortVehicles(); }, [vehicles, searchQuery, sortBy, inventoryType, priceRange, onlyMine]); // Add new filters to dependencies
  useEffect(() => { setShowBulkToolbar(selectedVehicles.size > 0); }, [selectedVehicles]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      if (dealerProfile.length > 0) {
        setDealer(dealerProfile[0]);
        const vehicleData = await Vehicle.filter({ dealer_id: dealerProfile[0].id }, '-created_date');
        setVehicles(vehicleData);
      }
    } catch (error) { console.error("Error loading inventory:", error); }
    setIsLoading(false);
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
      
      return matchesSearch && matchesType && withinPriceRange;
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
  
  const handleVehicleSelect = (vehicleId, selected) => {
    const newSelected = new Set(selectedVehicles);
    if (selected) newSelected.add(vehicleId); else newSelected.delete(vehicleId);
    setSelectedVehicles(newSelected);
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
            <Link to={createPageUrl("AddVehicle")}><Button className="gap-2"><Plus className="w-4 h-4" /> Add Vehicle</Button></Link>
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
                <div className="flex items-center gap-2 mb-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedVehicles.size === filteredVehicles.length && filteredVehicles.length > 0} className="w-4 h-4 rounded" /> Select all</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} isSelected={selectedVehicles.has(vehicle.id)} onSelect={handleVehicleSelect} onShare={() => setSharingVehicle(vehicle)} />
                ))}
                </div>
            </div>
          ) : <EmptyState dealer={dealer} />
        )}
        
        {sharingVehicle && <ShareLinkModal vehicle={sharingVehicle} onClose={() => setSharingVehicle(null)} />}
        
        {showTypeSwitcher && (
          <InventoryTypeSwitcher
            vehicles={getSelectedVehicles()}
            isOpen={showTypeSwitcher}
            onClose={() => setShowTypeSwitcher(false)}
            onSuccess={() => { loadInventory(); setSelectedVehicles(new Set()); }}
          />
        )}
      </div>
    </div>
  );
}
