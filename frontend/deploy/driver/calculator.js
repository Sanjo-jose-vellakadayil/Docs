/* VandiPilot — DriverCalculation page (Jira ON-23).
   Trip details → Start → (Halt/Continue)* → Reached destination → Returning
   → (Halt/Continue)* → Completed → Calculate fare → share image.
   Every press asks for confirmation and can be undone (Sanjo, ON-22 Q8).
   Presses are saved on the phone first and uploaded as soon as there is
   signal, so a closed browser or a dead zone does not lose the trip. */
import { getApi, NetworkError } from './api.js';
import {
  EVENTS, STATES, STATE_LABELS, EVENT_LABELS, replay, nextActions, segments, calculateFare,
  isWaitingState, formatClock, formatDuration, formatRupees, formatPhone, normalisePhone,
} from './fare.js';
import { drawReceipt, shareReceipt, canvasToBlob, downloadBlob } from './receipt.js';

const $ = (id) => document.getElementById(id);
const views = ['loadingView', 'setupView', 'startView', 'tripView', 'fareView'];
const showView = (id) => views.forEach((v) => { $(v).hidden = v !== id; });

const fmtTime = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d)).toUpperCase();
const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

/* ---------- Local storage (pending presses + last known state) ---------- */
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
const PENDING = 'vp.driver.pending';        // [{id, tripId, type, at}]
const FINALIZE = 'vp.driver.finalize';      // tripId whose fare still has to be uploaded
const CACHE = 'vp.driver.cache';            // {driver, settings, trip, events}

const S = { api: null, driver: null, settings: null, trip: null, events: [], fare: null, canvas: null, busy: false, timer: null };

/* ---------- Banner ---------- */
function banner(text, kind = 'warn') {
  const b = $('banner');
  if (!text) { b.hidden = true; return; }
  b.textContent = text; b.className = `banner banner--${kind}`; b.hidden = false;
}

/* ---------- Confirm dialog ---------- */
function confirmAsk(title, body, okLabel = 'Confirm') {
  const dlg = $('confirmDlg');
  $('confirmTitle').textContent = title;
  $('confirmBody').textContent = body;
  $('confirmOk').textContent = okLabel;
  return new Promise((resolve) => {
    const done = () => { dlg.removeEventListener('close', done); resolve(dlg.returnValue === 'ok'); };
    dlg.returnValue = '';
    dlg.addEventListener('close', done);
    if (dlg.showModal) dlg.showModal(); else resolve(window.confirm(`${title}\n\n${body}`));
  });
}

/* ---------- Status buttons ---------- */
const ACTION_UI = {
  [EVENTS.HALT]: { label: 'Halt (start waiting)', cls: 'btn--wait', title: 'Mark “Halt”?', body: 'Waiting time starts now. Press Continue when you drive on.' },
  [EVENTS.CONTINUE]: { label: 'Continue', cls: 'btn--primary', title: 'Mark “Continue”?', body: 'Waiting time stops and running time starts again now.' },
  [EVENTS.REACHED]: { label: 'Reached destination', cls: 'btn--primary', title: 'Mark “Reached destination”?', body: 'Running time stops. Time until you press Returning counts as waiting time.' },
  [EVENTS.RETURNING]: { label: 'Returning', cls: 'btn--primary', title: 'Mark “Returning”?', body: 'Waiting at the destination ends and running time starts again now.' },
  [EVENTS.COMPLETED]: { label: 'Trip completed', cls: 'btn--primary', title: 'Mark the trip “Completed”?', body: 'The trip ends now. You can then calculate and share the fare.' },
};

/* ============================================================
   Start-up
   ============================================================ */
