// Chapter 1 (glycolysis) widgets.
import { register } from './registry.js';
import { mount, ticker, Flow, h, countTo } from './svg.js';
import { pill, chip } from './journey.js';
import { GSTEPS, gtally } from '../data/glyco.js';

const GLU = '#5ac8fa', NA = '#30d158', KK = '#bf5af2', ATPC = '#ffd60a', NADHC = '#30d158';

/* ─────────────── caption + tally beside the 3D line ─────────────── */
register('glycaption', (el) => {
  el.innerHTML = `
  <div class="tcap gcap">
    <div class="tcap-card">
      <div class="tcap-top"><span class="tnum">·</span><div><b class="te">Seven steps</b><span class="tt">Press → to run the line</span></div></div>
      <p class="tr"></p>
    </div>
    <div class="tally g">
      <div class="tl" style="--pc:#ff9f0a" data-tip="g-invest"><span class="tv" data-k="used">0</span><span class="tk">ATP used</span></div>
      <div class="tl" style="--pc:#ffd60a" data-tip="g-payoff"><span class="tv" data-k="made">0</span><span class="tk">ATP made</span></div>
      <div class="tl" style="--pc:#30d158" data-tip="nad-recycle"><span class="tv" data-k="nadh">0</span><span class="tk">NADH</span></div>
      <div class="tl net" style="--pc:#fff" data-tip="g-net"><span class="tv" data-k="net">0</span><span class="tk">Net ATP</span></div>
    </div>
  </div>`;
  const card = el.querySelector('.tcap-card');
  const te = el.querySelector('.te'), tt = el.querySelector('.tt'), tn = el.querySelector('.tnum'), tr = el.querySelector('.tr');
  return {
    step(s) {
      const t = gtally(s);
      el.querySelectorAll('.tv').forEach(v => {
        const nv = v.dataset.k === 'used' ? -t.used : t[v.dataset.k];
        if (+v.textContent !== nv) { countTo(v, nv, 0.6); const tl = v.parentElement; tl.classList.add('bump'); setTimeout(() => tl.classList.remove('bump'), 700); }
      });
      const st = GSTEPS[s];
      card.classList.toggle('reg', !!(st && st.ctrl));
      if (s === 0) { tn.textContent = '·'; te.textContent = 'Seven steps'; tt.textContent = 'Press → to run the line'; tr.innerHTML = ''; }
      else if (s >= 8) { tn.textContent = '✓'; te.textContent = 'Glucose → 2 pyruvate'; tt.textContent = 'Investment 2 ATP · payoff 4 ATP'; tr.innerHTML = 'Net <span>2 ATP + 2 NADH</span>'; }
      else { tn.textContent = s; te.textContent = st.e; tt.textContent = st.type; tr.innerHTML = `${st.what}${st.poison ? `<span class="poison">☠ ${st.poison}</span>` : ''}`; }
      gsap.fromTo(card, { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    },
  };
});

/* ─────────────── glucose transport: gut → blood → tissues ─────────────── */
register('gtransport', (el) => {
  const doors = [
    ['GLUT-1', 150, 'Most tissues · RBCs', 'glut1'],
    ['GLUT-2', 290, 'Liver · pancreas', 'glut2'],
    ['GLUT-3', 430, 'Brain · neurons', 'glut3'],
    ['GLUT-4', 570, 'Muscle · adipose', 'glut4'],
  ];
  const door = (x, y, t, tip, c = '#c7cad2', w = 120) => `<g class="door" data-tip="${tip}" transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-26" width="${w}" height="52" rx="14" fill="#2a2a30" stroke="${c}" stroke-width="2.5"/><text y="9" text-anchor="middle" font-size="24" font-weight="750" fill="#f5f5f7">${t}</text></g>`;
  const svg = mount(el, 1680, 700, `
    <defs><marker id="gt-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff66"/></marker></defs>
    <rect x="10" y="60" width="300" height="600" rx="40" fill="rgba(255,214,10,.07)" stroke="rgba(255,214,10,.25)"/>
    <rect x="340" y="60" width="340" height="600" rx="40" fill="rgba(255,159,10,.06)" stroke="rgba(255,159,10,.22)"/>
    <rect x="710" y="60" width="380" height="600" rx="40" fill="rgba(255,69,58,.09)" stroke="rgba(255,69,58,.3)"/>
    <rect x="1170" y="60" width="500" height="600" rx="40" fill="rgba(48,209,88,.05)" stroke="rgba(48,209,88,.2)"/>
    <text x="160" y="106" text-anchor="middle" font-size="27" font-weight="650" fill="#ffd60a">Intestinal lumen</text>
    <text x="510" y="106" text-anchor="middle" font-size="27" font-weight="650" fill="#ffb340">Enterocyte</text>
    <text x="900" y="106" text-anchor="middle" font-size="27" font-weight="650" fill="#ff6961">Blood</text>
    <text x="1420" y="106" text-anchor="middle" font-size="27" font-weight="650" fill="#30d158">Tissues</text>
    <path d="M325 130 ${Array.from({ length: 26 }, (_, i) => `L ${i % 2 ? 337 : 325} ${130 + i * 20}`).join(' ')}" fill="none" stroke="#ffffff55" stroke-width="2.5"/>
    <g class="gx s1">
      <path id="gt-sg" d="M150 470 C 230 470, 280 420, 330 420 S 450 380, 500 330" fill="none"/>
      <path id="gt-sn" d="M150 520 C 230 520, 280 440, 330 440 S 450 470, 500 470" fill="none"/>
      ${door(330, 430, 'SGLT-1', 'sglt1', '#ffd60a', 128)}
      <text x="330" y="40" text-anchor="middle" font-size="24" font-weight="650" fill="#d2d2d7">Secondary active · symport</text>
    </g>
    <g class="gx s2">
      <path id="gt-na" d="M520 520 C 600 520, 650 560, 700 560 S 780 600, 840 600" fill="none"/>
      <path id="gt-k" d="M840 510 C 780 510, 740 540, 700 540 S 610 500, 560 490" fill="none"/>
      ${door(700, 550, 'Na⁺/K⁺', 'nak', '#bf5af2', 130)}
    </g>
    <g class="gx s3">
      <path id="gt-g2" d="M500 330 C 560 300, 640 270, 700 270 S 800 300, 880 330" fill="none"/>
      ${door(700, 270, 'GLUT-2', 'glut2-ent', '#5ac8fa', 128)}
    </g>
    <g class="gx s4">
      <text x="1130" y="40" text-anchor="middle" font-size="24" font-weight="650" fill="#d2d2d7">Facilitated diffusion · uniport</text>
      ${doors.map(([t, y, site, tip], i) => `
        <path id="gt-t${i}" d="M900 360 C 980 ${360 + (y - 360) * 0.6}, 1060 ${y}, 1130 ${y} S 1240 ${y}, 1300 ${y}" fill="none"/>
        ${door(1130, y, t, tip, i === 3 ? '#ff9f0a' : '#5ac8fa', 124)}
        <text x="1330" y="${y + 9}" font-size="27" font-weight="650" fill="#f5f5f7" data-tip="${tip}">${site}</text>`).join('')}
      <g class="lock" transform="translate(1210 540)"><rect x="-16" y="-6" width="32" height="26" rx="6" fill="#ff9f0a"/><path class="shackle" d="M-10 -6 V -16 A10 10 0 0 1 10 -16 V -6" fill="none" stroke="#ff9f0a" stroke-width="5"/></g>
    </g>
    <g class="gt-p"></g>
  `);
  const ins = document.createElement('div');
  ins.className = 'seg gt-ins';
  ins.innerHTML = '<button class="on" data-val="0">Fasting</button><button data-val="1" data-tip="insulin">+ Insulin</button>';
  el.appendChild(ins);
  const legend = document.createElement('div');
  legend.className = 'gt-leg';
  legend.innerHTML = `<span style="--c:${GLU}">Glucose</span><span style="--c:${NA}">Na⁺</span><span style="--c:${KK}">K⁺</span>`;
  el.appendChild(legend);
  const css = document.createElement('style');
  css.textContent = `[data-widget="gtransport"] .gx { opacity: .12; transition: opacity .8s; } [data-widget="gtransport"] .gx.on { opacity: 1; }
    [data-widget="gtransport"] .shackle { transition: transform .6s cubic-bezier(.22,.75,.12,1); transform-origin: 10px -6px; }
    [data-widget="gtransport"] .lock.open .shackle { transform: rotate(35deg) translate(4px, -6px); }
    [data-widget="gtransport"] .lock { transition: opacity .6s; } [data-widget="gtransport"] [data-tip] { cursor: help; }`;
  el.appendChild(css);
  const L = svg.querySelector('.gt-p'), P = id => svg.getElementById(id);
  const f = {
    sg: new Flow(L, P('gt-sg'), { color: GLU, rate: 1.2, speed: 170, r: 9 }),
    sn: new Flow(L, P('gt-sn'), { color: NA, rate: 2.4, speed: 170, r: 7 }),
    na: new Flow(L, P('gt-na'), { color: NA, rate: 1.8, speed: 150, r: 7 }),
    k: new Flow(L, P('gt-k'), { color: KK, rate: 1.2, speed: 150, r: 7 }),
    g2: new Flow(L, P('gt-g2'), { color: GLU, rate: 1.4, speed: 190, r: 9 }),
    t: doors.map((_, i) => new Flow(L, P('gt-t' + i), { color: GLU, rate: 1.0, speed: 200, r: 9 })),
  };
  const all = () => [f.sg, f.sn, f.na, f.k, f.g2, ...f.t];
  const tk = ticker(dt => all().forEach(x => x.update(dt)));
  const lock = svg.querySelector('.lock');
  let insulin = false, step = 0;
  const apply = () => {
    svg.querySelectorAll('.gx').forEach((g, i) => g.classList.toggle('on', step >= i + 1 || step === 0 && false));
    f.sg.on = f.sn.on = step >= 1; f.na.on = f.k.on = step >= 2; f.g2.on = step >= 3;
    f.t.forEach((x, i) => { x.on = step >= 4 && (i < 3 || insulin); });
    lock.classList.toggle('open', insulin); lock.style.opacity = insulin ? 0.35 : 1;
    ins.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.val === '1') === insulin));
  };
  ins.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { insulin = b.dataset.val === '1'; apply(); } });
  return {
    enter() { tk.start(); insulin = false; }, leave() { tk.stop(); },
    step(s) { step = s; apply(); },
  };
});

