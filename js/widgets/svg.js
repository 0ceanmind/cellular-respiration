// Small SVG toolkit for the live 2D diagrams.
export const NS = 'http://www.w3.org/2000/svg';

export function h(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

export function mount(el, w, hgt, inner = '') {
  el.innerHTML = `<svg viewBox="0 0 ${w} ${hgt}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" class="svg-text">${inner}</svg>`;
  return el.querySelector('svg');
}

// frame loop that only runs while a slide is visible
export function ticker(fn) {
  let raf = 0, last;
  const tick = t => {
    const dt = Math.min((t - (last ?? t)) / 1000, 0.05);
    last = t; fn(dt, t / 1000);
    raf = requestAnimationFrame(tick);
  };
  return {
    start() { if (!raf) { last = undefined; raf = requestAnimationFrame(tick); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    get running() { return !!raf; },
  };
}

// glowing particles that travel along an SVG path
export class Flow {
  constructor(layer, path, { color = '#ffe45c', r = 7, rate = 1.6, speed = 320, halo = 2.6, jitter = 0, fade = true, max = 60 } = {}) {
    this.layer = layer; this.path = path; this.len = path.getTotalLength();
    Object.assign(this, { color, r, rate, speed, halo, jitter, fade, max });
    this.parts = []; this.acc = Math.random(); this.on = false; this.speedK = 1; this.rateK = 1;
    this.stopAt = null;   // fraction of the path where particles halt (blocked)
  }
  spawn() {
    const g = h('g', { opacity: 0 }, this.layer);
    h('circle', { r: this.r * this.halo, fill: this.color, opacity: 0.18 }, g);
    h('circle', { r: this.r, fill: this.color }, g);
    this.parts.push({ g, s: 0, off: (Math.random() - 0.5) * this.jitter, hold: 0 });
  }
  update(dt) {
    if (this.on) {
      this.acc += dt * this.rate * this.rateK;
      while (this.acc >= 1 && this.parts.length < this.max) { this.acc -= 1; this.spawn(); }
      if (this.acc > 1) this.acc = 1;
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      const lim = this.stopAt !== null ? this.stopAt * this.len - p.hold : Infinity;
      p.s = Math.min(p.s + this.speed * this.speedK * dt, lim);
      if (this.stopAt !== null && p.s >= lim - 0.5) { p.blocked = true; }
      const pt = this.path.getPointAtLength(Math.min(p.s, this.len));
      p.g.setAttribute('transform', `translate(${pt.x + p.off} ${pt.y + p.off * 0.6})`);
      const u = p.s / this.len;
      const env = this.fade ? Math.max(0, Math.min(1, u * 8, (1 - u) * 8)) : 1;
      p.g.setAttribute('opacity', p.blocked ? 1 : env);
      if (p.s >= this.len) { p.g.remove(); this.parts.splice(i, 1); }
    }
    // stack held particles so a queue forms behind a block
    if (this.stopAt !== null) {
      const held = this.parts.filter(p => p.blocked).sort((a, b) => b.s - a.s);
      held.forEach((p, k) => { p.hold = k * this.r * 2.4; });
    }
  }
  clear() { this.parts.forEach(p => p.g.remove()); this.parts = []; }
  release() { this.stopAt = null; this.parts.forEach(p => { p.blocked = false; p.hold = 0; }); }
}

export const fmt = n => (Math.round(n * 10) / 10).toString();

// animated number
export function countTo(el, to, dur = 0.9, decimals = 0) {
  const from = parseFloat(el.dataset.v ?? el.textContent) || 0;
  el.dataset.v = to;
  const o = { v: from };
  gsap.to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(decimals); } });
}
