

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary"; // Updated import path
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Car, Search, Handshake, Heart, User, Bell, Menu, X, BarChart2,
  Shield, Settings, LogOut, Loader2, WifiOff, Package, TrendingUp, FileText, AlertTriangle, ChevronLeft,
  CreditCard
} from "lucide-react";
import BottomNavigation from "@/components/ui/bottom-navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "My Inventory", url: createPageUrl("Inventory"), icon: Package },
  { title: "Marketplace", url: createPageUrl("Marketplace"), icon: Search },
  { title: "My Deals", url: createPageUrl("Deals"), icon: Handshake },
  { title: "Shortlists", url: createPageUrl("Shortlists"), icon: Heart },
  { title: "Analytics", url: createPageUrl("InventoryAnalytics"), icon: BarChart2 },
  { title: "Market Trends", url: createPageUrl("MarketTrends"), icon: TrendingUp },
  { title: "Bank", url: createPageUrl("Bank"), icon: CreditCard },
];

const adminNavigationItems = [
  { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: Shield },
  { title: "KYB Verification", url: createPageUrl("AdminKYBVerification"), icon: FileText },
  { title: "Dispute Resolution", url: createPageUrl("DisputeResolution"), icon: AlertTriangle },
  { title: "Audit Log", url: createPageUrl("AdminAuditLog"), icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
      setIsCollapsed(JSON.parse(savedState));
    } else {
      // Default to expanded state if no saved state
      setIsCollapsed(false);
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
      const currentUser = await UserEntity.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Don't throw error here - AuthGuard will handle authentication
      // Just set user to null and let AuthGuard redirect if needed
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prevState => {
      const newState = !prevState;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  const handleLogout = () => {
    UserEntity.logout().then(() => {
      // Force a full page navigation to the root, which will trigger the login flow.
      window.location.href = '/'; 
    });
  };

  // If on auth/onboarding routes, don't show loading spinner - let the auth pages handle their own loading
  if ((isLoading || authLoading) && !isAuthOnboardingRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full max-h-[100dvh] overflow-y-auto no-scrollbar pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className={cn("flex items-center border-b border-slate-200", (isCollapsed && !isMobile) ? "justify-center h-16" : "justify-between h-16 px-4")}>
        {(!isCollapsed || isMobile) && (
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">Aura</span>
          </Link>
        )}
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="hidden lg:flex">
            <ChevronLeft className={cn("w-5 h-5 transition-transform text-slate-600", isCollapsed && "rotate-180")} />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.title} item={item} isCollapsed={isCollapsed && !isMobile} isActive={location.pathname === item.url} />
        ))}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-slate-200">
            <h3 className={cn("text-xs font-semibold text-slate-500 uppercase", (isCollapsed && !isMobile) ? "text-center" : "px-2")}>Admin</h3>
            <div className="space-y-2 mt-2">
            {adminNavigationItems.map((item) => (
              <NavItem key={item.title} item={item} isCollapsed={isCollapsed && !isMobile} isActive={location.pathname === item.url} />
            ))}
            </div>
          </div>
        )}
      </nav>
      <div className="px-2 py-4 mt-auto border-t border-slate-200">
        <NavItem item={{ title: "Profile", url: createPageUrl("Profile"), icon: User }} isCollapsed={isCollapsed && !isMobile} isActive={location.pathname === createPageUrl("Profile")} />
        <NavItem item={{ title: "Settings", url: createPageUrl("Settings"), icon: Settings }} isCollapsed={isCollapsed && !isMobile} isActive={location.pathname === createPageUrl("Settings")} />
        <NavItem item={{ title: "Logout", url: "#", icon: LogOut, action: handleLogout }} isCollapsed={isCollapsed && !isMobile} isActive={false} />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen app-gradient text-slate-900 dark:text-slate-100">
        {/* Desktop Sidebar - Only show if authenticated and not on auth/onboarding routes */}
        {shouldShowSidebar && (
          <aside className={cn(
            "hidden lg:block fixed top-0 left-0 h-full z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}>
            <SidebarContent isMobile={false} />
          </aside>
        )}

        <div className={cn("transition-all duration-300", shouldShowSidebar ? (isCollapsed ? "lg:ml-20" : "lg:ml-64") : "lg:ml-0")}>
          {/* Mobile Header - Only show if authenticated and not on auth/onboarding routes */}
          {shouldShowSidebar && (
            <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                <Car className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white">Aura</span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
            </header>
          )}
          
          {/* Mobile Sidebar - Only show if authenticated and not on auth/onboarding routes */}
          <AnimatePresence>
            {shouldShowSidebar && isMobileMenuOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="lg:hidden fixed inset-0 z-50 h-screen bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50"
                onClick={(e) => {
                  // Close menu when clicking on the backdrop (not on the sidebar content)
                  if (e.target === e.currentTarget) {
                    setIsMobileMenuOpen(false);
                  }
                }}
              >
                <SidebarContent isMobile={true} />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 z-[60]">
                  <X className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="relative pb-20 lg:pb-0">
            <div className="pointer-events-none absolute inset-0 animate-shimmer opacity-10 dark:opacity-5" />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        {/* Theme toggle floating on desktop */}
        <div className="hidden lg:block fixed top-4 right-4 z-40">
          <ThemeToggle />
        </div>

        {/* Bottom Navigation - Only show on mobile for authenticated users */}
        <BottomNavigation key={`bottom-nav-${isMobileMenuOpen}`} isMobileMenuOpen={isMobileMenuOpen} />
      </div>
    </ErrorBoundary>
  );
}

type NavItemProps = { item: any; isCollapsed: boolean; isActive: boolean }
const NavItem = ({ item, isCollapsed, isActive }: NavItemProps) => {
  const handleClick = (e) => {
    if (item.action) {
      e.preventDefault(); // Prevent default link navigation if an action is defined
      item.action();
    }
  };

  return (
    <Link
      to={item.url}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        "text-slate-600 hover:bg-slate-200 hover:text-slate-900",
        isActive && "bg-slate-200/80 text-slate-900",
        isCollapsed ? "justify-center h-12" : "gap-3 px-3 py-2"
      )}
      title={item.title}
    >
      <div className="relative flex items-center">
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute -left-2.5 h-6 w-1 bg-lime-400 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "")} />
      </div>
      {!isCollapsed && <span className="flex-1">{item.title}</span>}
    </Link>
  );
};

