import { TIPS } from './tips.js';
import { WIDGETS } from './widgets/index.js';
import { SceneManager } from './scenes/manager.js';
import { drawChapterIcons } from './widgets/icons.js';

const W = 1920, H = 1080;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ───────────────────────── Tip (hover detail card) ───────────────────────── */
class Tips {
  constructor(stage, el) {
    this.stage = stage; this.el = el; this.key = null; this.hideT = 0;
  }
  html(t) {
    let h = '';
    if (t.k) h += `<div class="tk">${t.k}</div>`;
    if (t.t) h += `<div class="tt">${t.t}</div>`;
    if (t.rows) h += `<dl class="rows">${t.rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`;
    if (t.b) h += `<ul>${t.b.map(x => `<li>${x}</li>`).join('')}</ul>`;
    if (t.n) h += `<div class="tn">${t.n}</div>`;
    return h;
  }
  // anchor: DOMRect in client coords, or {x,y} client point
  show(key, anchor) {
    const t = typeof key === 'string' ? TIPS[key] : key;
    if (!t) return;
    clearTimeout(this.hideT);
    if (this.key !== key) {
      this.el.innerHTML = this.html(t);
      this.el.style.setProperty('--tc', t.c || 'var(--text-3)');
      this.key = key;
    }
    const s = app.scale, sr = this.stage.getBoundingClientRect();
    const toStage = (x, y) => [(x - sr.left) / s, (y - sr.top) / s];
    let ax0, ay0, ax1, ay1;
    if (anchor.width !== undefined) {
      [ax0, ay0] = toStage(anchor.left, anchor.top);
      [ax1, ay1] = toStage(anchor.right, anchor.bottom);
    } else {
      [ax0, ay0] = toStage(anchor.x, anchor.y); ax1 = ax0; ay1 = ay0;
      ax0 -= 24; ax1 += 24; ay0 -= 24; ay1 += 24;
    }
    const tw = this.el.offsetWidth, th = this.el.offsetHeight, m = 36, gap = 26;
    let x, ox;
    if (ax1 + gap + tw < W - m) { x = ax1 + gap; ox = '0%'; }
    else if (ax0 - gap - tw > m) { x = ax0 - gap - tw; ox = '100%'; }
    else { x = Math.min(Math.max((ax0 + ax1) / 2 - tw / 2, m), W - tw - m); ox = '50%'; }
    let y = (ay0 + ay1) / 2 - th / 2;
    if (ox === '50%') y = ay1 + gap > H - th - m ? ay0 - gap - th : ay1 + gap;
    y = Math.min(Math.max(y, m), H - th - m);
    this.el.style.left = x + 'px'; this.el.style.top = y + 'px';
    this.el.style.setProperty('--ox', ox);
    this.el.classList.add('show');
    this.el.setAttribute('aria-hidden', 'false');
  }
  hide(delay = 60) {
    clearTimeout(this.hideT);
    this.hideT = setTimeout(() => {
      this.el.classList.remove('show'); this.el.setAttribute('aria-hidden', 'true'); this.key = null;
    }, delay);
  }
}

/* ───────────────────────── Deck ───────────────────────── */
class App {
  constructor() {
    this.stage = $('#stage');
    this.slides = $$('.slide');
    this.index = -1; this.step = 0; this.scale = 1;
    this.widgets = new Map();       // slide element → [instances]
    this.listeners = {};
    this.tips = new Tips(this.stage, $('#tip'));
    this.scenes = new SceneManager(this, $('#gl'), $('#labels'));
    this.typed = '';
    this.slides.forEach(s => {
      s.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--i', i));
    });
  }

  on(ev, fn) { (this.listeners[ev] ||= new Set()).add(fn); return () => this.listeners[ev].delete(fn); }
  emit(ev, ...a) { this.listeners[ev]?.forEach(fn => fn(...a)); }

  maxStep(slide) {
    let m = +(slide.dataset.steps || 0);
    slide.querySelectorAll('[data-build]').forEach(el => { m = Math.max(m, +el.dataset.build); });
    return m;
  }

  fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    this.scale = s;
    this.stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    this.scenes.resize(s);
  }

  mountWidgets(slide) {
    if (this.widgets.has(slide)) return this.widgets.get(slide);
    const list = [];
    slide.querySelectorAll('[data-widget]').forEach(el => {
      const def = WIDGETS[el.dataset.widget];
      if (!def) { console.warn('missing widget', el.dataset.widget); return; }
      try { list.push(def(el, this, slide)); } catch (e) { console.error(e); }
    });
    this.widgets.set(slide, list);
    return list;
  }

  applyBuilds(slide, step) {
    slide.querySelectorAll('[data-build]').forEach(el => {
      el.classList.toggle('in', step >= +el.dataset.build);
    });
  }

  go(i, step = 0, dir = 1) {
    i = Math.max(0, Math.min(this.slides.length - 1, i));
    const prev = this.slides[this.index];
    const next = this.slides[i];
    if (prev && prev !== next) {
      prev.classList.remove('active');
      (this.widgets.get(prev) || []).forEach(w => w.leave?.());
    }
    const changed = prev !== next;
    this.index = i; this.step = step;
    if (changed) {
      next.classList.add('active');
      const ws = this.mountWidgets(next);
      ws.forEach(w => w.enter?.(step, dir));
    }
    this.applyBuilds(next, step);
    (this.widgets.get(next) || []).forEach(w => w.step?.(step, dir));
    this.scenes.setSlide(next, step, changed);
    this.emit('step', next, step);
    this.tips.hide(0);
    this.updateChrome();
    if (changed) history.replaceState(null, '', '#/' + (i + 1));
  }

  next() {
    const s = this.slides[this.index];
    if (this.step < this.maxStep(s)) this.go(this.index, this.step + 1, 1);
    else if (this.index < this.slides.length - 1) this.go(this.index + 1, 0, 1);
  }
  prev() {
    if (this.step > 0) this.go(this.index, this.step - 1, -1);
    else if (this.index > 0) {
      const p = this.slides[this.index - 1];
      this.go(this.index - 1, this.maxStep(p), -1);
    }
  }
  goKey(key) {
    const i = this.slides.findIndex(s => s.dataset.key === key);
    if (i >= 0) this.go(i, 0);
  }

  updateChrome() {
    const n = this.slides.length;
    $('.progress .bar').style.width = ((this.index + 1) / n * 100) + '%';
    const s = this.slides[this.index];
    const secNames = { 1: 'The Bridge', 2: 'The Cycle', 3: 'The Power Plant' };
    $('.counter .sec').textContent = secNames[s.dataset.section] || '';
    $('.counter .num').textContent = `${this.index + 1} / ${n}`;
    $$('.ov-card').forEach((c, j) => c.classList.toggle('cur', j === this.index));
  }

  /* overlays */
  toggleOverlay(id, force) {
    const el = document.getElementById(id);
    const open = force ?? !el.classList.contains('open');
    $$('.overlay.open').forEach(o => { if (o !== el) o.classList.remove('open'); });
    el.classList.toggle('open', open);
    el.setAttribute('aria-hidden', String(!open));
    if (id === 'quiz-overlay' && open) {
      const f = el.querySelector('iframe');
      if (!f.src) f.src = f.dataset.src;
      setTimeout(() => f.contentWindow?.focus(), 200);
    }
    return open;
  }
  anyOverlay() { return !!$('.overlay.open'); }

  buildOverview() {
    const grid = $('.ov-grid');
    grid.innerHTML = this.slides.map((s, i) =>
      `<button class="ov-card sec${s.dataset.section || 0}" data-i="${i}"><span class="n">${i + 1}</span><span class="t">${s.dataset.title || ''}</span></button>`
    ).join('');
    grid.addEventListener('click', e => {
      const c = e.target.closest('.ov-card'); if (!c) return;
      this.toggleOverlay('overview', false);
      this.go(+c.dataset.i, 0);
    });
  }

  /* input */
  bind() {
    addEventListener('resize', () => this.fit());
    addEventListener('keydown', e => this.onKey(e));
    addEventListener('hashchange', () => {
      const n = parseInt(location.hash.replace('#/', ''), 10);
      if (n && n - 1 !== this.index) this.go(n - 1, 0);
    });
    $('.nav-next').addEventListener('click', () => this.next());
    $('.nav-prev').addEventListener('click', () => this.prev());
    $('#quiz-overlay .quiz-close').addEventListener('click', () => this.toggleOverlay('quiz-overlay', false));
    $$('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) this.toggleOverlay(o.id, false); }));
    window.addEventListener('message', e => { if (e.data === 'quiz:close') this.toggleOverlay('quiz-overlay', false); });

    // never let a focused button swallow Space / Enter meant for navigation
    document.addEventListener('pointerup', e => { const b = e.target.closest('button'); if (b) setTimeout(() => b.blur(), 0); });

    // chapter cards jump · segmented controls that drive the active 3D scene
    this.stage.addEventListener('click', e => {
      const g = e.target.closest('[data-goto]');
      if (g) this.goKey(g.dataset.goto);
      const b = e.target.closest('.seg[data-control] button');
      if (b) {
        const seg = b.closest('.seg');
        seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        this.scenes.active?.control?.(seg.dataset.control, b.dataset.val);
      }
    });

    // hover cards for DOM
    this.stage.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-tip]');
      if (!t || !t.closest('.slide.active')) return;
      this.tips.show(t.dataset.tip, t.getBoundingClientRect());
      if (t.dataset.hl) this.emit('highlight', t.dataset.hl, true);
    });
    this.stage.addEventListener('pointerout', e => {
      const t = e.target.closest('[data-tip]');
      if (!t) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;
      this.tips.hide();
      if (t.dataset.hl) this.emit('highlight', t.dataset.hl, false);
    });

    // idle cursor + chrome
    let idleT;
    const wake = () => {
      document.body.classList.add('mouse'); document.body.classList.remove('idle');
      clearTimeout(idleT);
      idleT = setTimeout(() => { document.body.classList.remove('mouse'); document.body.classList.add('idle'); }, 2600);
    };
    addEventListener('pointermove', wake, { passive: true });

    // touch swipe
    let sx = 0, sy = 0, st = 0, ok = false;
    this.stage.addEventListener('touchstart', e => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
      ok = !e.target.closest('button, input, .seg, #gl, [data-widget] svg');
    }, { passive: true });
    this.stage.addEventListener('touchend', e => {
      if (!ok) return;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Date.now() - st < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type === 'range' && /Arrow/.test(e.key)) return;
    if (tag === 'textarea' || (tag === 'input' && e.target.type === 'text')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;

    if (k === 'Escape') { $$('.overlay.open').forEach(o => this.toggleOverlay(o.id, false)); $('#blackout').classList.remove('on'); return; }
    if ($('#quiz-overlay').classList.contains('open')) return;

    if (/^[0-9]$/.test(k)) { this.typed += k; clearTimeout(this.typedT); this.typedT = setTimeout(() => this.typed = '', 1500); return; }
    if (k === 'Enter' && this.typed) { e.preventDefault(); this.go(parseInt(this.typed, 10) - 1, 0); this.typed = ''; return; }

    const lower = k.length === 1 ? k.toLowerCase() : k;
    switch (lower) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter': case 'n':
        e.preventDefault(); if (!this.anyOverlay()) this.next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'p':
        e.preventDefault(); if (!this.anyOverlay()) this.prev(); break;
      case 'Home': this.go(0, 0); break;
      case 'End': this.go(this.slides.length - 1, 0); break;
      case 'o': this.toggleOverlay('overview'); break;
      case '?': case 'h': this.toggleOverlay('help'); break;
      case 'q': this.toggleOverlay('quiz-overlay', true); break;
      case 'f':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
      case 'b': case '.': $('#blackout').classList.toggle('on'); break;
    }
  }

  start() {
    this.fit();
    this.bind();
    this.buildOverview();
    drawChapterIcons();
    const n = parseInt(location.hash.replace('#/', ''), 10);
    this.go(n ? n - 1 : 0, 0);
    // warm up 3D scenes in the background so slide changes stay instant
    this.scenes.preload();
  }
}

const app = new App();
window.app = app;
document.fonts?.ready.then(() => app.start()) ?? app.start();
export default app;
