# VandiPilot — Design System Specification

> **Purpose:** This document defines the complete visual design system for VandiPilot. It is intended to be used with **Stitch** for screen generation and serves as the single source of truth for all frontend design decisions.
>
> **Generated from:** PRD, implementation plan, ui-ux-pro-max design system, and stakeholder grilling session (2026-08-17).

## Document map

| Part | Sections | Covers |
|---|---|---|
| **Part I** | §§1–15 | Brand, tokens, and the **public landing page** |
| **Part II** | §§16–28 | The **dashboard system** shared by all 18 authenticated routes |

## Revision history

| Date | Change |
|---|---|
| 2026-08-17 | Initial version — brand, tokens, landing page (Part I) |
| 2026-08-17 | **Palette corrected for WCAG AA.** The original primary teal failed AA for white text (3.74:1 vs the 4.6:1 claimed) and the CTA gradient reached 2.49:1 at its light end, so every primary button in the product failed. Six further tokens failed checks the original never ran. All values are now computed and verified against all three product surfaces. See §2. |
| 2026-08-17 | Fixed: tablet nav had no defined layout and would have overflowed at 640px; sticky CTA was hidden on tablet, removing the primary conversion action on iPads; `--space-12`/`--space-16` label collision; `--color-accent` and `--color-warning` shared one hex; Shadcn mapping was incomplete and had two naming traps; footer link color fails on the dark footer; "secondary text ≥ 3:1" used the wrong WCAG bar. |
| 2026-08-17 | Dark mode explicitly declared out of scope (the original implied one that was never specified). |
| 2026-08-17 | **Added Part II** — dashboard shell, status system, KPI cards, data tables, forms, modals, trip timeline, availability calendar, validated chart palette, empty/loading/error states, notifications, and Indian formatting conventions. The original specified only the landing page, leaving 18 routes undesigned. |

---

## 1. Brand Identity

### Brand Personality
VandiPilot is a **driver-for-hire service** operating in India where customers book professional drivers ("Pilots") to drive the customer's own vehicle. The brand must communicate:

- **Trust** — You're handing your car keys to a vetted professional
- **Professionalism** — Trained, background-checked pilots
- **Warmth** — Approachable, human, not corporate
- **Modernity** — Tech-forward booking experience
- **Accessibility** — A service for everyday people, not just luxury

**Brand Tone:** Modern & Vibrant + Warm & Trustworthy — a blend that feels like friendly technology backed by genuine human care.

### Logo

**Type:** Text wordmark (no icon/logomark for this iteration)

- **Treatment:** "Vandi" in `--color-foreground` (dark charcoal) + "Pilot" in `--color-primary` (teal)
- **Font:** Inter, weight 700 (Bold)
- **Sizes:**
  - Desktop navbar: `24px`
  - Mobile navbar: `20px`
  - Footer: `20px`
