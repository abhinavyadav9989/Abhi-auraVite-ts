# 📋 File Conversion Plan: Vite to Next.js Migration

## **🎯 Priority 1: Core Application Files (Must Convert First)**

### **1.1 Entry Point Files**
**Current Location** → **New Location** → **Conversion Required**

#### **🚨 HIGH PRIORITY - App Entry**
- `src/main.tsx` → `src/app/layout.tsx` → **MAJOR CONVERSION**
- `src/App.tsx` → `src/app/page.tsx` → **MAJOR CONVERSION**
- `src/index.css` → `src/app/globals.css` → **MINOR CONVERSION**

#### **🚨 HIGH PRIORITY - Configuration**
- `vite.config.ts` → `next.config.js` → **MAJOR CONVERSION**
- `tsconfig.json` → `tsconfig.json` → **MINOR CONVERSION**
- `package.json` → `package.json` → **MINOR CONVERSION**

### **1.2 Authentication System (Critical)**
- `src/hooks/useAuth.tsx` → `src/lib/auth.ts` → **MAJOR CONVERSION**
- `src/api/supabaseClient.ts` → `src/lib/supabase/client.ts` → **MAJOR CONVERSION**
- `src/components/auth/AuthGuard.tsx` → `src/components/providers/AuthProvider.tsx` → **MAJOR CONVERSION**

## **🎯 Priority 2: Routing Migration (Pages → App Router)**

### **2.1 Main Routes (Convert to App Router)**
**Current** → **New** → **Conversion Type**

#### **🔴 CRITICAL ROUTES**
- `src/pages/index.tsx` → `src/app/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Authentication.tsx` → `src/app/auth/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Dashboard.tsx` → `src/app/dashboard/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Layout.tsx` → `src/app/(dashboard)/layout.tsx` → **MAJOR CONVERSION**

#### **🟡 IMPORTANT ROUTES**
- `src/pages/Inventory.tsx` → `src/app/inventory/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Marketplace.tsx` → `src/app/marketplace/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Profile.tsx` → `src/app/profile/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Settings.tsx` → `src/app/settings/page.tsx` → **MAJOR CONVERSION**

#### **🟢 ADMIN ROUTES**
- `src/pages/AdminPanel.tsx` → `src/app/admin/page.tsx` → **MAJOR CONVERSION**
- `src/pages/AdminDashboard.tsx` → `src/app/admin/dashboard/page.tsx` → **MAJOR CONVERSION**
- `src/pages/AdminUsers.tsx` → `src/app/admin/users/page.tsx` → **MAJOR CONVERSION**
- `src/pages/AdminKYBVerification.tsx` → `src/app/admin/kyb/page.tsx` → **MAJOR CONVERSION**
- `src/pages/AdminAuditLog.tsx` → `src/app/admin/audit/page.tsx` → **MAJOR CONVERSION**

#### **🔵 VEHICLE ROUTES**
- `src/pages/AddVehicle.tsx` → `src/app/vehicles/add/page.tsx` → **MAJOR CONVERSION**
- `src/pages/EditVehicle.tsx` → `src/app/vehicles/[id]/edit/page.tsx` → **MAJOR CONVERSION**
- `src/pages/VehicleDetail.tsx` → `src/app/vehicles/[id]/page.tsx` → **MAJOR CONVERSION**
- `src/pages/VehicleView.tsx` → `src/app/vehicles/[id]/view/page.tsx` → **MAJOR CONVERSION**
- `src/pages/PublicVehicleView.tsx` → `src/app/vehicles/[id]/public/page.tsx` → **MAJOR CONVERSION**

#### **🟣 DEAL ROUTES**
- `src/pages/Deals.tsx` → `src/app/deals/page.tsx` → **MAJOR CONVERSION**
- `src/pages/DealRoom.tsx` → `src/app/deals/[id]/room/page.tsx` → **MAJOR CONVERSION**
- `src/pages/DisputeResolution.tsx` → `src/app/deals/disputes/page.tsx` → **MAJOR CONVERSION**

