# VandiPilot Frontend — Implementation Plan

A detailed frontend implementation plan for VandiPilot's three stakeholders: **Customer**, **Driver (Pilot)**, and **Admin**. Built with Next.js 15 (App Router) + TypeScript + TailwindCSS v4 + Shadcn/UI + Supabase Auth.

> [!NOTE]
> This plan is derived from the master [implementation_plan.md](file:///d:/SJ/Business%20Ideas/IT%20Business/VandiPilot/Docs/implementation_plan.md). All technical decisions settled there are preserved here.

---

## Tech Stack (Frontend)

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router — server & client components) |
| **Language** | TypeScript (strict mode) |
| **Styling** | TailwindCSS v4 + Shadcn/UI component library |
| **Auth** | Supabase Auth (Google OAuth) |
| **State Management** | React Context + Supabase Realtime subscriptions |
| **HTTP Client** | Supabase JS client (wraps REST/Realtime) + custom fetch wrapper |
| **Font** | TBD (brand refresh — per master plan) |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/                  # Public route group (no auth required)
│   │   ├── page.tsx               # Landing page
│   │   └── layout.tsx             # Public layout (navbar, footer)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts           # Supabase OAuth callback handler
│   ├── (protected)/               # Protected route group (auth required)
│   │   ├── layout.tsx             # Shared protected layout (auth guard wrapper)
│   │   ├── customer/
│   │   │   ├── layout.tsx         # Customer role guard
│   │   │   ├── page.tsx           # Customer dashboard
│   │   │   ├── book/page.tsx      # Booking form
│   │   │   ├── trips/[id]/page.tsx # Trip detail & status
│   │   │   └── profile/page.tsx   # Customer profile
│   │   ├── driver/
│   │   │   ├── layout.tsx         # Driver role guard
│   │   │   ├── page.tsx           # Driver dashboard
│   │   │   ├── trips/[id]/page.tsx # Active trip controls
│   │   │   ├── earnings/page.tsx  # Earnings summary
│   │   │   └── calendar/page.tsx  # Schedule & availability
│   │   └── admin/
│   │       ├── layout.tsx         # Admin role guard
│   │       ├── page.tsx           # Admin dashboard (KPIs)
│   │       ├── bookings/
│   │       │   ├── page.tsx       # All bookings management
│   │       │   └── new/page.tsx   # Manual booking + inline customer creation
│   │       ├── drivers/
│   │       │   ├── page.tsx       # Driver management
│   │       │   └── new/page.tsx   # Add new driver
│   │       ├── customers/page.tsx # Customer management
│   │       ├── commissions/page.tsx # Commission tracker
│   │       ├── reports/page.tsx   # Revenue & earnings reports
│   │       ├── pricing/page.tsx   # Pricing tier management
│   │       └── ratings/page.tsx   # Customer ratings & feedback
├── components/
│   ├── ui/                        # Shadcn/UI primitives (Button, Card, Dialog, etc.)
│   ├── layout/
│   │   ├── PublicNavbar.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   ├── AuthGuard.tsx          # Auth guard wrapper component
│   │   ├── RoleGuard.tsx          # Role-based guard component
│   │   └── GoogleSignInButton.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationDropdown.tsx
│   ├── customer/
│   │   ├── BookingForm.tsx
│   │   ├── TripCard.tsx
│   │   ├── TripTimeline.tsx
│   │   ├── RatingForm.tsx
│   │   └── PricingCards.tsx
│   ├── driver/
│   │   ├── ActiveTripCard.tsx
│   │   ├── StatusTransitionButton.tsx
│   │   ├── EarningsTable.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── CommissionBadge.tsx
│   └── admin/
│       ├── KPICard.tsx
│       ├── BookingTable.tsx
│       ├── DriverAssignmentModal.tsx
│       ├── DriverForm.tsx
│       ├── CustomerTable.tsx
│       ├── CommissionTable.tsx
│       ├── PricingEditor.tsx
│       ├── RevenueChart.tsx
│       └── RatingsTable.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server-side Supabase client
│   │   └── middleware.ts          # Supabase auth middleware for Next.js
│   ├── interceptors/
│   │   ├── request-interceptor.ts # Outgoing request interceptor
│   │   └── response-interceptor.ts # Incoming response interceptor
│   ├── guards/
│   │   ├── auth-guard.ts          # Authentication check logic
│   │   └── role-guard.ts          # Role-based authorization logic
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth state hook
│   │   ├── useProfile.ts          # User profile hook
│   │   ├── useNotifications.ts    # Realtime notifications hook
│   │   └── useRealtimeBooking.ts  # Realtime booking status hook
│   ├── utils/
│   │   ├── fare-calculator.ts     # Client-side fare display logic
│   │   ├── date-helpers.ts        # Date/time formatting utilities
│   │   └── reference-id.ts        # Booking reference ID formatting
│   └── types/
│       ├── database.ts            # Supabase generated types
│       ├── booking.ts             # Booking-related types & enums
│       ├── profile.ts             # Profile & role types
│       └── notification.ts        # Notification types
├── contexts/
│   ├── AuthContext.tsx             # Auth state provider
│   └── NotificationContext.tsx    # Notification state provider
└── middleware.ts                   # Next.js root middleware (auth + role routing)
```

---

## Auth Guard System

### Overview

The auth guard system provides two layers of protection:
1. **Authentication Guard** — Ensures the user is logged in via Supabase Auth (Google OAuth).
2. **Role Guard** — Ensures the authenticated user has the correct role (`customer`, `driver`, or `admin`) for the route they are accessing.

### Next.js Root Middleware (`middleware.ts`)

The root middleware runs on every request to protected routes. It is the **first line of defense**.

```
Execution Flow:
Request → Next.js middleware.ts
  ├─ Is route public (/, /auth/callback)?  → Allow
  ├─ Is user authenticated (Supabase session)?
  │   ├─ No  → Redirect to / (landing page with sign-in CTA)
  │   └─ Yes → Check user role from `profiles` table
  │       ├─ Role matches route prefix (/customer, /driver, /admin)?  → Allow
  │       ├─ Role mismatch?  → Redirect to correct dashboard for their role
  │       └─ No profile yet?  → Redirect to onboarding
  └─ Error?  → Redirect to / with error toast
