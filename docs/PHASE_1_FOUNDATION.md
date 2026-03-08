# Phase 1 Plan: Foundation & Database Setup

## Objective
Establish the project environment, initialize the database infrastructure (Neon + Prisma), and create the baseline data model.

## Tasks
1.  **Project Initialization:**
    *   Initialize Next.js project with TypeScript.
    *   Configure ESLint/Prettier for code standards.
    *   Configure environment variables (`.env`).
2.  **Database Setup:**
    *   Provision/Connect to a Neon PostgreSQL database.
    *   Initialize Prisma in the project.
3.  **Data Modeling:**
    *   Write `schema.prisma` with the agreed-upon entities: `User`, `List`, `Group`, `Item`.
    *   Define relations (1-to-many, recursive group, nullable parent links).
    *   Run initial migration (`prisma migrate dev`).
4.  **Verification:**
    *   Confirm database connectivity.
    *   Verify table structures match the `PROJECT_SPEC.md` requirements.

## Verification
- Confirm all `schema.prisma` relations match our recursive requirement.
- Successfully run a migration to ensure the DB state aligns with the code.

## Next Steps
- Once Phase 1 is complete, we will proceed to **Phase 2: Authentication (Identity)**.
