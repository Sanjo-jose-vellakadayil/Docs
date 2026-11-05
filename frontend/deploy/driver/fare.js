/* ============================================================
   VandiPilot — trip status flow and fare calculation (Jira ON-22 / ON-24)

   Pure functions, no DOM and no network, so the same file runs in the
   browser and in the Node tests (frontend/driver-tests/fare.test.mjs).
   Business rules live here, not in the database, so they move unchanged
   when storage moves from Supabase to AWS (ON-25).

   Rules (ON-24 description + Sanjo's answers on ON-22, 4 Nov 2026):
   - Running: ₹199/hr, charged by the minute.
   - Waiting: per stop, ₹99/hr for the first 2 hours, then ₹49/hr,
     charged by the minute. The wait between "Reached destination" and
     "Returning" is one stop under the same rule.
   - Platform charge: 10% of (running + waiting), capped at ₹300 per
     calendar day of the trip (ON-4 pricing rule).
   - Minimum: the whole fare (including the platform charge) is at
     least ₹300.
   ============================================================ */

export const DEFAULT_SETTINGS = Object.freeze({
  runningRatePerHour: 199,
  waitingRatePerHour: 99,
  waitingTierMinutes: 120,
  waitingRateAfterTierPerHour: 49,
  platformPercent: 10,
  platformCapPerDay: 300,
  minimumFare: 300,
  timeZone: 'Asia/Kolkata',
});

/* ---------- Status flow ----------
   Start → (Halt ⇄ Continue)* → Reached destination → Returning
         → (Halt ⇄ Continue)* → Completed                            */

export const EVENTS = Object.freeze({
  START: 'start',
  HALT: 'halt',
  CONTINUE: 'continue',
  REACHED: 'reached_destination',
  RETURNING: 'returning',
  COMPLETED: 'completed',
});

export const STATES = Object.freeze({
  NOT_STARTED: 'not_started',
  OUTBOUND: 'outbound',
  OUTBOUND_HALTED: 'outbound_halted',
  AT_DESTINATION: 'at_destination',
  RETURN: 'return',
  RETURN_HALTED: 'return_halted',
  COMPLETED: 'completed',
});

const TRANSITIONS = {
  [STATES.NOT_STARTED]: { [EVENTS.START]: STATES.OUTBOUND },
  [STATES.OUTBOUND]: { [EVENTS.HALT]: STATES.OUTBOUND_HALTED, [EVENTS.REACHED]: STATES.AT_DESTINATION },
  [STATES.OUTBOUND_HALTED]: { [EVENTS.CONTINUE]: STATES.OUTBOUND },
  [STATES.AT_DESTINATION]: { [EVENTS.RETURNING]: STATES.RETURN },
  [STATES.RETURN]: { [EVENTS.HALT]: STATES.RETURN_HALTED, [EVENTS.COMPLETED]: STATES.COMPLETED },
  [STATES.RETURN_HALTED]: { [EVENTS.CONTINUE]: STATES.RETURN },
  [STATES.COMPLETED]: {},
};

const WAITING_STATES = new Set([STATES.OUTBOUND_HALTED, STATES.AT_DESTINATION, STATES.RETURN_HALTED]);
const RUNNING_STATES = new Set([STATES.OUTBOUND, STATES.RETURN]);

export const EVENT_LABELS = Object.freeze({
  [EVENTS.START]: 'Trip started',
  [EVENTS.HALT]: 'Halt',
  [EVENTS.CONTINUE]: 'Continue',
  [EVENTS.REACHED]: 'Reached destination',
  [EVENTS.RETURNING]: 'Returning',
  [EVENTS.COMPLETED]: 'Completed',
});

export const STATE_LABELS = Object.freeze({
  [STATES.NOT_STARTED]: 'Not started',
  [STATES.OUTBOUND]: 'Running · to destination',
  [STATES.OUTBOUND_HALTED]: 'Halted · waiting',
  [STATES.AT_DESTINATION]: 'At destination · waiting',
  [STATES.RETURN]: 'Running · return trip',
  [STATES.RETURN_HALTED]: 'Halted · waiting',
  [STATES.COMPLETED]: 'Completed',
});

const toMs = (t) => (t instanceof Date ? t.getTime() : new Date(t).getTime());

function sortEvents(events) {
  return [...events].sort((a, b) => toMs(a.at) - toMs(b.at));
}

/** Replays the events and returns the current state. Throws on an invalid sequence. */
export function replay(events) {
  let state = STATES.NOT_STARTED;
  let prevMs = -Infinity;
  for (const e of sortEvents(events)) {
    const next = TRANSITIONS[state][e.type];
    if (!next) throw new Error(`"${e.type}" is not allowed when the trip is ${state}`);
    const ms = toMs(e.at);
    if (!Number.isFinite(ms)) throw new Error(`Event "${e.type}" has an invalid time`);
    if (ms < prevMs) throw new Error('Events are out of order');
    prevMs = ms;
    state = next;
  }
  return state;
}

/** The buttons the driver can press next, in display order (primary action first). */
export function nextActions(events) {
  const state = replay(events);
  const order = [EVENTS.START, EVENTS.CONTINUE, EVENTS.REACHED, EVENTS.RETURNING, EVENTS.COMPLETED, EVENTS.HALT];
  return order.filter((ev) => TRANSITIONS[state][ev]);
}

export const isWaitingState = (s) => WAITING_STATES.has(s);
export const isRunningState = (s) => RUNNING_STATES.has(s);

/**
 * Splits the trip into running time and waiting stops.
 * `now` is used for the live timers while the trip is still in progress.
 */