```

**Protected route matchers:**
```typescript
const protectedRoutes = ['/customer', '/driver', '/admin']
```

**Role-to-route mapping:**
```typescript
const roleRouteMap = {
  customer: '/customer',
  driver: '/driver',
  admin: '/admin',
}
```

### Layout-Level Auth Guards

Each stakeholder route group has its own `layout.tsx` that wraps children in a guard component. This provides **client-side protection** as a second layer (in case middleware is bypassed during client-side navigation).

**`(protected)/layout.tsx`** — Wraps all protected routes:
- Checks Supabase session on the client
- Shows a loading spinner while verifying
- Redirects unauthenticated users to landing page

**`(protected)/customer/layout.tsx`** — Customer role guard:
- Verifies `profile.role === 'customer'`
- Renders the customer dashboard shell (sidebar, header, notification bell)

**`(protected)/driver/layout.tsx`** — Driver role guard:
- Verifies `profile.role === 'driver'`
- Renders the driver dashboard shell (sidebar, header, notification bell)

**`(protected)/admin/layout.tsx`** — Admin role guard:
- Verifies `profile.role === 'admin'` **and** email matches hardcoded admin email
- Renders the admin dashboard shell (sidebar, header, notification bell)

### Auth Guard Component (`AuthGuard.tsx`)

```
Props:
  - children: ReactNode
  - fallback?: ReactNode (optional loading state)

Behavior:
  1. Subscribe to Supabase auth state via onAuthStateChange
  2. On SIGNED_IN → fetch profile from `profiles` table → set context
  3. On SIGNED_OUT → redirect to /
  4. On INITIAL_SESSION → show fallback/loading
  5. On TOKEN_REFRESHED → update session silently
```

### Role Guard Component (`RoleGuard.tsx`)

```
Props:
  - children: ReactNode
  - allowedRoles: ('customer' | 'driver' | 'admin')[]
  - fallbackRedirect?: string

Behavior:
  1. Read role from AuthContext
  2. If role is in allowedRoles → render children
  3. If role is NOT in allowedRoles → redirect to correct dashboard
  4. If no profile exists → redirect to onboarding
