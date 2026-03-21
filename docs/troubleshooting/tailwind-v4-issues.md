# Troubleshooting: Tailwind CSS v4 Build Errors

## Issue: `CssSyntaxError: ... Cannot apply unknown utility class`

### Context
When using Tailwind CSS v4, traditional `@tailwind` directives (e.g., `@tailwind base;`) and certain `@apply` syntax using custom theme colors or specific utilities might fail if not properly configured for the v4 engine, especially when using Turbopack.

### Symptoms
The build process fails with an error similar to:
`CssSyntaxError: tailwindcss: ... Cannot apply unknown utility class '...'`

### Resolution
1. **Update Imports:** Replace `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;` with a single `@import "tailwindcss";` at the top of your `globals.css`.
2. **Variable Usage:** In `@apply` rules, reference custom CSS variables directly using `var(--variable-name)` instead of relying on theme color names if the v4 engine is struggling to resolve them during compilation.

**Example Fix (`src/app/globals.css`):**
```css
@import "tailwindcss";

@layer components {
  .btn-custom {
    /* Use direct CSS variable reference */
    @apply bg-[var(--accent-color)] text-[var(--text-color)];
  }
}
```
---
See Tailwind CSS v4 migration documentation for more details.
