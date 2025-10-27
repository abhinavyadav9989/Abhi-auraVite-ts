## Formatting Helpers

Source: `src/components/formatters.tsx`

### Exports
- `formatCurrency(amount, { showDecimals?, shortForm?, currency? })`
- `formatDate(date, format = 'short' | 'long' | 'datetime')`
- `formatKilometers(kms, { showUnit?, shortForm? })`
- `formatPhoneNumber(phone)`
- `formatRegistrationNumber(regNo)`
- `formatFileSize(bytes)`
- `formatDuration(minutes)`
- `ensureArray(value)`
- `safeGet(obj, path, defaultValue?)`

### Examples
```ts
formatCurrency(125000); // ₹1.3L
formatDate('2025-01-31', 'datetime'); // 31/01/2025, 10:30
formatKilometers(152300); // 1.5L km
formatFileSize(1048576); // 1.0 MB
safeGet({ a: { b: 3 } }, 'a.b', 0); // 3
```