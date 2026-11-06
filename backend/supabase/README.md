# Driver fare calculator — Supabase setup (ON-22 / ON-24 / ON-25)

Temporary storage for up to 6 months (review **4 May 2027**), then a move to
permanent storage on AWS or similar. Plan: Confluence → *Driver module: story
plan and storage*.

Agreed with Sanjo on ON-22 (4 Nov 2026):
- Drivers are an **approved email list** the admin adds by hand (SQL below).
- Supabase **Free plan**. Jobin does the setup.
- Trip ID `VP-YYYYMMDD-NNN`, assigned by the database when the driver starts a trip.
- The driver enters customer name, pickup and destination. **No customer phone number
  is collected or stored** in this temporary setup (decided 5 Nov 2026); personal
  details wait for the permanent database.

## 1. Create the project
1. Sign in to supabase.com with **vandipilot@gmail.com** → New project (Free plan,
   region **Mumbai / ap-south-1**). Save the database password in the Confluence
   *Credentials* page.
2. Settings → **API Keys** (or the **Connect** button): copy the **Project URL** and the
   **publishable key** (`sb_publishable_…`) into `frontend/deploy/driver/config.js`.
   The publishable key is meant to be public; the database rules decide what each
   driver can see. Never put a **secret** key (`sb_secret_…`) or the legacy
   `service_role` key in the website. (The legacy `anon` key also works, but
   Supabase is retiring the legacy keys by the end of 2026.)

## 2. Google sign-in
1. Supabase → Authentication → Sign In / Providers → **Google**: copy the
   **Callback URL** shown there (`https://<project-ref>.supabase.co/auth/v1/callback`).
2. Google Cloud Console (same Gmail) → create or pick a project →
   **Google Auth Platform**:
   - *Branding*: app name "VandiPilot", support email vandipilot@gmail.com.
   - *Audience*: **External**, then **Publish app** (in "Testing" only listed test
     users can sign in).
   - *Clients* → Create client → **Web application**:
     - Authorized JavaScript origins: `https://vandipilot.com`
       (and `http://localhost:8765` while testing locally)
     - Authorized redirect URIs: the Supabase Callback URL from step 1
   - Copy the **Client ID** and **Client secret**.
3. Back in Supabase → Google provider: paste the Client ID and secret, turn it **on**, save.
4. Supabase → Authentication → URL Configuration:
   - Site URL: `https://vandipilot.com`
   - Redirect URLs: `https://vandipilot.com/driverCalculation/`
     (add `http://localhost:8765/driverCalculation/` for local testing)

## 3. Create the tables
Supabase → SQL Editor → paste `schema.sql` → Run. It is safe to run again after changes.

It creates `drivers`, `fare_settings`, `trips`, `trip_events`, `trip_counters`,
the `create_trip()` function and the row-level security rules:
- a driver signs in with Google, but sees nothing unless their email is in
  `drivers` with status `Active`;
- a driver sees and changes only their own trips;
- button presses can only be added to a trip that is still in progress;
- a driver can undo (delete) their own presses.

## 4. Add, remove or block a driver
Run these in the SQL Editor (it runs as admin, so the rules above don't block it):

```sql
-- add
insert into public.drivers (name, email, phone)
values ('Arun Shankar', 'arun.shankar@gmail.com', '+919876543210');

-- deactivate (they can no longer sign in)
update public.drivers set status = 'Inactive' where lower(email) = lower('arun.shankar@gmail.com');

-- reactivate
update public.drivers set status = 'Active' where lower(email) = lower('arun.shankar@gmail.com');

-- list
select name, email, phone, status, created_at from public.drivers order by name;
```

The email must be the driver's Google account (any Gmail, or a work email hosted on Google).
Upper/lower case does not matter.

## 5. Change the rates
Rates live in one row, so no code change is needed:

```sql
update public.fare_settings
set running_rate_per_hour = 199, waiting_rate_per_hour = 99, waiting_tier_minutes = 120,
    waiting_rate_after_tier_per_hour = 49, platform_percent = 10,
    platform_cap_per_day = 300, minimum_fare = 300, updated_at = now()
where id = 1;
```

## 6. Free plan: keep it alive and backed up
- Free projects are **paused after one week with no activity**. If drivers have not
  used the tool for a few days, open the dashboard; restore the project if it is paused.
- The Free plan has **no daily backups**. Export weekly:
  - Table Editor → each table → *Export to CSV*, or
  - `pg_dump "<connection string from Project Settings → Database>" -Fc -f vandipilot-YYYY-MM-DD.dump`
- Check supabase.com/pricing for the current limits.

## Fare rules (in `frontend/deploy/driver/fare.js`, not in the database)
| Rule | Value |
|---|---|
| Running time | ₹199/hr, charged by the minute |
| Waiting, per stop | ₹99/hr for the first 2 hours, then ₹49/hr, by the minute |
| Wait between *Reached destination* and *Returning* | one stop under the same rule |
| Platform charge | 10% of running + waiting, capped at ₹300 per calendar day of the trip |
| Minimum | the whole fare (including the platform charge) is at least ₹300 |

Tests: `node --test frontend/driver-tests/fare.test.mjs`

## Moving to AWS later (ON-25)
Everything is plain Postgres except `auth.jwt()` in `current_driver_id()`.
Copy the data with `pg_dump` / `pg_restore`, then move the email check into the
API layer. In the website only `frontend/deploy/driver/api.js` talks to the
database, so that is the one file to change.
