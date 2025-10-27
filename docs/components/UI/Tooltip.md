## Tooltip

Source: `src/components/ui/tooltip.tsx`

### Exports
- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`

### Example
```tsx
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Helpful info</TooltipContent>
  </Tooltip>
</TooltipProvider>
```