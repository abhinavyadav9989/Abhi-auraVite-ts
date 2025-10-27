## Entities API

Source: `src/api/entityAdapters.ts`, re-exported via `src/api/entities.ts`.

### Overview
Each entity is an instance of a generic adapter backed by Supabase tables:
- `Dealer`, `Vehicle`, `VehicleAsset`, `Transaction`, `Payment`, `LogisticsOrder`, `RTOApplication`, `BankAccount`, `DealerPreferences`, `UserSession`, `TeamMember`, `DealerDocument`, `DealerHours`, `DealerReview`, `DealerInquiry`, `AuditLog`, `Shortlist`, `VehicleInspection`, `AppConfig`

### Common Methods
All entity adapters expose:
- `list(filters?)`
- `get(id)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `filter(filters)` — supports `$or` arrays via Supabase `.or()` syntax

```ts
import { Vehicle } from '@/api/entities';

// List vehicles
const vehicles = await Vehicle.list();

// Filter (AND)
const suvVehicles = await Vehicle.filter({ body_type: 'SUV', is_active: true });

// Filter with OR
const res = await Vehicle.filter({
  $or: [
    { body_type: 'SUV' },
    { body_type: 'MUV' }
  ]
});

// CRUD
const created = await Vehicle.create({ make: 'Honda', model: 'Civic' });
const fetched = await Vehicle.get(created.id);
const updated = await Vehicle.update(created.id, { model: 'City' });
await Vehicle.delete(created.id);
```

### Auth Adapter: `User`
Methods:
- `me()` — current authenticated user
- `loginWithRedirect(redirectUrl?)`
- `logout()` / `signOut()`
- `updateMyUserData(data)`
- `signUp({ email, password })`
- `signIn({ email, password })`
- `getCurrentUser()`
- `list()` — admin list users
- `getSession()`

```ts
import { User } from '@/api/entities';

const me = await User.me();
```

### Notes
- Errors from Supabase are thrown; handle with try/catch.
- Table names align with adapter names (e.g., `Vehicle` -> `vehicles`).
