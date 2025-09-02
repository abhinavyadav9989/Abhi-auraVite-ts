# Phase 1: Tier Enforcement Implementation Plan

## 🎯 Phase 1 Overview
**Goal**: Implement proper Basic vs Advanced tier enforcement with caps, route guards, and feature gates.
**Timeline**: Week 1-2
**Priority**: High (Blocks other phases)

---

## 📋 Detailed TODOs

### **TODO 1.1: Create Tier Configuration System**
**Status**: ✅ Completed  
**Effort**: 4 hours  
**Files to Create/Modify**: 
- `src/lib/tierConfig.ts` (NEW) ✅
- `src/types/tierTypes.ts` (NEW) ✅
- `src/hooks/useTier.ts` (NEW) ✅

**Requirements**:
- Define Basic vs Advanced tier limits
- Create tier validation functions
- Add tier upgrade prompts
- Implement tier-based feature flags

**Acceptance Criteria**:
- [ ] Basic tier: ≤2 branches, ≤200 bulk rows, masked marketplace
- [ ] Advanced tier: unlimited branches, ≤5k bulk rows, full marketplace
- [ ] Tier validation functions work correctly
- [ ] Upgrade prompts appear when limits exceeded

---

### **TODO 1.2: Implement Branch Count Enforcement**
**Status**: ✅ Completed  
**Effort**: 6 hours  
**Files to Modify**:
- `src/components/modals/BranchSetupModal.tsx` ✅
- `src/components/profile/BranchesSection.tsx` ✅
- `src/pages/Inventory.tsx` ✅

**Requirements**:
- Check branch count before allowing new branch creation
- Show upgrade modal when Basic tier limit reached
- Prevent branch creation beyond limits
- Update branch switcher to respect limits

**Acceptance Criteria**:
- [ ] Basic users cannot create more than 2 branches
- [ ] Upgrade modal appears when limit reached
- [ ] Branch creation blocked with clear error message
- [ ] Branch switcher shows correct count

---

### **TODO 1.3: Implement Bulk Upload Caps**
**Status**: ✅ Completed  
**Effort**: 4 hours  
**Files to Modify**:
- `src/pages/BulkImport.tsx` ✅
- `src/components/inventory/BulkOperationsPanel.tsx` (Not needed - validation in main component)

**Requirements**:
- Enforce 200-row limit for Basic tier
- Enforce 5k-row limit for Advanced tier
- Show tier-specific error messages
- Prevent upload when limit exceeded

**Acceptance Criteria**:
- [ ] Basic users cannot upload >200 rows
- [ ] Advanced users cannot upload >5k rows
- [ ] Clear error messages with upgrade prompts
- [ ] Upload blocked with tier-specific limits

---

### **TODO 1.4: Implement Marketplace Policy Enforcement**
**Status**: 🔴 Not Started  
**Effort**: 6 hours  
**Files to Modify**:
- `src/components/listing-wizard/PublishSettingsStep.tsx`
- `src/pages/VehicleDetail.tsx`
- `src/pages/Marketplace.tsx`

**Requirements**:
- Basic tier: Default to masked pricing
- Advanced tier: Allow public/B2B/masked choice
- Show policy explanation chips
- Enforce policy at publish time

**Acceptance Criteria**:
- [ ] Basic users see masked pricing by default
- [ ] Advanced users can choose pricing visibility
- [ ] Policy explanation chips visible
- [ ] Publish respects tier policies

---

### **TODO 1.5: Implement Route Guards**
**Status**: 🔴 Not Started  
**Effort**: 8 hours  
**Files to Create/Modify**:
- `src/components/guards/TierGuard.tsx` (NEW)
- `src/components/guards/BranchGuard.tsx` (NEW)
- `src/components/guards/VerificationGuard.tsx` (NEW)
- `src/App.tsx`

**Requirements**:
- Branch-first redirect when no branches exist
- Verification level checks for inventory access
- Tier-based route protection
- Return to original intent after setup

