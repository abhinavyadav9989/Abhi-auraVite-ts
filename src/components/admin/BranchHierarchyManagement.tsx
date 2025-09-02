import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Settings,
  Edit,
  Trash2,
  Move,
  ChevronRight,
  ChevronDown,
  Building,
  MapPin,
  Users,
  Target,
  ArrowRight,
  GripVertical,
  Eye,
  EyeOff,
  Globe,
  Store,
  Factory,
  ShoppingBag
} from 'lucide-react';
import { BranchHierarchy as BranchHierarchyEntity } from '@/api/entityAdapters';
import { BranchHierarchyNode, BranchLevel } from '@/types/attributeSets';

interface BranchHierarchyManagementProps {
  dealerId: string;
}

const BRANCH_LEVELS: { value: BranchLevel; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'head_office', label: 'Head Office', description: 'Main corporate headquarters', icon: <Building className="w-4 h-4" /> },
  { value: 'regional_office', label: 'Regional Office', description: 'Regional management center', icon: <Globe className="w-4 h-4" /> },
  { value: 'main_branch', label: 'Main Branch', description: 'Primary dealership location', icon: <Store className="w-4 h-4" /> },
  { value: 'sub_branch', label: 'Sub Branch', description: 'Secondary location', icon: <ShoppingBag className="w-4 h-4" /> },
  { value: 'outlet', label: 'Outlet', description: 'Small sales/service point', icon: <Target className="w-4 h-4" /> },
  { value: 'kiosk', label: 'Kiosk', description: 'Minimal service location', icon: <MapPin className="w-4 h-4" /> }
];

const BRANCH_TYPES = [
  { value: 'showroom', label: 'Showroom', description: 'Vehicle display and sales' },
  { value: 'workshop', label: 'Workshop', description: 'Service and repairs' },
  { value: 'warehouse', label: 'Warehouse', description: 'Parts and inventory storage' },
  { value: 'outlet', label: 'Outlet', description: 'Sales outlet' },
  { value: 'kiosk', label: 'Kiosk', description: 'Small sales point' }
];

