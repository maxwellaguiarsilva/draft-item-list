# Tailwind CSS Best Practices & Troubleshooting

Guidance for Tailwind CSS v4 in the project.

## Troubleshooting Build Errors

### Issue: `CssSyntaxError: Cannot apply unknown utility class`

When using Tailwind v4, old directives and `@apply` syntax might fail.

#### Resolution
1. **Update Imports:** Replace legacy `@tailwind` directives in `src/app/globals.css`:
   ```css
   @import "tailwindcss";
   ```
2. **Variable Usage:** Reference CSS variables directly for custom colors:
   ```css
   @layer components {
     .btn-custom {
       @apply bg-[var(--accent-color)] text-[var(--text-color)];
     }
   }
   ```
---
Reference: [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-migration)
