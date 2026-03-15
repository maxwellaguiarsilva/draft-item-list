# Phase 2 Plan: Authentication (Identity)

## Objective
Implement authentication using Auth.js (v5) with the Google Provider. 

## Requirements
- **Provider:** Google OAuth only.
- **Data Policy:** The Prisma Adapter requires standard fields (`email`, `name`, `image`) to manage user sessions and account linking. These fields are persisted to support Auth.js/Prisma Adapter functionality.
- **Adapter:** Prisma Adapter.
- **Flow:** User authentication via Google, linked to a `User` record in the database.

## Tasks
1. **Dependencies:** Install `next-auth@beta` and `@auth/prisma-adapter`.
2. **Prisma Schema:** Update `schema.prisma` to include required Auth.js models (`Account`, `Session`, `VerificationToken`) and ensure `User` model includes standard fields required by the adapter.
3. **Configuration:**
    - Create `auth.config.ts` (base configuration).
    - Create `auth.ts` (Next.js Auth instance, provider setup).
4. **Environment Setup:** Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to `.env` (with placeholders).
5. **Middleware:** Protect application routes.
6. **Verification:**
    - Verify user record creation in the PostgreSQL database upon first login.

## Implementation Details
- **Auth.js v5:** Uses the new configuration patterns.
- **Database:** Prisma remains the source of truth.
- **Security/Deployment:** Sensitive secrets (`AUTH_GOOGLE_SECRET`, `AUTH_SECRET`) are configured using Google Secret Manager in production (see `GCP_AUTH_DEPLOY.md`).

## Verification
- Test successful login flow.
- Query database: `SELECT * FROM "User";` to ensure user records are created.
