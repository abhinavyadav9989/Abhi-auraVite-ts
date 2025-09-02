

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/api/entities";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Dealer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from '@/hooks/useAuth';
import { useDynamicNavigation } from '@/hooks/useDynamicNavigation';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Car, Search, Handshake, Heart, User, Bell, Menu, X, BarChart2,
  Shield, Settings, LogOut, Loader2, WifiOff, Package, TrendingUp, FileText, AlertTriangle,
  Lock, Zap, Crown
} from "lucide-react";
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<(SupabaseUser & { role?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Dynamic navigation based on activation settings
  const {
    navigationItems,
    adminNavigationItems,
    getFeatureStatus,
    getNextUpgradeFeature,
    activationStatus,
    isLoading: navLoading
  } = useDynamicNavigation();

  // Define routes where sidebar should NOT be shown
  const authOnboardingRoutes = [
    '/Authentication',
    '/OnboardingWizard',
    '/OnboardingPath',
    '/EmailVerification'
  ];

  // Check if current route is an auth/onboarding route
  const isAuthOnboardingRoute = authOnboardingRoutes.some(route =>
    location.pathname === route || location.pathname.includes(route.replace('/', ''))
  );

  // Determine if sidebar should be shown
  const shouldShowSidebar = isAuthenticated && !isAuthOnboardingRoute;

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  // Wait for authentication state to be established before loading user data
  useEffect(() => {
    if (!authLoading) {
      loadUserData();
    }
  }, [authLoading, isAuthenticated, authUser]);

  const loadUserData = async () => {
    // Don't try to load user data if not authenticated
    if (!isAuthenticated || !authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await UserEntity.meWithRole();
      console.log('🔍 Layout - User data loaded:', {
        email: currentUser?.email,
        role: currentUser?.role,
        user_metadata: currentUser?.user_metadata,
        app_metadata: currentUser?.app_metadata
      });
      console.log('🔍 Layout - Complete user object:', currentUser);
      console.log('🔍 Layout - Admin navigation items available:', adminNavigationItems);
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    UserEntity.logout().then(() => {
      window.location.href = '/';
    });
  };

  // If on auth/onboarding routes, don't show loading spinner
  if ((isLoading || authLoading) && !isAuthOnboardingRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </motion.div>
      </div>
    );
  }

  // If on auth/onboarding routes, render without sidebar
  if (isAuthOnboardingRoute) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-slate-900">
          {/* Aceternity UI Sidebar */}
          {shouldShowSidebar && (
            <SidebarBody>
              <div className="flex flex-col h-full overflow-hidden">
                {/* Logo Section */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xl text-slate-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Aura
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                  {navigationItems.map((item) => {
                    const isLocked = item.isLocked;
                    const isActive = location.pathname === item.url;

                    return (
                      <SidebarLink
                        key={item.title}
                        link={{
                          href: isLocked ? '#' : item.url,
                          label: (
                            <div className="flex items-center justify-between w-full">
                              <span className={cn(
                                isLocked && "opacity-60"
                              )}>
                                {item.title}
                              </span>
                              {isLocked && (
                                <Lock className="w-3 h-3 text-slate-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          ),
                          icon: (
                            <div className="relative">
                              <item.icon className={cn(
                                "w-5 h-5",
                                isLocked && "text-slate-400"
                              )} />
                              {isLocked && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full flex items-center justify-center">
                                  <Crown className="w-1 h-1 text-white" />
                                </div>
                              )}
                            </div>
                          )
                        }}
                        className={cn(
                          "rounded-lg transition-all duration-200",
                          isActive && !isLocked
                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                            : isLocked
                              ? "text-slate-400 hover:bg-amber-50 hover:text-amber-700 cursor-not-allowed opacity-60"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            // Could show a tooltip or upgrade prompt here
                          }
                        }}
                      />
                    );
                  })}

                  {/* Admin Navigation Items */}
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-slate-200/60 dark:border-slate-800/60 my-4 pt-4">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Admin
                        </div>
                      </div>
                      {adminNavigationItems.map((item) => (
                        <SidebarLink
                          key={item.title}
                          link={{
                            href: item.url,
                            label: item.title,
                            icon: <item.icon className="w-5 h-5 text-red-600" />
                          }}
                          className={cn(
                            "rounded-lg transition-all duration-200",
                            location.pathname === item.url
                              ? "bg-red-100 text-red-700 border-l-4 border-red-500"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 flex-shrink-0">
                  <SidebarLink
                    link={{
                      href: createPageUrl("Profile"),
                      label: "Profile",
                      icon: <User className="w-5 h-5" />
                    }}
                    className="rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  />
                  <SidebarLink
                    link={{
                      href: createPageUrl("Settings"),
                      label: "Settings",
                      icon: <Settings className="w-5 h-5" />
                    }}
                    className="rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  />
                  <ThemeToggle showLabel={sidebarOpen} />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 px-3 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/80"
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <motion.span
                      animate={{
                        display: sidebarOpen ? "inline-block" : "none",
                        opacity: sidebarOpen ? 1 : 0,
                      }}
                      className="text-slate-600 text-sm transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                    >
                      Logout
                    </motion.span>
                  </button>
                </div>
              </div>
            </SidebarBody>
          )}

          {/* Main Content */}
          <motion.div
            className="flex-1 overflow-auto bg-slate-50 dark:bg-black m-1 rounded-l-[2rem] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(255,255,255,0.1),0_4px_6px_-1px_rgba(255,255,255,0.1)] scrollbar-hide"
            animate={{
              borderRadius: sidebarOpen ? "2rem 0 0 0" : "2rem 0 0 0",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </motion.div>
        </div>
      </Sidebar>
    </ErrorBoundary>
  );
}

