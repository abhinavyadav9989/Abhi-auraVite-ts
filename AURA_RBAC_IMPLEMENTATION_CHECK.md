## Aura — Roles, Hierarchy & Access Control: Implementation Check

Status key: Implemented / Partial / Missing. Notes include key file references.

### 0) Glossary / Concepts Present

| Item                 | Status      | Notes/References |
|----------------------|-------------|------------------|
| Role (job hat)       | Partial     | Basic roles (admin/dealer) via JWT claims; no full platform/dealer/buyer taxonomy. `database-migrations/ADMIN_RLS_POLICIES.sql`, `SUPABASE_MIGRATION_SAFE.sql` |
| Scope (branch/channel/pool) | Missing | Branch/channel/pool not enforced in RLS or UI guards. |
| Permission (view/edit/approve) | Partial | Some UI guards and RLS allow/deny; no centralized permission matrix. `src/components/security/PermissionGuard.tsx` (skeleton), UI checks in `src/pages/VehicleDetail.tsx` |
| Approval (dual‑control) | Missing | No dual approvals wired. |
| ABAC (attribute rules) | Missing | No attribute-based checks for branch/channel/pool/sensitivity. |
| Sensitive actions list | Partial | Implied in UI (price edits/publish), not codified. |

### 1) High‑Level Hierarchy (Role Coverage)

| Area/Role Group         | Status  | Notes/References |
|-------------------------|---------|------------------|
| Platform roles (Super Admin, Compliance, Finance, Risk, Support, Content/SEO, Growth, Auction Admin, Tech Admin) | Missing | Not modeled as distinct roles/permissions. |
| Dealer roles (Owner, Org Admin, Branch Manager, Inventory Ops/QC, Sales Exec, Finance/Back‑office, Service/Refurb, Media, Auditor, Analyst) | Missing | Dealer vs Admin exists; granular dealer roles not modeled. |
| Buyers (Guest/Registered/Verified/B2B/Auction Bidder) | Partial | Guest/public SRP; authenticated users; KYC gating not enforced for actions. `src/pages/Marketplace.tsx`, `src/components/FeatureGate.tsx` |
| Partners (Logistics/Inspection/Lender/Insurer) | Missing | Not implemented as access roles; tables scaffolded for logistics/RTO only. `database-migrations/SUPABASE_DATABASE_SETUP.sql` |

### 2) Access Control Model (RBAC + ABAC)

| Capability                                | Status  | Notes/References |
|-------------------------------------------|---------|------------------|
| RBAC baseline by role                     | Partial | Admin vs Dealer via JWT and RLS. `SUPABASE_MIGRATION_SAFE.sql`, `ADMIN_RLS_POLICIES.sql` |
| ABAC attributes (dealer_id/branch_id/channel/pool/status/grade/bands) | Missing | Only dealer isolation; others not enforced. |
| Field‑level guards (asking vs floor)      | Missing | Not enforced server-side; limited UI checks only. `src/pages/VehicleDetail.tsx` |
| Workflow gates (publish requires QC/docs/pricing) | Missing | No hard gates; UI only. `src/components/listing-wizard/PublishSettings.tsx` |
| RLS dealer isolation                      | Implemented | Dealer isolation + public active select. `SUPABASE_MIGRATION_SAFE.sql` |
| Branch scope for non‑owners               | Missing | Not present in RLS policies. |
| Dual‑control for sensitive actions        | Missing | Not implemented. |

### 3) Platform Roles — Functional Checks

| Role/Function                | Status  | Notes/References |
|-----------------------------|---------|------------------|
| Super Admin full access     | Partial | Admin read policies exist; not full CRUD grant across all modules. `ADMIN_RLS_POLICIES.sql` |
| Compliance/Moderator        | Missing | No moderation queues/flags or PII redaction role. |
| Finance & Payouts           | Missing | Payments tables exist; no role/flows for payouts/refunds. `SUPABASE_DATABASE_SETUP.sql` |
| Risk & Disputes             | Missing | No disputes/holds/penalties system. |
| Support (Impersonation)     | Missing | No consent tokens/impersonation. |
| Content & SEO               | Missing | No CMS/SEO role separation. |
| Growth & Promotions         | Missing | No promos config module/role. |
| Auction Admin               | Missing | No auctions module/role. |
| Tech Admin                  | Missing | No API keys/webhooks/SSO role controls. |

### 4) Dealer Roles — Functional Checks

| Role/Function                 | Status  | Notes/References |
|------------------------------|---------|------------------|
| Dealer Owner/Org Admin       | Partial | Dealer ownership implied via `created_by`/RLS; no explicit role boundaries. `SUPABASE_MIGRATION_SAFE.sql` |
| Branch Manager               | Missing | Branch-scoped role absent. |
| Inventory Ops / QC           | Partial | Can add/edit vehicles; QC not formalized with gate powers. `src/pages/Inventory.tsx`, `src/pages/AddVehicle.tsx` |
| Sales Executive              | Partial | Offer/quote actions in UI; no discount band enforcement. `src/components/marketplace/OfferModal.tsx` |
| Finance / Back‑office        | Missing | Doc verification flows not role-guarded. |
| Service / Refurb             | Missing | Refurb/job card module not present. |
| Photographer / Media         | Partial | Media upload exists; no scoped media-only role. `src/components/inventory/DocumentManager.tsx` |
| Auditor / Compliance         | Missing | Read-only/audit export role not modeled. |
| Read‑only Analyst            | Missing | No analyst role or download guards. |

### 5) Buyer & Partner Roles — Functional Checks

