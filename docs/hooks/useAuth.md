## useAuth

Source: `src/hooks/useAuth.tsx`

### Purpose
Provides reactive authentication state and helpers powered by Supabase.

### Returns
- `user: User | null`
- `session: Session | null`
- `loading: boolean`
- `error: string | null`
- `isAuthenticated: boolean`
- `signIn(email, password)`
- `signUp(email, password)`
- `signOut()`
- `updateUser(data)`
- `clearError()`
- `refreshAuth()`

### Example
```tsx
import { useAuth } from '@/hooks/useAuth';

export function ProfileMenu() {
  const { user, loading, error, signOut, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <a href="/Authentication">Sign in</a>;

  return (
    <div>
      <span>{user?.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

### Notes
- Reads environment from `src/api/supabaseClient.ts`.