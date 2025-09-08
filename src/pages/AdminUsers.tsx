import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Users, 
  Car, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { Dealer } from '@/api/entities';
import { Vehicle } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';

interface DealerWithVehicles {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  business_type: string;
  client_type: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  vehicle_count: number;
  status: 'active' | 'pending' | 'suspended' | 'verified';
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dealers, setDealers] = useState<DealerWithVehicles[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<DealerWithVehicles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is admin
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive"
        });
        navigate(createPageUrl('Dashboard'));
        return;
      }
      
      await loadDealersData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        title: "Authentication Error",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate(createPageUrl('Dashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortDealers();
  }, [dealers, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadDealersData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dealers
      const dealersData = await Dealer.list();
      
      // Load vehicle counts for each dealer
      const dealersWithVehicles = await Promise.all(
        dealersData.map(async (dealer) => {
          try {
            const vehicles = await Vehicle.filter({ dealer_id: dealer.id });
            return {
              ...dealer,
              vehicle_count: vehicles.length,
              status: getDealerStatus(dealer)
            };
          } catch (error) {
            console.error(`Error loading vehicles for dealer ${dealer.id}:`, error);
            return {
              ...dealer,
              vehicle_count: 0,
              status: getDealerStatus(dealer)
            };
          }
        })
      );

      setDealers(dealersWithVehicles);
    } catch (error) {
      console.error('Error loading dealers data:', error);
      toast({
        title: "Error",
        description: "Failed to load dealers data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDealerStatus = (dealer: any): 'active' | 'pending' | 'suspended' | 'verified' => {
    if (!dealer.onboarding_completed) return 'pending';
    if (dealer.suspended) return 'suspended';
    if (dealer.kyb_verified) return 'verified';
    return 'active';
  };

  const filterAndSortDealers = () => {
    let filtered = [...dealers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(dealer =>
        dealer.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dealer.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dealer => dealer.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDealers(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700"><Shield className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleExport = () => {
    // Export functionality would go here
    toast({
      title: "Export",
      description: "Export functionality coming soon!"
    });
  };

  const handleViewDealer = (dealerId: string) => {
    // Navigate to admin user details (by dealer)
    navigate(createPageUrl('AdminUserDetails') + `?dealerId=${dealerId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('AdminDashboard'))}
              className="hover:bg-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dealer Management</h1>
              <p className="text-slate-600 dark:text-slate-300">Manage all dealers and their accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={handleExport} className="relative z-10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Dealers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{dealers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Dealers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {dealers.filter(d => d.status === 'active' || d.status === 'verified').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending KYB</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {dealers.filter(d => d.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Vehicles</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {dealers.reduce((sum, dealer) => sum + dealer.vehicle_count, 0)}
                  </p>
                </div>
                <Car className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search dealers by name, email, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="business_name-asc">Name A-Z</option>
                  <option value="business_name-desc">Name Z-A</option>
                  <option value="vehicle_count-desc">Most Vehicles</option>
                  <option value="vehicle_count-asc">Least Vehicles</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealers Table */}
        <Card className="dark:bg-slate-900/80 dark:border-slate-700/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dealers ({filteredDealers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Vehicles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDealers.map((dealer) => (
                      <TableRow key={dealer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {dealer.business_name || 'N/A'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-300">
                              {dealer.business_type} • {dealer.client_type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {dealer.owner_name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {dealer.email}
                            </div>
                            {dealer.phone && (
                              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {dealer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {dealer.city && dealer.state ? (
                              <>
                                {dealer.city}, {dealer.state}
                              </>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">Not specified</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white">{dealer.vehicle_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(dealer.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(dealer.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDealer(dealer.id)}
                            className="text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredDealers.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No dealers found</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'No dealers have been registered yet'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
