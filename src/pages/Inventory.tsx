
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import { TeamMember } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, SlidersHorizontal, Upload, ArrowUpDown, Globe, Car, Lock, Wrench, AlertTriangle, Loader2, Grid3X3, List, Building2, Eye, Edit, Trash2, Share2 } from "lucide-react";
// restored baseline (no permission gating here)
import AdvancedModeToggle from "../components/inventory/AdvancedModeToggle";
import GlobeView from "../components/inventory/GlobeView";
import BranchDetailsPanel from "../components/inventory/BranchDetailsPanel";
import AddTeamMemberModal from "../components/inventory/AddTeamMemberModal";
import BranchSetupModal from "../components/modals/BranchSetupModal";
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
  const navigate = useNavigate();
  // no permissions context in baseline
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
  const [activeTab, setActiveTab] = useState<'table' | 'card' | 'kanban'>('card');
  const [tableSort, setTableSort] = useState<{ key: 'makeModel' | 'year' | 'reg' | 'type' | 'branch' | 'price'; dir: 'asc' | 'desc';}>({ key: 'makeModel', dir: 'asc' });
  
  // Filter states for InventoryFilters component
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  
  // Branch filter states
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [branchVehicleCounts, setBranchVehicleCounts] = useState<{[key: string]: number}>({});
  
  // Advanced Mode states
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [planChoice, setPlanChoice] = useState<'basic' | 'advanced'>('advanced');
  const [selectedBranchForDetails, setSelectedBranchForDetails] = useState<any>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [draggedVehicleId, setDraggedVehicleId] = useState<string | null>(null);

  useEffect(() => { loadInventory(); }, []);
  useEffect(() => { filterAndSortVehicles(); }, [vehicles, searchQuery, sortBy, inventoryType, priceRange, onlyMine, selectedBranch]); // Add selectedBranch to dependencies
  useEffect(() => { setShowBulkToolbar(selectedVehicles.size > 0); }, [selectedVehicles]);
  useEffect(() => { loadBranches(); }, [dealer]);
  useEffect(() => { loadTeamMembers(); }, [dealer]);
  // Removed auto-open Branch modal on load to avoid unexpected popups

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      console.log('Inventory - Current user:', currentUser);
      
      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      console.log('Inventory - Dealer profile:', dealerProfile);
      
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
        console.log('Inventory - Loaded vehicles:', vehicleData);
        setVehicles(vehicleData || []);
      }
    } catch (error) { 
      console.error("Error loading inventory:", error); 
    }
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

  const loadTeamMembers = async () => {
    if (!dealer?.id) return;
    
    try {
      const { data: teamMembersData, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('dealer_id', dealer.id);
      
      if (error) throw error;
      setTeamMembers(teamMembersData || []);
    } catch (error) {
      console.error("Error loading team members:", error);
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
  
  // Advanced Mode handlers
  const handleBranchSelect = (branch: any) => {
    setSelectedBranchForDetails(branch);
  };
  
  const handleAddTeamMember = () => {
    setShowAddTeamModal(true);
  };
  
  const handleAddBranch = () => {
    // In Basic mode, cap branches to 2
    if (!isAdvancedMode && branches.length >= 2) {
      toast({
        title: "Branch Limit Reached",
        description: "Basic mode supports up to 2 branches. Upgrade to add more.",
        variant: "destructive",
      });
      return;
    }
    setEditingBranch(null);
    setShowBranchModal(true);
  };
  
  const handleEditBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    setEditingBranch(branch);
    setShowBranchModal(true);
  };
  
  const handleViewVehicle = (vehicleId: string) => {
    // Navigate to vehicle detail view
    console.log('View vehicle:', vehicleId);
  };
  
  const handleEditVehicle = (vehicleId: string) => {
    // Navigate to vehicle editing
    console.log('Edit vehicle:', vehicleId);
  };
  
  const handleTeamMemberSubmit = async (data: any) => {
    try {
      // Create team member using the existing TeamMember entity
      console.log('Creating team member:', data);
      await TeamMember.create({
        ...data,
        dealer_id: dealer.id,
        status: 'pending'
      });
      
      toast({
        title: "Team Member Added",
        description: "Team member has been successfully added.",
      });
      
      // Refresh data
      loadTeamMembers();
    } catch (error) {
      console.error('Error creating team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBranchAdded = (branch: any) => {
    console.log('Branch added successfully:', branch);
    toast({
      title: "Branch Created",
      description: "New branch has been successfully created.",
    });
    // Refresh data
    loadBranches();
  };

  const handleBranchUpdated = (branch: any) => {
    console.log('Branch updated successfully:', branch);
    toast({
      title: "Branch Updated",
      description: "Branch has been successfully updated.",
    });
    // Refresh data
    loadBranches();
  };

  // KPI metrics derived from vehicles
  const kpi = React.useMemo(() => {
    const total = vehicles.length;
    const listed = vehicles.filter(v => v?.inventory_type === 'public').length;
    const internal = vehicles.filter(v => v?.inventory_type === 'private').length;
    const workshop = vehicles.filter(v => v?.inventory_type === 'service').length;
    const reserved = vehicles.filter(v => v?.status === 'reserved').length;
    const totalValue = vehicles.reduce((sum, v) => sum + (v?.asking_price || 0), 0);
    return { total, listed, internal, workshop, reserved, totalValue };
  }, [vehicles]);

  // Permissions derived flags
  const canAddOrEdit = true;
  const canDelete = true;
  const canManageTeam = true;

  const tableRows = React.useMemo(() => {
    const rows = [...filteredVehicles];
    const getBranchName = (v: any) => branches.find(b => b.id === v?.branch_id)?.name || '';
    rows.sort((a, b) => {
      const dir = tableSort.dir === 'asc' ? 1 : -1;
      switch (tableSort.key) {
        case 'makeModel':
          return dir * (`${a?.make || ''} ${a?.model || ''}`.localeCompare(`${b?.make || ''} ${b?.model || ''}`));
        case 'year':
          return dir * (((a?.year || 0) as number) - ((b?.year || 0) as number));
        case 'reg':
          return dir * (`${a?.registration_number || ''}`.localeCompare(`${b?.registration_number || ''}`));
        case 'type':
          return dir * (`${a?.inventory_type || ''}`.localeCompare(`${b?.inventory_type || ''}`));
        case 'branch':
          return dir * (getBranchName(a).localeCompare(getBranchName(b)));
        case 'price':
          return dir * (((a?.asking_price || 0) as number) - ((b?.asking_price || 0) as number));
        default:
          return 0;
      }
    });
    return rows;
  }, [filteredVehicles, tableSort, branches]);

  const toggleSort = (key: 'makeModel' | 'year' | 'reg' | 'type' | 'branch' | 'price') => {
    setTableSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  // Kanban: handle drag and drop updates
  const handleDragStart = (vehicleId: string) => setDraggedVehicleId(vehicleId);
  const handleDragEnd = () => setDraggedVehicleId(null);
  const handleDropToColumn = async (columnKey: string) => {
    if (!draggedVehicleId) return;
    try {
      let update: any = {};
      if (columnKey === 'public' || columnKey === 'private' || columnKey === 'service') {
        update.inventory_type = columnKey;
      } else if (columnKey === 'reserved') {
        update.status = 'reserved';
      } else {
        return; // no-op for 'all'
      }

      const { error } = await supabase.from('vehicles').update(update).eq('id', draggedVehicleId);
      if (error) throw error;

      // Update local state optimistically
      setVehicles(prev => prev.map(v => v.id === draggedVehicleId ? { ...v, ...update } : v));
      toast({ title: 'Updated', description: 'Vehicle moved successfully.' });
      setDraggedVehicleId(null);
    } catch (e) {
      console.error('Kanban move failed', e);
      toast({ title: 'Move failed', description: 'Could not move vehicle.', variant: 'destructive' });
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] md:text-[24px] font-semibold tracking-tight">Inventory</h1>
              <span className="hidden md:inline-block text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Basic Mode</span>
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                onClick={() => setShowUpgradeModal(true)}
              >
                Upgrade to Advanced
              </button>
          </div>
          <div className="flex gap-3">
              <Link to={createPageUrl("AddVehicle")}>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={!canAddOrEdit} title={!canAddOrEdit ? 'No permission' : undefined}>
                  <Plus className="w-4 h-4" /> Add Vehicle
                </Button>
              </Link>
              <Link to={createPageUrl("BulkImport")}>
                <Button variant="outline" className="gap-2 border-slate-200" disabled={!canAddOrEdit} title={!canAddOrEdit ? 'No permission' : undefined}>
                  <Upload className="w-4 h-4" /> Bulk
                </Button>
              </Link>
            </div>
          </div>
          {/* Sub-banner */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 md:p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs">Basic mode</span>
              <span>You're on basic features. Upgrade to unlock branches, logistics, and advanced features.</span>
            </div>
            <button
              className="hidden md:inline-flex text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade to Advanced
            </button>
          </div>
        </div>

        {/* Advanced Mode Toggle */}
        <AdvancedModeToggle 
          isEnabled={isAdvancedMode} 
          onToggle={setIsAdvancedMode} 
        />

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

        {/* KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Total Vehicles</div>
            <div className="text-2xl font-semibold mt-1">{kpi.total}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Listed</div>
            <div className="text-2xl font-semibold mt-1">{kpi.listed}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Internal</div>
            <div className="text-2xl font-semibold mt-1">{kpi.internal}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Workshop</div>
            <div className="text-2xl font-semibold mt-1">{kpi.workshop}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Total Value</div>
            <div className="text-2xl font-semibold mt-1">₹{(kpi.totalValue || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Analytics link */}
        <div className="flex items-center justify-end -mt-2">
          <Link to={createPageUrl('Analytics')} className="text-xs text-blue-600 hover:underline">View in Analytics</Link>
        </div>

        <Card>
          <CardContent className="p-4 md:p-5">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center sticky top-16 z-[5] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-100 p-3">
                {/* Branch Filter */}
              <div className="flex gap-3">
                <Select value={selectedBranch} onValueChange={(v) => setSelectedBranch(v)}>
                  <SelectTrigger className="w-[160px] md:w-[200px] bg-white">
                    <SelectValue placeholder="All Branches" />
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
                  <SelectTrigger className="w-[160px] md:w-[200px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search vehicles by make, model, or registration"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 border-slate-200">
                  <SlidersHorizontal className="w-4 h-4" /> Advanced Filters
                </Button>
              </div>
            </div>
            
            {/* Optional advanced filters */}
            {showFilters && (
              <div className="mt-4">
              <InventoryFilters 
                  vehicles={vehicles}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onlyMine={onlyMine}
                setOnlyMine={setOnlyMine}
              />
              </div>
            )}
          </CardContent>
        </Card>

        {showBulkToolbar && (
          <div className="sticky bottom-4 z-10">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3 flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  {selectedVehicles.size} selected
                </div>
          <BulkToolbar 
            selectedCount={selectedVehicles.size} 
            onClearSelection={() => { setSelectedVehicles(new Set()); }} 
            onArchive={handleArchiveSelected}
            onTypeChange={handleBulkTypeChange}
          />
              </div>
            </div>
          </div>
        )}

        {/* Upgrade to Advanced Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Upgrade to Advanced</h3>
                <p className="text-slate-600 text-sm">
                  Unlock unlimited branches, advanced logistics, BI analytics, attribute sets, inspections, and more.
                </p>
                {/* Plan selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    className={`text-left rounded-lg border p-4 transition-colors ${planChoice === 'basic' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    onClick={() => setPlanChoice('basic')}
                  >
                    <div className="text-sm font-semibold">Basic</div>
                    <ul className="mt-2 text-xs text-slate-600 space-y-1">
                      <li>Up to 2 branches</li>
                      <li>Bulk upload (200 rows)</li>
                      <li>Lite logistics & analytics</li>
                    </ul>
                  </button>
                  <button
                    className={`text-left rounded-lg border p-4 transition-colors ${planChoice === 'advanced' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    onClick={() => setPlanChoice('advanced')}
                  >
                    <div className="text-sm font-semibold">Advanced</div>
                    <ul className="mt-2 text-xs text-slate-600 space-y-1">
                      <li>Unlimited branches & themes</li>
                      <li>Logistics, inspections</li>
                      <li>BI & data operations</li>
                    </ul>
                  </button>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Not now</Button>
                  <Button variant="outline" onClick={() => { if (planChoice === 'advanced') setIsAdvancedMode(true); setShowUpgradeModal(false); }}>Apply Selected (dev)</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setShowUpgradeModal(false); navigate(createPageUrl(planChoice === 'advanced' ? "Pricing" : "Plans")); }}>Continue</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isAdvancedMode ? (
          // Advanced Mode Layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Globe View - Takes 2/3 of the space */}
            <div className="lg:col-span-2">
              <GlobeView
                  branches={branches.map(branch => ({
                    ...branch,
                    vehicle_count: branchVehicleCounts[branch.id] || 0,
                    team_member_count: teamMembers.filter(tm => tm.branch_id === branch.id).length,
                  }))}
                  selectedBranch={selectedBranchForDetails}
                  onBranchSelect={handleBranchSelect}
                  onAddBranch={handleAddBranch}
                  onSetDefaultBranch={async (branchId: string) => {
                    if (!dealer?.id) return;
                    try {
                      const { error: unsetError } = await supabase
                        .from('branches')
                        .update({ is_default: false })
                        .eq('dealer_id', dealer.id)
                        .eq('is_default', true);
                      if (unsetError) throw unsetError;

                      const { error: setError } = await supabase
                        .from('branches')
                        .update({ is_default: true })
                        .eq('id', branchId);
                      if (setError) throw setError;

                      toast({ title: 'Main Branch Updated', description: 'Selected branch is now the main branch.' });
                      await loadBranches();
                    } catch (e) {
                      console.error('Failed to set default branch', e);
                      toast({ title: 'Update Failed', description: 'Could not set main branch.', variant: 'destructive' });
                    }
                  }}
                />
            </div>
            
            {/* Branch Details Panel - Takes 1/3 of the space */}
            <div className="lg:col-span-1">
                           <BranchDetailsPanel
               branch={selectedBranchForDetails}
               teamMembers={teamMembers.filter(tm => tm.branch_id === selectedBranchForDetails?.id)}
               vehicles={filteredVehicles.filter(v => v.branch_id === selectedBranchForDetails?.id)}
               onAddTeamMember={handleAddTeamMember}
               onAddBranch={handleAddBranch}
               onEditBranch={handleEditBranch}
               onViewVehicle={handleViewVehicle}
               onEditVehicle={handleEditVehicle}
             />
            </div>
          </div>
        ) : (
          // Standard Mode Layout
          isLoading ? <div><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10"/></div> : (
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
                  
                    {/* Tabs */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => { setActiveTab('table'); setViewMode('list'); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Table
                      </button>
                      <button
                        onClick={() => { setActiveTab('card'); setViewMode('grid'); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Card
                      </button>
                      <button
                        onClick={() => { setActiveTab('kanban'); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Kanban
                      </button>
                  </div>
                </div>
                
                {/* Vehicle Listings */}
                  {activeTab === 'kanban' ? (
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[900px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[
                          { key: 'all', title: 'All', badge: 'bg-slate-100 text-slate-700', filter: (v: any) => true },
                          { key: 'public', title: 'Listed', badge: 'bg-emerald-100 text-emerald-700', filter: (v: any) => v?.inventory_type === 'public' },
                          { key: 'private', title: 'Internal', badge: 'bg-indigo-100 text-indigo-700', filter: (v: any) => v?.inventory_type === 'private' },
                          { key: 'service', title: 'Workshop', badge: 'bg-amber-100 text-amber-700', filter: (v: any) => v?.inventory_type === 'service' },
                          { key: 'reserved', title: 'Reserved', badge: 'bg-rose-100 text-rose-700', filter: (v: any) => v?.status === 'reserved' },
                        ].map(col => {
                          const items = filteredVehicles.filter(col.filter);
                          return (
                            <div
                              key={col.key}
                              className="rounded-lg border border-slate-200 bg-white"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDropToColumn(col.key as string)}
                            >
                              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  {col.title}
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${col.badge}`}>{items.length}</span>
                                </h4>
                              </div>
                              <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                                {items.length === 0 ? (
                                  <div className="text-xs text-slate-500 text-center py-6">No vehicles</div>
                                ) : (
                                  items.map((vehicle) => (
                                    <div
                                      key={vehicle.id}
                                      draggable
                                      onDragStart={() => handleDragStart(vehicle.id)}
                                      onDragEnd={handleDragEnd}
                                      className="rounded-md border border-slate-200 bg-white p-3 shadow-sm cursor-move"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium truncate max-w-[180px]">{vehicle?.make} {vehicle?.model}</div>
                                        <span className="text-xs text-slate-500">₹{(vehicle?.asking_price || 0).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                                        <span>{vehicle?.year || '-'}</span>
                                        <span>•</span>
                                        <span>{vehicle?.registration_number || '—'}</span>
                                      </div>
                                      {vehicle?.branches?.name || vehicle?.branch_id ? (
                                        <div className="mt-2">
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                            {branches.find(b => b.id === vehicle?.branch_id)?.name || 'Branch'}
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : viewMode === 'grid' ? (
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
                    <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('makeModel')}>Make/Model</th>
                            <th className="text-left font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('year')}>Year</th>
                            <th className="text-left font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('reg')}>Reg. No</th>
                            <th className="text-left font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('type')}>Type</th>
                            <th className="text-left font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('branch')}>Branch</th>
                            <th className="text-right font-medium text-slate-600 px-4 py-3 cursor-pointer" onClick={() => toggleSort('price')}>Price</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((v) => (
                            <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3">{v?.make} {v?.model}</td>
                              <td className="px-4 py-3">{v?.year || '-'}</td>
                              <td className="px-4 py-3">{v?.registration_number || '—'}</td>
                              <td className="px-4 py-3 capitalize">{v?.inventory_type || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                  {branches.find(b => b.id === v?.branch_id)?.name || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">₹{(v?.asking_price || 0).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleViewVehicle(v.id)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleEditVehicle(v.id)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => setSharingVehicle(v)}>
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" className="h-8 px-2" onClick={() => handleDeleteVehicle(v.id)} disabled={!canDelete} title={!canDelete ? 'No permission' : undefined}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                )}
            </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Car className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No Vehicles Found</h3>
                      <p className="text-slate-600 text-sm">Get started by adding your first vehicle to build your inventory.</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl("AddVehicle")}>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4" /> Add Your First Vehicle
                        </Button>
                      </Link>
                      <Button variant="outline" className="border-slate-200">Try Sample Data</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )
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

        {/* Add Team Member Modal */}
        <AddTeamMemberModal
          isOpen={showAddTeamModal}
          onClose={() => setShowAddTeamModal(false)}
          branches={branches}
          onSubmit={handleTeamMemberSubmit}
          prefillBranchId={selectedBranchForDetails?.id}
        />

                 {/* Branch Modal */}
         <BranchSetupModal
           isOpen={showBranchModal}
           onClose={() => setShowBranchModal(false)}
           dealerId={dealer?.id || ''}
           branch={editingBranch}
           onBranchAdded={handleBranchAdded}
           onBranchUpdated={handleBranchUpdated}
        />
      </div>
    </div>
  );
}
