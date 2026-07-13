# Next.js Best Practices & Troubleshooting

This document outlines conventions and troubleshooting guidance for Next.js (App Router).

## 1. Proxy Architecture
Next.js 16+ uses the `proxy.ts` file for middleware-like functionality.

- **Convention:** Place `proxy.ts` in the `src/` directory (or root if required by project structure).
- **Export:** Export the `proxy` function.
- **Reference:** [Next.js Proxy API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

```typescript
import { auth } from "@/auth";
export const proxy = auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## 2. Server Actions
Standardize server action results using a result wrapper.

- **Reference:** [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

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
