import { register } from './registry.js';
import { mount, ticker, Flow, h } from './svg.js';

export const pill = (x, y, text, { w = 220, hh = 76, cls = '', tip = '', fs = 34, stroke = 'rgba(255,255,255,.22)', fill = 'rgba(255,255,255,.06)' } = {}) => `
  <g class="node ${cls}" transform="translate(${x} ${y})" ${tip ? `data-tip="${tip}"` : ''}>
    <rect x="${-w / 2}" y="${-hh / 2}" width="${w}" height="${hh}" rx="${hh / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <text y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="650" fill="#f5f5f7">${text}</text>
  </g>`;

export const chip = (x, y, text, color, { tip = '', fs = 26, w } = {}) => {
  const ww = w ?? Math.max(110, text.replace(/<[^>]+>/g, '').length * fs * 0.6 + 64);
  return `<g class="chipg" transform="translate(${x} ${y})" ${tip ? `data-tip="${tip}"` : ''}>
    <rect x="${-ww / 2}" y="-24" width="${ww}" height="48" rx="24" fill="${color}22" stroke="${color}88" stroke-width="1.5"/>
    <circle cx="${-ww / 2 + 26}" cy="0" r="8" fill="${color}"/>
    <text x="${12}" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="650" fill="${color}">${text}</text>
  </g>`;
};

const STEPS = ['Glycolysis', 'The bridge', 'The cycle', 'The power plant'];

