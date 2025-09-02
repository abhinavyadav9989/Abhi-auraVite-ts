import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  Shield,
  Key,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building,
  Crown,
  User,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Save
} from 'lucide-react';
import {
  BranchPermissions,
  BranchHierarchyNode
} from '@/types/attributeSets';

interface SubBranchManagementProps {
  dealerId: string;
}

const PERMISSION_CATEGORIES = [
  {
    category: 'inventory',
    label: 'Inventory Management',
    permissions: [
      { key: 'can_view_inventory', label: 'View Inventory', description: 'Can view vehicle listings' },
      { key: 'can_add_vehicles', label: 'Add Vehicles', description: 'Can create new vehicle listings' },
      { key: 'can_edit_vehicles', label: 'Edit Vehicles', description: 'Can modify vehicle details' },
      { key: 'can_delete_vehicles', label: 'Delete Vehicles', description: 'Can remove vehicle listings' },
      { key: 'can_transfer_vehicles', label: 'Transfer Vehicles', description: 'Can move vehicles between branches' }
    ]
  },
  {
    category: 'sales',
    label: 'Sales & Transactions',
    permissions: [
      { key: 'can_view_sales', label: 'View Sales', description: 'Can view sales transactions' },
      { key: 'can_create_quotes', label: 'Create Quotes', description: 'Can create price quotes' },
      { key: 'can_approve_sales', label: 'Approve Sales', description: 'Can approve sale transactions' },
      { key: 'can_manage_customers', label: 'Manage Customers', description: 'Can view and edit customer data' }
    ]
  },
  {
    category: 'reports',
    label: 'Reports & Analytics',
    permissions: [
      { key: 'can_view_reports', label: 'View Reports', description: 'Can access branch reports' },
      { key: 'can_export_data', label: 'Export Data', description: 'Can export data to files' },
      { key: 'can_view_analytics', label: 'View Analytics', description: 'Can access analytics dashboard' }
    ]
  },
  {
    category: 'branch_management',
    label: 'Branch Management',
    permissions: [
      { key: 'can_manage_users', label: 'Manage Users', description: 'Can add/remove users from branch' },
      { key: 'can_edit_branch', label: 'Edit Branch', description: 'Can modify branch settings' },
      { key: 'can_manage_permissions', label: 'Manage Permissions', description: 'Can set user permissions' }
    ]
  }
];

