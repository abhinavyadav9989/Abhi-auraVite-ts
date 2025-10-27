## Toast Primitives and Hook

Sources: `src/components/ui/toast.tsx`, `src/components/ui/use-toast.tsx`, `src/components/ui/toaster.tsx`

### Primitives
- `ToastProvider`, `ToastViewport`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastClose`, `ToastAction`

### Hook and API
- `useToast()` returns `{ toasts, toast, dismiss }`
- `toast({ title?, description?, action?, ...props })` returns `{ id, dismiss, update }`

### Usage
Add `Toaster` once near the app root:
```tsx
import { Toaster } from '@/components/ui/toaster';

function Root() {
  return <Toaster />;
}
```

Trigger a toast:
```tsx
import { useToast } from '@/components/ui/use-toast';

function SaveButton() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.' })}>
      Save
    </button>
  );
}
```