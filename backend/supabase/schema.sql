-- ============================================================
-- VandiPilot — driver fare calculator database (Jira ON-24 / ON-25)
-- Temporary storage on Supabase (Free plan) for up to 6 months, then
-- permanent storage on AWS or similar. Everything here is plain Postgres
-- except auth.jwt(), which only the access-check functions use.
--
-- Run once in Supabase → SQL Editor. Safe to re-run: it only creates
-- what is missing and replaces the functions and policies.
-- ============================================================

-- ---------- Drivers (approved list, added by hand by the admin) ----------
create table if not exists public.drivers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  status      text not null default 'Active'
              check (status in ('Active', 'Inactive', 'Banned')),
  created_at  timestamptz not null default now()
);
create unique index if not exists drivers_email_key on public.drivers (lower(email));

-- ---------- Fare settings (one row, editable without code changes) ----------
create table if not exists public.fare_settings (
  id                                int primary key default 1 check (id = 1),
  running_rate_per_hour             numeric not null default 199,
  waiting_rate_per_hour             numeric not null default 99,
  waiting_tier_minutes              int     not null default 120,
  waiting_rate_after_tier_per_hour  numeric not null default 49,
  platform_percent                  numeric not null default 10,
  platform_cap_per_day              numeric not null default 300,
  minimum_fare                      numeric not null default 300,
  updated_at                        timestamptz not null default now()
);
insert into public.fare_settings (id) values (1) on conflict (id) do nothing;

-- ---------- Trips ----------
create table if not exists public.trips (
  id               text primary key check (id ~ '^VP-[0-9]{8}-[0-9]{3,}$'),
  driver_id        uuid not null references public.drivers (id),
  customer_name    text not null,
  pickup           text not null,
  destination      text not null,
  status           text not null default 'in_progress'
                   check (status in ('in_progress', 'completed')),
  started_at       timestamptz,
  completed_at     timestamptz,
  running_minutes  int,
  waiting_minutes  int,
  running_charge   numeric,
  waiting_charge   numeric,
  platform_charge  numeric,
  minimum_adjustment numeric,
  total_fare       numeric,
  fare_breakdown   jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists trips_driver_idx on public.trips (driver_id, created_at desc);

-- ---------- Trip events (one row per button press) ----------
create table if not exists public.trip_events (
  id          uuid primary key,              -- generated on the phone, so a retry never doubles a press
  trip_id     text not null references public.trips (id) on delete cascade,
  event       text not null check (event in
              ('start', 'halt', 'continue', 'reached_destination', 'returning', 'completed')),
  at          timestamptz not null,          -- when the driver pressed the button
  created_at  timestamptz not null default now()
);
create index if not exists trip_events_trip_idx on public.trip_events (trip_id, at);

-- ---------- Daily trip counter (for VP-YYYYMMDD-NNN) ----------
create table if not exists public.trip_counters (
  day      date primary key,
  last_no  int not null
);

-- ============================================================
-- Access checks
-- ============================================================

-- The signed-in driver's id, only if their email is on the list and Active.
create or replace function public.current_driver_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.drivers
  where lower(email) = lower(auth.jwt() ->> 'email')
    and status = 'Active'
  limit 1;
$$;

create or replace function public.is_active_driver() returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_driver_id() is not null;
$$;

-- ============================================================
-- Creating a trip: assigns the next VP-YYYYMMDD-NNN atomically, so two
-- drivers starting at the same moment can never get the same trip ID.
-- The date is the India date (Asia/Kolkata).
-- ============================================================
-- Customer phone numbers are deliberately not stored in this temporary setup
-- (decided 5 Nov 2026); personal details wait for the permanent database.
drop function if exists public.create_trip(text, text, text, text);
create or replace function public.create_trip(
  p_customer_name text,
  p_pickup text,
  p_destination text
) returns public.trips
language plpgsql security definer set search_path = public as $$
declare
  v_driver uuid := public.current_driver_id();
  v_day    date := (now() at time zone 'Asia/Kolkata')::date;
  v_no     int;
  v_trip   public.trips;
begin
  if v_driver is null then
    raise exception 'Not an approved driver' using errcode = '42501';
  end if;
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_pickup), '') = ''
     or coalesce(trim(p_destination), '') = '' then
    raise exception 'Customer name, pickup and destination are required';
  end if;

  insert into public.trip_counters as c (day, last_no) values (v_day, 1)
  on conflict (day) do update set last_no = c.last_no + 1
  returning last_no into v_no;

  insert into public.trips (id, driver_id, customer_name, pickup, destination)
  values (
    'VP-' || to_char(v_day, 'YYYYMMDD') || '-' || lpad(v_no::text, 3, '0'),
    v_driver, trim(p_customer_name), trim(p_pickup), trim(p_destination)
  )
  returning * into v_trip;
  return v_trip;