/* ─────────────── GLUT vs SGLT ─────────────── */
register('glutsglt', (el) => {
  const mini = (kind) => `
    <svg viewBox="0 0 560 230">
      <rect x="0" y="100" width="560" height="30" fill="rgba(255,176,138,.25)"/>
      <rect x="250" y="88" width="60" height="54" rx="14" fill="#2a2a30" stroke="${kind === 'g' ? '#5ac8fa' : '#ffd60a'}" stroke-width="3"/>
      <text x="40" y="60" font-size="22" font-weight="650" fill="#98989f">${kind === 'g' ? 'High glucose' : 'Low glucose · high Na⁺'}</text>
      <text x="40" y="200" font-size="22" font-weight="650" fill="#98989f">${kind === 'g' ? 'Low glucose' : 'High glucose · low Na⁺'}</text>
      ${kind === 'g'
        ? [0, 0.7, 1.4].map(d => `<circle cx="280" r="11" fill="${GLU}"><animate attributeName="cy" values="40;200" dur="2.1s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="2.1s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')
          + `<circle cx="296" r="9" fill="${GLU}" opacity=".5"><animate attributeName="cy" values="200;40" dur="3.2s" begin="1s" repeatCount="indefinite"/></circle>`
        : [0, 1.1].map(d => `<circle cx="270" r="11" fill="${GLU}"><animate attributeName="cy" values="200;40" dur="2.2s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="2.2s" begin="${d}s" repeatCount="indefinite"/></circle>
             <circle cx="292" r="8" fill="${NA}"><animate attributeName="cy" values="40;200" dur="2.2s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="2.2s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')}
    </svg>`;
  el.innerHTML = `
  <div class="gs">
    <article class="gsc" data-build="1" data-tip="glut-card" style="--gc:#5ac8fa">
      ${mini('g')}
      <h3>GLUT</h3>
      <ul><li><b>Facilitated</b> diffusion</li><li><b>Down</b> the gradient · no energy</li><li>Bidirectional · isoforms differ in affinity</li></ul>
    </article>
    <article class="gsc" data-build="2" data-tip="sglt-card" style="--gc:#ffd60a">
      ${mini('s')}
      <h3>SGLT</h3>
      <ul><li><b>Active</b> transport (secondary)</li><li><b>Against</b> the gradient · Na⁺ pays</li><li>SGLT1 gut · <span data-tip="sglt2">SGLT2 kidney</span></li></ul>
    </article>
  </div>`;
  return {};
});

/* ─────────────── GLUT family + live saturation chart ─────────────── */
const KM = { 'GLUT-3': 1.4, 'GLUT-1': 3, 'GLUT-4': 5, 'GLUT-2': 17 };   // illustrative, ranking as taught
register('gluts', (el) => {
  const rows = [
    ['GLUT-1', 'Basal uptake · almost all tissues', 'normal glucose', 'Low', '#5ac8fa', 'glut1'],
    ['GLUT-2', 'Liver · pancreas sense', 'high glucose', 'Highest', '#ff9f0a', 'glut2'],
    ['GLUT-3', 'Brain · neurons, even at', 'low glucose', 'Lowest', '#bf5af2', 'glut3'],
    ['GLUT-4', 'Insulin-dependent ·', 'muscle & adipose', 'Medium', '#30d158', 'glut4'],
  ];
  el.innerHTML = `
  <div class="gl">
    <div class="glrows">
      ${rows.map(([n, a, b, km, c, tip], i) => `
        <div class="glr" data-build="${i + 1}" data-tip="${tip}" style="--rc:${c}">
          <span class="gln">${n}</span>
          <span class="glf">${a} <b>${b}</b></span>
          <span class="glk">K<sub>m</sub> · ${km}</span>
          <div class="glbar"><i></i></div>
        </div>`).join('')}
    </div>
    <div class="glchart">
      <svg viewBox="0 0 720 560" class="glsvg">
        <g transform="translate(70 30)">
          <rect x="0" y="0" width="620" height="440" fill="none" stroke="#ffffff22"/>
          ${[0, 0.25, 0.5, 0.75, 1].map(v => `<line x1="0" x2="620" y1="${440 - v * 440}" y2="${440 - v * 440}" stroke="#ffffff10"/><text x="-14" y="${448 - v * 440}" text-anchor="end" font-size="20" fill="#6e6e73">${v * 100}%</text>`).join('')}
          ${[0, 5, 10, 15, 20].map(v => `<text x="${v / 20 * 620}" y="474" text-anchor="middle" font-size="20" fill="#6e6e73">${v}</text>`).join('')}
          <text x="310" y="510" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Blood glucose (mM)</text>
          <text x="-56" y="220" transform="rotate(-90 -56 220)" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Transporter saturation</text>
          <rect class="norm" x="${3.9 / 20 * 620}" y="0" width="${(5.6 - 3.9) / 20 * 620}" height="440" fill="#30d158" opacity=".08"/>
          ${rows.map(([n, , , , c], i) => {
            const km = KM[n];
            const d = Array.from({ length: 101 }, (_, j) => { const g = j / 100 * 20; return `${j ? 'L' : 'M'}${g / 20 * 620} ${440 - g / (km + g) * 440}`; }).join(' ');
            return `<path class="glc" data-i="${i + 1}" d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
          }).join('')}
          <line class="gcur" x1="0" x2="0" y1="0" y2="440" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
        </g>
      </svg>
      <div class="glctl"><label>Blood glucose</label><input type="range" min="1" max="20" step="0.1" value="5" class="slider gsl"><span class="gval">5.0 mM</span></div>
      <p class="illus">Illustrative curves · K<sub>m</sub> ranking as taught: GLUT-3 &lt; GLUT-1 &lt; GLUT-4 &lt; GLUT-2</p>
    </div>
  </div>`;
  const sl = el.querySelector('.gsl'), gv = el.querySelector('.gval'), cur = el.querySelector('.gcur');
  const render = g => {
    gv.textContent = (+g).toFixed(1) + ' mM';
    sl.style.setProperty('--v', ((g - 1) / 19 * 100) + '%');
    cur.setAttribute('x1', g / 20 * 620); cur.setAttribute('x2', g / 20 * 620);
    el.querySelectorAll('.glr').forEach((r, i) => { const km = KM[rows[i][0]]; r.querySelector('i').style.width = (g / (km + g) * 100) + '%'; });
  };
  sl.addEventListener('input', () => render(+sl.value));
  const anim = to => { const o = { v: +sl.value }; gsap.to(o, { v: to, duration: 2, ease: 'power2.inOut', onUpdate: () => { sl.value = o.v; render(o.v); } }); };
  return {
    enter() { sl.value = 5; render(5); },
    step(s) {
      el.querySelectorAll('.glc').forEach(p => { p.style.opacity = +p.dataset.i <= s ? 1 : 0.08; });
      if (s === 3) anim(2.5);         // GLUT-3 still busy when glucose is low
      if (s === 4) anim(12);          // after a meal GLUT-2 rises
    },
  };
});

/* ─────────────── 7 enzymes: control points & poisons ─────────────── */
register('enzline', (el) => {
  const icons = ['⚡', '⚡', '✂', '⇄', '⚡', '💧', '⚡'];
  el.innerHTML = `
  <div class="enzl">
    ${GSTEPS.slice(1).map((st, i) => `
      <article class="ez7 ${st.ctrl ? 'ctrl' : ''} ${st.poison ? 'pois' : ''}" data-tip="${st.tip}">
        <span class="n">${i + 1}</span>
        <b>${st.short}</b>
        <span class="ty">${st.type.replace(' · SLP', '')}</span>
        ${st.ctrl ? '<span class="badge c">Control</span>' : ''}
        ${st.poison ? `<span class="badge p" data-tip="${st.poison === 'Arsenate' ? 'arsenate-mech' : 'fluoride'}">☠ ${st.poison}</span>` : ''}
      </article>`).join('')}
  </div>
  <div class="enzleg"><span class="lc">Control enzymes · irreversible steps 1, 2, 7</span><span class="lp">Poisons · arsenate (4) · fluoride (6)</span></div>`;
  const root = el.querySelector('.enzl');
  return { step(s) { root.dataset.mode = s === 1 ? 'ctrl' : s === 2 ? 'pois' : ''; } };
});

/* ─────────────── hexokinase vs glucokinase ─────────────── */
register('hkgk', (el) => {
  const rows = [
    ['Substrate', 'All hexoses', 'Glucose only'],
    ['Site', 'All tissues', 'Liver · pancreatic β-cells'],
    ['Affinity · K<sub>m</sub>', 'High · ≈ 0.1 mM', 'Low · ≈ 10 mM'],
    ['Insulin', 'No effect', 'Induces synthesis'],
    ['Glucose 6-P', 'Inhibits', 'No effect'],
    ['Role', 'Energy for the cell', 'Storage · glucose sensing'],
  ];
  el.innerHTML = `
  <div class="hk">
    <div class="hkt">
      <div class="hkh"><span></span><span class="a" data-tip="hk">Hexokinase</span><span class="b" data-tip="gk">Glucokinase</span></div>
      ${rows.map(([k, a, b]) => `<div class="hkr"><span>${k}</span><span class="a">${a}</span><span class="b">${b}</span></div>`).join('')}
    </div>
    <div class="hkc">
      <svg viewBox="0 0 700 500">
        <g transform="translate(70 20)">
          <rect width="600" height="400" fill="none" stroke="#ffffff22"/>
          ${[0, 5, 10, 15, 20].map(v => `<text x="${v / 20 * 600}" y="432" text-anchor="middle" font-size="20" fill="#6e6e73">${v}</text>`).join('')}
          <text x="300" y="470" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Glucose (mM)</text>
          <text x="-40" y="200" transform="rotate(-90 -40 200)" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Rate of phosphorylation</text>
          <rect x="${3.9 / 20 * 600}" y="0" width="${(5.6 - 3.9) / 20 * 600}" height="400" fill="#30d158" opacity=".08"/>
          <text x="${4.7 / 20 * 600}" y="24" text-anchor="middle" font-size="18" font-weight="650" fill="#30d158">fasting</text>
          <path class="cv hkcv" d="${curve(g => 0.32 * g / (0.1 + g))}" fill="none" stroke="#2d9bff" stroke-width="5"/>
          <path class="cv gkcv" d="${curve(g => Math.pow(g, 1.7) / (Math.pow(10, 1.7) + Math.pow(g, 1.7)))}" fill="none" stroke="#ff453a" stroke-width="5"/>
          <line class="hcur" x1="0" x2="0" y1="0" y2="400" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
          <circle class="dhk" r="9" fill="#2d9bff"/><circle class="dgk" r="9" fill="#ff453a"/>
        </g>
      </svg>
      <div class="glctl"><label>Glucose</label><input type="range" min="0.5" max="20" step="0.1" value="5" class="slider hsl"><span class="gval">5.0 mM</span></div>
      <div class="hkread"><span class="ra" data-tip="hk">Hexokinase <b class="pa">98%</b> of max</span><span class="rb" data-tip="gk">Glucokinase <b class="pb">22%</b> of max</span></div>
      <p class="illus">Illustrative · glucokinase: high K<sub>m</sub>, high capacity, sigmoidal</p>
    </div>
  </div>`;
  function curve(fn) { return Array.from({ length: 121 }, (_, j) => { const g = j / 120 * 20; return `${j ? 'L' : 'M'}${g / 20 * 600} ${400 - fn(g) * 400}`; }).join(' '); }
  const sl = el.querySelector('.hsl'), gv = el.querySelector('.gval'), cur = el.querySelector('.hcur');
  const dhk = el.querySelector('.dhk'), dgk = el.querySelector('.dgk');
  const render = g => {
    gv.textContent = (+g).toFixed(1) + ' mM';
    sl.style.setProperty('--v', ((g - 0.5) / 19.5 * 100) + '%');
    const x = g / 20 * 600;
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    const hk = g / (0.1 + g), gk = Math.pow(g, 1.7) / (Math.pow(10, 1.7) + Math.pow(g, 1.7));
    dhk.setAttribute('cx', x); dhk.setAttribute('cy', 400 - 0.32 * hk * 400);
    dgk.setAttribute('cx', x); dgk.setAttribute('cy', 400 - gk * 400);
    el.querySelector('.pa').textContent = Math.round(hk * 100) + '%';
    el.querySelector('.pb').textContent = Math.round(gk * 100) + '%';
  };
  sl.addEventListener('input', () => render(+sl.value));
  const anim = to => { const o = { v: +sl.value }; gsap.to(o, { v: to, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { sl.value = o.v; render(o.v); } }); };
  return { enter() { sl.value = 5; render(5); }, step(s) { if (s === 2) anim(14); if (s < 2 && +sl.value !== 5) anim(5); } };
});

/* ─────────────── substrate-level vs oxidative phosphorylation ─────────────── */
register('slp', (el) => {
  el.innerHTML = `
  <div class="slp">
    <article class="slc" data-build="1" data-tip="def-slp" style="--sc:#ff9f0a">
      <svg viewBox="0 0 560 220">
        <rect x="30" y="80" width="170" height="64" rx="18" fill="rgba(255,255,255,.08)" stroke="#ffffff44"/><text x="115" y="120" text-anchor="middle" font-size="24" font-weight="650" fill="#f5f5f7">Substrate~P</text>
        <circle class="slp-p" cx="210" cy="112" r="20" fill="#ff7a45"/><text class="slp-p" x="210" y="119" text-anchor="middle" font-size="20" font-weight="800" fill="#000">P</text>
        <circle cx="440" cy="112" r="44" fill="#ff9f0a"/><text x="440" y="120" text-anchor="middle" font-size="24" font-weight="800" fill="#000">ADP</text>
        <text class="slp-atp" x="440" y="200" text-anchor="middle" font-size="30" font-weight="800" fill="#ffd60a">→ ATP</text>
      </svg>
      <h3>Substrate-level</h3>
      <p>Phosphate handed <b>directly</b> to ADP</p>
      <span class="ex">Glycolysis steps 5 &amp; 7 · TCA: succinate thiokinase</span>
    </article>
    <article class="slc" data-build="2" data-tip="def-oxphos" style="--sc:#7d7aff">
      <svg viewBox="0 0 560 220">
        <rect x="200" y="40" width="170" height="140" rx="70" fill="rgba(255,143,102,.15)" stroke="#ff8f66" stroke-width="3"/>
        ${[230, 262, 294, 326].map(x => `<path d="M${x} 52 V 110" stroke="#ff8f66" stroke-width="3"/>`).join('')}
        <text x="70" y="90" font-size="24" font-weight="750" fill="#30d158">NADH</text><text x="70" y="140" font-size="24" font-weight="750" fill="#ff6fae">FADH₂</text>
        <path d="M160 100 H 196" stroke="#ffffff66" stroke-width="3"/><path d="M374 110 H 420" stroke="#ffffff66" stroke-width="3"/>
        <text x="490" y="120" text-anchor="middle" font-size="30" font-weight="800" fill="#ffd60a">ATP</text>
        <circle r="7" fill="#ffe45c"><animateMotion dur="1.8s" repeatCount="indefinite" path="M110 100 H 200 C 240 160, 330 60, 372 110 H 440"/></circle>
      </svg>
      <h3>Oxidative</h3>
      <p>NADH / FADH₂ → ETC → ATP <b>in mitochondria</b></p>
      <span class="ex">Needs O₂ · makes most of the cell's ATP</span>
    </article>
    <div class="slfoot" data-build="3">
      <span class="cur" data-tip="rule4h"><b>NADH</b> = 2.5 ATP <i>(older: 3)</i></span>
      <span class="cur" data-tip="rule4h"><b>FADH₂</b> = 1.5 ATP <i>(older: 2)</i></span>
      <span class="why" data-tip="slp-why">Why SLP matters: <b>ATP without oxygen</b></span>
    </div>
  </div>`;
  return {};
});

/* ─────────────── NAD⁺ recycling: with vs without O₂ ─────────────── */
register('nadcycle', (el) => {
  const svg = mount(el, 1040, 860, `
    <defs><marker id="nc-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff77"/></marker></defs>
    ${pill(200, 90, 'Glucose', { w: 200 })}
    <path d="M200 128 V 220" stroke="#ffffff44" stroke-width="3" marker-end="url(#nc-ar)"/>
    <g data-tip="g4" transform="translate(200 270)"><rect x="-150" y="-42" width="300" height="84" rx="24" fill="rgba(90,200,250,.12)" stroke="#5ac8fa" stroke-width="2.5"/><text y="-4" text-anchor="middle" font-size="26" font-weight="750" fill="#f5f5f7">G3P dehydrogenase</text><text y="26" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">step 4 · needs NAD⁺</text></g>
    <path d="M200 312 V 440" stroke="#ffffff44" stroke-width="3" marker-end="url(#nc-ar)"/>
    ${pill(200, 490, 'Pyruvate', { w: 210, tip: 'pyruvate' })}
    <g class="aer">
      <path d="M305 470 C 450 420, 560 300, 700 260" stroke="#30d158" stroke-width="4" fill="none" marker-end="url(#nc-ar)"/>
      <g transform="translate(800 230)"><rect x="-120" y="-50" width="240" height="100" rx="50" fill="rgba(255,143,102,.12)" stroke="#ff8f66" stroke-width="2.5"/><text y="-6" text-anchor="middle" font-size="26" font-weight="750" fill="#f5f5f7">Mitochondria</text><text y="24" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">PDH → TCA → ETC</text></g>
      <path id="nc-sh" d="M350 250 C 480 160, 600 140, 690 190" fill="none" stroke="#30d15866" stroke-width="3" stroke-dasharray="6 8"/>
      <text x="520" y="140" text-anchor="middle" font-size="22" font-weight="650" fill="#30d158" data-tip="shuttle">NADH → shuttles → ETC</text>
      <text x="800" y="330" text-anchor="middle" font-size="24" font-weight="700" fill="#64d2ff">O₂ present</text>
    </g>
    <g class="ana">
      <path d="M200 540 V 640" stroke="#ff453a" stroke-width="4" marker-end="url(#nc-ar)"/>
      <g data-tip="ldh" transform="translate(200 690)"><rect x="-150" y="-40" width="300" height="80" rx="24" fill="rgba(255,69,58,.14)" stroke="#ff453a" stroke-width="2.5"/><text y="9" text-anchor="middle" font-size="26" font-weight="750" fill="#f5f5f7">Lactate dehydrogenase</text></g>
      <path d="M350 690 H 520" stroke="#ff453a" stroke-width="4" marker-end="url(#nc-ar)"/>
      ${pill(620, 690, 'Lactate', { w: 180, stroke: '#ff453a' })}
      <path id="nc-loop" d="M60 690 C -10 600, -10 360, 50 270" fill="none" stroke="#ffffff55" stroke-width="3" stroke-dasharray="6 8" marker-end="url(#nc-ar)"/>
      <path id="nc-nadh" d="M300 300 C 420 380, 420 600, 300 660" fill="none" stroke="#30d15866" stroke-width="3" stroke-dasharray="6 8"/>
      <text x="438" y="480" font-size="24" font-weight="700" fill="#30d158">NADH</text>
      <text x="-20" y="480" text-anchor="middle" font-size="24" font-weight="700" fill="#f5f5f7" transform="rotate(-90 -20 480)">NAD⁺ recycled</text>
      <text x="620" y="790" text-anchor="middle" font-size="24" font-weight="700" fill="#ff6961">No O₂</text>
    </g>
    <g class="sites" transform="translate(560 470)">
      ${[['RBCs', 'no mitochondria'], ['Cornea · lens', 'avascular'], ['Kidney medulla', 'avascular'], ['Sprinting muscle', 'O₂ can’t keep up']].map(([a, b], i) => `
        <g transform="translate(${(i % 2) * 250} ${Math.floor(i / 2) * 0 - 30 + (i > 1 ? 0 : 0)})"></g>`).join('')}
    </g>
    <g class="ncp"></g>
  `);
  const ctrl = document.createElement('div');
  ctrl.className = 'seg nc-seg';
  ctrl.innerHTML = '<button class="on" data-val="1">O₂ present</button><button data-val="0">No oxygen</button>';
  el.appendChild(ctrl);
  const sites = document.createElement('div');
  sites.className = 'nc-sites';
  sites.innerHTML = [['RBCs', 'no mitochondria'], ['Cornea · lens', 'avascular'], ['Kidney medulla', 'avascular'], ['Sprinting muscle', 'O₂ can’t keep up']].map(([a, b]) => `<span><b>${a}</b>${b}</span>`).join('');
  el.appendChild(sites);
  const css = document.createElement('style');
  css.textContent = `[data-widget="nadcycle"] .aer, [data-widget="nadcycle"] .ana { transition: opacity .8s; } [data-widget="nadcycle"] [data-tip] { cursor: help; }`;
  el.appendChild(css);
  const Lp = svg.querySelector('.ncp');
  const fs = new Flow(Lp, svg.getElementById('nc-sh'), { color: NADHC, rate: 1.4, speed: 200, r: 8 });
  const fn = new Flow(Lp, svg.getElementById('nc-nadh'), { color: NADHC, rate: 1.6, speed: 200, r: 8 });
  const fl = new Flow(Lp, svg.getElementById('nc-loop'), { color: '#f5f5f7', rate: 1.6, speed: 220, r: 8 });
  const tk = ticker(dt => { fs.update(dt); fn.update(dt); fl.update(dt); });
  let o2 = true, step = 0;
  const apply = () => {
    svg.querySelector('.aer').style.opacity = o2 ? 1 : 0.12;
    svg.querySelector('.ana').style.opacity = o2 ? 0.12 : 1;
    fs.on = o2; fn.on = fl.on = !o2;
    ctrl.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.val === '1') === o2));
    sites.classList.toggle('on', step >= 3);
  };
  ctrl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { o2 = b.dataset.val === '1'; apply(); } });
  return {
    enter() { tk.start(); }, leave() { tk.stop(); },
    step(s) { step = s; o2 = s === 0; apply(); },
  };
});

/* ─────────────── lactic acidosis ─────────────── */
register('lactic', (el) => {
  const causes = [['Tissue hypoxia', 'shock · severe anemia · cardiac arrest'], ['Organ failure', 'e.g. liver cannot clear lactate'], ['Enzyme deficiencies', 'e.g. PDH deficiency'], ['Drugs', 'e.g. metformin']];
  const feats = [['🤢', 'Gut', 'Nausea · vomiting · severe abdominal pain'], ['🫁', 'Breathing', 'Rapid, deep breathing (hyperventilation)'], ['💪', 'Muscle', 'Extreme fatigue · weakness · cramping'], ['🧠', 'Brain', 'Confusion · dizziness · lethargy']];
  el.innerHTML = `
  <div class="lac">
    <div class="lacl" data-build="1">
      <p class="wk">Excess lactate · causes</p>
      ${causes.map(([a, b]) => `<div class="cause"><b>${a}</b><span>${b}</span></div>`).join('')}
    </div>
    <div class="lacm">
      <svg viewBox="0 0 200 520">
        <defs><linearGradient id="phg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30d158"/><stop offset=".5" stop-color="#ffd60a"/><stop offset="1" stop-color="#ff453a"/></linearGradient></defs>
        <rect x="80" y="20" width="40" height="460" rx="20" fill="url(#phg)" opacity=".85"/>
        <text x="100" y="510" text-anchor="middle" font-size="24" font-weight="700" fill="#98989f">blood pH</text>
        <g class="phm" transform="translate(0 120)"><path d="M60 0 L 80 -12 L 80 12 Z" fill="#fff"/><text x="52" y="8" text-anchor="end" font-size="26" font-weight="800" fill="#fff" class="phv">7.40</text></g>
      </svg>
    </div>
    <div class="lacr" data-build="2">
      <p class="wk">Clinical features</p>
      ${feats.map(([i, a, b]) => `<div class="feat"><span class="fi">${i}</span><div><b>${a}</b><span>${b}</span></div></div>`).join('')}
    </div>
  </div>`;
  const m = el.querySelector('.phm'), v = el.querySelector('.phv');
  const set = (y, ph) => { gsap.to(m, { attr: { transform: `translate(0 ${y})` }, duration: 1.6, ease: 'power2.inOut' }); const o = { p: parseFloat(v.textContent) }; gsap.to(o, { p: ph, duration: 1.6, onUpdate: () => { v.textContent = o.p.toFixed(2); } }); };
  return { enter() { m.setAttribute('transform', 'translate(0 120)'); v.textContent = '7.40'; }, step(s) { if (s >= 1) set(380, 7.15); else set(120, 7.40); } };
});

/* ─────────────── RBC: Embden–Meyerhof vs Luebering–Rapoport + O2 curve ─────────────── */
register('rbcpath', (el) => {
  const svg = mount(el, 1680, 700, `
    <defs><marker id="rb-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff77"/></marker></defs>
    ${pill(150, 90, 'Glucose', { w: 190, hh: 64, fs: 28 })}
    <path d="M150 124 V 196" stroke="#ffffff44" stroke-width="3" marker-end="url(#rb-ar)"/>
    ${pill(150, 240, '1,3-BPG', { w: 190, hh: 64, fs: 28 })}
    <g class="emp">
      <path id="rb-e" d="M150 274 V 400" stroke="#5ac8fa" stroke-width="5" fill="none" marker-end="url(#rb-ar)"/>
      <text x="172" y="345" font-size="22" font-weight="650" fill="#ffd60a" data-tip="g5">PGK → ATP</text>
      ${pill(150, 444, '3-PG', { w: 160, hh: 60, fs: 26 })}
      <path d="M150 476 V 546" stroke="#5ac8fa" stroke-width="5" fill="none" marker-end="url(#rb-ar)"/>
      ${pill(150, 590, 'Lactate', { w: 170, hh: 60, fs: 26 })}
      <text x="150" y="668" text-anchor="middle" font-size="26" font-weight="750" fill="#5ac8fa" data-tip="emp">Embden–Meyerhof · 75–85%</text>
    </g>
    <g class="rl">
      <path id="rb-r" d="M246 240 C 340 240, 380 250, 440 300" stroke="#ff6482" stroke-width="5" fill="none" marker-end="url(#rb-ar)"/>
      <text x="330" y="214" font-size="22" font-weight="650" fill="#ff9fb3" data-tip="rl-shunt">BPG mutase</text>
      <g data-tip="bpg">${pill(500, 350, '2,3-BPG', { w: 190, hh: 64, fs: 28, stroke: '#ff6482' })}</g>
      <path d="M440 400 C 380 430, 300 444, 232 444" stroke="#ff6482" stroke-width="4" fill="none" marker-end="url(#rb-ar)"/>
      <text x="340" y="490" font-size="22" font-weight="650" fill="#ff9fb3">phosphatase · no ATP</text>
      <text x="440" y="160" text-anchor="middle" font-size="26" font-weight="750" fill="#ff6482" data-tip="rl-shunt">Luebering–Rapoport · 15–25%</text>
    </g>
    <g class="o2c" transform="translate(760 40)" data-tip="o2curve">
      <rect width="820" height="540" fill="none" stroke="#ffffff22"/>
      ${[0, 25, 50, 75, 100].map(v => `<line x1="0" x2="820" y1="${540 - v / 100 * 540}" y2="${540 - v / 100 * 540}" stroke="#ffffff10"/><text x="-12" y="${548 - v / 100 * 540}" text-anchor="end" font-size="20" fill="#6e6e73">${v}%</text>`).join('')}
      ${[0, 20, 40, 60, 80, 100].map(v => `<text x="${v / 100 * 820}" y="572" text-anchor="middle" font-size="20" fill="#6e6e73">${v}</text>`).join('')}
      <text x="410" y="612" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">pO₂ (mmHg) · tissues ≈ 40 → lungs ≈ 100</text>
      <text x="-60" y="270" transform="rotate(-90 -60 270)" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Hb O₂ saturation</text>
      <path class="base" d="${o2path(26.8)}" fill="none" stroke="#ffffff55" stroke-width="4" stroke-dasharray="8 8"/>
      <path class="cur" d="${o2path(26.8)}" fill="none" stroke="#ff6482" stroke-width="6"/>
      <line x1="${40 / 100 * 820}" x2="${40 / 100 * 820}" y1="0" y2="540" stroke="#64d2ff" stroke-width="2" stroke-dasharray="4 6"/>
      <text class="unl" x="${40 / 100 * 820 + 12}" y="40" font-size="24" font-weight="700" fill="#64d2ff">O₂ released at tissues: 25%</text>
    </g>
    <g class="rb-p"></g>
  `);
  function o2path(p50) { return Array.from({ length: 101 }, (_, j) => { const p = j; const s = Math.pow(p, 2.7) / (Math.pow(p50, 2.7) + Math.pow(p, 2.7)); return `${j ? 'L' : 'M'}${p / 100 * 820} ${540 - s * 540}`; }).join(' '); }
  const ctl = document.createElement('div');
  ctl.className = 'glctl rb-ctl';
  ctl.innerHTML = '<label>2,3-BPG</label><input type="range" min="0" max="1" step="0.01" value="0" class="slider rbs"><span class="gval">normal</span>';
  el.appendChild(ctl);
  const sl = ctl.querySelector('.rbs'), gv = ctl.querySelector('.gval');
  const cur = svg.querySelector('.cur'), unl = svg.querySelector('.unl');
  const sat = (p, p50) => Math.pow(p, 2.7) / (Math.pow(p50, 2.7) + Math.pow(p, 2.7));
  const render = v => {
    const p50 = 26.8 + v * 6;
    cur.setAttribute('d', o2path(p50));
    unl.textContent = `O₂ released at tissues: ${Math.round((sat(100, p50) - sat(40, p50)) * 100)}%`;
    gv.textContent = v < 0.15 ? 'normal' : v > 0.7 ? 'high' : 'raised';
    sl.style.setProperty('--v', v * 100 + '%');
  };
  sl.addEventListener('input', () => render(+sl.value));
  const Lp = svg.querySelector('.rb-p');
  const fe = new Flow(Lp, svg.getElementById('rb-e'), { color: GLU, rate: 2.2, speed: 160, r: 8 });
  const fr = new Flow(Lp, svg.getElementById('rb-r'), { color: '#ff6482', rate: 0.6, speed: 160, r: 8 });
  const tk = ticker(dt => { fe.update(dt); fr.update(dt); });
  return {
    enter() { tk.start(); sl.value = 0; render(0); }, leave() { tk.stop(); },
    step(s) {
      svg.querySelector('.emp').style.opacity = s >= 1 ? 1 : 0.15; fe.on = s >= 1;
      svg.querySelector('.rl').style.opacity = s >= 2 ? 1 : 0.1; fr.on = s >= 2;
      svg.querySelector('.o2c').style.opacity = s >= 3 ? 1 : 0.15; ctl.style.opacity = s >= 3 ? 1 : 0.2;
      if (s >= 3) { const o = { v: +sl.value }; gsap.to(o, { v: 0.85, duration: 2, ease: 'power2.inOut', onUpdate: () => { sl.value = o.v; render(o.v); } }); }
    },
  };
});

/* ─────────────── regulation: allosteric · covalent · transcription ─────────────── */
register('glyreg', (el) => {
  const rows = [
    { n: 'Hexokinase', tip: 'reg-hk', allo: [['Glucose 6-P', '-']], cov: [], tx: [] },
    { n: 'Glucokinase', tip: 'reg-gk', allo: [], cov: [], tx: [['Insulin ↑', '+', 'fed'], ['Glucagon ↓', '-', 'fast']] },
    { n: 'PFK-1', tip: 'reg-pfk', allo: [['ATP', '-'], ['Citrate', '-'], ['F2,6-BP', '+'], ['AMP · ADP', '+']], cov: [['via F2,6-BP', '±', 'both']], tx: [['Insulin ↑', '+', 'fed'], ['Glucagon ↓', '-', 'fast']] },
    { n: 'Pyruvate kinase', tip: 'reg-pk', allo: [['ATP', '-'], ['Alanine', '-'], ['F1,6-BP', '+']], cov: [['Glucagon → P (off)', '-', 'fast'], ['Insulin → de-P (on)', '+', 'fed']], tx: [['Insulin ↑', '+', 'fed'], ['Glucagon ↓', '-', 'fast']] },
  ];
  const chips = (list) => list.map(([t, s, h]) => `<span class="gc ${s === '-' ? 'neg' : s === '+' ? 'pos' : 'mid'}" data-h="${h || ''}">${t}</span>`).join('') || '<span class="none">—</span>';
  el.innerHTML = `
  <div class="greg">
    <div class="grh"><span></span><span class="c1" data-tip="reg-allo">Allosteric<i>seconds</i></span><span class="c2" data-tip="reg-cov">Covalent<i>minutes</i></span><span class="c3" data-tip="reg-tx">Transcription<i>hours–days</i></span></div>
    ${rows.map(r => `<div class="grr" data-tip="${r.tip}"><span class="grn">${r.n}</span><div class="col c1">${chips(r.allo)}</div><div class="col c2">${chips(r.cov)}</div><div class="col c3">${chips(r.tx)}</div></div>`).join('')}
    <div class="grf">
      <div class="seg" data-role="hormone"><button data-val="fed">Fed · insulin</button><button data-val="fast">Fasting · glucagon</button></div>
      <span class="grnote">Insulin speeds glycolysis · glucagon slows it in the liver</span>
    </div>
  </div>`;
  const root = el.querySelector('.greg');
  const setH = hrm => {
    root.dataset.h = hrm || '';
    el.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.val === hrm));
    el.querySelectorAll('.gc').forEach(c => { const h = c.dataset.h; c.classList.toggle('lit', !!hrm && (h === hrm || h === 'both')); c.classList.toggle('dim', !!hrm && h && h !== hrm && h !== 'both'); });
  };
  el.querySelector('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setH(b.dataset.val); });
  return {
    enter() { setH(null); },
    step(s) { root.dataset.col = s; setH(s === 3 ? 'fed' : null); },
  };
});

/* ─────────────── arsenate poisoning ─────────────── */
register('arsenate', (el) => {
  const svg = mount(el, 1680, 560, `
    <defs><marker id="as-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff77"/></marker></defs>
    ${pill(150, 220, 'G3P', { w: 170, tip: 'g4' })}
    <path id="as-1" d="M236 220 H 560" stroke="#ffffff33" stroke-width="5" fill="none" marker-end="url(#as-ar)"/>
    <g data-tip="g4" transform="translate(400 220)"><rect x="-110" y="-38" width="220" height="76" rx="22" fill="rgba(90,200,250,.12)" stroke="#5ac8fa" stroke-width="2.5"/><text y="9" text-anchor="middle" font-size="24" font-weight="750" fill="#f5f5f7">G3P DH</text></g>
    <g class="norm">
      <g transform="translate(400 90)"><circle r="30" fill="#ff7a45"/><text y="9" text-anchor="middle" font-size="24" font-weight="800" fill="#000">Pᵢ</text></g>
      <path d="M400 122 V 178" stroke="#ff7a45" stroke-width="3" marker-end="url(#as-ar)"/>
      ${pill(690, 220, '1,3-BPG', { w: 200 })}
      <path id="as-2" d="M792 220 H 1110" stroke="#ffffff33" stroke-width="5" fill="none" marker-end="url(#as-ar)"/>
      <g data-tip="g5" transform="translate(950 220)"><rect x="-110" y="-38" width="220" height="76" rx="22" fill="rgba(255,214,10,.12)" stroke="#ffd60a" stroke-width="2.5"/><text y="9" text-anchor="middle" font-size="24" font-weight="750" fill="#f5f5f7">PGK</text></g>
      <g class="atpg" transform="translate(950 90)"><circle r="40" fill="#ffd60a"/><text y="9" text-anchor="middle" font-size="24" font-weight="800" fill="#000">ATP</text></g>
      <path d="M950 178 V 134" stroke="#ffd60a" stroke-width="3" marker-end="url(#as-ar)"/>
    </g>
    <g class="ars" opacity="0">
      <g transform="translate(400 90)" data-tip="arsenate-mech"><circle r="34" fill="#ff453a"/><text y="9" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">AsO₄</text></g>
      <path d="M400 126 V 178" stroke="#ff453a" stroke-width="3" marker-end="url(#as-ar)"/>
      ${pill(690, 340, '1-Arseno-3-PG', { w: 250, stroke: '#ff453a' })}
      <path d="M520 250 C 560 300, 580 330, 560 340" stroke="#ff453a" stroke-width="4" fill="none"/>
      <path d="M816 340 C 1000 340, 1160 300, 1210 250" stroke="#ff453a" stroke-width="4" fill="none" stroke-dasharray="8 8" marker-end="url(#as-ar)"/>
      <text x="1000" y="380" text-anchor="middle" font-size="22" font-weight="650" fill="#ff9f9f">hydrolyses on its own · skips PGK</text>
      <g transform="translate(950 90)"><path d="M-46 -46 L46 46 M46 -46 L-46 46" stroke="#ff453a" stroke-width="10" stroke-linecap="round"/></g>
    </g>
    ${pill(1240, 220, '3-PG', { w: 160 })}
    <path d="M1322 220 H 1420" stroke="#ffffff33" stroke-width="5" marker-end="url(#as-ar)"/>
    ${pill(1530, 220, 'Pyruvate', { w: 190, tip: 'pyruvate' })}
    <text class="asnote" x="840" y="480" text-anchor="middle" font-size="32" font-weight="750" fill="#f5f5f7">Glycolysis keeps running · ATP from this step: <tspan class="asv" fill="#ffd60a">2</tspan> per glucose</text>
    <g class="as-p"></g>
  `);
  const chips = document.createElement('div');
  chips.className = 'as-chips';
  chips.innerHTML = ['Nausea', 'Vomiting', 'Severe diarrhea', 'Abdominal pain', 'Shock'].map(c => `<span>${c}</span>`).join('');
  el.appendChild(chips);
  const ctl = document.createElement('div');
  ctl.className = 'seg danger as-seg';
  ctl.innerHTML = '<button class="on" data-val="0">Normal</button><button data-val="1">+ Arsenate</button>';
  el.appendChild(ctl);
  const Lp = svg.querySelector('.as-p');
  const f1 = new Flow(Lp, svg.getElementById('as-1'), { color: GLU, rate: 1.6, speed: 220, r: 8 });
  const f2 = new Flow(Lp, svg.getElementById('as-2'), { color: GLU, rate: 1.6, speed: 220, r: 8 });
  const tk = ticker(dt => { f1.update(dt); f2.update(dt); });
  let on = false;
  const set = v => {
    on = v;
    ctl.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.val === '1') === on));
    gsap.to(svg.querySelector('.ars'), { attr: { opacity: on ? 1 : 0 }, duration: 0.6 });
    gsap.to(svg.querySelector('.norm'), { opacity: on ? 0.25 : 1, duration: 0.6 });
    svg.querySelector('.asv').textContent = on ? '0' : '2';
    svg.querySelector('.asv').setAttribute('fill', on ? '#ff453a' : '#ffd60a');
    f2.on = !on; f1.on = true;
    chips.classList.toggle('on', on);
  };
  ctl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(b.dataset.val === '1'); });
  return { enter() { tk.start(); }, leave() { tk.stop(); }, step(s) { set(s >= 2); } };
});

/* ─────────────── PK deficiency case ─────────────── */
register('pkcase', (el) => {
  const qa = [
    ['Which enzyme is affected?', '<b>Pyruvate kinase</b> — phosphoenolpyruvate piles up before the block; pyruvate falls after it.'],
    ['Why red cells, not muscle?', 'RBCs have <b>no mitochondria</b>: glycolysis is their only ATP source. Muscle has oxidative phosphorylation and its own PK isoform.'],
    ['ATP ↓ → spiculated cells & splenomegaly?', '<b>Na⁺/K⁺-ATPase fails</b> → K⁺ and water leave → rigid, spiculated cells → trapped and destroyed in the <b>spleen</b>, which enlarges.'],
    ['Why does 2,3-BPG build up?', 'The block at PK backs up the intermediates above it, so more <b>1,3-BPG</b> is diverted into the <b>Luebering–Rapoport shunt</b>.'],
    ['Why is the anemia well tolerated?', '<b>2,3-BPG lowers Hb’s O₂ affinity</b> → oxygen is unloaded to tissues more easily.'],
  ];
  el.innerHTML = `
  <div class="case">
    <div class="case-h">
      <p class="eyebrow grad-0">Critical thinking · clinical case</p>
      <div class="patient big"><span class="pk">18-year-old</span> Hemolytic anemia · prominent spiculated cells · <b>↓ pyruvate</b> · <b>↑ phosphoenolpyruvate</b></div>
    </div>
    <div class="qas">${qa.map(([q, a], i) => `
      <article class="qa" data-i="${i + 1}"><span class="qn">${i + 1}</span><div><b class="qq">${q}</b><p class="qans">${a}</p></div></article>`).join('')}</div>
  </div>`;
  const cards = [...el.querySelectorAll('.qa')];
  cards.forEach(c => c.addEventListener('click', () => c.classList.add('open')));
  return { enter() { cards.forEach(c => c.classList.remove('open')); }, step(s) { cards.forEach((c, i) => c.classList.toggle('open', i < s)); } };
});

/* ─────────────── fluoride tube ─────────────── */
register('fluoride', (el) => {
  const svg = mount(el, 1040, 860, `
    <g transform="translate(60 80)">
      <text x="0" y="-20" font-size="26" font-weight="650" fill="#98989f">Glucose in the sample</text>
      <rect width="560" height="520" fill="none" stroke="#ffffff22"/>
      ${[0, 1, 2, 3].map(v => `<text x="${v / 3 * 560}" y="556" text-anchor="middle" font-size="22" fill="#6e6e73">${v} h</text>`).join('')}
      <text x="280" y="600" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">Time at room temperature</text>
      <path class="plain" d="M0 60 L 560 420" stroke="#ff453a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path class="fl" d="M0 60 C 90 70, 150 92, 220 96 L 560 98" stroke="#30d158" stroke-width="6" fill="none" stroke-linecap="round" opacity="0"/>
      <text class="plainl" x="566" y="430" font-size="24" font-weight="700" fill="#ff6961">plain tube</text>
      <text class="fll" x="566" y="104" font-size="24" font-weight="700" fill="#30d158" opacity="0">fluoride</text>
      <rect class="cover" x="0" y="0" width="560" height="520" fill="#000"/>
      <text x="556" y="-20" text-anchor="end" font-size="20" fill="#6e6e73">illustrative</text>
    </g>
    <g transform="translate(830 120)">
      <rect x="-60" y="0" width="120" height="560" rx="60" fill="rgba(255,255,255,.06)" stroke="#ffffff55" stroke-width="3"/>
      <rect x="-64" y="-34" width="128" height="50" rx="12" class="cap" fill="#8e8e93"/>
      <rect class="blood" x="-52" y="200" width="104" height="352" rx="50" fill="#8b0d1f"/>
      <g class="cells"></g>
      <text x="0" y="620" text-anchor="middle" font-size="22" font-weight="650" fill="#98989f" class="capl">plain</text>
    </g>
  `);
  const cellsG = svg.querySelector('.cells');
  const cells = Array.from({ length: 14 }, (_, i) => h('circle', { cx: -34 + (i % 4) * 22, cy: 260 + Math.floor(i / 4) * 70, r: 12, fill: '#d0263a' }, cellsG));
  const dots = Array.from({ length: 10 }, (_, i) => h('circle', { cx: -40 + (i % 5) * 20, cy: 230 + Math.floor(i / 5) * 30, r: 6, fill: GLU }, cellsG));
  const tk = ticker((dt, t) => {
    cells.forEach((c, i) => c.setAttribute('cy', 260 + Math.floor(i / 4) * 70 + Math.sin(t * 2 + i) * 6));
    dots.forEach((d, i) => { if (!fl) { const y = (230 + ((t * 40 + i * 37) % 300)); d.setAttribute('cy', y); d.setAttribute('opacity', y > 480 ? 0 : 1); } else d.setAttribute('opacity', 1); });
  });
  let fl = false;
  const cover = svg.querySelector('.cover');
  const draw = () => {
    gsap.fromTo(cover, { attr: { x: 0, width: 560 } }, { attr: { x: 560, width: 0 }, duration: 2.2, ease: 'power1.inOut' });
  };
  return {
    enter() { tk.start(); cover.setAttribute('x', 0); cover.setAttribute('width', 560); },
    leave() { tk.stop(); },
    step(s) {
      fl = s >= 2;
      if (s === 1) draw();
      if (s === 0) { cover.setAttribute('x', 0); cover.setAttribute('width', 560); }
      gsap.to(svg.querySelector('.fl'), { attr: { opacity: s >= 2 ? 1 : 0 }, duration: 0.8 });
      gsap.to(svg.querySelector('.fll'), { attr: { opacity: s >= 2 ? 1 : 0 }, duration: 0.8 });
      svg.querySelector('.cap').setAttribute('fill', fl ? '#8e8e93' : '#8e8e93');
      svg.querySelector('.capl').textContent = fl ? 'NaF (grey top)' : 'plain';
      if (s >= 2) { svg.querySelector('.cover').setAttribute('width', 0); }
    },
  };
});
