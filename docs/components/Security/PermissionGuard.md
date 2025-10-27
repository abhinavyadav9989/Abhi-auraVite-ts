## PermissionGuard and Permissions

Source: `src/components/security/PermissionGuard.tsx`

### Permission Strings
Examples: `vehicle.create`, `vehicle.edit`, `deal.manage`, `admin.access`, `profile.edit`, etc.

### hasPermission(userRole, dealerRole, permission)
Returns boolean access.

### usePermissions()
Fetches and resolves `{ userRole, dealerRole, isLoading, hasPermission }`.

### PermissionGuard Component
Props:
- `permission: string`
- `children?: React.ReactNode`
- `fallback?: React.ReactNode`
- `showMessage?: boolean`

```tsx
import PermissionGuard from '@/components/security/PermissionGuard';

<PermissionGuard permission="admin.access" fallback={<div>Not allowed</div>}>
  <AdminPanel />
</PermissionGuard>
```