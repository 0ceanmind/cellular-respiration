// Chapter 3 widgets.
import { register } from './registry.js';
import { mount, ticker, Flow, h } from './svg.js';
import { pill, chip } from './journey.js';

/* ─────────────── four terms ─────────────── */
register('definitions', (el) => {
  const cards = [
    { t: 'Phosphorylation', g: 'ADP + P<sub>i</sub> → ATP', tip: 'def-phos', c: '#ffd60a', svg: `
      <circle class="d1a" cx="70" cy="85" r="30" fill="#ff9f0a"/><text class="d1a" x="70" y="94" text-anchor="middle" font-size="22" font-weight="800" fill="#000">ADP</text>
      <circle class="d1b" cx="160" cy="85" r="18" fill="#64d2ff"/><text class="d1b" x="160" y="93" text-anchor="middle" font-size="20" font-weight="800" fill="#000">P</text>
      <g class="d1c"><circle cx="230" cy="85" r="36" fill="#ffd60a"/><text x="230" y="94" text-anchor="middle" font-size="24" font-weight="800" fill="#000">ATP</text></g>` },
    { t: 'Oxidation · Reduction', g: 'Lose e<sup>−</sup> · gain e<sup>−</sup>', tip: 'def-redox', c: '#5ac8fa', svg: `
      <rect x="20" y="55" width="90" height="60" rx="18" fill="rgba(255,255,255,.08)" stroke="#ffffff40"/><text x="65" y="140" text-anchor="middle" font-size="20" font-weight="650" fill="#ff9f0a">oxidized</text>
      <rect x="190" y="55" width="90" height="60" rx="18" fill="rgba(255,255,255,.08)" stroke="#ffffff40"/><text x="235" y="140" text-anchor="middle" font-size="20" font-weight="650" fill="#5ac8fa">reduced</text>
      <path id="d2p" d="M70 85 C 120 20, 180 20, 235 85" fill="none" stroke="#ffe45c55" stroke-dasharray="4 7" stroke-width="2"/>
      <circle r="11" fill="#ffe45c"><animateMotion dur="2s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".5 0 .5 1"><mpath href="#d2p"/></animateMotion></circle>` },
    { t: 'Oxidative phosphorylation', g: 'e<sup>−</sup> transport + ATP synthesis, <b>coupled</b>', tip: 'def-oxphos', c: '#7d7aff', svg: `
      <g class="gear g1" style="transform-origin:110px 85px">${gear(110, 85, 46, '#7d7aff')}</g>
      <g class="gear g2" style="transform-origin:190px 85px">${gear(190, 85, 46, '#ffd60a')}</g>
      <text x="110" y="93" text-anchor="middle" font-size="24" font-weight="800" fill="#000">e⁻</text>
      <text x="190" y="93" text-anchor="middle" font-size="20" font-weight="800" fill="#000">ATP</text>` },
    { t: 'Substrate-level phosphorylation', g: 'ATP <b>without</b> ETC or O<sub>2</sub>', tip: 'def-slp', c: '#ff9f0a', svg: `
      <rect x="20" y="60" width="110" height="50" rx="16" fill="rgba(255,255,255,.08)" stroke="#ffffff40"/><text x="75" y="93" text-anchor="middle" font-size="20" font-weight="650" fill="#d2d2d7">substrate</text>
      <circle class="d4p" cx="140" cy="85" r="16" fill="#64d2ff"/><text class="d4p" x="140" y="92" text-anchor="middle" font-size="18" font-weight="800" fill="#000">P</text>
      <circle cx="240" cy="85" r="32" fill="#ff9f0a"/><text x="240" y="93" text-anchor="middle" font-size="20" font-weight="800" fill="#000">ADP</text>` },
  ];
  el.innerHTML = `<div class="defs">${cards.map((c, i) => `
    <article class="def" data-build="${i + 1}" data-tip="${c.tip}" style="--dc:${c.c}">
      <svg viewBox="0 0 300 170">${c.svg}</svg>
      <h3>${c.t}</h3>
      <p>${c.g}</p>
    </article>`).join('')}</div>`;
  return {};
});
function gear(cx, cy, r, color) {
  let d = '';
  const n = 10;
  for (let i = 0; i < n * 2; i++) {
    const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r * 0.78 : r;
    const a2 = (i + 1) / (n * 2) * Math.PI * 2;
    d += `${i ? 'L' : 'M'}${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)} L${cx + rr * Math.cos(a2)} ${cy + rr * Math.sin(a2)} `;
  }
  return `<path d="${d}Z" fill="${color}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${color}"/>`;
}

