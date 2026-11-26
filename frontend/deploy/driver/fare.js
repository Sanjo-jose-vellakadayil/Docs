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

   Daily minimum and maximum (Sanjo, ON-24, 16 Nov 2026). The old rules
   above still apply; these are applied to each trip day separately:
   - A trip day ends at whichever comes first: 15 hours of running time
     in that day, or 24 hours after the day started. The next day starts
     at that moment (open question to Sanjo on ON-24, 20 Nov).
   - Minimum per day: trip time 7h to under 14h → ₹999; 14h or more → ₹1999.
     Under 7h (e.g. a short last day) → no daily minimum.
   - Maximum per day: running under 4h and waiting over 10h → ₹1999;
     otherwise ₹2999.
   - These amounts exclude the 10% platform charge, which is added on top.
   - Platform cap: ₹300 × (calendar days or trip days, whichever is more).
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
  // Trip day (ON-24)
  dayLengthMinutes: 24 * 60,
  dayRunningLimitMinutes: 15 * 60,
  // Daily minimum (ON-24)
  dayMinShortFromMinutes: 7 * 60,
  dayMinShort: 999,
  dayMinLongFromMinutes: 14 * 60,
  dayMinLong: 1999,
  // Daily maximum (ON-24)
  dayMax: 2999,
  dayMaxLowRunning: 1999,
  dayMaxLowRunningUnderMinutes: 4 * 60,
  dayMaxLowRunningWaitingOverMinutes: 10 * 60,
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

/** Running and waiting intervals of a completed trip, in time order. */
function intervals(sorted) {
  const out = [];
  let state = STATES.NOT_STARTED;
  let stopNo = -1;
  for (let i = 0; i < sorted.length; i++) {
    state = TRANSITIONS[state][sorted[i].type];
    if (WAITING_STATES.has(state)) stopNo++;
    const next = sorted[i + 1];
    if (!next) break;
    const a = toMs(sorted[i].at);
    const b = toMs(next.at);
    if (b <= a) continue;
    if (RUNNING_STATES.has(state)) out.push({ running: true, stopNo: null, start: a, end: b });
    else if (WAITING_STATES.has(state)) out.push({ running: false, stopNo, start: a, end: b });
  }
  return out;
}

/**
 * Splits a completed trip into trip days (ON-24): a day ends after 15h of
 * running time in that day or 24h after it started, whichever comes first.
 * Each waiting piece keeps its offset inside its stop, so the ₹99 → ₹49
 * tier still counts from when the halt started.
 */
export function tripDays(events, settings = {}) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const sorted = sortEvents(events);
  const seg = segments(sorted);
  if (seg.state !== STATES.COMPLETED) throw new Error('The trip is not completed yet');
  const tripStart = toMs(sorted[0].at);
  const tripEnd = toMs(sorted[sorted.length - 1].at);
  const dayMs = s.dayLengthMinutes * 60000;
  const runCapMs = s.dayRunningLimitMinutes * 60000;

  const newDay = (t) => ({ startMs: t, endMs: t, runningMs: 0, waitingMs: 0, waitPieces: [] });
  const days = [];
  let day = newDay(tripStart);
  for (const iv of intervals(sorted)) {
    const stopStart = iv.running ? 0 : seg.stops[iv.stopNo].startedAt.getTime();
    let cur = iv.start;
    while (cur < iv.end) {
      const byTime = day.startMs + dayMs;
      let limit = Math.min(iv.end, byTime);
      if (iv.running) limit = Math.min(limit, cur + (runCapMs - day.runningMs));
      const dur = limit - cur;
      if (iv.running) day.runningMs += dur;
      else {
        day.waitingMs += dur;
        day.waitPieces.push({ stopNo: iv.stopNo, fromMs: cur - stopStart, toMs: limit - stopStart });
      }
      day.endMs = limit;
      cur = limit;
      const full = limit >= byTime || day.runningMs >= runCapMs;
      if (full && limit < tripEnd) { days.push(day); day = newDay(limit); }
    }
  }
  day.endMs = tripEnd;
  days.push(day);
  return days;
}

/** Exact (unrounded) waiting charge for part of a stop, from its offset inside the stop. */
function pieceCharge(fromMs, toMs_, s) {
  const tierMs = s.waitingTierMinutes * 60000;
  const t1 = Math.max(0, Math.min(toMs_, tierMs) - fromMs);
  const t2 = (toMs_ - fromMs) - t1;
  return (t1 / 3600000) * s.waitingRatePerHour + (t2 / 3600000) * s.waitingRateAfterTierPerHour;
}

