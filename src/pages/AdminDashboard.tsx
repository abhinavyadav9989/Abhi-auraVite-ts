import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Dealer } from '@/api/entities';
import { Vehicle } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/api/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Car, 
  Handshake, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  FileText,
  IndianRupee,
  Activity,
  BarChart3,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Import admin components
import KpiCard from '../components/admin/KpiCard';
import KybQueueWidget from '../components/admin/KybQueueWidget';
import DisputesKanbanWidget from '../components/admin/DisputesKanbanWidget';
import FlaggedDealersWidget from '../components/admin/FlaggedDealersWidget';
import SystemHealthPanel from '../components/admin/SystemHealthPanel';
import MaintenanceBanner from '../components/admin/MaintenanceBanner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDealers: 0,
    totalVehicles: 0,
    totalTransactions: 0,
    pendingKybs: 0,
    activeDisputes: 0,
    flaggedDealers: 0,
    gmvThisMonth: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [kybQueue, setKybQueue] = useState([]);
  const [disputes, setDisputes] = useState({
    new: [],
    investigating: [],
    awaiting_evidence: [],
    resolved: []
  });
  const [flaggedDealers, setFlaggedDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false); // Initialize as false
  const [currentUser, setCurrentUser] = useState<(SupabaseUser & { role?: string }) | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
    console.log('AdminDashboard initialized - Maintenance mode:', isMaintenanceMode);
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is admin
      const userWithRole = await User.meWithRole();
      setCurrentUser(userWithRole);
      
      if (!userWithRole || userWithRole.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive"
        });
        navigate(createPageUrl('Dashboard'));
        return;
      }
      
      // Debug: Check JWT token information
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('=== ADMIN DASHBOARD JWT DEBUG ===');
      console.log('Current user:', user);
      console.log('User email:', user?.email);
      console.log('User metadata:', user?.user_metadata);
      console.log('App metadata:', user?.app_metadata);
      console.log('Session:', session);
      console.log('Access token exists:', !!session?.access_token);
      console.log('=== END ADMIN DASHBOARD JWT DEBUG ===');

      // Load core statistics (skip users list due to auth permissions)
      const [dealers, vehicles, transactions] = await Promise.all([
        Dealer.list(),
        Vehicle.list(),
        Transaction.list()
      ]);

      // Calculate stats
      const pendingKybs = dealers.filter(d => 
        ['documents_submitted', 'pending'].includes(d.verification_status)
      );
      
      const disputedTransactions = transactions.filter(t => t.status === 'disputed');
      const flaggedDealers = dealers.filter(d => d.status === 'flagged' || d.verification_status === 'rejected');
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const completedThisMonth = transactions.filter(t => 
        t.status === 'completed' && new Date(t.updated_at) >= thisMonth
      );
      const gmvThisMonth = completedThisMonth.reduce((sum, t) => sum + (t.final_price || 0), 0);

      setStats({
        totalUsers: dealers.length, // Use dealers count as proxy for users
        totalDealers: dealers.length,
        totalVehicles: vehicles.length,
        totalTransactions: transactions.length,
        pendingKybs: pendingKybs.length,
        activeDisputes: disputedTransactions.length,
        flaggedDealers: flaggedDealers.length,
        gmvThisMonth
      });

      // Set queue data
      setKybQueue(pendingKybs.slice(0, 10)); // Latest 10
      setFlaggedDealers(flaggedDealers.slice(0, 5)); // Top 5

      // Organize disputes
      setDisputes({
        new: disputedTransactions.slice(0, 5),
        investigating: [],
        awaiting_evidence: [],
        resolved: []
      });

      // Mock recent activity
      setRecentActivity([
        { id: 1, type: 'kyb_submitted', dealer: 'Mumbai Motors', time: '2 mins ago' },
        { id: 2, type: 'dispute_opened', transaction: 'TXN-001', time: '5 mins ago' },
        { id: 3, type: 'dealer_flagged', dealer: 'Suspicious Dealer Ltd', time: '10 mins ago' },
        { id: 4, type: 'high_value_transaction', amount: '₹15L', time: '15 mins ago' }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({ title: 'Error', description: 'Failed to load admin dashboard data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKybAction = async (dealerId, action, notes = '') => {
    try {
      const updateData: any = { verification_notes: notes };
      
      if (action === 'approve') {
        updateData.verification_status = 'verified';
        updateData.verified_at = new Date().toISOString();
      } else if (action === 'reject') {
        updateData.verification_status = 'rejected';
      }
      
      await Dealer.update(dealerId, updateData);
      toast({ title: 'Success', description: `KYB ${action}d successfully` });
      loadAdminData(); // Refresh data
    } catch (error) {
      toast({ title: 'Error', description: `Failed to ${action} KYB`, variant: 'destructive' });
    }
  };

  const handleDisputeAction = async (transactionId, action, resolution = '') => {
    try {
      const updateData: any = {};
      
      switch (action) {
        case 'investigate':
          // Note: dispute fields don't exist in database, using status-based tracking
        updateData.status = 'investigating';
          break;
        case 'request_evidence':
          // Note: dispute fields don't exist in database, using status-based tracking
        updateData.status = 'awaiting_evidence';
          break;
        case 'resolve':
          // Note: dispute fields don't exist in database, using status-based tracking
        updateData.status = 'resolved';
          updateData.dispute_resolution = resolution;
          updateData.status = 'completed';
          break;
      }
      
      await Transaction.update(transactionId, updateData);
      toast({ title: 'Success', description: `Dispute ${action} completed` });
      loadAdminData();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to ${action} dispute`, variant: 'destructive' });
    }
  };

  const handleFlagDealer = async (dealerId, flag, reason = '') => {
    try {
      await Dealer.update(dealerId, { 
        // Note: is_flagged field doesn't exist in database, using status-based flagging
        status: flag ? 'flagged' : 'active',
        flag_reason: reason,
        flagged_at: flag ? new Date().toISOString() : null
      });
      toast({ title: 'Success', description: `Dealer ${flag ? 'flagged' : 'unflagged'} successfully` });
      loadAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update dealer flag', variant: 'destructive' });
    }
  };

  const handleMaintenanceToggle = async (enabled) => {
    try {
      console.log(`Maintenance mode toggled: ${enabled}`);
      setIsMaintenanceMode(enabled);
      toast({ 
        title: 'Maintenance Mode Updated', 
        description: `Maintenance mode has been ${enabled ? 'enabled' : 'disabled'}`,
        variant: enabled ? 'destructive' : 'default'
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast({ title: 'Error', description: 'Failed to update maintenance mode', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Maintenance Banner - Only show when maintenance mode is enabled */}
      {isMaintenanceMode && <MaintenanceBanner />}
      
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Platform overview and management</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={createPageUrl('AdminKYBVerification')}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Shield className="w-4 h-4 mr-2" />
                  KYB Queue
                </Button>
              </Link>
              <Link to={createPageUrl('DisputeResolution')}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Disputes
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <KpiCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              color="blue"
              onClick={() => navigate(createPageUrl('AdminUsers'))}
            />
            <KpiCard
              title="Active Dealers"
              value={stats.totalDealers.toLocaleString()}
              icon={Car}
              trend={{ value: 8, isPositive: true }}
              color="green"
            />
            <KpiCard
              title="Monthly GMV"
              value={`₹${(stats.gmvThisMonth / 100000).toFixed(1)}L`}
              icon={IndianRupee}
              trend={{ value: 15, isPositive: true }}
              color="purple"
            />
            <KpiCard
              title="Active Transactions"
              value={stats.totalTransactions.toLocaleString()}
              icon={Handshake}
              trend={{ value: 5, isPositive: false }}
              color="orange"
            />
          </div>

          {/* Alert Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending KYBs</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingKybs}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Active Disputes</p>
                    <p className="text-2xl font-bold text-red-900">{stats.activeDisputes}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Flagged Dealers</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.flaggedDealers}</p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="kyb">KYB Queue</TabsTrigger>
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
              <TabsTrigger value="dealers">Dealers</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">
                                {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-slate-600">
                                {activity.dealer || activity.transaction || activity.amount}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <SystemHealthPanel 
                  isMaintenanceMode={isMaintenanceMode}
                  onMaintenanceToggle={handleMaintenanceToggle}
                />
              </div>
            </TabsContent>

            <TabsContent value="kyb">
              <KybQueueWidget 
                queue={kybQueue}
                onApprove={(id, notes) => handleKybAction(id, 'approve', notes)}
                onReject={(id, notes) => handleKybAction(id, 'reject', notes)}
                onRequestInfo={(id, notes) => handleKybAction(id, 'request_info', notes)}
              />
            </TabsContent>

            <TabsContent value="disputes">
              <DisputesKanbanWidget 
                disputes={disputes}
                onStatusChange={(id, status) => handleDisputeAction(id, status)}
                onRefund={(id, percentage) => console.log('Refund:', id, percentage)}
                onAddNote={(id, note) => console.log('Add note:', id, note)}
              />
            </TabsContent>

            <TabsContent value="dealers">
              <FlaggedDealersWidget 
                flaggedDealers={flaggedDealers}
                onFlag={(id, reason) => handleFlagDealer(id, true, reason)}
                onUnflag={(id) => handleFlagDealer(id, false)}
                onSuspend={(id, reason) => console.log('Suspend:', id, reason)}
              />
            </TabsContent>

            <TabsContent value="system">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Platform Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Active Users (30d):</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Registrations (7d):</span>
                        <span className="font-medium">56</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Session Duration:</span>
                        <span className="font-medium">12m 34s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Uptime:</span>
                        <span className="font-medium text-green-600">99.9%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Export User Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Audit Log
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Reports
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        System Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}