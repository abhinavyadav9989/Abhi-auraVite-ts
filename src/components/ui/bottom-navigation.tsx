import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Home, 
  Car, 
  ShoppingCart, 
  Handshake, 
  Users,
  Grid3X3,
  List,
  CreditCard,
  Newspaper
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
    href: '/Dashboard'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    href: '/Inventory'
  },
  {
    id: 'feeds',
    label: 'Feeds',
    icon: Newspaper,
    href: '/Feeds'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    href: '/Marketplace'
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Handshake,
    href: '/Deals'
  }
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className, isMobileMenuOpen = false }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [measured, setMeasured] = useState(false);

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
    if (href === '/Dashboard') {
      return location.pathname === '/' || location.pathname === '/Dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const activeIndex = useMemo(() => {
    const idx = navigationItems.findIndex(i => isActive(i.href));
    return idx === -1 ? -1 : idx; // -1 means not on any of the 5 tabs
  }, [location.pathname]);

  // Use deterministic positioning: cell width = containerWidth / 5
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const RO = (window as any).ResizeObserver;
    const ro = RO ? new RO((entries: any[]) => {
      for (const entry of entries) {
        const w = entry.contentRect?.width || el.clientWidth || 0;
        setContainerWidth(w);
      }
    }) : null;
    // Fallback if ResizeObserver not available
    const measure = () => setContainerWidth(el.clientWidth || 0);
    measure();
    if (ro) ro.observe(el);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    setMeasured(true);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || containerWidth <= 0) { setIndicatorLeft(0); return; }
    const cell = containerWidth / 5;
    setIndicatorLeft((activeIndex + 0.5) * cell);
  }, [activeIndex, containerWidth]);

  if (!shouldShowBottomNav) {
    return null;
  }

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
      'px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2',
      className
    )}>
      <div
        className={cn(
          'relative max-w-md mx-auto rounded-2xl overflow-hidden',
          'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl',
          'border border-slate-200/60 dark:border-slate-800/60',
          'shadow-lg shadow-black/5 dark:shadow-black/20'
        )}
      >
        {/* Floating indicator circle (only on the 5 primary tabs) */}
        {activeIndex >= 0 && measured && (
          <motion.div
            className="pointer-events-none absolute top-0 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-300 ring-2 ring-blue-600/90 dark:ring-blue-400/90 shadow-md"
            initial={false}
            animate={{ x: Math.max(0, Math.min(Math.max(0, (containerWidth || 0) - 40), indicatorLeft - 20)) }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          />
        )}

        <div ref={containerRef} className="relative grid grid-cols-5">
          {navigationItems.map((item, idx) => {
            const active = activeIndex >= 0 && idx === activeIndex;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                data-nav-item="1"
                className={cn(
                  'relative flex flex-col items-center justify-center py-3',
                  'text-slate-600 dark:text-slate-400'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <motion.div
                  className="relative z-10 flex items-center justify-center w-6 h-6"
                  initial={false}
                  animate={{ y: active ? -6 : 0, scale: active ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                >
                  <Icon className={cn('w-5 h-5', active ? 'text-blue-700 dark:text-blue-900' : 'text-slate-700 dark:text-slate-300')} />
                </motion.div>
                <motion.span
                  className="mt-1 text-[11px] font-medium px-2"
                  initial={false}
                  animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
                  transition={{ duration: 0.2 }}
                >
                  {active ? item.label : ''}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
