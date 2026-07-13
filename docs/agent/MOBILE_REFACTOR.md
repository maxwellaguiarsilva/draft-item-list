# Mobile-First UX/UI Refactoring Plan

## 1. Goal
Transition the "Draft Item List" application from desktop-focused hover interactions to mobile-first tap interactions, ensuring accessible touch targets and consistent UX across devices.

## 2. Interaction Design
- **Core Principle:** Replace hover-based "Edit Mode" triggers with persistent or explicitly toggled action menus.
- **Action Menu:** All entities (List, Group, Item) will feature a dedicated "three-dot" menu button (`...`) accessible by touch.
- **Tap Targets:** All interactive elements must have a minimum touch target size of 44x44px.
- **Layout:**
  - **Desktop:** The three-dot menu can remain visible on hover or persistent.
  - **Mobile:** The three-dot menu is persistent to allow easy access to actions (Rename, Duplicate, Move, Delete).

## 3. Implementation Strategy
1. **Component Update:** Modify `src/components/ListDetailView.tsx` to replace `onMouseEnter`/`onMouseLeave` state with a permanent (or toggleable) menu visibility.
2. **Standardization:** Create a re-usable `ActionMenu` component if patterns become repetitive.
3. **Accessibility:** Ensure all button elements have appropriate `aria-labels` and satisfy touch target requirements.

## 4. Phases
- [ ] Phase 1: Create standard `ActionMenu` UI component.
- [ ] Phase 2: Migrate `ListDetailView` components (List, Group, Item) to use `ActionMenu`.
- [ ] Phase 3: Cleanup CSS/Tailwind hover-dependent styles.
- [ ] Phase 4: Verify touch targets on mobile viewports.
