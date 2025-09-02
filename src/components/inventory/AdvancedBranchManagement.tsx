import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Building, Users, MapPin, Settings, Plus, Edit, Trash2,
  Eye, Globe, Palette, Shield, UserPlus, Crown, Star,
  ChevronRight, ChevronDown, MoreHorizontal, Target, TrendingUp
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: 'headquarters' | 'regional' | 'branch' | 'showroom' | 'workshop';
  parent_id?: string;
  hierarchy_level: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    manager_name: string;
    manager_phone: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  business_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  capacity: {
    max_vehicles: number;
    current_vehicles: number;
    max_staff: number;
    current_staff: number;
  };
  services: string[];
  theme: BranchTheme;
  permissions: BranchPermissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url?: string;
  banner_url?: string;
  custom_css?: string;
}

export interface BranchPermissions {
  can_sell: boolean;
  can_purchase: boolean;
  can_transfer: boolean;
  can_service: boolean;
  can_finance: boolean;
  can_insurance: boolean;
  max_discount_percentage: number;
  approval_required_above: number;
  allowed_payment_methods: string[];
}

export interface BranchStaff {
  id: string;
  branch_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'manager' | 'sales_executive' | 'service_advisor' | 'technician' | 'admin';
  permissions: string[];
  is_active: boolean;
  joined_at: string;
  performance_score: number;
}

export interface BranchPerformance {
  branch_id: string;
  period: string;
  metrics: {
    vehicles_sold: number;
    revenue: number;
    customer_satisfaction: number;
    average_sale_price: number;
    conversion_rate: number;
    service_jobs_completed: number;
    profit_margin: number;
  };
}

const BRANCH_TYPES = [
  { value: 'headquarters', label: 'Headquarters', icon: Crown, color: 'text-purple-600' },
  { value: 'regional', label: 'Regional Office', icon: Building, color: 'text-blue-600' },
  { value: 'branch', label: 'Branch', icon: Building, color: 'text-green-600' },
  { value: 'showroom', label: 'Showroom', icon: Star, color: 'text-yellow-600' },
  { value: 'workshop', label: 'Workshop', icon: Settings, color: 'text-orange-600' }
];

const STAFF_ROLES = [
  { value: 'manager', label: 'Manager', permissions: ['manage_staff', 'approve_sales', 'view_reports'] },
  { value: 'sales_executive', label: 'Sales Executive', permissions: ['sell_vehicles', 'manage_leads'] },
  { value: 'service_advisor', label: 'Service Advisor', permissions: ['schedule_service', 'manage_bookings'] },
  { value: 'technician', label: 'Technician', permissions: ['perform_service', 'update_jobs'] },
  { value: 'admin', label: 'Administrator', permissions: ['full_access'] }
];

