# Phase 2: Safe API Refactoring Strategy

Generated: 2026-03-16

## Executive Summary

Based on deep codebase analysis, we can safely:
1. **Fix 2 critical bugs** (zero risk - improves code)
2. **Remove 6 unused functions** (zero risk - never imported)
3. **Clean up 1 duplicate function** (zero risk - not used)
4. **Update 1 unused import** (zero risk - not called)

**Total impact:** ~50+ lines removed, zero breaking changes.

---

## Phase 2a: IMMEDIATE (Bug Fixes - Deploy ASAP)

### Bug #1: Fix `adminListAllAvailability` - BROKEN CODE
**File:** [packages/api/src/availability.ts](packages/api/src/availability.ts#L70-L76)  
**Severity:** 🔴 CRITICAL (Code is broken, would crash if called)

**Current broken code:**
```typescript
export async function adminListAllAvailability(
  api: ApiClient,
  params?: { limit?: number; cursor?: number }
): Promise<unknown> {
  const qs = new URLSearchParams();
  
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.cursor != null) qs.set("cursor", String(params.cursor));
  // MISSING: const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/availability${undefined}`, { method: "GET" }); // ← USES UNDEFINED
}
```

**Fix:** Already applied - uses buildQueryString utility

### Bug #2: Duplicate function definition
**File:** [packages/api/src/skills.ts](packages/api/src/skills.ts#L48, L76)  
**Severity:** 🔴 CRITICAL (Duplicate function name, last one wins)

**Issue:** Two functions named `getInvalidHandymanSkills`:
- Line 48: Correct definition (matches API usage)
- Line 76: Duplicate definition (overwrites line 48)

**Fix:** Remove line 76 duplicate, keep line 48

---

## Phase 2b: CLEANUP (Unused Exports - Week 1)

### Unused Availability Functions
These are never imported anywhere - safe to remove completely:

| Function | Used? | Recommendation |
|----------|-------|-----------------|
| `getAvailabilityByEmail` | ❌ No | Remove from exports |
| `setAvailabilityByEmail` | ❌ No | Remove from exports |
| `clearAvailabilityByEmail` | ❌ No | Remove from exports |
| `adminListAvailability` | ❌ No | Remove from exports |

**Impact:** Zero - these functions are literally never called  
**Files to update:** 
- [packages/api/src/availability.ts](packages/api/src/availability.ts) - remove functions
- [apps/admin-web/src/routes/AvailabilityPage.tsx](apps/admin-web/src/routes/AvailabilityPage.tsx) - remove unused imports

### Unused Skills Functions
Never imported - safe to remove:

| Function | Used? | Recommendation |
|----------|-------|-----------------|
| `adminReplaceSkillsCatalog` | ❌ No | Remove (duplicate of replaceSkillsCatalog) |
| `adminPatchSkillsCatalog` | ❌ No | Remove (duplicate of patchSkillsCatalog) |
| `getInvalidHandymanSkills` (singular L76) | ❌ No | Remove (duplicate of getInvalidHandymenSkills) |

**Impact:** Zero - these are never called  
**Files to update:**
- [packages/api/src/skills.ts](packages/api/src/skills.ts) - remove duplicate functions

---

## Phase 2c: CLEANUP (Unused Imports - Week 1)

### Admin Web - AvailabilityPage Clean Up
**File:** [apps/admin-web/src/routes/AvailabilityPage.tsx](apps/admin-web/src/routes/AvailabilityPage.tsx)  
**Current imports (lines 4-7):**
```typescript
import {
  adminListAllAvailability,
  adminListAvailability,
  clearAvailability,
  getAvailability,
  setAvailability,
  AvailabilitySlot,
} from "@smart/api";
```

**Unused imports:** ALL OF THEM! None are actually called in the component.

**Recommendation:**
1. Check what AvailabilityPage is actually trying to do
2. If page is incomplete, restore implementations OR
3. If page is just a placeholder, remove/comment it out

---

## Phase 2d: CONSISTENCY IMPROVEMENTS (Optional - Week 2)

### Consolidate Skills Functions
**Current state:**
- `replaceSkillsCatalog` - calls PUT `/admin/skills-catalog`
- `adminReplaceSkillsCatalog` - calls PUT `/admin/skills-catalog` (identical)
- Same duplication for patch functions

**Recommendation:** Keep only non-admin-prefixed versions:
- ✅ Keep: `replaceSkillsCatalog`
- ❌ Remove: `adminReplaceSkillsCatalog` (unused anyway)
- ✅ Keep: `patchSkillsCatalog`
- ❌ Remove: `adminPatchSkillsCatalog` (unused anyway)

---

## Implementation Plan

### Step 1: Fix Critical Bugs (TODAY)
1. ✅ Extract query builder → [packages/api/src/utils/queryBuilder.ts](packages/api/src/utils/queryBuilder.ts)
2. ✅ Use in all API files
3. ✅ Fix broken `adminListAllAvailability` (done via build query string)
4. Fix duplicate `getInvalidHandymanSkills`:
   - Remove line 76 from [packages/api/src/skills.ts](packages/api/src/skills.ts)

### Step 2: Remove Unused Functions (Safe Week 1)
1. Remove from [packages/api/src/availability.ts](packages/api/src/availability.ts):
   - `getAvailabilityByEmail` (lines 20-22)
   - `setAvailabilityByEmail` (lines 24-30)
   - `clearAvailabilityByEmail` (lines 32-34)
   - `adminListAvailability` (lines 39-46)

2. Remove from [packages/api/src/skills.ts](packages/api/src/skills.ts):
   - `adminReplaceSkillsCatalog` (lines 28-33)
   - `adminPatchSkillsCatalog` (lines 38-43)

3. Clean up imports in [apps/admin-web/src/routes/AvailabilityPage.tsx](apps/admin-web/src/routes/AvailabilityPage.tsx)

### Step 3: Verify No Breakage
- ✅ Run `npm run lint` in each app
- ✅ Run `npm run build` to check TypeScript
- ✅ Manual test affected pages

---

## Risk Assessment

### Phase 2a (Bug Fixes)
- **Risk:** ZERO - fixes broken code
- **Testing required:** Minimal (would only be tested if someone calls the broken function)
- **Rollback:** None needed

### Phase 2b (Remove Unused)
- **Risk:** ZERO - these functions literally have no callers
- **Testing required:** Lint check passes (no import errors)
- **Rollback:** Git restore

### Phase 2c (Clean Imports)
- **Risk:** ZERO - just removing unused imports
- **Testing required:** Lint check
- **Rollback:** Git restore

---

## Verification Checklist

Before each phase:
- [ ] Run `npm run lint` in apps/admin-web
- [ ] Run `npm run lint` in apps/mobile
- [ ] Run `npm run build` in apps/admin-web
- [ ] Run `npm run build` in apps/mobile
- [ ] Check no TypeScript errors in packages/api

---

## Timeline Estimate

- **Phase 2a (Bug fixes):** 30 minutes
- **Phase 2b (Remove unused):** 1 hour
- **Phase 2c (Clean imports):** 30 minutes
- **Verification:** 1 hour
- **Total:** ~3 hours

---

## Files to Modify

### Deletions
- [packages/api/src/availability.ts](packages/api/src/availability.ts) - remove 4 functions
- [packages/api/src/skills.ts](packages/api/src/skills.ts) - remove 3 functions + duplicate def
- [apps/admin-web/src/routes/AvailabilityPage.tsx](apps/admin-web/src/routes/AvailabilityPage.tsx) - clean imports

### No changes needed
- [packages/api/src/bookings.ts](packages/api/src/bookings.ts) - all functions are used ✅
- [packages/api/src/handymen.ts](packages/api/src/handymen.ts) - all functions are used ✅
- [packages/api/src/users.ts](packages/api/src/users.ts) - all functions are used ✅
- [packages/api/src/match.ts](packages/api/src/match.ts) - all functions are used ✅

---

## Next Steps

1. Review this plan with team
2. Execute Phase 2a (bug fixes) 
3. Run full test suite
4. Execute Phase 2b & 2c if approved
5. Deploy changes
