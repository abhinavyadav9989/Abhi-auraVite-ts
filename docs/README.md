# Project Documentation

Welcome to the project docs. This site covers all public APIs, hooks, components, and utilities with examples and usage guidance.

## Structure
- **API**: Integrations and Entity adapters
- **Hooks**: Auth, permissions, app config, and responsive utilities
- **Components**: UI primitives, security, data helpers, and auth components
- **Utilities**: Formatting, sanitization, state machines, Tailwind helpers, URL builders

## Index
- API
  - [Integrations](./api/Integrations.md)
  - [Entities](./api/Entities.md)
- Hooks
  - [useAuth](./hooks/useAuth.md)
  - [usePermissions](./hooks/usePermissions.md)
  - [useAppConfig](./hooks/useAppConfig.md)
  - [useIsMobile](./hooks/useIsMobile.md)
- Components
  - UI
    - [UI Primitives Index](./components/UI/PrimitivesIndex.md)
    - [Toast primitives](./components/UI/Toast.md)
    - [Toaster](./components/UI/Toaster.md)
    - [Tooltip](./components/UI/Tooltip.md)
    - [Card](./components/UI/Card.md)
    - [Sidebar](./components/UI/Sidebar.md)
    - [Carousel](./components/UI/Carousel.md)
    - [Collapsible](./components/UI/Collapsible.md)
  - General
    - [InfoTooltip](./components/InfoTooltip.md)
  - Security
    - [PermissionGuard and hasPermission](./components/Security/PermissionGuard.md)
  - Data
    - [StateTransitionManager and hooks](./components/Data/StateTransitionManager.md)
  - Auth
    - [AuthGuard](./components/Auth/AuthGuard.md)
    - [LoginForm](./components/Auth/LoginForm.md)
    - [RegisterForm](./components/Auth/RegisterForm.md)
- Utilities
  - [Formatting helpers](./utils/Formatting.md)
  - [Input sanitization and validation](./utils/InputSanitizer.md)
  - [Tailwind class merge: cn](./utils/cn.md)
  - [URL builder: createPageUrl](./utils/createPageUrl.md)

## Getting Started
- Ensure Supabase environment variables are set in `.env`:
```bash
VITE_SUPABASE_URL=... 
VITE_SUPABASE_ANON_KEY=...
```
- App entrypoint is `src/main.tsx`; routes are defined in `src/pages/index.tsx`.