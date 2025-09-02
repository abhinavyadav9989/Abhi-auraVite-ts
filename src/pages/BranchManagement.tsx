import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Branch, Dealer } from '@/api/entities';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';
import { getDealerTier } from '@/lib/tierConfig';
import { useAuth } from '@/hooks/useAuth';
import BranchModal from '@/components/inventory/BranchModal';
import {
  Building2, Plus, Settings, Users, Car, Truck, Shield, Database, 
  BarChart3, Star, CheckCircle, AlertTriangle, Info, Save, RefreshCw,
  MapPin, Phone, Mail, Clock, Globe, Lock, Zap, Crown, ChevronDown,
  ChevronRight, GripVertical, Search, Filter, MoreHorizontal
} from 'lucide-react';

interface BranchNode {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  type: 'showroom' | 'yard' | 'workshop' | 'kiosk' | 'warehouse';
  status: 'planned' | 'active' | 'paused' | 'closed';
  is_default: boolean;
  parent_id?: string;
  children: BranchNode[];
  vehicle_count: number;
  manager_id?: string;
  accent_color?: string;
  logo_url?: string;
}



export default function BranchManagement() {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const { toast } = useToast();
  const { checkFeatureAccess } = useDealerActivationSettings();
  const { user } = useAuth();
  
  // State
  const [dealer, setDealer] = useState<any>(null);
  const [tier, setTier] = useState<'basic' | 'advanced'>('basic');
  const [branches, setBranches] = useState<BranchNode[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchNode | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('identity');
  
  // Modal states
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  


  // Check if user has advanced features
  const hasAdvancedFeatures = dealer?.activation_completed === true;
  const canCreateMoreBranches = hasAdvancedFeatures || branches.length < 2;

  // Load dealer data
  const loadDealerData = useCallback(async () => {
    try {
      if (user?.email) {
        const dealerResult = await Dealer.list({ created_by: user.email });
        if (dealerResult && dealerResult.length > 0) {
          const dealerData = dealerResult[0];
          setDealer(dealerData);
          
          // Set tier based on activation status
          const currentTier = dealerData.activation_completed ? 'advanced' : 'basic';
          setTier(currentTier);
          
          console.log('BranchManagement - Dealer loaded:', {
            activation_completed: dealerData.activation_completed,
            tier: currentTier
          });
        }
      }
    } catch (error) {
      console.error('Failed to load dealer data:', error);
    }
  }, [user?.email]);

  // Load branches
  const loadBranches = useCallback(async () => {
    try {
      const result = await Branch.list();
      
      // Convert flat list to hierarchical tree
      const tree = buildBranchTree(result || []);
      setBranches(tree);
      
      // Select first branch if none selected
      if (!selectedBranch && tree.length > 0) {
        setSelectedBranch(tree[0]);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    }
  }, [selectedBranch, toast]);

  // Build hierarchical tree from flat list
  const buildBranchTree = (flatBranches: any[]): BranchNode[] => {
    const branchMap = new Map<string, BranchNode>();
    const roots: BranchNode[] = [];

    // Create nodes
    flatBranches.forEach(branch => {
      branchMap.set(branch.id, {
        ...branch,
        children: [],
        vehicle_count: branch.vehicle_count || 0
      });
    });

    // Build tree
    flatBranches.forEach(branch => {
      const node = branchMap.get(branch.id)!;
      if (branch.parent_id && branchMap.has(branch.parent_id)) {
        const parent = branchMap.get(branch.parent_id)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Handle branch selection
  const handleBranchSelect = (branch: BranchNode) => {
    setSelectedBranch(branch);
    setActiveTab('identity');
  };

  // Handle branch creation/editing via modal
  const handleBranchSubmit = async (branchData: any) => {
    try {
      if (editingBranch) {
        // Update existing branch
        const result = await Branch.update(editingBranch.id, branchData);
        
        toast({
          title: "Branch Updated",
          description: `Branch "${branchData.name}" has been updated successfully.`,
        });
      } else {
        // Create new branch
        const result = await Branch.create(branchData);
        
        toast({
          title: "Branch Created",
          description: `Branch "${branchData.name}" has been created successfully.`,
        });
      }
      
      // Close modal and refresh
      setShowBranchModal(false);
      setEditingBranch(null);
      await loadBranches();
      
    } catch (error) {
      console.error('Failed to save branch:', error);
      toast({
        title: "Error",
        description: "Failed to save branch. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle create branch button click
  const handleCreateBranch = () => {
    setEditingBranch(null);
    setShowBranchModal(true);
  };

  // Handle edit branch button click
  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setShowBranchModal(true);
  };



  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Render branch tree node
  const renderBranchNode = (node: BranchNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedBranch?.id === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleBranchSelect(node)}
        >
          {/* Expand/collapse arrow */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Drag handle */}
          {hasAdvancedFeatures && (
            <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
          )}

          {/* Type icon */}
          <div className={`w-4 h-4 rounded-full ${
            node.type === 'showroom' ? 'bg-blue-500' :
            node.type === 'yard' ? 'bg-green-500' :
            node.type === 'workshop' ? 'bg-orange-500' :
            node.type === 'kiosk' ? 'bg-purple-500' :
            'bg-gray-500'
          }`} />

          {/* Branch name and status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{node.name}</span>
              {node.is_default && (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
              <Badge 
                variant={
                  node.status === 'active' ? 'default' :
                  node.status === 'paused' ? 'secondary' :
                  node.status === 'closed' ? 'destructive' :
                  'outline'
                }
                className="text-xs"
              >
                {node.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 truncate">
              {node.city} • {node.vehicle_count} vehicles
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditBranch(node);
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children.map(child => renderBranchNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Load data on mount
  useEffect(() => {
    loadDealerData();
    loadBranches();
  }, [loadDealerData, loadBranches]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branch Management</h1>
          <p className="text-slate-600 mt-2">
            Organize and manage your branches with {hasAdvancedFeatures ? 'advanced hierarchy' : 'basic structure'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
          
          {canCreateMoreBranches && (
            <Button
              onClick={handleCreateBranch}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Branch
            </Button>
          )}
        </div>
      </div>

     

      {/* Branch limit warning */}
      {!canCreateMoreBranches && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  Branch Limit Reached
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {tier === 'basic' 
                    ? 'Basic inventory allows only 2 branches. Upgrade to Advanced for unlimited branches and hierarchy.'
                    : 'You have reached the maximum number of branches for your current plan.'
                  }
                </p>
              </div>
              {tier === 'basic' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/inventory?upgrade=true')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Advanced
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Branch Tree */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search branches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Branch Tree */}
              <div className="space-y-1">
                {branches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No branches yet</p>
                    <p className="text-sm">Create your first branch to get started</p>
                  </div>
                ) : (
                  branches.map(branch => renderBranchNode(branch))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Panel - Branch Details */}
        <div className="lg:col-span-3">
          {selectedBranch ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedBranch.type === 'showroom' ? 'bg-blue-500' :
                    selectedBranch.type === 'yard' ? 'bg-green-500' :
                    selectedBranch.type === 'workshop' ? 'bg-orange-500' :
                    selectedBranch.type === 'kiosk' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  {selectedBranch.name}
                  {selectedBranch.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
                    <TabsTrigger value="identity">Identity</TabsTrigger>
                    <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    {hasAdvancedFeatures && (
                      <>
                        <TabsTrigger value="brands">Brands</TabsTrigger>
                        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                        <TabsTrigger value="operations">Operations</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk & Data</TabsTrigger>
                        <TabsTrigger value="theming">Theming</TabsTrigger>
                      </>
                    )}
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  {/* Identity Tab */}
                  <TabsContent value="identity" className="space-y-6">
                    {selectedBranch ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Branch Name</Label>
                            <p className="text-lg font-medium">{selectedBranch.name}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Branch Code</Label>
                            <p className="text-lg">{selectedBranch.code || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <p className="text-lg">{selectedBranch.city}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Branch Type</Label>
                            <Badge variant="outline" className="text-lg">
                              {selectedBranch.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Address</Label>
                          <p className="text-lg">{selectedBranch.address || 'Not set'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Badge 
                              variant={
                                selectedBranch.status === 'active' ? 'default' :
                                selectedBranch.status === 'paused' ? 'secondary' :
                                selectedBranch.status === 'closed' ? 'destructive' :
                                'outline'
                              }
                            >
                              {selectedBranch.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Default Branch</Label>
                            <p className="text-lg">
                              {selectedBranch.is_default ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button
                            onClick={() => handleEditBranch(selectedBranch)}
                            variant="outline"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Branch
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium mb-2">No Branch Selected</p>
                        <p className="text-sm">Select a branch from the tree to view its details</p>
                      </div>
                    )}



                  </TabsContent>

                  {/* Hierarchy Tab */}
                  <TabsContent value="hierarchy" className="space-y-6">
                    <div className="p-6 text-center text-slate-500">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Hierarchy management coming soon</p>
                      <p className="text-sm">Drag and drop to reorganize branches</p>
                    </div>
                  </TabsContent>

                  {/* Team Tab */}
                  <TabsContent value="team" className="space-y-6">
                    <div className="p-6 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Team management coming soon</p>
                      <p className="text-sm">Assign roles and permissions to branch staff</p>
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold">{selectedBranch.vehicle_count}</p>
                              <p className="text-sm text-slate-600">Total Vehicles</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold">0</p>
                              <p className="text-sm text-slate-600">New This Week</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-2xl font-bold">0</p>
                              <p className="text-sm text-slate-600">Aging 60+ Days</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-2xl font-bold">0</p>
                              <p className="text-sm text-slate-600">Transfers</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-slate-500">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">No Branch Selected</p>
                <p className="text-sm">Select a branch from the tree to view and edit its details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Branch Creation/Editing Modal */}
      <BranchModal
        isOpen={showBranchModal}
        onClose={() => {
          setShowBranchModal(false);
          setEditingBranch(null);
        }}
        branch={editingBranch}
        onSubmit={handleBranchSubmit}
        isEdit={!!editingBranch}
      />
    </div>
  );
}
