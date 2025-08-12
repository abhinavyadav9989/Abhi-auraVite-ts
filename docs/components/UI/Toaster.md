## Toaster

Source: `src/components/ui/toaster.tsx`

Renders active toasts using the `useToast` store. Place once near app root.

### Example
```tsx
import { Toaster } from '@/components/ui/toaster';

export function AppChrome({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```