#### **🟠 ANALYTICS ROUTES**
- `src/pages/InventoryAnalytics.tsx` → `src/app/analytics/inventory/page.tsx` → **MAJOR CONVERSION**
- `src/pages/MarketTrends.tsx` → `src/app/analytics/trends/page.tsx` → **MAJOR CONVERSION**

#### **⚪ OTHER ROUTES**
- `src/pages/OnboardingWizard.tsx` → `src/app/onboarding/page.tsx` → **MAJOR CONVERSION**
- `src/pages/KYBWizard.tsx` → `src/app/kyb/page.tsx` → **MAJOR CONVERSION**
- `src/pages/EmailVerification.tsx` → `src/app/verify/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Compare.tsx` → `src/app/compare/page.tsx` → **MAJOR CONVERSION**
- `src/pages/Shortlists.tsx` → `src/app/shortlists/page.tsx` → **MAJOR CONVERSION**
- `src/pages/TaskBoard.tsx` → `src/app/tasks/page.tsx` → **MAJOR CONVERSION**
- `src/pages/BulkImport.tsx` → `src/app/import/page.tsx` → **MAJOR CONVERSION**
- `src/pages/LogisticsTracker.tsx` → `src/app/logistics/page.tsx` → **MAJOR CONVERSION**
- `src/pages/ProvisionalExtensions.tsx` → `src/app/extensions/page.tsx` → **MAJOR CONVERSION**
- `src/pages/DataMigrationPanel.tsx` → `src/app/migration/page.tsx` → **MAJOR CONVERSION**
- `src/pages/OnboardingPath.tsx` → `src/app/onboarding/path/page.tsx` → **MAJOR CONVERSION**
- `src/pages/AuthTest.tsx` → `src/app/test/auth/page.tsx` → **MAJOR CONVERSION**

## **🎯 Priority 3: Component Migration**

### **3.1 Components That Need 'use client' Directive**
**All these need `'use client'` at the top:**

#### **🔴 AUTHENTICATION COMPONENTS**
- `src/components/auth/LoginForm.tsx` → **ADD 'use client'**
- `src/components/auth/RegisterForm.tsx` → **ADD 'use client'**
- `src/components/auth/AuthGuard.tsx` → **ADD 'use client'**

#### **🟡 FORM COMPONENTS**
- `src/components/onboarding/OnboardingWizard.tsx` → **ADD 'use client'**
- `src/components/kyb/KYBWizard.tsx` → **ADD 'use client'**
- `src/components/listing-wizard/*.tsx` → **ADD 'use client'** (all files)

#### **🟢 INTERACTIVE COMPONENTS**
- `src/components/dashboard/*.tsx` → **ADD 'use client'** (most files)
- `src/components/marketplace/*.tsx` → **ADD 'use client'** (most files)
- `src/components/inventory/*.tsx` → **ADD 'use client'** (most files)
- `src/components/deals/*.tsx` → **ADD 'use client'** (most files)
- `src/components/profile/*.tsx` → **ADD 'use client'** (most files)

#### **🔵 HOOKS**
- `src/hooks/useAuth.tsx` → **CONVERT TO PROVIDER**
- `src/hooks/use-mobile.tsx` → **ADD 'use client'**

### **3.2 Components That Can Stay Server Components**
**These can remain as server components:**
- `src/components/ui/*.tsx` → **NO CHANGES** (most UI components)
- `src/components/ErrorBoundary.tsx` → **ADD 'use client'**
- `src/components/formatters.tsx` → **NO CHANGES**

## **🎯 Priority 4: API and Data Layer**

### **4.1 Supabase Integration**
- `src/api/supabaseClient.ts` → `src/lib/supabase/client.ts` → **MAJOR CONVERSION**
- `src/api/supabaseClient.ts` → `src/lib/supabase/server.ts` → **NEW FILE**
- `src/api/onboardingAPI.ts` → `src/lib/api/onboarding.ts` → **MINOR CONVERSION**
- `src/api/integrationAdapters.ts` → `src/lib/api/integrations.ts` → **MINOR CONVERSION**
- `src/api/entityAdapters.ts` → `src/lib/api/entities.ts` → **MINOR CONVERSION**
- `src/api/entities.ts` → `src/lib/types/entities.ts` → **MINOR CONVERSION**
- `src/api/base44Client.ts` → `src/lib/api/base44.ts` → **MINOR CONVERSION**