/* ─────────────── oxidative phosphorylation flow ─────────────── */
register('oxflow', (el) => {
  const svg = mount(el, 1680, 720, `
    <defs><marker id="ox-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff77"/></marker>
      <linearGradient id="ox-tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a42"/><stop offset=".5" stop-color="#202026"/><stop offset="1" stop-color="#2c2c33"/></linearGradient></defs>
    <g class="ox o1">
      <text x="400" y="56" text-anchor="middle" font-size="40" font-weight="750" fill="#fff">Glucose · Fatty acids · Amino acids</text>
      <path d="M400 80 V 120 M400 120 H 260 V 170 M400 120 H 540 V 170" stroke="#ff453a" stroke-width="3" stroke-dasharray="8 8" fill="none" marker-end="url(#ox-ar)"/>
      <text x="420" y="110" font-size="26" font-weight="650" fill="#d070ff">Catabolism</text>
      <g data-tip="nadhTok"><rect x="160" y="182" width="200" height="66" rx="18" fill="#1f6b6b"/><text x="260" y="225" text-anchor="middle" font-size="30" font-weight="750" fill="#fff">NADH+H⁺</text></g>
      <g data-tip="fadhTok"><rect x="440" y="182" width="200" height="66" rx="18" fill="#1a2a5e"/><text x="540" y="225" text-anchor="middle" font-size="30" font-weight="750" fill="#fff">FADH₂</text></g>
      <text x="664" y="224" font-size="26" font-weight="650" fill="#98989f">← reduced coenzymes</text>
    </g>
    <g class="ox o2">
      <path d="M260 250 V 360 M540 250 V 360" stroke="#ff453a" stroke-width="3" stroke-dasharray="8 8" fill="none" marker-end="url(#ox-ar)"/>
      ${[260, 540].map(x => `<g transform="translate(${x + 54} 306)"><ellipse rx="44" ry="30" fill="#ffe45c"/><text y="10" text-anchor="middle" font-size="28" font-weight="800" fill="#000">2e⁻</text></g>`).join('')}
      <rect x="150" y="380" width="1030" height="130" rx="65" fill="url(#ox-tube)" stroke="#ffffff22" stroke-width="2"/>
      ${[['#30d158', 300], ['#7d3bd1', 520], ['#1e7be0', 740], ['#16827a', 960]].map(([c, x], i) => `<g data-tip="C${i + 1}"><polygon points="${oct(x, 445, 52)}" fill="${c}"/><text x="${x}" y="455" text-anchor="middle" font-size="28" font-weight="800" fill="#fff">${['I', 'II', 'III', 'IV'][i]}</text></g>`).join('')}
      <path id="ox-e" d="M260 380 C 330 330, 360 470, 430 440 S 520 340, 600 420 S 720 470, 800 430 S 920 360, 1000 440 S 1100 380, 1150 330" fill="none" stroke="#ff453a" stroke-width="3" stroke-dasharray="8 8"/>
      <text x="665" y="560" text-anchor="middle" font-size="30" font-weight="700" fill="#ff6961">Electron transport chain <tspan fill="#64d2ff" font-weight="650">· respiratory chain</tspan></text>
    </g>
    <g class="ox o3" data-tip="o2Tok">
      <path d="M1150 330 C 1160 280, 1170 260, 1190 240" stroke="#d070ff" stroke-width="3" fill="none" marker-end="url(#ox-ar)"/>
      <text x="1250" y="236" text-anchor="middle" font-size="36" font-weight="750" fill="#64d2ff">½O₂ + 2H⁺</text>
      <path d="M1250 200 V 140" stroke="#ff453a" stroke-width="3" stroke-dasharray="6 6" marker-end="url(#ox-ar)"/>
      <rect x="1180" y="66" width="140" height="64" rx="12" fill="#1e7be0"/><text x="1250" y="110" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">H₂O</text>
    </g>
    <g class="ox o4">
      <text x="1330" y="380" font-size="34" font-weight="700" fill="#fff">ADP + Pᵢ</text>
      <path d="M1360 410 C 1400 500, 1520 500, 1560 390" stroke="#5ac8fa" stroke-width="4" fill="none" marker-end="url(#ox-ar)"/>
      <g class="star" style="transform-origin:1560px 330px"><polygon points="${star(1560, 330, 74, 32)}" fill="#ff453a"/><text x="1560" y="342" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">ATP</text></g>
      <text x="1460" y="560" text-anchor="middle" font-size="32" font-weight="700" fill="#d070ff">Phosphorylation</text>
      <path d="M150 600 Q 150 630 860 630 Q 1600 630 1600 600" stroke="#5ac8fa" stroke-width="3" fill="none"/>
      <rect x="250" y="650" width="1220" height="66" rx="20" fill="rgba(125,122,255,.12)" stroke="#7d7aff66"/>
      <text x="860" y="694" text-anchor="middle" font-size="32" font-weight="700" fill="#e5e5ea">Coupling of electron transport with ATP synthesis = <tspan fill="#bf8cff">oxidative phosphorylation</tspan></text>
    </g>
    <g class="ox-p"></g>
  `);
  const css = document.createElement('style');
  css.textContent = `[data-widget="oxflow"] .ox { opacity: 0; transition: opacity .9s; } [data-widget="oxflow"] .ox.on, [data-widget="oxflow"] .o1 { opacity: 1; }
    [data-widget="oxflow"] .star { animation: beat 2s ease-in-out infinite; } [data-widget="oxflow"] [data-tip] { cursor: help; }`;
  el.appendChild(css);
  const f = new Flow(svg.querySelector('.ox-p'), svg.getElementById('ox-e'), { color: '#ffe45c', rate: 2.2, speed: 380, r: 9 });
  const tk = ticker(dt => f.update(dt));
  return {
    enter() { tk.start(); }, leave() { tk.stop(); },
    step(s) { ['o2', 'o3', 'o4'].forEach((c, i) => svg.querySelector('.' + c).classList.toggle('on', s >= i + 1)); f.on = s >= 1; },
  };
});
function oct(cx, cy, r) { return Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(' '); }
function star(cx, cy, R, r) { return Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(' '); }

