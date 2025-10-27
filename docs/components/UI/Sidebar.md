## Sidebar

Source: `src/components/ui/sidebar.tsx`

### Exports
- `useSidebar()`
- `SidebarProvider` — context provider
- `Sidebar` — convenience wrapper around provider
- `SidebarBody` — renders desktop and mobile variants
- `DesktopSidebar`, `MobileSidebar`
- `SidebarLink`

### Example
```tsx
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Home } from 'lucide-react';

<Sidebar>
  <SidebarBody>
    <SidebarLink link={{ href: '/Dashboard', icon: <Home />, label: 'Dashboard' }} />
  </SidebarBody>
</Sidebar>
```