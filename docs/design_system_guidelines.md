# Improv Design System Guidelines

This document outlines the visual language, technical constraints, and motion philosophy established on the Landing Page. It serves as the source of truth for all new pages, components, and refactors across the Improv application.

The core directive: **"Quiet, premium, editorial, minimal, and soft."**

## 1. Typography Hierarchy

The app leverages a classic high-contrast Serif + Sans pairing.

- **Headlines (`font-headline`)**: Uses `Playfair Display`.
  - **Style**: Always thick/bold (`font-medium` or `font-semibold`), tightly tracked (`tracking-tight`), and tightly leaded (`leading-[1.1]` to `leading-snug`).
  - **Usage**: Used exclusively for primary page titles, section headers, and major quote blocks.
  - **Scale**: Massive on desktop (`text-5xl` to `text-8xl` for heroes), scaling down responsively (`text-3xl md:text-5xl` for sections).
- **Body & UI (`font-ui` / `font-body`)**: Uses `Inter`.
  - **Style**: Clean and legible (`leading-relaxed`).
  - **Usage**: Paragraph text, buttons, navigation links, and small labels.
  - **Scale**: `text-base md:text-lg` for readable secondary text. `text-xs md:text-sm` for UI controls, meta text, and labels.
- **Accents**: Small, uppercase, widely tracked text (`text-xs font-semibold uppercase tracking-widest`) is used frequently as section eyebrows (e.g., "THE PHILOSOPHY", "CURRENT PROMPT").

## 2. Color & Texture (The Editorial Palette)

The app avoids pure whites and pure blacks, opting for a warm, printed paper feel.

- **Backgrounds**:
  - **Primary Page**: `bg-[#FDFCF8]` (Warm Cream) with an SVG noise texture overlay at `0.015` opacity.
  - **Alternate Sections**: `bg-[#F5F4F0]` or `bg-white` to create subtle banding without harsh borders.
  - **Dark Sections**: `bg-gray-900` for heavy contrast areas like the final CTA.
- **Foreground (Text)**:
  - **Primary Text**: `text-gray-900` or `text-stone-900` (Charcoal, not pure `#000`).
  - **Secondary Text**: `text-gray-600` or `text-gray-500` for subtitles and long descriptive paragraphs.
  - **Muted Accents**: `text-gray-400` for eyebrows, timestamps, and subtle decorative lines.
- **Imagery**: Grayscale by default (`grayscale opacity-90 contrast-125`), revealing color smoothly on hover (`group-hover:grayscale-0`).

## 3. Layout & Structure

Generous whitespace and purposeful constraints define the layout.

- **Max Widths**: Content is clamped using `max-w-7xl` for wide grids, `max-w-5xl` for heroes, and `max-w-4xl` for immersive blocks (like the Audio Visualizer or Testimonial).
- **Vertical Rhythm**: Massive padding separates distinct thoughts. Use `py-24 md:py-32` between major `<section>` blocks.
- **Asymmetry**: The Bento/Split layouts often favor a 1/3 (sticky text) to 2/3 (scrolling content) ratio, or a 5-column to 6-column split on a 12-column grid.

## 4. Components & Shapes

- **Buttons**:
  - Primary: Dark pill shape (`bg-gray-900 text-gray-50 rounded-full px-8 py-3.5`).
  - Secondary: Ghost buttons with icon accents (`text-gray-600 hover:bg-gray-100`).
- **Cards & Containers**:
  - Softly rounded borders: `rounded-3xl` for massive highlight blocks, `rounded-lg` for image wrappers.
  - Glassmorphism: Use pure white with low opacity and blur (`bg-white/80 backdrop-blur-xl`) rather than solid heavy shapes.
- **Dividers**: Extremely subtle lines (`border-gray-200`) instead of heavy shadows to separate sections or active states.

## 5. Motion & Interaction

Motion must feel deliberate, gentle, and buttery-smooth. We rely exclusively on `framer-motion` and centralize all timing logic via motion tokens.

- **Accessibility First**: Always use `useReducedMotion()` from `framer-motion`. If true, fall back to pure opacity fades (`opacity: 1`) without scaling, blurring, moving on the Y-axis, or infinite ambient rotations.
- **Motion Tokens**:
  - **Durations**: Fast (0.3s), Base (0.6s), Slow (0.9s), Ambient (20s).
  - **Easings**: Premium (`[0.16, 1, 0.3, 1]`) for primary structural reveals.
  - **Springs**: Gentle (`type: "spring", stiffness: 300, damping: 30`) for interactive hover states.
- **Entrance Setup**: Avoid repeating generic, all-at-once fades to create hierarchy.
  - **Nav/Static Lines**: Use a simple, non-moving opacity fade over Base duration.
  - **Text Blocks**: Use a staggered slow fade-up (Y: 16px) over Slow duration.
  - **Large Immersive Blocks**: Break up monotony with a dimensional scale-blur reveal (`scale: 0.98 -> 1`, `filter: blur(4px) -> blur(0px)`).
  - **Scroll Triggers**: Always use `viewport={{ once: true, margin: "-100px" }}` so sections fade in slightly _after_ entering the viewport.
- **Hover States**:
  - Buttons: `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` wrapping `transition={motionTokens.spring.gentle}`. No extreme bouncing.
  - Image Reveals: Use scroll-based reveals combined with hover states (`group-hover:grayscale-0`) over very long transitions (`duration-1000`).
- **Parallax**: Tie subtle vertical movements (0px to 150px maximum) to the `useScroll()` progress mapped to floating background blobs or cards overlapping sections. Disable if `prefersReducedMotion` is true.

## 6. Implementation Checklist for New Pages

Before submitting a new UI flow, verify:

1.  **Does it have the noise texture?** Ensure the `body` tag or page wrapper inherits the subtle SVG noise.
2.  **Are the blacks too harsh?** Replace any `text-black` or `bg-black` with `text-gray-900` / `stone-900`.
3.  **Is there enough breathing room?** Double the `padding-y` between sections if it feels cramped.
4.  **Are the headings serif?** Ensure `font-headline` is used exclusively for `h1`, `h2`, `h3`.
5.  **Is the animation staggered?** Pages should ripple into view gently, not snap in statically.