/** Daily minimum and maximum for one trip day (ON-24). */
export function dayLimits(totalMinutes, runningMinutes, waitingMinutes, settings = {}) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const min = totalMinutes >= s.dayMinLongFromMinutes ? s.dayMinLong
    : totalMinutes >= s.dayMinShortFromMinutes ? s.dayMinShort : 0;
  const lowRunning = runningMinutes < s.dayMaxLowRunningUnderMinutes && waitingMinutes > s.dayMaxLowRunningWaitingOverMinutes;
  return { min, max: lowRunning ? s.dayMaxLowRunning : s.dayMax, lowRunning };
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

  // Stops that round to 0 minutes cost nothing; leave them off the receipt.
  const charged = seg.stops
    .map((st) => ({ ...st, ...stopCharge(toMinutes(st.ms), s) }))
    .filter((st) => st.minutes > 0);
  const haltCount = charged.filter((st) => st.kind !== 'destination').length;
  let haltNo = 0;
  const stops = charged.map((st) => ({
    ...st,
    label: st.kind === 'destination' ? 'Wait at destination' : haltCount === 1 ? 'Halt' : `Halt ${++haltNo}`,
  }));
  const waitingMinutes = stops.reduce((a, x) => a + x.minutes, 0);
  const waitingCharge = stops.reduce((a, x) => a + x.charge, 0);

  const base = runningCharge + waitingCharge;

  // Daily minimum / maximum (ON-24), per trip day.
  const rawDays = tripDays(sorted, s);
  const dayList = rawDays.map((d, i) => {
    const exact = (d.runningMs / 3600000) * s.runningRatePerHour
      + d.waitPieces.reduce((a, p) => a + pieceCharge(p.fromMs, p.toMs, s), 0);
    return {
      day: i + 1,
      startAt: new Date(d.startMs),
      endAt: new Date(d.endMs),
      totalMinutes: toMinutes(d.endMs - d.startMs),
      runningMinutes: toMinutes(d.runningMs),
      waitingMinutes: toMinutes(d.waitingMs),
      exact,
    };
  });
  // Round each day so the days add up to the running + waiting lines shown.
  let used = 0;
  dayList.forEach((d, i) => {
    d.charge = i === dayList.length - 1 ? base - used : roundRupees(d.exact);
    used += d.charge;
    delete d.exact;
    const lim = dayLimits(d.totalMinutes, d.runningMinutes, d.waitingMinutes, s);
    d.minimum = lim.min;
    d.maximum = lim.max;
    const target = Math.min(Math.max(d.charge, lim.min), lim.max);
    d.adjustment = target - d.charge;
    d.kind = d.adjustment > 0 ? 'minimum' : d.adjustment < 0 ? 'maximum' : null;
    d.final = target;
  });
  const dayAdjustments = dayList.filter((d) => d.adjustment !== 0).map((d) => ({
    ...d,
    label: dayList.length === 1
      ? (d.kind === 'minimum' ? 'Daily minimum' : 'Daily maximum')
      : `Day ${d.day} ${d.kind === 'minimum' ? 'minimum' : 'maximum'}`,
  }));
  const dailyAdjustment = dayAdjustments.reduce((a, d) => a + d.adjustment, 0);

  const subtotal = base + dailyAdjustment;
  const days = Math.max(calendarDays(startAt, endAt, s.timeZone), dayList.length);
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
    tripDays: dayList,
    dayAdjustments,
    dailyAdjustment,
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

/** "₹150" for a top-up, "−₹120" for a reduction. */
export const formatSignedRupees = (n) => (n < 0 ? `−${formatRupees(-n)}` : formatRupees(n));

/** Text under a daily minimum/maximum line on the fare screen and image. */
export function dayAdjustmentNote(d) {
  return d.kind === 'minimum'
    ? `${formatDuration(d.totalMinutes)} trip day: at least ${formatRupees(d.minimum)}`
    : `Day capped at ${formatRupees(d.maximum)}`;
}

/** Trip ID format agreed on ON-22: VP-YYYYMMDD-NNN (the number is assigned by the database). */
export const TRIP_ID_PATTERN = /^VP-\d{8}-\d{3,}$/;
