// Chapter 1 widgets: coenzyme line, location, analogues, PDH deficiency, thiamine.
import { register } from './registry.js';
import { mount, ticker, Flow, h } from './svg.js';
import { pill, chip } from './journey.js';

const sub = n => `<tspan dy="7" font-size="0.68em">${n}</tspan><tspan dy="-7"> </tspan>`;

/* ─────────────── 5 coenzymes on an assembly line ─────────────── */
register('pdhline', (el) => {
  const st = [
    { x: 470, c: '#ff6482', e: 'E1', name: 'Decarboxylase', co: [['T', 'TPP', 'B₁', 'tpp']] },
    { x: 900, c: '#bf8cff', e: 'E2', name: 'Transacetylase', co: [['L', 'Lipoic acid', '—', 'lipoic'], ['C', 'CoA', 'B₅', 'coa']] },
    { x: 1330, c: '#5ac8fa', e: 'E3', name: 'Dehydrogenase', co: [['F', 'FAD', 'B₂', 'fad'], ['N', 'NAD⁺', 'B₃', 'nad']] },
  ];
  const card = (s, i) => `
    <g class="st" data-i="${i + 1}" transform="translate(${s.x} 330)">
      <rect x="-190" y="-170" width="380" height="340" rx="40" fill="#0b0b0e"/>
      <rect class="st-bg" x="-190" y="-170" width="380" height="340" rx="40" fill="${s.c}12" stroke="${s.c}" stroke-opacity=".5" stroke-width="2.5"/>
      <text y="-104" text-anchor="middle" font-size="58" font-weight="800" fill="${s.c}">${s.e}</text>
      <text y="-60" text-anchor="middle" font-size="27" font-weight="600" fill="#d2d2d7">${s.name}</text>
      ${s.co.map((c, j) => {
        const y = s.co.length === 1 ? 40 : -6 + j * 98;
        return `<g data-tip="${c[3]}" transform="translate(0 ${y})">
          <rect x="-160" y="-38" width="320" height="76" rx="22" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)"/>
          <circle cx="-118" cy="0" r="27" fill="${s.c}"/>
          <text x="-118" y="12" text-anchor="middle" font-size="34" font-weight="800" fill="#000">${c[0]}</text>
          <text x="-74" y="11" font-size="31" font-weight="650" fill="#fff">${c[1]}</text>
          <text x="140" y="10" text-anchor="end" font-size="24" font-weight="600" fill="#98989f">${c[2]}</text>
        </g>`;
      }).join('')}
    </g>`;
  const svg = mount(el, 1680, 700, `
    <defs><marker id="pl-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff66"/></marker></defs>
    <path id="pl-main" d="M150 330 H 1600" stroke="#ffffff1c" stroke-width="10" stroke-linecap="round" fill="none"/>
    <g class="pl-parts"></g>
    ${pill(130, 330, 'Pyruvate', { w: 210, tip: 'pyruvate' })}
    ${st.map(card).join('')}
    <g class="out o1"><path d="M470 160 V 70" stroke="#6aa8ff" stroke-width="3" marker-end="url(#pl-ar)" fill="none"/>${chip(470, 40, 'CO₂', '#6aa8ff', { w: 120 })}</g>
    <g class="out o2"><path d="M900 500 V 590" stroke="#64d2ff" stroke-width="3" marker-end="url(#pl-ar)" fill="none"/>${pill(900, 636, 'Acetyl CoA', { w: 240, hh: 66, fs: 30, tip: 'acetylcoa', stroke: '#64d2ff' })}</g>
    <g class="out o3"><path d="M1330 500 V 590" stroke="#30d158" stroke-width="3" marker-end="url(#pl-ar)" fill="none"/>${chip(1330, 628, 'NADH', '#30d158', { w: 150 })}</g>
    <text x="1630" y="690" text-anchor="end" font-size="22" font-weight="600" fill="#6e6e73">vitamin source on the right · hover any coenzyme</text>
  `);
  const style = document.createElement('style');
  style.textContent = `
    [data-widget="pdhline"] .st { opacity: .28; transition: opacity .8s, transform .8s; }
    [data-widget="pdhline"] .st.on { opacity: 1; }
    [data-widget="pdhline"] .st.done { opacity: .75; }
    [data-widget="pdhline"] .st.on .st-bg { stroke-opacity: 1; filter: drop-shadow(0 0 22px currentColor); }
    [data-widget="pdhline"] .out { opacity: 0; transition: opacity .8s; }
    [data-widget="pdhline"] .out.on { opacity: 1; }
    [data-widget="pdhline"] [data-tip] { cursor: help; }`;
  el.appendChild(style);
  const parts = svg.querySelector('.pl-parts');
  const flowMain = new Flow(parts, svg.getElementById('pl-main'), { color: '#30d158', rate: 0.9, speed: 260, r: 9 });
  const stations = [...svg.querySelectorAll('.st')], outs = [...svg.querySelectorAll('.out')];
  const tk = ticker(dt => {
    flowMain.update(dt);
    // recolour particles by position: pyruvate (green) → acetyl (cyan) after E2
    flowMain.parts.forEach(p => {
      const c = p.s < 470 ? '#30d158' : p.s < 900 ? '#9be7a8' : '#64d2ff';
      p.g.querySelectorAll('circle').forEach(ci => ci.setAttribute('fill', c));
    });
  });
  let step = 0;
  return {
    enter() { tk.start(); },
    leave() { tk.stop(); },
    step(s) {
      step = s;
      stations.forEach((g, i) => { g.classList.toggle('on', s === i + 1 || s > 3); g.classList.toggle('done', s > i + 1 && s <= 3); });
      outs.forEach((g, i) => g.classList.toggle('on', s >= i + 1));
      flowMain.on = s >= 1;
      flowMain.stopAt = s >= 3 ? null : (s === 1 ? 540 / flowMain.len : 970 / flowMain.len);
      if (s >= 3) flowMain.release();
    },
  };
});