export default function BranchHierarchyManagement({ dealerId }: BranchHierarchyManagementProps) {
  const [hierarchyTree, setHierarchyTree] = useState<BranchHierarchyNode[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchHierarchyNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [draggedBranch, setDraggedBranch] = useState<string | null>(null);
  const [draggedOverBranch, setDraggedOverBranch] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states
  const [branchForm, setBranchForm] = useState({
    name: '',
    level: 'main_branch' as BranchLevel,
    parentId: '',
    branchType: 'showroom' as BranchHierarchyNode['branchType'],
    region: '',
    city: '',
    address: '',
    phone: '',
    managerId: '',
    monthlyTarget: 0,
    employeeCount: 0
  });

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      const { data, error } = await BranchHierarchyEntity.getHierarchyTree();
      if (error) throw error;

      setHierarchyTree(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branch hierarchy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!branchForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a branch name",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBranch = {
        name: branchForm.name,
        level: branchForm.level,
        parent_id: branchForm.parentId || null,
        branch_type: branchForm.branchType,
        region: branchForm.region || null,
        city: branchForm.city || null,
        address: branchForm.address || null,
        phone: branchForm.phone || null,
        manager_id: branchForm.managerId || null,
        monthly_target: branchForm.monthlyTarget || null,
        employee_count: branchForm.employeeCount || null,
        is_active: true
      };

      const { data, error } = await BranchHierarchyEntity.create(newBranch);
      if (error) throw error;

      // Reload hierarchy to reflect changes
      await loadHierarchy();

      setBranchForm({
        name: '',
        level: 'main_branch',
        parentId: '',
        branchType: 'showroom',
        region: '',
        city: '',
        address: '',
        phone: '',
        managerId: '',
        monthlyTarget: 0,
        employeeCount: 0
      });
      setShowCreateDialog(false);

      toast({
        title: "Success",
        description: `${data.name} branch created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    }
  };

  const handleToggleExpand = (branchId: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  };

  const handleDragStart = (branchId: string) => {
    setDraggedBranch(branchId);
  };

  const handleDragOver = (e: React.DragEvent, branchId: string) => {
    e.preventDefault();
    setDraggedOverBranch(branchId);
  };

  const handleDrop = async (e: React.DragEvent, targetBranchId: string) => {
    e.preventDefault();

    if (!draggedBranch || draggedBranch === targetBranchId) {
      setDraggedBranch(null);
      setDraggedOverBranch(null);
      return;
    }

    try {
      const { error } = await BranchHierarchyEntity.moveBranch(draggedBranch, targetBranchId);
      if (error) throw error;

      // Reload hierarchy to reflect changes
      await loadHierarchy();

      toast({
        title: "Branch Moved",
        description: "Branch hierarchy has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move branch",
        variant: "destructive",
      });
    }

    setDraggedBranch(null);
    setDraggedOverBranch(null);
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const { error } = await BranchHierarchyEntity.delete(branchId);
      if (error) throw error;

      // Reload hierarchy to reflect changes
      await loadHierarchy();

      if (selectedBranch?.id === branchId) {
        setSelectedBranch(null);
      }

      toast({
        title: "Branch Deleted",
        description: "Branch has been removed from hierarchy",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete branch",
        variant: "destructive",
      });
    }
  };

  const getBranchIcon = (branchType: BranchHierarchyNode['branchType']) => {
    switch (branchType) {
      case 'showroom': return <Store className="w-4 h-4" />;
      case 'workshop': return <Factory className="w-4 h-4" />;
      case 'warehouse': return <Building className="w-4 h-4" />;
      case 'outlet': return <ShoppingBag className="w-4 h-4" />;
      case 'kiosk': return <Target className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: BranchLevel) => {
    switch (level) {
      case 'head_office': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'regional_office': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'main_branch': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sub_branch': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'outlet': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'kiosk': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderBranchNode = (branch: BranchHierarchyNode, level = 0): React.ReactNode => {
    const isExpanded = expandedBranches.has(branch.id);
    const hasChildren = branch.children && branch.children.length > 0;
    const isDraggedOver = draggedOverBranch === branch.id;
    const isDragging = draggedBranch === branch.id;

    return (
      <div key={branch.id} className="select-none">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            isDraggedOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : selectedBranch?.id === branch.id
              ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          } ${isDragging ? 'opacity-50' : ''}`}
          style={{ marginLeft: `${level * 24}px` }}
          draggable={!isDragging}
          onDragStart={() => handleDragStart(branch.id)}
          onDragOver={(e) => handleDragOver(e, branch.id)}
          onDrop={(e) => handleDrop(e, branch.id)}
          onClick={() => setSelectedBranch(branch)}
        >
          <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />

          {hasChildren && (
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(branch.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}

          {!hasChildren && <div className="w-6" />}

          {getBranchIcon(branch.branchType)}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {branch.name}
              </h4>
              <Badge className={`text-xs ${getLevelColor(branch.level)}`}>
                {BRANCH_LEVELS.find(l => l.value === branch.level)?.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
              {branch.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {branch.city}
                </div>
              )}
              {branch.employeeCount && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {branch.employeeCount} employees
                </div>
              )}
              {branch.monthlyTarget && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  ₹{(branch.monthlyTarget / 100000).toFixed(1)}L target
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                // Edit functionality would go here
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBranch(branch.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6">
            {branch.children?.map(child => renderBranchNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Branch Hierarchy Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Organize your dealership locations in a hierarchical structure
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Branch Hierarchy</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag and drop branches to reorganize the hierarchy
              </p>
            </CardHeader>
            <CardContent>
              {hierarchyTree.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <Building className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No branches created yet
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Branch
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {hierarchyTree.map(branch => renderBranchNode(branch))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Branch Details */}
        <div className="lg:col-span-1">
          {selectedBranch ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getBranchIcon(selectedBranch.branchType)}
                  <CardTitle>{selectedBranch.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Level</Label>
                    <p className="text-sm">{BRANCH_LEVELS.find(l => l.value === selectedBranch.level)?.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm">{BRANCH_TYPES.find(t => t.value === selectedBranch.branchType)?.label}</p>
                  </div>
                </div>

                {selectedBranch.address && (
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm">{selectedBranch.address}</p>
                  </div>
                )}

                {selectedBranch.phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedBranch.phone}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedBranch.employeeCount && (
                    <div>
                      <Label className="text-sm font-medium">Employees</Label>
                      <p className="text-sm">{selectedBranch.employeeCount}</p>
                    </div>
                  )}
                  {selectedBranch.monthlyTarget && (
                    <div>
                      <Label className="text-sm font-medium">Monthly Target</Label>
                      <p className="text-sm">₹{(selectedBranch.monthlyTarget / 100000).toFixed(1)}L</p>
                    </div>
                  )}
                </div>

                {/* Hierarchy Info */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Label className="text-sm font-medium">Hierarchy Info</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Depth:</span>
                      <span>{selectedBranch.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Children:</span>
                      <span>{selectedBranch.children?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Path:</span>
                      <span className="font-mono text-xs">
                        {selectedBranch.path.join(' → ')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a Branch
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Choose a branch from the hierarchy to view its details and manage its settings
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_name">Branch Name *</Label>
                <Input
                  id="branch_name"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Showroom"
                />
              </div>

              <div>
                <Label htmlFor="branch_level">Branch Level *</Label>
                <Select
                  value={branchForm.level}
                  onValueChange={(value) => setBranchForm(prev => ({ ...prev, level: value as BranchLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCH_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          {level.icon}
                          {level.label} - {level.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_type">Branch Type *</Label>
                <Select
                  value={branchForm.branchType}
                  onValueChange={(value) => setBranchForm(prev => ({
                    ...prev,
                    branchType: value as BranchHierarchyNode['branchType']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCH_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parent_branch">Parent Branch (Optional)</Label>
                <Select
                  value={branchForm.parentId}
                  onValueChange={(value) => setBranchForm(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (Top level)</SelectItem>
                    {hierarchyTree.flatMap(branch => [
                      branch,
                      ...(branch.children || [])
                    ]).map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {'  '.repeat(branch.depth)}{branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_region">Region</Label>
                <Input
                  id="branch_region"
                  value={branchForm.region}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g., North India"
                />
              </div>

              <div>
                <Label htmlFor="branch_city">City *</Label>
                <Input
                  id="branch_city"
                  value={branchForm.city}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Mumbai"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="branch_address">Address</Label>
              <Input
                id="branch_address"
                value={branchForm.address}
                onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address of the branch"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_phone">Phone</Label>
                <Input
                  id="branch_phone"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <Label htmlFor="manager_id">Manager ID</Label>
                <Input
                  id="manager_id"
                  value={branchForm.managerId}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, managerId: e.target.value }))}
                  placeholder="Manager's user ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input
                  id="employee_count"
                  type="number"
                  value={branchForm.employeeCount}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="monthly_target">Monthly Target (₹)</Label>
                <Input
                  id="monthly_target"
                  type="number"
                  value={branchForm.monthlyTarget}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, monthlyTarget: parseInt(e.target.value) || 0 }))}
                  placeholder="5000000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBranch} className="bg-blue-600 hover:bg-blue-700">
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
