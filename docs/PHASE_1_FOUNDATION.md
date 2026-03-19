# Phase 1 Plan: Foundation & Database Setup

## Objective
Establish the project environment, initialize the database infrastructure (Local PostgreSQL + Prisma), and create the baseline data model.

## Tasks
1.  **Project Initialization:**
    *   Initialize Next.js project with TypeScript.
    *   Configure ESLint/Prettier for code standards.
    *   Configure environment variables (`.env`).
2.  **Local Database Setup (Development):**
    *   Use Docker Compose to spin up a local PostgreSQL instance.
    *   `compose.yaml` (see below) defines the database service.
    *   Connect Prisma to this local instance via `DATABASE_URL`.
3.  **Data Modeling:**
    *   Write `schema.prisma` with the agreed-upon entities: `User`, `List`, `Group`, `Item`.
    *   Define relations (1-to-many, recursive group, nullable parent links).
    *   Run initial migration (`prisma migrate dev`).
4.  **Verification:**
    *   Confirm database connectivity.
    *   Verify table structures match the `PROJECT_SPEC.md` requirements.

## Local Development Infrastructure
To ensure a consistent development environment, we use a local PostgreSQL container managed by Docker Compose.

1.  **Create `compose.yaml` in the `infra/` directory:**
```yaml
services:
  database:
    container_name: "postgres-dev"
    image: "postgres:alpine"
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: draft_item_list
```

2.  **Start the database:**
```bash
docker-compose -f infra/compose.yaml up -d
```

3.  **Configure `.env` for Prisma:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/draft_item_list"
```

## Verification
- Confirm all `schema.prisma` relations match our recursive requirement.
- Successfully run a migration to ensure the DB state aligns with the code.

## Next Steps
- Once Phase 1 is complete, we will proceed to **Phase 2: Authentication (Identity)**.
