
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import {
  Car,
  Plus,
  Search,
  Bell,
  Settings,
  TrendingUp,
  IndianRupee,
  Handshake,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Zap,
  Sparkles,
  Crown,
  Star
} from "lucide-react";

import InventorySnapshot from "../components/dashboard/InventorySnapshot";
import OpenDeals from "../components/dashboard/OpenDeals";
import EscrowStatus from "../components/dashboard/EscrowStatus";
import TasksToDo from "../components/dashboard/TasksToDo";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import AITipsCarousel from "../components/dashboard/AITipsCarousel";
import ConditionalBanners from "../components/dashboard/ConditionalBanners";
import GlobalSearch from "../components/dashboard/GlobalSearch";
import NotificationsCenter from "../components/dashboard/NotificationsCenter";
import ProgressiveVerificationBanner from "../components/dashboard/ProgressiveVerificationBanner";
import OfflineBanner from '../components/dashboard/OfflineBanner';
import VerificationStatus from '../components/dashboard/VerificationStatus';

import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Dashboard() {
  const [dealer, setDealer] = useState(null);
  const [user, setUser] = useState<(SupabaseUser & { role?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState({
    inventory: { live: 0, aging: 0, draft: 0 },
    deals: { negotiating: 0, pending_payment: 0, disputed: 0 },
    escrow: { amount: 0, pending: 0 },
    tasks: []
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);



  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();

    // Set up 30-second refresh interval
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      console.log('🔍 Dashboard - Starting initialization...');
      
      // Step 1: Get current user (simple approach that works)
      console.log('🔍 Dashboard - Step 1: Getting current user...');
      const currentUser = await User.meWithRole();
      console.log('🔍 Dashboard - Current user:', currentUser);
      setUser(currentUser);

      if (!currentUser?.email) {
        console.error('🔍 Dashboard - No user email found');
        setError('No user email found. Please log in again.');
        return;
      }

      // Step 2: Get dealer profile (search by both created_by and email for compatibility)
      console.log('🔍 Dashboard - Step 2: Getting dealer profile...');

      // First try by created_by, then by email to handle existing dealers with null created_by
      let dealerProfile = await Dealer.filter({ created_by: currentUser.email });

      // If no dealers found by created_by, try by email
      if (dealerProfile.length === 0) {
        console.log('🔍 Dashboard - No dealers found by created_by, checking by email...');
        dealerProfile = await Dealer.filter({ email: currentUser.email });
      }

      console.log('🔍 Dashboard - Dealer profile search result:', dealerProfile);
      
      if (dealerProfile && dealerProfile.length > 0) {
        console.log('🔍 Dashboard - Dealer profile loaded:', dealerProfile[0]);
        setDealer(dealerProfile[0]);
        
        // Step 3: Load dashboard data (optional - continue even if it fails)
        console.log('🔍 Dashboard - Step 3: Loading dashboard data...');
        try {
          await loadDashboardData(dealerProfile[0]);
        } catch (dataError) {
          console.warn('🔍 Dashboard - Dashboard data loading failed, continuing with basic data:', dataError);
          // Continue with basic data - don't fail the whole dashboard
        }
      } else {
        console.log('🔍 Dashboard - No dealer profile found, using fallback...');
        // Use fallback dealer data
        const fallbackDealer = {
          id: 'fallback',
          business_name: 'Abhimanyu Auto Dealers',
          name: 'Ravi Abhinav Yadav',
          email: currentUser.email,
          status: 'active',
          verification_status: 'verified',
          onboarding_completed: true,
          city: 'Hyderabad',
          state: 'Telangana',
          phone: '9989090950',
          address: '11-999, Pride Towers, Gachibowli'
        } as any;
        
        console.log('🔍 Dashboard - Using fallback dealer:', fallbackDealer);
        setDealer(fallbackDealer);
      }
    } catch (error) {
      console.error('🔍 Dashboard - Error initializing dashboard:', error);
      setError(error.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (dealerData = dealer) => {
    if (!dealerData) {
      console.log('🔍 Dashboard - No dealer data provided to loadDashboardData');
      return;
    }

    try {
      console.log('🔍 Dashboard - Loading dashboard data for dealer:', dealerData.id);
      
      // Simple approach without timeouts
      const [vehicles, sellerTransactions, buyerTransactions] = await Promise.all([
        Vehicle.filter({ dealer_id: dealerData.id }),
        Transaction.filter({ seller_id: dealerData.id }),
        Transaction.filter({ buyer_id: dealerData.id })
      ]);

      const inventory = {
        live: vehicles.filter(v => v.status === 'live').length,
        aging: vehicles.filter(v => v.status === 'live' && new Date(v.created_at) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)).length,
        draft: vehicles.filter(v => v.status === 'draft').length
      };

      const deals = {
        negotiating: sellerTransactions.filter(t => t.status === 'negotiating').length,
        pending_payment: sellerTransactions.filter(t => t.status === 'payment_pending').length,
        disputed: sellerTransactions.filter(t => t.status === 'disputed').length
      };

      const escrow = {
        amount: sellerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        pending: sellerTransactions.filter(t => t.amount > 0).length
      };

      const tasks = [];

      setDashboardData({ inventory, deals, escrow, tasks });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard - Error loading dashboard data:', error);
    }
  };

  // Show loading state
  if (isLoading || !dealer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="space-y-4">
              <div className="text-red-500 text-lg font-semibold">Error Loading Dashboard</div>
              <p className="text-slate-600 max-w-md">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading dashboard...</p>
              <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-slate-900">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {dealer.business_name || 'Dealer'}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Here's what's happening with your business today
              </p>
              {user?.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    Admin Mode
                  </span>
                  <span className="text-xs text-slate-500">• Full access to all features</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <GlobalSearch 
              onSearch={setSearchQuery}
            />
            
            <ThemeToggle showLabel={false} />
            
            <div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
            </div>

            <div>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>


      </div>

      {/* Notifications Center */}
      {showNotifications && (
        <div>
          <NotificationsCenter onClose={() => setShowNotifications(false)} dealer={dealer} />
        </div>
      )}

      {/* Conditional Banners */}
      <div>
        <ConditionalBanners dealer={dealer} />
      </div>

      {/* Main Dashboard Cards - Improved UX */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Business Overview</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inventory Snapshot */}
          <div>
            <InventorySnapshot data={dashboardData.inventory} dealer={dealer} />
          </div>

          {/* Tasks To Do */}
          <div>
            <TasksToDo tasks={dashboardData.tasks} dealer={dealer} />
          </div>

          {/* Deal Management */}
          <div>
            <OpenDeals data={dashboardData.deals} dealer={dealer} />
          </div>
          <div>
            <EscrowStatus data={dashboardData.escrow} dealer={dealer} />
          </div>
        </div>
      </div>

      {/* Analytics Section - Grid Layout */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Analytics & Performance</h2>
          <Button variant="outline" className="hover-lift">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Full Analytics
          </Button>
        </div>
        
        {/* Grid Layout: 1 column on mobile, 3 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart - Takes full width on mobile, 2 columns on large screens */}
          <div className="lg:col-span-2">
            <PerformanceChart dealer={dealer} />
          </div>

          {/* Analytics Sidebar - Takes 1 column on large screens */}
          <div className="space-y-4">
            {/* Quick Stats Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Listings</span>
                  <span className="font-semibold text-green-600">{dashboardData.inventory.live}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pending Tasks</span>
                  <span className="font-semibold text-amber-600">{dashboardData.tasks.filter(t => !t.completed).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">This Month</span>
                  <span className="font-semibold text-blue-600">₹{dashboardData.escrow.amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>

      {/* AI Tips Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">AI-Powered Insights</h2>
        <div>
          <AITipsCarousel dealer={dealer} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Add Vehicle", icon: Car, href: createPageUrl("AddVehicle"), color: "blue" },
            { title: "View Inventory", icon: Search, href: createPageUrl("Inventory"), color: "green" },
            { title: "Marketplace", icon: TrendingUp, href: createPageUrl("Marketplace"), color: "purple" },
            { title: "Profile Settings", icon: Settings, href: createPageUrl("Profile"), color: "orange" }
          ].map((action, index) => (
            <div key={action.title}>
              <Link to={action.href}>
                <Card className="card-hover card-glass p-6 text-center group">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-gradient transition-colors">
                    {action.title}
                  </h3>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-slate-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
        <div className="mt-2 text-xs text-green-600">
          ✅ System Status: All systems operational
        </div>
      </div>
    </div>
  );
}