/* ─────────────── ATP yield per NADH / FADH2 ─────────────── */
register('yield', (el) => {
  const row = (name, color, tip, cells, total, atp, b) => `
    <div class="yrow" data-build="${b}">
      <div class="ytag" style="--yc:${color}" data-tip="${tip}">${name}</div>
      ${cells.map(([cx, n, c]) => `<div class="ycell ${n ? '' : 'skip'}" style="--cc:${c}" data-tip="${cx === 'I' ? 'C1' : cx === 'II' ? 'C2' : cx === 'III' ? 'C3' : 'C4'}">
        <span class="ycx">${cx}</span>
        <span class="yh">${n ? Array.from({ length: n }, () => '<i></i>').join('') : '—'}</span>
        <span class="yn">${n ? n + ' H⁺' : 'no pump'}</span></div>`).join('')}
      <div class="ysum"><span class="yeq">${total} H⁺ ÷ 4 =</span><b>${atp}</b><span class="yu">ATP</span></div>
    </div>`;
  el.innerHTML = `
  <div class="yield">
    <div class="yhead"><span></span><span>Complex I</span><span>Complex II</span><span>Complex III</span><span>Complex IV</span><span>Net ATP</span></div>
    ${row('NADH + H⁺', '#30d158', 'nadhTok', [['I', 4, '#7d7aff'], ['II', 0, '#d070ff'], ['III', 4, '#2d9bff'], ['IV', 2, '#2ad4b4']], 10, '2.5', 1)}
    ${row('FADH₂', '#ff6fae', 'fadhTok', [['I', 0, '#7d7aff'], ['II', 0, '#d070ff'], ['III', 4, '#2d9bff'], ['IV', 2, '#2ad4b4']], 6, '1.5', 2)}
    <div class="yfoot" data-build="3">
      <span class="yrule" data-tip="rule4h">4 H<sup>+</sup> = 1 ATP</span>
      <span class="ynote">Older texts (incl. older Lippincott editions): NADH = 3 ATP · FADH₂ = 2 ATP</span>
    </div>
  </div>`;
  return {};
});

