

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
import {
  LayoutDashboard, Car, Search, Handshake, Heart, User, Bell, Menu, X, BarChart2,
  Shield, Settings, LogOut, Loader2, WifiOff, Package, TrendingUp, FileText, AlertTriangle, ChevronLeft
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "My Inventory", url: createPageUrl("Inventory"), icon: Package },
  { title: "Marketplace", url: createPageUrl("Marketplace"), icon: Search },
  { title: "My Deals", url: createPageUrl("Deals"), icon: Handshake },
  { title: "Shortlists", url: createPageUrl("Shortlists"), icon: Heart },
  { title: "Analytics", url: createPageUrl("InventoryAnalytics"), icon: BarChart2 },
  { title: "Market Trends", url: createPageUrl("MarketTrends"), icon: TrendingUp },
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

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
    loadUserData();
  }, []);

  const loadUserData = async () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center border-b border-slate-200", isCollapsed ? "justify-center h-16" : "justify-between h-16 px-4")}>
        {!isCollapsed && (
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900">Aura</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="hidden lg:flex">
          <ChevronLeft className={cn("w-5 h-5 transition-transform text-slate-600", isCollapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.title} item={item} isCollapsed={isCollapsed} isActive={location.pathname === item.url} />
        ))}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-slate-200">
            <h3 className={cn("text-xs font-semibold text-slate-500 uppercase", isCollapsed ? "text-center" : "px-2")}>Admin</h3>
            <div className="space-y-2 mt-2">
            {adminNavigationItems.map((item) => (
              <NavItem key={item.title} item={item} isCollapsed={isCollapsed} isActive={location.pathname === item.url} />
            ))}
            </div>
          </div>
        )}
      </nav>
      <div className="px-2 py-4 mt-auto border-t border-slate-200">
        <NavItem item={{ title: "Profile", url: createPageUrl("Profile"), icon: User }} isCollapsed={isCollapsed} isActive={location.pathname === createPageUrl("Profile")} />
        <NavItem item={{ title: "Settings", url: createPageUrl("Settings"), icon: Settings }} isCollapsed={isCollapsed} isActive={location.pathname === createPageUrl("Settings")} />
        <NavItem item={{ title: "Logout", url: "#", icon: LogOut, action: handleLogout }} isCollapsed={isCollapsed} isActive={false} />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <aside className={cn(
          "hidden lg:block fixed top-0 left-0 h-full z-30 bg-white/70 backdrop-blur-sm border-r border-slate-200 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}>
          <SidebarContent />
        </aside>

        <div className={cn("transition-all duration-300", isCollapsed ? "lg:ml-20" : "lg:ml-64")}>
          <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white/70 backdrop-blur-sm border-b border-slate-200">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              <span className="font-bold">Aura</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
          </header>
          
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="lg:hidden fixed inset-0 z-40 h-screen bg-white"
              >
                <SidebarContent />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4">
                  <X className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <main>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
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