export default function AdvancedBranchManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual Supabase queries
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 'hq001',
      name: 'Aura Motors HQ',
      code: 'HQ',
      type: 'headquarters',
      hierarchy_level: 0,
      address: {
        street: '123 Business District',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      contact: {
        phone: '+91-22-12345678',
        email: 'hq@auramotors.com',
        manager_name: 'Rajesh Kumar',
        manager_phone: '+91-9876543210'
      },
      location: { latitude: 19.0760, longitude: 72.8777 },
      business_hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: false }
      },
      capacity: {
        max_vehicles: 200,
        current_vehicles: 145,
        max_staff: 50,
        current_staff: 42
      },
      services: ['Sales', 'Service', 'Finance', 'Insurance'],
      theme: {
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        accent_color: '#F59E0B'
      },
      permissions: {
        can_sell: true,
        can_purchase: true,
        can_transfer: true,
        can_service: true,
        can_finance: true,
        can_insurance: true,
        max_discount_percentage: 15,
        approval_required_above: 100000,
        allowed_payment_methods: ['cash', 'card', 'finance', 'digital']
      },
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'reg001',
      name: 'North Regional Office',
      code: 'NRO',
      type: 'regional',
      parent_id: 'hq001',
      hierarchy_level: 1,
      address: {
        street: '456 Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      contact: {
        phone: '+91-11-23456789',
        email: 'north@auramotors.com',
        manager_name: 'Priya Singh',
        manager_phone: '+91-9876543211'
      },
      location: { latitude: 28.6139, longitude: 77.2090 },
      business_hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: false }
      },
      capacity: {
        max_vehicles: 150,
        current_vehicles: 98,
        max_staff: 35,
        current_staff: 28
      },
      services: ['Sales', 'Service', 'Finance'],
      theme: {
        primary_color: '#10B981',
        secondary_color: '#059669',
        accent_color: '#F59E0B'
      },
      permissions: {
        can_sell: true,
        can_purchase: true,
        can_transfer: true,
        can_service: true,
        can_finance: true,
        can_insurance: false,
        max_discount_percentage: 12,
        approval_required_above: 75000,
        allowed_payment_methods: ['cash', 'card', 'finance']
      },
      is_active: true,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'br001',
      name: 'Delhi Central Branch',
      code: 'DCB',
      type: 'branch',
      parent_id: 'reg001',
      hierarchy_level: 2,
      address: {
        street: '789 Karol Bagh',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110005',
        country: 'India'
      },
      contact: {
        phone: '+91-11-34567890',
        email: 'delhicentral@auramotors.com',
        manager_name: 'Amit Sharma',
        manager_phone: '+91-9876543212'
      },
      location: { latitude: 28.6139, longitude: 77.2090 },
      business_hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: false }
      },
      capacity: {
        max_vehicles: 75,
        current_vehicles: 52,
        max_staff: 18,
        current_staff: 15
      },
      services: ['Sales', 'Service'],
      theme: {
        primary_color: '#F59E0B',
        secondary_color: '#D97706',
        accent_color: '#10B981'
      },
      permissions: {
        can_sell: true,
        can_purchase: false,
        can_transfer: true,
        can_service: true,
        can_finance: false,
        can_insurance: false,
        max_discount_percentage: 8,
        approval_required_above: 50000,
        allowed_payment_methods: ['cash', 'card']
      },
      is_active: true,
      created_at: '2023-08-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]);

  const [branchStaff, setBranchStaff] = useState<BranchStaff[]>([
    {
      id: 'staff001',
      branch_id: 'br001',
      user_id: 'user001',
      name: 'Rajesh Kumar',
      email: 'rajesh@auramotors.com',
      role: 'manager',
      permissions: ['manage_staff', 'approve_sales', 'view_reports'],
      is_active: true,
      joined_at: '2023-08-01T00:00:00Z',
      performance_score: 4.7
    },
    {
      id: 'staff002',
      branch_id: 'br001',
      user_id: 'user002',
      name: 'Priya Singh',
      email: 'priya@auramotors.com',
      role: 'sales_executive',
      permissions: ['sell_vehicles', 'manage_leads'],
      is_active: true,
      joined_at: '2023-08-15T00:00:00Z',
      performance_score: 4.5
    }
  ]);

  const handleBranchAction = async (branchId: string, action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate') => {
    setIsLoading(true);
    try {
      const updatedBranches = branches.map(branch => {
        if (branch.id === branchId) {
          switch (action) {
            case 'activate':
              return { ...branch, is_active: true };
            case 'deactivate':
              return { ...branch, is_active: false };
            default:
              return branch;
          }
        }
        return branch;
      });

      setBranches(updatedBranches);
      toast({
        title: "Success",
        description: `Branch ${action}d successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  const getBranchTypeConfig = (type: Branch['type']) => {
    return BRANCH_TYPES.find(t => t.value === type) || BRANCH_TYPES[0];
  };

  const getChildBranches = (parentId: string) => {
    return branches.filter(branch => branch.parent_id === parentId);
  };

  const renderBranchHierarchy = (parentId?: string, level = 0) => {
    const childBranches = parentId ? getChildBranches(parentId) : branches.filter(b => !b.parent_id);

    return childBranches.map(branch => {
      const hasChildren = getChildBranches(branch.id).length > 0;
      const isExpanded = expandedBranches.has(branch.id);
      const typeConfig = getBranchTypeConfig(branch.type);
      const IconComponent = typeConfig.icon;

      return (
        <div key={branch.id}>
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 ${
              level > 0 ? 'ml-8' : ''
            }`}
            onClick={() => setSelectedBranch(branch)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBranchExpansion(branch.id);
                }}
                className="p-1 hover:bg-slate-200 rounded"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            <IconComponent className={`w-5 h-5 ${typeConfig.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{branch.name}</span>
                <Badge variant="outline">{branch.code}</Badge>
                {!branch.is_active && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>{branch.address.city}, {branch.address.state}</span>
                <span>{branch.capacity.current_vehicles}/{branch.capacity.max_vehicles} vehicles</span>
                <span>{branch.capacity.current_staff}/{branch.capacity.max_staff} staff</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBranchAction(branch.id, branch.is_active ? 'deactivate' : 'activate');
                }}
              >
                {branch.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderBranchHierarchy(branch.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const activeBranches = branches.filter(b => b.is_active);
  const totalCapacity = branches.reduce((sum, branch) => sum + branch.capacity.max_vehicles, 0);
  const currentVehicles = branches.reduce((sum, branch) => sum + branch.capacity.current_vehicles, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advanced Branch Management</h1>
          <p className="text-slate-600">Hierarchical branch structure, theming, and comprehensive management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {activeBranches.length} Active Branches
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {currentVehicles}/{totalCapacity} Vehicles
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {branches.length} Total Branches
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Branch Hierarchy</h3>
              <p className="text-sm text-slate-600">Visual organization of your branch structure</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </div>

          {/* Hierarchy Visualization */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                {renderBranchHierarchy()}
              </div>

              {branches.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No branches yet</h3>
                  <p className="text-slate-500 mb-4">Create your first branch to get started</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Branch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hierarchy Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Branches</p>
                    <p className="text-2xl font-bold">{branches.length}</p>
                  </div>
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Branches</p>
                    <p className="text-2xl font-bold text-green-600">{activeBranches.length}</p>
                  </div>
                  <Building className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Capacity</p>
                    <p className="text-2xl font-bold">{totalCapacity}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Current Vehicles</p>
                    <p className="text-2xl font-bold text-blue-600">{currentVehicles}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {BRANCH_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(branch => {
              const typeConfig = getBranchTypeConfig(branch.type);
              const IconComponent = typeConfig.icon;
              const capacityPercentage = (branch.capacity.current_vehicles / branch.capacity.max_vehicles) * 100;

              return (
                <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${typeConfig.color}`} />
                        <div>
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <p className="text-sm text-slate-600">{branch.code}</p>
                        </div>
                      </div>
                      {!branch.is_active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{branch.address.city}, {branch.address.state}</span>
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{branch.contact.manager_name}</span>
                      </div>

                      {/* Capacity */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Vehicle Capacity</span>
                          <span className="text-sm text-slate-600">
                            {branch.capacity.current_vehicles}/{branch.capacity.max_vehicles}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${capacityPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <span className="text-sm font-medium mb-2 block">Services</span>
                        <div className="flex flex-wrap gap-1">
                          {branch.services.map(service => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {STAFF_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>

          {/* Staff List */}
          <div className="space-y-4">
            {branchStaff.map(staff => {
              const branch = branches.find(b => b.id === staff.branch_id);
              const roleConfig = STAFF_ROLES.find(r => r.value === staff.role);

              return (
                <Card key={staff.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{staff.name}</h4>
                          <p className="text-sm text-slate-600">{staff.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{roleConfig?.label}</Badge>
                            {branch && <Badge variant="secondary">{branch.name}</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-sm font-medium">Performance</div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{staff.performance_score}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mt-4">
                      <span className="text-sm font-medium mb-2 block">Permissions</span>
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Permissions</CardTitle>
                <p className="text-sm text-slate-600">Configure capabilities for each branch type</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BRANCH_TYPES.map(type => (
                    <div key={type.value} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                        <span className="font-medium">{type.label}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={type.value === 'headquarters' || type.value === 'branch'} />
                          <Label>Can Sell</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={type.value === 'headquarters'} />
                          <Label>Can Purchase</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <Label>Can Transfer</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={type.value !== 'showroom'} />
                          <Label>Can Service</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <p className="text-sm text-slate-600">Default permissions for each staff role</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {STAFF_ROLES.map(role => (
                    <div key={role.value} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{role.label}</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                    <p className="text-2xl font-bold">₹12.5Cr</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Top Branch</p>
                    <p className="text-2xl font-bold">Mumbai HQ</p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Performance</p>
                    <p className="text-2xl font-bold">4.3 ⭐</p>
                  </div>
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Staff Efficiency</p>
                    <p className="text-2xl font-bold">87%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Branch Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Branch</th>
                      <th className="text-right py-2">Vehicles</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">Staff</th>
                      <th className="text-right py-2">Performance</th>
                      <th className="text-right py-2">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map(branch => {
                      const utilization = (branch.capacity.current_vehicles / branch.capacity.max_vehicles) * 100;

                      return (
                        <tr key={branch.id} className="border-b">
                          <td className="py-2 font-medium">{branch.name}</td>
                          <td className="text-right py-2">{branch.capacity.current_vehicles}</td>
                          <td className="text-right py-2">₹{(Math.random() * 5000000 + 1000000).toFixed(0)}</td>
                          <td className="text-right py-2">{branch.capacity.current_staff}</td>
                          <td className="text-right py-2">
                            <div className="flex items-center justify-end gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{(Math.random() * 2 + 3).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="text-right py-2">
                            <span className={utilization > 80 ? 'text-red-600' : utilization > 60 ? 'text-orange-600' : 'text-green-600'}>
                              {utilization.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Branch Details Modal */}
      {showBranchModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {React.createElement(getBranchTypeConfig(selectedBranch.type).icon, {
                    className: `w-6 h-6 ${getBranchTypeConfig(selectedBranch.type).color}`
                  })}
                  <div>
                    <h2 className="text-xl font-semibold">{selectedBranch.name}</h2>
                    <p className="text-sm text-slate-600">{selectedBranch.code} • {getBranchTypeConfig(selectedBranch.type).label}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBranchModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branch Details */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-slate-600">Manager:</span>
                        <p className="font-medium">{selectedBranch.contact.manager_name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Phone:</span>
                        <p>{selectedBranch.contact.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Email:</span>
                        <p>{selectedBranch.contact.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedBranch.address.street}</p>
                      <p>{selectedBranch.address.city}, {selectedBranch.address.state}</p>
                      <p>{selectedBranch.address.pincode}, {selectedBranch.address.country}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-600">Vehicles:</span>
                          <p className="font-medium">
                            {selectedBranch.capacity.current_vehicles}/{selectedBranch.capacity.max_vehicles}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Staff:</span>
                          <p className="font-medium">
                            {selectedBranch.capacity.current_staff}/{selectedBranch.capacity.max_staff}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Permissions & Services */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedBranch.services.map(service => (
                          <Badge key={service} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(selectedBranch.permissions).map(([key, value]) => {
                          if (typeof value === 'boolean') {
                            return (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                <Badge variant={value ? 'default' : 'secondary'}>
                                  {value ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: selectedBranch.theme.primary_color }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: selectedBranch.theme.secondary_color }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: selectedBranch.theme.accent_color }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
