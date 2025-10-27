## useAppConfig

Source: `src/components/useAppConfig.tsx`

Loads app configuration from `AppConfig` entity with sensible defaults.

### Signature
`useAppConfig(configType?: string | null)` returns:
- `configs: Record<string, any>` — merged with defaults
- `isLoading: boolean`
- `error: any`
- `getConfig(key, defaultValue?)`

### Example
```tsx
import { useAppConfig } from '@/components/useAppConfig';

function InspectionChecklist() {
  const { configs, isLoading, getConfig } = useAppConfig('inspection');
  if (isLoading) return null;
  const categories = getConfig('inspection_categories', []);
  return <pre>{JSON.stringify(categories, null, 2)}</pre>;
}
```