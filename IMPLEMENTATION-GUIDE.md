# Implementation Guide: Using New Utilities

This guide shows how to use the new utilities and patterns created in Phase 1 & 2.

---

## 🪝 Using useAsyncOperation Hook (Mobile)

### Before (Old Pattern)
```tsx
// apps/mobile/src/screens/user/BookingsPlaceholder.tsx
const [loading, setLoading] = useState(false);

async function loadBookings() {
  setLoading(true);
  try {
    const data = await getMyBookings(api, { limit: 100, offset: 0 });
    setBookings(data);
  } catch (e) {
    Alert.alert("Could not load bookings", (e as Error).message);
  } finally {
    setLoading(false);
  }
}
```

### After (New Pattern)
```tsx
// apps/mobile/src/screens/user/BookingsPlaceholder.tsx
import { useAsyncOperation } from "../hooks/useAsyncOperation";

const { execute: loadBookings, loading } = useAsyncOperation({
  onSuccess: () => {
    // Optional: runs after successful operation
  },
  alertTitle: "Load Bookings",
});

const handleLoadBookings = () => loadBookings(async () => {
  const data = await getMyBookings(api, { limit: 100, offset: 0 });
  setBookings(data);
  // Error alert is automatic!
});

// Call it
<Button title="Load" onPress={handleLoadBookings} disabled={loading} />
```

**Benefits:**
- ✅ Automatic error alerts
- ✅ No repetitive try-catch-finally
- ✅ Built-in loading state
- ✅ Consistent error handling

---

## 🪝 Using useAsyncOperation Hook (Web)

### Before
```tsx
// apps/admin-web/src/routes/BookingsPage.tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleUpdate(id: string) {
  setLoading(true);
  setError(null);
  try {
    await adminUpdateBooking(api, id, { status: "CONFIRMED" });
    // Refetch or update state
  } catch (e) {
    const msg = (e as Error).message;
    setError(msg);
    console.error(msg);
  } finally {
    setLoading(false);
  }
}
```

### After
```tsx
// apps/admin-web/src/routes/BookingsPage.tsx
import { useAsyncOperation } from "../lib/useAsyncOperation";

const { execute: updateBooking, loading, error } = useAsyncOperation({
  onSuccess: () => listQ.refetch(),
});

const handleUpdate = (id: string) => updateBooking(async () => {
  await adminUpdateBooking(api, id, { status: "CONFIRMED" });
});

// Use it
<button onClick={() => handleUpdate(booking.id)} disabled={loading}>
  {loading ? "Updating..." : "Update"}
</button>

{error && <div className="error">{error}</div>}
```

**Benefits:**
- ✅ Cleaner code (3 lines vs 16 lines)
- ✅ Consistent error handling
- ✅ Built-in loading state

---

## 📦 Using Query String Builder

### Before
```tsx
// apps/admin-web/src/routes/BookingsPage.tsx
const qs = new URLSearchParams();
if (params?.limit != null) qs.set('limit', String(params.limit));
if (params?.offset != null) qs.set('offset', String(params.offset));
if (params?.status) qs.set('status', params.status);
if (params?.user_email) qs.set('user_email', params.user_email);
if (params?.handyman_email) qs.set('handyman_email', params.handyman_email);
const suffix = qs.toString() ? `?${qs.toString()}` : '';
```

### After (Already Done in API Layer)
```tsx
// Built into API functions automatically
import { buildQueryString } from "@smart/api";

// You can also use it directly if needed:
const queryString = buildQueryString({
  limit: 50,
  offset: 0,
  status: "PENDING",
  // null/undefined values automatically skipped
});
// Result: "?limit=50&offset=0&status=PENDING"
```

---

## 🔐 Using Unified Session Types

### Before (Duplicated in Both Apps)
```tsx
// apps/admin-web/src/auth/session.ts
export type Session = {
  token: string;
  claims: JwtClaims;
  isAdmin: boolean;
};

// apps/mobile/src/auth/session.ts
export type MobileSession = {
  token: string;
  me: MeResponse;
  email: string;
  roles: string[];
};
```