end;
$$;

-- ============================================================
-- Guard on button presses: the time comes from the phone (so presses
-- made without signal keep their real time once they sync), but it may
-- not be in the future or earlier than the previous press.
-- ============================================================
create or replace function public.trip_events_guard() returns trigger
language plpgsql as $$
declare
  v_last timestamptz;
begin
  if new.at is null or new.at > now() + interval '2 minutes' then
    new.at := now();
  end if;
  if new.at < now() - interval '24 hours' then
    raise exception 'Button press is more than 24 hours old';
  end if;
  select max(at) into v_last from public.trip_events where trip_id = new.trip_id;
  if v_last is not null and new.at < v_last then
    new.at := v_last;
  end if;
  return new;
end;
$$;

drop trigger if exists trip_events_guard on public.trip_events;
create trigger trip_events_guard before insert on public.trip_events
for each row execute function public.trip_events_guard();

-- ============================================================
-- Row level security: a driver sees and changes only their own trips.
-- The SQL Editor runs as admin and is not affected.
-- ============================================================
alter table public.drivers       enable row level security;
alter table public.fare_settings enable row level security;
alter table public.trips         enable row level security;
alter table public.trip_events   enable row level security;
alter table public.trip_counters enable row level security;  -- no policies: only create_trip() uses it

drop policy if exists "driver reads own row" on public.drivers;
create policy "driver reads own row" on public.drivers
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "active drivers read settings" on public.fare_settings;
create policy "active drivers read settings" on public.fare_settings
  for select using (public.is_active_driver());

drop policy if exists "driver reads own trips" on public.trips;
create policy "driver reads own trips" on public.trips
  for select using (driver_id = public.current_driver_id());

drop policy if exists "driver updates own trips" on public.trips;
create policy "driver updates own trips" on public.trips
  for update using (driver_id = public.current_driver_id())
  with check (driver_id = public.current_driver_id());

drop policy if exists "driver reads own events" on public.trip_events;
create policy "driver reads own events" on public.trip_events
  for select using (exists (
    select 1 from public.trips t where t.id = trip_id and t.driver_id = public.current_driver_id()));

drop policy if exists "driver adds events to open trips" on public.trip_events;
create policy "driver adds events to open trips" on public.trip_events
  for insert with check (exists (
    select 1 from public.trips t where t.id = trip_id
      and t.driver_id = public.current_driver_id() and t.status = 'in_progress'));

drop policy if exists "driver undoes own events" on public.trip_events;
create policy "driver undoes own events" on public.trip_events
  for delete using (exists (
    select 1 from public.trips t where t.id = trip_id and t.driver_id = public.current_driver_id()));

-- The browser only talks to the database with the signed-in user's token.
revoke all on public.trip_counters from anon, authenticated;
revoke all on public.drivers, public.fare_settings, public.trips, public.trip_events from anon;
grant select on public.drivers, public.fare_settings to authenticated;
grant select, update on public.trips to authenticated;
grant select, insert, delete on public.trip_events to authenticated;
grant execute on function public.create_trip(text, text, text) to authenticated;
grant execute on function public.current_driver_id(), public.is_active_driver() to authenticated;
revoke execute on function public.create_trip(text, text, text) from anon, public;
