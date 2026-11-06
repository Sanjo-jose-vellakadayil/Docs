/* VandiPilot — fare receipt image (ON-22: "share as a well structured image").
   Drawn on a canvas, so there is no extra library and it works offline. */
import { formatDuration, formatRupees } from './fare.js';

const C = {
  bg: '#FFFFFF', page: '#FFFBF5', teal: '#0F766E', teal2: '#10827A', tealLight: '#CCFBF1',
  ink: '#1A1A2E', muted: '#475569', subtle: '#64748B', border: '#E2E8F0', warn: '#B45309',
};
const W = 1080;
const PAD = 64;
const FONT = 'Inter, -apple-system, "Segoe UI", Roboto, sans-serif';

const fmtDate = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(d);
const fmtTime = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(d).toUpperCase();
const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`;

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/** Builds the list of rows once, so layout height can be measured before drawing. */
function rowsFor(fare) {
  const rows = [];
  rows.push({ label: 'Running time', sub: `${formatDuration(fare.runningMinutes)} × ₹${fare.settings.runningRatePerHour}/hr`, value: formatRupees(fare.runningCharge) });
  for (const s of fare.stops) {
    const sub = s.tier2Minutes > 0
      ? `${formatDuration(s.minutes)}: first ${formatDuration(s.tier1Minutes)} × ₹${fare.settings.waitingRatePerHour}/hr + ${formatDuration(s.tier2Minutes)} × ₹${fare.settings.waitingRateAfterTierPerHour}/hr`
      : `${formatDuration(s.minutes)} × ₹${fare.settings.waitingRatePerHour}/hr`;
    rows.push({ label: s.label, sub, value: formatRupees(s.charge), wait: true });
  }
  if (!fare.stops.length) rows.push({ label: 'Waiting time', sub: 'No waiting', value: formatRupees(0), wait: true });
  rows.push({ label: 'Subtotal', value: formatRupees(fare.subtotal), strong: true, rule: true });
  rows.push({
    label: `Platform charge (${fare.platformPercent}%)`,
    sub: fare.platformCapped ? `Capped at ${formatRupees(fare.platformCap)}${fare.days > 1 ? ` (${fare.days} days)` : ''}` : null,
    value: formatRupees(fare.platformCharge),
  });
  if (fare.minimumAdjustment > 0) rows.push({ label: 'Minimum fare adjustment', sub: `Minimum fare is ${formatRupees(fare.minimumFare)}`, value: formatRupees(fare.minimumAdjustment) });
  return rows;
}

export async function drawReceipt({ trip, fare, driver }) {
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch { /* ignore */ } }
  const rows = rowsFor(fare);
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `500 30px ${FONT}`;
  const routeW = W - PAD * 2 - 120;
  const pickupLines = wrapLines(probe, trip.pickup, routeW);
  const destLines = wrapLines(probe, trip.destination, routeW);

  const headerH = 220;
  // customer block: labels + name (172) + pickup (12 + lines + 40 gap) + destination (12 + lines) + margin
  const custH = 172 + (12 + pickupLines.length * 40 + 40) + (12 + (destLines.length - 1) * 40) + 80;
  const timesH = 190;
  const rowsH = rows.reduce((h, r) => h + (r.sub ? 96 : 72) + (r.rule ? 16 : 0), 0);
  const totalH = 170;
  const footH = 150;
  const H = headerH + custH + timesH + rowsH + totalH + footH;

  const scale = 1;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.textBaseline = 'alphabetic';

  // background
  ctx.fillStyle = C.page; ctx.fillRect(0, 0, W, H);

  // header band
  const g = ctx.createLinearGradient(0, 0, W, headerH);
  g.addColorStop(0, C.teal); g.addColorStop(1, C.teal2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, headerH);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 52px ${FONT}`;
  ctx.fillText('Vandi', PAD, 100);
  const vw = ctx.measureText('Vandi').width;
  ctx.fillStyle = C.tealLight; ctx.fillText('Pilot', PAD + vw, 100);
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText('Trip fare receipt', PAD, 150);
  ctx.textAlign = 'right';
  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(trip.id, W - PAD, 100);
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.fillText(fmtDate(fare.startAt), W - PAD, 150);
  ctx.textAlign = 'left';

  let y = headerH + 70;
  // customer
  ctx.fillStyle = C.subtle; ctx.font = `600 22px ${FONT}`;
  ctx.fillText('CUSTOMER', PAD, y);
  y += 46;
  ctx.fillStyle = C.ink; ctx.font = `700 38px ${FONT}`;
  ctx.fillText(trip.customer_name, PAD, y);
  y += 56;
  const pin = (yy, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(PAD + 14, yy - 10, 10, 0, Math.PI * 2); ctx.fill(); };
  ctx.font = `500 30px ${FONT}`;
  pin(y, C.teal);
  ctx.fillStyle = C.subtle; ctx.font = `600 20px ${FONT}`; ctx.fillText('PICKUP', PAD + 48, y - 22);
  ctx.fillStyle = C.ink; ctx.font = `500 30px ${FONT}`;
  pickupLines.forEach((l, i) => ctx.fillText(l, PAD + 48, y + 12 + i * 40));
  y += 12 + pickupLines.length * 40 + 40;
  pin(y, C.warn);
  ctx.fillStyle = C.subtle; ctx.font = `600 20px ${FONT}`; ctx.fillText('DESTINATION', PAD + 48, y - 22);
  ctx.fillStyle = C.ink; ctx.font = `500 30px ${FONT}`;
  destLines.forEach((l, i) => ctx.fillText(l, PAD + 48, y + 12 + i * 40));
  y = headerH + custH;

  // times card
  const cardX = PAD; const cardW = W - PAD * 2;
  ctx.fillStyle = C.bg; ctx.strokeStyle = C.border; ctx.lineWidth = 2;
  roundRect(ctx, cardX, y - 10, cardW, 150, 18); ctx.fill(); ctx.stroke();
  const cols = [
    ['STARTED', fmtTime(fare.startAt)],
    ['COMPLETED', fmtTime(fare.endAt)],
    ['TOTAL TIME', formatDuration(fare.totalMinutes)],
  ];
  cols.forEach(([lbl, val], i) => {
    const cx = cardX + 36 + i * (cardW / 3);
    ctx.fillStyle = C.subtle; ctx.font = `600 20px ${FONT}`; ctx.fillText(lbl, cx, y + 44);
    ctx.fillStyle = C.ink; ctx.font = `700 34px ${FONT}`; ctx.fillText(val, cx, y + 96);
  });
  y += timesH;

  // rows
  for (const r of rows) {
    if (r.rule) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; line(ctx, PAD, y - 40, W - PAD, y - 40); y += 16; }
    ctx.fillStyle = r.strong ? C.ink : C.muted;
    ctx.font = `${r.strong ? 700 : 500} 30px ${FONT}`;
    ctx.fillText(r.label, PAD, y);
    ctx.textAlign = 'right'; ctx.fillStyle = C.ink; ctx.font = `${r.strong ? 700 : 600} 30px ${FONT}`;
    ctx.fillText(r.value, W - PAD, y);
    ctx.textAlign = 'left';
    if (r.sub) { ctx.fillStyle = r.wait ? C.warn : C.subtle; ctx.font = `500 22px ${FONT}`; ctx.fillText(r.sub, PAD, y + 34); }
    y += r.sub ? 96 : 72;
    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5; line(ctx, PAD, y - 40, W - PAD, y - 40);
  }

  // total
  y += 20;
  ctx.fillStyle = C.tealLight; roundRect(ctx, PAD, y - 40, W - PAD * 2, 120, 18); ctx.fill();
  ctx.fillStyle = C.ink; ctx.font = `700 34px ${FONT}`; ctx.fillText('Total fare', PAD + 32, y + 34);
  ctx.textAlign = 'right'; ctx.fillStyle = C.teal; ctx.font = `800 56px ${FONT}`;
  ctx.fillText(formatRupees(fare.total), W - PAD - 32, y + 40);
  ctx.textAlign = 'left';
  y += totalH;

  // footer
  ctx.fillStyle = C.muted; ctx.font = `500 22px ${FONT}`;
  ctx.fillText(`Driver: ${driver.name}  ·  Generated ${fmtDateTime(new Date())}`, PAD, y);
  ctx.fillText('vandipilot.com  ·  +91 90740 25803  ·  vandipilot@gmail.com', PAD, y + 38);
  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

export const canvasToBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/png'));

/** Opens the phone's share sheet (WhatsApp etc.) with the image; falls back to a download. */
export async function shareReceipt(canvas, tripId) {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], `${tripId}-fare.png`, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `VandiPilot fare ${tripId}`, text: `VandiPilot trip ${tripId} fare` });
      return 'shared';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, file.name);
  return 'downloaded';
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