async function init() {
  try { S.api = getApi(); } catch { banner('Could not load. Check your connection and refresh the page.', 'error'); return; }
  if (!S.api) { showView('setupView'); return; }
  $('demoNote').hidden = S.api.mode !== 'demo';

  let session = null;
  try { session = await S.api.getSession(); } catch { /* offline: fall back to cache below */ }
  const cache = store.get(CACHE, null);

  if (!session && navigator.onLine) { location.replace('/login/'); return; }

  try {
    S.driver = await S.api.getDriver();
    if (!S.driver) { await S.api.signOut(); location.replace('/login/?reason=not-approved'); return; }
    if (S.driver.status !== 'Active') { await S.api.signOut(); location.replace('/login/?reason=inactive'); return; }
    S.settings = await S.api.getSettings();
    const open = await S.api.getOpenTrip();
    saveCache({ driver: S.driver, settings: S.settings });
    showWho();
    if (open) await openTrip(open); else await showStart();
  } catch (e) {
    if (e instanceof NetworkError && cache && cache.driver) {
      S.driver = cache.driver; S.settings = cache.settings;
      showWho();
      banner('No connection. Showing the trip saved on this phone; new steps will upload when signal returns.');
      if (cache.trip && cache.trip.status === 'in_progress') { S.trip = cache.trip; S.events = mergePending(cache.trip.id, cache.events || []); renderTrip(); }
      else await showStart();
    } else if (e instanceof NetworkError) {
      showView('loadingView');
      banner('No internet connection. Connect and refresh the page.', 'error');
    } else {
      banner(`Something went wrong: ${e.message}`, 'error');
    }
  }
  flush();
}

function saveCache(patch) { store.set(CACHE, { ...store.get(CACHE, {}), ...patch }); }