/* ─────────────── Where is PDH? ─────────────── */
const ORGANS = {
  brain: `<path d="M-46 8 C-62 -4 -58 -34 -36 -40 C-30 -60 -2 -64 6 -50 C18 -66 50 -58 50 -34 C70 -26 66 4 48 10 C50 30 26 40 10 30 C0 44 -30 42 -32 26 C-50 30 -60 18 -46 8 Z" />
          <path d="M4 -48 C-6 -30 12 -18 2 0 C-6 14 8 22 6 30" /><path d="M-36 -18 C-24 -22 -18 -10 -26 0" /><path d="M30 -30 C22 -18 36 -8 28 4" />`,
  heart: `<path d="M0 44 C-20 28 -58 4 -58 -22 C-58 -44 -38 -58 -20 -54 C-8 -52 -2 -42 0 -36 C2 -42 8 -52 20 -54 C38 -58 58 -44 58 -22 C58 4 20 28 0 44 Z" />`,
  kidney: `<path d="M10 -52 C40 -60 62 -30 56 4 C50 40 18 58 -6 48 C-22 40 -12 22 -20 10 C-28 -2 -40 -10 -34 -28 C-28 -46 -10 -48 10 -52 Z" /><path d="M-20 10 C-36 12 -48 4 -56 -2" />`,
  rbc: `<circle r="46"/><circle r="20" opacity=".5"/>`,
};
register('where', (el) => {
  el.innerHTML = `
  <div class="where">
    <div class="wcard" data-build="1">
      <p class="wk">Inside the cell</p>
      <svg viewBox="0 0 640 380" class="cellsvg">
        <ellipse cx="320" cy="190" rx="300" ry="170" fill="rgba(255,159,10,.06)" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
        <text x="110" y="80" font-size="26" font-weight="600" fill="#98989f">Cytosol</text>
        <text x="110" y="112" font-size="22" font-weight="600" fill="#6e6e73">glycolysis</text>
        <g transform="translate(360 210) rotate(-12)" data-tip="matrixLoc">
          <rect x="-190" y="-88" width="380" height="176" rx="88" fill="rgba(159,180,255,.08)" stroke="#9fb4ff" stroke-opacity=".6" stroke-width="3"/>
          <rect class="mx" x="-170" y="-68" width="340" height="136" rx="68" fill="rgba(90,200,250,.18)" stroke="#ff8f66" stroke-width="3"/>
          ${[-110, -55, 0, 55, 110].map((x, i) => `<path d="M${x} ${i % 2 ? 68 : -68} V ${i % 2 ? 10 : -10}" stroke="#ff8f66" stroke-width="3"/>`).join('')}
          <circle class="pdhdot" cx="-28" cy="30" r="13" fill="#30d158"/>
          <circle class="pdhdot" cx="76" cy="-30" r="13" fill="#30d158"/>
          <circle class="pdhdot" cx="-130" cy="-12" r="13" fill="#30d158"/>
        </g>
      </svg>
      <h3>Mitochondrial matrix</h3>
      <p class="wsub"><span class="dot g"></span> PDH complex</p>
    </div>
    <div class="wcard" data-build="2">
      <p class="wk">In the body</p>
      <h3 class="wbig">Every tissue with mitochondria</h3>
      <p class="wsub">especially</p>
      <div class="organs">
        ${[['brain', 'Brain', '#bf8cff'], ['heart', 'Heart', '#ff6482'], ['kidney', 'Kidney', '#ff9f0a']].map(([k, n, c]) => `
          <div class="organ" data-tip="${k}" style="--oc:${c}">
            <svg viewBox="-70 -70 140 140"><g fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${ORGANS[k]}</g></svg>
            <span>${n}</span>
          </div>`).join('')}
      </div>
      <div class="organ rbc" data-tip="rbc" style="--oc:#ff453a">
        <svg viewBox="-70 -70 140 140"><g fill="none" stroke="#ff453a" stroke-width="5">${ORGANS.rbc}</g><path d="M-52 52 L52 -52" stroke="#ff453a" stroke-width="6" stroke-linecap="round"/></svg>
        <span>Red blood cells — <b>none</b></span>
      </div>
    </div>
  </div>`;
  return {};
});

