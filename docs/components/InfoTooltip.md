## InfoTooltip

Source: `src/components/ui/InfoTooltip.tsx`

Small helper that shows an info icon with tooltip content.

### Props
- `children: React.ReactNode` — tooltip content
- `side?: 'top' | 'right' | 'bottom' | 'left'` — default `'top'`

### Example
```tsx
import InfoTooltip from '@/components/ui/InfoTooltip';

<label>
  Price
  <InfoTooltip>MRP before taxes and discounts.</InfoTooltip>
</label>
```