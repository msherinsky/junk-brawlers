# Junk Brawlers — Design System Reference

## Brand Identity

**Archetype:** The Brawler — raw competence, direct, no-nonsense.  
**Tone:** Earned trust. Every claim is anchored to a real review or a specific number.  
**Emotional arc:** Frustration (pain points) → Relief (Tony solves it) → Confidence (proof).

---

## Color System

All colors are defined as CSS custom properties on `:root` in `css/style.css`.

### Primary — Purple (Shield, Brand)
| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` | `#7B35D4` | CTAs, accents, active states |
| `--color-primary-dark` | `#5E22AA` | Hover states |
| `--color-primary-deeper` | `#420E80` | Deep hover, gradient endpoint |
| `--color-primary-mid` | `#B584F5` | Footer links, soft accents |
| `--color-primary-light` | `#EDE8F8` | Light section tints |

### Fire Orange — Action & Urgency
| Token | Hex | Use |
|-------|-----|-----|
| `--color-fire` | `#FF7A00` | Primary CTA button, hero emphasis, fire accents |
| `--color-fire-light` | `#FF9D3A` | Light variant |
| `--color-fire-dark` | `#CC5500` | Dark variant |
| `--color-fire-glow` | `rgba(255,122,0,0.35)` | Text-shadow / box-shadow glow |

### Steel — Neutral Utility
| Token | Hex | Use |
|-------|-----|-----|
| `--color-steel-dark` | `#374151` | Body text in components |
| `--color-steel` | `#6B7280` | Secondary text |
| `--color-steel-light` | `#D1D5DB` | Trust ticker icons |

### Dark Scale — Void to Section
| Token | Hex | Use |
|-------|-----|-----|
| `--color-void` | `#040008` | Absolute black base |
| `--color-hero-bg` | `#0A000F` | Hero section background |
| `--color-dark-section` | `#080014` | Services, results section background |
| `--color-review-bg` | `#060010` | Trust quotes section background |
| `--color-footer` | `#030006` | Footer background |
| `--color-header` | `#07001A` | Mobile nav background |

### Light Scale
| Token | Hex | Use |
|-------|-----|-----|
| `--color-warm-light` | `#f5f5f5` | Light section backgrounds |
| `--color-warm-lighter` | `#ffffff` | Pure white sections |
| `--color-hiw-bg` | `#f5f5f5` | How It Works section |
| `--color-light-alt` | `#f5f5f5` | FAQ, locations section |

### Neutral & Structural
| Token | Hex | Use |
|-------|-----|-----|
| `--color-white` | `#FFFFFF` | Text on dark, button text |
| `--color-dark` | `#1A1A1A` | Dark text on light |
| `--color-body` | `#1C1C2E` | Default body text |
| `--color-border` | `#E0DDD8` | Card borders, dividers |

---

## Typography

### Font Families
| Token | Value | Use |
|-------|-------|-----|
| `--font-heading` | `'Barlow Condensed', sans-serif` | H1–H4, section labels, stats |
| `--font` | `'Barlow', sans-serif` | Body, navigation, buttons |

Files self-hosted at `fonts/` — see `@font-face` declarations in `css/style.css`.

### Loaded Weights
- **Barlow:** 400 (body), 500 (medium), 600 (semibold), 700 (bold)
- **Barlow Condensed:** 600, 700, 800 (extra-bold — primary heading weight)

### Base Scale
- Body: `15px` / `1.6` line-height
- Headings: `font-weight: 800`, `font-family: var(--font-heading)`

### Heading Sizes (clamp pattern)
| Use | Value |
|-----|-------|
| Hero tagline | `clamp(2.25rem, 4vw, 4.5rem)` |
| Hero emphasis line | `clamp(2.875rem, 5.2vw, 6rem)` |
| Section H2 | `clamp(28px, 3.5vw, 44px)` |
| Owner H2 | `clamp(26px, 3.2vw, 42px)` |
| Final CTA H2 | `clamp(28px, 4vw, 44px)` |
| Section bridge | `clamp(26px, 3.5vw, 48px)` |
| Owner bridge | `clamp(32px, 4.5vw, 60px)` |

### Text Treatments
- **Section bridge:** italic, underline with `--color-fire`, `text-underline-offset: 6px`
- **Pain text:** `clamp(17px, 2vw, 20px)`, weight 500, dark-to-light gradient background
- **Labels / eyebrows:** `10–12px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 1.5–2px`

---

## Spacing & Shape

| Token | Value | Use |
|-------|-------|-----|
| `--radius-card` | `6px` | Service cards, modal |
| `--radius-pill` | `22px` | Location pills, small badges |
| `--transition` | `0.25s ease` | All hover/state transitions |

