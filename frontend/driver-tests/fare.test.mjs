// Run with:  node --test frontend/driver-tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EVENTS as E, STATES, replay, nextActions, segments, calculateFare,
  stopCharge, calendarDays, formatDuration, TRIP_ID_PATTERN, tripDays, dayLimits,
  formatSignedRupees,
} from '../deploy/driver/fare.js';

// Build events from minute offsets after a fixed IST start (10:00 IST = 04:30Z).
const T0 = Date.parse('2026-11-05T04:30:00Z');
const at = (min) => new Date(T0 + min * 60000).toISOString();
const ev = (...pairs) => pairs.map(([type, min]) => ({ type, at: at(min) }));

test('status flow allows only the agreed order', () => {
  assert.deepEqual(nextActions([]), [E.START]);
  assert.deepEqual(nextActions(ev([E.START, 0])), [E.REACHED, E.HALT]);
  assert.deepEqual(nextActions(ev([E.START, 0], [E.HALT, 5])), [E.CONTINUE]);
  assert.deepEqual(nextActions(ev([E.START, 0], [E.REACHED, 30])), [E.RETURNING]);
  assert.deepEqual(nextActions(ev([E.START, 0], [E.REACHED, 30], [E.RETURNING, 60])), [E.COMPLETED, E.HALT]);
  assert.equal(replay(ev([E.START, 0], [E.REACHED, 30], [E.RETURNING, 60], [E.COMPLETED, 90])), STATES.COMPLETED);
  assert.throws(() => replay(ev([E.START, 0], [E.COMPLETED, 10])), /not allowed/);
  assert.throws(() => replay(ev([E.HALT, 0])), /not allowed/);
  assert.throws(() => replay(ev([E.START, 0], [E.HALT, 5], [E.REACHED, 10])), /not allowed/);
});

test('undo is just dropping the last event', () => {
  const full = ev([E.START, 0], [E.HALT, 5], [E.CONTINUE, 10]);
  assert.deepEqual(nextActions(full.slice(0, -1)), [E.CONTINUE]);
});

test('ON-24 worked example: stops of 3h and 1h cost ₹247 + ₹99', () => {
  assert.equal(stopCharge(180).charge, 247); // 2×99 + 1×49
  assert.equal(stopCharge(60).charge, 99);
});

test('waiting tier is applied per stop, not across stops', () => {
  // two 90-minute stops: both entirely in the ₹99 tier (₹148.5 → ₹149 each)
  assert.equal(stopCharge(90).charge, 149);
  assert.equal(stopCharge(90).tier2Minutes, 0);
  assert.equal(stopCharge(150).tier2Minutes, 30);
});

test('running and waiting split, including the destination wait', () => {
  const events = ev(
    [E.START, 0],
    [E.HALT, 30], [E.CONTINUE, 45],        // 15 min halt
    [E.REACHED, 90],                        // 75 min running so far
    [E.RETURNING, 270],                     // 180 min wait at destination
    [E.HALT, 300], [E.CONTINUE, 310],       // 10 min halt
    [E.COMPLETED, 360],
  );
  const f = calculateFare(events);
  assert.equal(f.runningMinutes, 30 + 45 + 30 + 50); // 155
  assert.equal(f.runningCharge, Math.round((155 * 199) / 60)); // 514
  assert.deepEqual(f.stops.map((s) => [s.label, s.minutes]), [['Halt 1', 15], ['Wait at destination', 180], ['Halt 2', 10]]);
  assert.equal(f.waitingCharge, Math.round(15 * 99 / 60) + 247 + Math.round(10 * 99 / 60)); // 25 + 247 + 17
  assert.equal(f.subtotal, f.runningCharge + f.waitingCharge);
  assert.equal(f.platformCharge, Math.round(f.subtotal * 0.1));
  assert.equal(f.total, f.subtotal + f.platformCharge);
  assert.equal(f.minimumAdjustment, 0);
  assert.equal(f.totalMinutes, 360);
});

test('charged by the minute: 1h 20m running = 80 × 199/60', () => {
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 40], [E.RETURNING, 40], [E.COMPLETED, 80]));
  assert.equal(f.runningMinutes, 80);
  assert.equal(f.runningCharge, 265);
});

test('₹300 minimum applies to the whole fare, platform charge included', () => {
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 20], [E.RETURNING, 25], [E.COMPLETED, 45]));
  // 40 min running = ₹133, 5 min wait = ₹8, subtotal 141, platform 14 → 155 → topped up to 300
  assert.equal(f.subtotal, 141);
  assert.equal(f.platformCharge, 14);
  assert.equal(f.minimumAdjustment, 145);
  assert.equal(f.total, 300);
});