/* ─────────────── PDH analogues ─────────────── */
register('analogues', (el) => {
  const cols = [
    { k: 'an-pdh', n: 'PDH complex', role: 'Pyruvate → acetyl CoA', enz: ['E1', 'E2', 'E3'], co: true, c: '#30d158' },
    { k: 'an-akgdh', n: 'α-KG DH complex', role: 'TCA cycle', enz: ['E1', 'E2', 'E3'], co: true, c: '#ff9f0a' },
    { k: 'an-bckdh', n: 'Branched-chain α-keto acid DH', role: 'BCAA catabolism', enz: ['E1', 'E2', 'E3'], co: true, c: '#bf8cff' },
    { k: 'an-idh', n: 'Isocitrate DH', role: 'TCA cycle', enz: null, co: false, c: '#5ac8fa' },
  ];
  const coDots = `<div class="codots">${['T', 'L', 'C', 'F', 'N'].map((x, i) => `<span class="cd${i === 0 ? ' tpp' : ''}" data-tip="${['tpp', 'lipoic', 'coa', 'fad', 'nad'][i]}">${x}</span>`).join('')}</div>`;
  el.innerHTML = `
  <div class="analog">
    <div class="an-grid">
      <div class="an-rowh"></div>
      ${cols.map(c => `<div class="an-col" data-tip="${c.k}" style="--ac:${c.c}"><span class="an-name">${c.n}</span></div>`).join('')}
      <div class="an-rowh">Role</div>
      ${cols.map(c => `<div class="an-cell">${c.role}</div>`).join('')}
      <div class="an-rowh">Enzymes</div>
      ${cols.map(c => `<div class="an-cell">${c.enz ? `<div class="enz">${c.enz.map(e => `<span class="ez ${e}">${e}</span>`).join('')}</div>` : '<span class="single">Single enzyme</span>'}</div>`).join('')}
      <div class="an-rowh">Coenzymes</div>
      ${cols.map(c => `<div class="an-cell">${c.co ? coDots : '<span class="single">NAD⁺ / NADP⁺</span>'}</div>`).join('')}
      <div class="an-rowh status-h">Status</div>
      ${cols.map(c => `<div class="an-cell status" data-co="${c.co}"><span>Working</span></div>`).join('')}
    </div>
    <div class="an-ctrl">
      <div class="seg danger" data-role="thiamine"><button class="on" data-val="ok">Thiamine present</button><button data-val="def">Remove thiamine (B₁)</button></div>
      <p class="an-hint">Same 3 enzymes · same 5 coenzymes · different substrate</p>
    </div>
  </div>`;
  const seg = el.querySelector('.seg');
  const set = def => {
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.val === 'def') === def));
    el.querySelector('.analog').classList.toggle('deficient', def);
    el.querySelectorAll('.status').forEach(s => {
      const hit = def && s.dataset.co === 'true';
      s.classList.toggle('bad', hit); s.classList.toggle('good', def && !hit);
      s.querySelector('span').textContent = !def ? 'Working' : hit ? 'Stalled' : 'Unaffected';
    });
  };
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(b.dataset.val === 'def'); });
  return { enter() { set(false); }, step(s) { if (s >= 1) set(true); else set(false); } };
});

