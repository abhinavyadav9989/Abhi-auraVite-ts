# Base44 Application - Comprehensive API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Client & Database Integration](#api-client--database-integration)
4. [Entity Adapters](#entity-adapters)
5. [Custom Hooks](#custom-hooks)
6. [UI Components](#ui-components)
7. [Utility Functions](#utility-functions)
8. [Pages & Routing](#pages--routing)
9. [Error Handling](#error-handling)
10. [Configuration Management](#configuration-management)

## Overview

Base44 is a comprehensive vehicle marketplace application built with React, TypeScript, and Supabase. The application provides a complete platform for vehicle dealers to manage inventory, handle transactions, and interact with customers.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Radix UI, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

## Authentication & Authorization

### useAuth Hook

The `useAuth` hook provides comprehensive authentication functionality using Supabase Auth.

#### Import
```typescript
import { useAuth } from '@/hooks/useAuth';
```

#### Usage
```typescript
function MyComponent() {
  const {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUser,
    clearError,
    refreshAuth,
    isAuthenticated
  } = useAuth();

  // Check authentication status
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

#### API Reference

| Property/Method | Type | Description |
|----------------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `session` | `Session \| null` | Current session data |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `isAuthenticated` | `boolean` | Authentication status |
| `signIn(email, password)` | `Promise<any>` | Sign in with email/password |
| `signUp(email, password)` | `Promise<any>` | Sign up new user |
| `signOut()` | `Promise<void>` | Sign out current user |
| `updateUser(data)` | `Promise<User>` | Update user profile |
| `clearError()` | `void` | Clear error state |
| `refreshAuth()` | `Promise<{user, session}>` | Refresh authentication state |

### AuthGuard Component

Protects routes that require authentication.

#### Usage
```typescript
import AuthGuard from '@/components/auth/AuthGuard';

function App() {
  return (
    <Router>
      <AuthGuard>
        <ProtectedRoutes />
      </AuthGuard>
    </Router>
  );
}
```

## API Client & Database Integration

### Supabase Client

The main database client for interacting with Supabase.

#### Import
```typescript
import { supabase } from '@/api/supabaseClient';
```

#### Configuration
The client is automatically configured with environment variables:
- `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Usage
```typescript
// Direct Supabase usage
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('dealer_id', dealerId);

if (error) {
  console.error('Error fetching vehicles:', error);
} else {
  console.log('Vehicles:', data);
}
```

## Entity Adapters

Entity adapters provide a consistent API for database operations across all entities.

### Available Entities

```typescript
import {
  Dealer,
  Vehicle,
  VehicleAsset,
  Transaction,
  Payment,
  LogisticsOrder,
  RTOApplication,
  BankAccount,
  DealerPreferences,
  UserSession,
  TeamMember,
  DealerDocument,
  DealerHours,
  DealerReview,
  DealerInquiry,
  AuditLog,
  Shortlist,
  VehicleInspection,
  AppConfig,
  User
} from '@/api/entities';
```

### Entity Adapter Methods

All entity adapters provide the following methods:

#### list(filters?)
```typescript
// Get all vehicles
const vehicles = await Vehicle.list();

// Get vehicles with filters
const filteredVehicles = await Vehicle.list({
  dealer_id: 'dealer-123',
  status: 'active'
});
```

#### get(id)
```typescript
// Get a specific vehicle
const vehicle = await Vehicle.get('vehicle-123');
```

#### create(data)
```typescript
// Create a new vehicle
const newVehicle = await Vehicle.create({
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  price: 2500000,
  dealer_id: 'dealer-123'
});
```

#### update(id, data)
```typescript
// Update a vehicle
const updatedVehicle = await Vehicle.update('vehicle-123', {
  price: 2400000,
  status: 'sold'
});
```

#### delete(id)
```typescript
// Delete a vehicle
await Vehicle.delete('vehicle-123');
```

#### filter(filters)
```typescript
// Advanced filtering with $or operator
const vehicles = await Vehicle.filter({
  $or: [
    { make: 'Toyota' },
    { make: 'Honda' }
  ],
  price: { gte: 1000000, lte: 5000000 }
});
```

### User Entity (Auth Adapter)

The User entity provides authentication-specific methods:

```typescript
// Get current user
const user = await User.me();

// Sign in with redirect
await User.loginWithRedirect('/dashboard');

// Sign out
await User.logout();

// Update user data
await User.updateMyUserData({
  full_name: 'John Doe',
  phone: '+91 9876543210'
});
```

## Custom Hooks

### useAppConfig Hook

Manages application configuration with fallback defaults.

#### Import
```typescript
import { useAppConfig } from '@/components/useAppConfig';
```

#### Usage
```typescript
function InspectionForm() {
  const { configs, isLoading, error, getConfig } = useAppConfig('inspection');

  if (isLoading) return <div>Loading config...</div>;
  if (error) return <div>Error loading config</div>;

  const categories = getConfig('inspection_categories', []);
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

#### API Reference

| Property/Method | Type | Description |
|----------------|------|-------------|
| `configs` | `object` | All configuration data |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `getConfig(key, defaultValue?)` | `any` | Get specific config value |

### useMobile Hook

Detects mobile device and provides responsive utilities.

#### Import
```typescript
import { useMobile } from '@/hooks/use-mobile';
```

#### Usage
```typescript
function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop } = useMobile();

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

## UI Components

### Button Component

A versatile button component with multiple variants and sizes.

#### Import
```typescript
import { Button } from '@/components/ui/button';
```

#### Usage
```typescript
// Default button
<Button>Click me</Button>

// Variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icons
<Button>
  <PlusIcon className="w-4 h-4" />
  Add Vehicle
</Button>
```

#### Variants
- `default`: Primary button with solid background
- `destructive`: Red button for destructive actions
- `outline`: Button with border and transparent background
- `secondary`: Secondary button with muted background
- `ghost`: Transparent button with hover effects
- `link`: Button styled as a link

#### Sizes
- `sm`: Small button (h-8, px-3)
- `default`: Default size (h-9, px-4)
- `lg`: Large button (h-10, px-8)
- `icon`: Square button for icons (h-9, w-9)

### Card Component

Container component for content sections.

#### Import
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

#### Usage
```typescript
<Card>
  <CardHeader>
    <CardTitle>Vehicle Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Vehicle information goes here</p>
  </CardContent>
</Card>
```

### Dialog Component

Modal dialog component for overlays.

#### Import
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
```

#### Usage
```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to proceed?</p>
  </DialogContent>
</Dialog>
```

### Form Components

Form components built with React Hook Form and Zod validation.

#### Import
```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
```

#### Usage
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
```

## Utility Functions

### Formatting Utilities

Centralized formatting functions for consistent data display.

#### Import
```typescript
import {
  formatCurrency,
  formatDate,
  formatKilometers,
  formatPhoneNumber,
  formatRegistrationNumber,
  formatFileSize,
  formatDuration,
  ensureArray,
  safeGet
} from '@/components/formatters';
```

#### Usage Examples

```typescript
// Currency formatting
formatCurrency(2500000); // "₹25L"
formatCurrency(2500000, { showDecimals: true }); // "₹25.00L"
formatCurrency(2500000, { shortForm: false }); // "₹25,00,000"

// Date formatting
formatDate('2024-01-15'); // "15/01/2024"
formatDate('2024-01-15', 'long'); // "15 January 2024"
formatDate('2024-01-15', 'datetime'); // "15/01/2024 12:00"

// Distance formatting
formatKilometers(50000); // "50K km"
formatKilometers(50000, { shortForm: true }); // "50K"

// Phone number formatting
formatPhoneNumber('9876543210'); // "98765 43210"
formatPhoneNumber('919876543210'); // "+91 98765 43210"

// Registration number formatting
formatRegistrationNumber('KA01AB1234'); // "KA 01 AB 1234"

// File size formatting
formatFileSize(1024); // "1.0 KB"
formatFileSize(1048576); // "1.0 MB"

// Duration formatting
formatDuration(90); // "1h 30m"
formatDuration(45); // "45m"

// Array utilities
ensureArray(null); // []
ensureArray('single'); // ['single']
ensureArray(['multiple']); // ['multiple']

// Safe property access
safeGet(user, 'profile.address.city', 'Unknown'); // Gets nested property safely
```

## Pages & Routing

### Route Structure

The application uses React Router with the following route structure:

```typescript
// Main routes
/                           -> Authentication
/Dashboard                  -> Main dashboard
/Inventory                  -> Vehicle inventory management
/Marketplace                -> Public vehicle marketplace
/Profile                    -> User profile management
/AddVehicle                 -> Add new vehicle
/VehicleDetail              -> Vehicle details view
/Deals                      -> Deal management
/DealRoom                   -> Deal room interface
/Settings                   -> Application settings

// Admin routes
/AdminPanel                 -> Admin panel
/AdminDashboard             -> Admin dashboard
/AdminAuditLog              -> Audit log viewer
/AdminKYBVerification       -> KYB verification

// Specialized routes
/InventoryAnalytics         -> Inventory analytics
/MarketTrends               -> Market trends analysis
/LogisticsTracker           -> Logistics tracking
/DisputeResolution          -> Dispute resolution
/KYBWizard                  -> KYB onboarding wizard
/OnboardingWizard           -> User onboarding
/BulkImport                 -> Bulk data import
/Shortlists                 -> Vehicle shortlists
/Compare                    -> Vehicle comparison
/EmailVerification          -> Email verification
```

### Page Components

Each page component follows a consistent pattern:

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Vehicle } from '@/api/entities';

function VehicleDetailPage() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load page data
    loadVehicleData();
  }, []);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const data = await Vehicle.get(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Page content */}
    </div>
  );
}

export default VehicleDetailPage;
```

## Error Handling

### ErrorBoundary Component

Global error boundary for catching and handling React errors.

#### Import
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';
```

#### Usage
```typescript
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthGuard>
          <Pages />
        </AuthGuard>
      </Router>
    </ErrorBoundary>
  );
}
```

#### Features
- Catches JavaScript errors in component trees
- Displays user-friendly error messages
- Shows technical details in development mode
- Provides retry functionality
- Logs errors for debugging

### Error Handling Patterns

```typescript
// API error handling
try {
  const data = await Vehicle.create(vehicleData);
  // Handle success
} catch (error) {
  console.error('Error creating vehicle:', error);
  // Show user-friendly error message
  toast.error('Failed to create vehicle. Please try again.');
}

// Form error handling
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {}
});

// Validation errors are automatically handled by React Hook Form
```

## Configuration Management

### Environment Variables

The application uses Vite environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=Base44
VITE_APP_VERSION=1.0.0
```

### App Configuration

Application settings are managed through the `AppConfig` entity:

```typescript
// Configuration types
const configTypes = {
  inspection_categories: 'array',
  notification_settings: 'object',
  feature_flags: 'object',
  business_rules: 'object'
};

// Default configurations
const defaultConfigs = {
  inspection_categories: [
    { id: 'exterior', name: 'Exterior Condition' },
    { id: 'interior', name: 'Interior Condition' },
    { id: 'engine', name: 'Engine & Mechanics' },
    { id: 'documents', name: 'Documentation' }
  ]
};
```

### Configuration Usage

```typescript
// In components
const { getConfig } = useAppConfig('inspection');
const categories = getConfig('inspection_categories', []);

// Direct API access
const configs = await AppConfig.filter({
  config_type: 'inspection',
  is_active: true
});
```

## Best Practices

### Component Development

1. **Use TypeScript**: All components should be written in TypeScript
2. **Follow naming conventions**: Use PascalCase for components, camelCase for functions
3. **Implement error boundaries**: Wrap components in error boundaries where appropriate
4. **Use custom hooks**: Extract reusable logic into custom hooks
5. **Implement loading states**: Always show loading indicators for async operations

### API Usage

1. **Use entity adapters**: Prefer entity adapters over direct Supabase calls
2. **Handle errors gracefully**: Always implement proper error handling
3. **Implement caching**: Use React Query or similar for data caching
4. **Validate data**: Use Zod schemas for data validation

### State Management

1. **Use React hooks**: Prefer useState and useEffect for local state
2. **Avoid prop drilling**: Use context or custom hooks for shared state
3. **Optimize re-renders**: Use React.memo and useMemo where appropriate
4. **Clean up effects**: Always clean up subscriptions and timers

### Performance

1. **Lazy load components**: Use React.lazy for code splitting
2. **Optimize images**: Use appropriate image formats and sizes
3. **Minimize bundle size**: Import only necessary dependencies
4. **Use virtualization**: For large lists, use virtualization libraries

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check Supabase configuration and environment variables
2. **Database connection issues**: Verify Supabase URL and API keys
3. **Component rendering errors**: Check for missing dependencies or incorrect imports
4. **Form validation errors**: Ensure Zod schemas match form data structure

### Debug Tools

1. **React Developer Tools**: For component debugging
2. **Supabase Dashboard**: For database and auth debugging
3. **Browser DevTools**: For network and console debugging
4. **Error Boundary**: For catching and displaying errors

### Support

For additional support or questions about the API, please refer to:
- React documentation: https://react.dev/
- Supabase documentation: https://supabase.com/docs
- Radix UI documentation: https://www.radix-ui.com/
- Tailwind CSS documentation: https://tailwindcss.com/docs