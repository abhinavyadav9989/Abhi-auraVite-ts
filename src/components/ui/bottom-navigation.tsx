import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Car, 
  ShoppingCart, 
  Handshake, 
  Users,
  Grid3X3,
  List,
  CreditCard
} from 'lucide-react';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive?: boolean;
}

interface BottomNavigationProps {
  className?: string;
  isMobileMenuOpen?: boolean;
}

const navigationItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Grid3X3,
    href: '/dashboard'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    href: '/inventory'
  },
  {
    id: 'market',
    label: 'Market',
    icon: ShoppingCart,
    href: '/marketplace'
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Handshake,
    href: '/deals'
  },
  {
    id: 'bank',
    label: 'Bank',
    icon: CreditCard,
    href: '/bank'
  }
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className, isMobileMenuOpen = false }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Define routes where bottom navigation should NOT be shown
  const authOnboardingRoutes = [
    '/Authentication',
    '/OnboardingWizard', 
    '/OnboardingWizard/',
    '/OnboardingWizard/PersonalDetails',
    '/OnboardingWizard/BusinessDetails',
    '/OnboardingWizard/Verification',
    '/OnboardingWizard/Complete'
  ];

  const shouldShowBottomNav = isAuthenticated && 
    !authOnboardingRoutes.includes(location.pathname) && 
    !isMobileMenuOpen;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Force re-render when mobile menu state changes
  useEffect(() => {
    // This effect ensures the component re-renders when isMobileMenuOpen changes
  }, [isMobileMenuOpen]);

  if (!shouldShowBottomNav) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
      "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
      "border-t border-white/20 dark:border-slate-700/30",
      "shadow-lg shadow-black/5 dark:shadow-black/20",
      "px-4 py-2",
      className
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-0 flex-1 py-2 px-1",
                "rounded-xl transition-all duration-200",
                "hover:bg-white/20 dark:hover:bg-slate-800/20",
                "active:scale-95",
                active && "bg-blue-500/10 dark:bg-blue-400/10"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                "w-6 h-6 mb-1 transition-colors duration-200",
                active 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}>
                <Icon className="w-5 h-5" />
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                "truncate max-w-full",
                active 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