/* ─────────────── three inhibitor classes ─────────────── */
register('classes', (el) => {
  const cards = [
    { n: 1, t: 'ETC inhibitors', s: 'Block electron flow at a complex', tip: 'cls-1', c: '#ff453a', svg: `
      <rect x="20" y="70" width="260" height="30" rx="15" fill="#ffffff14"/>
      <circle r="9" fill="#ffe45c"><animate attributeName="cx" values="30;130" dur="1.2s" repeatCount="indefinite"/><animate attributeName="cy" values="85;85" dur="1.2s" repeatCount="indefinite"/></circle>
      <circle cx="122" cy="85" r="9" fill="#ffe45c"/><circle cx="104" cy="85" r="9" fill="#ffe45c" opacity=".8"/>
      <rect x="140" y="50" width="20" height="70" rx="6" fill="#ff453a"/>` },
    { n: 2, t: 'ATP synthase inhibitors', s: 'Plug F<sub>o</sub> — no phosphorylation', tip: 'cls-2', c: '#ff9f0a', svg: `
      <g style="transform-origin:150px 85px; animation: spin 6s linear infinite; animation-play-state: paused">
        ${Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<rect x="${150 + Math.cos(a) * 46 - 9}" y="${85 + Math.sin(a) * 46 - 22}" width="18" height="44" rx="9" fill="#ff9f0a" transform="rotate(${a * 180 / Math.PI} ${150 + Math.cos(a) * 46} ${85 + Math.sin(a) * 46})"/>`; }).join('')}
      </g>
      <circle cx="205" cy="60" r="20" fill="#ff453a"/>` },
    { n: 3, t: 'Uncouplers', s: 'Leak H<sup>+</sup> → heat, not ATP', tip: 'cls-3', c: '#ff7a1a', svg: `
      <rect x="20" y="78" width="260" height="16" rx="8" fill="#ffb08a55"/>
      <rect x="140" y="70" width="24" height="32" rx="8" fill="#ff7a1a"/>
      ${[0, 0.5, 1].map(d => `<circle cx="152" r="8" fill="#ff453a"><animate attributeName="cy" values="30;140" dur="1.5s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.5s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')}
      <path d="M200 140 C 190 120, 215 110, 205 90 M225 140 C 215 120, 240 110, 230 90" stroke="#ff9a4a" stroke-width="4" fill="none" stroke-linecap="round"><animate attributeName="opacity" values=".3;1;.3" dur="1.4s" repeatCount="indefinite"/></path>` },
  ];
  el.innerHTML = `<div class="classes">${cards.map(c => `
    <article class="cls" data-build="${c.n}" data-tip="${c.tip}" style="--kc:${c.c}">
      <span class="kn">${c.n}</span>
      <svg viewBox="0 0 300 170">${c.svg}</svg>
      <h3>${c.t}</h3><p>${c.s}</p>
    </article>`).join('')}</div>`;
  return {};
});