### Section Padding Convention
- Desktop sections: `80px 32px` (vertical / horizontal)
- Mobile (≤768px): reduce to `52px 20px`
- Max content width: `1100px` for wide layouts, `820–900px` for reading layouts

### Clip-Path Transitions
Used between sections to create angled breaks:
- `.svc-section`: `clip-path: polygon(0 6vw, 100% 0%, 100% 100%, 0% 100%)`
- `.eco-section`: `clip-path: polygon(0 0%, 100% 6vw, 100% 100%, 0% 100%)`
- Negative `margin-top: -6vw` pulls the next section up to overlap.

---

## Components

### Buttons

| Class | Background | Use |
|-------|-----------|-----|
| `.btn-fire` | `--color-fire` | Primary CTA — phone calls |
| `.btn-primary` | `--color-primary` | Secondary CTAs |
| `.btn-ghost-white` | Transparent / white border | Header free quote |
| `.btn-phone` | `--color-fire` | Header phone CTA |

All buttons: `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.5px`, `border-radius: 4px`, hover via `opacity: 0.88`.

`.btn-fire` and `.btn-primary` shared base: `padding: 13px 28px`, `font-size: 14px`.

### Header
- Height: `70px`, sticky top, `background: #000`, `z-index: 1000`
- Logo left, nav center, CTAs right — collapses to hamburger at ≤768px
- Mobile nav: slides in below header, `background: #07001A`

### Section Accent Bars
- `width: 56px`, `height: 4px`, `background: #8000FF`, `border-radius: 9px`
- Used under section H2s in dark sections
- Wider variant: `width: 80px`, `height: 5px`, `background: var(--color-primary)` — used in light sections (FAQ, locations)

### Review Widgets (`.rw-mini`)
- Left border: `3px solid --color-fire`
- Dark variant: `background: rgba(255,255,255,0.06)` (on dark sections)
- Light variant (`.rw-mini--light`): `background: rgba(17,17,17,0.04)`, `border-left-color: --color-primary`

### Trust Quote Cards (`.tq-card`)
- Background: `rgba(128,0,255,0.1)`
- Border: `1px solid rgba(128,0,255,0.25)`
- Top border: `3px solid --color-fire`
- 3-column grid, collapses to 1 column on mobile

### Service Cards (`.svc-card`)
- Full-bleed photo with dark gradient overlay
- Hover reveals detail panel (slide up) — hidden on mobile
- Min-height: `340px` desktop, `180px` mobile
- 3-column grid → 2-column on mobile, last card spans full width

### Location Pills (`.location-pill`)
- Border: `1px solid --color-border`, `border-radius: 22px`
- Active/hover: `background: --color-primary`, white text
- CTA pill variant: always purple (`.location-pill--cta`)

### FAQ Items (`.faq-item`)
- Toggle button becomes purple + rotates 45° when open
- Answer padding uses `44px` left offset to align under question text
- Fire-colored question numbers

### Before/After Sliders (`.ba-slider`)
- Drag handle centered at 50% default
- `.ba-before` clipped with `clip-path: inset(0 X% 0 0)` — JS updates X on drag
- Labels: dark pill with `opacity 0.62` background

---

## Section Color Flow

Top to bottom the page alternates dark/light to create rhythm:

```
Hero              → very dark (#0A000F)
Trust Ticker      → dark gradient
Pain Section      → dark purple gradient → bleeds into white at bottom
Owner Section     → white
Services Section  → dark (#080014) → clips into light HIW
How It Works      → light (#f5f5f5)
Eco Section       → white (clips up into HIW)
Trust Quotes      → very dark (#060010)
FAQ               → light (#f5f5f5)
Locations         → light (#f5f5f5)
Final CTA         → very dark (#0D0010) with dot-grid overlay
Footer            → deepest dark (#030006)
```

---

## Green Accent (Eco Section Only)

The eco/disposal section uses `#2D7A4F` (forest green) as its accent — intentionally distinct from the brand purple/fire palette to signal environmental responsibility. Not a brand color, just contextual.

---

## Breakpoints

| Breakpoint | What changes |
|-----------|-------------|
| `≤900px` | Hero goes vertical (stacked), owner grid collapses |
| `≤768px` | Desktop nav hides, hamburger shows; service grid → 2-col; footer → 1-col |
| `≤640px` | Before/after grid → 1-col |
| `≤600px` | HIW steps stack; eco arrows rotate 90° |
| `≤480px` | Hero buttons stack vertically |

---

## Animation

- Trust ticker: `animation: ticker-scroll 160s linear infinite` — slow marquee
- Service card hover: `transform: translateY(100%) → translateY(0)`, cubic-bezier ease `0.38s`
- FAQ toggle: `transform: rotate(45deg)` on open
- Nav dropdown arrow: `rotate(180deg)` on open
- Final CTA phone: `scale(1.02)` on hover