test('platform charge capped at ₹300 per day of the trip', () => {
  // 10h running inside one day: subtotal ₹1,990, 10% = ₹199, under the cap
  const oneDay = calculateFare(ev([E.START, 0], [E.REACHED, 300], [E.RETURNING, 300], [E.COMPLETED, 600]));
  assert.equal(oneDay.days, 1);
  assert.equal(oneDay.platformCapped, false);

  // 2000 min of running over 2 calendar days = 3 trip days (15h running each):
  // 10% is ₹663, cap is 3 × 300 (ON-24: whichever day count is more)
  const long = calculateFare(ev([E.START, 0], [E.REACHED, 1000], [E.RETURNING, 1000], [E.COMPLETED, 2000]));
  assert.equal(long.tripDays.length, 3);
  assert.equal(long.days, 3);
  assert.equal(long.platformCap, 900);
  assert.equal(long.platformCharge, 663);
  assert.equal(long.platformCapped, false);

  // same trip with a ₹200 daily cap: 10% is ₹663 → capped at 3 trip days × ₹200 = ₹600
  const lowCap = calculateFare(ev([E.START, 0], [E.REACHED, 1000], [E.RETURNING, 1000], [E.COMPLETED, 2000]), { platformCapPerDay: 200 });
  assert.equal(lowCap.platformCap, 600);
  assert.equal(lowCap.platformCharge, 600);
  assert.equal(lowCap.platformCapped, true);
  assert.equal(lowCap.total, lowCap.subtotal + 600);
});

test('16h of running in one calendar day is 2 trip days (15h running limit)', () => {
  // 07:00 to 23:00 IST: day 1 = 15h running (₹2,985), day 2 = 1h (₹199)
  const f = calculateFare(ev([E.START, -180], [E.REACHED, 300], [E.RETURNING, 300], [E.COMPLETED, 780]));
  assert.deepEqual(f.tripDays.map((d) => [d.runningMinutes, d.charge]), [[900, 2985], [60, 199]]);
  assert.equal(f.subtotal, 3184);
  assert.equal(f.days, 2);
  assert.equal(f.platformCharge, 318);
  assert.equal(f.platformCapped, false);
});

test('ON-24 daily minimum: 7h to under 14h of trip time → at least ₹999', () => {
  // 1h run, 6h at destination, 1h run = 8h: ₹398 + ₹394 = ₹792 → ₹999
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 60], [E.RETURNING, 420], [E.COMPLETED, 480]));
  assert.equal(f.runningCharge + f.waitingCharge, 792);
  assert.equal(f.dayAdjustments.length, 1);
  assert.equal(f.dayAdjustments[0].label, 'Daily minimum');
  assert.equal(f.dailyAdjustment, 207);
  assert.equal(f.subtotal, 999);
  assert.equal(f.platformCharge, 100);
  assert.equal(f.total, 1099);
});

test('ON-24 daily minimum: under 7h → no daily minimum (old ₹300 rule only)', () => {
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 60], [E.RETURNING, 360], [E.COMPLETED, 410])); // 6h 50m
  assert.equal(f.dailyAdjustment, 0);
  assert.equal(f.subtotal, f.runningCharge + f.waitingCharge);
});

test('ON-24 daily minimum: 14h or more → at least ₹1999', () => {
  // 2h run, 13h wait = 15h: ₹398 + ₹737 = ₹1,135 → ₹1,999
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 60], [E.RETURNING, 840], [E.COMPLETED, 900]));
  assert.equal(f.runningCharge + f.waitingCharge, 1135);
  assert.equal(f.subtotal, 1999);
  assert.equal(f.total, 1999 + 200);
});

test('ON-24 daily maximum: ₹2999 for an ordinary long day', () => {
  // 15h run + 2h wait in one trip day: ₹2,985 + ₹198 = ₹3,183 → ₹2,999
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 450], [E.RETURNING, 570], [E.COMPLETED, 1020]));
  assert.equal(f.tripDays.length, 1);
  assert.equal(f.runningCharge + f.waitingCharge, 3183);
  assert.equal(f.dayAdjustments[0].label, 'Daily maximum');
  assert.equal(f.dailyAdjustment, -184);
  assert.equal(f.subtotal, 2999);
  assert.equal(f.platformCharge, 300);
  assert.equal(f.total, 3299);
});

test('ON-24 daily maximum: running under 4h and waiting over 10h → ₹1999', () => {
  // ten cycles of 20 min driving + 2h halt, then 20 min more: 220 min running, 20h waiting
  const list = [[E.START, 0]];
  let t = 0;
  for (let i = 0; i < 10; i++) { t += 20; list.push([E.HALT, t]); t += 120; list.push([E.CONTINUE, t]); }
  t += 0; list.push([E.REACHED, t]); list.push([E.RETURNING, t]); t += 20; list.push([E.COMPLETED, t]);
  const f = calculateFare(ev(...list));
  assert.equal(f.tripDays.length, 1);
  assert.equal(f.runningMinutes, 220);
  assert.equal(f.waitingMinutes, 1200);
  assert.equal(f.runningCharge + f.waitingCharge, 730 + 1980);
  assert.equal(f.subtotal, 1999);
});

