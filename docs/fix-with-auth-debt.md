# Plan: Refactor `withAuth` Wrapper to Standardize Authentication Results

## Objective
The current `withAuth` wrapper returns `undefined` on authentication failure, leading to silent failures and runtime TypeErrors in UI components and server actions. This plan proposes refactoring `withAuth` to return a standardized `Result` type, forcing explicit error handling.

## Key Files & Context
- `src/lib/action-utils.ts`: Defines `withAuth`.
- `src/app/actions/list.ts`: Consumes `withAuth`.

## Implementation Steps

### 1. Define Standard Result Type
Introduce a `Result<T>` type in `src/lib/action-utils.ts` (or a dedicated types file).

```typescript
export type Result<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };
```

### 2. Refactor `withAuth`
Update the `withAuth` higher-order function to return `Promise<Result<R>>`.

```typescript
export function withAuth<T extends any[], R>(
  handler: (userId: string, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<Result<R>> => {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    try {
      const data = await handler(session.user.id, ...args);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Internal Error" };
    }
  };
}
```

### 3. Update Consumers
Update all functions in `src/app/actions/list.ts` (and any other files using `withAuth`) to handle the new `Result` type in the UI components that call these actions.

*Note: Server actions themselves might not change drastically if they just pass the Result up, but the callers need updates.*

### 4. Verification & Testing
- **Unit Test:** Create a test case in `src/services/__tests__/list.service.test.ts` or a new test file that simulates an unauthenticated session and asserts that `withAuth` returns the correct `{ success: false, error: "Unauthorized" }` object.
- **Manual Verification:** Test `createList`, `getListDetails`, etc., through the UI to ensure error states are handled gracefully.

## Migration & Rollback
- **Migration:** Apply changes to `withAuth` first, then sequentially update components consuming these actions.
- **Rollback:** If issues arise, revert `src/lib/action-utils.ts` and `src/app/actions/list.ts` to their previous state.
