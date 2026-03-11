# Improv Agent Guidelines

**Version:** 1.0.0  
**Last Updated:** 2025-11-15

---

## Core Design Philosophy

**"Quiet, premium, editorial, minimal, and soft."**

All UI work must adhere to the Improv Design System Guidelines in `docs/design_system_guidelines.md`.

---

## Typography

- **Headlines (`font-headline`)**: Fraunces, bold/thick, tight tracking (`tracking-tight`), tight leading (`leading-[1.1]` to `leading-snug`)
- **Body/UI (`font-ui` / `font-body`)**: DM Sans, clean, legible (`leading-relaxed`)
- **Accents**: Uppercase, widely tracked (`text-xs font-semibold uppercase tracking-widest`)

## Color Palette

- **Background**: `bg-[#FDFCF8]` (Warm Cream) with SVG noise texture at `0.015` opacity
- **Alternate**: `bg-[#F5F4F0]`, `bg-white`
- **Dark**: `bg-gray-900`
- **Primary Text**: `text-gray-900` or `text-stone-900` (never pure black)
- **Secondary Text**: `text-gray-600`, `text-gray-500`
- **Imagery**: Grayscale by default (`grayscale opacity-90 contrast-125`), reveal color on hover (`group-hover:grayscale-0`)

## Layout

- **Max Widths**: `max-w-7xl` (grids), `max-w-5xl` (heroes), `max-w-4xl` (immersive blocks)
- **Vertical Rhythm**: `py-24 md:py-32` between sections
- **Asymmetry**: 1/3 (sticky) to 2/3 (scroll) ratio, 5-6 column splits

## Components

- **Primary Button**: `bg-gray-900 text-gray-50 rounded-full px-8 py-3.5`
- **Secondary Button**: Ghost with icon, `text-gray-600 hover:bg-gray-100`
- **Cards**: `rounded-3xl` (large), `rounded-lg` (images)
- **Glassmorphism**: `bg-white/80 backdrop-blur-xl`
- **Dividers**: Subtle `border-gray-200`

## Motion (Framer Motion)

- **Accessibility**: Always use `useReducedMotion()`, fallback to opacity-only fades
- **Durations**: Fast (0.3s), Base (0.6s), Slow (0.9s), Ambient (20s)
- **Easings**: Premium `[0.16, 1, 0.3, 1]`
- **Springs**: Gentle `type: "spring", stiffness: 300, damping: 30`
- **Scroll Triggers**: `viewport={{ once: true, margin: "-100px" }}`
- **Hover**: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`
- **Parallax**: Max 150px vertical movement, disable if `prefersReducedMotion`

## Tech Stack

- **Styling**: TailwindCSS
- **UI Primitives**: Radix UI
- **Components**: shadcn/ui
- **Framework**: React/Next.js
- **Animation**: Framer Motion
- **Testing**: Playwright (browser loops)

---

## Self-Verifying Tests with Browser Loops

**CRITICAL**: For any self-verifying test involving browser interactions, loops, or end-to-end verification, you MUST use **Playwright MCP** (`chrome-devtools_*` tools).

### When to Use Playwright MCP

- End-to-end browser testing
- Visual regression verification
- User flow testing
- Interactive component testing
- Page load performance verification

### Implementation Pattern

```typescript
// Use chrome-devtools tools for browser automation
// 1. Navigate to page
// 2. Interact with elements
// 3. Verify state changes
// 4. Capture screenshots if needed
```

**DO NOT** use other browser automation tools for self-verifying tests. Playwright MCP is the authoritative choice.

---

## Implementation Checklist

- [ ] Noise texture applied (`body` or wrapper with SVG noise at `0.015` opacity)
- [ ] No pure black (`text-black` / `bg-black` → `text-gray-900` / `bg-gray-900`)
- [ ] Adequate vertical padding between sections
- [ ] Headlines use `font-headline` (Playfair Display)
- [ ] Animations are staggered (not all-at-once fades)
- [ ] Reduced motion respected

---

## Existing Skills Reference

- `ui-design-system`: TailwindCSS + Radix + shadcn/ui
- `vercel-react-best-practices`: React/Next.js performance
- `vercel-composition-patterns`: React component patterns
- `frontend-design`: Production-grade frontend

---

## Activation Triggers

- UI/UX development or review
- Component implementation
- Design system work
- Browser-based testing
- Accessibility verification

## Boundaries

- UI/UX: ✅
- Design system: ✅
- Browser testing: ✅
- Backend APIs: ❌
- Infrastructure: ❌