**Acceptance Criteria**:
- [ ] Users without branches redirected to branch setup
- [ ] Unverified users redirected to verification
- [ ] Tier-appropriate routes protected
- [ ] Return to original page after setup

---

### **TODO 1.6: Implement Feature Gates**
**Status**: 🔴 Not Started  
**Effort**: 6 hours  
**Files to Modify**:
- `src/components/FeatureGate.tsx`
- `src/components/inventory/AdvancedModeToggle.tsx`
- `src/pages/Inventory.tsx`

**Requirements**:
- Hide advanced features for Basic tier
- Show upgrade prompts for locked features
- Implement tier-based UI changes
- Add feature unlock previews

**Acceptance Criteria**:
- [ ] Advanced features hidden for Basic users
- [ ] Upgrade prompts appear for locked features
- [ ] UI adapts to tier level
- [ ] Feature unlock previews shown

---

### **TODO 1.7: Create Tier Upgrade Flow**
**Status**: 🔴 Not Started  
**Effort**: 8 hours  
**Files to Create/Modify**:
- `src/components/modals/TierUpgradeModal.tsx` (NEW)
- `src/pages/TierUpgrade.tsx` (NEW)
- `src/components/dashboard/TierUpgradeBanner.tsx` (NEW)

**Requirements**:
- Smooth upgrade flow from Basic to Advanced
- Feature comparison table
- Upgrade confirmation
- Post-upgrade onboarding

**Acceptance Criteria**:
- [ ] Upgrade modal with feature comparison
- [ ] Smooth upgrade process
- [ ] Post-upgrade feature unlock
- [ ] User guidance after upgrade

---

### **TODO 1.8: Add Tier-Based Analytics**
**Status**: 🔴 Not Started  
**Effort**: 4 hours  
**Files to Modify**:
- `src/pages/InventoryAnalytics.tsx`
- `src/components/dashboard/ProgressiveVerificationCards.tsx`

**Requirements**:
- Show tier-appropriate analytics
- Basic: Lite counters and buckets
- Advanced: Full BI and dashboards
- Tier upgrade prompts in analytics

**Acceptance Criteria**:
- [ ] Basic users see lite analytics
- [ ] Advanced users see full BI
- [ ] Upgrade prompts in analytics
- [ ] Tier-appropriate data shown

---

## 🚀 Implementation Order

1. **Start with TODO 1.1** - Foundation tier system
2. **Then TODO 1.2** - Branch enforcement (most visible)
3. **Then TODO 1.3** - Bulk upload caps
4. **Then TODO 1.4** - Marketplace policy
5. **Then TODO 1.5** - Route guards
6. **Then TODO 1.6** - Feature gates
7. **Then TODO 1.7** - Upgrade flow
8. **Finally TODO 1.8** - Analytics

---

## 🧪 Testing Checklist

### **Unit Tests**
- [ ] Tier validation functions
- [ ] Branch count enforcement
- [ ] Bulk upload caps
- [ ] Route guard logic

### **Integration Tests**
- [ ] End-to-end tier enforcement
- [ ] Upgrade flow completion
- [ ] Feature gate behavior
- [ ] Route guard redirects

### **User Acceptance Tests**
- [ ] Basic user cannot exceed limits
- [ ] Advanced user has full access
- [ ] Upgrade prompts appear correctly
- [ ] UI adapts to tier level

---

## 📊 Success Metrics

- [ ] 100% of Basic tier limits enforced
- [ ] 0% of users can bypass tier restrictions
- [ ] Upgrade flow completion rate >80%
- [ ] User confusion about tier limits <5%

---

## 🔄 Next Phase Dependencies

Phase 1 completion enables:
- **Phase 2**: Transfer system (needs branch enforcement)
- **Phase 2**: Approvals (needs tier-based access)
- **Phase 3**: Advanced features (needs tier system)
- **Phase 4**: Analytics (needs tier-based data)

---

**Total Estimated Effort**: 46 hours (6-7 days)
**Critical Path**: TODO 1.1 → 1.2 → 1.5 (Foundation → Branch → Guards)
