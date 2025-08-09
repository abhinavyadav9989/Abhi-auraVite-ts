
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
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
  Zap } from
"lucide-react";

import InventorySnapshot from "../components/dashboard/InventorySnapshot";
import OpenDeals from "../components/dashboard/OpenDeals";
import EscrowStatus from "../components/dashboard/EscrowStatus";
import TasksToDo from "../components/dashboard/TasksToDo";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import AITipsCarousel from "../components/dashboard/AITipsCarousel";
import ConditionalBanners from "../components/dashboard/ConditionalBanners";
import GlobalSearch from "../components/dashboard/GlobalSearch";
import NotificationsCenter from "../components/dashboard/NotificationsCenter";
import FirstTimeIntro from "../components/dashboard/FirstTimeIntro";
import OfflineBanner from '../components/dashboard/OfflineBanner';

export default function Dashboard() {
  const [dealer, setDealer] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

    // DD-12: Network status monitoring
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
      const currentUser = await User.me();
      setUser(currentUser);

      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      if (dealerProfile.length > 0) {
        setDealer(dealerProfile[0]);
        await loadDashboardData(dealerProfile[0]);
      } else {
        // No dealer profile found, redirect to onboarding path selection
        navigate(createPageUrl('OnboardingPath'));
        return; // Stop execution here as we're navigating away
      }
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    }
    setIsLoading(false);
  };

  const loadDashboardData = async (dealerProfile = dealer) => {
    if (!dealerProfile) return;

    try {
      // Load inventory data
      const vehicles = await Vehicle.filter({ dealer_id: dealerProfile.id });
      const now = new Date();
      // Ensure date calculation does not mutate 'now' directly
      const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

      const inventory = {
        live: vehicles.filter((v) => v.status === 'live').length,
        aging: vehicles.filter((v) => v.status === 'live' && new Date(v.created_date) < sixtyDaysAgo).length,
        draft: vehicles.filter((v) => v.status === 'draft').length
      };

      // Load deals data using Transaction entity
      const transactions = await Transaction.filter({
        $or: [{ seller_id: dealerProfile.id }, { buyer_id: dealerProfile.id }]
      });

      const dealsStatus = {
        negotiating: transactions.filter((t) => ['offer_made', 'negotiating'].includes(t.status)).length,
        pending_payment: transactions.filter((t) => t.status === 'payment_pending' || t.status === 'accepted').length,
        disputed: transactions.filter((t) => t.status === 'disputed').length
      };

      // Mock escrow data (would come from payment system)
      const escrow = {
        amount: 245000, // Mock amount in escrow
        pending: 3 // Mock pending releases
      };

      // Generate tasks based on business logic
      const tasks = generateTasks(dealerProfile, vehicles, transactions);

      setDashboardData({
        inventory,
        deals: dealsStatus,
        escrow,
        tasks
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard data: -", error);
    }
  };

  const generateTasks = (dealer, vehicles, transactions) => {
    const tasks = [];

    // KYB verification task
    if (dealer.verification_status !== 'verified') {
      tasks.push({
        id: 'kyb_verification',
        title: 'Complete KYB Verification',
        type: 'kyb',
        priority: 'high',
        action: () => window.location.href = createPageUrl("Profile")
      });
    }

    // Aging inventory task
    const agingVehicles = vehicles.filter((v) => {
      const nowMs = new Date().getTime();
      const createdMs = new Date(v.created_date).getTime();
      const daysSinceCreated = Math.floor((nowMs - createdMs) / (1000 * 60 * 60 * 24));
      return v.status === 'live' && daysSinceCreated > 60;
    });

    if (agingVehicles.length > 0) {
      tasks.push({
        id: 'aging_inventory',
        title: `${agingVehicles.length} vehicles aging (>60 days)`,
        type: 'inventory',
        priority: 'medium',
        action: () => window.location.href = createPageUrl("Inventory")
      });
    }

    // Mock logistics tasks
    tasks.push({
      id: 'logistics_pickup',
      title: '2 vehicles awaiting pickup',
      type: 'logistics',
      priority: 'medium',
      action: () => console.log('Navigate to logistics')
    });

    return tasks;
  };

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    // Implement global search logic
    console.log('Searching for:', query);
  };

  // DD-13: Check if user needs first-time intro
  const shouldShowFirstTimeIntro = () => {
    if (!dashboardData || !user) return false; // Ensure data is loaded
    const totalDeals = dashboardData.deals.negotiating + dashboardData.deals.pending_payment + dashboardData.deals.disputed;
    return dashboardData.inventory.live === 0 &&
    totalDeals === 0 &&
    user?.role !== 'admin';
  };

  // If dealer profile is not loaded and it's still loading, show nothing or a loading spinner
  if (!dealer && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Loading dashboard...</p>
      </div>);

  }

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      
      <div className={`min-h-screen bg-slate-50 ${!isOnline ? 'opacity-75' : ''}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo (handled by Layout) and Global Search */}
            <div className="flex items-center gap-4 flex-1">
              <GlobalSearch onSearch={handleGlobalSearch} />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("AddVehicle")}>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Add Vehicle</span>
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative">

                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </Button>
              
              <Link to={createPageUrl("Profile")}>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications Overlay */}
        {showNotifications &&
        <NotificationsCenter
          onClose={() => setShowNotifications(false)}
          dealer={dealer} />

        }

        <div className="md:p-8 bg-none">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Control Tower
                </h1>
                <p className="text-slate-600 flex items-center gap-2">
                  What needs your attention right now
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>

            {shouldShowFirstTimeIntro() ?
            <FirstTimeIntro dealer={dealer} /> :

            <>
                {/* Conditional Banners (Row 3) */}
                <ConditionalBanners dealer={dealer} />

                {/* Row 1: Main Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InventorySnapshot
                  data={dashboardData.inventory}
                  dealer={dealer} />

                  <OpenDeals
                  data={dashboardData.deals}
                  dealer={dealer} />

                  <EscrowStatus
                  data={dashboardData.escrow}
                  dealer={dealer} />

                  <TasksToDo
                  tasks={dashboardData.tasks}
                  dealer={dealer} />

                </div>

                {/* Row 2: Analytics and AI Tips */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PerformanceChart dealer={dealer} />
                  </div>
                  <div>
                    <AITipsCarousel dealer={dealer} />
                  </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </>);

}