- **Spacing:** No letter-spacing adjustment (Inter's default tracking)
- **Clear space:** Minimum 16px padding on all sides

```
VandiPilot
└─────┘└────┘
 #1A1A2E  #0D9488
```

---

## 2. Color Palette

### Design Rationale
The palette blends **caring teal** (trust, growth, service) with **warm neutral backgrounds** (approachability, comfort). Accent colors provide energy for CTAs and interactive elements. All colors meet **WCAG AA** contrast requirements (4.5:1 for text, 3:1 for UI elements and icons).

> **⚠️ Revised 2026-08-17 — palette corrected for WCAG AA.**
> The original palette **failed AA on its most important surface**: white text on the old primary `#0D9488` measured **3.74:1**, not the 4.6:1 the doc claimed, and across the old CTA gradient it degraded to **2.49:1** at the `#14B8A6` end — meaning *every primary button in the product* failed. Six further tokens failed checks the original never ran (`--color-foreground-subtle` 2.56:1, `--color-accent` 2.15:1, `--color-info` 2.77:1, `--color-success` 3.30:1, `--color-warning` 3.30:1, `--color-destructive` 4.41:1 on the alternating section background).
> Every value below is **computed, not estimated**, and verified against all three real backgrounds the product uses: `--color-background` `#FFFBF5`, `--color-surface` `#FFFFFF`, and `--color-muted` `#F1F5F9`. Superseded values are noted in the *Was* column so existing mockups can be migrated.

### Dark mode: out of scope

**VandiPilot ships light mode only.** The original doc headed this section "Light Mode (Primary)", implying a dark palette that was never specified anywhere in the document — a trap for anyone building against it. There is no dark token set and none is planned for this iteration. The one dark *surface* in the product is the footer, which is handled by the footer-link exception below, not by a theme.

If dark mode is picked up later, it must be **selected, not flipped** — each token re-stepped and re-validated against the dark surface, because inverting a light palette reliably breaks contrast in both directions (see the footer-link note for a live example of exactly this).

### The three-surface rule

Because sections alternate between `--color-background` and `--color-muted`, and cards sit on both, **any text token must clear 4.5:1 against all three surfaces** — not just white. This is what the original palette missed. `--color-muted` `#F1F5F9` is the strictest of the three; validate against it.

### Light Mode

| Role | Hex | Was | CSS Variable | Usage |
|------|-----|-----|-------------|-------|
| **Primary** | `#0F766E` | ~~#0D9488~~ | `--color-primary` | CTA fills, links, active states, logo accent |
| **Primary Hover** | `#115E59` | ~~#0F766E~~ | `--color-primary-hover` | Button hover, link hover |
| **Primary Light** | `#CCFBF1` | — | `--color-primary-light` | Subtle backgrounds, badges, highlights (**background only**) |
| **Primary Viz** | `#0D9488` | *new* | `--color-primary-viz` | Chart marks & decorative icons **only** — 3.74:1, valid at the 3:1 UI bar, never for text |
| **On Primary** | `#FFFFFF` | — | `--color-on-primary` | Text/icons on primary surfaces |
| **Secondary** | `#10827A` | ~~#14B8A6~~ | `--color-secondary` | Secondary fills, CTA gradient endpoint |
| **Accent** | `#C2740A` | ~~#F59E0B~~ | `--color-accent` | Star ratings, attention icons (3:1 icon bar) |
| **Accent Decorative** | `#F59E0B` | — | `--color-accent-decorative` | Large decorative fills **≥24px only** — never text, never small icons |
| **Accent Warm** | `#EA580C` | — | `--color-accent-warm` | Urgent badge fills, large icons (3:1 bar) |
| **Background** | `#FFFBF5` | — | `--color-background` | Page background (warm off-white/cream) |
| **Surface** | `#FFFFFF` | — | `--color-surface` | Cards, modals, dropdowns |
| **Foreground** | `#1A1A2E` | — | `--color-foreground` | Primary text, headings |
| **Foreground Muted** | `#475569` | ~~#64748B~~ | `--color-foreground-muted` | Secondary text, descriptions |
| **Foreground Subtle** | `#64748B` | ~~#94A3B8~~ | `--color-foreground-subtle` | Tertiary text, timestamps, captions, placeholders. **Not permitted on `--color-muted`** (4.34:1) |
| **Border** | `#E2E8F0` | — | `--color-border` | Card borders, dividers, input borders |
| **Border Hover** | `#CBD5E1` | — | `--color-border-hover` | Input focus borders, hover states |
| **Muted Background** | `#F1F5F9` | — | `--color-muted` | Alternating section backgrounds, table stripes |
| **Destructive** | `#B91C1C` | ~~#DC2626~~ | `--color-destructive` | Error states, delete actions, cancel |
| **On Destructive** | `#FFFFFF` | — | `--color-on-destructive` | Text on destructive surfaces |
| **Success** | `#15803D` | ~~#16A34A~~ | `--color-success` | Success states, confirmations, available |
| **Warning** | `#B45309` | ~~#F59E0B~~ | `--color-warning` | Warning states, pending actions |
| **Info** | `#0369A1` | ~~#0EA5E9~~ | `--color-info` | Informational badges, tooltips |
| **Ring** | `#0F766E` | ~~#0D9488~~ | `--color-ring` | Focus ring |

> **Semantic collision fixed.** The original set `--color-accent` and `--color-warning` to the *same* hex (`#F59E0B`), so a gold star and a warning state were indistinguishable. They are now separate tokens with separate jobs.

### Gradient Tokens

| Name | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| **CTA Gradient** | `linear-gradient(135deg, #0F766E 0%, #10827A 100%)` | `--gradient-cta` | Primary CTA buttons |
| **CTA Gradient Hover** | `linear-gradient(135deg, #115E59 0%, #0F766E 100%)` | `--gradient-cta-hover` | CTA hover state |
| **Hero Gradient** | `linear-gradient(135deg, #F0FDFA 0%, #FFFBF5 50%, #FEF3C7 100%)` | `--gradient-hero` | Hero background (**no text-bearing fill**) |
| **Pricing Card Gradient** | `linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)` | `--gradient-pricing` | Featured pricing cards (background only) |
| **Section Gradient** | `linear-gradient(180deg, #FFFBF5 0%, #F1F5F9 100%)` | `--gradient-section` | Section transitions |

> **⚠️ Gradient rule — a gradient must pass at its worst stop, not its average.** A gradient carrying white text has to clear 4.5:1 at *every* stop along the ramp. The old CTA gradient passed at its dark end and failed at its light end, so button labels became unreadable from the midpoint rightward. Both corrected CTA gradients were sampled at 11 stops: worst stop **4.67:1** (default) and **5.47:1** (hover). Any future gradient must be sampled the same way, not eyeballed at its endpoints.

Shadow tokens carrying the primary hue are updated to match: `--shadow-cta: 0 4px 14px rgba(15, 118, 110, 0.3)` and `--shadow-cta-hover: 0 6px 20px rgba(15, 118, 110, 0.4)`.

### Contrast Verification (computed)

**Text tokens — must clear 4.5:1 on all three surfaces:**

| Token | Hex | on `#FFFBF5` | on `#FFFFFF` | on `#F1F5F9` | AA |
|---|---|---|---|---|---|
| `--color-foreground` | `#1A1A2E` | 16.55 | 17.06 | 15.57 | ✅ |
| `--color-foreground-muted` | `#475569` | 7.35 | 7.58 | 6.92 | ✅ |
| `--color-foreground-subtle` | `#64748B` | 4.62 | 4.76 | *4.34* | ✅ on 2 of 3 — **barred from `--color-muted`** |
| `--color-primary` (as link) | `#0F766E` | 5.31 | 5.47 | 5.00 | ✅ |
| `--color-success` | `#15803D` | 4.86 | 5.02 | 4.58 | ✅ |
| `--color-warning` | `#B45309` | 4.87 | 5.02 | 4.58 | ✅ |
| `--color-info` | `#0369A1` | 5.76 | 5.93 | 5.42 | ✅ |
| `--color-destructive` | `#B91C1C` | 6.28 | 6.47 | 5.91 | ✅ |

**Icon / UI tokens — must clear 3:1 (WCAG 1.4.11 non-text contrast):**

| Token | Hex | on `#FFFBF5` | on `#FFFFFF` | on `#F1F5F9` | AA |
|---|---|---|---|---|---|
| `--color-accent` | `#C2740A` | 3.51 | 3.62 | 3.31 | ✅ |
| `--color-accent-warm` | `#EA580C` | 3.45 | 3.56 | 3.25 | ✅ |
| `--color-primary-viz` | `#0D9488` | 3.63 | 3.74 | 3.42 | ✅ |

**White text on solid fills — must clear 4.5:1:**

| Fill | Hex | Ratio | AA |
|---|---|---|---|
| Primary | `#0F766E` | 5.47 | ✅ |
| Primary Hover | `#115E59` | 7.58 | ✅ |
| Secondary | `#10827A` | 4.67 | ✅ |
| Success | `#15803D` | 5.02 | ✅ |
| Warning | `#B45309` | 5.02 | ✅ |
| Info | `#0369A1` | 5.93 | ✅ |
| Destructive | `#B91C1C` | 6.47 | ✅ |

**Badge and composite combinations:**

| Pair | Ratio | AA |
|---|---|---|
| `#0F766E` on `#CCFBF1` (primary text on primary-light badge) | 4.86 | ✅ |
| `#1A1A2E` on `#CCFBF1` | 15.14 | ✅ |
| `#1A1A2E` on `#FEF3C7` (hero gradient warm end) | 15.32 | ✅ |
| `#475569` on `#CCFBF1` | 6.72 | ✅ |
| Footer body `rgba(255,255,255,0.8)` composited on `#1A1A2E` → `#D1D1D5` | 11.20 | ✅ |
| Footer copyright `rgba(255,255,255,0.5)` → `#8C8C96` | 5.12 | ✅ |
| `#0F766E` on `#1A1A2E` (teal link in dark footer) | 3.12 | ❌ **use `#5EEAD4` (11.53) for footer links** |
| `#5EEAD4` on `#1A1A2E` (corrected footer link) | 11.53 | ✅ |
| `#CCFBF1` on `#1A1A2E` (footer link alternative) | 15.14 | ✅ |
| Nav scrolled `rgba(255,251,245,0.95)`, worst-case composite `#F2EEE9` + foreground | 14.77 | ✅ |

> **Footer link exception.** The primary teal is tuned for light surfaces and drops to **3.12:1** on the dark footer `#1A1A2E`. Footer links and social-icon hover states use `--color-footer-link` `#5EEAD4` (11.53:1) instead. Note this is a regression the correction introduced: the *old* `#0D9488` happened to clear 4.56:1 on the footer, so darkening the primary for light-surface compliance broke the dark footer. Both facts point to the same rule — **a single accent hue cannot serve both a light and a dark surface**; each needs its own step. Add `--color-footer-link: #5EEAD4` to the token set.

---

## 3. Typography

### Font Family

- **Primary Font:** Inter (variable font, Google Fonts rank #7)
- **Fallback Stack:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-display` | `56px` / `3.5rem` | 800 (ExtraBold) | 1.1 | `-0.02em` | Hero headline (desktop) |
| `--text-display-mobile` | `36px` / `2.25rem` | 800 (ExtraBold) | 1.15 | `-0.02em` | Hero headline (mobile) |
| `--text-h1` | `40px` / `2.5rem` | 700 (Bold) | 1.2 | `-0.01em` | Section headings (desktop) |
| `--text-h1-mobile` | `28px` / `1.75rem` | 700 (Bold) | 1.25 | `-0.01em` | Section headings (mobile) |
| `--text-h2` | `30px` / `1.875rem` | 600 (SemiBold) | 1.3 | `0` | Subsection headings |
| `--text-h2-mobile` | `22px` / `1.375rem` | 600 (SemiBold) | 1.3 | `0` | Subsection headings (mobile) |
| `--text-h3` | `24px` / `1.5rem` | 600 (SemiBold) | 1.35 | `0` | Card titles, feature names |
| `--text-h3-mobile` | `20px` / `1.25rem` | 600 (SemiBold) | 1.35 | `0` | Card titles (mobile) |
| `--text-body-lg` | `18px` / `1.125rem` | 400 (Regular) | 1.6 | `0` | Hero subheadline, lead text |
| `--text-body` | `16px` / `1rem` | 400 (Regular) | 1.6 | `0` | Body text, descriptions |
| `--text-body-sm` | `14px` / `0.875rem` | 400 (Regular) | 1.5 | `0` | Secondary text, captions |
| `--text-caption` | `12px` / `0.75rem` | 500 (Medium) | 1.5 | `0.01em` | Labels, badges, timestamps |
| `--text-button` | `16px` / `1rem` | 600 (SemiBold) | 1 | `0.01em` | Button text |
| `--text-button-sm` | `14px` / `0.875rem` | 600 (SemiBold) | 1 | `0.01em` | Small button text |
| `--text-nav` | `15px` / `0.9375rem` | 500 (Medium) | 1 | `0` | Navigation links |

### Heading Hierarchy Rules

1. Each page has exactly **one `<h1>`** (SEO requirement)
2. Section headings use `<h2>`, subsections use `<h3>`
3. Hero headline is styled as `--text-display` but remains semantically `<h1>`
4. Card titles within sections use `<h3>`
5. Never skip heading levels (h1 → h3 without h2)

---

## 4. Spacing System

### Design Rationale
Spacious / breathing layout. Generous whitespace between sections creates a premium feel appropriate for a marketing landing page.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Inline icon-to-text gap |
| `--space-2` | `8px` | Tight padding (badges, pills) |
| `--space-3` | `12px` | Input internal padding, list item gaps |
| `--space-4` | `16px` | Card internal element spacing |
| `--space-5` | `20px` | Between related elements |
| `--space-6` | `24px` | Card padding (standard) |
| `--space-8` | `32px` | Card padding (large), subsection gaps |
| `--space-10` | `40px` | Between subsections |
| `--space-12` | `48px` | Footer padding (mobile); large gaps inside cards |
| `--space-16` | `64px` | Section padding (mobile) |
| `--space-20` | `80px` | Section padding (tablet) |
| `--space-24` | `96px` | Section padding (desktop) |
| `--space-32` | `128px` | Hero section vertical padding |

### Layout Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--max-width-page` | `1280px` | Maximum content width |
| `--max-width-text` | `640px` | Maximum text block width (readability) |
| `--max-width-hero-text` | `560px` | Hero text column max width |
| `--gutter-mobile` | `16px` | Horizontal padding on mobile |
| `--gutter-tablet` | `32px` | Horizontal padding on tablet |
| `--gutter-desktop` | `48px` | Horizontal padding on desktop |

---

## 5. Border Radius & Shadows

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Input fields, small badges |
| `--radius-md` | `8px` | Buttons, tags |
| `--radius-lg` | `12px` | Standard cards |
| `--radius-xl` | `16px` | Featured cards, modal |
| `--radius-2xl` | `24px` | Hero image container |
| `--radius-pill` | `9999px` | Pill badges, full-round buttons |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle elevation (inputs, small elements) |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.08)` | Standard cards |
| `--shadow-lg` | `0 8px 24px rgba(0, 0, 0, 0.1)` | Featured cards, hover elevation |
| `--shadow-xl` | `0 16px 48px rgba(0, 0, 0, 0.12)` | Modals, dropdowns |
| `--shadow-cta` | `0 4px 14px rgba(13, 148, 136, 0.3)` | CTA button shadow (teal-tinted) |
| `--shadow-cta-hover` | `0 6px 20px rgba(13, 148, 136, 0.4)` | CTA button hover shadow |

---

## 6. Responsive Breakpoints

### Breakpoint System

| Name | Value | Usage |
|------|-------|-------|
| `sm` | `640px` | Large phones (landscape) |
| `md` | `768px` | Tablets (portrait) |
| `lg` | `1024px` | Tablets (landscape), small laptops |
| `xl` | `1280px` | Desktop |
| `2xl` | `1440px` | Large desktop |

### Approach
**Mobile-first CSS** — default styles target mobile (≤639px), then progressively enhance for larger screens using `min-width` media queries.

### Content Behavior Per Breakpoint

| Element | Mobile (<640px) | Tablet (640-1023px) | Desktop (≥1024px) |
|---------|----------------|--------------------|--------------------|
| **Nav** | Hamburger + slide-in drawer | Hamburger + slide-in drawer | Full horizontal links + CTA |
| **Hero** | Stacked (text → image) | Stacked (text → image) | Split (text left, image right) |
| **How It Works** | Vertical timeline | Horizontal 3-column | Horizontal 3-column |
| **Pricing Cards** | Horizontal scroll carousel | 2x2 grid per group | 2x2 grid per group (categorized) |
| **Trust Signals** | 2-column grid | 3-column grid | 4-column grid |
| **Testimonials** | Single card carousel | 2-column grid | 3-column grid |
| **Contact** | Stacked (form → info) | Side-by-side (form + info) | Side-by-side (form + info) |
| **Footer** | Stacked columns | 2-column grid | 4-column row |
| **Sticky CTA Bar** | ✅ Visible | ✅ Visible | ❌ Hidden |

> **⚠️ Two corrections to this table (2026-08-17).**
>
> **Nav at tablet.** The original specified "Full horizontal links" from 640px up, but §7.1 only ever defined a desktop and a mobile layout — there was no tablet nav to build. Worse, the desktop nav holds a wordmark + 4 links + 2 buttons, which does not fit in 640px; it would have overflowed or wrapped. **The hamburger drawer now persists up to 1023px** and the horizontal nav starts at `lg` (1024px), where §7.1's desktop layout actually fits.
>
> **Sticky CTA at tablet.** Originally hidden on tablet, which left 640–1023px as the only viewport with no persistent booking CTA — the primary conversion action vanished on iPads specifically. It is now visible below `lg`, matching the hamburger breakpoint so the two mobile-pattern decisions share one boundary.

---

## 7. Component Specifications

### 7.1 Navigation Bar

**Behavior:** Auto-hide on scroll down, reappear on scroll up. Starts transparent over hero, gains solid `--color-surface` background with `--shadow-sm` after scrolling past hero.

**Desktop Layout (≥ 1024px only — does not fit narrower):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  VandiPilot     How It Works   Pricing   Why Us   Contact   [Sign In] [Book a Pilot] │
└─────────────────────────────────────────────────────────────────────┘
```

- Height: `64px`
- Background (over hero): `transparent`
- Background (scrolled): `rgba(255, 251, 245, 0.95)` with `backdrop-filter: blur(12px)`
- Logo: left-aligned
- Nav links: center or right-aligned, `--text-nav`, `--color-foreground`, hover → `--color-primary`
- "Sign In" button: ghost/outlined, `--color-foreground` border
- "Book a Pilot" button: solid, `--gradient-cta`
- Transition: `transform 0.3s ease, background 0.3s ease`

**Mobile & Tablet Layout (< 1024px):**
```
┌───────────────────────────────┐
│  VandiPilot              ☰   │
└───────────────────────────────┘
```

- Hamburger icon: Phosphor `List` icon, 24px
- Drawer: slides in from right, full-height, `--color-surface` background
- Drawer links: stacked vertically, `--text-body-lg`, `--space-6` padding between items
- Drawer includes "Sign In" and "Book a Pilot" buttons at bottom
- Close icon: Phosphor `X` icon, 24px
- Overlay: `rgba(0, 0, 0, 0.4)` behind drawer

### 7.2 Hero Section

**Desktop Layout (split):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │                             │  │                             │  │
│  │  Your Car.                  │  │     [Hero Illustration      │  │
│  │  Our Pilot.                 │  │      or Photo of a          │  │
│  │  Your Peace of Mind.        │  │      professional driver    │  │
│  │                             │  │      standing next to       │  │
│  │  Book a professional driver │  │      a car, smiling]        │  │
│  │  for your car. Safe,        │  │                             │  │
│  │  reliable, always on time.  │  │                             │  │
│  │                             │  │                             │  │
│  │  [Book a Pilot] [Sign In]   │  │                             │  │
│  │                             │  │                             │  │
│  │  ★ 4.8 Rating  🚗 10,000+  │  │                             │  │
│  │                Trips        │  │                             │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Background: `--gradient-hero`
- Vertical padding: `--space-32` (128px) desktop, `--space-16` (64px) mobile
- Split: 50/50 on desktop, stacked on mobile (text first, image second)
- Headline: `--text-display` / `--text-display-mobile`, `--color-foreground`
- Subheadline: `--text-body-lg`, `--color-foreground-muted`, max-width `--max-width-hero-text`
- Primary CTA ("Book a Pilot"): `--gradient-cta`, `--shadow-cta`, height `52px`, padding `0 32px`, `--radius-md`
- Secondary CTA ("Sign In"): outlined, `1px solid --color-border`, `--color-foreground`, hover → `--color-primary`
- Social proof strip (below CTAs): inline stats with Phosphor icons, `--text-body-sm`, `--color-foreground-muted`
- Hero image: `--radius-2xl`, `--shadow-lg`, aspect ratio ~4:3

**Mobile Layout:**
```
┌───────────────────────────────┐
│                               │
│  Your Car.                    │
│  Our Pilot.                   │
│  Your Peace of Mind.          │
│                               │
│  Book a professional driver   │
│  for your car. Safe,          │
│  reliable, always on time.    │
│                               │
│  [  Book a Pilot  ]           │
│  [    Sign In     ]           │
│                               │
│  ★ 4.8 Rating  🚗 10,000+    │
│                               │
│  ┌───────────────────────┐    │
│  │   [Hero Image]        │    │
│  └───────────────────────┘    │
│                               │
└───────────────────────────────┘
```

- CTAs stack vertically, full-width
- Image appears below text, `--radius-xl`
- Padding: `--gutter-mobile` horizontal

### 7.3 How It Works Section

**Content:**

| Step | Icon (Phosphor) | Title | Description |
|------|----------------|-------|-------------|
| 1 | `CalendarCheck` | **Book a Pilot** | Schedule a professional driver in seconds. Pick your date, time, and location. |
| 2 | `UserCheck` | **Pilot Arrives** | Your verified, background-checked pilot arrives at your doorstep, ready to drive. |
| 3 | `Car` | **Enjoy the Ride** | Sit back and relax while your pilot drives your car safely to your destination and back. |

**Desktop Layout (Horizontal 3-column):**
```
┌───────────────────────────────────────────────────────────────────┐
│                      How It Works                                 │
│                                                                   │
│  ┌──────────────┐ ── ─ ── ┌──────────────┐ ── ─ ── ┌──────────────┐ │
│  │     (1)      │         │     (2)      │         │     (3)      │ │
│  │   📅 Icon    │         │   👤 Icon    │         │   🚗 Icon    │ │
│  │              │         │              │         │              │ │
│  │ Book a Pilot │         │ Pilot Arrives│         │ Enjoy Ride   │ │
│  │              │         │              │         │              │ │
│  │ Description  │         │ Description  │         │ Description  │ │
│  └──────────────┘         └──────────────┘         └──────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

- Section heading: `--text-h1` / `--text-h1-mobile`, centered
- Section subtitle: `--text-body`, `--color-foreground-muted`, centered, max-width `--max-width-text`
- Step number: `--text-caption`, `--color-primary`, `--color-primary-light` background, `--radius-pill`, `32px × 32px` circle
- Connecting line: dashed, `2px`, `--color-border`, between step circles (desktop only)
- Icon: `48px`, `--color-primary`, inside a `80px × 80px` circle with `--color-primary-light` background
- Step title: `--text-h3`, `--color-foreground`
- Step description: `--text-body`, `--color-foreground-muted`
- Card: `--color-surface`, `--shadow-md`, `--radius-lg`, padding `--space-8`

**Mobile Layout (Vertical Timeline):**
- Steps stack vertically with a connecting vertical line on the left
- Line: `2px`, `--color-primary-light`, positioned absolutely
- Step number circle on the line, content to the right
- Padding: `--space-6` between steps

### 7.4 Services & Pricing Section

**Content (from PRD FR-LAND-02):**

**Regular Services:**

| Service | Icon | Rate (dummy) | Unit | Min Charge | Min Duration |
|---------|------|-------------|------|------------|-------------|
| Hourly Local | `MapPin` | ₹150 | per hour | ₹300 | 2 hours |
| Hourly Outstation | `Compass` | ₹200 | per hour | ₹400 | 2 hours |
| Daily Within 200km | `Path` | ₹1,500 | per day | ₹1,500 | 1 day |
| Daily Above 200km | `Airplane` | ₹2,000 | per day | ₹2,000 | 1 day |

**Special Services:**

| Service | Icon | Rate (dummy) | Unit | Min Charge | Min Duration |
|---------|------|-------------|------|------------|-------------|
| Service Centre Trip | `Wrench` | ₹500 | flat | ₹500 | — |
| Family Function | `UsersThree` | ₹1,200 | per day | ₹1,200 | 1 day |

**Desktop Layout (Categorized Grid):**
```
┌───────────────────────────────────────────────────────────────────┐
│                   Services & Pricing                              │
│                                                                   │
│  Regular Services                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Hourly   │ │ Hourly   │ │ Daily    │ │ Daily    │            │
│  │ Local    │ │ Outstation│ │ ≤200km  │ │ >200km   │            │
│  │ ₹150/hr  │ │ ₹200/hr  │ │ ₹1500/d │ │ ₹2000/d  │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                   │
│  Special Services                                                 │
│  ┌────────────────┐ ┌────────────────┐                           │
│  │ Service Centre │ │ Family Function│                           │
│  │ ₹500 flat      │ │ ₹1200/day     │                           │
│  └────────────────┘ └────────────────┘                           │
└───────────────────────────────────────────────────────────────────┘
```

**Pricing Card Specs:**
- Regular cards: `--color-surface`, `--shadow-md`, `--radius-lg`, padding `--space-6`
- Special/Featured cards: `--gradient-pricing` background, `--shadow-lg`, `--radius-xl`
- Icon: `40px`, `--color-primary`
- Service name: `--text-h3`, `--color-foreground`
- Rate: `--text-h2`, `--color-primary`, font-weight 700
- Unit: `--text-body-sm`, `--color-foreground-muted`
- Min charge badge: `--text-caption`, `--color-primary-light` background, `--radius-pill`

**Mobile Layout (Horizontal Carousel):**
- Horizontal scroll with `scroll-snap-type: x mandatory`
- Each card: `scroll-snap-align: start`, `min-width: 260px`
- Scroll indicators: dots below carousel, `--color-primary` active, `--color-border` inactive
- Group headers ("Regular Services", "Special Services") above each carousel segment
- Padding: `--gutter-mobile` on first/last cards

### 7.5 Why Choose VandiPilot Section

**Content (7 trust signals):**

| # | Icon (Phosphor) | Title | Description |
|---|----------------|-------|-------------|
| 1 | `ShieldCheck` | Verified & Trained Drivers | Background-checked, professionally trained pilots you can trust with your keys. |
| 2 | `Car` | Your Car, Your Comfort | Drive in your own vehicle. No unfamiliar cars, no adjusting to a new ride. |
| 3 | `MapTrifold` | Real-Time Trip Tracking | Know where your car is at every moment with live trip updates. **⚠️ HOLD — see note below** |
| 4 | `CurrencyInr` | Transparent Pricing | No surge pricing, no hidden fees. Clear rates upfront, always. |
| 5 | `Clock` | 24/7 Availability | Book a pilot anytime — early morning airport runs to late-night returns. |
| 6 | `Star` | 4.8★ Average Rating | Our pilots maintain an exceptional rating from thousands of customers. |
| 7 | `TrendUp` | 10,000+ Trips Completed | Trusted by thousands of car owners across the city. |

> **⚠️ Trust signal #3 is on hold pending a future feature.** "Real-Time Trip Tracking" / "know where your car is at every moment" describes GPS tracking, which PRD non-goals #3 (no map/GPS integration) and #7 (no Supabase Realtime) explicitly exclude. Decision: **the feature is deferred to a later implementation, and this card must not ship until it exists.**
>
> Build implication: render the "Why Choose VandiPilot" grid from a data array with a `published` flag, and ship card #3 unpublished — **6 live cards**, not 7. When GPS tracking is built (which requires reversing two PRD non-goals), flip the flag. The layout below is specified for both counts so nothing has to be redesigned at that point.
>
> A truthful interim substitute, if a 7th card is wanted now: **"Live Trip Status Updates"** with the `Path` icon — "Follow your trip from assigned to completed, step by step." That describes the status timeline that *is* being built, with no GPS implication.

**Layout:**
- Desktop: **6 cards** → 3 columns × 2 rows. *(If card #3 is later published: 7 cards → first row 4 columns, second row 3 columns centered.)*
- Tablet: **6 cards** → 2 columns × 3 rows. *(7 cards → 3 columns × 2 rows + 1 centered.)*
- Mobile: 2 columns
- Background: `--color-muted` (alternating section background)
- Each trust signal card: icon + title + description, text-centered
- Icon: `48px`, `--color-primary`, inside `72px` circle with `--color-primary-light` background
- Title: `--text-h3`, `--color-foreground`, margin-top `--space-4`
- Description: `--text-body-sm`, `--color-foreground-muted`, max-width `280px`

### 7.6 Testimonials Section

**Content (dummy data):**

| # | Name | Role/Context | Rating | Testimonial |
|---|------|-------------|--------|-------------|
| 1 | Priya Nair | Regular Customer | 5★ | "I was nervous about handing my car keys to someone, but my VandiPilot was incredibly professional. Now I book every week for my hospital visits." |
| 2 | Rajesh Kumar | Business Professional | 5★ | "Airport runs at 4 AM? No problem. My pilot is always on time, and I can relax instead of dealing with early morning traffic." |
| 3 | Meena Thomas | Senior Citizen | 5★ | "At my age, driving long distances is tiring. VandiPilot gives me the freedom to travel in my own car without the stress." |
| 4 | Arun Shankar | Car Enthusiast | 4★ | "I'm particular about who drives my SUV. The pilot assigned to me was experienced, careful, and knew how to handle the vehicle perfectly." |
| 5 | Lakshmi Menon | Working Mother | 5★ | "Between school runs and errands, VandiPilot has been a lifesaver. My kids are comfortable in our own car, and the driver is always friendly." |

**Layout:**
- Desktop: 3 visible cards at a time, can be a static grid or carousel
- Tablet: 2 cards
- Mobile: 1 card carousel with swipe/navigation dots
- Section background: `--color-background` (warm cream)

**Testimonial Card Specs:**
- Background: `--color-surface`
- Shadow: `--shadow-md`
- Radius: `--radius-lg`
- Padding: `--space-8`
- Star rating: 5 Phosphor `Star` icons, `--color-accent` (gold/amber), `20px`
- Quote text: `--text-body`, `--color-foreground`, italic
- Customer name: `--text-body` weight 600, `--color-foreground`
- Customer context: `--text-body-sm`, `--color-foreground-muted`
- Avatar: `48px` circle, placeholder with initials, `--color-primary-light` background, `--color-primary` text
- Optional: Large opening quote mark `"` as decorative element, `--color-primary-light`, `--text-display`

### 7.7 Contact Section

**Layout (Desktop): 2-column**
```
┌───────────────────────────────────────────────────────────────────┐
│                       Get in Touch                                │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐  │
│  │  Contact Form             │  │  Contact Info               │  │
│  │                           │  │                              │  │
│  │  Name: [____________]     │  │  📍 VandiPilot HQ            │  │
│  │  Email: [____________]    │  │     123 MG Road, Kochi      │  │
│  │  Message:                 │  │     Kerala 682001            │  │
│  │  [                   ]    │  │                              │  │
│  │  [                   ]    │  │  📞 +91 98765 43210          │  │
│  │  [                   ]    │  │                              │  │
│  │                           │  │  📧 hello@vandipilot.com     │  │
│  │  [  Send Message  ]       │  │                              │  │
│  └──────────────────────────┘  │  ⏰ Mon-Sun: 6AM - 11PM      │  │
│                                 └──────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

**Contact Form Fields:**
- Name: text input, required
- Email: email input, required
- Message: textarea, 4 rows, required
- Submit: "Send Message", `--gradient-cta`, full width of form column

**Input Specs:**
- Height: `48px` (inputs), auto (textarea)
- Border: `1px solid --color-border`, `--radius-sm`
- Focus: `2px solid --color-ring`, `--shadow-sm`
- Placeholder: `--color-foreground-subtle`
- Font: `--text-body`
- Padding: `--space-3` horizontal

**Contact Info Cards:**
- Icon: Phosphor, `24px`, `--color-primary`
- Text: `--text-body`, `--color-foreground`

**Mobile:** Stacked — form on top, info cards below

### 7.8 Footer

**Layout (Desktop): 4-column — Company | Contact | Social | Legal**

```
┌───────────────────────────────────────────────────────────────────┐
│  VandiPilot                    Contact         Follow Us          │
│  Professional drivers for      📞 +91 98765    [FB] [IG]         │
│  your car. Safe, reliable,     📧 hello@...    [X]  [LI]        │
│  always on time.               📍 Kochi                          │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│  © 2026 VandiPilot. All rights reserved.  Terms · Privacy        │
└───────────────────────────────────────────────────────────────────┘
```

- Background: `--color-foreground` (dark charcoal `#1A1A2E`)
- Text: `rgba(255, 255, 255, 0.8)` for body, `#FFFFFF` for headings
- Logo: wordmark in white (both parts)
- Social icons: Phosphor `FacebookLogo`, `InstagramLogo`, `TwitterLogo`, `LinkedinLogo`, `24px`, white, hover → `--color-footer-link` `#5EEAD4` (**not** `--color-primary` — 3.12:1 on the dark footer, fails)
- Footer text links: `--color-footer-link` `#5EEAD4` (11.53:1)
- Copyright bar: `--text-caption`, `rgba(255, 255, 255, 0.5)`, top border `rgba(255, 255, 255, 0.1)`
- Padding: `--space-16` top/bottom desktop, `--space-12` mobile

### 7.9 Sticky Bottom CTA Bar (Mobile Only)

**Visibility:** Mobile **and tablet** (`< 1024px`). Hidden on desktop. *(Revised — see the breakpoint-table corrections in §6.)*

```
┌───────────────────────────────┐
│   [     Book a Pilot      ]   │
└───────────────────────────────┘
```

- Position: `fixed`, bottom `0`, width `100%`
- Background: `--color-surface` with `--shadow-xl` (upward shadow)
- Padding: `--space-3` vertical, `--gutter-mobile` horizontal
- Button: full-width, `--gradient-cta`, height `48px`, `--radius-md`
- Z-index: `50`
- Animation: slides up on initial page load, hides when hero CTA is visible (IntersectionObserver)
- Safe area: `padding-bottom: env(safe-area-inset-bottom)` for iOS notch devices

---

## 8. Button System

### Button Variants

| Variant | Background | Text Color | Border | Shadow | Usage |
|---------|-----------|-----------|--------|--------|-------|
| **Primary** | `--gradient-cta` | `--color-on-primary` | none | `--shadow-cta` | Main actions (Book a Pilot) |
| **Secondary** | `--color-surface` | `--color-foreground` | `1px solid --color-border` | `--shadow-sm` | Secondary actions (Sign In, Cancel) |
| **Ghost** | `transparent` | `--color-foreground` | none | none | Tertiary actions, nav links |
| **Destructive** | `--color-destructive` | `--color-on-destructive` | none | none | Delete, cancel booking |
| **Link** | `transparent` | `--color-primary` | none | none | Inline text links |

### Button Sizes

| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| **Large** | `52px` | `0 32px` | `--text-button` | `--radius-md` |
| **Default** | `44px` | `0 24px` | `--text-button` | `--radius-md` |
| **Small** | `36px` | `0 16px` | `--text-button-sm` | `--radius-sm` |
| **Icon** | `44px` | `10px` | — | `--radius-md` |

### Button States

| State | Transformation |
|-------|---------------|
| **Default** | As specified |
| **Hover** | Gradient → `--gradient-cta-hover`, shadow → `--shadow-cta-hover`, `translateY(-1px)` |
| **Active** | `translateY(0px)`, shadow → `--shadow-sm`, slight darken |
| **Focus** | `2px solid --color-ring`, `offset 2px` (keyboard-only via `:focus-visible`) |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, no hover effects |
| **Loading** | Replace text with spinner, maintain button width |

### Transition
All button transitions: `all 200ms ease`

---

## 9. Icon System

### Library
- **Primary:** Phosphor Icons (`@phosphor-icons/react`)
- **Fallback:** Lucide React (`lucide-react`)
- **Style:** Outline (`weight="regular"`) — consistent across all UI
- **Never:** Use emoji as structural icons

### Icon Sizes

| Token | Size | Usage |
|-------|------|-------|
| `--icon-sm` | `16px` | Inline with small text, badges |
| `--icon-md` | `20px` | Inline with body text, nav items |
| `--icon-lg` | `24px` | Buttons, form elements, navigation |
| `--icon-xl` | `32px` | Section decorations, card icons |
| `--icon-2xl` | `48px` | Feature icons, trust signals |

### Key Icons Used on Landing Page

| Context | Icon | Import |
|---------|------|--------|
| Hamburger menu | `List` | `import { List } from '@phosphor-icons/react'` |
| Close menu | `X` | `import { X } from '@phosphor-icons/react'` |
| Book a Pilot step | `CalendarCheck` | `import { CalendarCheck } from '@phosphor-icons/react'` |
| Pilot Arrives step | `UserCheck` | `import { UserCheck } from '@phosphor-icons/react'` |
| Enjoy the Ride step | `Car` | `import { Car } from '@phosphor-icons/react'` |
| Verified Drivers | `ShieldCheck` | `import { ShieldCheck } from '@phosphor-icons/react'` |
| Your Car | `Car` | (reuse) |
| Trip Tracking | `MapTrifold` | `import { MapTrifold } from '@phosphor-icons/react'` |
| Transparent Pricing | `CurrencyInr` | `import { CurrencyInr } from '@phosphor-icons/react'` |
| 24/7 Availability | `Clock` | `import { Clock } from '@phosphor-icons/react'` |
| Star Rating | `Star` | `import { Star } from '@phosphor-icons/react'` |
| Trips Completed | `TrendUp` | `import { TrendUp } from '@phosphor-icons/react'` |
| Location | `MapPin` | `import { MapPin } from '@phosphor-icons/react'` |
| Phone | `Phone` | `import { Phone } from '@phosphor-icons/react'` |
| Email | `EnvelopeSimple` | `import { EnvelopeSimple } from '@phosphor-icons/react'` |
| Clock/Hours | `Clock` | (reuse) |
| Facebook | `FacebookLogo` | `import { FacebookLogo } from '@phosphor-icons/react'` |
| Instagram | `InstagramLogo` | `import { InstagramLogo } from '@phosphor-icons/react'` |
| Twitter/X | `TwitterLogo` | `import { TwitterLogo } from '@phosphor-icons/react'` |
| LinkedIn | `LinkedinLogo` | `import { LinkedinLogo } from '@phosphor-icons/react'` |
| Arrow Right (CTA) | `ArrowRight` | `import { ArrowRight } from '@phosphor-icons/react'` |

---

## 10. Motion & Animation

### Design Rationale
Medium motion — scroll-triggered section reveals and hover effects. Enough to feel alive without hurting performance on mid-range Indian mobile devices. All animations respect `prefers-reduced-motion`.

### Scroll Reveal (Sections)
Each section fades in + slides up when entering the viewport.

```css
/* CSS approach (no GSAP required) */
.reveal-section {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-section.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- **Trigger:** IntersectionObserver, threshold `0.15`, `rootMargin: '0px 0px -50px 0px'`
- **Duration:** `400-500ms`
- **Easing:** `ease` or `cubic-bezier(0.25, 0.1, 0.25, 1)`
- **Stagger:** For card grids, add `transition-delay: calc(var(--index) * 80ms)` per card

### Hover Effects

| Element | Effect | Transition |
|---------|--------|-----------|
| CTA buttons | `translateY(-1px)`, shadow increase | `200ms ease` |
| Cards | `translateY(-4px)`, shadow → `--shadow-lg` | `250ms ease` |
| Nav links | color → `--color-primary`, underline slide-in | `200ms ease` |
| Social icons | color → `--color-primary`, `scale(1.1)` | `200ms ease` |
| Pricing cards | `translateY(-6px)`, shadow → `--shadow-xl` | `250ms ease` |

### Nav Auto-Hide/Show

```css
.nav {
  transition: transform 0.3s ease;
}

.nav--hidden {
  transform: translateY(-100%);
}
```

- Track scroll direction via `scroll` event (debounced)
- Threshold: hide after `60px` downward scroll; show immediately on any upward scroll
- Always show at page top (scroll position < nav height)

### Mobile Drawer

- Slide in from right: `transform: translateX(100%)` → `translateX(0)`
- Duration: `300ms`
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-like)
- Backdrop overlay fades in: `opacity: 0` → `opacity: 1`, `200ms`

---

## 11. Accessibility Requirements

### Keyboard Navigation
- All interactive elements focusable via Tab
- Focus ring: `2px solid --color-ring`, `2px offset`
- Focus only visible on keyboard navigation (`:focus-visible`)
- Escape key closes mobile drawer, modals
- Enter/Space activates buttons and links
- **Skip-to-content link** — first focusable element on every page, visually hidden until focused, jumps to `<main id="main-content">`. Without it, keyboard and screen-reader users must tab through the whole nav on every page load.
- **Focus trap in the mobile drawer** — while the drawer is open, Tab cycles only within it; on close, focus returns to the hamburger button that opened it. `role="dialog"` and `aria-expanded` alone do not produce this behaviour; it must be implemented.
- **Focus trap in modals** — same rule for the Driver Assignment Modal and every other dialog (see §17).

### Screen Readers
- All images: `alt` text (descriptive for hero, decorative for icons)
- Nav landmark: `<nav aria-label="Main navigation">`
- Section landmarks: `<section aria-labelledby="section-heading-id">`
- Mobile drawer: `aria-expanded`, `aria-controls`, `role="dialog"`
- CTA buttons: clear, descriptive text (not "Click here")
- Star ratings: `aria-label="Rated 5 out of 5 stars"`

### Reduced Motion
- All animations wrapped in `prefers-reduced-motion` check
- Reduced motion: instant state changes (no transitions)
- Carousel: still navigable via buttons, just no slide animation

### Color Independence
- Status indicators use icon + text + color (not color alone)
- Links: underline on hover (not just color change)
- Form errors: icon + red text (not just red border)

### Touch Targets
- Minimum: `44px × 44px` for all interactive elements
- Use `padding` or `hitSlop` if visual element is smaller
- Adequate spacing between adjacent targets: `≥ 8px`

---

## 12. Landing Page Section Order & Backgrounds

| # | Section | Background | Section Padding (Desktop) | Section Padding (Mobile) |
|---|---------|-----------|--------------------------|-------------------------|
| 1 | **Navigation** | transparent → `--color-surface` | — | — |
| 2 | **Hero** | `--gradient-hero` | `128px` top/bottom | `64px` top/bottom |
| 3 | **How It Works** | `--color-background` | `96px` top/bottom | `64px` top/bottom |
| 4 | **Services & Pricing** | `--color-muted` | `96px` top/bottom | `64px` top/bottom |
| 5 | **Why Choose VandiPilot** | `--color-background` | `96px` top/bottom | `64px` top/bottom |
| 6 | **Testimonials** | `--color-muted` | `96px` top/bottom | `64px` top/bottom |
| 7 | **Contact** | `--color-background` | `96px` top/bottom | `64px` top/bottom |
| 8 | **Footer** | `#1A1A2E` (dark) | `64px` top, `32px` bottom | `48px` top, `24px` bottom |

Alternating `--color-background` and `--color-muted` backgrounds create visual section separation without hard dividers.

---

## 13. Implementation Notes (Next.js + TailwindCSS v4 + Shadcn/UI)

### CSS Variable Integration

All design tokens above should be defined as CSS variables in `globals.css` and mapped to TailwindCSS v4's `@theme` directive:

```css
@theme {
  --color-primary: #0D9488;
  --color-primary-hover: #0F766E;
  --color-primary-light: #CCFBF1;
  --color-background: #FFFBF5;
  --color-surface: #FFFFFF;
  --color-foreground: #1A1A2E;
  --color-foreground-muted: #64748B;
  /* ... all other tokens */
}
```

### Shadcn/UI Theme Mapping

Map the VandiPilot palette to Shadcn/UI's expected CSS variable names:

| Shadcn Variable | VandiPilot Token | Note |
|----------------|-----------------|------|
| `--primary` | `--color-primary` | |
| `--primary-foreground` | `--color-on-primary` | |
| `--secondary` | `--color-muted` | Shadcn's "secondary" is a *muted surface*, not our brand `--color-secondary`. Intentional — see below. |
| `--secondary-foreground` | `--color-foreground` | |
| `--background` | `--color-background` | |
| `--foreground` | `--color-foreground` | |
| `--card` | `--color-surface` | |
| `--card-foreground` | `--color-foreground` | |
| `--popover` | `--color-surface` | **added** — dropdowns, notification panel, comboboxes |
| `--popover-foreground` | `--color-foreground` | **added** |
| `--muted` | `--color-muted` | |
| `--muted-foreground` | `--color-foreground-muted` | |
| `--accent` | `--color-primary-light` | **added** — Shadcn `accent` is the hover wash on menu/list items, not our brand accent |
| `--accent-foreground` | `--color-primary` | **added** |
| `--border` | `--color-border` | |
| `--input` | `--color-border` | **added** — input border; without it Shadcn inputs fall back to its default gray |
| `--ring` | `--color-ring` | |
| `--destructive` | `--color-destructive` | |
| `--destructive-foreground` | `--color-on-destructive` | **added** |
| `--radius` | `--radius-lg` (`12px`) | **added** — Shadcn derives `sm`/`md`/`lg` radii from this one value |

> **Two naming traps worth stating explicitly**, because both cause silent mis-theming:
> 1. **Shadcn `--secondary` ≠ VandiPilot `--color-secondary`.** In Shadcn, `secondary` is a low-emphasis *surface* (used by `<Button variant="secondary">`), so it maps to `--color-muted`. Our `--color-secondary` `#10827A` is a saturated brand teal used only as the CTA gradient endpoint. Mapping ours to Shadcn's would produce lurid teal secondary buttons.
> 2. **Shadcn `--accent` ≠ VandiPilot `--color-accent`.** Shadcn's `accent` is the hover background for dropdown/menu items. Ours is the gold used for star ratings. Mapping ours to Shadcn's would turn every menu hover amber.
>
> `--color-accent`, `--color-accent-warm`, `--color-accent-decorative`, `--color-secondary`, `--color-primary-viz`, `--color-success`, `--color-warning`, `--color-info`, and `--color-footer-link` have **no Shadcn equivalent** and are consumed directly via Tailwind utilities.

### Font Loading

Use Next.js `next/font/google` for optimal font loading:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

### Image Strategy

- Hero image: Use `next/image` with `priority` for LCP optimization
- Icons: SVG via Phosphor React components (tree-shakeable)
- Avatars: Placeholder circles with initials (no external images needed for dummy data)

### Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| First paint | < 1.5s |

---

## 14. Stitch Integration Notes

This design.md is structured for use with Stitch screen generation. When generating screens:

1. **Landing page** is the initial screen to generate
2. Use the color tokens, typography, and spacing from this document as the design system input
3. All component specifications include exact values for Stitch to reference
4. The responsive breakpoints define how each section should adapt
5. Animation specs are CSS-based (no GSAP dependency for initial implementation)
6. Icons reference Phosphor Icons — use SVG equivalents or fallback to Lucide

### Screen Generation Order (Recommended)

1. **Landing Page** (§§1–13 — complete spec)
2. **Customer Dashboard** (§§16–27 provide the shared dashboard system)
3. **Driver Dashboard** (same shared system)
4. **Admin Dashboard** (same shared system + §24 charts)

> Sections 16–27 were added 2026-08-17. The original document specified only the landing page, leaving the other 18 routes in the PRD with no design spec at all — no status-badge colors, no table spec, no chart palette, no empty/loading/error states. Those are now defined below as one shared dashboard system rather than three separate per-role documents, since all three roles reuse the same shell, tables, forms, and feedback patterns.

---

## 15. Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis used as icons (use Phosphor SVG icons)
- [ ] All icons from Phosphor, consistent `weight="regular"` style
- [ ] `cursor: pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Wordmark logo renders correctly at all sizes

### Responsiveness
- [ ] Tested at `375px` (small phone — iPhone SE)
- [ ] Tested at `390px` (standard phone — iPhone 14)
- [ ] Tested at `768px` (tablet — iPad)
- [ ] Tested at `1024px` (small laptop)
- [ ] Tested at `1280px` (desktop)
- [ ] Tested at `1440px` (large desktop)
- [ ] Sticky bottom CTA visible only on mobile
- [ ] Nav hamburger menu works on mobile
- [ ] Pricing carousel scrolls horizontally on mobile
- [ ] All text readable without horizontal scroll

### Accessibility
- [ ] Primary text contrast ≥ 4.5:1 **against all three surfaces** (`#FFFBF5`, `#FFFFFF`, `#F1F5F9`)
- [ ] Secondary text contrast ≥ **4.5:1** — *corrected from the original "≥ 3:1", which is the bar for **large** text (≥24px, or ≥18.66px bold) and for non-text UI, not for body-size secondary text. `--text-body-sm` at 14px Regular needs the full 4.5:1.*
- [ ] Icons and non-text UI indicators ≥ 3:1
- [ ] `--color-foreground-subtle` never used on a `--color-muted` background (4.34:1)
- [ ] Skip-to-content link present as the first focusable element
- [ ] Mobile drawer traps focus while open and restores focus to the hamburger on close
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] All interactive elements ≥ 44px touch targets
- [ ] Semantic HTML: proper heading hierarchy, landmarks, alt text
- [ ] Form labels associated with inputs