### **4.2 New API Routes (Next.js Feature)**
**Create these new files:**
- `src/app/api/auth/[...nextauth]/route.ts` → **NEW FILE**
- `src/app/api/vehicles/route.ts` → **NEW FILE**
- `src/app/api/deals/route.ts` → **NEW FILE**
- `src/app/api/users/route.ts` → **NEW FILE**

## **🎯 Priority 5: Configuration and Utilities**

### **5.1 Configuration Files**
- `vite.config.ts` → `next.config.js` → **MAJOR CONVERSION**
- `tailwind.config.js` → `tailwind.config.js` → **MINOR CONVERSION**
- `postcss.config.js` → `postcss.config.js` → **MINOR CONVERSION**
- `eslint.config.js` → `.eslintrc.json` → **MINOR CONVERSION**
- `components.json` → `components.json` → **NO CHANGES**

### **5.2 Environment Variables**
- `.env` → `.env.local` → **MINOR CONVERSION** (VITE_ → NEXT_PUBLIC_)

### **5.3 Utility Files**
- `src/lib/utils.ts` → `src/lib/utils.ts` → **NO CHANGES**
- `src/utils/index.ts` → `src/lib/utils/index.ts` → **MINOR CONVERSION**

## **🎯 Priority 6: Type Definitions**

### **6.1 Type Files**
- `src/vite-env.d.ts` → `src/types/next-env.d.ts` → **MINOR CONVERSION**
- Create `src/types/supabase.ts` → **NEW FILE**
- Create `src/types/auth.ts` → **NEW FILE**

## **📊 Conversion Summary**

### **🔴 CRITICAL (Must Convert First)**
- **4 files** - App entry points and auth system
- **35+ page files** - All routing migration
- **3 config files** - Build and environment setup

### **🟡 HIGH PRIORITY**
- **50+ component files** - Add 'use client' directive
- **7 API files** - Supabase and data layer migration
- **5 config files** - Project configuration

### **🟢 MEDIUM PRIORITY**
- **20+ component files** - Interactive components
- **5 utility files** - Helper functions and types

### **🔵 LOW PRIORITY**
- **30+ UI component files** - Most can stay as-is
- **5+ utility files** - Simple conversions

## **🚀 Recommended Migration Order**

### **Phase 1: Foundation (Week 1)**
1. Create Next.js project
2. Convert entry points (`main.tsx`, `App.tsx`)
3. Migrate authentication system
4. Set up basic routing structure

### **Phase 2: Core Routes (Week 2)**
1. Convert main pages (Dashboard, Auth, Inventory, Marketplace)
2. Set up layout structure
3. Migrate navigation components

### **Phase 3: Feature Routes (Week 3)**
1. Convert admin pages
2. Convert vehicle-related pages
3. Convert deal-related pages

### **Phase 4: Components (Week 4)**
1. Add 'use client' to interactive components
2. Migrate API layer
3. Update data fetching patterns

### **Phase 5: Polish (Week 5)**
1. Test all functionality
2. Optimize performance
3. Deploy and monitor

## **⚠️ Key Conversion Patterns**

### **1. Navigation Changes**
```tsx
// OLD (React Router)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')

// NEW (Next.js)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')
```

### **2. Client Component Declaration**
```tsx
// Add to all interactive components
'use client'

import React from 'react'
// ... rest of component
```

### **3. Data Fetching**
```tsx
// OLD (Client-side)
const { data } = await supabase.from('vehicles').select('*')

// NEW (Server-side in pages)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createServerComponentClient({ cookies })
const { data } = await supabase.from('vehicles').select('*')
```

Would you like me to help you start with any specific phase or create detailed conversion scripts for particular files?