/* ─────────────── PDH deficiency: where does pyruvate go? ─────────────── */
register('deficiency', (el) => {
  const svg = mount(el, 1040, 860, `
    <defs><marker id="df-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff66"/></marker></defs>
    <path id="df-a" d="M300 230 H 760" fill="none" stroke="#ffffff22" stroke-width="8" stroke-linecap="round"/>
    <path id="df-b" d="M190 290 C 170 380, 160 420, 160 470" fill="none" stroke="#ffffff22" stroke-width="8" stroke-linecap="round"/>
    <path id="df-c" d="M250 290 C 330 380, 420 420, 460 470" fill="none" stroke="#ffffff22" stroke-width="8" stroke-linecap="round"/>
    ${pill(190, 230, 'Pyruvate', { w: 230, tip: 'pyruvate' })}
    <g class="gate" data-tip="pdhgate" transform="translate(520 230)">
      <rect x="-70" y="-46" width="140" height="92" rx="30" fill="rgba(48,209,88,.16)" stroke="#30d158" stroke-width="3"/>
      <text y="12" text-anchor="middle" font-size="34" font-weight="750" fill="#30d158">PDH</text>
      <g class="xmark" opacity="0"><circle r="58" fill="none" stroke="#ff453a" stroke-width="6"/><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#ff453a" stroke-width="9" stroke-linecap="round"/></g>
    </g>
    ${pill(880, 230, 'Acetyl CoA', { w: 230, tip: 'acetylcoa' })}
    <text x="880" y="306" text-anchor="middle" font-size="24" font-weight="600" fill="#98989f">→ TCA cycle</text>
    <g data-tip="ldh"><text x="78" y="392" font-size="24" font-weight="650" fill="#ff453a" text-anchor="middle">LDH</text></g>
    <g data-tip="altx"><text x="402" y="380" font-size="24" font-weight="650" fill="#ff6fae">ALT</text></g>
    ${pill(160, 520, 'Lactate', { w: 200, stroke: '#ff453a88', tip: 'lactic' })}
    ${pill(470, 520, 'Alanine', { w: 200, stroke: '#ff6fae88', tip: 'altx' })}
    <g class="bars" transform="translate(100 640)">
      <text x="0" y="0" font-size="26" font-weight="650" fill="#98989f">Blood levels</text>
      ${[['Pyruvate', '#30d158'], ['Lactate', '#ff453a'], ['Alanine', '#ff6fae']].map(([n, c], i) => `
        <g transform="translate(0 ${40 + i * 62})">
          <text x="0" y="30" font-size="28" font-weight="600" fill="#f5f5f7">${n}</text>
          <rect x="170" y="6" width="560" height="30" rx="15" fill="rgba(255,255,255,.07)"/>
          <rect class="bar" data-i="${i}" x="170" y="6" width="100" height="30" rx="15" fill="${c}"/>
          <text class="arrow" data-i="${i}" x="760" y="32" font-size="32" font-weight="800" fill="${c}" opacity="0">↑</text>
        </g>`).join('')}
    </g>
    <g class="acid" opacity="0" transform="translate(860 520)">
      <rect x="-130" y="-46" width="260" height="92" rx="46" fill="rgba(255,69,58,.18)" stroke="#ff453a" stroke-width="2.5"/>
      <text y="12" text-anchor="middle" font-size="32" font-weight="750" fill="#ff6961">Blood pH ↓</text>
    </g>
    <g class="brainx" opacity="0" transform="translate(965 722)" data-tip="neuro">
      <g fill="none" stroke="#bf8cff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="scale(0.78)">${ORGANS.brain}</g>
      <text y="82" text-anchor="middle" font-size="24" font-weight="650" fill="#bf8cff">energy ↓</text>
    </g>
    <g class="df-p"></g>
  `);
  const L = svg.querySelector('.df-p');
  const fa = new Flow(L, svg.getElementById('df-a'), { color: '#30d158', rate: 2.2, speed: 230, r: 8 });
  const fb = new Flow(L, svg.getElementById('df-b'), { color: '#ff453a', rate: 0.5, speed: 140, r: 8 });
  const fc = new Flow(L, svg.getElementById('df-c'), { color: '#ff6fae', rate: 0.4, speed: 150, r: 8 });
  const bars = [...svg.querySelectorAll('.bar')], arrows = [...svg.querySelectorAll('.arrow')];
  const xm = svg.querySelector('.xmark'), acid = svg.querySelector('.acid'), brain = svg.querySelector('.brainx');
  const tk = ticker(dt => { fa.update(dt); fb.update(dt); fc.update(dt); });

  // control (segmented) lives under the diagram
  const ctrl = document.createElement('div');
  ctrl.className = 'seg danger df-seg';
  ctrl.innerHTML = '<button class="on" data-val="n">Normal</button><button data-val="d">PDH deficient</button>';
  el.appendChild(ctrl);
  let def = false, step = 0;
  const apply = () => {
    ctrl.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.val === 'd') === def));
    fa.on = true; fb.on = fc.on = true;
    fa.stopAt = def ? 138 / fa.len : null; if (!def) fa.release();
    fb.rateK = def ? 4.5 : 1; fc.rateK = def ? 4 : 1;
    gsap.to(xm, { attr: { opacity: def ? 1 : 0 }, duration: 0.5 });
    const lv = def ? [520, 560, 500] : [110, 120, 110];
    bars.forEach((b, i) => gsap.to(b, { attr: { width: lv[i] }, duration: 1.4, ease: 'power3.inOut', delay: def ? 0.4 + i * 0.15 : 0 }));
    arrows.forEach(a => gsap.to(a, { attr: { opacity: def ? 1 : 0 }, duration: 0.5, delay: def ? 1.4 : 0 }));
    gsap.to(acid, { attr: { opacity: def && step >= 2 ? 1 : 0 }, duration: 0.6 });
    gsap.to(brain, { attr: { opacity: def && step >= 3 ? 1 : 0 }, duration: 0.6 });
  };
  ctrl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { def = b.dataset.val === 'd'; apply(); } });
  return {
    enter() { tk.start(); },
    leave() { tk.stop(); },
    step(s) { step = s; def = s >= 1; apply(); },
  };
});

