## AuthGuard

Source: `src/components/auth/AuthGuard.tsx`

Protects routes and redirects unauthenticated users to `Authentication`. Also verifies onboarding status via user metadata and dealer profile.

### Public Routes
- `/Authentication`, `/EmailVerification`, `/OnboardingPath`, `/OnboardingWizard`

### Usage
Wrap the app pages inside `AuthGuard` (already done in `src/App.tsx`).

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

<AuthGuard>
  <Pages />
</AuthGuard>
```