## Collapsible

Source: `src/components/ui/collapsible.tsx`

Controlled collapsible primitives.

### Exports
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`

### Example
```tsx
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

function Section() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={() => setOpen(!open)}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Hidden content</CollapsibleContent>
    </Collapsible>
  );
}
```