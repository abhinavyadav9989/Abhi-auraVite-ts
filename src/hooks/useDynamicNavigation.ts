import { useMemo } from 'react';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Package,
  Search,
  Handshake,
  Heart,
  BarChart2,
  TrendingUp,
  FileText,
  AlertTriangle,
  Shield,
  Settings,
  Truck,
  CheckCircle,
  Upload,
  Database,
  Palette,
  Building2,
  Wrench,
  Users
} from 'lucide-react';
import { useDealerActivationSettings } from './useDealerActivationSettings';

// Define the navigation item interface
export interface NavigationItem {
  title: string;
  url: string;
  icon: any; // Lucide icon component
  alwaysVisible?: boolean;
  description: string;
  featureRequirement?: string;
  fallbackTitle?: string;
  // Properties added dynamically
  isVisible?: boolean;
  isLocked?: boolean;
}

// Define all possible navigation items with their activation requirements
const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    alwaysVisible: true,
    description: "Overview of your business"
  },
  {
    title: "My Inventory",
    url: createPageUrl("Inventory"),
    icon: Package,
    alwaysVisible: true,
    description: "Manage your vehicle inventory"
  },
  {
    title: "Marketplace",
    url: createPageUrl("Marketplace"),
    icon: Search,
    alwaysVisible: true,
    description: "Browse and search vehicles"
  },
  {
    title: "My Deals",
    url: createPageUrl("Deals"),
    icon: Handshake,
    alwaysVisible: true,
    description: "Track your deals and negotiations"
  },
  {
    title: "Shortlists",
    url: createPageUrl("Shortlists"),
    icon: Heart,
    alwaysVisible: true,
    description: "Saved vehicles and favorites"
  },
  {
    title: "Analytics",
    url: createPageUrl("InventoryAnalytics"),
    icon: BarChart2,
    featureRequirement: 'analytics',
    fallbackTitle: "Analytics (Advanced)",
    description: "Advanced analytics and reporting"
  },
  {
    title: "Market Trends",
    url: createPageUrl("MarketTrends"),
    icon: TrendingUp,
    featureRequirement: 'analytics',
    fallbackTitle: "Market Trends (Advanced)",
    description: "Market insights and trends"
  },
  {
    title: "Inspection Workflows",
    url: createPageUrl("Inventory?tab=inspections"),
    icon: CheckCircle,
    featureRequirement: 'inspections',
    fallbackTitle: "Inspections (Advanced)",
    description: "Professional inspection templates"
  },
  {
    title: "Transfers & Logistics",
    url: createPageUrl("Inventory?tab=transfers"),
    icon: Truck,
    featureRequirement: 'driver_assignment',
    fallbackTitle: "Transfers (Advanced)",
    description: "Advanced transfer and logistics management"
  },
  {
    title: "Bulk Operations",
    url: createPageUrl("BulkImport"),
    icon: Upload,
    featureRequirement: 'bulk_operations',
    fallbackTitle: "Bulk Import (Advanced)",
    description: "Large-scale data operations"
  },
  {
    title: "Branch Management",
    url: createPageUrl("settings?tab=branches"),
    icon: Building2,
    featureRequirement: 'unlimited_branches',
    fallbackTitle: "Branches (Advanced)",
    description: "Advanced branch hierarchy and management"
  },
  {
    title: "Approvals",
    url: createPageUrl("Inventory?tab=approvals"),
    icon: FileText,
    featureRequirement: 'approvals',
    fallbackTitle: "Approvals (Advanced)",
    description: "Multi-stage approval workflows"
  },
  {
    title: "Team Management",
    url: createPageUrl("settings?tab=team"),
    icon: Users,
    featureRequirement: 'unlimited_branches',
    fallbackTitle: "Team (Advanced)",
    description: "Advanced team and role management"
  },
  {
    title: "Branding & Themes",
    url: createPageUrl("settings?tab=theming"),
    icon: Palette,
    featureRequirement: 'branch_theming',
    fallbackTitle: "Branding (Advanced)",
    description: "Custom branding and theming"
  }
];

// Admin navigation items - unchanged
const ADMIN_NAVIGATION_ITEMS = [
  { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: Shield },
  { title: "KYB Verification", url: createPageUrl("AdminKYBVerification"), icon: FileText },
  { title: "Dispute Resolution", url: createPageUrl("DisputeResolution"), icon: AlertTriangle },
  { title: "Audit Log", url: createPageUrl("AdminAuditLog"), icon: FileText },
];

export const useDynamicNavigation = () => {
  const { checkFeatureAccess, activationStatus, isLoading } = useDealerActivationSettings();

  const navigationItems = useMemo(() => {
    if (isLoading) {
      // Return only always-visible items during loading
      return ALL_NAVIGATION_ITEMS.filter(item => item.alwaysVisible).map(item => ({
        ...item,
        isVisible: true,
        isLocked: false
      }));
    }

    return ALL_NAVIGATION_ITEMS.map(item => {
      if (item.alwaysVisible) {
        return {
          ...item,
          isVisible: true,
          isLocked: false
        };
      }

      // Check if the feature is unlocked
      const isFeatureUnlocked = item.featureRequirement
        ? checkFeatureAccess(item.featureRequirement)
        : true;

      return {
        ...item,
        isVisible: isFeatureUnlocked,
        title: isFeatureUnlocked ? item.title : (item.fallbackTitle || item.title),
        isLocked: !isFeatureUnlocked
      };
    }).filter(item => item.isVisible !== false);
  }, [checkFeatureAccess, activationStatus, isLoading]);

  const getFeatureStatus = (featureId: string) => {
    return checkFeatureAccess(featureId);
  };

  const getNextUpgradeFeature = () => {
    const lockedItems = ALL_NAVIGATION_ITEMS.filter(item =>
      item.featureRequirement && !checkFeatureAccess(item.featureRequirement)
    );

    return lockedItems.length > 0 ? lockedItems[0] : null;
  };

  return {
    navigationItems,
    adminNavigationItems: ADMIN_NAVIGATION_ITEMS,
    getFeatureStatus,
    getNextUpgradeFeature,
    activationStatus,
    isLoading
  };
};

