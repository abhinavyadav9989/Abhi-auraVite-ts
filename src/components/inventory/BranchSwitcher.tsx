import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Building2, ChevronDown, Plus, Settings, Users, TrendingUp, Lock, Zap, Store, Wrench, Warehouse, MapPin, ChevronRight, ChevronsDown, RefreshCw } from 'lucide-react';
import { Dealer } from '@/api/entities';
import { db } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BranchModal from './BranchModal';
import {
  getDealerTier,
  canCreateMoreBranches,
  shouldPromptUpgrade,
  getUpgradeBenefits,
  type TierLevel
} from '@/lib/tierConfig';
import { FeatureGate, useFeatureAccess } from '@/components/ui/FeatureGate';
import { useDealerActivationContext } from '@/contexts/DealerActivationContext';


interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  is_default: boolean;
  vehicle_count: number;
  status: 'active' | 'inactive';
  branch_type?: 'showroom' | 'workshop' | 'warehouse' | 'kiosk' | 'outlet';
  parent_branch_id?: string;
  hierarchy_level?: number;
  children?: Branch[];
  is_expanded?: boolean;
  has_children?: boolean;
}

interface BranchSwitcherProps {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  showCreateButton?: boolean;
  dealer?: any; // Add dealer prop
  tier?: TierLevel; // Add tier prop
  onRefresh?: () => void; // Add refresh callback
}

// Branch type configurations
const BRANCH_TYPE_CONFIG = {
  showroom: { icon: Store, label: 'Showroom', color: 'text-blue-600' },
  workshop: { icon: Wrench, label: 'Workshop', color: 'text-orange-600' },
  warehouse: { icon: Warehouse, label: 'Warehouse', color: 'text-green-600' },
  kiosk: { icon: MapPin, label: 'Kiosk', color: 'text-purple-600' },
  outlet: { icon: Building2, label: 'Outlet', color: 'text-gray-600' }
};

const getBranchTypeIcon = (branchType?: string) => {
  const config = branchType ? BRANCH_TYPE_CONFIG[branchType as keyof typeof BRANCH_TYPE_CONFIG] : null;
  return config || { icon: Building2, label: 'Branch', color: 'text-gray-600' };
};

// Helper function to build hierarchical branch structure
const buildBranchHierarchy = (branches: Branch[]): Branch[] => {
  const branchMap = new Map<string, Branch>();
  const rootBranches: Branch[] = [];

  // Create a map of all branches
  branches.forEach(branch => {
    branchMap.set(branch.id, { ...branch });
  });

  // Build the hierarchy
  branches.forEach(branch => {
    if (branch.parent_branch_id) {
      const parent = branchMap.get(branch.parent_branch_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(branchMap.get(branch.id)!);
      }
    } else {
      rootBranches.push(branchMap.get(branch.id)!);
    }
  });

  return rootBranches;
};

// Helper function to flatten hierarchical branches for display
const flattenBranchesForDisplay = (
  branches: Branch[],
  expandedBranches: Set<string>,
  level = 0
): Branch[] => {
  const result: Branch[] = [];

  branches.forEach(branch => {
    // Add current branch with level info
    result.push({
      ...branch,
      hierarchy_level: level,
      is_expanded: expandedBranches.has(branch.id),
      has_children: branch.children && branch.children.length > 0
    });

    // Add children if expanded
    if (expandedBranches.has(branch.id) && branch.children) {
      result.push(...flattenBranchesForDisplay(branch.children, expandedBranches, level + 1));
    }
  });

  return result;
};