test('ON-24 multi-day: the limits apply to each trip day; a long halt is split across days', () => {
  // 1h run, 30h at destination, 1h run = 32h → day 1 = first 24h, day 2 = last 8h
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 60], [E.RETURNING, 1860], [E.COMPLETED, 1920]));
  assert.equal(f.runningCharge + f.waitingCharge, 398 + 1570);
  assert.deepEqual(f.tripDays.map((d) => [d.totalMinutes, d.runningMinutes, d.waitingMinutes, d.charge]),
    [[1440, 60, 1380, 1426], [480, 60, 420, 542]]);
  // day 1: 24h, running 1h, waiting 23h → min ₹1999 and max ₹1999; day 2: 8h → min ₹999
  assert.deepEqual(f.dayAdjustments.map((d) => [d.label, d.adjustment]), [['Day 1 minimum', 573], ['Day 2 minimum', 457]]);
  assert.equal(f.subtotal, 1999 + 999);
  assert.equal(f.platformCharge, 300);
  assert.equal(f.total, 3298);
});

test('ON-24 short last day is charged by the minute only', () => {
  // 25h at destination: day 2 is the last 1h 10m → no daily minimum on day 2
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 10], [E.RETURNING, 1510], [E.COMPLETED, 1510]));
  assert.equal(f.tripDays.length, 2);
  assert.equal(f.tripDays[1].totalMinutes, 70);
  assert.ok(f.dayAdjustments.every((d) => d.day === 1));
});

test('trip days: 15h of running ends the day before 24h', () => {
  const d = tripDays(ev([E.START, 0], [E.HALT, 600], [E.CONTINUE, 720], [E.REACHED, 1020], [E.RETURNING, 1020], [E.COMPLETED, 1200]));
  // running 600 + 300 = 900 min at minute 1020 → day 2 starts then
  assert.equal(d.length, 2);
  assert.equal((d[1].startMs - d[0].startMs) / 60000, 1020);
});

test('day limits table', () => {
  assert.deepEqual(dayLimits(419, 300, 100), { min: 0, max: 2999, lowRunning: false });
  assert.deepEqual(dayLimits(420, 300, 100), { min: 999, max: 2999, lowRunning: false });
  assert.deepEqual(dayLimits(840, 300, 540), { min: 1999, max: 2999, lowRunning: false });
  assert.deepEqual(dayLimits(900, 239, 601), { min: 1999, max: 1999, lowRunning: true });
  assert.deepEqual(dayLimits(900, 240, 660), { min: 1999, max: 2999, lowRunning: false });
  assert.equal(formatSignedRupees(-184), '−₹184');
  assert.equal(formatSignedRupees(207), '₹207');
});

test('calendar days use India time, not UTC', () => {
  // 23:00 IST to 01:00 IST next day = 2 days, although it is the same UTC day
  assert.equal(calendarDays('2026-11-05T17:30:00Z', '2026-11-05T19:30:00Z'), 2);
  assert.equal(calendarDays('2026-11-05T04:30:00Z', '2026-11-05T12:30:00Z'), 1);
});

test('fare cannot be calculated before Completed', () => {
  assert.throws(() => calculateFare(ev([E.START, 0], [E.REACHED, 10])), /not completed/);
});

test('live timers count the open segment up to now', () => {
  const s = segments(ev([E.START, 0], [E.HALT, 20]), T0 + 35 * 60000);
  assert.equal(s.runningMs, 20 * 60000);
  assert.equal(s.waitingMs, 15 * 60000);
  assert.equal(s.openStop.kind, 'halt_outbound');
});

test('settings from the database override the defaults', () => {
  const f = calculateFare(ev([E.START, 0], [E.REACHED, 30], [E.RETURNING, 30], [E.COMPLETED, 60]), { runningRatePerHour: 240, minimumFare: 0 });
  assert.equal(f.runningCharge, 240);
});

test('trip IDs and durations', () => {
  assert.ok(TRIP_ID_PATTERN.test('VP-20261105-001'));
  assert.ok(!TRIP_ID_PATTERN.test('VP-2026115-1'));
  assert.equal(formatDuration(155), '2h 35m');
  assert.equal(formatDuration(9), '9m');
});

test('halts under 30 seconds are left off the receipt; a single halt has no number', () => {
  const base = Date.parse('2026-11-07T04:30:00Z');
  const t = (sec) => new Date(base + sec * 1000).toISOString();
  const f = calculateFare([
    { type: E.START, at: t(0) },
    { type: E.HALT, at: t(60) }, { type: E.CONTINUE, at: t(70) },      // 10 s → 0 min, hidden
    { type: E.HALT, at: t(120) }, { type: E.CONTINUE, at: t(1020) },   // 15 min
    { type: E.REACHED, at: t(1200) }, { type: E.RETURNING, at: t(1210) }, // 10 s at destination, hidden
    { type: E.HALT, at: t(1300) }, { type: E.CONTINUE, at: t(1305) },  // 5 s, hidden
    { type: E.COMPLETED, at: t(2400) },
  ]);
  assert.deepEqual(f.stops.map((s) => [s.label, s.minutes]), [['Halt', 15]]);
  assert.equal(f.waitingCharge, 25);
});
