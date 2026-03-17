# Phase 3: List Management UI

## Objective
Implement the core list management dashboard while ensuring architectural extensibility for future MCP/API integration.

## Architectural Strategy: "Service-First"
To support both the Web UI and potential MCP/API access, the business logic will be encapsulated in a dedicated `Service Layer`.

1.  **Service Layer (`src/services/`)**: Contains pure business logic and Prisma interactions. No dependency on Next.js/HTTP.
2.  **Delivery Layer (Web UI)**: Next.js Server Actions and Server Components that consume the Service Layer.
3.  **Delivery Layer (MCP/API)**: Future-proofed; can import `src/services/` directly.

## Component Architecture (Vanilla CSS)
- **`Dashboard` (`/dashboard`)**: Lists all managed lists.
- **`ListContainer`**: Orchestrates the view of a specific list, its groups, and top-level items.
- **`GroupNode`**: Recursive component for hierarchical group structure.
- **`ItemRow`**: Atomic unit for item management (quantity, name).

## Development Roadmap
1.  **Setup Infrastructure**: Create `src/services/` and `src/app/dashboard/` skeleton.
2.  **Core Services**: Implement CRUD for Lists, Groups, and Items in `src/services/`.
3.  **Dashboard Implementation**: Basic list view and creation capability.
4.  **List View Implementation**: Detailed view with group/item interactivity.
5.  **Refinement**: Accessibility and responsive styling using Vanilla CSS.

## UX Principles
- Minimalist interface.
- Instant feedback via Server Actions.
- Accessible, semantic HTML.
- Responsive design tailored for ease of use.