```

### New User Onboarding Flow

```
Google Sign-In → Supabase Auth Callback
  ├─ Profile exists in `profiles` table?
  │   ├─ Yes → Redirect to dashboard for their role
  │   └─ No  → Check if email was pre-registered by Admin (as driver)
  │       ├─ Yes (pre-registered driver) → Create profile with role='driver' → /driver
  │       └─ No  → Create profile with role='customer' → /customer (with onboarding prompt)
```

---

## Interceptor System

### Overview

Interceptors wrap all outgoing HTTP requests and incoming responses to provide cross-cutting concerns: auth token injection, error handling, logging, and session refresh. Since VandiPilot uses the Supabase JS client (which handles its own auth headers), the interceptors wrap a **custom fetch function** used for any additional API calls and also hook into Supabase client events.

### Request Interceptor (`lib/interceptors/request-interceptor.ts`)

Wraps outgoing requests before they are sent.

```
Responsibilities:
  1. Auth Token Injection
     - Reads the current Supabase session
     - Attaches the access token as Authorization: Bearer <token>
     - If no session exists, aborts the request and triggers sign-out

  2. Request Logging (development only)
     - Logs method, URL, and timestamp for debugging

  3. Request Timeout
     - Attaches AbortController with configurable timeout (default: 30s)
     - Long-running operations (file uploads) get extended timeout (120s)

  4. Request Deduplication
     - For GET requests, tracks in-flight requests by URL
     - Returns the existing Promise if a duplicate request is detected
     - Prevents redundant fetches during component re-renders
```

**Integration point:** The request interceptor is applied via a custom `apiFetch()` wrapper function in `lib/supabase/client.ts`:

```typescript
// Pseudocode
export async function apiFetch(url: string, options?: RequestInit) {
  const enrichedOptions = await requestInterceptor(options)
  const response = await fetch(url, enrichedOptions)
  return responseInterceptor(response)
}
```

### Response Interceptor (`lib/interceptors/response-interceptor.ts`)

Processes every incoming response before it reaches the calling code.

```
Responsibilities:
  1. Session Expiry Detection
     - If response is 401 Unauthorized:
       a. Attempt silent token refresh via Supabase
       b. If refresh succeeds → retry the original request once with new token
       c. If refresh fails → clear session, redirect to / with "Session expired" toast

  2. Error Normalization
     - Converts Supabase error shapes and HTTP errors into a consistent AppError type:
       { code: string, message: string, status: number, details?: unknown }
     - Maps common errors to user-friendly messages:
       - 403 → "You don't have permission to perform this action"
       - 404 → "The requested resource was not found"
       - 409 → "This record has been modified by someone else. Please refresh."
       - 429 → "Too many requests. Please wait a moment."
       - 500+ → "Something went wrong. Please try again."

  3. Rate Limit Handling
     - If response is 429, extracts Retry-After header
     - Queues a retry after the specified delay (max 3 retries)

  4. Response Logging (development only)
     - Logs status, URL, duration, and error details
```

### Supabase Client Event Hooks

In addition to the fetch interceptors, the Supabase client itself emits auth events that are intercepted at the context level:

```
AuthContext subscribes to onAuthStateChange:
  - SIGNED_IN       → Fetch profile, set role, redirect to correct dashboard
  - SIGNED_OUT      → Clear all state, redirect to /
  - TOKEN_REFRESHED → Update session in memory (silent)
  - USER_UPDATED    → Re-fetch profile (in case role changed by admin)
  - PASSWORD_RECOVERY → N/A (Google OAuth only)