export default function BranchSwitcher({
  selectedBranchId,
  onBranchChange,
  showCreateButton = true,
  dealer, // Use passed dealer prop
  tier: parentTier // Use passed tier prop
}: BranchSwitcherProps) {
  // Activation system hooks
  const { checkFeatureAccess, activationStatus } = useDealerActivationContext();
  const featureAccess = useFeatureAccess();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localDealer, setLocalDealer] = useState<any>(dealer);
  const [localTier, setLocalTier] = useState<TierLevel>(parentTier || 'basic');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [hierarchicalView, setHierarchicalView] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update local state when props change
  useEffect(() => {
    if (dealer) {
      setLocalDealer(dealer);
      const currentTier = getDealerTier(dealer);
      setLocalTier(currentTier);
    }
  }, [dealer]);

  // Check advanced features availability
  // Check if user has unlimited branches (either through tier or activation)
  const hasUnlimitedBranches = localTier === 'advanced' || checkFeatureAccess('unlimited_branches');
  const hasBranchHierarchy = checkFeatureAccess('branch_hierarchy');
  const hasAdvancedAnalytics = checkFeatureAccess('analytics');

  // Debug logging
  console.log('BranchSwitcher - Tier check:', {
    tier: localTier,
    hasUnlimitedBranches,
    dealerId: localDealer?.id,
    activation_completed: localDealer?.activation_completed,
    dashboard_type: localDealer?.dashboard_type
  });

  useEffect(() => {
    if (localDealer?.id) {
      loadBranches();
    }
  }, [localDealer?.id]);

  const loadBranches = async () => {
    if (!localDealer?.id) return;
    
    try {
      setIsLoading(true);
      const dealerId = localDealer.id;
      
      // First, get all branches
      const { data: branchesData, error: branchesError } = await db
        .from('branches')
        .select('id, name, city, state, is_default, created_at')
        .eq('dealer_id', dealerId);

      if (branchesError) throw branchesError;

      // Then, get vehicle counts for each branch
      const branchData = await Promise.all((branchesData || []).map(async (branch) => {
        // Count vehicles for this branch
        const { count: vehicleCount, error: countError } = await db
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('branch_id', branch.id);

        if (countError) {
          console.warn(`Failed to count vehicles for branch ${branch.id}:`, countError);
        }

        return {
          id: branch.id,
          name: branch.name,
          city: branch.city,
          state: branch.state,
          is_default: branch.is_default,
          branch_type: 'showroom' as const,
          parent_branch_id: null,
          hierarchy_level: 0,
          vehicle_count: vehicleCount || 0, // Real vehicle count
          status: 'active' as const
        };
      }));

      // Build hierarchical structure
      const hierarchicalBranches = buildBranchHierarchy(branchData);
      setBranches(hierarchicalBranches);

      // Debug logging
      console.log('BranchSwitcher - Loaded branches with vehicle counts:', branchData.map(b => ({
        name: b.name,
        id: b.id,
        vehicle_count: b.vehicle_count
      })));

      // Auto-select default branch if none selected
      if (!selectedBranchId && branchData.length > 0) {
        const defaultBranch = branchData.find(b => b.is_default) || branchData[0];
        onBranchChange(defaultBranch.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranchClick = () => {
    // Use activation system to check branch creation limits
    const canCreate = hasUnlimitedBranches || branches.length < 2;

    if (!canCreate) {
      setShowUpgradePrompt(true);
      return;
    }

    // Show branch creation modal
    setShowBranchModal(true);
  };

  const handleBranchSubmit = async (branchData: any) => {
    try {
      console.log('Creating new branch:', branchData);

      // Create the branch using Dealer entity
      const newBranch = await Dealer.createBranch({
        ...branchData,
        dealer_id: localDealer?.id,
        is_default: branches.length === 0, // First branch is default
        branch_type: branchData.branch_type || 'showroom'
      });

      console.log('Branch created successfully:', newBranch);

      // Close modal
      setShowBranchModal(false);

      // Refresh branches list
      await loadBranches();

      // Show success message
      toast({
        title: "Branch Created",
        description: `${branchData.name} has been created successfully.`
      });

    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpgrade = () => {
    navigate(createPageUrl('settings?tab=subscription'));
    setShowUpgradePrompt(false);
  };

  const handleCloseUpgrade = () => {
    setShowUpgradePrompt(false);
  };

  const toggleBranchExpansion = (branchId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const toggleViewMode = () => {
    setHierarchicalView(!hierarchicalView);
    // Reset expanded branches when switching views
    setExpandedBranches(new Set());
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  // Show upgrade prompt if needed
  if (showUpgradePrompt) {
    const benefits = getUpgradeBenefits({ attemptingBranchCreation: true });

    return (
      <FeatureGate
        feature="branch_hierarchy"
        dealer={localDealer}
        upgradeContext={{ attemptingBranchCreation: true }}
        className="w-full"
      >
        {/* This will show the upgrade prompt */}
        <div></div>
      </FeatureGate>
    );
  }

  // Main component
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Branch:
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="truncate">
                {selectedBranch?.name || 'Select Branch'}
              </span>
              {selectedBranch?.is_default && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
              {localTier === 'basic' && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                  Basic ({branches.length}/2)
                </Badge>
              )}
              {localTier === 'advanced' && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  Advanced
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={loadBranches}
          className="ml-2"
          title="Refresh branch data"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <DropdownMenuContent className="w-80">
          {/* View Mode Toggle */}
          <div className="px-3 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
              className="w-full justify-start text-xs"
            >
              {hierarchicalView ? (
                <>
                  <Building2 className="w-3 h-3 mr-2" />
                  Flat View
                </>
              ) : (
                <>
                  <ChevronsDown className="w-3 h-3 mr-2" />
                  Hierarchy View
                </>
              )}
            </Button>
          </div>

          {/* Branch List */}
          {hierarchicalView
            ? flattenBranchesForDisplay(branches, expandedBranches).map((branch) => {
            const branchTypeConfig = getBranchTypeIcon(branch.branch_type);
            const BranchIcon = branchTypeConfig.icon;

            const indentLevel = (branch as any).hierarchy_level || 0;
            const hasChildren = (branch as any).has_children;
            const isExpanded = (branch as any).is_expanded;

            return (
              <DropdownMenuItem
                key={branch.id}
                onClick={(e) => {
                  // If clicking on expansion toggle, don't select branch
                  if ((e.target as HTMLElement).closest('[data-expansion-toggle]')) {
                    return;
                  }
                  onBranchChange(branch.id);
                }}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3" style={{ paddingLeft: `${indentLevel * 16}px` }}>
                  {/* Expansion Toggle for hierarchical view */}
                  {hierarchicalView && hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      data-expansion-toggle
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBranchExpansion(branch.id);
                      }}
                      className="w-4 h-4 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </Button>
                  )}

                  {/* Branch Icon */}
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <BranchIcon className={`w-4 h-4 ${branchTypeConfig.color}`} />
                  </div>

                  {/* Branch Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {branch.name}
                      </p>
                      {branch.branch_type && (
                        <Badge variant="outline" className="text-xs">
                          {branchTypeConfig.label}
                        </Badge>
                      )}
                      {branch.parent_branch_id && hierarchicalView && (
                        <Badge variant="secondary" className="text-xs">
                          Child
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {branch.vehicle_count}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    vehicles
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
          : branches.map((branch) => {
            const branchTypeConfig = getBranchTypeIcon(branch.branch_type);
            const BranchIcon = branchTypeConfig.icon;

            return (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => onBranchChange(branch.id)}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <BranchIcon className={`w-4 h-4 ${branchTypeConfig.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {branch.name}
                      </p>
                      {branch.branch_type && (
                        <Badge variant="outline" className="text-xs">
                          {branchTypeConfig.label}
                        </Badge>
                      )}
                      {branch.parent_branch_id && (
                        <Badge variant="secondary" className="text-xs">
                          Sub-branch
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {branch.vehicle_count}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    vehicles
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })}

          {/* Advanced Analytics Section */}
          {hasAdvancedAnalytics && (
            <div className="px-3 py-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Branch Analytics
              </div>
              <div className="space-y-1">
                {branches.slice(0, 3).map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[120px]">{branch.name}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">{branch.vehicle_count}</span>
                    </div>
                  </div>
                ))}
                {branches.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{branches.length - 3} more branches
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Management Options */}
          {(hasBranchHierarchy || hasUnlimitedBranches) && (
            <div className="px-3 py-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Advanced Management
              </div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-7"
                  onClick={() => navigate('/inventory/branches')}
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Manage Branches
                </Button>
                {hasBranchHierarchy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => navigate(createPageUrl('settings?tab=hierarchy'))}
                  >
                    <Building2 className="w-3 h-3 mr-2" />
                    Branch Hierarchy
                  </Button>
                )}
              </div>
            </div>
          )}

          {showCreateButton && (
            <DropdownMenuItem
              onClick={handleCreateBranchClick}
              className="flex items-center gap-2 p-3 border-t"
            >
              {(hasUnlimitedBranches || branches.length < 2) ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create New Branch</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="flex-1">Create New Branch</span>
                  <Badge variant="secondary" className="text-xs">
                    Activation Required
                  </Badge>
                </>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedBranch && (
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{selectedBranch.vehicle_count} vehicles</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Active</span>
          </div>
          {!hasUnlimitedBranches && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {branches.length}/2 branches
              </Badge>
            </div>
          )}
          {hasUnlimitedBranches && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Unlimited Branches
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Show activation hint for basic users nearing limit */}
      {localTier === 'basic' && !hasUnlimitedBranches && branches.length >= 1 && (
        <div className="ml-4 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <div className="text-xs">
              <p className="font-medium text-amber-800">Ready to expand?</p>
              <p className="text-amber-700">Activate Customised for unlimited branches</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(createPageUrl('Inventory?upgrade=true'))}
              className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Activate
            </Button>
          </div>
        </div>
      )}

      {/* Branch Creation Modal */}
      <BranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSubmit={handleBranchSubmit}
      />
    </div>
  );
}
