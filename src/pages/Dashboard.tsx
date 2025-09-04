
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
import { FeatureGate } from "@/components/FeatureGate";
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

import ProgressiveVerificationBanner from "../components/dashboard/ProgressiveVerificationBanner";
import OfflineBanner from '../components/dashboard/OfflineBanner';
import VerificationStatus from '../components/dashboard/VerificationStatus';

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
        console.log('Dashboard - Dealer profile loaded:', dealerProfile[0]);
        console.log('Dashboard - branches_added flag:', dealerProfile[0].branches_added);
        setDealer(dealerProfile[0]);
        await loadDashboardData(dealerProfile[0]);
      } else {
        // This should not happen as AuthGuard should handle this
        console.error("No dealer profile found - this should be handled by AuthGuard");
        setIsLoading(false);
        return;
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

      // Load deals data using Transaction entity - use separate queries instead of $or
      const [sellerTransactions, buyerTransactions] = await Promise.all([
        Transaction.filter({ seller_id: dealerProfile.id }),
        Transaction.filter({ buyer_id: dealerProfile.id })
      ]);
      
      const transactions = [...sellerTransactions, ...buyerTransactions];

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



  // Helper function to determine actual verification status
  const getActualVerificationStatus = (dealer) => {
    if (!dealer) return 'unknown';
    
    // Check both verification status fields
    const status1 = dealer.verification_status;
    const status2 = dealer.verification_status_new;
    
    // If either is verified, consider as verified
    if (status1 === 'verified' || status2 === 'verified') {
      return 'verified';
    }
    
    // If either is pending, consider as pending
    if (status1 === 'pending' || status2 === 'pending') {
      return 'pending';
    }
    
    // If either is rejected, consider as rejected
    if (status1 === 'rejected' || status2 === 'rejected') {
      return 'rejected';
    }
    
    // Default to pending if no clear status
    return 'pending';
  };

  // Check if verification banner should be shown
  const shouldShowVerificationBanner = (dealer) => {
    if (!dealer) return false;
    
    // Show if onboarding not completed
    if (!dealer.onboarding_completed) return true;
    
    // Show if verification is pending
    const actualStatus = getActualVerificationStatus(dealer);
    return actualStatus === 'pending';
  };

  // If dealer profile is not loaded and it's still loading, show nothing or a loading spinner
  if (!dealer && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <p>Loading dashboard...</p>
      </div>);

  }

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      
      {/* Verification Banner - Show for users who haven't completed onboarding or have pending verification */}
      {dealer && shouldShowVerificationBanner(dealer) && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  {!dealer.onboarding_completed ? 'Complete Onboarding' : 'Verification Under Review'}
                </h3>
                <p className="text-sm text-yellow-700">
                  {!dealer.onboarding_completed 
                    ? 'Complete your onboarding process to unlock full platform features.'
                    : 'Your business verification is being reviewed. You can still add vehicles to your inventory.'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(!dealer.onboarding_completed ? '/onboarding' : '/profile')}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              {!dealer.onboarding_completed ? 'Continue Onboarding' : 'View Details'}
            </button>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen bg-slate-50 dark:bg-[#0b1220] ${!isOnline ? 'opacity-75' : ''}`}>
        

        {/* Notifications Overlay */}
        {showNotifications &&
        <NotificationsCenter
          onClose={() => setShowNotifications(false)}
          dealer={dealer} />

        }

        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0b1220] dark:to-[#0d1a2b] min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Welcome Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:text-white dark:bg-none">
                  Control Tower
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-slate-600 dark:text-slate-300">
                  <p>What needs your attention right now</p>
                  <span className="text-xs bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm w-fit">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="text-center py-8 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Aura, {dealer?.name || 'Dealer'}!
              </h2>
              <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                Ready to start selling vehicles on India's most trusted B2B platform?
              </p>
            </div>

            {/* Progressive Verification Steps */}
            <ProgressiveVerificationBanner 
              dealer={dealer} 
              user={user} 
              onUpdate={() => initializeDashboard()} 
            />

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

            {/* Row 2: Verification Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VerificationStatus dealer={dealer} user={user} />
              </div>
              <div>
                <AITipsCarousel dealer={dealer} />
              </div>
            </div>

            {/* Row 3: Analytics */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <PerformanceChart dealer={dealer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>);

}