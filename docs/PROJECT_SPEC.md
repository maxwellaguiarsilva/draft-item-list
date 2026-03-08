# Draft Item List: Project Overview

## Overview
"Draft Item List" is a simple, web-based SaaS application designed to empower users with zero technical knowledge to create and manage lists of any kind.

## Core Philosophy
- **Minimalist & Accessible:** Built for users with limited technical literacy.
- **High Abstraction:** Prioritize opinionated, high-level libraries.
- **English-Only:** All content in en-us.
- **Zero-Code Phase:** No code until explicit instruction.

## UX Guidelines
- **List Category:** Free-form text input with a UI button (e.g., '+') to select existing categories, avoiding manual re-typing.
- **Duplication:** Duplicated lists, groups, and items are inserted immediately after the original entity.
- **Counter:** Simple + and - buttons; '-' disabled when value is 1.

## Data Model & Logic
- **User:** ID (Google `sub`) for identification.
- **List:**
    - ID, Name, UserID.
    - `category`: String field for single-level categorization of lists.
- **Groups:**
    - ID, Name, ListID.
    - Recursive structure: `parentId` (nullable).
    - Can contain child `Groups` and `Items`.
    - `position`: Integer for ordering.
- **Items:**
    - ID, Name, Quantity (Int).
    - `groupId`: (nullable) - if null, belongs directly to the list root.
    - Terminal nodes: Items cannot have children.
    - `position`: Integer for ordering.

- **Note:** `null` parent/group references are used for "root/default" items and groups, simplifying the DB schema.
- **Duplication:** Ability to duplicate lists, groups, and individual items.

## Technology Stack
- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **UI/Accessibility:** shadcn/ui (Radix UI)
- **Authentication:** Auth.js (v5) - Google Provider only. Stores only the unique `sub` identifier; no email or profile data collection.

## Migration Note
This project is being moved from an Android/ARM environment to a Linux/x86_64 environment. After cloning this repository, ensure the following steps are performed:
1. Initialize the environment: `npm install`.
2. Configure environment variables (e.g., `DATABASE_URL` for Neon PostgreSQL).
3. Run migrations to initialize the database: `npx prisma migrate dev`.
4. Generate the Prisma Client: `npx prisma generate`.