register('journey', (el) => {
  const svg = mount(el, 1680, 720, `
    <defs>
      <linearGradient id="jg2" x1="0" x2="1"><stop offset="0" stop-color="#ffd60a"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#ff6482"/></linearGradient>
      <marker id="jar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff88"/></marker>
    </defs>
    <text x="40" y="44" font-size="30" font-weight="600" fill="#98989f">Cytosol</text>
    <text x="560" y="26" font-size="30" font-weight="600" fill="#98989f">Mitochondrion</text>
    <rect x="520" y="44" width="1156" height="572" rx="120" fill="none" stroke="#9fb4ff" stroke-opacity=".35" stroke-width="3"/>
    <rect x="548" y="72" width="1052" height="516" rx="96" fill="#5ac8fa" fill-opacity=".035" stroke="#ff8f66" stroke-opacity=".75" stroke-width="3"/>
    <text x="600" y="126" font-size="26" font-weight="600" fill="#6e6e73">Matrix</text>
    <text x="1638" y="626" font-size="22" font-weight="600" fill="#6e6e73" text-anchor="end">inner membrane</text>

    <g class="jg g1">
      <path id="jp1" d="M190 150 V 290" stroke="#ffffff40" stroke-width="3" marker-end="url(#jar)" fill="none"/>
      <text x="214" y="228" font-size="28" font-weight="600" fill="#d2d2d7">Glycolysis</text>
      ${chip(410, 182, 'ATP', '#ffd60a', { tip: 'def-slp' })}
      ${chip(410, 246, 'NADH', '#30d158')}
      ${pill(190, 110, 'Glucose', { w: 220 })}
      ${pill(190, 330, 'Pyruvate', { w: 220, tip: 'pyruvate' })}
    </g>

    <g class="jg g2">
      <path id="jp2" d="M300 330 H 580" stroke="#ffffff40" stroke-width="3" fill="none" marker-end="url(#jar)"/>
      <path id="jp2b" d="M720 330 H 742" stroke="#ffffff40" stroke-width="3" fill="none" marker-end="url(#jar)"/>
      ${pill(650, 330, 'PDH', { w: 130, hh: 70, fill: 'rgba(48,209,88,.16)', stroke: '#30d158', tip: 'an-pdh' })}
      ${chip(650, 238, 'CO<tspan dy="6" font-size="18">2</tspan>', '#6aa8ff', { w: 120 })}
      ${chip(650, 422, 'NADH', '#30d158')}
      ${pill(860, 330, 'Acetyl CoA', { w: 236, tip: 'acetylcoa' })}
    </g>

    <g class="jg g3">
      <path id="jp3" d="M978 330 H 1020" stroke="#ffffff40" stroke-width="3" fill="none" marker-end="url(#jar)"/>
      <circle cx="1150" cy="330" r="125" fill="none" stroke="#ffffff14" stroke-width="16"/>
      <g class="ring-spin" style="transform-origin:1150px 330px">
        <circle cx="1150" cy="330" r="125" fill="none" stroke="url(#jg2)" stroke-width="6" stroke-linecap="round" stroke-dasharray="230 556"/>
      </g>
      ${Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 - Math.PI / 2; return `<circle cx="${1150 + 125 * Math.cos(a)}" cy="${330 + 125 * Math.sin(a)}" r="10" fill="#111" stroke="#ffffffaa" stroke-width="3"/>`; }).join('')}
      <text x="1150" y="344" text-anchor="middle" font-size="40" font-weight="750" fill="#fff" data-tip="amphibolic">TCA</text>
      ${chip(1150, 162, 'CO<tspan dy="6" font-size="18">2</tspan> ×2', '#6aa8ff', { w: 150, tip: 'en-co2' })}
      ${chip(1036, 520, 'NADH ×3', '#30d158', { w: 170, tip: 'en-nadh' })}
      ${chip(1198, 520, 'FADH<tspan dy="6" font-size="18">2</tspan>', '#ff6fae', { w: 136, tip: 'en-fadh' })}
      ${chip(1330, 520, 'GTP', '#ff9f0a', { w: 110, tip: 'en-gtp' })}
    </g>

    <g class="jg g4">
      <path id="jp4" d="M1268 290 C 1400 200, 1480 170, 1574 170" stroke="#ffe45c55" stroke-width="3" stroke-dasharray="6 10" fill="none"/>
      <path id="jp5" d="M1600 170 V 410" stroke="none" fill="none"/>
      <path id="jp6" d="M1600 510 C 1560 530, 1520 548, 1470 556" fill="none"/>
      <line x1="1600" y1="150" x2="1600" y2="540" stroke="#ff8f66" stroke-width="10" stroke-opacity=".35"/>
      ${[['I', 170, '#7d7aff', 'C1'], ['II', 250, '#d070ff', 'C2'], ['III', 330, '#2d9bff', 'C3'], ['IV', 410, '#2ad4b4', 'C4'], ['V', 510, '#ffb340', 'C5']].map(([t, y, c, tip]) =>
        `<g data-tip="${tip}"><rect x="1574" y="${y - 32}" width="52" height="64" rx="16" fill="${c}"/><text x="1600" y="${y + 10}" text-anchor="middle" font-size="26" font-weight="800" fill="#000">${t}</text></g>`).join('')}
      <text x="1408" y="138" font-size="26" font-weight="650" fill="#ffe45c" text-anchor="middle">e<tspan dy="-12" font-size="18">−</tspan></text>
      ${chip(1440, 410, '½O<tspan dy="6" font-size="18">2</tspan> → H<tspan dy="6" font-size="18">2</tspan><tspan dy="-6">O</tspan>', '#64d2ff', { w: 210, tip: 'o2Tok' })}
      <text class="atp-big" x="1420" y="572" text-anchor="middle" font-size="64" font-weight="800" fill="#ffd60a">ATP</text>
    </g>
    <g class="h-layer"></g>
    <g class="p-layer"></g>

    <g class="jsteps" transform="translate(0 690)">
      ${STEPS.map((s, i) => `<g class="jstep" data-i="${i + 1}" transform="translate(${180 + i * 330} 0)">
        <rect x="-140" y="-26" width="280" height="52" rx="26" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.12)"/>
        <text y="9" text-anchor="middle" font-size="25" font-weight="650" fill="#98989f">${i + 1} · ${s}</text></g>`).join('')}
    </g>
  `);

  const css = document.createElement('style');
  css.textContent = `
    [data-widget="journey"] .jg { opacity: .14; transition: opacity .9s cubic-bezier(.22,.75,.12,1); }
    [data-widget="journey"] .jg.on { opacity: 1; }
    [data-widget="journey"] .jg.done { opacity: .55; }
    [data-widget="journey"] .ring-spin { animation: spin 6s linear infinite; animation-play-state: paused; }
    [data-widget="journey"] .g3.on .ring-spin, [data-widget="journey"] .g3.done .ring-spin { animation-play-state: running; }
    [data-widget="journey"] .jstep rect, [data-widget="journey"] .jstep text { transition: all .5s; }
    [data-widget="journey"] .jstep.on rect { fill: #fff; stroke: #fff; }
    [data-widget="journey"] .jstep.on text { fill: #000; }
    [data-widget="journey"] .atp-big { filter: drop-shadow(0 0 18px #ffd60a88); }
    [data-widget="journey"] [data-tip] { cursor: help; }`;
  el.appendChild(css);

  const layer = svg.querySelector('.p-layer'), hl = svg.querySelector('.h-layer');
  const P = id => svg.getElementById(id);
  const ring = h('path', { d: 'M1150 205 A125 125 0 1 1 1149.9 205', fill: 'none' }, svg.querySelector('defs'));
  const flows = {
    f1: new Flow(layer, P('jp1'), { color: '#30d158', rate: 1.4, speed: 150 }),
    f2: new Flow(layer, h('path', { d: 'M300 330 H 742' }, svg.querySelector('defs')), { color: '#30d158', rate: 1.4, speed: 240 }),
    f3: new Flow(layer, h('path', { d: 'M978 330 H 1025' }, svg.querySelector('defs')), { color: '#64d2ff', rate: 1.4, speed: 120 }),
    ring: new Flow(layer, ring, { color: '#ff9f0a', rate: 1.2, speed: 260, r: 6, fade: true }),
    e1: new Flow(layer, P('jp4'), { color: '#ffe45c', rate: 2.2, speed: 380, r: 6 }),
    e2: new Flow(layer, P('jp5'), { color: '#ffe45c', rate: 2.2, speed: 220, r: 6 }),
    atp: new Flow(layer, P('jp6'), { color: '#ffd60a', rate: 1.6, speed: 140, r: 9 }),
  };
  // protons pumped outward at I, III, IV
  const pumps = [170, 330, 410].map(y => new Flow(hl, h('path', { d: `M1606 ${y} H 1664` }, svg.querySelector('defs')), { color: '#ff453a', rate: 1.6, speed: 70, r: 5, halo: 2 }));

  const groups = [...svg.querySelectorAll('.jg')];
  const pills = [...svg.querySelectorAll('.jstep')];
  const tick = ticker(dt => {
    Object.values(flows).forEach(f => f.update(dt));
    pumps.forEach(f => f.update(dt));
  });

  return {
    enter() { tick.start(); },
    leave() { tick.stop(); },
    step(s) {
      groups.forEach((g, i) => { g.classList.toggle('on', s === i + 1 || (s === 0 && false)); g.classList.toggle('done', s > i + 1); });
      if (s === 0) groups[0].classList.add('done');
      pills.forEach((p, i) => p.classList.toggle('on', s === i + 1));
      flows.f1.on = s >= 1; flows.f2.on = s >= 2; flows.f3.on = s >= 3; flows.ring.on = s >= 3;
      flows.e1.on = flows.e2.on = flows.atp.on = s >= 4;
      pumps.forEach(f => { f.on = s >= 4; });
    },
  };
});
