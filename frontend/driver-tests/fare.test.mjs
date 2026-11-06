// Run with:  node --test frontend/driver-tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EVENTS as E, STATES, replay, nextActions, segments, calculateFare,
  stopCharge, calendarDays, formatDuration, TRIP_ID_PATTERN,
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

  // a two-day trip with a long running time: 10% would be ₹664, cap is 2 × 300
  const twoDay = calculateFare(ev([E.START, 0], [E.REACHED, 1000], [E.RETURNING, 1000], [E.COMPLETED, 2000]));
  assert.equal(twoDay.days, 2);
  assert.equal(twoDay.platformCap, 600);
  assert.equal(twoDay.platformCharge, 600);
  assert.equal(twoDay.platformCapped, true);
  assert.equal(twoDay.total, twoDay.subtotal + 600);
});

test('cap per day on a single long day', () => {
  // 07:00 to 23:00 IST, 16h running: subtotal ₹3,184, 10% = ₹318 → capped at ₹300
  const f = calculateFare(ev([E.START, -180], [E.REACHED, 300], [E.RETURNING, 300], [E.COMPLETED, 780]));
  assert.equal(f.subtotal, 3184);
  assert.equal(f.days, 1);
  assert.equal(f.platformCharge, 300);
  assert.equal(f.platformCapped, true);
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