export function segments(events, now = Date.now()) {
  const sorted = sortEvents(events);
  replay(sorted); // validates
  let state = STATES.NOT_STARTED;
  let since = null;
  let runningMs = 0;
  const stops = [];

  const close = (endMs) => {
    if (since === null) return;
    const dur = Math.max(0, endMs - since);
    if (RUNNING_STATES.has(state)) runningMs += dur;
    else if (WAITING_STATES.has(state)) {
      stops.push({
        kind: state === STATES.AT_DESTINATION ? 'destination' : state === STATES.OUTBOUND_HALTED ? 'halt_outbound' : 'halt_return',
        startedAt: new Date(since),
        endedAt: new Date(endMs),
        ms: dur,
      });
    }
  };

  for (const e of sorted) {
    const ms = toMs(e.at);
    close(ms);
    state = TRANSITIONS[state][e.type];
    since = state === STATES.COMPLETED ? null : ms;
  }

  let openStop = null;
  if (since !== null) {
    const nowMs = toMs(now);
    const dur = Math.max(0, nowMs - since);
    if (RUNNING_STATES.has(state)) runningMs += dur;
    else if (WAITING_STATES.has(state)) {
      openStop = { kind: state === STATES.AT_DESTINATION ? 'destination' : state === STATES.OUTBOUND_HALTED ? 'halt_outbound' : 'halt_return', startedAt: new Date(since), endedAt: null, ms: dur };
    }
  }

  const waitingMs = stops.reduce((s, x) => s + x.ms, 0) + (openStop ? openStop.ms : 0);
  return { state, runningMs, waitingMs, stops, openStop };
}

/** Whole minutes, rounded to the nearest minute ("charged by the minute"). */
export const toMinutes = (ms) => Math.round(ms / 60000);

const roundRupees = (x) => Math.round(x + 1e-9);

/** Number of calendar days (in the business time zone) the trip touches. */
export function calendarDays(startAt, endAt, timeZone = DEFAULT_SETTINGS.timeZone) {
  const key = (d) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
  const a = new Date(`${key(startAt)}T00:00:00Z`).getTime();
  const b = new Date(`${key(endAt)}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

/** Waiting charge for one stop: first tier at the full rate, the rest at the lower rate. */
export function stopCharge(minutes, s = DEFAULT_SETTINGS) {
  const tier1 = Math.min(minutes, s.waitingTierMinutes);
  const tier2 = Math.max(0, minutes - s.waitingTierMinutes);
  const tier1Charge = roundRupees((tier1 * s.waitingRatePerHour) / 60);
  const tier2Charge = roundRupees((tier2 * s.waitingRateAfterTierPerHour) / 60);
  return { minutes, tier1Minutes: tier1, tier2Minutes: tier2, tier1Charge, tier2Charge, charge: tier1Charge + tier2Charge };
}

/**
 * Full fare for a completed trip. Every line is rounded to whole rupees,
 * and the total is the sum of the shown lines, so the receipt always adds up.
 */
export function calculateFare(events, settings = {}) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const sorted = sortEvents(events);
  const seg = segments(sorted);
  if (seg.state !== STATES.COMPLETED) throw new Error('The trip is not completed yet');

  const startAt = new Date(toMs(sorted[0].at));
  const endAt = new Date(toMs(sorted[sorted.length - 1].at));

  const runningMinutes = toMinutes(seg.runningMs);
  const runningCharge = roundRupees((runningMinutes * s.runningRatePerHour) / 60);

  let haltNo = 0;
  const stops = seg.stops.map((st) => {
    const label = st.kind === 'destination' ? 'Wait at destination' : `Halt ${++haltNo}`;
    return { ...st, label, ...stopCharge(toMinutes(st.ms), s) };
  });
  const waitingMinutes = stops.reduce((a, x) => a + x.minutes, 0);
  const waitingCharge = stops.reduce((a, x) => a + x.charge, 0);

  const subtotal = runningCharge + waitingCharge;
  const days = calendarDays(startAt, endAt, s.timeZone);
  const platformCap = s.platformCapPerDay * days;
  const platformUncapped = roundRupees((subtotal * s.platformPercent) / 100);
  const platformCharge = Math.min(platformUncapped, platformCap);
  const beforeMinimum = subtotal + platformCharge;
  const minimumAdjustment = Math.max(0, s.minimumFare - beforeMinimum);
  const total = beforeMinimum + minimumAdjustment;

  return {
    startAt,
    endAt,
    totalMinutes: toMinutes(endAt - startAt),
    runningMinutes,
    runningCharge,
    stops,
    waitingMinutes,
    waitingCharge,
    subtotal,
    days,
    platformPercent: s.platformPercent,
    platformCap,
    platformCapped: platformUncapped > platformCap,
    platformCharge,
    minimumFare: s.minimumFare,
    minimumAdjustment,
    total,
    settings: s,
  };
}

/* ---------- Formatting helpers ---------- */

export function formatDuration(minutesOrMs, { fromMs = false } = {}) {
  const m = fromMs ? Math.floor(minutesOrMs / 60000) : minutesOrMs;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`;
}

export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export const formatRupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** +919123456789 → "+91 91234 56789" for display. */
export function formatPhone(p) {
  const m = /^\+91(\d{5})(\d{5})$/.exec(String(p || ''));
  return m ? `+91 ${m[1]} ${m[2]}` : String(p || '');
}

/** Trip ID format agreed on ON-22: VP-YYYYMMDD-NNN (the number is assigned by the database). */
export const TRIP_ID_PATTERN = /^VP-\d{8}-\d{3,}$/;

/** Indian mobile number: 10 digits starting 6–9, optional +91 / 0 prefix. Returns +91XXXXXXXXXX or null. */
export function normalisePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}
