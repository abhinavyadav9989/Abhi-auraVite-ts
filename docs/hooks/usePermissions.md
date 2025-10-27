## Permissions

Source: `src/components/security/PermissionGuard.tsx`

### hasPermission(userRole, dealerRole, permission)
Checks access based on predefined permission map.

```ts
import { hasPermission } from '@/components/security/PermissionGuard';

const canEdit = hasPermission('staff', 'owner', 'vehicle.edit');
```

### usePermissions()
Returns `{ userRole, dealerRole, isLoading, hasPermission }` after fetching the current user and dealer role.

```tsx
import { usePermissions } from '@/components/security/PermissionGuard';

function AdminOnly({ children }) {
  const { hasPermission, isLoading } = usePermissions();
  if (isLoading) return null;
  return hasPermission('admin.access') ? children : null;
}
```

### PermissionGuard Component
Wrap children and render only when permission passes; optional `fallback` and `showMessage`.

```tsx
import PermissionGuard from '@/components/security/PermissionGuard';

<PermissionGuard permission="deal.manage" showMessage>
  <button>Manage Deal</button>
</PermissionGuard>
```