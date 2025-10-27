## VehicleCategoryValidator

Source: `src/components/vehicle-safety/VehicleCategoryValidator.tsx`

### Exports
- `validateVehicleCategories(categories)` → `{ isValid, validCategories, invalidCategories }`
- `validateCustomAttributes(categories, customAttributes)` → `{ isValid, errors, warnings }`
- `getCategoryRequiredFields(categories)` → `Record<fieldName, schema & { category }>`
- `getAvailableCategories()` → string[]
- `getCategorySchema(category)` → schema object
- `ValidationErrors` — component that renders validation errors

### Example
```ts
import { 
  validateVehicleCategories,
  validateCustomAttributes,
  getCategoryRequiredFields,
  getAvailableCategories
} from '@/components/vehicle-safety/VehicleCategoryValidator';

const cats = ['Electric'];
const catRes = validateVehicleCategories(cats);
const attrsRes = validateCustomAttributes(cats, { battery_health: 95, range_km: 250 });
```

### UI Errors
```tsx
import { ValidationErrors } from '@/components/vehicle-safety/VehicleCategoryValidator';

<ValidationErrors errors={{ range_km: 'Range must be at least 50' }} />
```