/* ─────────────── Thiamine deficiency simulator ─────────────── */
register('thiamine', (el) => {
  el.innerHTML = `
  <div class="thia">
    <div class="thia-ctrl">
      <label>Thiamine (B₁) level</label>
      <input type="range" min="0" max="100" value="100" class="slider" aria-label="Thiamine level">
      <span class="tval">100%</span>
    </div>
    <div class="thia-enz" data-build="1">
      ${[['PDH complex', 'an-pdh'], ['α-KG DH complex', 'an-akgdh']].map(([n, k]) => `
        <div class="enzbar" data-tip="${k}"><span class="en">${n}</span><div class="track"><i></i></div><span class="pct">100%</span></div>`).join('')}
      <p class="illus">TPP-dependent activity · illustrative</p>
    </div>
    <div class="thia-organs" data-build="2">
      <div class="oc heart" data-tip="wet">
        <svg viewBox="-70 -70 140 140"><g fill="none" stroke="#ff6482" stroke-width="5" stroke-linejoin="round">${ORGANS.heart}</g></svg>
        <div><span class="on">Heart</span><b class="dx">Wet beriberi</b><span class="dsub">Congestive heart failure</span></div>
      </div>
      <div class="oc brain" data-tip="wk">
        <svg viewBox="-70 -70 140 140"><g fill="none" stroke="#bf8cff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${ORGANS.brain}</g></svg>
        <div><span class="on">Brain</span><b class="dx">Wernicke–Korsakoff</b><span class="dsub">Dry (neurological) beriberi</span></div>
      </div>
    </div>
  </div>`;
  const slider = el.querySelector('.slider'), tval = el.querySelector('.tval');
  const bars = [...el.querySelectorAll('.enzbar')];
  const ocs = [...el.querySelectorAll('.oc')];
  const render = v => {
    tval.textContent = Math.round(v) + '%';
    slider.style.setProperty('--v', v + '%');
    bars.forEach(b => {
      b.querySelector('i').style.width = v + '%';
      b.querySelector('.pct').textContent = Math.round(v) + '%';
      b.classList.toggle('low', v < 40);
    });
    const sick = v < 40;
    ocs.forEach(o => { o.classList.toggle('sick', sick); o.style.setProperty('--e', (0.25 + v / 100 * 0.75).toFixed(2)); });
  };
  slider.addEventListener('input', () => render(+slider.value));
  const anim = to => { const o = { v: +slider.value }; gsap.to(o, { v: to, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { slider.value = o.v; render(o.v); } }); };
  return {
    enter() { slider.value = 100; render(100); },
    step(s) { if (s === 2 && +slider.value > 60) anim(15); if (s < 2 && +slider.value < 100) anim(100); },
  };
});