/* ─────────────── site-specific inhibitors on the carrier chain ─────────────── */
register('chain', (el) => {
  const carriers = ['NADH', 'FMN', 'Fe-S', 'CoQ', 'cyt b', 'cyt c₁', 'cyt c', 'cyt aa₃', 'O₂'];
  const xs = carriers.map((_, i) => 110 + i * 183);
  const sites = { C1: [1.5, 'Complex I', '#7d7aff', [['Rotenone', 'rotenone'], ['Amobarbital', 'amobarbital'], ['Piericidin', 'piericidin']]],
    C3: [4.5, 'Complex III', '#2d9bff', [['Antimycin A', 'antimycin'], ['Dimercaprol (BAL)', 'bal']]],
    C4: [7.5, 'Complex IV', '#2ad4b4', [['Cyanide', 'cyanide'], ['CO', 'co'], ['H₂S', 'h2s']]] };
  const svg = mount(el, 1680, 330, `
    ${[[1, 2, '#7d7aff', 'I'], [4, 5, '#2d9bff', 'III'], [7, 7, '#2ad4b4', 'IV']].map(([a, b, c, n]) => `<rect x="${xs[a] - 76}" y="56" width="${xs[b] - xs[a] + 152}" height="150" rx="40" fill="${c}14" stroke="${c}66" stroke-width="2"/><text x="${(xs[a] + xs[b]) / 2}" y="246" text-anchor="middle" font-size="26" font-weight="700" fill="${c}">Complex ${n}</text>`).join('')}
    <path id="ch-line" d="M${xs[0]} 130 H ${xs[8]}" stroke="#ffffff22" stroke-width="6" fill="none"/>
    <g class="ch-p"></g>
    ${carriers.map((c, i) => `<g class="car" data-i="${i}" transform="translate(${xs[i]} 130)"><circle r="56" fill="#1c1c20" stroke="#ffffff55" stroke-width="3"/><text y="10" text-anchor="middle" font-size="${c.length > 5 ? 25 : 28}" font-weight="700" fill="#f5f5f7">${c}</text></g>`).join('')}
    ${Object.entries(sites).map(([k, [pos]]) => `<g class="blk" data-site="${k}" opacity="0" transform="translate(${110 + pos * 183} 130)"><rect x="-12" y="-74" width="24" height="148" rx="8" fill="#ff453a"/><circle r="30" fill="#ff453a33"/></g>`).join('')}
    <g class="cross" opacity="0"><text x="${xs[0]}" y="300" font-size="24" font-weight="650" fill="#ffd60a">● reduced (before block)</text><text x="${xs[5]}" y="300" font-size="24" font-weight="650" fill="#6e6e73" data-tip="crossover">○ oxidized (after block)</text></g>
  `);
  const panel = document.createElement('div');
  panel.className = 'chpanel';
  panel.innerHTML = Object.entries(sites).map(([k, [, n, c, list]]) => `
    <div class="chcol" style="--sc:${c}"><span class="chh">Inhibitors of ${n}</span>
      ${list.map(([t, tip]) => `<button class="inh" data-site="${k}" data-tip="${tip}">${t}</button>`).join('')}</div>`).join('') + '<button class="btn ghost chclear">Clear</button>';
  el.appendChild(panel);
  const flow = new Flow(svg.querySelector('.ch-p'), svg.getElementById('ch-line'), { color: '#ffe45c', rate: 2.4, speed: 300, r: 10 });
  const tk = ticker(dt => flow.update(dt));
  let site = null;
  const set = (s, btn) => {
    site = s;
    panel.querySelectorAll('.inh').forEach(b => b.classList.toggle('on', b === btn));
    svg.querySelectorAll('.blk').forEach(b => gsap.to(b, { attr: { opacity: b.dataset.site === s ? 1 : 0 }, duration: 0.4 }));
    const pos = s ? sites[s][0] : null;
    flow.release();
    flow.stopAt = s ? (pos * 183 - 16) / flow.len : null;
    svg.querySelectorAll('.car').forEach(c => {
      const i = +c.dataset.i, circ = c.querySelector('circle');
      const red = s && i < pos, ox = s && i > pos;
      circ.setAttribute('fill', red ? '#ffd60a' : '#1c1c20');
      circ.setAttribute('stroke', red ? '#ffd60a' : ox ? '#3a3a3c' : '#ffffff55');
      c.querySelector('text').setAttribute('fill', red ? '#000' : ox ? '#6e6e73' : '#f5f5f7');
    });
    gsap.to(svg.querySelector('.cross'), { attr: { opacity: s ? 1 : 0 }, duration: 0.5 });
  };
  panel.addEventListener('click', e => {
    const b = e.target.closest('.inh'); if (b) set(b.dataset.site, b);
    if (e.target.closest('.chclear')) set(null, null);
  });
  return {
    enter() { tk.start(); flow.on = true; set(null, null); },
    leave() { tk.stop(); },
    step(s) {
      const pick = [null, ['C1', 'rotenone'], ['C3', 'antimycin'], ['C4', 'cyanide']][s];
      if (pick) set(pick[0], panel.querySelector(`.inh[data-tip="${pick[1]}"]`)); else set(null, null);
    },
  };
});

