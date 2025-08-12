## useIsMobile

Source: `src/hooks/use-mobile.tsx`

Returns `true` on small screens (`< 768px`) based on a media query listener.

### Example
```tsx
import { useIsMobile } from '@/hooks/use-mobile';

function ResponsiveOnly({ children }) {
  const isMobile = useIsMobile();
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}
```