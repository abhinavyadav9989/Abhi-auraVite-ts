## Input Sanitization and Validation

Source: `src/components/security/InputSanitizer.tsx`

### Exports
- `sanitizeInput(input, { allowHtml?, maxLength?, removeScripts?, trimWhitespace? })`
- `validateInput(input, type, options)` — `type` in `'email' | 'phone' | 'number' | 'date' | 'text'`
- `useInputValidation(initialValues?)` — returns `{ values, errors, touched, isFormValid, handleChange, handleBlur, validateField }`

### Examples
```ts
sanitizeInput('<script>x</script>Hello', { allowHtml: false });

validateInput('user@example.com', 'email', { required: true });
```

```tsx
import { useInputValidation } from '@/components/security/InputSanitizer';

function ContactForm() {
  const { values, errors, handleChange, handleBlur, isFormValid } = useInputValidation();
  return (
    <form>
      <input onChange={(e) => handleChange('email', e.target.value, 'email')} onBlur={() => handleBlur('email')} />
      {errors.email?.map((e) => <div key={e}>{e}</div>)}
      <button disabled={!isFormValid}>Submit</button>
    </form>
  );
}
```