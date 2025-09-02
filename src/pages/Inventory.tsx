
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { Branch } from "@/api/entities";
import { User } from "@/api/entities";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  ArrowUpDown,
  Globe,
  Car,
  Lock,
  Wrench,
  AlertTriangle,
  Loader2,
  Grid3X3,
  List,
  Building2,
  Eye,
  Edit,
  Trash2,
  Share2,
  Truck,
  CheckCircle2,
  Merge,
  Settings,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Crown,
  Info,
  Shield,
  Copy,
  ClipboardCheck
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { useTheme } from "@/contexts/ThemeContext";
import {
  getDealerTier,
  shouldPromptUpgrade,
  getUpgradeBenefits,
  hasFeatureAccess,
  type TierLevel
} from '@/lib/tierConfig';
import { FeatureGate, useFeatureAccess } from '@/components/ui/FeatureGate';
import UpgradeWizard from '@/components/ui/UpgradeWizard';
import { useDealerActivationContext } from '@/contexts/DealerActivationContext';
import { useDealerContext } from '@/contexts/DealerContext';
import { db } from '@/api/supabaseClient';

// Import enhanced components
import BranchSwitcher from "../components/inventory/BranchSwitcher";
import InventoryFilters from "../components/inventory/InventoryFilters";
import VehicleCard from "../components/inventory/VehicleCard";
import BulkOperationsPanel from "../components/inventory/BulkOperationsPanel";
import InventoryTypeSwitcher from "../components/inventory/InventoryTypeSwitcher";
import EmptyState from "../components/inventory/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const INVENTORY_TYPE_FILTERS = [
  { value: 'all', label: 'All', icon: Globe },
  { value: 'public', label: 'Public', icon: Car },
  { value: 'masked', label: 'Masked', icon: Eye },
  { value: 'draft', label: 'Draft', icon: Lock },
  { value: 'b2b', label: 'B2B', icon: Building2 },
];

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth(); // Get current authenticated user

  const { theme } = useTheme();

  // Activation system hooks
  const {
    checkFeatureAccess,
    activationStatus,
    unlockedFeatures,
    refreshSettings,
    isLoading: activationLoading
  } = useDealerActivationContext();

  // Use DealerContext for consistent dealer data
  const { dealer, tier, isLoading: dealerLoading } = useDealerContext();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showUpgradeWizard, setShowUpgradeWizard] = useState(false);

  // Note: Tier is now managed by DealerContext and updates automatically

  // Feature access hook with activation system
  const featureAccess = useFeatureAccess(dealer, true); // Enable activation system
  
  // Core state
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set<string>());
  const [selectedVehiclesArray, setSelectedVehiclesArray] = useState<string[]>([]);
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');

  // Branch creation state
  const [newBranch, setNewBranch] = useState({ name: '', city: '' });
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);

  // Filter states
  const [inventoryType, setInventoryType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    masked: 0,
    draft: 0,
    b2b: 0,
    pendingApprovals: 0,
    pendingTransfers: 0,
    duplicates: 0
  });

  // KYC Completion Actions
  const [showKycPublishPrompt, setShowKycPublishPrompt] = useState(false);

  // Inventory Type Switcher
  const [showInventoryTypeSwitcher, setShowInventoryTypeSwitcher] = useState(false);



  useEffect(() => {
    if (user) {
      initializeInventory();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBranchId) {
      loadVehicles();
    }
  }, [selectedBranchId]);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, inventoryType, searchQuery, sortBy, priceRange, onlyMine]);

  // Keep stats in sync with the latest loaded vehicles
  useEffect(() => {
    if (selectedBranchId) {
      loadStats();
    }
  }, [vehicles, selectedBranchId]);

  // Keep selectedVehiclesArray in sync with selectedVehicles Set
  useEffect(() => {
    setSelectedVehiclesArray(Array.from(selectedVehicles));
  }, [selectedVehicles]);

  // Handle URL parameters for upgrade wizard
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade === 'true') {
      setShowUpgradeWizard(true);
      // Remove the parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('upgrade');
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);

  // Force refresh data when coming from AddVehicle page
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      console.log('Inventory - Force refresh triggered from URL');
      if (selectedBranchId) {
        loadVehicles();
        loadStats();
      }
      // Remove the parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('refresh');
      setSearchParams(newSearchParams);
    }
  }, [searchParams, selectedBranchId]);

  const loadBranches = async () => {
    try {
      // Load branches for the current dealer only
      const branchesResult = await Branch.list(dealer?.id ? { dealer_id: dealer.id } : {});
      console.log('Loading branches for dealer:', dealer?.id, 'Result count:', branchesResult?.length);

      if (branchesResult && branchesResult.length > 0) {
        setBranches(branchesResult);
        // Don't change selected branch if one is already selected
        if (!selectedBranchId) {
          const defaultBranch = branchesResult.find((b: any) => b.is_default) || branchesResult[0];
          setSelectedBranchId(defaultBranch.id);
        }
      } else {
        setBranches([]);
      }
      return branchesResult || [];
    } catch (error) {
      console.error('Error loading branches:', error);
      return [];
    }
  };

  const initializeInventory = async () => {
    try {
      setIsLoading(true);

      // Check if KYC was just completed (show bulk publish option)
      if (dealer?.verification_status === 'verified') {
        setShowKycPublishPrompt(true);
      }

      // Load branches for the current dealer
      const branchesResult = await loadBranches();

      if (branchesResult && branchesResult.length > 0) {
        console.log('Loaded branches for dealer:', dealer?.id, branchesResult.length);
      } else {
        console.log('No branches found for dealer:', dealer?.id);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize inventory",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Show the activation wizard for the new system
    setShowUpgradeWizard(true);
    setShowUpgradePrompt(false);
  };



  const handleUpgradeComplete = async (settings: any) => {
    console.log('Customised activation completed:', settings);
    setShowUpgradeWizard(false);

    // Update dealer's activation_completed field in database
    try {
      if (dealer?.id) {
        await db
          .from('dealers')
          .update({
            activation_completed: true,
            dashboard_type: 'customised',
            last_activation_update: new Date().toISOString()
          })
          .eq('id', dealer.id);

        // Note: Dealer state is now managed by DealerContext
        console.log('✅ Customised mode activated: activation_completed set to true');

        console.log('✅ Customised mode activated: activation_completed set to true');
      }

      toast({
        title: "Customised Inventory Activated! 🎉",
        description: "Your inventory has been updated with customised features. Refresh to see all new options.",
      });

      // Force refresh to show new features
      await forceRefreshAfterActivation();
    } catch (error) {
      console.error('Activation update failed:', error);
      toast({
        title: "Activation Error",
        description: "Settings were saved but activation status update failed. Please refresh the page.",
        variant: "destructive",
      });
    }
  };



  const handleCloseUpgrade = () => {
    setShowUpgradePrompt(false);
  };

  const forceRefreshAfterActivation = async () => {
    try {
      // Refresh all data to show new features
      await loadBranches();
      await loadVehicles();
      await loadStats();
      
      // Note: Tier state is now managed by DealerContext
      
      console.log('✅ Force refresh completed after activation');
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  };

  const handleCreateFirstBranch = async () => {
    if (!newBranch.name || !newBranch.city) return;

    setIsCreatingBranch(true);
    try {
      const branchData = {
        name: newBranch.name,
        city: newBranch.city,
        dealer_id: dealer?.id,
        is_active: true,
        branch_type: 'showroom' as const
      };

      const result = await Branch.create(branchData);

      // Refresh branches and set as active
      await loadBranches();
      setSelectedBranchId(result.id);

      // Reset form and show success
      setNewBranch({ name: '', city: '' });
      toast({
        title: "Branch Created!",
        description: `Your "${result.name}" branch has been created successfully.`,
      });

    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const loadVehicles = async () => {
    try {
      console.log('Inventory - Loading vehicles for branch:', selectedBranchId);
      const result = await Vehicle.getByBranch(selectedBranchId);
      console.log('Inventory - Vehicle result:', result);
      if (result.error) throw result.error;
      console.log('Inventory - Loaded vehicles count:', result.data?.length || 0);
      console.log('Inventory - Loaded vehicles:', result.data);
      setVehicles(result.data || []);
    } catch (error) {
      console.error('Inventory - Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from loaded vehicles instead of separate API call
      const vehicleStats = {
        total: vehicles.length,
        public: vehicles.filter(v => v.inventory_type === 'public').length,
        masked: vehicles.filter(v => v.inventory_type === 'masked').length,
        draft: vehicles.filter(v => v.inventory_type === 'draft').length,
        b2b: vehicles.filter(v => v.inventory_type === 'b2b').length,
        pendingApprovals: 0, // Will be implemented later
        pendingTransfers: 0, // Will be implemented later
        duplicates: 0 // Will be implemented later
      };
      
      setStats(vehicleStats);
      console.log('Inventory - Calculated stats from vehicles:', vehicleStats);
    } catch (error) {
      console.error('Failed to calculate stats:', error);
      // Fallback to empty stats
      setStats({
        total: 0,
        public: 0,
        masked: 0,
        draft: 0,
        b2b: 0,
        pendingApprovals: 0,
        pendingTransfers: 0,
        duplicates: 0
      });
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Filter by inventory type
    if (inventoryType !== 'all') {
      filtered = filtered.filter(v => v.inventory_type === inventoryType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.make?.toLowerCase().includes(query) ||
        v.model?.toLowerCase().includes(query) ||
        v.registration_number?.toLowerCase().includes(query) ||
        v.vin?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(v => {
      const price = v.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'make':
          return (a.make || '').localeCompare(b.make || '');
        default:
          return 0;
      }
    });

    setFilteredVehicles(filtered);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedVehicles.size === 0) {
      toast({
        title: "No vehicles selected",
        description: "Please select vehicles to perform bulk actions",
        variant: "destructive",
      });
      return;
    }

    try {
      const vehicleIds = Array.from(selectedVehicles);
      
      switch (action) {
        case 'publish':
          await Vehicle.bulkPublish(vehicleIds);
          toast({ title: "Published", description: `${vehicleIds.length} vehicles published` });
          break;
        case 'unpublish':
          await Vehicle.bulkUnpublish(vehicleIds);
          toast({ title: "Unpublished", description: `${vehicleIds.length} vehicles unpublished` });
          break;
        case 'delete':
          await Vehicle.bulkDelete(vehicleIds);
          toast({ title: "Deleted", description: `${vehicleIds.length} vehicles deleted` });
          break;
        case 'export':
          // Export logic
          toast({ title: "Export", description: "Export functionality coming soon" });
          break;
      }

      setSelectedVehicles(new Set());
      setShowBulkToolbar(false);
      loadVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} vehicles`,
        variant: "destructive",
      });
    }
  };

  const handleVehicleSelect = (vehicleId: string, selected?: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (selected === false || (selected === undefined && newSelected.has(vehicleId))) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
    setShowBulkToolbar(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set());
      setShowBulkToolbar(false);
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
      setShowBulkToolbar(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Inventory Management
            </h1>
            <Badge variant="outline" className={tier === 'basic' ? 'text-amber-600 border-amber-200' : 'text-green-600 border-green-200'}>
              {tier === 'basic' ? 'Basic Inventory' : 'Customised Inventory'}
            </Badge>
            {tier === 'basic' && branches.length > 2 && (
              <Badge variant="destructive" className="text-xs">
                {branches.length}/2 branches - Upgrade required
              </Badge>
            )}
            {tier === 'basic' && branches.length <= 2 && (
              <Badge variant="secondary" className="text-xs">
                {branches.length}/2 branches - Basic Plan
              </Badge>
            )}
            {tier === 'advanced' && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                {branches.length} branches - Customised Plan
              </Badge>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your vehicle inventory across all branches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(createPageUrl('AddVehicle'))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('BulkImport'))}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (selectedVehicles.size > 0) {
                setShowInventoryTypeSwitcher(true);
              } else {
                toast({
                  title: "No vehicles selected",
                  description: "Please select vehicles to change their exposure mode.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Globe className="w-4 h-4 mr-2" />
            Set Exposure
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/inventory/branches')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Manage Branches
          </Button>

          {/* Upgrade to Customised Button */}
          {tier === 'basic' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpgrade()}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade to Customised
            </Button>
          )}

        </div>
      </div>

      {/* KYC Status Banner */}
      {dealer?.verification_status !== 'verified' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">
                Complete KYC to publish to marketplace
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Your public inventory will show as "Not Live" until KYC is verified.
                <a href="/settings?tab=kyc" className="underline ml-1">Complete KYC now</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KYC Completed Banner */}
      {dealer?.verification_status === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">
                KYC Verified ✓
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your public inventory is live on the marketplace. All new public listings will go live automatically.
              </p>
            </div>
            {showKycPublishPrompt && stats.public > 0 && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    // Publish all public vehicles at once
                    const publicVehicles = vehicles.filter(v => v.inventory_type === 'public');
                    if (publicVehicles.length > 0) {
                      await Vehicle.bulkPublish(publicVehicles.map(v => v.id));
                      toast({
                        title: "All Public Inventory Published! 🎉",
                        description: `Published ${publicVehicles.length} vehicles to marketplace`,
                      });
                      setShowKycPublishPrompt(false);
                      await loadVehicles();
                      await loadStats();
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to publish vehicles",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Globe className="w-4 h-4 mr-2" />
                Publish All Public ({stats.public})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Branch Cap Blocking Banner for Basic Tier */}
      {tier === 'basic' && branches.length > 2 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Branch Limit Exceeded
                  </h3>
                  <p className="text-red-700">
                    You have {branches.length} branches, but Basic Inventory allows only 2.
                    Upgrade to Customised Inventory to continue managing all your branches.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleUpgrade()}
                className="bg-red-600 hover:bg-red-700"
              >
                Upgrade to Customised
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch-First Blocking Card */}
      {branches.length === 0 && !isLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Create your first branch
                  </h3>
                  <p className="text-blue-700 mb-3">
                    Before adding vehicles, you need to set up at least one branch to organize your inventory.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branchName" className="text-sm font-medium text-blue-800">
                        Branch Name
                      </Label>
                      <Input
                        id="branchName"
                        placeholder="e.g., Main Showroom"
                        className="mt-1"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchCity" className="text-sm font-medium text-blue-800">
                        City
                      </Label>
                      <Input
                        id="branchCity"
                        placeholder="e.g., Mumbai"
                        className="mt-1"
                        value={newBranch.city}
                        onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl('settings?tab=branches'))}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Manage Branches
                </Button>
                <Button
                  onClick={handleCreateFirstBranch}
                  disabled={!newBranch.name || !newBranch.city || isCreatingBranch}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreatingBranch ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Branch
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <FeatureGate
          feature="analytics"
          dealer={dealer}
          useActivationSystem={true}
          showUpgradePrompt={true}
        >
          {/* Empty children - FeatureGate will show upgrade prompt */}
        </FeatureGate>
      )}

      {/* Activation Status Banner - Hidden for cleaner first-time UX */}
      {/* <ActivationStatusBanner dealer={dealer} /> */}

      {/* Branch Switcher */}
      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <BranchSwitcher
            selectedBranchId={selectedBranchId}
            onBranchChange={setSelectedBranchId}
            showCreateButton={featureAccess.canCreateBranch(branches.length)}
            dealer={dealer}
            tier={tier}
            onRefresh={loadBranches}
          />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Public</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.public}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Masked</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.masked}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Draft</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.draft}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">B2B</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.b2b}
            </p>
          </CardContent>
        </Card>

        {/* Show advanced stats only when they have data */}
        {stats.pendingApprovals > 0 && (
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.pendingApprovals}
              </p>
            </CardContent>
          </Card>
        )}

        {stats.pendingTransfers > 0 && (
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Transfers</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.pendingTransfers}
              </p>
            </CardContent>
          </Card>
        )}

        {stats.duplicates > 0 && (
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-red-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Duplicates</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.duplicates}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${checkFeatureAccess('inspections') ? 'grid-cols-7' : 'grid-cols-6'}`}>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          {/* Show additional tabs only when they have data or features are unlocked */}
          {(stats.pendingTransfers > 0 || checkFeatureAccess('unlimited_branches')) && (
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          )}
          {(stats.pendingApprovals > 0 || checkFeatureAccess('approvals')) && (
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          )}
          {(stats.duplicates > 0 || checkFeatureAccess('bulk_operations')) && (
            <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          )}
          {checkFeatureAccess('analytics') && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
          {checkFeatureAccess('inspections') && (
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
          )}
          {checkFeatureAccess('unlimited_branches') && (
            <TabsTrigger value="features">Features</TabsTrigger>
          )}
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters and Search */}
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder={filteredVehicles.length === 0 ? "Add vehicles to search and filter" : "Search vehicles by make, model, registration, or VIN..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={filteredVehicles.length === 0}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={inventoryType}
                    onValueChange={setInventoryType}
                    disabled={filteredVehicles.length === 0}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_TYPE_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          <div className="flex items-center gap-2">
                            <filter.icon className="w-4 h-4" />
                            {filter.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                    disabled={filteredVehicles.length === 0}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price_high">Price High to Low</SelectItem>
                      <SelectItem value="price_low">Price Low to High</SelectItem>
                      <SelectItem value="make">Make A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={filteredVehicles.length === 0}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      disabled={filteredVehicles.length === 0}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      disabled={filteredVehicles.length === 0}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <InventoryFilters
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    onlyMine={onlyMine}
                    setOnlyMine={setOnlyMine}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Toolbar - Temporarily disabled during component cleanup */}
          {/* {showBulkToolbar && (
            <>
              <BulkToolbar
                selectedCount={selectedVehicles.size}
                onArchive={() => handleBulkAction('archive')}
                onTypeChange={() => handleBulkAction('change_type')}
                onClearSelection={() => {
                  setSelectedVehicles(new Set());
                  setShowBulkToolbar(false);
                }}
              />
            </>
          )} */}

          {/* Advanced Bulk Operations */}
          <FeatureGate feature="bulk_operations" dealer={dealer} useActivationSystem={true}>
            <BulkOperationsPanel
              selectedVehicles={selectedVehiclesArray}
              onSelectionChange={(vehicleIds) => {
                setSelectedVehicles(new Set(vehicleIds));
              }}
              dealerId={dealer?.id}
              dealerKycStatus={dealer?.verification_status === 'verified' ? 'full' :
                               dealer?.verification_status === 'basic' ? 'basic' : 'none'}
              availableVehicles={filteredVehicles.map(vehicle => ({
                id: vehicle.id,
                registration_number: vehicle.registration_number,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                asking_price: vehicle.asking_price,
                status: vehicle.status,
                branch_id: vehicle.branch_id,
                exposure_mode: vehicle.exposure_mode
              }))}
              availableBranches={branches}
            />
          </FeatureGate>

          {/* Vehicles Grid/List */}
          {filteredVehicles.length === 0 ? (
            <EmptyState dealer={dealer} />
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicles.has(vehicle.id)}
                  onSelect={(vehicleId: string, selected: boolean) => handleVehicleSelect(vehicleId)}
                  onShare={(vehicle: any) => {/* Handle share */}}
                  onDelete={(vehicleId: string) => {/* Handle delete */}}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transfers Tab - Coming Soon */}
        <TabsContent value="transfers">
          <div className="text-center py-12">
            <Truck className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Transfer Center
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Vehicle transfers between branches coming soon
            </p>
          </div>
        </TabsContent>

        {/* Approvals Tab - Coming Soon */}
        <TabsContent value="approvals">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Approvals Queue
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Multi-stage approval workflows coming soon
            </p>
          </div>
        </TabsContent>

        {/* Duplicates Tab - Coming Soon */}
        <TabsContent value="duplicates">
          <div className="text-center py-12">
            <Copy className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Duplicates Manager
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Smart duplicate detection and management coming soon
            </p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <FeatureGate
            feature="analytics"
            dealer={dealer}
            useActivationSystem={true}
            fallback={
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Customised Analytics
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Complete the Customisation Wizard to unlock detailed analytics and BI dashboards
                </p>
              </div>
            }
          >
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Detailed analytics and insights coming soon
              </p>
            </div>
          </FeatureGate>
        </TabsContent>

        {/* Inspections Tab - Coming Soon */}
        {checkFeatureAccess('inspections') && (
          <TabsContent value="inspections">
            <div className="text-center py-12">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Inspection Workflows
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Professional inspection workflows and checklists coming soon
              </p>
            </div>
          </TabsContent>
        )}

        {/* Features Tab - Coming Soon */}
        <TabsContent value="features">
          <div className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Feature Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Overview of available and upcoming features coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Wizard Modal */}
      {showUpgradeWizard && (
        <UpgradeWizard
          onClose={() => setShowUpgradeWizard(false)}
          dealer={dealer}
          onComplete={handleUpgradeComplete}
        />
      )}

      {/* Inventory Type Switcher Modal */}
      {showInventoryTypeSwitcher && (
        <InventoryTypeSwitcher
          vehicles={vehicles.filter(v => selectedVehicles.has(v.id))}
          isOpen={showInventoryTypeSwitcher}
          onClose={() => setShowInventoryTypeSwitcher(false)}
          onSuccess={() => {
            setShowInventoryTypeSwitcher(false);
            loadVehicles();
            loadStats();
          }}
          dealer={dealer}
        />
      )}
    </div>
  );
}
