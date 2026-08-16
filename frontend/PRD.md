# VandiPilot Frontend — Product Requirements Document (PRD)

## Title & Metadata

- **Status:** Draft
- **Date:** 2026-07-27
- **Source Documents:**
  - [frontend/implementation_plan.md](file:///d:/SJ/Business%20Ideas/IT%20Business/VandiPilot/Docs/frontend/implementation_plan.md) (primary)
  - [implementation_plan.md](file:///d:/SJ/Business%20Ideas/IT%20Business/VandiPilot/Docs/implementation_plan.md) (master plan, referenced by frontend plan)
- **Data Strategy:** All data is **dummy/hardcoded** for this iteration. No live Supabase database connections required.

---

## Executive Summary

VandiPilot is a driver-for-hire service where customers book professional drivers ("Pilots") to drive the customer's own vehicle. This PRD defines the frontend requirements for a **dummy-data demo build** of VandiPilot's web application, covering three role-based dashboards — Customer, Driver (Pilot), and Admin — with a working auth guard and interceptor system. The frontend is built with Next.js 15 (App Router), TypeScript, TailwindCSS v4, and Shadcn/UI (per frontend/implementation_plan.md).

---

## Problem Statement

VandiPilot currently lacks a functional frontend that demonstrates the end-to-end user experience for its three stakeholders. Before connecting to a live backend, the team needs a **working demo with dummy data** that proves:
1. The role-based routing and auth guard system works correctly across all three roles.
2. Each stakeholder's dashboard, pages, and workflows are functional and navigable.
3. The interceptor layer is in place and loosely coupled, ready for future backend integration.

---

## Goals

1. Build all three stakeholder dashboards (Customer, Driver, Admin) as functional pages with hardcoded dummy data.
2. Implement a working auth guard system with two layers: Next.js middleware (server-side) and layout-level role guards (client-side) (per frontend/implementation_plan.md).
3. Implement a loosely coupled interceptor system (request and response interceptors) that can be swapped to real Supabase calls later without restructuring (per frontend/implementation_plan.md).
4. Deliver a navigable demo within 2 days (userQ).

---

## Non-Goals & Out of Scope

The following are explicitly **not** in scope for this iteration (userQ):

1. **No payment gateway integration** — All fare and commission amounts are displayed from dummy data; no Razorpay/Stripe or real payment processing.
2. **No SMS/WhatsApp notifications** — Notifications are in-app only, rendered from dummy data. No external messaging service integration.
3. **No map/GPS integration** — Pickup and destination locations are text-based inputs only. No Google Maps, Mapbox, or geolocation APIs.
4. **No live Supabase connection** — All data (profiles, bookings, trips, pricing, ratings, notifications) is hardcoded dummy data. No database reads/writes.
5. **No real Google OAuth** — Auth flow is simulated (e.g., clicking "Sign In" sets a dummy session with a selected role). The auth guard and role routing logic must still function correctly.
6. **No file uploads** — Profile photos and driver documents use placeholder images.
7. **No Supabase Realtime** — Realtime subscriptions are deferred; status changes are static dummy data.
8. **No responsive mobile optimization** — Desktop-first; mobile polish is deferred to a later phase.

---

## Target Users

| User | Role | Description |
|---|---|---|
| **Customer** | `customer` | A vehicle owner who books a professional driver (Pilot) to drive their car for trips. |
| **Driver (Pilot)** | `driver` | A professional driver employed/contracted by VandiPilot who is assigned to customer trips, manages their schedule, and tracks earnings/commissions. |
| **Admin** | `admin` | The VandiPilot business operator who manages all bookings, assigns drivers, tracks commissions, manages pricing, and views revenue reports. Identified by a hardcoded email address (per implementation_plan.md). |

---

## User Stories

### Customer
- As a **Customer**, I want to see my upcoming and past trips on a dashboard, so that I can track my booking history.
- As a **Customer**, I want to fill out a booking form with pickup, destination, date, and time, so that I can request a Pilot.
- As a **Customer**, I want to see a status timeline for my trip (Requested → Driver Assigned → Running Leg 1 → Waiting → Running Leg 2 → Completed), so that I know where my trip stands (per frontend/implementation_plan.md).
- As a **Customer**, I want to see fare breakdown details after a trip is completed, so that I understand what I'm being charged.
- As a **Customer**, I want to rate my driver (1–5 stars + optional comment) after a trip, so that I can provide feedback.
- As a **Customer**, I want to edit my profile (name, phone, default pickup address, vehicle details), so that future bookings are pre-filled.

### Driver (Pilot)
- As a **Driver**, I want to see my assigned upcoming trips, so that I know my schedule.
- As a **Driver**, I want to tap a single contextual button to advance the trip status (Start Running → Arrived → Left → Complete), so that timestamps are recorded without complex navigation (per frontend/implementation_plan.md).
- As a **Driver**, I want to see my earnings broken down by trip with running time, waiting time, total fare, commission (10%), and net earnings, so that I can track my income (per implementation_plan.md).
- As a **Driver**, I want to mark days as unavailable on a calendar, so that I am not assigned trips on my days off.
- As a **Driver**, I want to mark a commission as paid, so that the admin knows I've settled my 10% share.

### Admin
- As an **Admin**, I want to see KPI cards (total bookings, active trips, total drivers, total customers, revenue, pending commissions), so that I have an at-a-glance business overview (per frontend/implementation_plan.md).
- As an **Admin**, I want to assign an available driver to a pending booking by selecting from a filtered list (date availability + vehicle/transmission match), so that bookings are fulfilled efficiently.
- As an **Admin**, I want to manually create a booking and optionally add a new customer inline, so that I can handle phone/walk-in bookings.
- As an **Admin**, I want to add, edit, deactivate, or ban drivers, so that I can manage my driver pool.
- As an **Admin**, I want to confirm that a driver's commission payment has been received, so that the financial ledger is accurate.
- As an **Admin**, I want to manage pricing tiers (hourly local, hourly outstation, daily within/above 200km, special services), so that rates stay current (per implementation_plan.md).
- As an **Admin**, I want to view revenue charts and per-driver reports, so that I can make data-driven business decisions.

---

## Functional Requirements

### Auth Guard & Role Routing

1. **FR-AUTH-01:** The Next.js root middleware shall intercept every request to `/customer/*`, `/driver/*`, and `/admin/*` routes and verify the user's authentication status before allowing access (per frontend/implementation_plan.md).
2. **FR-AUTH-02:** If an unauthenticated user attempts to access a protected route, the middleware shall redirect them to the landing page (`/`).
3. **FR-AUTH-03:** If an authenticated user's role does not match the route prefix (e.g., a `customer` user accessing `/admin`), the middleware shall redirect them to the correct dashboard for their role, using the mapping: `customer → /customer`, `driver → /driver`, `admin → /admin` (per frontend/implementation_plan.md).
4. **FR-AUTH-04:** Each stakeholder route group (`/customer`, `/driver`, `/admin`) shall have a layout-level Role Guard component that re-validates the user's role on the client side, as a second layer of protection (per frontend/implementation_plan.md).
5. **FR-AUTH-05:** The Admin role guard shall additionally verify that the user's email matches the hardcoded admin email (per implementation_plan.md).
6. **FR-AUTH-06:** For this dummy-data iteration, the sign-in flow shall be simulated: a "Sign In" button on the landing page shall present a role selector (Customer / Driver / Admin) that sets a dummy session with the selected role (userQ — no real Google OAuth).
7. **FR-AUTH-07:** The AuthGuard component shall subscribe to auth state changes and render a loading fallback while verifying the session (per frontend/implementation_plan.md).
8. **FR-AUTH-08:** The auth guard system shall be loosely coupled — swapping the dummy auth provider for real Supabase Auth shall not require changes to the guard components or middleware logic (userQ).

### Interceptors

9. **FR-INT-01:** A request interceptor (`lib/interceptors/request-interceptor.ts`) shall wrap all outgoing API calls via a custom `apiFetch()` function and inject the Authorization header from the current session (per frontend/implementation_plan.md).
10. **FR-INT-02:** If no session exists when a request is made, the request interceptor shall abort the request and trigger sign-out (per frontend/implementation_plan.md).
11. **FR-INT-03:** The request interceptor shall attach an AbortController with a 30-second default timeout and a 120-second timeout for file upload operations (per frontend/implementation_plan.md).
12. **FR-INT-04:** The request interceptor shall deduplicate concurrent identical GET requests by returning the existing in-flight Promise (per frontend/implementation_plan.md).
13. **FR-INT-05:** A response interceptor (`lib/interceptors/response-interceptor.ts`) shall process all incoming responses and, on a 401 status, attempt a silent token refresh; if refresh fails, clear the session and redirect to `/` with a "Session expired" message (per frontend/implementation_plan.md).
14. **FR-INT-06:** The response interceptor shall normalize all error shapes into a consistent `AppError` type: `{ code: string, message: string, status: number, details?: unknown }` (per frontend/implementation_plan.md).
15. **FR-INT-07:** The response interceptor shall map HTTP error codes to user-friendly messages: 403 → permission denied, 404 → not found, 409 → conflict/stale data, 429 → rate limited, 500+ → generic server error (per frontend/implementation_plan.md).
16. **FR-INT-08:** On a 429 response, the response interceptor shall extract the `Retry-After` header and retry the request up to 3 times after the specified delay (per frontend/implementation_plan.md).
17. **FR-INT-09:** The interceptor system shall be loosely coupled — replacing dummy fetch calls with real Supabase client calls shall require changes only in the `apiFetch()` wrapper, not in any calling components (userQ).

### Landing Page

18. **FR-LAND-01:** The landing page at `/` shall display: Hero section with "Book a Pilot" and "Sign In" CTAs, How It Works (3-step process), Services & Pricing cards, Why Choose VandiPilot section, Contact section, and Footer (per implementation_plan.md).
19. **FR-LAND-02:** Services & Pricing cards shall display dummy pricing data matching the pricing types defined in the master plan: hourly local, hourly outstation, daily within 200km, daily above 200km, special service centre, special family function (per implementation_plan.md).

### Customer Module

20. **FR-CUST-01:** The customer dashboard (`/customer`) shall display: welcome banner with customer name, "Book a Pilot" CTA, active/upcoming trips section with status badges, trip history section (paginated, 10 per page), and services & pricing section (per frontend/implementation_plan.md).
21. **FR-CUST-02:** The booking form (`/customer/book`) shall include fields for: Pickup Location (pre-filled from dummy profile's `default_pickup_address`), Destination, Date picker (future dates only), and Time picker. Car type and transmission shall be pre-filled from the dummy profile (per frontend/implementation_plan.md).
22. **FR-CUST-03:** On booking form submission, the UI shall display a success confirmation with a booking reference ID in the format `VP-YYYYMMDD-NNN` (e.g., `VP-20260714-001`) (per implementation_plan.md).
23. **FR-CUST-04:** The trip detail page (`/customer/trips/[id]`) shall display a status timeline visualization showing: Requested → Driver Assigned → Running (Leg 1) → Waiting → Running (Leg 2) → Completed (per frontend/implementation_plan.md).
24. **FR-CUST-05:** When a driver is assigned to a trip, the trip detail page shall display the driver's name, phone number, and profile photo (dummy data) (per frontend/implementation_plan.md).
25. **FR-CUST-06:** After a trip is completed, the trip detail page shall display a fare breakdown: running time, waiting time, running charge, waiting charge, and total fare (dummy data) (per frontend/implementation_plan.md).
26. **FR-CUST-07:** After a trip is completed, the trip detail page shall display a rating form with 1–5 star selection and an optional comment textarea (per frontend/implementation_plan.md).
27. **FR-CUST-08:** The customer profile page (`/customer/profile`) shall allow editing: Full Name, Phone, Default Pickup Address, Default Vehicle (car type, transmission, registration number). Email and Profile Photo shall be read-only (per frontend/implementation_plan.md).

### Driver Module

28. **FR-DRV-01:** The driver dashboard (`/driver`) shall display: upcoming assigned trips (customer name, pickup, destination, date/time), an active trip card (if in progress), quick stats (trips this week/month, total earnings), notification bell, and a calendar icon link (per frontend/implementation_plan.md).
29. **FR-DRV-02:** The active trip card on the dashboard shall show a single contextual status transition button that displays only the next valid action: `driver_assigned` → "Start Running", `running_leg1` → "Arrived at Destination", `waiting` → "Left Destination", `running_leg2` → "Trip Complete" (per frontend/implementation_plan.md).
30. **FR-DRV-03:** Each status transition button tap shall record a timestamp (stored in dummy data for this iteration) (per implementation_plan.md).
31. **FR-DRV-04:** The active trip controls page (`/driver/trips/[id]`) shall display: full trip detail (customer name, phone, pickup, destination, scheduled date/time), contextual status transition button, and after completion: fare breakdown, commission amount (10% of total), and a "Mark Commission Paid" button (per frontend/implementation_plan.md).
32. **FR-DRV-05:** The earnings page (`/driver/earnings`) shall display a per-trip breakdown table with columns: Date, Customer, Running Time, Waiting Time, Total Fare, Commission (10%), Net Earnings. The table shall support a weekly/monthly toggle and show commission status per trip (per frontend/implementation_plan.md).
33. **FR-DRV-06:** The calendar page (`/driver/calendar`) shall display a calendar view with: assigned trips by date (clickable), days marked as unavailable, and the ability to mark a day off with an optional reason. Visual indicators: booked (blue), available (green), day off (gray) (per frontend/implementation_plan.md).

### Admin Module

34. **FR-ADM-01:** The admin dashboard (`/admin`) shall display KPI cards: Total Bookings (today/week/month), Active Trips, Total Drivers (active), Total Customers, Revenue Summary (this month), Pending Commissions count. All values from dummy data (per frontend/implementation_plan.md).
35. **FR-ADM-02:** The admin dashboard shall display a recent bookings list (latest 5) and an alerts section showing: new bookings pending driver assignment and overdue commissions (per frontend/implementation_plan.md).
36. **FR-ADM-03:** The booking management page (`/admin/bookings`) shall display a filterable table of all bookings with filters: status, date range, customer name, driver name. Clicking a row shall show booking details (per frontend/implementation_plan.md).
37. **FR-ADM-04:** The booking management page shall include an "Assign Driver" button that opens a modal showing available drivers filtered by: date availability (not on day off), vehicle type match, and transmission match (per frontend/implementation_plan.md).
38. **FR-ADM-05:** The booking management page shall include a "Cancel Booking" action that requires a cancellation reason (per frontend/implementation_plan.md).
39. **FR-ADM-06:** The manual booking creation page (`/admin/bookings/new`) shall allow selecting an existing customer or creating a new customer inline (Full Name, Phone, Email). Booking fields: Pickup, Destination, Date, Time, Car Type, Transmission. Submission shall set `created_by='admin'` (per frontend/implementation_plan.md).
40. **FR-ADM-07:** The driver management page (`/admin/drivers`) shall display a table with columns: Name, Phone, Status (active/inactive), Total Trips, Average Rating. Inline actions: Deactivate/Reactivate toggle, Ban driver (per frontend/implementation_plan.md).
41. **FR-ADM-08:** The add driver page (`/admin/drivers/new`) shall include a form with fields: Full Name, Phone, Gmail, Address, Years of Experience, Vehicle Types (multi-select: hatchback, sedan, SUV, luxury), Transmission Skills (multi-select: manual, automatic), Bank Account/UPI, Emergency Contact. Optional: Driving License Number, License Expiry, Aadhaar Number, Profile Photo upload placeholder (per frontend/implementation_plan.md).
42. **FR-ADM-09:** The customer management page (`/admin/customers`) shall display a table with Total Bookings and Last Booking Date per customer, with Ban/Unban toggle (per frontend/implementation_plan.md).
43. **FR-ADM-10:** The commission tracker (`/admin/commissions`) shall display a table with columns: Driver Name, Trip Date, Total Fare, Commission Amount (10%), Status (`Pending` | `Driver Marked Paid` | `Admin Confirmed`). Filters: date range, driver, status. A "Confirm Payment" button shall be available (per frontend/implementation_plan.md).
44. **FR-ADM-11:** The reports page (`/admin/reports`) shall display: revenue summary chart (by day/week/month), per-driver report table (earnings, trips, commissions, average rating), and trend charts (revenue trend, bookings trend, top 5 drivers). A date range picker shall filter all charts. All data from dummy data (per frontend/implementation_plan.md).
45. **FR-ADM-12:** The pricing management page (`/admin/pricing`) shall display an editable table of all pricing tiers with columns: Pricing Type, Rate, Unit, Minimum Charge, Minimum Duration, Active toggle (per frontend/implementation_plan.md).
46. **FR-ADM-13:** The ratings page (`/admin/ratings`) shall display a table with columns: Driver Name, Rating (1–5), Comment, Date. Filterable by driver and by rating level (per frontend/implementation_plan.md).

### Shared Components

47. **FR-SHARED-01:** A notification bell component shall be present in the header of all three dashboards, displaying an unread count badge and a dropdown list of recent notifications (dummy data) (per frontend/implementation_plan.md).
48. **FR-SHARED-02:** A role-aware dashboard sidebar (`DashboardSidebar.tsx`) shall render navigation links specific to the user's role: Customer (Dashboard, Book a Pilot, My Trips, Profile), Driver (Dashboard, Earnings, Calendar), Admin (Dashboard, Bookings, Drivers, Customers, Commissions, Reports, Pricing, Ratings) (per frontend/implementation_plan.md).
49. **FR-SHARED-03:** A dashboard header (`DashboardHeader.tsx`) shall display the user's avatar, name, notification bell, and sign-out button (per frontend/implementation_plan.md).

---

## Technical Specification

### Architecture

- **Framework:** Next.js 15 with App Router (server and client components) (per frontend/implementation_plan.md)
- **Language:** TypeScript in strict mode (per frontend/implementation_plan.md)
- **Styling:** TailwindCSS v4 + Shadcn/UI component library (per frontend/implementation_plan.md)
- **State Management:** React Context for auth state and notifications (per frontend/implementation_plan.md)
- **Route Groups:** `(public)` for unauthenticated routes, `(protected)` for authenticated routes with nested role-specific groups (`customer/`, `driver/`, `admin/`) (per frontend/implementation_plan.md)

### Data Model (Dummy Data)

Since this iteration uses hardcoded dummy data, the following TypeScript types shall mirror the database schema defined in the master plan, with dummy arrays/objects in a `lib/dummy-data/` directory:

- `profiles` — 3+ dummy profiles (1 customer, 1 driver, 1 admin) (per implementation_plan.md)
- `customer_vehicles` — 1 dummy vehicle per customer (per implementation_plan.md)
- `driver_profiles` — 2+ dummy driver profiles with varied vehicle types and transmission skills (per implementation_plan.md)
- `driver_availability` — A few dummy days off (per implementation_plan.md)
- `bookings` — 5+ dummy bookings across various statuses: `requested`, `driver_assigned`, `running_leg1`, `waiting`, `running_leg2`, `completed`, `cancelled` (per implementation_plan.md)
- `trip_timestamps` — Dummy timestamps for completed trips (per implementation_plan.md)
- `trip_fares` — Dummy fare breakdowns with running/waiting charges, commission (10%), driver earnings (90%) (per implementation_plan.md)
- `pricing` — All 6 pricing types with dummy rates: `hourly_local`, `hourly_outstation`, `daily_within_200`, `daily_above_200`, `special_service_centre`, `special_family_function` (per implementation_plan.md)
- `ratings` — 3+ dummy ratings with 1–5 star values and optional comments (per implementation_plan.md)
- `notifications` — Dummy notifications for each role (per implementation_plan.md)

### APIs/Interfaces

For this dummy-data iteration, there are no real API calls. All data access goes through:
- **`lib/dummy-data/*.ts`** — Exported arrays/objects of typed dummy records
- **`apiFetch()` wrapper** — The interceptor system wraps a custom fetch function that, for now, resolves from dummy data. When Supabase is connected later, only the `apiFetch()` implementation changes — no component changes needed (per frontend/implementation_plan.md, userQ — loosely coupled).

### Dependencies

| Dependency | Purpose |
|---|---|
| Next.js 15 | App Router, server/client components, middleware (per frontend/implementation_plan.md) |
| TypeScript | Type safety (per frontend/implementation_plan.md) |
| TailwindCSS v4 | Utility-first styling (per frontend/implementation_plan.md) |
| Shadcn/UI | Pre-built accessible component primitives (per frontend/implementation_plan.md) |
| React Context | Auth and notification state management (per frontend/implementation_plan.md) |

> [!NOTE]
> Supabase JS client, Supabase Auth, and Supabase Realtime are **not** dependencies for this iteration. They will be added when connecting to a live backend.

### Constraints

- **2-day delivery window** (userQ) — This constrains scope to functional pages with dummy data; deep polish is deferred.
- **No external service dependencies** — The demo must run entirely locally with `npm run dev`, no Supabase project or Google OAuth credentials required.
- **Auth guard must be functional** — Even with dummy auth, the middleware and role guard logic must correctly redirect users based on role (userQ).
- **Interceptors must be loosely coupled** — The `apiFetch()` abstraction must be the only integration point that changes when switching from dummy data to real Supabase calls (userQ).

---

## Pricing & Monetization Strategy (VandiPilot Specific)

The pricing model is defined in the master plan and displayed in dummy data:

| Pricing Type | Description |
|---|---|
| `hourly_local` | Local trips charged per hour (per implementation_plan.md) |
| `hourly_outstation` | Outstation trips charged per hour (per implementation_plan.md) |
| `daily_within_200` | Daily rate for trips within 200km (per implementation_plan.md) |
| `daily_above_200` | Daily rate for trips above 200km (per implementation_plan.md) |
| `special_service_centre` | Special rate for service centre trips (per implementation_plan.md) |
| `special_family_function` | Special rate for family function trips (per implementation_plan.md) |

- **Commission:** Fixed at 10% of total fare. Driver retains 90%. (per implementation_plan.md)
- **Commission status flow:** `pending` → `driver_marked_paid` → `admin_confirmed` (per implementation_plan.md)
- **Fare formula:** running_charge (running_minutes × running_rate_per_hour / 60) + waiting_charge (waiting_minutes × waiting_rate_per_15min / 15) = total_fare (per implementation_plan.md)
- **Minimum charge:** Each pricing tier has a `min_charge` and `min_duration` (e.g., ₹300 for 2 hours) (per implementation_plan.md)

> [!NOTE]
> No real payment gateway is integrated in this iteration (userQ). All fares and commissions are displayed from dummy data.

---

## Legal & Compliance (VandiPilot Specific)

- **Driver background checks:** The specific criteria are an open question in the master plan (Aadhaar verification, police clearance, driving test, reference calls — TBD) (per implementation_plan.md, Open Question #1).
- **Admin email hardcoding:** The admin role is determined by a hardcoded email address, which needs to be confirmed (per implementation_plan.md).
- **Data privacy:** Not applicable for this dummy-data iteration. Will need DPDP Act compliance review before production launch with real user data.

---

## Offline & Connectivity Scenarios (VandiPilot Specific)

Not applicable for this dummy-data iteration. All data is hardcoded and the app runs locally. Offline/connectivity handling will be addressed when connecting to Supabase (particularly for the driver's mobile use case on the road).

---

## Localization (VandiPilot Specific)

Not applicable for this iteration. The demo will be in English only. Localization (Tamil, Hindi) will be addressed in a future phase.

---

## Success Metrics

1. **All 3 stakeholder dashboards render** with dummy data and are fully navigable — every page listed in the route structure loads without errors (userQ).
2. **Auth guard correctly routes users by role** — a `customer` session accesses only `/customer/*`, a `driver` session accesses only `/driver/*`, an `admin` session accesses only `/admin/*`; mismatched roles are redirected (userQ).
3. **Role switching via simulated sign-in** works — a user can sign out and sign back in with a different role, and the guards route them correctly.
4. **Interceptor layer is present and loosely coupled** — `apiFetch()` serves dummy data through the interceptor pipeline; swapping to real fetch requires changes only in the wrapper, not in components (userQ).
5. **Booking form submits** and displays a confirmation with reference ID format `VP-YYYYMMDD-NNN`.
6. **Driver trip status transitions** work — clicking the contextual button advances through the status enum and the UI updates accordingly.
7. **Admin driver assignment modal** opens and displays a filtered list of available drivers.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **2-day scope creep** — Attempting to polish all pages may exceed the 2-day window | High | Medium | Prioritize auth guard + interceptor foundation and the 3 dashboard home pages first. Defer deep sub-page polish to next iteration. |
| **Dummy data mismatch** — Dummy data types may drift from the real database schema when Supabase is connected | Medium | Medium | Generate TypeScript types (`lib/types/database.ts`) that exactly mirror the master plan's schema. Dummy data must conform to these types. |
| **Auth guard tight coupling** — If the guard logic is mixed with Supabase-specific code, it will be hard to swap providers | Medium | High | Keep auth provider behind an abstract interface (`AuthProvider`). The dummy provider and future Supabase provider both implement it. Guards consume only the interface. |
| **Landing page design ambiguity** — Brand refresh colors/fonts are TBD (per master plan) | Low | Low | Use a neutral Shadcn/UI theme for the demo. Brand-specific styling is deferred to the Polish phase. |

---

## Open Questions & Assumptions

### Open Questions (carried from source docs)

1. **Driver Background Check Criteria** — What specific checks does VandiPilot perform? (Aadhaar, police clearance, driving test, reference calls?) This affects the landing page "Why Choose VandiPilot" section and the driver profile form. (per implementation_plan.md, Open Question #1)
2. **Booking Time Granularity** — Should time slots be 30-minute increments, 1-hour increments, or free-form? Affects the booking form's time picker component. (per implementation_plan.md, Open Question #2)
3. **Multiple Destinations** — Should a trip support multiple stops (Pickup → Hospital → Pharmacy → Home), or always single destination with round-trip? Affects the booking form fields and trip detail display. (per implementation_plan.md, Open Question #3)
4. **Admin Email** — Which Gmail address should be the hardcoded admin account? (per implementation_plan.md, User Review Required)
5. **Brand Refresh** — Color scheme and font choices are TBD. (per implementation_plan.md, User Review Required)

### Assumptions

- A1: All trips are round-trip by default (per implementation_plan.md).
- A2: Commission rate is fixed at 10% with no variation by pricing type or volume (per implementation_plan.md).
- A3: New Google sign-ups are auto-assigned the `customer` role unless their email was pre-registered by an admin as a driver (per implementation_plan.md).
- A4: The booking reference ID format is `VP-YYYYMMDD-NNN` (per implementation_plan.md).
- A5: The booking status enum follows exactly: `requested` → `driver_assigned` → `running_leg1` → `waiting` → `running_leg2` → `completed` / `cancelled` (per implementation_plan.md).
- A6: For this iteration, "loosely coupled" means the `apiFetch()` wrapper is the single integration point between UI components and data access (userQ).

---

## Appendix

### Route Structure Reference

```
/                          → Public landing page
/auth/callback             → OAuth callback handler (simulated)
/customer                  → Customer dashboard
/customer/book             → Booking form
/customer/trips/[id]       → Trip detail & status
/customer/profile          → Edit customer profile
/driver                    → Driver dashboard
/driver/trips/[id]         → Active trip controls
/driver/earnings           → Earnings summary
/driver/calendar           → Schedule & availability
/admin                     → Admin dashboard (KPIs)
/admin/bookings            → Booking management
/admin/bookings/new        → Manual booking creation
/admin/drivers             → Driver management
/admin/drivers/new         → Add new driver
/admin/customers           → Customer management
/admin/commissions         → Commission tracker
/admin/reports             → Revenue & earnings reports
/admin/pricing             → Pricing tier management
/admin/ratings             → Ratings & feedback
```

### Booking Status Flow

```
requested → driver_assigned → running_leg1 → waiting → running_leg2 → completed
                                                                     ↘ cancelled
```

### Commission Status Flow

```
pending → driver_marked_paid → admin_confirmed
```

### Source Documents

- [frontend/implementation_plan.md](file:///d:/SJ/Business%20Ideas/IT%20Business/VandiPilot/Docs/frontend/implementation_plan.md) — Primary source for project structure, auth guards, interceptors, component lists, and page specifications.
- [implementation_plan.md](file:///d:/SJ/Business%20Ideas/IT%20Business/VandiPilot/Docs/implementation_plan.md) — Master plan referenced by the frontend plan for database schema, pricing types, booking status enum, fare calculation formula, and open questions.