```

---

## Stakeholder 1: Customer Module

### Pages

#### `/customer` — Customer Dashboard
- **Welcome banner** with customer name (from profile)
- **"Book a Pilot"** — prominent CTA button → navigates to `/customer/book`
- **Active/Upcoming Trips** section:
  - Cards showing upcoming bookings with status badges (`Requested`, `Driver Assigned`, `Running`)
  - Each card: pickup, destination, date/time, assigned driver (if any)
  - Click → navigates to `/customer/trips/[id]`
- **Trip History** section:
  - Past completed trips: fare, driver name, rating given
  - Paginated list (10 per page)
- **Services & Pricing** section:
  - Cards showing service types and rates (pulled from `pricing` table)
- **Notification bell** in header (shared component)

#### `/customer/book` — Booking Form
- Pre-filled from profile: car type, transmission
- Fields:
  - Pickup Location (text input, pre-filled from `default_pickup_address` if set)
  - Destination (text input)
  - Date picker (future dates only)
  - Time picker (granularity TBD — per open question in master plan)
- Submit → creates booking with status `requested` → triggers notification to Admin
- All trips are round-trip by default
- Success state: confirmation with booking reference ID (e.g., `VP-20260714-001`)

#### `/customer/trips/[id]` — Trip Detail & Status
- **Status timeline visualization:**
  `Requested → Driver Assigned → Running (Leg 1) → Waiting → Running (Leg 2) → Completed`
- **Driver info** (when assigned): name, phone number, profile photo
- **Fare breakdown** (after completion): running time, waiting time, charges, total
- **Rating form** (after completion): 1–5 stars + optional comment
- **Realtime updates**: Supabase Realtime subscription on `bookings` and `trip_timestamps` tables

#### `/customer/profile` — Edit Profile
- Editable: Full Name, Phone, Default Pickup Address
- Editable: Default Vehicle (car type dropdown, transmission dropdown, registration number)
- Read-only: Email, Profile Photo (sourced from Google)
- Save button with optimistic UI update

### Customer Components
| Component | Purpose |
|---|---|
| `BookingForm.tsx` | Multi-field form with validation and submit logic |
| `TripCard.tsx` | Compact card showing trip summary (used in dashboard lists) |
| `TripTimeline.tsx` | Vertical timeline showing status progression with timestamps |
| `RatingForm.tsx` | Star rating (1–5) + optional comment textarea |
| `PricingCards.tsx` | Grid of service type cards with rates |

---

## Stakeholder 2: Driver (Pilot) Module

### Pages

#### `/driver` — Driver Dashboard
- **Upcoming Trips** — list of assigned trips:
  - Customer name, pickup, destination, date/time
  - Status badge
- **Active Trip Card** — if a trip is currently in progress:
  - Large card with contextual status transition button (only shows the **next valid action**):
    - `driver_assigned` → **"Start Running"**
    - `running_leg1` → **"Arrived at Destination"**
    - `waiting` → **"Left Destination"**
    - `running_leg2` → **"Trip Complete"**
  - Each button tap records a timestamp in `trip_timestamps` table
- **Quick Stats**: trips this week/month, total earnings this month
- **Notification bell** in header
- **Calendar icon** link → `/driver/calendar`

#### `/driver/trips/[id]` — Active Trip Controls
- Full trip detail: customer name, phone, pickup, destination, scheduled date/time
- **Large status transition button** — contextual, only shows the next valid action
- After completion:
  - Fare auto-calculated and displayed (running time, waiting time, charges)
  - Commission amount shown (10% of total)
  - **"Mark Commission Paid"** button → sets `commission_status` to `driver_marked_paid`
- Realtime updates on booking status

#### `/driver/earnings` — Earnings Summary
- **Per-Trip Breakdown table:**
  - Date, customer, running time, waiting time, total fare, 10% commission, net earnings
- **Period Summary toggle:** Weekly / Monthly views
- **Commission Status column:** `Pending` | `Marked Paid` | `Confirmed by Admin`
- Filterable by date range

#### `/driver/calendar` — Schedule & Availability
- Calendar view showing:
  - Assigned trips by date (clickable → trip detail)
  - Days marked as unavailable (days off)
- **Mark Day Off** action:
  - Select date → optional reason → saves to `driver_availability` table
  - Visual indicators: booked (blue), available (green), day off (gray)

### Driver Components
| Component | Purpose |
|---|---|
| `ActiveTripCard.tsx` | Large card with trip info and status transition button |
| `StatusTransitionButton.tsx` | Contextual button that shows only the next valid action |
| `EarningsTable.tsx` | Tabular earnings breakdown with period toggle |
| `AvailabilityCalendar.tsx` | Calendar with trip markers and day-off management |
| `CommissionBadge.tsx` | Status badge for commission state |

---

## Stakeholder 3: Admin Module

### Pages

#### `/admin` — Admin Dashboard Overview
- **KPI Cards:**
  - Total Bookings (today / this week / this month)
  - Active Trips (currently running)
  - Total Drivers (active count)
  - Total Customers
  - Revenue Summary (this month)
  - Pending Commissions count
- **Recent Bookings list** — quick view of latest 5 bookings
- **Alerts section:**
  - New bookings pending driver assignment
  - Overdue commissions (driver marked paid but admin hasn't confirmed)

#### `/admin/bookings` — Booking Management
- **Filterable table** of all bookings: status, date range, customer name, driver name
- Click row → booking detail side panel or modal
- **"Assign Driver" button:** opens modal with available drivers filtered by:
  - Date availability (not on day off)
  - Vehicle type match
  - Transmission match
- **"Cancel Booking" button:** with reason (required)
- **"+ New Booking" button** → navigates to `/admin/bookings/new`

#### `/admin/bookings/new` — Manual Booking Creation
- Select existing customer OR create new customer inline:
  - Inline creation fields: Full Name, Phone, Email (Gmail)
  - Creates a new `profiles` record with `role='customer'`
- Booking fields: Pickup, Destination, Date, Time, Car Type, Transmission
- Submit → creates booking with `created_by='admin'`

#### `/admin/drivers` — Driver Management
- **Table:** all drivers with columns: Name, Phone, Status (active/inactive), Total Trips, Average Rating
- Click row → driver detail view
- **"+ Add Driver" button** → navigates to `/admin/drivers/new`
- **Inline actions:** Deactivate / Reactivate toggle, Ban driver

#### `/admin/drivers/new` — Add New Driver
- Form fields (per master plan):
  - Full Name, Phone, Gmail, Address, Years of Experience
  - Vehicle Types (multi-select: hatchback, sedan, SUV, luxury)
  - Transmission Skills (multi-select: manual, automatic)
  - Bank Account / UPI ID
  - Emergency Contact
  - Optional: Driving License Number, License Expiry, Aadhaar Number, Profile Photo upload
- Submit → creates `profiles` (role='driver') + `driver_profiles` record
- Pre-registering the Gmail means the driver gets `driver` role on first Google sign-in

#### `/admin/customers` — Customer Management
- **Table:** all customers with Total Bookings, Last Booking Date
- Click row → customer booking history
- **Inline actions:** Ban / Unban toggle

#### `/admin/commissions` — Commission Tracker
- **Table:** all completed trips with commission columns:
  - Driver Name, Trip Date, Total Fare, Commission Amount (10%), Status
  - Status: `Pending` | `Driver Marked Paid` | `Admin Confirmed`
- **Filters:** date range, driver, status
- **"Confirm Payment" button:** admin verifies commission received from driver

#### `/admin/reports` — Revenue & Earnings Reports
- **Revenue Summary:** total revenue by day / week / month (bar chart)
- **Per-Driver Report:** earnings, trips completed, commissions paid, average rating
- **Charts/Graphs:** Revenue trend line, bookings trend, top 5 drivers by earnings
- Date range picker for all charts

#### `/admin/pricing` — Pricing Management
- **Editable table** of all pricing tiers:
  - Pricing Type (hourly local, hourly outstation, daily within 200km, daily above 200km, special services)
  - Rate, Unit, Minimum Charge, Minimum Duration
  - Active toggle
- Changes auto-reflect on landing page pricing cards and fare calculations

#### `/admin/ratings` — Ratings & Feedback
- **Table:** all customer ratings with Driver Name, Rating (1–5), Comment, Date
- **Filters:** by driver, by rating level (1–5)
- Useful for identifying top performers and flagging problematic drivers

### Admin Components
| Component | Purpose |
|---|---|
| `KPICard.tsx` | Stat card with label, value, trend indicator |
| `BookingTable.tsx` | Filterable, sortable table for bookings |
| `DriverAssignmentModal.tsx` | Modal listing available drivers with filters |
| `DriverForm.tsx` | Full driver registration form with validation |
| `CustomerTable.tsx` | Customer list with booking stats |
| `CommissionTable.tsx` | Commission tracking table with confirm action |
| `PricingEditor.tsx` | Inline-editable pricing tier table |
| `RevenueChart.tsx` | Chart components for revenue/booking trends |
| `RatingsTable.tsx` | Filterable ratings list |

---

## Shared / Cross-Cutting Components

### Notification System
- **`NotificationBell.tsx`** — Icon with unread count badge, toggles dropdown
- **`NotificationDropdown.tsx`** — List of recent notifications, mark as read, click to navigate
- **`useNotifications.ts` hook** — Supabase Realtime subscription on `notifications` table filtered by `user_id`
- **Notification triggers** (per master plan):
  - Customer: booking confirmed, driver assigned, trip status changes
  - Driver: new trip assigned, commission reminder
  - Admin: new booking received, commission marked paid by driver

### Dashboard Shell
- **`DashboardSidebar.tsx`** — Role-aware sidebar with navigation links
  - Customer: Dashboard, Book a Pilot, My Trips, Profile
  - Driver: Dashboard, Earnings, Calendar
  - Admin: Dashboard, Bookings, Drivers, Customers, Commissions, Reports, Pricing, Ratings
- **`DashboardHeader.tsx`** — User avatar, name, notification bell, sign-out button

---

## Build Phases (Frontend)

### Phase 1: Foundation & Auth
- [ ] Next.js 15 project scaffolding with App Router
- [ ] TailwindCSS v4 + Shadcn/UI setup
- [ ] Supabase client configuration (browser + server)
- [ ] Root middleware (`middleware.ts`) with auth + role routing
- [ ] Auth Guard component (`AuthGuard.tsx`)
- [ ] Role Guard component (`RoleGuard.tsx`)
- [ ] Request interceptor (`request-interceptor.ts`)
- [ ] Response interceptor (`response-interceptor.ts`)
- [ ] Google OAuth sign-in flow + callback handler
- [ ] Auth context provider (`AuthContext.tsx`)
- [ ] New user onboarding flow (auto role assignment)
- [ ] Landing page (redesigned with brand identity)

### Phase 2: Customer Module
- [ ] Customer dashboard layout + role guard
- [ ] Customer dashboard page (welcome, active trips, history, pricing)
- [ ] Booking form with validation
- [ ] Trip detail page with status timeline
- [ ] Rating form (post-trip)
- [ ] Customer profile page (edit name, phone, address, vehicle)
- [ ] Realtime booking status updates

### Phase 3: Admin Module
- [ ] Admin dashboard layout + role guard (email match)
- [ ] Admin dashboard page (KPI cards, recent bookings, alerts)
- [ ] Booking management page (table, filters, detail view)
- [ ] Driver assignment modal (availability + vehicle/transmission match)
- [ ] Manual booking creation page (with inline customer creation)
- [ ] Driver management page (list, add, edit, deactivate/ban)
- [ ] Add new driver form
- [ ] Customer management page (list, booking history, ban/unban)

### Phase 4: Driver Module
- [ ] Driver dashboard layout + role guard
- [ ] Driver dashboard page (upcoming trips, active trip card, quick stats)
- [ ] Active trip controls page (status transition buttons + timestamp recording)
- [ ] Earnings summary page (per-trip breakdown, period toggle, commission status)
- [ ] Calendar page (trip schedule + day-off management)
- [ ] "Mark Commission Paid" flow

### Phase 5: Cross-Cutting Features
- [ ] Notification system (bell, dropdown, realtime subscription)
- [ ] Commission tracker (admin side)
- [ ] Pricing management (admin editable table)
- [ ] Reports & analytics (revenue charts, per-driver reports)
- [ ] Ratings & feedback management (admin)

### Phase 6: Polish & Optimization
- [ ] Brand refresh design finalization
- [ ] Responsive mobile optimization (priority: driver views)
- [ ] Loading states, skeleton screens, error boundaries
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] Cross-browser testing

---

## Verification Plan (Frontend)

### Automated Tests
- Auth guard unit tests: unauthenticated redirect, role mismatch redirect, correct role access
- Interceptor unit tests: token injection, 401 retry, error normalization, rate limit handling
- Component tests for all form components (booking form, driver form, rating form)
- Integration tests: Google sign-in → role routing → correct dashboard

### Manual Verification
- End-to-end: Customer books → Admin assigns driver → Driver runs trip → Fare displayed → Customer rates
- Commission flow: Driver marks paid → Admin sees and confirms
- Admin creates customer + booking manually
- Driver sets day off → not shown in assignment modal
- Responsive testing on mobile browsers (primary use case for drivers on the road)
- Test role mismatch: customer trying to access `/admin` → redirected
- Test expired session: interceptor refreshes token or redirects to sign-in
