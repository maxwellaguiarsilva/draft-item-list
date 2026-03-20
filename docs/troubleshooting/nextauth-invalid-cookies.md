# How the Application Handles Invalid Cookies in NextAuth (Auth.js)

This document explains how the NextAuth (Auth.js) library handles invalid session cookies (typically caused by changing the `AUTH_SECRET` during development) and how to configure the application to avoid intrusive error screens in the Next.js development environment.

## The Problem: `JWTSessionError` / `JWEInvalid`

When the encryption secret (`AUTH_SECRET`) is changed in the `.env` file, or when the database and local settings are reset, the user's browser may still hold an old session cookie encrypted with the previous key.

When attempting to access the application, the following flow occurs:
1. The browser sends the old cookie to the server.
2. NextAuth attempts to decrypt the cookie using the new `AUTH_SECRET` but fails.
3. Node.js/NextAuth throws an exception of type `JWEInvalid`.

## NextAuth Behavior ("Swallowing" the Error)

NextAuth is designed to be resilient. When a `JWEInvalid` error occurs, it performs the following **internally**:
- It **catches** the exception (internal library `try/catch`).
- It **returns `null`** to the `auth()` (or `getSession()`) function, forcing the application to treat the user as logged out.
- It **logs an error** using `console.error` on the server to warn the developer that a cookie failed to be read.

Due to this behavior, your application layer (your code) **never receives the error to be handled with a traditional `try/catch`**, because the `auth()` function executed successfully by returning `null`.

## The Problem in Development (The Red Screen)

In production, the flow above is invisible to the user. The application would load normally with the user logged out, and as soon as they log in again, the old cookie would be overwritten by a new, valid one.

However, in the **development environment (Next.js with Turbopack/Webpack)**, the framework intercepts any `console.error` occurring on the server and displays an "Error Overlay" (the dreaded red screen) in the developer's browser. Since NextAuth used `console.error` to warn about the invalid cookie, Next.js halts the entire screen.

## The Architectural Solution (Customizing the Logger)

The correct and official solution recommended by Auth.js is not to attempt to intercept the error in the application, but rather to instruct the library on **how** it should report its internal errors.

This is done by customizing the `logger` object within the NextAuth configuration options (`src/auth.ts`):

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  logger: {
    error(error: any) {
      // If it's the specific invalid cookie/token error, we use console.warn 
      // so that Next.js doesn't trigger the red error overlay.
      if (error?.name === "JWTSessionError") {
        console.warn("WARNING: Invalid authentication cookie detected. Ignoring...");
      } else {
        // For other real errors, we maintain normal console.error
        console.error(error);
      }
    },
  },
  ...authConfig,
});
```

### Why does this work?
By changing the output of this specific error from `console.error` to `console.warn`, Next.js no longer interprets the warning as a critical failure that requires interrupting the developer interface. The application continues to run normally, treating the user as logged out, and allowing them to perform a clean login again.

---
**Summary:** The error never actually broke your application; it was contained and handled by NextAuth. The issue was strictly visual (Next.js Dev Overlay) and was resolved using the official Auth.js `logger` API.
