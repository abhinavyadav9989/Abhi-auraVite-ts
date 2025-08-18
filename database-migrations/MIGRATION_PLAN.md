# Vite to Next.js Migration Plan

## **🚀 Phase 1: Project Setup**

### **1.1 Create New Next.js Project**
```bash
npx create-next-app@latest base44-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd base44-nextjs
```

### **1.2 Install Dependencies**
```bash
# Core dependencies
npm install @supabase/supabase-js
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot
npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle
npm install @radix-ui/react-toggle-group @radix-ui/react-tooltip

# UI and utilities
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react framer-motion
npm install react-hook-form @hookform/resolvers zod
npm install date-fns react-day-picker
npm install sonner next-themes
npm install recharts leaflet react-leaflet
npm install @hello-pangea/dnd embla-carousel-react
npm install input-otp vaul cmdk
npm install react-resizable-panels

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
```

## **🔄 Phase 2: File Structure Migration**

### **2.1 Directory Structure Changes**

**Current (Vite):**
```
src/
├── components/
├── pages/
├── hooks/
├── lib/
├── api/
└── utils/
```

**New (Next.js):**
```
src/
├── app/                    # App Router (replaces pages/)
│   ├── (auth)/            # Route groups
│   ├── (dashboard)/
│   ├── api/               # API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Same structure
├── hooks/                 # Same structure
├── lib/                   # Same structure
└── utils/                 # Same structure
```

### **2.2 Key File Migrations**

#### **App Entry Point**
**Current:** `src/main.tsx`
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
```

**New:** `src/app/layout.tsx`
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Base44 - Vehicle Marketplace',
  description: 'Modern vehicle marketplace platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### **Main Page**
**Current:** `src/App.tsx`
```tsx
import React from 'react'
import './App.css'
import Pages from './pages'
import { Toaster } from 'sonner'
import AuthGuard from './components/auth/AuthGuard'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <AuthGuard>
        <Pages />
      </AuthGuard>
      <Toaster />
    </Router>
  )
}
```

**New:** `src/app/page.tsx`
```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  redirect('/dashboard')
}
```

## **🛣️ Phase 3: Routing Migration**

### **3.1 Route Structure Mapping**

**Current React Router Routes:**
```tsx
<Route path="/" element={<Dashboard />} />
<Route path="/Dashboard" element={<Dashboard />} />
<Route path="/Inventory" element={<Inventory />} />
<Route path="/Marketplace" element={<Marketplace />} />
<Route path="/Profile" element={<Profile />} />
<Route path="/Authentication" element={<Authentication />} />
```

**New Next.js App Router:**
```
src/app/
├── page.tsx                    # / (redirects to dashboard or auth)
├── auth/
│   └── page.tsx               # /auth
├── dashboard/
│   └── page.tsx               # /dashboard
├── inventory/
│   └── page.tsx               # /inventory
├── marketplace/
│   └── page.tsx               # /marketplace
├── profile/
│   └── page.tsx               # /profile
└── (dashboard)/               # Route group for authenticated pages
    ├── layout.tsx             # Shared layout for dashboard pages
    ├── deals/
    │   └── page.tsx           # /deals
    ├── admin/
    │   └── page.tsx           # /admin
    └── settings/
        └── page.tsx           # /settings
```

### **3.2 Navigation Component Updates**

**Current:** Using `useNavigate` from React Router
```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/dashboard')
```

**New:** Using Next.js navigation
```tsx
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/dashboard')
```

## **🔧 Phase 4: Component Migration**

### **4.1 Client vs Server Components**

**Next.js App Router** uses **Server Components** by default. Components that need interactivity must be marked as **Client Components**.

**Current:** All components are client-side
```tsx
// src/components/auth/LoginForm.tsx
export function LoginForm() {
  // Component logic
}
```

**New:** Mark interactive components as client
```tsx
'use client'

// src/components/auth/LoginForm.tsx
export function LoginForm() {
  // Component logic
}
```

### **4.2 Data Fetching Migration**

**Current:** Client-side data fetching
```tsx
// In components
const { data, error } = await supabase.from('vehicles').select('*')
```

**New:** Server-side data fetching (for server components)
```tsx
// In page.tsx (server component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: vehicles } = await supabase.from('vehicles').select('*')
  
  return <Dashboard vehicles={vehicles} />
}
```

## **⚙️ Phase 5: Configuration Updates**

### **5.1 Environment Variables**

**Current:** Vite environment variables
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

**New:** Next.js environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### **5.2 Configuration Files**

**Current:** `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

**New:** `next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-domain.supabase.co'],
  },
}

module.exports = nextConfig
```

## **🔐 Phase 6: Authentication Migration**

### **6.1 Supabase Client Setup**

**Current:** Direct Supabase client
```tsx
// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**New:** Next.js optimized Supabase client
```tsx
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createClientComponentClient()
}

// src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
```

### **6.2 Auth Provider Migration**

**Current:** Custom auth hook
```tsx
// src/hooks/useAuth.tsx
export function useAuth() {
  // Auth logic
}
```

**New:** Next.js auth helpers
```tsx
// src/components/providers/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const supabase = createClientComponentClient()
  // Auth logic
}
```

## **📦 Phase 7: Build & Deploy**

### **7.1 Build Commands**

**Current:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**New:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### **7.2 Deployment**

**Current:** Vite static build
- Builds to `dist/` folder
- Deploy static files

**New:** Next.js deployment
- Builds optimized server/client bundles
- Deploy to Vercel, Netlify, or self-hosted

## **🎯 Migration Benefits**

### **✅ Advantages of Next.js**
1. **Better SEO** - Server-side rendering
2. **Faster Loading** - Automatic code splitting
3. **Better Performance** - Image optimization, caching
4. **Simpler Routing** - File-based routing
5. **API Routes** - Built-in API endpoints
6. **Better DX** - Hot reloading, error boundaries

### **⚠️ Migration Challenges**
1. **Learning Curve** - Server vs Client components
2. **Routing Changes** - Different navigation patterns
3. **Data Fetching** - Server-side vs client-side
4. **Build Process** - Different optimization strategies

## **📋 Migration Checklist**

- [ ] Create new Next.js project
- [ ] Install all dependencies
- [ ] Set up environment variables
- [ ] Migrate routing structure
- [ ] Convert components to client/server
- [ ] Update data fetching patterns
- [ ] Migrate authentication system
- [ ] Test all functionality
- [ ] Optimize for production
- [ ] Deploy to hosting platform

## **🚀 Next Steps**

1. **Start with Phase 1** - Set up the new Next.js project
2. **Migrate one route at a time** - Don't try to migrate everything at once
3. **Test thoroughly** - Ensure each migrated feature works
4. **Optimize gradually** - Take advantage of Next.js features

Would you like me to help you start with any specific phase of the migration?