/* ─────────────── toxin lab (drives the 3D ETC simulation) ─────────────── */
register('toxinlab', (el, app) => {
  const agents = [['none', 'No poison', ''], ['rotenone', 'Rotenone', 'Complex I'], ['antimycin', 'Antimycin A', 'Complex III'], ['cyanide', 'Cyanide', 'Complex IV'], ['oligomycin', 'Oligomycin', 'ATP synthase'], ['dnp', '2,4-DNP', 'Uncoupler']];
  el.innerHTML = `
  <div class="lab">
    <div class="agents">${agents.map(([k, n, s], i) => `<button class="ag ${i ? '' : 'on'}" data-k="${k}" ${k !== 'none' ? `data-tip="${k}"` : ''}><b>${n}</b><span>${s}</span></button>`).join('')}</div>
    <div class="gauges">
      ${[['o2', 'O₂ consumption', '#64d2ff'], ['grad', 'H⁺ gradient', '#ff453a'], ['atp', 'ATP synthesis', '#ffd60a'], ['heat', 'Heat', '#ff7a1a']].map(([k, n, c]) => `
        <div class="gauge" data-k="${k}" style="--gc:${c}"><span class="gn">${n}</span><div class="gt"><i></i></div><span class="gv">—</span></div>`).join('')}
    </div>
    <p class="labnote">Live simulation · values relative to a healthy cell</p>
  </div>`;
  const gs = [...el.querySelectorAll('.gauge')];
  const word = v => v < 0.12 ? 'none' : v < 0.45 ? 'low' : v < 0.85 ? 'normal' : v < 1.25 ? 'high' : 'very high';
  const tk = ticker(() => {
    const st = app.scenes.activeName === 'etc' ? app.scenes.active?.stats : null;
    if (!st) return;
    gs.forEach(g => {
      const v = st[g.dataset.k] || 0;
      g.querySelector('i').style.width = Math.min(100, v / 1.5 * 100) + '%';
      g.querySelector('.gv').textContent = g.dataset.k === 'grad' ? (v < 0.15 ? 'collapsed' : v > 0.85 ? 'maximal' : v > 0.3 ? 'normal' : 'low') : word(v);
    });
  });
  el.addEventListener('click', e => {
    const b = e.target.closest('.ag'); if (!b) return;
    el.querySelectorAll('.ag').forEach(x => x.classList.toggle('on', x === b));
    app.scenes.active?.control?.('agent', b.dataset.k);
  });
  return {
    enter() { tk.start(); el.querySelectorAll('.ag').forEach((x, i) => x.classList.toggle('on', i === 0)); },
    leave() { tk.stop(); },
  };
});
