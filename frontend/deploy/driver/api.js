/* VandiPilot driver tool — data access (ON-24).
   One small interface, two implementations:
   - Supabase (the real thing, once config.js is filled in)
   - Demo (only when Supabase is not configured and the URL has ?demo=1),
     so the screens can be reviewed before the Supabase project exists.
   Keeping all database calls here means only this file changes when the
   storage moves to AWS (ON-25). */
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js';
import { DEFAULT_SETTINGS } from './fare.js';

export class NetworkError extends Error {}

const isNetworkFailure = (err) =>
  !navigator.onLine || /fetch|network|load failed|timeout/i.test(String(err && (err.message || err)));

function wrap(error) {
  if (!error) return;
  if (isNetworkFailure(error)) throw new NetworkError('No connection');
  throw new Error(error.message || String(error));
}

const mapSettings = (row) => row ? {
  runningRatePerHour: Number(row.running_rate_per_hour),
  waitingRatePerHour: Number(row.waiting_rate_per_hour),
  waitingTierMinutes: Number(row.waiting_tier_minutes),
  waitingRateAfterTierPerHour: Number(row.waiting_rate_after_tier_per_hour),
  platformPercent: Number(row.platform_percent),
  platformCapPerDay: Number(row.platform_cap_per_day),
  minimumFare: Number(row.minimum_fare),
} : {};

function supabaseApi() {
  if (!window.supabase) throw new Error('Supabase library did not load');
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  });
  const run = async (p) => {
    let res;
    try { res = await p; } catch (e) { wrap(e); }
    wrap(res.error);
    return res.data;
  };
  return {
    mode: 'supabase',
    async getSession() { const { data } = await client.auth.getSession(); return data.session; },
    async signInWithGoogle(redirectTo) {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { prompt: 'select_account' } },
      });
      wrap(error);
    },
    async signOut() { await client.auth.signOut(); },
    getDriver: () => run(client.from('drivers').select('id,name,email,status').maybeSingle()),
    async getSettings() {
      return { ...DEFAULT_SETTINGS, ...mapSettings(await run(client.from('fare_settings').select('*').eq('id', 1).maybeSingle())) };
    },
    getOpenTrip: () => run(client.from('trips').select('*').eq('status', 'in_progress').order('created_at', { ascending: false }).limit(1).maybeSingle()),
    getLastCompletedTrip: () => run(client.from('trips').select('*').eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle()),
    getTrip: (id) => run(client.from('trips').select('*').eq('id', id).maybeSingle()),
    getEvents: (tripId) => run(client.from('trip_events').select('id,event,at').eq('trip_id', tripId).order('at', { ascending: true })),
    createTrip: (t) => run(client.rpc('create_trip', {
      p_customer_name: t.customerName, p_pickup: t.pickup, p_destination: t.destination,
    })),
    insertEvent: (e) => run(client.from('trip_events').upsert(
      { id: e.id, trip_id: e.tripId, event: e.type, at: e.at }, { onConflict: 'id', ignoreDuplicates: true })),
    deleteEvent: (id) => run(client.from('trip_events').delete().eq('id', id)),
    updateTrip: (id, patch) => run(client.from('trips').update(patch).eq('id', id)),
  };
}

/* ---------- Demo backend (browser storage only, never used in production) ---------- */
function demoApi() {
  const KEY = 'vp.demo.db';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  const db = load() || { trips: [], events: [], counter: {}, signedIn: false };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* private mode */ } };
  const delay = (v) => new Promise((r) => setTimeout(() => r(v), 150));
  const driver = { id: 'demo-driver', name: 'Demo Driver', email: 'demo@vandipilot.com', status: 'Active' };
  return {
    mode: 'demo',
    async getSession() { return db.signedIn ? { user: { email: driver.email } } : null; },
    async signInWithGoogle(redirectTo) { db.signedIn = true; save(); location.href = redirectTo; },
    async signOut() { db.signedIn = false; save(); },
    getDriver: () => delay(driver),
    getSettings: () => delay({ ...DEFAULT_SETTINGS }),
    getOpenTrip: () => delay(db.trips.filter((t) => t.status === 'in_progress').at(-1) || null),
    getLastCompletedTrip: () => delay([...db.trips].filter((t) => t.status === 'completed')
      .sort((a, b) => String(a.completed_at).localeCompare(String(b.completed_at))).at(-1) || null),
    getTrip: (id) => delay(db.trips.find((t) => t.id === id) || null),
    getEvents: (tripId) => delay(db.events.filter((e) => e.trip_id === tripId).sort((a, b) => a.at.localeCompare(b.at))),
    async createTrip(t) {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).replaceAll('-', '');
      db.counter[day] = (db.counter[day] || 0) + 1;
      const trip = { id: `VP-${day}-${String(db.counter[day]).padStart(3, '0')}`, status: 'in_progress',
        customer_name: t.customerName, pickup: t.pickup, destination: t.destination,
        created_at: new Date().toISOString() };
      db.trips.push(trip); save(); return delay(trip);
    },
    async insertEvent(e) {
      if (!db.events.some((x) => x.id === e.id)) db.events.push({ id: e.id, trip_id: e.tripId, event: e.type, at: e.at });
      save(); return delay(null);
    },
    async deleteEvent(id) { db.events = db.events.filter((e) => e.id !== id); save(); return delay(null); },
    async updateTrip(id, patch) { Object.assign(db.trips.find((t) => t.id === id) || {}, patch); save(); return delay(null); },
  };
}

export function getApi() {
  if (isConfigured()) return supabaseApi();
  const wantsDemo = new URLSearchParams(location.search).has('demo');
  try { if (wantsDemo) sessionStorage.setItem('vp.demo', '1'); } catch { /* ignore */ }
  let demo = wantsDemo;
  try { demo = demo || sessionStorage.getItem('vp.demo') === '1'; } catch { /* ignore */ }
  return demo ? demoApi() : null;
}
