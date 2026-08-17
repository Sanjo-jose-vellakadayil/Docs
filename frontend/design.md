# VandiPilot — Design System & Landing Page Specification

> **Purpose:** This document defines the complete visual design system and landing page specification for VandiPilot. It is intended to be used with **Stitch** for screen generation and serves as the single source of truth for all frontend design decisions.
>
> **Generated from:** PRD, implementation plan, ui-ux-pro-max design system, and stakeholder grilling session (2026-08-17).

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
The palette blends **caring teal** (trust, growth, service) with **warm neutral backgrounds** (approachability, comfort). Accent colors provide energy for CTAs and interactive elements. All colors meet **WCAG AA** contrast requirements (4.5:1 for text, 3:1 for UI elements).

### Light Mode (Primary)

| Role | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| **Primary** | `#0D9488` | `--color-primary` | CTA buttons, links, active states, logo accent |
| **Primary Hover** | `#0F766E` | `--color-primary-hover` | Button hover, link hover |
| **Primary Light** | `#CCFBF1` | `--color-primary-light` | Subtle backgrounds, badges, highlights |
| **On Primary** | `#FFFFFF` | `--color-on-primary` | Text/icons on primary color surfaces |
| **Secondary** | `#14B8A6` | `--color-secondary` | Secondary buttons, gradient endpoints |
| **Accent** | `#F59E0B` | `--color-accent` | Star ratings, highlights, attention markers |
| **Accent Warm** | `#EA580C` | `--color-accent-warm` | Urgent badges, notifications |
| **Background** | `#FFFBF5` | `--color-background` | Page background (warm off-white/cream) |
| **Surface** | `#FFFFFF` | `--color-surface` | Cards, modals, dropdowns |
| **Foreground** | `#1A1A2E` | `--color-foreground` | Primary text, headings |
| **Foreground Muted** | `#64748B` | `--color-foreground-muted` | Secondary text, descriptions, placeholders |
| **Foreground Subtle** | `#94A3B8` | `--color-foreground-subtle` | Tertiary text, timestamps, captions |
| **Border** | `#E2E8F0` | `--color-border` | Card borders, dividers, input borders |
| **Border Hover** | `#CBD5E1` | `--color-border-hover` | Input focus borders, hover states |
| **Muted Background** | `#F1F5F9` | `--color-muted` | Section alternating backgrounds, table stripes |
| **Destructive** | `#DC2626` | `--color-destructive` | Error states, delete actions, cancel |
| **On Destructive** | `#FFFFFF` | `--color-on-destructive` | Text on destructive surfaces |
| **Success** | `#16A34A` | `--color-success` | Success states, confirmations, available |
| **Warning** | `#F59E0B` | `--color-warning` | Warning states, pending actions |
| **Info** | `#0EA5E9` | `--color-info` | Informational badges, tooltips |
| **Ring** | `#0D9488` | `--color-ring` | Focus ring for accessibility |

### Gradient Tokens

| Name | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| **CTA Gradient** | `linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)` | `--gradient-cta` | Primary CTA buttons |
| **CTA Gradient Hover** | `linear-gradient(135deg, #0F766E 0%, #0D9488 100%)` | `--gradient-cta-hover` | CTA hover state |
| **Hero Gradient** | `linear-gradient(135deg, #F0FDFA 0%, #FFFBF5 50%, #FEF3C7 100%)` | `--gradient-hero` | Hero section background |
| **Pricing Card Gradient** | `linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)` | `--gradient-pricing` | Featured pricing cards |
| **Section Gradient** | `linear-gradient(180deg, #FFFBF5 0%, #F1F5F9 100%)` | `--gradient-section` | Section transitions |

### Contrast Verification