const USER_ROLES = [
  { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'supervisor', label: 'Supervisor', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'sales_rep', label: 'Sales Representative', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'support', label: 'Support Staff', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
];

export default function SubBranchManagement({ dealerId }: SubBranchManagementProps) {
  const [branches, setBranches] = useState<BranchHierarchyNode[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchHierarchyNode | null>(null);
  const [branchUsers, setBranchUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    role: 'viewer' as string,
    permissions: {} as Record<string, boolean>
  });

  // Permissions state
  const [permissions, setPermissions] = useState<BranchPermissions>({
    canViewParent: false,
    canViewSiblings: false,
    canViewChildren: false,
    canTransferToParent: false,
    canTransferToSiblings: false,
    canTransferToChildren: false,
    canManageChildren: false,
    canApproveFromChildren: false
  });

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadBranchUsers(selectedBranch.id);
      loadBranchPermissions(selectedBranch.id);
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      // Mock branch hierarchy data
      const mockBranches: BranchHierarchyNode[] = [
        {
          id: '1',
          name: 'Head Office',
          level: 'head_office',
          children: [
            {
              id: '2',
              name: 'Mumbai Region',
              level: 'regional_office',
              parentId: '1',
              path: ['1'],
              depth: 1,
              branchType: 'showroom',
              city: 'Mumbai',
              children: [
                {
                  id: '3',
                  name: 'Downtown Showroom',
                  level: 'main_branch',
                  parentId: '2',
                  path: ['1', '2'],
                  depth: 2,
                  branchType: 'showroom',
                  city: 'Mumbai',
                  employeeCount: 15,
                  monthlyTarget: 2500000,
                  isActive: true,
                  children: []
                },
                {
                  id: '4',
                  name: 'North Mumbai Outlet',
                  level: 'sub_branch',
                  parentId: '2',
                  path: ['1', '2'],
                  depth: 2,
                  branchType: 'outlet',
                  city: 'Mumbai',
                  employeeCount: 8,
                  monthlyTarget: 1500000,
                  isActive: true,
                  children: []
                }
              ],
              employeeCount: 25,
              monthlyTarget: 5000000,
              isActive: true
            },
            {
              id: '5',
              name: 'Delhi Region',
              level: 'regional_office',
              parentId: '1',
              path: ['1'],
              depth: 1,
              branchType: 'showroom',
              city: 'Delhi',
              children: [
                {
                  id: '6',
                  name: 'Connaught Place',
                  level: 'main_branch',
                  parentId: '5',
                  path: ['1', '5'],
                  depth: 2,
                  branchType: 'showroom',
                  city: 'Delhi',
                  employeeCount: 12,
                  monthlyTarget: 2200000,
                  isActive: true,
                  children: []
                }
              ],
              employeeCount: 18,
              monthlyTarget: 3500000,
              isActive: true
            }
          ],
          path: [],
          depth: 0,
          branchType: 'showroom',
          city: 'Mumbai',
          employeeCount: 50,
          monthlyTarget: 10000000,
          isActive: true
        }
      ];

      setBranches(mockBranches);
      setSelectedBranch(mockBranches[0]);
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

  const loadBranchUsers = async (branchId: string) => {
    try {
      // Mock user data
      const mockUsers = [
        {
          id: '1',
          email: 'manager@mumbai.com',
          role: 'manager',
          name: 'Rajesh Kumar',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          permissions: {
            can_view_inventory: true,
            can_add_vehicles: true,
            can_edit_vehicles: true,
            can_view_sales: true,
            can_create_quotes: true,
            can_view_reports: true
          }
        },
        {
          id: '2',
          email: 'sales@mumbai.com',
          role: 'sales_rep',
          name: 'Priya Sharma',
          status: 'active',
          lastLogin: '2024-01-14T14:20:00Z',
          permissions: {
            can_view_inventory: true,
            can_view_sales: true,
            can_create_quotes: true
          }
        },
        {
          id: '3',
          email: 'support@mumbai.com',
          role: 'support',
          name: 'Amit Singh',
          status: 'inactive',
          lastLogin: '2024-01-10T09:15:00Z',
          permissions: {
            can_view_inventory: true,
            can_manage_customers: true
          }
        }
      ];

      setBranchUsers(mockUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branch users",
        variant: "destructive",
      });
    }
  };

  const loadBranchPermissions = async (branchId: string) => {
    try {
      // Mock permissions data
      const mockPermissions: BranchPermissions = {
        canViewParent: true,
        canViewSiblings: true,
        canViewChildren: true,
        canTransferToParent: false,
        canTransferToSiblings: true,
        canTransferToChildren: true,
        canManageChildren: false,
        canApproveFromChildren: false
      };

      setPermissions(mockPermissions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branch permissions",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!userForm.email.trim() || !selectedBranch) return;

    try {
      const newUser = {
        email: userForm.email,
        role: userForm.role,
        name: userForm.email.split('@')[0], // Mock name from email
        status: 'active',
        permissions: userForm.permissions,
        branchId: selectedBranch.id
      };

      // Mock adding user
      setBranchUsers(prev => [...prev, { ...newUser, id: Date.now().toString() }]);

      setUserForm({
        email: '',
        role: 'viewer',
        permissions: {}
      });
      setShowAddUserDialog(false);

      toast({
        title: "User Added",
        description: `${newUser.email} has been added to ${selectedBranch.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser || !selectedBranch) return;

    try {
      // Mock updating permissions
      setBranchUsers(prev =>
        prev.map(user =>
          user.id === selectedUser.id
            ? { ...user, permissions: userForm.permissions }
            : user
        )
      );

      setShowPermissionsDialog(false);
      setSelectedUser(null);

      toast({
        title: "Permissions Updated",
        description: `${selectedUser.email} permissions have been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
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

  const getRoleBadgeColor = (role: string) => {
    const roleConfig = USER_ROLES.find(r => r.value === role);
    return roleConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getPermissionCount = (userPermissions: Record<string, boolean>) => {
    return Object.values(userPermissions).filter(Boolean).length;
  };

  const renderBranchNode = (branch: BranchHierarchyNode, level = 0): React.ReactNode => {
    const isExpanded = expandedBranches.has(branch.id);
    const hasChildren = branch.children && branch.children.length > 0;
    const isSelected = selectedBranch?.id === branch.id;

    return (
      <div key={branch.id} className="select-none">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
            isSelected
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedBranch(branch)}
        >
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

          <Building className="w-4 h-4 text-slate-400" />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {branch.name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {branch.level.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
              {branch.city && <span>{branch.city}</span>}
              {branch.employeeCount && <span>{branch.employeeCount} employees</span>}
              {branch.monthlyTarget && (
                <span>₹{(branch.monthlyTarget / 100000).toFixed(1)}L target</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {branchUsers.length}
            </span>
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
            Sub-branch Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage users and permissions across your branch hierarchy
          </p>
        </div>

        <Button onClick={() => setShowAddUserDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Branch Hierarchy */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Branch Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {branches.map(branch => renderBranchNode(branch))}
            </CardContent>
          </Card>
        </div>

        {/* Branch Details & Users */}
        <div className="lg:col-span-3">
          {selectedBranch ? (
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="permissions">Branch Permissions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Users in {selectedBranch.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {branchUsers.length} active users
                    </p>
                  </CardHeader>
                  <CardContent>
                    {branchUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No users assigned to this branch yet</p>
                        <Button
                          onClick={() => setShowAddUserDialog(true)}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add First User
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branchUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {USER_ROLES.find(r => r.value === user.role)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {getPermissionCount(user.permissions)} permissions
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(user.lastLogin).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUserForm({
                                        email: user.email,
                                        role: user.role,
                                        permissions: user.permissions
                                      });
                                      setShowPermissionsDialog(true);
                                    }}
                                  >
                                    <Shield className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Branch Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Branch Permissions for {selectedBranch.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Control what this branch can access across the hierarchy
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">View Permissions</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="view_parent"
                              checked={permissions.canViewParent}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canViewParent: !!checked }))
                              }
                            />
                            <Label htmlFor="view_parent">Can view parent branch data</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="view_siblings"
                              checked={permissions.canViewSiblings}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canViewSiblings: !!checked }))
                              }
                            />
                            <Label htmlFor="view_siblings">Can view sibling branch data</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="view_children"
                              checked={permissions.canViewChildren}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canViewChildren: !!checked }))
                              }
                            />
                            <Label htmlFor="view_children">Can view child branch data</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Transfer Permissions</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="transfer_parent"
                              checked={permissions.canTransferToParent}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canTransferToParent: !!checked }))
                              }
                            />
                            <Label htmlFor="transfer_parent">Can transfer to parent branch</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="transfer_siblings"
                              checked={permissions.canTransferToSiblings}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canTransferToSiblings: !!checked }))
                              }
                            />
                            <Label htmlFor="transfer_siblings">Can transfer to sibling branches</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="transfer_children"
                              checked={permissions.canTransferToChildren}
                              onCheckedChange={(checked) =>
                                setPermissions(prev => ({ ...prev, canTransferToChildren: !!checked }))
                              }
                            />
                            <Label htmlFor="transfer_children">Can transfer to child branches</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Management Permissions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manage_children"
                            checked={permissions.canManageChildren}
                            onCheckedChange={(checked) =>
                              setPermissions(prev => ({ ...prev, canManageChildren: !!checked }))
                            }
                          />
                          <Label htmlFor="manage_children">Can manage child branches</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="approve_children"
                            checked={permissions.canApproveFromChildren}
                            onCheckedChange={(checked) =>
                              setPermissions(prev => ({ ...prev, canApproveFromChildren: !!checked }))
                            }
                          />
                          <Label htmlFor="approve_children">Can approve transactions from child branches</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Permissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Branch Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="branch_manager">Branch Manager</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {branchUsers.filter(u => u.role === 'manager').map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="monthly_target">Monthly Target (₹)</Label>
                        <Input
                          id="monthly_target"
                          type="number"
                          defaultValue={selectedBranch.monthlyTarget}
                          placeholder="5000000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="branch_description">Description</Label>
                      <textarea
                        id="branch_description"
                        className="w-full h-20 p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                        placeholder="Describe the branch's role and responsibilities..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a Branch
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Choose a branch to manage its users and permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add User to {selectedBranch?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_email">Email *</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <Label htmlFor="user_role">Role *</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Permissions</Label>
              <div className="space-y-4 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                {PERMISSION_CATEGORIES.map(category => (
                  <div key={category.category}>
                    <h4 className="font-medium text-sm mb-2">{category.label}</h4>
                    <div className="space-y-2 ml-4">
                      {category.permissions.map(permission => (
                        <div key={permission.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.key}
                            checked={userForm.permissions[permission.key] || false}
                            onCheckedChange={(checked) =>
                              setUserForm(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [permission.key]: !!checked
                                }
                              }))
                            }
                          />
                          <Label htmlFor={permission.key} className="text-sm">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Permissions for {selectedUser?.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4 max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              {PERMISSION_CATEGORIES.map(category => (
                <div key={category.category}>
                  <h4 className="font-medium text-sm mb-2">{category.label}</h4>
                  <div className="space-y-2 ml-4">
                    {category.permissions.map(permission => (
                      <div key={permission.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit_${permission.key}`}
                          checked={userForm.permissions[permission.key] || false}
                          onCheckedChange={(checked) =>
                            setUserForm(prev => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [permission.key]: !!checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor={`edit_${permission.key}`} className="text-sm">
                          {permission.label}
                        </Label>
                        <span className="text-xs text-slate-500 ml-auto">
                          {permission.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPermissionsDialog(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions} className="bg-blue-600 hover:bg-blue-700">
              Update Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
