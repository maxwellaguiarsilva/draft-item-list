# Auth.js (NextAuth) Best Practices & Troubleshooting

Guidance for using Auth.js (v5) within the Next.js application.

## 1. Handling Invalid Session Cookies
If the `AUTH_SECRET` changes, `JWEInvalid` errors occur.

### The Problem
NextAuth internally catches these errors, returns `null` (forcing user logout), but logs a `console.error`. In Next.js dev mode, this triggers an annoying Dev Overlay (red screen).

### The Solution: Custom Logger
Customize the `logger` in `src/auth.ts`:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ... configuration
  logger: {
    error(error: any) {
      // Ignore specific cookie errors to avoid Dev Overlay
      if (error?.name === "JWTSessionError") {
        console.warn("Invalid authentication cookie detected. Ignoring...");
      } else {
        console.error(error);
      }
    },
  },
});
```

## 2. Secure Session Access
Always check for user existence before accessing session properties.

```typescript
// Good practice
if (!session || !session.user?.id) {
  redirect("/");
}
const userId = session.user.id;
```