function showWho() {
  $('who').hidden = false;
  $('whoName').textContent = S.driver.name;
  $('whoAvatar').textContent = S.driver.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ============================================================
   New trip
   ============================================================ */
async function showStart() {
  S.trip = null; S.events = []; S.fare = null;
  saveCache({ trip: null, events: [] });
  stopTicker();
  showView('startView');
  $('startForm').reset();
  $('lastTripCard').hidden = true;
  try {
    const last = await S.api.getLastCompletedTrip();
    if (last) {
      $('lastTripId').textContent = last.id;
      $('lastTripTotal').textContent = last.total_fare != null ? formatRupees(last.total_fare) : '';
      $('lastTripCard').hidden = false;
      $('lastTripBtn').onclick = () => viewCompleted(last);
    }
  } catch { /* not important */ }
}

function validateStart() {
  const form = $('startForm');
  const vals = Object.fromEntries(new FormData(form));
  const checks = {
    customerName: vals.customerName.trim().length >= 2,
    customerPhone: !!normalisePhone(vals.customerPhone),
    pickup: vals.pickup.trim().length >= 2,
    destination: vals.destination.trim().length >= 2,
  };
  let first = null;
  for (const [name, ok] of Object.entries(checks)) {
    const field = form.elements[name].closest('.field');
    field.classList.toggle('is-invalid', !ok);
    form.elements[name].setAttribute('aria-invalid', String(!ok));
    if (!ok && !first) first = form.elements[name];
  }
  if (first) { first.focus(); return null; }
  return { customerName: vals.customerName.trim(), customerPhone: normalisePhone(vals.customerPhone), pickup: vals.pickup.trim(), destination: vals.destination.trim() };
}

async function onStart(ev) {
  ev.preventDefault();
  if (S.busy) return;
  const details = validateStart();
  if (!details) return;
  const ok = await confirmAsk('Start the trip now?', `Running time for ${details.customerName} starts at ${fmtTime(new Date())}.`, 'Start trip');
  if (!ok) return;
  S.busy = true; $('startBtn').disabled = true;
  try {
    const trip = await S.api.createTrip(details);
    S.trip = trip; S.events = [];
    banner(null);
    addEvent(EVENTS.START);
  } catch (e) {
    banner(e instanceof NetworkError
      ? 'No connection. A new trip needs internet once, to get its trip ID. Try again when you have signal.'
      : `Could not start the trip: ${e.message}`, 'error');
  } finally { S.busy = false; $('startBtn').disabled = false; }
}

/* ============================================================
   Trip in progress
   ============================================================ */
async function openTrip(trip) {
  S.trip = trip;
  let serverEvents = [];
  try { serverEvents = await S.api.getEvents(trip.id); } catch (e) { if (!(e instanceof NetworkError)) throw e; serverEvents = (store.get(CACHE, {}).events || []).filter((x) => !x.pending); }
  S.events = mergePending(trip.id, serverEvents.map((e) => ({ id: e.id, type: e.event || e.type, at: e.at })));
  renderTrip();
}

function mergePending(tripId, events) {
  const pend = store.get(PENDING, []).filter((p) => p.tripId === tripId);
  const ids = new Set(events.map((e) => e.id));
  const all = [...events.map((e) => ({ ...e, pending: false })), ...pend.filter((p) => !ids.has(p.id)).map((p) => ({ id: p.id, type: p.type, at: p.at, pending: true }))];
  return all.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

function addEvent(type) {
  const last = S.events.at(-1);
  let at = new Date();
  if (last && Date.parse(last.at) > at.getTime()) at = new Date(Date.parse(last.at)); // never earlier than the last press
  const e = { id: uuid(), tripId: S.trip.id, type, at: at.toISOString() };
  store.set(PENDING, [...store.get(PENDING, []), e]);
  S.events.push({ id: e.id, type, at: e.at, pending: true });
  renderTrip();
  flush();
}

async function onAction(type) {
  if (S.busy) return;
  const ui = ACTION_UI[type];
  const ok = await confirmAsk(ui.title, `${ui.body} Time: ${fmtTime(new Date())}.`, ui.label.replace(/ \(.*\)$/, ''));
  if (!ok) return;
  addEvent(type);
}

async function onUndo() {
  if (S.busy || !S.events.length) return;
  const last = S.events.at(-1);
  const isOnlyStart = S.events.length === 1;
  const ok = await confirmAsk(
    `Undo “${EVENT_LABELS[last.type]}”?`,
    isOnlyStart
      ? `This removes the start (${fmtTime(last.at)}). The trip stays open with no time counted; press Start again when you begin.`
      : `This removes the step marked at ${fmtTime(last.at)}. The trip goes back to “${STATE_LABELS[replay(S.events.slice(0, -1))]}”.`,
    'Undo');
  if (!ok) return;
  S.busy = true;
  try {
    if (last.pending) {
      store.set(PENDING, store.get(PENDING, []).filter((p) => p.id !== last.id));
    } else {
      if (S.trip.status === 'completed') {
        await S.api.updateTrip(S.trip.id, clearedFare());
        S.trip.status = 'in_progress';
      }
      await S.api.deleteEvent(last.id);
    }
    if (last.type === EVENTS.COMPLETED) { store.del(FINALIZE); S.fare = null; }
    S.events.pop();
    banner(null);
    renderTrip();
  } catch (e) {
    banner(e instanceof NetworkError ? 'No connection. Undo needs internet for steps that are already uploaded.' : `Could not undo: ${e.message}`, 'error');
  } finally { S.busy = false; }
}

const clearedFare = () => ({
  status: 'in_progress', completed_at: null, running_minutes: null, waiting_minutes: null, running_charge: null,
  waiting_charge: null, platform_charge: null, minimum_adjustment: null, total_fare: null, fare_breakdown: null,
});

function renderTrip() {
  const t = S.trip;
  showView('tripView');
  $('tripId').textContent = t.id;
  $('tripCustomer').textContent = t.customer_name;
  $('tripPhone').textContent = formatPhone(t.customer_phone);
  $('tripPhone').href = `tel:${t.customer_phone}`;
  $('tripPickup').textContent = t.pickup;
  $('tripDestination').textContent = t.destination;

  const state = replay(S.events);
  $('stateText').textContent = STATE_LABELS[state];
  $('statePill').classList.toggle('is-live', state !== STATES.COMPLETED && state !== STATES.NOT_STARTED);

  // actions
  const box = $('actions');
  box.innerHTML = '';
  if (state === STATES.NOT_STARTED) {
    box.append(button('Start trip', 'btn--primary btn--lg', () => onAction2Start()));
  } else if (state === STATES.COMPLETED) {
    box.append(button('Calculate fare', 'btn--primary btn--lg', onCalculate));
  } else {
    for (const a of nextActions(S.events)) {
      const ui = ACTION_UI[a];
      box.append(button(ui.label, `${ui.cls} ${ui.cls === 'btn--primary' ? 'btn--lg' : ''}`, () => onAction(a)));
    }
  }
  $('undoBtn').hidden = S.events.length === 0;

  // timeline
  const tl = $('timeline');
  tl.innerHTML = '';
  let st = STATES.NOT_STARTED;
  const replayed = [];
  for (const e of S.events) { st = replay([...replayed, e]); replayed.push(e);
    const li = document.createElement('li');
    li.innerHTML = `<div class="tl__rail"><div class="tl__node${isWaitingState(st) ? ' is-wait' : ''}"></div><div class="tl__line"></div></div>
      <div class="tl__body"><span></span><span class="tl__time"></span></div>`;
    li.querySelector('.tl__body span').textContent = EVENT_LABELS[e.type];
    if (e.pending) { const tag = document.createElement('span'); tag.className = 'tl__sync'; tag.textContent = 'Not uploaded'; li.querySelector('.tl__body span').append(tag); }
    li.querySelector('.tl__time').textContent = fmtTime(e.at);
    tl.append(li);
  }
  if (!S.events.length) tl.innerHTML = '<li><div class="tl__body"><span class="hint">No steps yet.</span></div></li>';

  saveCache({ trip: S.trip, events: S.events });
  tick();
  startTicker();
}

// A trip whose only press (Start) was undone: start again without re-entering details.
async function onAction2Start() {
  const ok = await confirmAsk('Start the trip now?', `Running time starts at ${fmtTime(new Date())}.`, 'Start trip');
  if (ok) addEvent(EVENTS.START);
}

function button(label, cls, onClick) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = `btn btn--block ${cls}`; b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function tick() {
  if (!S.trip || $('tripView').hidden) return;
  const seg = segments(S.events);
  $('runVal').textContent = formatClock(seg.runningMs);
  $('waitVal').textContent = formatClock(seg.waitingMs);
  $('runTimer').classList.toggle('is-active', seg.state === STATES.OUTBOUND || seg.state === STATES.RETURN);
  $('waitTimer').classList.toggle('is-active', isWaitingState(seg.state));
}
function startTicker() { if (!S.timer) S.timer = setInterval(tick, 1000); }
function stopTicker() { clearInterval(S.timer); S.timer = null; }

/* ============================================================
   Upload queue
   ============================================================ */
let flushing = false;
async function flush() {
  if (flushing || !S.api) return;
  flushing = true;
  try {
    for (;;) {
      const queue = store.get(PENDING, []);
      if (!queue.length) break;
      const e = queue[0];
      await S.api.insertEvent(e);
      store.set(PENDING, store.get(PENDING, []).filter((p) => p.id !== e.id));
      const local = S.events.find((x) => x.id === e.id);
      if (local) local.pending = false;
    }
    const fin = store.get(FINALIZE, null);
    if (fin) await uploadFare(fin);
    if (!$('banner').classList.contains('banner--error')) banner(null);
  } catch (e) {
    if (e instanceof NetworkError) banner('No signal. Your steps are saved on this phone and will upload automatically.');
    else banner(`Upload problem: ${e.message}`, 'error');
  } finally {
    flushing = false;
    if (S.trip && !$('tripView').hidden) renderTrip();
  }
}
window.addEventListener('online', flush);
setInterval(() => { if (store.get(PENDING, []).length || store.get(FINALIZE, null)) flush(); }, 20000);

/* ============================================================
   Fare
   ============================================================ */
async function onCalculate() {
  try {
    S.fare = calculateFare(S.events, S.settings);
  } catch (e) { banner(`Could not calculate the fare: ${e.message}`, 'error'); return; }
  store.set(FINALIZE, S.trip.id);
  await renderFare();
  flush();
}

async function uploadFare(tripId) {
  if (!S.trip || S.trip.id !== tripId || !S.fare) {
    // fare for an older trip: recompute from the server copy
    const trip = await S.api.getTrip(tripId);
    if (!trip || trip.status === 'completed') { store.del(FINALIZE); return; }
    const evs = (await S.api.getEvents(tripId)).map((e) => ({ type: e.event, at: e.at }));
    await S.api.updateTrip(tripId, farePatch(calculateFare(evs, S.settings)));
    store.del(FINALIZE);
    return;
  }
  await S.api.updateTrip(tripId, farePatch(S.fare));
  S.trip.status = 'completed';
  store.del(FINALIZE);
}

function farePatch(f) {
  return {
    status: 'completed',
    started_at: f.startAt.toISOString(),
    completed_at: f.endAt.toISOString(),
    running_minutes: f.runningMinutes,
    waiting_minutes: f.waitingMinutes,
    running_charge: f.runningCharge,
    waiting_charge: f.waitingCharge,
    platform_charge: f.platformCharge,
    minimum_adjustment: f.minimumAdjustment,
    total_fare: f.total,
    fare_breakdown: {
      stops: f.stops.map((s) => ({ label: s.label, minutes: s.minutes, tier1Minutes: s.tier1Minutes, tier2Minutes: s.tier2Minutes, charge: s.charge })),
      subtotal: f.subtotal, days: f.days, platformCap: f.platformCap, platformCapped: f.platformCapped, settings: f.settings,
    },
  };
}

async function viewCompleted(trip) {
  try {
    const evs = (await S.api.getEvents(trip.id)).map((e) => ({ id: e.id, type: e.event, at: e.at, pending: false }));
    S.trip = trip; S.events = evs;
    S.fare = calculateFare(evs, S.settings);
    await renderFare();
  } catch (e) { banner(e instanceof NetworkError ? 'No connection.' : `Could not open the trip: ${e.message}`, 'error'); }
}

async function renderFare() {
  const f = S.fare; const t = S.trip;
  stopTicker();
  showView('fareView');
  $('fareTripId').textContent = `${t.id} · ${t.customer_name}`;
  const rows = [
    ['Started', fmtTime(f.startAt)], ['Completed', fmtTime(f.endAt)], ['Total time', formatDuration(f.totalMinutes)],
  ];
  const html = [];
  const row = (lbl, val, sub, cls = '') => html.push(`<div class="fare-row ${cls}"><span class="lbl">${esc(lbl)}${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="val">${esc(val)}</span></div>`);
  rows.forEach(([l, v]) => row(l, v));
  row('Running time', formatRupees(f.runningCharge), `${formatDuration(f.runningMinutes)} × ₹${f.settings.runningRatePerHour}/hr`);
  if (f.stops.length) {
    f.stops.forEach((s) => row(s.label, formatRupees(s.charge),
      s.tier2Minutes ? `${formatDuration(s.minutes)}: ${formatDuration(s.tier1Minutes)} × ₹${f.settings.waitingRatePerHour}/hr + ${formatDuration(s.tier2Minutes)} × ₹${f.settings.waitingRateAfterTierPerHour}/hr`
        : `${formatDuration(s.minutes)} × ₹${f.settings.waitingRatePerHour}/hr`));
  } else row('Waiting time', formatRupees(0), 'No waiting');
  row('Subtotal', formatRupees(f.subtotal), null, 'fare-row--sub');
  row(`Platform charge (${f.platformPercent}%)`, formatRupees(f.platformCharge), f.platformCapped ? `Capped at ${formatRupees(f.platformCap)}` : null);
  if (f.minimumAdjustment > 0) row('Minimum fare adjustment', formatRupees(f.minimumAdjustment), `Minimum fare is ${formatRupees(f.minimumFare)}`);
  $('fareRows').innerHTML = html.join('');
  $('fareTotal').textContent = formatRupees(f.total);

  S.canvas = await drawReceipt({ trip: t, fare: f, driver: S.driver });
  $('farePreview').src = S.canvas.toDataURL('image/png');
  window.scrollTo({ top: 0 });
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function onShare() {
  if (!S.canvas) return;
  const r = await shareReceipt(S.canvas, S.trip.id);
  if (r === 'downloaded') banner('Sharing is not available in this browser, so the image was downloaded. Send it from your gallery or downloads.', 'info');
}
async function onDownload() { if (S.canvas) downloadBlob(await canvasToBlob(S.canvas), `${S.trip.id}-fare.png`); }

async function onReopen() {
  // Undo “Completed” from the fare screen
  if (S.events.at(-1)?.type !== EVENTS.COMPLETED) return;
  await onUndo();
}

async function onSignOut() {
  const pending = store.get(PENDING, []).length || store.get(FINALIZE, null);
  if (pending && !(await confirmAsk('Sign out?', 'Some trip steps are not uploaded yet. If you sign out now they stay on this phone and upload next time you sign in.', 'Sign out'))) return;
  await S.api.signOut();
  store.del(CACHE);
  location.replace('/login/?reason=signed-out');
}

/* ---------- Wire up ---------- */
$('startForm').addEventListener('submit', onStart);
$('startForm').addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));
$('undoBtn').addEventListener('click', onUndo);
$('shareBtn').addEventListener('click', onShare);
$('downloadBtn').addEventListener('click', onDownload);
$('newTripBtn').addEventListener('click', () => { banner(null); showStart(); });
$('reopenBtn').addEventListener('click', onReopen);
$('signOutBtn').addEventListener('click', onSignOut);

init();