### Performance
- [ ] Hero image optimized via `next/image` with `priority`
- [ ] Font loaded via `next/font` with `display: swap`
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth scroll behavior on all devices
- [ ] Scroll reveal uses IntersectionObserver (not scroll event for visibility)

### Pre-Launch Gate (production only — not required for the demo build)

Per the PRD's Data Strategy, **all** content in this document is dummy data. These items are the ones that become factual claims to the public the moment the site goes live, so they need a deliberate swap before launch rather than an assumption that someone remembers:

- [ ] Replace `10,000+ Trips Completed` (trust signal #7) with the real figure, or remove the card
- [ ] Replace `4.8★ Average Rating` (trust signal #6, and the hero social-proof strip) with the real computed average from the `ratings` table, or remove
- [ ] Replace the 5 placeholder testimonials (Priya Nair, Rajesh Kumar, Meena Thomas, Arun Shankar, Lakshmi Menon) with real, consented customer quotes — or remove the section
- [ ] Confirm trust signal #3 "Real-Time Trip Tracking" is still unpublished unless GPS tracking has shipped
- [ ] Verify the "Verified & Trained Drivers" / "Background-checked" wording matches the checks actually performed — the settled decision is **Aadhaar verification + driving test only** (no police clearance, no reference calls) per `open-questions-decisions.md` §4, so "background-checked" may overstate it
- [ ] Replace placeholder contact details: `123 MG Road, Kochi, Kerala 682001`, `+91 98765 43210`, `hello@vandipilot.com`
- [ ] Confirm real business hours (currently `Mon-Sun: 6AM - 11PM`)

### Assets & Metadata
- [ ] Favicon set: `favicon.ico`, `icon.svg`, `apple-icon.png` (180×180)
- [ ] Open Graph image: 1200×630, includes wordmark + tagline — required or social shares render blank
- [ ] `og:title`, `og:description`, `og:image`, `twitter:card="summary_large_image"`
- [ ] Hero image asset sourced and licensed (spec calls for "professional driver next to a car, smiling") — needs a real photo or commissioned illustration; specify 4:3 desktop crop and a 3:2 mobile crop
- [ ] `theme-color` meta matching `--color-background`

### SEO
- [ ] `<title>` tag: "VandiPilot — Professional Drivers for Your Car"
- [ ] `<meta name="description">`: "Book a professional driver for your car. VandiPilot provides verified, trained pilots for local trips, outstation journeys, and special occasions. Safe, reliable, transparent pricing."
- [ ] Single `<h1>` on the page (hero headline)
- [ ] Proper `<h2>` for each section
- [ ] Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- [ ] All interactive elements have unique, descriptive IDs

---
---

# Part II — Dashboard Design System

> **Added 2026-08-17.** Part I (§§1–15) specifies the public landing page. Part II specifies the 18 authenticated routes: the shared shell, and every component the Customer, Driver, and Admin modules need. All tokens from §2 carry over unchanged.

---

## 16. Dashboard Shell

### Layout

```
┌──────────┬──────────────────────────────────────────────────┐
│          │  DashboardHeader              🔔  ⌄ Jobin        │  64px
│ Sidebar  ├──────────────────────────────────────────────────┤
│  264px   │                                                  │
│          │   Page content                                   │
│  ┌────┐  │   max-width 1200px, centered                      │
│  │Logo│  │   padding: --space-8                             │
│  └────┘  │                                                  │
│  Nav     │                                                  │
│  items   │                                                  │
│          │                                                  │
│  ──────  │                                                  │
│  Sign out│                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Sidebar width (desktop) | `264px` |
| Sidebar background | `--color-surface` |
| Sidebar border-right | `1px solid --color-border` |
| Header height | `64px` |
| Header background | `--color-surface` |
| Header border-bottom | `1px solid --color-border` |
| Content background | `--color-background` |
| Content max-width | `1200px` |
| Content padding | `--space-8` desktop, `--space-4` mobile |

### Responsive behaviour

| Breakpoint | Sidebar |
|---|---|
| `≥1024px` | Permanent, expanded, `264px` |
| `768–1023px` | Collapsed to `72px` icon rail; labels on hover tooltip |
| `<768px` | Hidden; hamburger in header opens it as an overlay drawer (same focus-trap rules as §11) |

On mobile the content padding drops to `--space-4` and tables switch to the card layout described in §19.

### Sidebar navigation item

| State | Background | Text | Icon | Left indicator |
|---|---|---|---|---|
| Default | transparent | `--color-foreground-muted` | `--color-foreground-muted` | none |
| Hover | `--color-muted` | `--color-foreground` | `--color-foreground` | none |
| Active | `--color-primary-light` | `--color-primary` | `--color-primary` | `3px` `--color-primary` bar, full height |
| Focus | + `2px` `--color-ring` outline, `2px` offset | | | |

- Height `44px` (meets the 44px touch target), `--radius-md`, padding `0 --space-4`
- Icon `--icon-lg` (24px), gap `--space-3` to label
- Label `--text-nav`
- Active state is set by route prefix match, not exact match, so `/admin/bookings/new` keeps "Bookings" active

### Role-specific navigation

Per PRD FR-SHARED-02, plus the additions from `feature-pilot-availability-by-locality.md`:

| Role | Items |
|---|---|
| **Customer** | Dashboard · Book a Pilot · My Trips · Profile |
| **Driver** | Dashboard · Earnings · Calendar |
| **Admin** | Dashboard · Bookings · Drivers · Customers · Commissions · Reports · Pricing · Ratings · Localities* |

\* `Localities` is pending FR-AVAIL-15; include only when that feature is built.

### Dashboard header

- Left: hamburger (`<768px` only), then breadcrumb or page title in `--text-h3`
- Right: notification bell (§26), then user menu — `32px` avatar circle + name (`--text-body-sm`) + `CaretDown`
- User menu dropdown: Profile · Sign Out. Uses the popover spec in §21.
- Avatar fallback: initials on `--color-primary-light` with `--color-primary` text (4.86:1 ✅)

---

## 17. Status System

This is the single most important addition in Part II. The whole product revolves around booking state, and the original design document defined no colors for it. The PRD's implementation plan proposed "booked (blue) / available (green) / day off (gray)" for the calendar, which clashes with the teal brand palette and has no defined hexes — superseded by the table below.

### Governing rule

**A status is never communicated by color alone.** Every status badge renders **icon + label + color**, always all three. This satisfies WCAG 1.4.1 (Use of Color) and keeps the two "running" states distinguishable even though they share a hue.

### Booking status badges

Status values are the PRD enum exactly: `requested → driver_assigned → running_leg1 → waiting → running_leg2 → completed / cancelled`.

| Status value | Customer-facing label | Fill | Text / Icon | Border | Icon (Phosphor) | Contrast |
|---|---|---|---|---|---|---|
| `requested` | Requested | `#F1F5F9` | `#475569` | `#CBD5E1` | `Clock` | 6.92:1 ✅ |
| `driver_assigned` | Pilot Assigned | `#CCFBF1` | `#0F766E` | `#5EEAD4` | `UserCheck` | 4.86:1 ✅ |
| `running_leg1` | On the Way | `#DBEAFE` | `#0369A1` | `#93C5FD` | `CarProfile` | 4.86:1 ✅ |
| `waiting` | Waiting at Destination | `#FEF3C7` | `#B45309` | `#FCD34D` | `PauseCircle` | 4.51:1 ✅ |
| `running_leg2` | Returning | `#DBEAFE` | `#0369A1` | `#93C5FD` | `ArrowUUpLeft` | 4.86:1 ✅ |
| `completed` | Completed | `#DCFCE7` | `#15803D` | `#86EFAC` | `CheckCircle` | 4.57:1 ✅ |
| `cancelled` | Cancelled | `#FEE2E2` | `#B91C1C` | `#FCA5A5` | `XCircle` | 5.30:1 ✅ |

> `running_leg1` and `running_leg2` deliberately share a hue — they are the same *kind* of state (vehicle in motion). The label and icon carry the distinction. Do not invent a seventh hue for the second leg; a leg-1/leg-2 color difference would read as a severity difference, which it is not.

> **⚠️ Multi-stop trips will break this enum.** The multi-stop decision (`open-questions-decisions.md` §3) replaces the fixed 2-leg sequence with an N-stop loop. When that lands, `running_leg1`/`running_leg2` become `en_route` (stop *n*) and `waiting` becomes `at_stop` (stop *n*), and the badge shows the stop index — e.g. "On the Way to Stop 2". The two hues above are already correct for that model; only the labels gain an index.

### Commission status badges

| Status value | Label | Fill | Text | Icon | Contrast |
|---|---|---|---|---|---|
| `pending` | Pending | `#FEF3C7` | `#B45309` | `Clock` | 4.51:1 ✅ |
| `driver_marked_paid` | Driver Marked Paid | `#DBEAFE` | `#0369A1` | `PaperPlaneTilt` | 4.86:1 ✅ |
| `admin_confirmed` | Confirmed | `#DCFCE7` | `#15803D` | `SealCheck` | 4.57:1 ✅ |

### Availability / generic states

| State | Fill | Text | Icon |
|---|---|---|---|
| Available / Active | `#DCFCE7` | `#15803D` | `CheckCircle` |
| Unavailable / Inactive | `#F1F5F9` | `#475569` | `MinusCircle` |
| Banned | `#FEE2E2` | `#B91C1C` | `Prohibit` |
| Day off (calendar) | `#F1F5F9` | `#475569` | `MoonStars` |

### Badge component spec

- Height `24px` (small) / `28px` (default)
- Padding `0 --space-2` (small) / `0 --space-3` (default)
- `--radius-pill`
- Border `1px solid` the border color from the table
- Text `--text-caption`, weight 500
- Icon `--icon-sm` (16px), gap `--space-1`
- `aria-label` restates the status in words, e.g. `aria-label="Booking status: Waiting at Destination"`

> Badge fills sit at 1.10–1.22:1 against the card surface. That is intentional — they are **tinted surfaces**, not UI indicators, so WCAG 1.4.11's 3:1 bar does not apply to the fill. The 1px border provides the visual edge and the label text carries the meaning at 4.5:1+.

---

## 18. KPI Cards / Stat Tiles

For the admin dashboard's six KPIs (PRD FR-ADM-01) and the driver's quick stats (FR-DRV-01).

**A KPI is a number, not a chart.** Do not put a chart inside a stat tile unless the trend itself is the point; a sparkline is optional and secondary to the figure.

```
┌────────────────────────────────┐
│  Total Bookings          🗓    │   label --text-body-sm, muted
│                                │   icon --icon-lg, --color-foreground-subtle
│  1,248                         │   value --text-h1, --color-foreground
│                                │
│  ↑ 12.4%  vs last month        │   delta + comparison, --text-caption
└────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `--color-surface` |
| Border | `1px solid --color-border` |
| Radius | `--radius-lg` |
| Padding | `--space-6` |
| Shadow | `--shadow-sm` (not `md` — a grid of 6 elevated cards is visual noise) |
| Label | `--text-body-sm`, `--color-foreground-muted` |
| Value | `--text-h1`, `--color-foreground`, proportional figures |
| Icon | `--icon-lg`, `--color-foreground-subtle`, top-right |

### Delta indicator

| Direction | Color | Icon |
|---|---|---|
| Up, and up is good (revenue, bookings, trips) | `--color-success` `#15803D` | `ArrowUp` |
| Down, and down is bad | `--color-destructive` `#B91C1C` | `ArrowDown` |
| Up, and up is bad (pending commissions, cancellations) | `--color-warning` `#B45309` | `ArrowUp` |
| No change / no prior period | `--color-foreground-subtle` | `Minus` |

**Direction ≠ sentiment.** "Pending Commissions ↑ 30%" is bad news; coloring it green because the arrow points up is a real and common bug. Each KPI declares its own `goodDirection` (`up` | `down` | `neutral`) in its config.

Always pair the delta with its comparison window in words ("vs last month"). A bare percentage is unreadable — the reader cannot tell what it is relative to.

### Grid

| Breakpoint | Columns |
|---|---|
| `≥1280px` | 3 (2 rows of 3 for the admin's 6 KPIs) |
| `768–1279px` | 2 |
| `<768px` | 1 |

Gap `--space-4`.

### The six admin KPIs

| KPI | Icon | Good direction | Format |
|---|---|---|---|
| Total Bookings (today / week / month) | `CalendarBlank` | up | integer |
| Active Trips | `CarProfile` | neutral | integer |
| Total Drivers (active) | `Users` | up | integer |
| Total Customers | `UserCircle` | up | integer |
| Revenue (this month) | `CurrencyInr` | up | ₹ Indian grouping (§27) |
| Pending Commissions | `Warning` | **down** | count + ₹ total |

---

## 19. Data Tables

Eight of the admin's ten pages are table-driven, so this spec carries a lot of weight.

### Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  Filters row:  [Status ▾] [Date range ▾] [Search…]   [+ New]     │
├──────────────────────────────────────────────────────────────────┤
│  Ref ▲        Customer      Date          Status      Actions    │  header
├──────────────────────────────────────────────────────────────────┤
│  VP-…-001     Priya Nair    16 Aug 2026   ●Completed  ⋯          │
│  VP-…-002     Rajesh Kumar  16 Aug 2026   ●Waiting    ⋯          │  zebra
├──────────────────────────────────────────────────────────────────┤
│  Showing 1–10 of 128            ‹ 1 2 3 … 13 ›                   │
└──────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Container | `--color-surface`, `1px solid --color-border`, `--radius-lg`, overflow hidden |
| Header row | `--color-muted` background, `--text-caption` uppercase, weight 600, `--color-foreground-muted` |
| Header height | `44px` |
| Row height | `56px` (comfortable) — not denser; these tables carry badges and action buttons |
| Row border | `1px solid --color-border` bottom, none on last row |
| Zebra striping | **Off by default.** Row borders already separate rows; striping plus borders plus badge fills is three competing background signals. Enable only for tables wider than 7 columns. |
| Row hover | `--color-muted` background, `cursor: pointer` if the row is clickable |
| Cell padding | `--space-4` horizontal, vertical centered |
| Body text | `--text-body-sm`, `--color-foreground` |
| Numeric cells | `font-variant-numeric: tabular-nums`, right-aligned |
| Currency cells | right-aligned, tabular, ₹ per §27 |

### Sorting

- Sortable headers show `CaretUpDown` in `--color-foreground-subtle` at rest
- Active sort shows `CaretUp` / `CaretDown` in `--color-primary`
- `aria-sort="ascending" | "descending" | "none"` on the `<th>`
- One sort column at a time

### Filters row

Per the interaction rules, **filters sit in one row above the table**, never in a sidebar or a modal:

- Height `40px` controls, `--radius-md`, `1px solid --color-border`
- Active filter: `--color-primary-light` background, `--color-primary` text, plus a dismiss `X`
- A "Clear all" ghost button appears once any filter is active
- Filter state is reflected in the URL query string so a filtered view is shareable and survives reload
- Date-range control: preset rows (Today · Last 7 days · Last 30 days · This month · Custom) with a 16px check on the selected row

### Pagination

10 rows per page (PRD FR-CUST-01). Footer shows `Showing X–Y of Z` in `--text-body-sm`, `--color-foreground-muted`, left; page controls right. Current page: `--color-primary-light` fill, `--color-primary` text.

### Mobile: tables become cards

Below `768px`, do **not** horizontally scroll a data table — it is the most common responsive table failure. Each row re-renders as a card:

```
┌────────────────────────────────┐
│  VP-20260816-001    ●Completed │  ref + status badge
│  Priya Nair                    │  primary field, --text-body
│  16 Aug 2026 · 10:00 AM        │  secondary, --text-body-sm muted
│  ₹1,250                        │  value, right or below
│                          [⋯]   │
└────────────────────────────────┘
```

- Card: `--color-surface`, `1px solid --color-border`, `--radius-lg`, padding `--space-4`, gap `--space-3` between cards
- Show at most 4 fields; the rest live on the detail view
- The filters row collapses into a single "Filters" button opening a bottom sheet

---

## 20. Forms & Validation

Covers the booking form, driver form, profile pages, pricing editor, and inline customer creation.

### Field anatomy

```
Label *                          --text-body-sm, weight 500, --color-foreground
┌──────────────────────────────┐
│ Placeholder text             │  48px, --radius-sm, 1px --color-border
└──────────────────────────────┘
Helper text                      --text-caption, --color-foreground-subtle
```

| State | Border | Background | Other |
|---|---|---|---|
| Default | `1px --color-border` | `--color-surface` | |
| Hover | `1px --color-border-hover` | | |
| Focus | `2px --color-ring` | | `--shadow-sm`, outline offset 0 |
| Filled | `1px --color-border` | | |
| Error | `2px --color-destructive` | `#FEF2F2` | error message below |
| Disabled | `1px --color-border` | `--color-muted` | `opacity .6`, `cursor: not-allowed` |
| Read-only | `1px --color-border` | `--color-muted` | no focus ring; used for Email & Photo per FR-CUST-08 |

- Height `48px` inputs / selects; textarea `auto`, min 4 rows
- Label sits **above** the field, never a floating placeholder-as-label (fails when autofilled and hurts screen readers)
- Required marked with `*` in `--color-destructive` **and** `aria-required="true"` — never by placeholder text alone
- `<label for>` always bound to the input id

### Validation rules

- **Validate on blur, not on keystroke.** Validating while typing marks a half-typed phone number as invalid, which reads as hostile.
- Re-validate on submit; focus the first invalid field and scroll it into view.
- Error message: `--text-caption`, `--color-destructive`, prefixed with a `WarningCircle` icon at `--icon-sm`, bound via `aria-describedby`, and the field gets `aria-invalid="true"`.
- Never rely on the red border alone (color-independence rule, §11).
- Submit button enters the Loading state (§8) on submit; the form is not re-submittable while pending.

### Form layout

- Single column, max-width `560px` for readability — do not use two columns for unrelated fields
- Field gap `--space-5`
- Section groups separated by `--space-8` with an `--text-h3` group heading
- Actions row: primary right, secondary/cancel to its left, `--space-3` gap; sticky to the bottom of the viewport on mobile

### Specific controls

| Control | Spec |
|---|---|
| **Date picker** | Future dates only for booking (FR-CUST-02); past dates disabled at `opacity .4`, not hidden |
| **Time picker** | **30-minute increments** per the settled decision (`open-questions-decisions.md` §2). Render as a select of 30-min slots, not a free text field. |
| **Multi-select** (vehicle types, transmission, localities) | Chips inside the field, each with a dismiss `X`; `--color-primary-light` fill, `--color-primary` text |
| **Star rating input** (FR-CUST-07) | 5 `Star` icons at `--icon-2xl` (48px) for touch; unfilled `--color-border`, filled `--color-accent` `#C2740A`; keyboard-operable as a radio group with `aria-label="Rate N out of 5"` |
| **Currency input** (pricing editor) | `₹` prefix inside the field as a static affix, tabular figures, no spinner arrows |

---

## 21. Modals, Dialogs & Popovers

### Modal

| Property | Value |
|---|---|
| Overlay | `rgba(26, 26, 46, 0.5)` — brand charcoal, not pure black |
| Panel | `--color-surface`, `--radius-xl`, `--shadow-xl` |
| Width | `480px` (confirm) / `640px` (form) / `800px` (driver assignment table) |
| Padding | `--space-8` |
| Max height | `85vh`, body scrolls, header and footer stay fixed |
| Mobile (`<640px`) | Full-screen sheet, `--radius-xl` on top corners only, slides up |

- Header: `--text-h3` title, optional `--text-body-sm` muted description, `X` close top-right (44px hit target)
- Footer: actions right-aligned, primary last
- **Focus trap required**; focus moves to the panel on open and returns to the trigger on close
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the title
- Escape closes; overlay click closes **only** non-destructive, non-form modals (prevents losing typed data)
- Body scroll locked while open

### Destructive confirmation

Cancel Booking (FR-ADM-05) and Ban Driver need a confirm step:

- Title states the consequence: "Cancel booking VP-20260816-001?" — not "Are you sure?"
- Cancel Booking requires a **reason** (FR-ADM-05) — a required textarea inside the confirm modal, so the confirm button stays disabled until it has content
- Primary action uses the Destructive variant and names the verb: "Cancel Booking", never "OK"
- The dismiss action is the *safe* one and is focused by default

### Popover / dropdown

Used by the user menu, notification panel, and row action menus.

| Property | Value |
|---|---|
| Background | `--color-surface` |
| Border | `1px solid --color-border` |
| Radius | `--radius-lg` |
| Shadow | `--shadow-xl` |
| Min width | `200px` |
| Item height | `40px` |
| Item hover | `--color-primary-light` background, `--color-primary` text |
| Destructive item | `--color-destructive` text; hover `#FEF2F2` |

Anchored with `8px` offset, flips to stay in the viewport, closes on Escape / outside click, arrow-key navigable.

---

## 22. Trip Status Timeline

The signature customer-facing component (FR-CUST-04). Vertical on all breakpoints — a horizontal timeline cannot fit 6 labelled stages on a phone.

```
 ●  Requested                    16 Aug, 9:42 AM
 │
 ●  Pilot Assigned               16 Aug, 9:55 AM
 │     Arun Shankar · +91 …
 │
 ●  On the Way                   16 Aug, 10:02 AM
 │
 ◉  Waiting at Destination       16 Aug, 10:48 AM     ← current
 ┊
 ○  Returning                    —
 ┊
 ○  Completed                    —
```

| Element | Complete | Current | Upcoming |
|---|---|---|---|
| Node | `16px` filled `--color-primary`, white `Check` glyph | `20px` filled `--color-primary` + `4px` `--color-primary-light` halo | `16px` `--color-surface` fill, `2px --color-border` ring |
| Connector | `2px solid --color-primary` | — | `2px dashed --color-border` |
| Label | `--text-body`, weight 500, `--color-foreground` | weight 600, `--color-foreground` | `--color-foreground-subtle` |
| Timestamp | `--text-caption`, `--color-foreground-muted`, tabular | same | `—` |

- Node-to-label gap `--space-4`; row gap `--space-6`
- The current step may carry a nested detail block (assigned pilot's name, phone, avatar) indented to the label column
- `cancelled` renders as a terminal node in `--color-destructive` with an `XCircle` glyph, and the remaining upcoming steps are dropped rather than shown as never-reached
- Semantics: `<ol>` with `aria-current="step"` on the active item
- The current step must **not** animate or pulse — the timeline is often on screen for an hour, and a persistent pulse is fatiguing and violates the spirit of `prefers-reduced-motion`

---

## 23. Availability Calendar (Driver)

FR-DRV-06. The implementation plan's "booked (blue) / available (green) / day off (gray)" is replaced by tokens that fit the palette:

| Day state | Fill | Text | Marker |
|---|---|---|---|
| Has assigned trip(s) | `#CCFBF1` | `#0F766E` | `2px` `--color-primary` dot per trip, max 3 then "+n" |
| Available (default) | `--color-surface` | `--color-foreground` | none |
| Marked day off | `#F1F5F9` | `#475569` | diagonal hairline hatch at 45°, `--color-border` |
| Past date | `--color-surface` | `--color-foreground-subtle` | not interactive |
| Today | `--color-surface` | `--color-foreground` | `2px --color-primary` ring |
| Selected | `--color-primary` | `--color-on-primary` | — |

The day-off hatch is the secondary encoding that keeps the state distinguishable without relying on the gray fill — the same rule as status badges. A legend sits above the grid.

| Property | Value |
|---|---|
| Cell | `44px` min square, `--radius-md` |
| Grid gap | `--space-1` |
| Weekday header | `--text-caption`, `--color-foreground-muted`, uppercase |
| Month nav | `CaretLeft` / `CaretRight` icon buttons + `--text-h3` month label |
| Week starts | **Monday** (Indian convention) |

Tapping a day with trips navigates to the trip; tapping a free future day opens the "Mark Day Off" modal with an optional reason field.

---

## 24. Charts & Data Visualization

For the admin reports page (FR-ADM-11). **The palette below was validated with a colorblind-safety validator, not chosen by eye** — every claim here is a computed result.

### Chart chrome & ink

| Role | Token |
|---|---|
| Chart surface | `--color-surface` `#FFFFFF` |
| Primary ink (titles, values) | `#1A1A2E` |
| Secondary ink | `#475569` |
| Axis labels / ticks | `#64748B` (4.76:1 ✅), tabular figures |
| Gridline (hairline) | `#E2E8F0` |
| Baseline / axis line | `#CBD5E1` |
| Delta up-good | `#15803D` |
| Delta down-bad | `#B91C1C` |

Gridlines are horizontal only, `1px`, and never cross the data. No chart borders, no background fills, no 3D, no shadows on marks.

### Categorical palette — fixed slot order

Assign in this order, **never cycled**:

| Slot | Hue | Hex | vs surface |
|---|---|---|---|
| 1 | teal (brand) | `#0D9488` | 3.74:1 |
| 2 | orange | `#EA580C` | 3.56:1 |
| 3 | indigo | `#4F46E5` | 6.29:1 |
| 4 | magenta | `#DB2777` | 4.60:1 |
| 5 | amber | `#B45309` | 5.02:1 |
| 6 | blue | `#0369A1` | 5.93:1 |

**Validated results** (OKLab ΔE ×100, light mode, surface `#FFFFFF`):

- Lightness band: all 6 inside L 0.43–0.77 ✅
- Chroma floor: all 6 ≥ 0.1 ✅
- CVD separation, adjacent pairs: worst `#B45309↔#DB2777` **ΔE 10.2** (deutan), tritan 8.0 — clears the ≥8 target ✅
- Normal-vision floor, adjacent pairs: worst **ΔE 16.7** — clears the ≥15 floor ✅
- Contrast: all 6 ≥ 3:1 ✅

> **Note the brand primary is *not* slot 1.** `--color-primary` `#0F766E` measures chroma 0.086, below the 0.1 floor — as a chart mark it reads gray. Slot 1 is `--color-primary-viz` `#0D9488`, which is on-brand and passes. Do not "fix" this by swapping in the button teal.

### ⚠️ Series cap: 3 for all-pairs forms

The 6-slot order above is validated for the **adjacent** pairlist — grouped/stacked bars, lines, areas, where a reader compares neighbouring series. For forms where **any** two series can end up adjacent — **pie, donut, scatter, bubble, small multiples** — only the **first 3 slots** validate (worst all-pairs CVD ΔE 13.8, normal-vision 27.1 ✅). At 4 slots the all-pairs check **fails** (`#DB2777↔#0D9488` CVD ΔE 3.8), and at 6 the normal-vision floor fails too (ΔE 10.6).

**Consequence for VandiPilot: booking-status distribution must not be a pie chart.** It has 7 categories — more than double the all-pairs cap. Render it as a **single stacked horizontal bar** or a **horizontal bar chart** (both adjacent-pairlist forms), using the §17 status colors, with direct labels. This is also the better read: seven pie wedges are unorderable and unlabellable.

### Sequential / ordinal ramp (single measure)

One hue, light→dark, **4 steps maximum**:

`#14B8A6` → `#0D9488` → `#0F766E` → `#115E59`

Validated: monotone lightness ✅, all adjacent ΔL ≥ 0.06 ✅, light end 2.49:1 vs surface (≥2:1 floor) ✅, hue spread 6° ✅. Do not start lighter than `#14B8A6` — `#2DD4BF` measures 1.86:1 and disappears into the card. Do not add a 5th step: `#115E59→#134E4A` measures ΔL 0.051, below the 0.06 gap floor, so the two darkest steps become indistinguishable.

### Diverging (only for genuine polarity)

`#0F766E` (teal, positive) ↔ neutral `#E2E8F0` ↔ `#C2410C` (burnt orange, negative). Equal step count per arm. Use **only** where a real zero-crossing exists (month-over-month revenue change). Never for a plain magnitude.

### Chart type per admin report

| Report (FR-ADM-11) | Form | Series | Color |
|---|---|---|---|
| Revenue by day / week / month | Vertical bars | 1 | Slot 1 only, no legend |
| Revenue trend | Line, 2px | 1 | Slot 1, no legend |
| Bookings trend | Line, 2px | 1 | Slot 1, no legend |
| Top 5 drivers by earnings | **Horizontal** bars, sorted desc | 1 | **Single hue** — see below |
| Commission split (platform 10% vs driver 90%) | Stacked horizontal bar | 2 | Slots 1, 2 + legend |
| Booking status distribution | Stacked horizontal bar | 7 | §17 status colors, **not** the series palette |
| Per-driver report | Table, not a chart | — | — |

> **"Top 5 drivers" is one measure across five entities, so it gets one color.** Painting each bar a different hue implies the colors mean something; they would only encode rank, and **color must follow the entity, not its rank** — re-filtering would repaint the survivors and silently change what a color means. Sorted length already encodes rank. One hue.

### Hard rules

- **Never a dual-axis chart.** "Revenue and bookings over time" is two charts, small multiples, or both series indexed to a common base — never two y-scales. This is the single most misleading chart form; the apparent crossover point is an artifact of the scales chosen.
- **Status colors are reserved.** `--color-success` / `--color-warning` / `--color-destructive` and the §17 badge colors never double as a data series.
- **Text wears text tokens.** Values, axis labels, and legend text stay in `#1A1A2E` / `#475569` / `#64748B`. A colored swatch beside the label carries identity; the label itself is never tinted to match its series.
- **Legend present whenever there are ≥2 series; omitted for a single series** (the chart title names it). With ≤4 series, also direct-label the marks.
- **Never label every point.** Label the first, last, min, max, and any annotated point.

### Marks

| Mark | Spec |
|---|---|
| Bar | `4px` rounded on the data end only, square at the baseline; `2px` surface gap between adjacent bars and between stacked segments |
| Line | `2px`, round caps and joins, no drop shadow |
| Area | Line + fill at 12% of the series hue |
| Point / marker | ≥`8px` diameter, `2px` surface ring where marks overlap |
| Bar min length | `2px` so a near-zero value is still visible |

### Interaction (required, not optional)

An HTML chart is interactive by default:

- **Line / area:** vertical crosshair on `--color-border` + a tooltip listing every series at that x, sorted by value descending
- **Bar / cell:** per-mark hover tooltip; hit target extends the full column height
- Tooltip: `--color-surface`, `1px --color-border`, `--radius-md`, `--shadow-xl`, padding `--space-3`, `--text-body-sm`; each row is a color swatch + series name + tabular value
- Tooltips follow the pointer with an `8px` offset and flip to stay in the viewport
- Keyboard: arrow keys step through marks and announce values via a live region
- **A table view is required for every chart** — a "View as table" toggle rendering the same data as a §19 table. This is the accessibility fallback and it also satisfies the contrast-relief rule for slot 1 and slot 2, which sit below 4.5:1 as text.

---

## 25. Empty, Loading & Error States

Every list, table, and chart needs all three. The original document specified none, and "loading states, skeleton screens, error boundaries" sat unspecified in PRD Phase 6.

### Empty state

```
        ┌─────────┐
        │  icon   │      --icon-2xl in a 72px --color-muted circle
        └─────────┘
     No trips yet              --text-h3, --color-foreground
  Book your first pilot and    --text-body, --color-foreground-muted,
  it'll show up here.          max-width 360px, centered
     [ Book a Pilot ]          primary action, when one exists
```

- Vertical padding `--space-16`, centered
- **Always name the next action** when one exists. An empty state without a CTA is a dead end.
- Distinguish **"nothing yet"** from **"nothing matched"**: a filtered table with no results shows "No bookings match these filters" plus a "Clear filters" button — never the first-run empty state, which wrongly implies the data does not exist.

| Context | Icon | Message |
|---|---|---|
| Customer, no trips | `CarProfile` | No trips yet |
| Customer, no history | `ClockCounterClockwise` | No completed trips yet |
| Driver, no assigned trips | `CalendarBlank` | No trips assigned yet |
| Driver, no earnings | `CurrencyInr` | No earnings for this period |
| Admin, no bookings | `Tray` | No bookings yet |
| Any filtered table | `MagnifyingGlass` | No results match these filters |
| Notifications | `BellSlash` | You're all caught up |

### Loading — skeletons, not spinners

Use a **skeleton matching the shape of the incoming content** for initial page and section loads. Reserve spinners for in-button pending states.

- Skeleton fill `--color-muted`, `--radius-sm`
- Shimmer: 1.5s linear-infinite left-to-right gradient sweep, `#F1F5F9 → #E2E8F0 → #F1F5F9`
- **Disabled entirely under `prefers-reduced-motion`** — static `--color-muted` blocks
- Skeleton line heights match the real text line-height so nothing shifts on swap (protects CLS < 0.1)
- Table skeleton: header + 5 rows at real row height
- KPI skeleton: card at real dimensions, label bar `40%` wide, value bar `60%`
- Chart skeleton: a `--color-muted` block at the chart's exact height — never a partially drawn chart

Add `aria-busy="true"` on the region and a visually-hidden "Loading…" announcement.

### Error states

| Scope | Treatment |
|---|---|
| **Field** | Inline, per §20 |
| **Section / widget** | Inline card: `WarningCircle` in `--color-destructive`, message, "Try again" secondary button. The rest of the page stays usable. |
| **Page** | Error boundary: centered icon + "Something went wrong" + the normalized `AppError.message` + "Try again" and "Back to dashboard". Never surface a raw stack trace. |
| **Toast** | Transient failures and all successes |

Messages come from the response interceptor's normalized `AppError` map (PRD FR-INT-07), so the wording is defined once: 403 → "You don't have permission to perform this action", 404 → "The requested resource was not found", 409 → "This record has been modified by someone else. Please refresh.", 429 → "Too many requests. Please wait a moment.", 500+ → "Something went wrong. Please try again."

### Toasts

| Property | Value |
|---|---|
| Position | Bottom-right desktop; **top**-center mobile (bottom collides with the sticky CTA bar and the iOS home indicator) |
| Width | `380px` desktop, `calc(100vw - 32px)` mobile |
| Background | `--color-surface`, `1px solid --color-border`, `--radius-lg`, `--shadow-xl` |
| Accent | `4px` left border in the semantic color |
| Duration | Success 4s · Info 5s · Error **persistent until dismissed** |
| Icon | `CheckCircle` / `WarningCircle` / `Info` / `XCircle` at `--icon-lg` in the semantic color |
| Max stack | 3; older toasts collapse |

`role="status"` for success/info, `role="alert"` for errors. Errors must never auto-dismiss — the user may have looked away, and a vanished error is an unexplained failure.

---

## 26. Notification Bell & Panel

PRD FR-SHARED-01, present in all three dashboard headers.

### Bell

- `Bell` icon at `--icon-lg`, `--color-foreground-muted`; hover `--color-foreground`
- Unread badge: `18px` circle, `--color-destructive` fill, white `--text-caption` count, top-right, `2px --color-surface` ring to separate it from the icon
- Counts above 9 render as `9+`
- `aria-label="Notifications, 3 unread"` — the count must be in the accessible name, not conveyed by the red dot alone

### Panel

Popover per §21, width `380px` (full-width sheet on mobile), max-height `480px` scrolling.

- Header: "Notifications" + "Mark all read" text button
- Item: `--space-4` padding, `1px --color-border` bottom
  - Unread: `--color-primary-light` background + `6px` `--color-primary` dot on the left
  - Read: `--color-surface`, no dot
  - Title `--text-body-sm` weight 600; body `--text-body-sm` `--color-foreground-muted`, 2-line clamp; timestamp `--text-caption` `--color-foreground-subtle`
- Type icons per the `notifications.type` enum: `booking_new` → `Tray`, `driver_assigned` → `UserCheck`, `trip_status` → `CarProfile`, `commission_reminder` → `CurrencyInr`, `system` → `Info`
- Clicking an item marks it read and follows its `link`
- Footer: "View all" when more than 10 exist
- Empty: `BellSlash`, "You're all caught up"

---

## 27. Indian Formatting Conventions

The product serves India (Kerala), so these are correctness requirements, not preferences. None were specified in the original document.

### Currency — Indian digit grouping

Indian numbering groups in **lakhs and crores**, not thousands: `₹1,50,000`, not `₹150,000`. Getting this wrong is immediately visible to every user.

```ts
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
inr.format(150000);   // "₹1,50,000"
inr.format(12500000); // "₹1,25,00,000"
```

- Never hand-roll grouping with a regex; use `en-IN`
- Whole rupees in tables and KPIs (`maximumFractionDigits: 0`); paise only in the fare breakdown, where the arithmetic must reconcile
- Always `font-variant-numeric: tabular-nums` in table columns so decimal points align
- Compact form for chart axis ticks only: `₹1.5L`, `₹1.25Cr` — never in a table or a fare breakdown

### Dates & times

| Context | Format | Example |
|---|---|---|
| Table cell | `DD MMM YYYY` | `16 Aug 2026` |
| Timeline / detail | `DD MMM, h:mm A` | `16 Aug, 10:48 AM` |
| Relative (notifications) | `just now` / `12m ago` / `3h ago`, then absolute past 24h | |
| Booking reference | `VP-YYYYMMDD-NNN` | `VP-20260816-001` |
| Month label (charts) | `MMM YYYY` | `Aug 2026` |

**Never use a purely numeric date** (`16/08/2026`) — it is ambiguous against `MM/DD` and the demo will be read by people from both conventions. Always spell the month.

12-hour clock with `AM`/`PM` throughout; India does not use 24-hour time colloquially. Times are `Asia/Kolkata` (UTC+5:30) — a half-hour offset, so never assume whole-hour timezone arithmetic.

### Phone numbers

Display as `+91 98765 43210` (5+5 grouping). Store E.164 (`+919876543210`). Input accepts a bare 10-digit entry and normalizes it. Render as `tel:` links on mobile — the driver's phone number on a trip detail is a call target, not text.

### Duration

`2h 15m`, not `135 minutes` and not `2.25 hours`. Running and waiting time in the fare breakdown and earnings table use this form, with the raw minute count available on hover for verification against the fare arithmetic.

### Language

English only this iteration (PRD Localization section). Two forward-looking notes so the choice is not accidentally locked in:

- **Inter does not include Malayalam or Devanagari glyphs.** If Malayalam or Hindi is added later, the font stack needs `Noto Sans Malayalam` / `Noto Sans Devanagari` alongside Inter. Recording this now because it is invisible until the day it breaks.
- Malayalam text runs roughly 15–25% longer than English for equivalent content, and Malayalam glyphs need more vertical space. Avoid fixed-width buttons and single-line-clamped labels in the shell so a future translation does not require a layout rebuild.

---

## 28. Part II Pre-Delivery Checklist

### Status & semantics
- [ ] Every status badge renders icon + label + color; none relies on color alone
- [ ] `running_leg1` / `running_leg2` distinguishable by label and icon
- [ ] `cancelled` truncates the timeline rather than showing unreached steps
- [ ] Commission status uses the three-state mapping, not ad-hoc colors

### Tables & forms
- [ ] Tables become cards below 768px — no horizontal scrolling of a data table
- [ ] Numeric and currency columns are tabular and right-aligned
- [ ] Filter state is reflected in the URL
- [ ] Validation fires on blur, not per keystroke
- [ ] First invalid field receives focus on failed submit
- [ ] Required fields marked with `*` **and** `aria-required`
- [ ] Time picker offers 30-minute slots
- [ ] Cancel Booking requires a reason before the confirm button enables

### Charts
- [ ] Palette validated (validator re-run if any hex changed)
- [ ] No dual-axis chart anywhere
- [ ] Booking-status distribution is a stacked/horizontal bar, **not** a pie
- [ ] "Top 5 drivers" uses a single hue
- [ ] Legend present for ≥2 series, absent for 1
- [ ] Every chart has a working "View as table" toggle
- [ ] Tooltips on all charts; keyboard-navigable marks
- [ ] Status colors not reused as series colors

### States
- [ ] Every list/table/chart has empty, loading, and error states
- [ ] "Nothing yet" and "nothing matched" are distinct
- [ ] Skeletons match final content dimensions (CLS < 0.1)
- [ ] Shimmer disabled under `prefers-reduced-motion`
- [ ] Error toasts persist until dismissed; success toasts auto-dismiss
- [ ] Mobile toasts appear top-center, clear of the sticky CTA

### Formatting
- [ ] All currency via `Intl.NumberFormat('en-IN')` — verify `₹1,50,000` grouping
- [ ] No purely numeric dates anywhere
- [ ] Phone numbers render as `tel:` links on mobile
- [ ] Durations as `2h 15m`

### Shell & a11y
- [ ] Sidebar collapses to icon rail 768–1023px, drawer below 768px
- [ ] Active nav item matches by route prefix
- [ ] Modals and the mobile drawer trap focus and restore it on close
- [ ] Notification count present in the bell's accessible name
- [ ] All interactive elements ≥44px
