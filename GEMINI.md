# Draft Item List: Project Overview

## Overview
"Draft Item List" is a simple, web-based SaaS application designed to empower users with zero technical knowledge to create and manage lists of any kind.
All project must only have files in `en-us`.
Any word in another language (such as pt-br) is not allowed in any file in this repository.

## Core Philosophy
- **Minimalist & Accessible:** Built for users with limited technical literacy.
- **High Abstraction:** Prioritize opinionated, high-level libraries.
- **English-Only:** All content in en-us.
- **Zero-Code Phase:** No code until explicit instruction.

## Error Handling Policy
- **No Console Logging:** The use of `console.error` is strictly prohibited.
- **Exceptions Only:** All errors must be handled using exceptions. Errors must either be caught and handled locally or allowed to propagate for analysis.

## UX Guidelines
- **Visuals:** Full dark mode (background: `#000000`, text: `#FFFFFF`).
- **Sidebar:** Collapsible, containing lists (VSCode/GCP-style).
- **Selection:** Selected list highlighted with a dark blue background.
- **Onboarding:** New users start with a pre-created "List" automatically selected.
- **Interactions:**
    - Single click: Load list groups/items.
    - Long-press (mobile) / Hover (desktop): Enable "Edit Mode" (Rename, Duplicate, Reorder, Delete - using icons only, represented by a three-dot menu icon).
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
- **Database:** PostgreSQL (Local Docker container for development)
- **ORM:** Prisma
## Authentication
- **Authentication:** Auth.js (v5) - Google Provider only. 
- **Data Policy:** The Prisma Adapter requires standard fields (`email`, `name`, `image`) to manage user sessions and account linking. These fields are persisted to support Auth.js/Prisma Adapter functionality.
- **Secrets Management:** Sensitive secrets (`AUTH_GOOGLE_SECRET`, `AUTH_SECRET`) MUST be managed using Google Secret Manager in production environments. See `docs/GCP_AUTH_DEPLOY.md` for details.


