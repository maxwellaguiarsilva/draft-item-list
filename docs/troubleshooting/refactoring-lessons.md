# Refactoring Lessons & Troubleshooting

This document captures recurring issues and their resolutions encountered during the Phase 3 layout and server action refactoring.

## 1. Middleware Architecture (Auth.js v5)
**Problem:** Attempting to use a custom `proxy.ts` pattern for Auth.js v5 middleware resulted in build-time Type Errors because `NextAuth` expected a standard `NextMiddleware` signature, not a simple `Request` wrapper.

**Resolution:** 
Migrate to standard Auth.js v5 pattern:
1. Rename `proxy.ts` to `middleware.ts`.
2. Export `auth` directly as `middleware`.
```typescript
import { auth } from "@/auth";
export const middleware = auth;
```

## 2. Server Action Consistency & Return Types
**Problem:** Server actions were returning inconsistent types (`void`, or objects without shared structure), causing widespread TypeScript errors in consuming components.

**Resolution:**
1. Created a standardized result wrapper in `src/app/actions/list.ts`:
```typescript
async function wrapAction<T>(action: () => Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An error occurred" };
  }
}
```
2. Exported `Result<T>` from `src/lib/action-utils.ts` to ensure consistency across the codebase (e.g., in hooks like `useAppAction`).

## 3. TypeScript Strict Null Checks (Session)
**Problem:** Directly accessing `session.user.id` caused build errors because `session.user` can be `undefined` even if `session` is truthy.

**Resolution:** 
Always perform safe access:
```typescript
if (!session || !session.user?.id) {
  redirect("/");
}
const userId = session.user.id;
```
