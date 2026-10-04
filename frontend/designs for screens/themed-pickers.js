/*!
 * VandiPilot themed pickers
 * Replaces the browser's native date picker, time picker and <select> dropdown
 * (which can't be styled with CSS) with popovers built from the design tokens.
 * Original controls stay in the DOM (hidden) so values, names, validation and
 * form submission keep working. Include once per page:
 *   <script src="./themed-pickers.js"></script>
 */
(function () {
  'use strict';
  if (window.__vpPickers) return;
  window.__vpPickers = true;

  /* ---------- styles (token vars with fallbacks) ---------- */
  var css = [
    '.vp-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;margin:0;text-align:left;font-family:inherit;cursor:pointer;appearance:none;-webkit-appearance:none;}',
    '.vp-trigger:focus-visible{outline:2px solid var(--color-primary,#0F766E);outline-offset:2px;}',
    '.vp-trigger[aria-expanded="true"]{border-color:var(--color-primary,#0F766E)!important;box-shadow:0 0 0 3px var(--color-primary-light,#CCFBF1);}',
    '.vp-trigger__text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.vp-trigger__text.is-ph{color:var(--color-foreground-subtle,#64748B);}',
    '.vp-trigger__ico{flex-shrink:0;color:var(--color-foreground-muted,#475569);display:flex;}',

    '.vp-pop{position:fixed;z-index:100000;background:var(--color-surface,#fff);border:1px solid var(--color-border,#E2E8F0);border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-lg,0 8px 24px rgba(0,0,0,.12));font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--color-foreground,#1A1A2E);font-size:14px;line-height:1.4;animation:vp-in .12s ease-out;}',
    '@keyframes vp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.vp-pop{animation:none}}',
    '.vp-pop button{font-family:inherit;}',

    /* calendar */
    '.vp-cal{width:304px;padding:14px;}',
    '.vp-cal__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}',
    '.vp-cal__title{font-weight:600;font-size:15px;}',
    '.vp-nav{width:32px;height:32px;border:1px solid var(--color-border,#E2E8F0);background:var(--color-surface,#fff);border-radius:var(--radius-sm,6px);display:flex;align-items:center;justify-content:center;color:var(--color-foreground-muted,#475569);cursor:pointer;}',
    '.vp-nav:hover{background:var(--color-muted,#F1F5F9);color:var(--color-foreground,#1A1A2E);}',
    '.vp-nav:disabled{opacity:.35;cursor:not-allowed;background:transparent;}',
    '.vp-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}',
    '.vp-dow{height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--color-foreground-subtle,#64748B);}',
    '.vp-day{height:38px;border:none;background:transparent;border-radius:var(--radius-md,8px);font-size:14px;color:var(--color-foreground,#1A1A2E);cursor:pointer;position:relative;font-variant-numeric:tabular-nums;}',
    '.vp-day:hover:not(:disabled):not(.is-sel){background:var(--color-primary-light,#CCFBF1);color:var(--color-primary,#0F766E);}',
    '.vp-day.is-out{color:var(--color-border-hover,#CBD5E1);}',
    '.vp-day.is-today{box-shadow:inset 0 0 0 1.5px var(--color-primary,#0F766E);color:var(--color-primary,#0F766E);font-weight:600;}',
    '.vp-day.is-sel{background:var(--gradient-cta,linear-gradient(135deg,#0F766E,#10827A));color:#fff;font-weight:600;box-shadow:0 2px 8px rgba(15,118,110,.3);}',
    '.vp-day:disabled{color:var(--color-border-hover,#CBD5E1);cursor:not-allowed;text-decoration:line-through;}',
    '.vp-day:focus-visible,.vp-nav:focus-visible,.vp-link:focus-visible,.vp-opt:focus-visible,.vp-col button:focus-visible{outline:2px solid var(--color-primary,#0F766E);outline-offset:1px;}',
    '.vp-foot{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--color-border,#E2E8F0);}',
    '.vp-link{border:none;background:none;color:var(--color-primary,#0F766E);font-weight:600;font-size:13px;cursor:pointer;padding:6px 8px;border-radius:var(--radius-sm,6px);}',
    '.vp-link:hover{background:var(--color-primary-light,#CCFBF1);}',

    /* time */
    '.vp-time{padding:12px;width:236px;}',
    '.vp-time__cols{display:grid;grid-template-columns:1fr 1fr 68px;gap:8px;}',
    '.vp-col{max-height:216px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;padding-right:2px;scrollbar-width:thin;}',
    '.vp-col__lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--color-foreground-subtle,#64748B);text-align:center;margin-bottom:6px;}',
    '.vp-col button{height:36px;flex-shrink:0;border:none;background:transparent;border-radius:var(--radius-md,8px);font-size:14px;color:var(--color-foreground,#1A1A2E);cursor:pointer;font-variant-numeric:tabular-nums;}',
    '.vp-col button:hover:not(.is-sel){background:var(--color-primary-light,#CCFBF1);color:var(--color-primary,#0F766E);}',
    '.vp-col button.is-sel{background:var(--gradient-cta,linear-gradient(135deg,#0F766E,#10827A));color:#fff;font-weight:600;}',

    /* select list */
    '.vp-list{padding:6px;min-width:160px;max-height:280px;overflow-y:auto;scrollbar-width:thin;}',
    '.vp-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:40px;padding:0 12px;border:none;background:transparent;border-radius:var(--radius-md,8px);font-size:15px;color:var(--color-foreground,#1A1A2E);cursor:pointer;text-align:left;}',
    '.vp-opt:hover,.vp-opt.is-active{background:var(--color-primary-light,#CCFBF1);color:var(--color-primary,#0F766E);}',
    '.vp-opt.is-sel{font-weight:600;color:var(--color-primary,#0F766E);}',
    '.vp-opt:disabled{opacity:.45;cursor:not-allowed;}',
    '.vp-opt svg{flex-shrink:0;}'
  ].join('\n');
  var st = document.createElement('style');
  st.setAttribute('data-vp-pickers', '');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- helpers ---------- */
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOWS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  var CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var CAL_ICO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
  var CLOCK_ICO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var PREV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var NEXT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmtDate(d) { return pad(d.getDate()) + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function fmtTime(s) {
    var m = /^(\d{1,2}):(\d{2})/.exec(s || '');
    if (!m) return '';
    var h = +m[1], ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return pad(h) + ':' + m[2] + ' ' + ap;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function fire(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* ---------- single popover manager ---------- */
  var current = null; // { pop, trigger, close }

  function closePop(restoreFocus) {
    if (!current) return;
    var c = current;
    current = null;
    c.pop.remove();
    c.trigger.setAttribute('aria-expanded', 'false');
    window.removeEventListener('keydown', onKey, true);
    document.removeEventListener('mousedown', onDown, true);
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
    if (restoreFocus) c.trigger.focus();
  }
  function onDown(e) {
    if (!current) return;
    if (current.pop.contains(e.target) || current.trigger.contains(e.target)) return;
    closePop(false);
  }
  function onKey(e) {
    if (!current) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // don't let a surrounding modal close too
      closePop(true);
    } else if (e.key === 'Tab') {
      closePop(false);
    } else if (current.onKey) {
      current.onKey(e);
    }
  }
  function reposition() {
    if (!current) return;
    var r = current.trigger.getBoundingClientRect();
    var pop = current.pop;
    var ph = pop.offsetHeight, pw = pop.offsetWidth;
    var vh = window.innerHeight, vw = window.innerWidth;
    var top = r.bottom + 6;
    if (top + ph > vh - 8 && r.top - 6 - ph > 8) top = r.top - 6 - ph; // flip up
    top = Math.max(8, Math.min(top, vh - ph - 8));
    var left = r.left;
    if (current.matchWidth) pop.style.minWidth = r.width + 'px';
    left = Math.max(8, Math.min(left, vw - pw - 8));
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }
  function openPop(trigger, pop, extra) {
    closePop(false);
    document.body.appendChild(pop);
    current = { pop: pop, trigger: trigger, onKey: extra && extra.onKey, matchWidth: extra && extra.matchWidth };
    trigger.setAttribute('aria-expanded', 'true');
    reposition();
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
  }

  /* ---------- trigger factory (copies the look of the original control) ---------- */
  function makeTrigger(input, iconHTML) {
    var cs = getComputedStyle(input);
    var t = el('button', 'vp-trigger');
    t.type = 'button';
    t.setAttribute('aria-haspopup', input.tagName === 'SELECT' ? 'listbox' : 'dialog');
    t.setAttribute('aria-expanded', 'false');
    var s = t.style;
    s.height = cs.height; s.minHeight = cs.minHeight;
    s.padding = cs.paddingTop + ' ' + cs.paddingRight + ' ' + cs.paddingBottom + ' ' + cs.paddingLeft;
    s.border = cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor;
    s.borderRadius = cs.borderRadius;
    s.background = cs.backgroundColor;
    s.fontSize = cs.fontSize; s.fontWeight = cs.fontWeight; s.color = cs.color;
    s.flex = cs.flex; s.width = (cs.width && cs.display !== 'inline' && input.offsetWidth ? '100%' : '100%');
    if (input.style.cssText) { /* honour inline layout hints like margin */ s.margin = input.style.margin || ''; }
    var txt = el('span', 'vp-trigger__text');
    var hasOwnIcon = !!input.parentNode.querySelector(':scope > svg');
    t.appendChild(txt);
    if (!hasOwnIcon) t.appendChild(el('span', 'vp-trigger__ico', iconHTML));
    var id = input.id; if (id) t.setAttribute('data-for', id);
    var lbl = input.id && document.querySelector('label[for="' + input.id + '"]');
    if (lbl) { if (!lbl.id) lbl.id = 'vp-l-' + Math.random().toString(36).slice(2, 8); t.setAttribute('aria-labelledby', lbl.id); }
    input.style.display = 'none';
    input.tabIndex = -1;
    input.parentNode.insertBefore(t, input);
    input.focus = function () { t.focus(); };
    return { btn: t, text: txt };
  }
  function watchReset(input, refresh) {
    var f = input.form;
    if (f && !f.__vpReset) {
      f.__vpReset = [];
      f.addEventListener('reset', function () { setTimeout(function () { f.__vpReset.forEach(function (fn) { fn(); }); }, 0); });
    }
    if (f) f.__vpReset.push(refresh);
    // programmatic value changes
    var proto = Object.getPrototypeOf(input);
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') || Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set && desc.get) {
      Object.defineProperty(input, 'value', {
        configurable: true,
        get: function () { return desc.get.call(this); },
        set: function (v) { desc.set.call(this, v); refresh(); }
      });
    }
  }

  /* ---------- date picker ---------- */
  function initDate(input) {
    var T = makeTrigger(input, CAL_ICO);
    function refresh() {
      var d = parseISO(input.value);
      T.text.textContent = d ? fmtDate(d) : (input.getAttribute('placeholder') || 'Select date');
      T.text.classList.toggle('is-ph', !d);
    }
    refresh();
    watchReset(input, refresh);

    T.btn.addEventListener('click', function () {
      if (current && current.trigger === T.btn) { closePop(true); return; }
      var sel = parseISO(input.value), min = parseISO(input.min), max = parseISO(input.max);
      var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var view = new Date((sel || (min && min > today ? min : today)).getFullYear(), (sel || (min && min > today ? min : today)).getMonth(), 1);
      var focusDate = sel || today;
      var pop = el('div', 'vp-pop vp-cal');
      pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose date');

      function pick(d) { input.value = iso(d); fire(input); closePop(true); }
      function render() {
        pop.innerHTML = '';
        var head = el('div', 'vp-cal__head');
        var prev = el('button', 'vp-nav', PREV); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous month');
        var next = el('button', 'vp-nav', NEXT); next.type = 'button'; next.setAttribute('aria-label', 'Next month');
        var title = el('div', 'vp-cal__title', MONTHS[view.getMonth()] + ' ' + view.getFullYear());
        title.setAttribute('aria-live', 'polite');
        if (min && new Date(view.getFullYear(), view.getMonth(), 0) < min) prev.disabled = true;
        if (max && new Date(view.getFullYear(), view.getMonth() + 1, 1) > max) next.disabled = true;
        prev.onclick = function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); };
        next.onclick = function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); };
        head.appendChild(prev); head.appendChild(title); head.appendChild(next);
        pop.appendChild(head);

        var grid = el('div', 'vp-cal__grid'); grid.setAttribute('role', 'grid');
        DOWS.forEach(function (d) { grid.appendChild(el('div', 'vp-dow', d)); });
        var first = new Date(view.getFullYear(), view.getMonth(), 1);
        var start = new Date(first); start.setDate(1 - first.getDay());
        for (var i = 0; i < 42; i++) {
          var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
          var b = el('button', 'vp-day', String(d.getDate())); b.type = 'button';
          b.setAttribute('data-iso', iso(d));
          b.setAttribute('aria-label', d.toDateString());
          if (d.getMonth() !== view.getMonth()) b.classList.add('is-out');
          if (+d === +today) b.classList.add('is-today');
          if (sel && +d === +sel) { b.classList.add('is-sel'); b.setAttribute('aria-selected', 'true'); }
          if ((min && d < min) || (max && d > max)) b.disabled = true;
          b.tabIndex = (iso(d) === iso(focusDate)) ? 0 : -1;
          (function (dd) { b.onclick = function () { pick(dd); }; })(d);
          grid.appendChild(b);
        }
        pop.appendChild(grid);

        var foot = el('div', 'vp-foot');
        var clear = el('button', 'vp-link', 'Clear'); clear.type = 'button';
        clear.onclick = function () { input.value = ''; fire(input); closePop(true); };
        var tdy = el('button', 'vp-link', 'Today'); tdy.type = 'button';
        if ((min && today < min) || (max && today > max)) tdy.disabled = true;
        tdy.onclick = function () { pick(today); };
        foot.appendChild(clear); foot.appendChild(tdy);
        pop.appendChild(foot);
        reposition();
      }
      function focusDay() {
        var b = pop.querySelector('.vp-day[data-iso="' + iso(focusDate) + '"]');
        if (b && !b.disabled) b.focus();
      }
      openPop(T.btn, pop, {
        onKey: function (e) {
          var delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
          if (delta == null && e.key !== 'PageUp' && e.key !== 'PageDown') return;
          if (!pop.contains(document.activeElement)) return;
          e.preventDefault();
          var nd = new Date(focusDate);
          if (e.key === 'PageUp') nd.setMonth(nd.getMonth() - 1);
          else if (e.key === 'PageDown') nd.setMonth(nd.getMonth() + 1);
          else nd.setDate(nd.getDate() + delta);
          if ((min && nd < min) || (max && nd > max)) return;
          focusDate = nd;
          if (nd.getMonth() !== view.getMonth() || nd.getFullYear() !== view.getFullYear()) view = new Date(nd.getFullYear(), nd.getMonth(), 1);
          render(); focusDay();
        }
      });
      render();
      setTimeout(focusDay, 0);
    });
  }

  /* ---------- time picker ---------- */
  function initTime(input) {
    var T = makeTrigger(input, CLOCK_ICO);
    function refresh() {
      var s = fmtTime(input.value);
      T.text.textContent = s || (input.getAttribute('placeholder') || 'Select time');
      T.text.classList.toggle('is-ph', !s);
    }
    refresh();
    watchReset(input, refresh);

    T.btn.addEventListener('click', function () {
      if (current && current.trigger === T.btn) { closePop(true); return; }
      var m = /^(\d{1,2}):(\d{2})/.exec(input.value || '');
      var h24 = m ? +m[1] : null, mi = m ? +m[2] : null;
      var h12 = h24 == null ? null : (h24 % 12 || 12);
      var ap = h24 == null ? 'AM' : (h24 >= 12 ? 'PM' : 'AM');
      var min = mi;

      var pop = el('div', 'vp-pop vp-time');
      pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose time');
      var cols = el('div', 'vp-time__cols');
      function col(label) {
        var wrap = el('div');
        wrap.appendChild(el('div', 'vp-col__lbl', label));
        var c = el('div', 'vp-col'); wrap.appendChild(c);
        cols.appendChild(wrap);
        return c;
      }
      var cH = col('Hour'), cM = col('Min'), cA = col('');
      var i, b;
      function commit() {
        if (h12 == null) return;
        var h = h12 % 12 + (ap === 'PM' ? 12 : 0);
        input.value = pad(h) + ':' + pad(min == null ? 0 : min);
        fire(input);
      }
      function mark(c, test) {
        Array.prototype.forEach.call(c.children, function (x) { x.classList.toggle('is-sel', test(x)); });
      }
      for (i = 1; i <= 12; i++) {
        b = el('button', '', pad(i)); b.type = 'button'; b.setAttribute('data-v', i);
        b.onclick = function () { h12 = +this.getAttribute('data-v'); if (min == null) min = 0; mark(cH, function (x) { return +x.getAttribute('data-v') === h12; }); mark(cM, function (x) { return +x.getAttribute('data-v') === min; }); commit(); };
        cH.appendChild(b);
      }
      for (i = 0; i < 60; i += 5) {
        b = el('button', '', pad(i)); b.type = 'button'; b.setAttribute('data-v', i);
        b.onclick = function () { min = +this.getAttribute('data-v'); if (h12 == null) h12 = 12; mark(cM, function (x) { return +x.getAttribute('data-v') === min; }); mark(cH, function (x) { return +x.getAttribute('data-v') === h12; }); commit(); };
        cM.appendChild(b);
      }
      ['AM', 'PM'].forEach(function (v) {
        b = el('button', '', v); b.type = 'button'; b.setAttribute('data-v', v);
        b.onclick = function () { ap = this.getAttribute('data-v'); if (h12 == null) { h12 = 12; min = 0; mark(cH, function (x) { return +x.getAttribute('data-v') === h12; }); mark(cM, function (x) { return +x.getAttribute('data-v') === 0; }); } mark(cA, function (x) { return x.getAttribute('data-v') === ap; }); commit(); };
        cA.appendChild(b);
      });
      mark(cH, function (x) { return +x.getAttribute('data-v') === h12; });
      mark(cM, function (x) { return +x.getAttribute('data-v') === min; });
      mark(cA, function (x) { return x.getAttribute('data-v') === ap; });
      pop.appendChild(cols);

      var foot = el('div', 'vp-foot');
      var clear = el('button', 'vp-link', 'Clear'); clear.type = 'button';
      clear.onclick = function () { input.value = ''; fire(input); closePop(true); };
      var done = el('button', 'vp-link', 'Done'); done.type = 'button';
      done.onclick = function () { closePop(true); };
      foot.appendChild(clear); foot.appendChild(done);
      pop.appendChild(foot);

      openPop(T.btn, pop, {});
      setTimeout(function () {
        [cH, cM].forEach(function (c) {
          var s = c.querySelector('.is-sel');
          if (s) c.scrollTop = Math.max(0, s.offsetTop - c.clientHeight / 2 + s.offsetHeight / 2);
        });
        var f = pop.querySelector('.is-sel') || pop.querySelector('.vp-col button');
        if (f) f.focus();
      }, 0);
    });
  }

  /* ---------- select dropdown ---------- */
  function initSelect(sel) {
    if (sel.multiple || sel.size > 1) return;
    var T = makeTrigger(sel, CHEV);
    function refresh() {
      var o = sel.options[sel.selectedIndex];
      T.text.textContent = o ? o.text : '';
      T.text.classList.toggle('is-ph', !!o && o.value === '' && !!sel.required);
    }
    refresh();
    sel.addEventListener('change', refresh);
    if (sel.form) { sel.form.addEventListener('reset', function () { setTimeout(refresh, 0); }); }

    T.btn.addEventListener('click', function () {
      if (current && current.trigger === T.btn) { closePop(true); return; }
      var pop = el('div', 'vp-pop vp-list');
      pop.setAttribute('role', 'listbox');
      var items = [];
      Array.prototype.forEach.call(sel.options, function (o, idx) {
        var b = el('button', 'vp-opt');
        b.type = 'button'; b.setAttribute('role', 'option'); b.disabled = o.disabled;
        b.innerHTML = '<span></span>' + (idx === sel.selectedIndex ? CHECK : '');
        b.firstChild.textContent = o.text;
        if (idx === sel.selectedIndex) { b.classList.add('is-sel'); b.setAttribute('aria-selected', 'true'); }
        b.onclick = function () { sel.selectedIndex = idx; fire(sel); refresh(); closePop(true); };
        pop.appendChild(b); items.push(b);
      });
      var active = Math.max(0, sel.selectedIndex);
      function setActive(i) {
        items.forEach(function (x) { x.classList.remove('is-active'); });
        active = i; items[i].classList.add('is-active'); items[i].focus();
      }
      openPop(T.btn, pop, {
        matchWidth: true,
        onKey: function (e) {
          if (e.key === 'ArrowDown') { e.preventDefault(); var n = active; do { n = Math.min(items.length - 1, n + 1); } while (items[n].disabled && n < items.length - 1); setActive(n); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); var p = active; do { p = Math.max(0, p - 1); } while (items[p].disabled && p > 0); setActive(p); }
          else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
          else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
        }
      });
      setTimeout(function () { if (items[active]) { setActive(active); items[active].scrollIntoView({ block: 'nearest' }); } }, 0);
    });
  }

  /* ---------- boot ---------- */
  function init(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('input[type="date"]:not([data-vp])'), function (i) { i.setAttribute('data-vp', ''); initDate(i); });
    Array.prototype.forEach.call(root.querySelectorAll('input[type="time"]:not([data-vp])'), function (i) { i.setAttribute('data-vp', ''); initTime(i); });
    Array.prototype.forEach.call(root.querySelectorAll('select:not([data-vp])'), function (s) { s.setAttribute('data-vp', ''); initSelect(s); });
  }
  window.VPPickers = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