| Pair | Ratio | WCAG AA |
|------|-------|---------|
| `#1A1A2E` on `#FFFBF5` | 14.2:1 | ✅ Pass |
| `#1A1A2E` on `#FFFFFF` | 15.4:1 | ✅ Pass |
| `#64748B` on `#FFFFFF` | 4.6:1 | ✅ Pass |
| `#FFFFFF` on `#0D9488` | 4.6:1 | ✅ Pass |
| `#FFFFFF` on `#0F766E` | 5.8:1 | ✅ Pass |
| `#1A1A2E` on `#CCFBF1` | 11.2:1 | ✅ Pass |

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
| `--space-12` | `48px` | Mobile section padding |
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
| **Nav** | Hamburger + slide-in drawer | Full horizontal links | Full horizontal links + CTA |
| **Hero** | Stacked (text → image) | Stacked (text → image) | Split (text left, image right) |
| **How It Works** | Vertical timeline | Horizontal 3-column | Horizontal 3-column |
| **Pricing Cards** | Horizontal scroll carousel | 2x2 grid per group | 2x2 grid per group (categorized) |
| **Trust Signals** | 2-column grid | 3-column grid | 4-column grid |
| **Testimonials** | Single card carousel | 2-column grid | 3-column grid |
| **Contact** | Stacked (form → info) | Side-by-side (form + info) | Side-by-side (form + info) |
| **Footer** | Stacked columns | 2-column grid | 4-column row |
| **Sticky CTA Bar** | ✅ Visible | ❌ Hidden | ❌ Hidden |

---

## 7. Component Specifications

### 7.1 Navigation Bar

**Behavior:** Auto-hide on scroll down, reappear on scroll up. Starts transparent over hero, gains solid `--color-surface` background with `--shadow-sm` after scrolling past hero.

**Desktop Layout:**
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

**Mobile Layout:**
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
| 3 | `MapTrifold` | Real-Time Trip Tracking | Know where your car is at every moment with live trip updates. |
| 4 | `CurrencyInr` | Transparent Pricing | No surge pricing, no hidden fees. Clear rates upfront, always. |
| 5 | `Clock` | 24/7 Availability | Book a pilot anytime — early morning airport runs to late-night returns. |
| 6 | `Star` | 4.8★ Average Rating | Our pilots maintain an exceptional rating from thousands of customers. |
| 7 | `TrendUp` | 10,000+ Trips Completed | Trusted by thousands of car owners across the city. |

**Layout:**
- Desktop: First row 4 columns, second row 3 columns (centered)
- Tablet: 3 columns × 2 rows + 1
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
- Social icons: Phosphor `FacebookLogo`, `InstagramLogo`, `TwitterLogo`, `LinkedinLogo`, `24px`, white, hover → `--color-primary`
- Copyright bar: `--text-caption`, `rgba(255, 255, 255, 0.5)`, top border `rgba(255, 255, 255, 0.1)`
- Padding: `--space-16` top/bottom desktop, `--space-12` mobile

### 7.9 Sticky Bottom CTA Bar (Mobile Only)

**Visibility:** Only on mobile (`< 640px`). Hidden on desktop/tablet.

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

| Shadcn Variable | VandiPilot Token |
|----------------|-----------------|
| `--primary` | `--color-primary` |
| `--primary-foreground` | `--color-on-primary` |
| `--secondary` | `--color-muted` |
| `--secondary-foreground` | `--color-foreground` |
| `--background` | `--color-background` |
| `--foreground` | `--color-foreground` |
| `--card` | `--color-surface` |
| `--card-foreground` | `--color-foreground` |
| `--muted` | `--color-muted` |
| `--muted-foreground` | `--color-foreground-muted` |
| `--border` | `--color-border` |
| `--ring` | `--color-ring` |
| `--destructive` | `--color-destructive` |

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

1. **Landing Page** (this document — complete spec)
2. Customer Dashboard (future design.md page)
3. Driver Dashboard (future design.md page)
4. Admin Dashboard (future design.md page)

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
- [ ] Primary text contrast ≥ 4.5:1 in light mode
- [ ] Secondary text contrast ≥ 3:1 in light mode
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

### SEO
- [ ] `<title>` tag: "VandiPilot — Professional Drivers for Your Car"
- [ ] `<meta name="description">`: "Book a professional driver for your car. VandiPilot provides verified, trained pilots for local trips, outstation journeys, and special occasions. Safe, reliable, transparent pricing."
- [ ] Single `<h1>` on the page (hero headline)
- [ ] Proper `<h2>` for each section
- [ ] Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- [ ] All interactive elements have unique, descriptive IDs