/* ─────────────── Thiamine before glucose — the chain ─────────────── */
register('thiaminewhy', (el) => {
  const nodes = [
    ['Glucose given', 'Glycolysis ↑ → pyruvate ↑', '#30d158'],
    ['Demand for TPP ↑', 'PDH · α-KG DH', '#ff6482'],
    ['Last thiamine used up', 'Pyruvate → lactate', '#ff9f0a'],
    ['Brain energy failure', 'Highest glucose dependence', '#bf8cff'],
    ['Wernicke encephalopathy', 'Precipitated or worsened', '#ff453a'],
  ];
  el.innerHTML = `
  <div class="why">
    <div class="patient"><span class="pk">Patient</span> Chronic alcoholic · malnourished · suspected hypoglycemia</div>
    <div class="chain">
      ${nodes.map(([t, s, c], i) => `
        <div class="cn" data-build="${i + 1}" style="--cc:${c}">
          <span class="ci">${i + 1}</span>
          <b>${t}</b>
          <span class="cs">${s}</span>
        </div>${i < nodes.length - 1 ? `<div class="carr" data-build="${i + 2}">→</div>` : ''}`).join('')}
    </div>
    <div class="verdict" data-build="6">
      <span class="vk">Rule</span>
      <b>Thiamine first — or together with glucose</b>
      <span class="vn">Classic teaching · never delay glucose in true hypoglycemia</span>
    </div>
  </div>`;
  return {};
});