### After (Shared Types)
```tsx
import {
  AdminSession,
  MobileSession,
  buildAdminSession,
  buildMobileSession,
  hasRole,
  isAdmin,
} from "@smart/core";

// Build admin session from JWT token
const adminSession = buildAdminSession(token);
if (adminSession && adminSession.isAdmin) {
  // User is admin
}

// Build mobile session from token + user response
const mobileSession = buildMobileSession(token, meResponse);
if (hasRole(mobileSession, "handyman")) {
  // User is handyman
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Consistent session handling
- ✅ Reusable type guards

---

## ⚙️ Using Shared Constants

### Before (Magic Strings Everywhere)
```tsx
// Hard to find all uses, inconsistent naming
const status = "PENDING";
const roleKey = "admin";
const storageKey = "token";
```

### After (Centralized)
```tsx
import { 
  BOOKING_STATUS, 
  ROLES, 
  STORAGE_KEYS 
} from "@smart/core";

// Type-safe access
const status = BOOKING_STATUS.PENDING; // "PENDING"
const roleKey = ROLES.ADMIN; // "admin"
const storageKey = STORAGE_KEYS.TOKEN; // "token"

// All available values
const allStatuses = Object.values(BOOKING_STATUS);
// ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"]

const allRoles = Object.values(ROLES);
// ["admin", "user", "handyman"]
```

**Benefits:**
- ✅ Type-safe
- ✅ Auto-complete support
- ✅ Easy refactoring
- ✅ Single source of truth

---

## 🛠️ Custom Token Storage Provider

### For Mobile (Using Expo SecureStore)
```tsx
// apps/mobile/src/lib/secureTokenProvider.ts
import * as SecureStore from "expo-secure-store";
import { TokenStorageProvider } from "@smart/core";

export class ExpoSecureTokenProvider implements TokenStorageProvider {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync("token");
  }

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync("token", token);
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync("token");
  }
}

// Use it
const tokenProvider = new ExpoSecureTokenProvider();
const token = await tokenProvider.getToken();
```

### For Web (localStorage - Already Provided)
```tsx
import { LocalStorageTokenProvider } from "@smart/core";

const tokenProvider = new LocalStorageTokenProvider("auth_token");
const token = await tokenProvider.getToken();
```

---

## 📋 Refactoring Checklist

Use this checklist to gradually migrate existing code:

- [ ] **Component Error Handlers**
  - Replace try-catch-finally blocks with `useAsyncOperation`
  - Update 15+ mobile screens
  - Update 5+ admin pages

- [ ] **Magic Strings**
  - Replace booking statuses with `BOOKING_STATUS`
  - Replace role checks with `hasRole()` utility
  - Replace storage keys with `STORAGE_KEYS`

- [ ] **Session Logic**
  - Replace duplicate session type with unified `AdminSession` / `MobileSession`
  - Update admin-web to use `buildAdminSession()`
  - Update mobile to use `buildMobileSession()`

- [ ] **Large Components** (Future work)
  - Split FindScreen.tsx (750 lines)
  - Split ProfilePlaceholder.tsx (250 lines)
  - Create shared hooks for data fetching

---

## 🔗 File Locations

**New Utilities:**
- Query builder: `packages/api/src/utils/queryBuilder.ts`
- Session types: `packages/core/src/session/types.ts`
- Session utils: `packages/core/src/session/utils.ts`
- Constants: `packages/core/src/constants.ts`
- Mobile hook: `apps/mobile/src/hooks/useAsyncOperation.ts`
- Web hook: `apps/admin-web/src/lib/useAsyncOperation.ts`

**Documentation:**
- Completion Report: `COMPLETION-REPORT.md`
- Phase 2 Plan: `PHASE2-REFACTORING-PLAN.md`
- This Guide: `IMPLEMENTATION-GUIDE.md`

---

## ❓ FAQ

**Q: Do I need to refactor all components at once?**  
A: No! You can migrate gradually. Old patterns still work alongside new patterns.

**Q: Will this break existing code?**  
A: No. All changes are backwards compatible. Old code continues to work.

**Q: Where should I start?**  
A: Start with the most error-prone components (those with lots of error handling) and gradually migrate outward.

**Q: Can I use these utilities in my own components?**  
A: Yes! All utilities are exported from their respective packages and fully documented.

---

## 💡 Tips

1. **Use TypeScript's auto-complete** - Import from `@smart/core` and let IDE suggest available exports
2. **Check constants first** - When writing strings, check `constants.ts` to see if there's already a defined constant
3. **Profile first** - Use `useAsyncOperation` for high-volume error handling scenarios
4. **Test migrations** - Verify component still works after refactoring

---

Questions? Check the completion report or phase 2 plan for more details! 🚀