| Role/Function           | Status  | Notes/References |
|-------------------------|---------|------------------|
| Guest/Registered/Verified Buyers | Partial | Public browsing + auth; KYC/advanced gates not enforced. |
| Business Buyer (B2B)    | Missing | No dedicated B2B pricing/listings. |
| Auction Bidder          | Missing | No deposit/bidding/settlement. |
| Partners (Logistics/Inspection/Lender/Insurer) | Missing | Not modeled as roles; integrations not present. |

### 6) Permission Matrix (Condensed)

| Module / Action         | Status  | Notes/References |
|-------------------------|---------|------------------|
| View all dealer data    | Partial | Admin view policies; dealer org scoping limited to dealer_id. `ADMIN_RLS_POLICIES.sql`, `SUPABASE_MIGRATION_SAFE.sql` |
| Add/Edit Vehicle        | Implemented | CRUD via UI + RLS for own dealer. `src/pages/Inventory.tsx`, `src/pages/AddVehicle.tsx` |
| Set Asking Price        | Partial | Editable; no band checks. `src/components/inventory/BulkOperationsPanel.tsx` |
| Set Floor Price         | Missing | Guarding by role absent. |
| QC Pass/Fail            | Partial | Inspections/docs exist; no formal role gating. |
| Publish/Unpublish       | Partial | UI settings exist; no enforced readiness or approvals. |
| Inter‑branch Transfer   | Missing | No transfer module/roles. |
| Inter‑state Transfer    | Missing | Not implemented. |
| Handle Leads/Chat       | Partial | Offers exist; chat/SLA routing missing. |
| Offers/Discounts        | Partial | Offers exist; discount band enforcement missing. |
| Token/Refund/Payouts    | Missing | No operational role workflows. |
| Auction operations      | Missing | Not implemented. |
| Users & Roles mgmt      | Missing | No role builder/assignment UI or seeds. |
| Analytics Export        | Partial | Analytics mentioned; export guards not present. |

### 7) Field‑Level Rules

| Rule Area  | Status  | Notes/References |
|------------|---------|------------------|
| Pricing (asking within band; floor manager+) | Missing | No band model/guards. |
| Documents (verification roles)               | Missing | Not role-scoped. |
| Media (photographer-only edits)              | Missing | Not enforced by role. |
| QC Grade override with approvals             | Missing | Not implemented. |

### 8) Channel & Branch Scoping

| Scope Type | Status  | Notes/References |
|------------|---------|------------------|
| Branch     | Missing | No branch RLS policy. |
| Channel    | Missing | No channel scope checks. |
| Pool       | Missing | No pool scope checks. |

### 9) Approval Matrix (Dual Control)

| Area | Status  | Notes |
|------|---------|------|
| Dual approvals for risky actions | Missing | No approval engine or audit trail for approvals. |

### 10) Data Security & Privacy

| Control                    | Status  | Notes/References |
|---------------------------|---------|------------------|
| RLS per dealer            | Implemented | Policies present and enabled. `SUPABASE_MIGRATION_SAFE.sql` |
| PII redaction on public   | Missing | No redaction/signed URL enforcement on all shares. |
| Signed URLs for media     | Partial | Storage policies present; usage not enforced in all UI. |
| MFA/device trust/IP allow | Missing | Not implemented. |
| Support impersonation scope | Missing | Not implemented. |

### 11) Onboarding & Provisioning

| Flow Element | Status  | Notes/References |
|--------------|---------|------------------|
| Create dealer tenant + KYB | Partial | Dealer creation exists; KYB review not wired. |
| Invite staff, assign roles/branches | Missing | No roles/branches assignment flows. |
| Partner onboarding (scoped) | Missing | Not implemented. |
| Buyer KYC gates for auctions/credit | Missing | Not enforced. |

### 12) Example Policy Snippets (Presence)

| Snippet Type | Status  | Notes/References |
|--------------|---------|------------------|
| RLS branch policy | Missing | Not present. |
| Field-level server checks | Missing | No server middle layer; direct Supabase client. |
| Approval guard | Missing | Not implemented. |

### 13) Custom Roles & Granular Scopes

| Feature | Status  | Notes |
|---------|---------|------|
| Role Builder (JSON schema + seed) | Missing | Not present. |
| Temporary roles (time‑boxed)      | Missing | Not present. |

### 14) Logs, Audits, and Alerts

| Item | Status  | Notes/References |
|------|---------|------------------|
| Immutable audits (who/when/before‑after/reason) | Partial | Audit tables/policies scaffolded; not end‑to‑end. `SUPABASE_MIGRATION_SAFE.sql` |
| Anomaly alerts (price/refund/etc.) | Missing | Not implemented. |
| Watermarked exports                | Missing | Not implemented. |

### 15) UX Guard Rails

| Guard Rail | Status  | Notes |
|------------|---------|------|
| Confirmation + reason for risky actions | Partial | Some confirm modals; not standardized or role‑based. |
| Friendly permission error messages      | Partial | Some UI messages; no systematic mapping. |
| Read‑only field affordances             | Partial | Present in some screens. |

### 16) Acceptance Criteria (RBAC) — Current Status

| Criterion                                                     | Status  |
|---------------------------------------------------------------|---------|
| Sales cannot edit floor price; can discount within band       | Missing |
| Inventory Ops cannot publish if QC/doc gates unmet            | Missing |
| Branch Manager sees only their branch analytics               | Missing |
| Owner can impersonate Sales view (read‑only)                  | Missing |
| Platform Support impersonation never shows payout screens     | Missing |
| Refund > threshold requires dual approval and is audited      | Missing |

### Summary

Core dealer isolation via RLS and basic inventory operations exist. However, the detailed RBAC/ABAC model (branch/channel/pool scoping, dual approvals, field‑level guards, approval/audit workflows, and role taxonomy) is largely Missing. Progress exists on onboarding gating and basic UI permission checks, but a server‑side guard layer and expanded RLS/policies are needed to meet the blueprint.


