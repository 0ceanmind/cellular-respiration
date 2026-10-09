// Chapter 2 widgets.
import { register } from './registry.js';
import { mount, ticker, Flow, h, countTo } from './svg.js';
import { pill, chip } from './journey.js';
import { STEPS, INTERMEDIATES, PRODUCTS, tally } from '../data/tca.js';

/* ─────────────── caption + tally beside the 3D wheel ─────────────── */
register('tcacaption', (el) => {
  el.innerHTML = `
  <div class="tcap">
    <div class="tcap-card">
      <div class="tcap-top"><span class="tnum">·</span><div><b class="te">Eight enzymes</b><span class="tt">Hover any ring · press → to turn</span></div></div>
      <p class="tr"></p>
    </div>
    <div class="tally">
      ${Object.entries(PRODUCTS).map(([k, p]) => `<div class="tl" data-k="${k}" data-tip="en-${k}" style="--pc:${p.color}"><span class="tv">0</span><span class="tk">${p.label}</span></div>`).join('')}
    </div>
  </div>`;
  const te = el.querySelector('.te'), tt = el.querySelector('.tt'), tn = el.querySelector('.tnum'), tr = el.querySelector('.tr');
  const card = el.querySelector('.tcap-card');
  return {
    step(s) {
      const t = tally(s);
      el.querySelectorAll('.tl').forEach(d => { const v = d.querySelector('.tv'); const nv = t[d.dataset.k]; if (+v.textContent !== nv) { countTo(v, nv, 0.6); d.classList.add('bump'); setTimeout(() => d.classList.remove('bump'), 700); } });
      card.classList.toggle('reg', !!(STEPS[s] && STEPS[s].reg));
      if (s === 0) { tn.textContent = '·'; te.textContent = 'Eight enzymes'; tt.textContent = 'Hover any ring · press → to turn'; tr.innerHTML = ''; }
      else if (s >= 9) { tn.textContent = '✓'; te.textContent = 'One full turn'; tt.textContent = 'Oxaloacetate is regenerated'; tr.innerHTML = '2 C in as acetyl · 2 C out as CO₂'; }
      else {
        const st = STEPS[s];
        tn.textContent = s; te.textContent = st.e; tt.textContent = st.type;
        tr.innerHTML = `${st.sub} → ${st.prod}<span>${st.cn}</span>`;
      }
      gsap.fromTo(card, { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    },
  };
});

/* ─────────────── fuels converge on acetyl CoA ─────────────── */
register('fuels', (el) => {
  const svg = mount(el, 1040, 860, `
    <defs>
      <linearGradient id="fu-g" x1="0" x2="1"><stop offset="0" stop-color="#ffd60a"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#ff6482"/></linearGradient>
      <marker id="fu-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ffffff77"/></marker>
    </defs>
    <g class="fu mito"><rect x="330" y="130" width="690" height="560" rx="110" fill="rgba(90,200,250,.05)" stroke="#ff8f66" stroke-opacity=".7" stroke-width="3"/>
      <text x="370" y="180" font-size="26" font-weight="600" fill="#98989f">Mitochondrial matrix</text></g>
    <g class="fu fuel">
      <path id="fu1" d="M200 200 C 300 200, 330 400, 420 410" fill="none" stroke="#ffffff1e" stroke-width="6"/>
      <path id="fu2" d="M200 410 H 420" fill="none" stroke="#ffffff1e" stroke-width="6"/>
      <path id="fu3" d="M200 620 C 300 620, 330 420, 420 410" fill="none" stroke="#ffffff1e" stroke-width="6"/>
      ${pill(110, 200, 'Carbs', { w: 180, tip: 'carbs', stroke: '#30d15899' })}
      ${pill(110, 410, 'Fats', { w: 180, tip: 'fats', stroke: '#ffd60a99' })}
      ${pill(110, 620, 'Proteins', { w: 180, tip: 'proteins', stroke: '#ff6fae99' })}
    </g>
    <path id="fu4" d="M560 410 H 600" fill="none" stroke="#ffffff33" stroke-width="3" marker-end="url(#fu-ar)"/>
    ${pill(490, 410, 'Acetyl CoA', { w: 210, hh: 70, fs: 30, tip: 'acetylcoa' })}
    <circle cx="780" cy="410" r="150" fill="none" stroke="#ffffff12" stroke-width="18"/>
    <g class="fu-spin" style="transform-origin:780px 410px"><circle cx="780" cy="410" r="150" fill="none" stroke="url(#fu-g)" stroke-width="7" stroke-linecap="round" stroke-dasharray="300 642"/></g>
    <text x="780" y="424" text-anchor="middle" font-size="46" font-weight="800" fill="#fff">TCA</text>
    <g class="fu co2"><path id="fu5" d="M880 300 C 920 240, 940 200, 960 120" fill="none"/>${chip(960, 86, 'CO₂', '#6aa8ff', { w: 120 })}</g>
    <g class="fu build">
      ${[[620, 610, 'Glucose'], [780, 640, 'Amino acids'], [940, 610, 'Heme · lipids']].map(([x, y, t]) => `
        <path d="M${780 + (x - 780) * 0.42} ${560} L ${x} ${y - 34}" stroke="#ff9f0a" stroke-width="3" stroke-dasharray="7 8" marker-end="url(#fu-ar)"/>
        <text x="${x}" y="${y + 6}" text-anchor="middle" font-size="26" font-weight="650" fill="#ffb340">${t}</text>`).join('')}
    </g>
    <g class="fu stages" transform="translate(0 790)">
      ${[['1', 'Fuel → acetyl CoA'], ['2', 'TCA cycle'], ['3', 'ETC · OxPhos']].map(([n, t], i) => `
        <g class="stg ${i === 1 ? 'mid' : ''}" transform="translate(${180 + i * 340} 0)">
          <rect x="-160" y="-30" width="320" height="60" rx="30" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)"/>
          <text y="10" text-anchor="middle" font-size="25" font-weight="650" fill="#d2d2d7">${n} · ${t}</text></g>`).join('')}
    </g>
    <g class="fu-p"></g>
  `);
  const css = document.createElement('style');
  css.textContent = `
    [data-widget="fuels"] .fu { opacity: 0; transition: opacity .9s; }
    [data-widget="fuels"] .fu.on { opacity: 1; }
    [data-widget="fuels"] .fu-spin { animation: spin 8s linear infinite; }
    [data-widget="fuels"] .stg.mid rect { fill: #fff; }
    [data-widget="fuels"] .stg.mid text { fill: #000; }
    [data-widget="fuels"] [data-tip] { cursor: help; }`;
  el.appendChild(css);
  const P = svg.querySelector('.fu-p');
  const f = [
    new Flow(P, svg.getElementById('fu1'), { color: '#30d158', rate: 1.2, speed: 200 }),
    new Flow(P, svg.getElementById('fu2'), { color: '#ffd60a', rate: 1.2, speed: 160 }),
    new Flow(P, svg.getElementById('fu3'), { color: '#ff6fae', rate: 1.2, speed: 200 }),
  ];
  const co2 = new Flow(P, svg.getElementById('fu5'), { color: '#6aa8ff', rate: 1, speed: 120 });
  const tk = ticker(dt => { f.forEach(x => x.update(dt)); co2.update(dt); });
  const g = n => svg.querySelector('.fu.' + n);
  return {
    enter() { tk.start(); }, leave() { tk.stop(); },
    step(s) {
      g('co2').classList.toggle('on', s >= 1); co2.on = s >= 1;
      g('mito').classList.toggle('on', s >= 2); g('stages').classList.toggle('on', s >= 2);
      g('build').classList.toggle('on', s >= 3);
      g('fuel').classList.toggle('on', s >= 4); f.forEach(x => { x.on = s >= 4; });
    },
  };
});

/* ─────────────── the lecture's fill-in table ─────────────── */
register('tcatable', (el) => {
  // [value, givenInLecture]
  const rows = [
    [['Oxaloacetate + acetyl CoA', 1], ['Citrate', 1], ['Condensation', 0], ['Citrate synthase', 0], ['6', 1], true],
    [['Citrate', 1], ['Isocitrate', 1], ['Isomerization', 0], ['Aconitase', 0], ['6', 1], false],
    [['Isocitrate', 1], ['α-Ketoglutarate · NADH, CO₂', 0], ['Oxidative decarboxylation', 1], ['Isocitrate dehydrogenase', 0], ['5', 0], true],
    [['α-Ketoglutarate', 1], ['Succinyl CoA · NADH, CO₂', 1], ['Oxidative decarboxylation', 0], ['α-KG dehydrogenase complex', 1], ['4', 0], true],
    [['Succinyl CoA', 1], ['Succinate · GTP', 1], ['Substrate-level phosphorylation', 0], ['Succinate thiokinase', 1], ['4', 0], false],
    [['Succinate', 1], ['Fumarate · FADH₂', 1], ['Oxidation', 0], ['Succinate dehydrogenase', 1], ['4', 0], false],
    [['Fumarate', 1], ['Malate', 1], ['Hydration', 1], ['Fumarase', 1], ['4', 0], false],
    [['Malate', 0], ['Oxaloacetate · NADH', 1], ['Oxidation', 1], ['Malate dehydrogenase', 0], ['4', 0], false],
  ];
  el.innerHTML = `
  <div class="ttable">
    <div class="tr th"><span>No</span><span>Substrate</span><span>Product</span><span>Reaction type</span><span>Enzyme</span><span>C<sub>n</sub></span></div>
    ${rows.map((r, i) => `
      <div class="tr ${r[5] ? 'reg' : ''}" data-row="${i + 1}" data-tip="${STEPS[i + 1].tip}">
        <span class="no">${i + 1}</span>
        ${r.slice(0, 5).map(([v, given]) => `<span class="cell ${given ? 'given' : 'q'}"><i class="ans">${v}</i>${given ? '' : '<i class="qm">?</i>'}</span>`).join('')}
      </div>`).join('')}
  </div>`;
  el.addEventListener('click', e => { const c = e.target.closest('.cell.q'); if (c) c.classList.add('show'); });
  const trs = [...el.querySelectorAll('.tr[data-row]')];
  return {
    enter() { el.querySelectorAll('.cell.q').forEach(c => c.classList.remove('show')); },
    step(s) {
      trs.forEach((tr, i) => {
        if (i + 1 <= s) tr.querySelectorAll('.cell.q').forEach((c, j) => setTimeout(() => c.classList.add('show'), j * 90));
        else if (i + 1 > s) tr.querySelectorAll('.cell.q').forEach(c => c.classList.remove('show'));
        tr.classList.toggle('cur', i + 1 === s);
      });
    },
  };
});

/* ─────────────── energy per turn ─────────────── */
register('energy', (el, app, slide) => {
  const items = [
    { k: 'nadh', n: 3, label: 'NADH', each: [2.5, 3], color: '#30d158' },
    { k: 'fadh', n: 1, label: 'FADH₂', each: [1.5, 2], color: '#ff6fae' },
    { k: 'gtp', n: 1, label: 'GTP', each: [1, 1], color: '#ff9f0a' },
    { k: 'co2', n: 2, label: 'CO₂', each: [0, 0], color: '#6aa8ff' },
  ];
  el.innerHTML = `
  <div class="energy">
    <div class="ecards">
      ${items.map((it, i) => `
        <div class="ecard" data-build="${Math.min(i + 1, 3)}" data-tip="en-${it.k}" style="--pc:${it.color}">
          <div class="etok">${Array.from({ length: it.n }, () => '<i></i>').join('')}</div>
          <b>${it.n} × ${it.label}</b>
          <span class="eatp">${it.k === 'co2' ? 'leaves the cell' : `× <em class="ev">${it.each[0]}</em> = <strong class="es">${it.n * it.each[0]}</strong> ATP`}</span>
        </div>`).join('')}
    </div>
    <div class="ebar">
      <div class="etrack">${items.slice(0, 3).map(it => `<div class="eseg" data-k="${it.k}" style="--pc:${it.color}"><span></span></div>`).join('')}</div>
      <div class="escale">${Array.from({ length: 13 }, (_, i) => `<span style="left:${i / 12 * 100}%">${i}</span>`).join('')}</div>
    </div>
    <div class="ectrl">
      <div class="seg" data-role="ratio"><button class="on" data-val="0">Lecture values · 2.5 / 1.5</button><button data-val="1">Older values · 3 / 2</button></div>
      <span class="enote" data-tip="rule4h">Why 2.5 and 1.5?</span>
    </div>
  </div>`;
  let ratio = 0, step = 0;
  const title = slide.querySelector('[data-count-target]');
  const segs = [...el.querySelectorAll('.eseg')];
  const render = () => {
    const v = items.slice(0, 3).map((it, i) => step >= i + 1 ? it.n * it.each[ratio] : 0);
    segs.forEach((sg, i) => { sg.style.width = (v[i] / 12 * 100) + '%'; sg.querySelector('span').textContent = v[i] ? v[i] : ''; });
    el.querySelectorAll('.ecard').forEach((c, i) => {
      const it = items[i]; if (it.k === 'co2') return;
      c.querySelector('.ev').textContent = it.each[ratio];
      c.querySelector('.es').textContent = it.n * it.each[ratio];
    });
    const total = v.reduce((a, b) => a + b, 0);
    const val = step >= 4 ? (ratio ? 12 : 10) : total || (ratio ? 12 : 10);
    if (title) countTo(title, val, 0.8, val % 1 ? 1 : 0);
  };
  el.querySelector('.seg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    ratio = +b.dataset.val;
    el.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
    render();
  });
  return {
    enter() { ratio = 0; el.querySelectorAll('.seg button').forEach((x, i) => x.classList.toggle('on', i === 0)); },
    step(s) { step = s; render(); },
  };
});

/* ─────────────── total ATP from one glucose (waterfall) ─────────────── */
register('glucose', (el) => {
  el.innerHTML = `
  <div class="gluc">
    <div class="gchart">
      <div class="gaxis">${[0, 10, 20, 30, 40].map(v => `<span style="bottom:${v / 40 * 100}%">${v}</span>`).join('')}</div>
      <div class="gcols">
        ${[['Glycolysis', 'cytosol', 1], ['PDH × 2', 'bridge', 2], ['TCA × 2', 'cycle', 3], ['Total', 'per glucose', 4]].map(([n, s, b]) => `
          <div class="gcol" data-col="${b}">
            <div class="gstack"></div>
            <div class="glab"><b>${n}</b><span>${s}</span></div>
          </div>`).join('')}
      </div>
    </div>
    <div class="gside">
      <div class="gtotal"><span class="gnum">?</span><span class="gunit">ATP</span></div>
      <div class="glegend">
        <span style="--pc:#ffd60a">ATP / GTP</span><span style="--pc:#30d158">from NADH</span><span style="--pc:#ff6fae">from FADH₂</span>
      </div>
      <div class="gctl">
        <label>Cytosolic NADH shuttle</label>
        <div class="seg" data-role="shuttle"><button class="on" data-val="ma">Malate–aspartate</button><button data-val="g3p">Glycerol-3-P</button></div>
        <label>P/O values</label>
        <div class="seg" data-role="ratio"><button class="on" data-val="0">2.5 / 1.5</button><button data-val="1">Older 3 / 2</button></div>
        <span class="enote" data-tip="shuttle">Why does the shuttle matter?</span>
      </div>
    </div>
  </div>`;
  let shuttle = 'ma', ratio = 0, step = 0;
  const calc = () => {
    const N = ratio ? 3 : 2.5, F = ratio ? 2 : 1.5;
    const cyto = shuttle === 'ma' ? N : F;
    return [
      [{ v: 2, c: '#ffd60a', t: '2 ATP' }, { v: 2 * cyto, c: shuttle === 'ma' ? '#30d158' : '#ff6fae', t: `2 NADH → ${2 * cyto}` }],
      [{ v: 2 * N, c: '#30d158', t: `2 NADH → ${2 * N}` }],
      [{ v: 6 * N, c: '#30d158', t: `6 NADH → ${6 * N}` }, { v: 2 * F, c: '#ff6fae', t: `2 FADH₂ → ${2 * F}` }, { v: 2, c: '#ffd60a', t: '2 GTP' }],
    ];
  };
  const cols = [...el.querySelectorAll('.gcol')];
  const num = el.querySelector('.gnum');
  const render = () => {
    const d = calc();
    let base = 0;
    const totals = d.map(segs => segs.reduce((a, s) => a + s.v, 0));
    const grand = totals.reduce((a, b) => a + b, 0);
    cols.forEach((col, i) => {
      const stack = col.querySelector('.gstack');
      const show = step >= i + 1;
      col.classList.toggle('on', show);
      const segs = i < 3 ? d[i] : d.flat();
      const start = i < 3 ? base : 0;
      stack.style.bottom = (start / 40 * 100) + '%';
      stack.innerHTML = segs.map(s => `<div class="gseg" style="height:${show ? s.v / 40 * 100 * (40 / 40) : 0}%;--pc:${s.c}" title="${s.t}"><span>${i < 3 && s.v >= 2 ? s.t : ''}</span></div>`).join('');
      stack.style.height = ((i < 3 ? totals[i] : grand) / 40 * 100) + '%';
      stack.querySelectorAll('.gseg').forEach((g, j) => { g.style.height = show ? (segs[j].v / (i < 3 ? totals[i] : grand) * 100) + '%' : '0%'; });
      if (i < 3) base += totals[i];
    });
    if (step >= 4) countTo(num, grand, 1, grand % 1 ? 1 : 0);
    else num.textContent = '?';
    el.querySelector('.gside').classList.toggle('done', step >= 5);
  };
  el.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (seg.dataset.role === 'shuttle') shuttle = b.dataset.val; else ratio = +b.dataset.val;
    render();
  }));
  return { step(s) { step = s; render(); } };
});

/* ─────────────── regulation: three valves ─────────────── */
register('regulation', (el) => {
  const rows = [
    { n: 'Citrate synthase', tip: 'reg-cs', inh: ['ATP', 'NADH', 'Succinyl CoA', 'Citrate'], act: ['ADP'] },
    { n: 'Isocitrate dehydrogenase', tip: 'reg-idh', inh: ['NADH', 'ATP'], act: ['Ca²⁺', 'ADP'] },
    { n: 'α-KG dehydrogenase complex', tip: 'reg-akg', inh: ['NADH', 'ATP', 'Succinyl CoA'], act: ['Ca²⁺'] },
  ];
  const HIGH = ['ATP', 'NADH', 'Succinyl CoA', 'Citrate'], LOW = ['ADP', 'Ca²⁺'];
  el.innerHTML = `
  <div class="reg">
    <div class="rhead"><span></span><span class="rh-i">Inhibited by</span><span class="rh-a">Activated by</span></div>
    ${rows.map((r, i) => `
      <div class="rrow" data-tip="${r.tip}">
        <div class="rname"><span class="rn">${i + 1}</span>${r.n}<span class="gate"></span></div>
        <div class="rchips">${r.inh.map(x => `<span class="rc inh" data-m="${x}">${x}</span>`).join('')}</div>
        <div class="rchips">${r.act.map(x => `<span class="rc act" data-m="${x}">${x}</span>`).join('')}</div>
      </div>`).join('')}
    <div class="rfoot">
      <div class="seg" data-role="state"><button data-val="rest">At rest · ATP &amp; NADH high</button><button data-val="work">Exercise · ADP &amp; Ca²⁺ high</button></div>
      <div class="rflux" data-tip="reg-logic"><svg viewBox="-60 -60 120 120"><circle r="44" fill="none" stroke="#ffffff18" stroke-width="10"/><g class="rspin"><circle r="44" fill="none" stroke="#ff9f0a" stroke-width="8" stroke-linecap="round" stroke-dasharray="70 207"/></g></svg><span class="rfl">Cycle flux</span></div>
    </div>
  </div>`;
  const root = el.querySelector('.reg');
  const spin = el.querySelector('.rspin');
  let tw;
  const set = st => {
    root.dataset.state = st || '';
    el.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.val === st));
    el.querySelectorAll('.rc').forEach(c => {
      const m = c.dataset.m;
      c.classList.toggle('lit', (st === 'rest' && HIGH.includes(m)) || (st === 'work' && LOW.includes(m)));
      c.classList.toggle('dim', !!st && !((st === 'rest' && HIGH.includes(m)) || (st === 'work' && LOW.includes(m))));
    });
    tw?.kill();
    const dur = st === 'rest' ? 9 : st === 'work' ? 1.1 : 3.5;
    tw = gsap.to(spin, { rotation: '+=360', svgOrigin: '0 0', duration: dur, ease: 'none', repeat: -1 });
    el.querySelector('.rfl').textContent = st === 'rest' ? 'Cycle flux ↓ slow' : st === 'work' ? 'Cycle flux ↑ fast' : 'Cycle flux';
  };
  el.querySelector('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(b.dataset.val); });
  return {
    enter() { set(null); },
    leave() { tw?.kill(); },
    step(s) { set(s === 1 ? 'rest' : s === 2 ? 'work' : null); if (s === 3) root.classList.add('logic'); else root.classList.remove('logic'); },
  };
});

/* ─────────────── lecture MCQs ─────────────── */
const MCQ = {
  idh: {
    k: 'Critical thinking · from the lecture',
    stem: 'The citric acid cycle is regulated at <b>3</b> distinct points. One regulatory enzyme is <b>isocitrate dehydrogenase</b>. Which of the following are inhibitors of this enzyme?',
    opts: ['NADH and ATP', 'Calcium and NADH', 'ATP and citrate', 'Succinyl-CoA and NADH', 'ADP and NADH'],
    a: 0,
    why: 'High-energy signals — <b>NADH and ATP</b> — inhibit isocitrate dehydrogenase. Ca²⁺ and ADP are its activators, so b and e are wrong; citrate and succinyl CoA act at the other control points.',
  },
  infant: {
    k: 'Critical thinking · clinical case',
    stem: 'A <b>6-month-old</b> infant has progressive lethargy, poor feeding and rapid breathing, with <b>hypotonia</b> and severe <b>developmental delay</b>. Labs: <b>↑ lactate</b> and markedly <b>↑ alanine</b>. Which enzyme is most likely impaired?',
    opts: ['Citrate synthase', 'Pyruvate dehydrogenase complex', 'Alpha-ketoglutarate dehydrogenase', 'Isocitrate dehydrogenase', 'Malate dehydrogenase'],
    a: 1,
    why: 'Pyruvate cannot enter the TCA cycle, so it spills into <b>lactate</b> (LDH) and <b>alanine</b> (ALT) — the signature of <b>PDH complex deficiency</b>, a major cause of congenital lactic acidosis with neurological signs.',
  },
};
register('mcq', (el) => {
  const q = MCQ[el.dataset.q];
  el.innerHTML = `
  <div class="mcq">
    <p class="eyebrow grad-2">${q.k}</p>
    <h2 class="mstem">${q.stem}</h2>
    <div class="mopts">${q.opts.map((o, i) => `<button class="mopt" data-i="${i}"><span class="ml">${'abcde'[i]}</span><span class="mt">${o}</span></button>`).join('')}</div>
    <div class="mwhy"><span class="mwk">Answer · ${'abcde'[q.a]}</span><p>${q.why}</p></div>
  </div>`;
  const opts = [...el.querySelectorAll('.mopt')];
  let picked = null;
  const reveal = on => {
    el.querySelector('.mcq').classList.toggle('revealed', on);
    opts.forEach((b, i) => { b.classList.toggle('right', on && i === q.a); b.classList.toggle('wrong', on && i === picked && i !== q.a); });
  };
  opts.forEach(b => b.addEventListener('click', () => {
    picked = +b.dataset.i;
    opts.forEach(x => x.classList.toggle('picked', x === b));
    reveal(true);
  }));
  return {
    enter() { picked = null; opts.forEach(x => x.classList.remove('picked')); reveal(false); },
    step(s) { reveal(s >= 1 || picked !== null); },
  };
});

/* ─────────────── amphibolic hub ─────────────── */
register('amphibolic', (el) => {
  const cx = 840, cy = 380, r = 170;
  const P = i => { const a = Math.PI / 2 - i * Math.PI / 4; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const node = (i, n) => { const [x, y] = P(i); return `<g transform="translate(${x} ${y})"><circle r="11" fill="#111" stroke="#ffffffcc" stroke-width="3"/><text y="${y < cy - 10 ? -22 : y > cy + 10 ? 38 : 8}" x="${x > cx + 10 ? 22 : x < cx - 10 ? -22 : 0}" text-anchor="${x > cx + 10 ? 'start' : x < cx - 10 ? 'end' : 'middle'}" font-size="24" font-weight="650" fill="#f5f5f7">${n}</text></g>`; };
  const box = (x, y, t, c, tip, w) => `<g class="abox" data-tip="${tip}" transform="translate(${x} ${y})"><rect x="${-(w || 200) / 2}" y="-30" width="${w || 200}" height="60" rx="30" fill="${c}1c" stroke="${c}aa" stroke-width="2"/><text y="9" text-anchor="middle" font-size="26" font-weight="650" fill="${c}">${t}</text></g>`;
  const badge = (x, y, n, tip) => `<g class="abadge" data-tip="${tip}" transform="translate(${x} ${y})"><circle r="21" fill="#fff"/><text y="8" text-anchor="middle" font-size="22" font-weight="800" fill="#000">${n}</text></g>`;
  const arr = (d, c, cls = '') => `<path class="${cls}" d="${d}" fill="none" stroke="${c}" stroke-width="3.5" marker-end="url(#am-${c === '#30d158' ? 'g' : c === '#ff9f0a' ? 'o' : 'w'})"/>`;
  const [oaaX, oaaY] = P(0), [citX, citY] = P(1), [akgX, akgY] = P(3), [scX, scY] = P(4), [malX, malY] = P(7);
  const svg = mount(el, 1680, 740, `
    <defs>${[['g', '#30d158'], ['o', '#ff9f0a'], ['w', '#ffffff88']].map(([k, c]) => `<marker id="am-${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="${c}"/></marker>`).join('')}
      <linearGradient id="am-rg" x1="0" x2="1"><stop offset="0" stop-color="#ffd60a"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#ff6482"/></linearGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,214,10,.04)" stroke="url(#am-rg)" stroke-width="6"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="40" font-weight="800" fill="#fff">TCA</text>
    <text x="${cx}" y="${cy + 30}" text-anchor="middle" font-size="22" font-weight="600" fill="#98989f">central · amphibolic</text>
    ${INTERMEDIATES.map((it, i) => node(i, it.short || it.n)).join('')}

    <g class="ag cat">
      ${pill(500, 70, 'Pyruvate', { w: 190, hh: 60, fs: 27, tip: 'pyruvate' })}
      ${pill(840, 70, 'Acetyl CoA', { w: 210, hh: 60, fs: 27, tip: 'acetylcoa' })}
      ${arr('M598 70 H 728', '#ffffff88')}
      ${arr(`M840 100 C 880 140, 930 170, ${citX - 8} ${citY - 18}`, '#ffffff88')}
      ${arr(`M${cx} ${cy + r + 18} V 668`, '#ffffff88')}
      ${box(cx, 700, 'NADH · FADH₂ → ETC', '#7d7aff', 'out-etc', 330)}
    </g>

    <g class="ag out">
      ${arr(`M${oaaX - 30} ${oaaY + 6} C 640 210, 520 260, 400 262`, '#ff9f0a')}
      ${box(290, 262, 'Glucose', '#ff9f0a', 'out-gng', 190)}
      <text x="290" y="316" text-anchor="middle" font-size="21" font-weight="600" fill="#98989f">gluconeogenesis</text>
      ${arr(`M${citX + 16} ${citY - 6} C 1080 230, 1200 250, 1288 262`, '#ff9f0a')}
      ${arr('M950 70 C 1150 80, 1300 150, 1370 228', '#ff9f0a')}
      ${box(1400, 262, 'Lipid synthesis', '#ff9f0a', 'out-lipid', 230)}
      ${arr(`M${scX + 20} ${scY + 12} C 960 610, 1040 640, 1110 650`, '#ff9f0a')}
      ${box(1210, 650, 'Heme', '#ff9f0a', 'out-heme', 160)}
      ${arr('M1206 128 H 1330', '#ff9f0a')}
      ${box(1440, 128, 'Protein synthesis', '#ff9f0a', 'ast', 240)}
      ${arr('M1306 472 H 1360', '#ff9f0a')}
      ${box(1470, 472, 'Protein synthesis', '#ff9f0a', 'gdh', 240)}
    </g>

    <g class="ag both">
      ${arr(`M${oaaX + 26} ${oaaY - 4} C 960 170, 1000 140, 1036 132`, '#d2d2d7', 'two')}
      ${pill(1120, 128, 'Aspartate', { w: 170, hh: 56, fs: 25, tip: 'ast' })}
      ${badge(990, 168, 3, 'ast')}
      ${arr(`M${akgX + 22} ${akgY - 2} C 1060 470, 1110 470, 1150 472`, '#d2d2d7', 'two')}
      ${pill(1232, 472, 'Glutamate', { w: 170, hh: 56, fs: 25, tip: 'gdh' })}
      ${badge(1092, 440, 4, 'gdh')}
      ${arr('M405 70 H 300', '#d2d2d7', 'two')}
      ${pill(215, 70, 'Alanine', { w: 160, hh: 56, fs: 25, tip: 'alt' })}
      ${badge(352, 40, 5, 'alt')}
    </g>

    <g class="ag in">
      ${arr(`M540 100 C 620 160, 700 200, ${oaaX - 14} ${oaaY - 10}`, '#30d158')}
      ${badge(636, 178, 1, 'pc')}
      ${arr(`M470 100 C 470 220, 560 260, ${malX - 16} ${malY - 4}`, '#30d158')}
      ${badge(488, 214, 2, 'me')}
      ${pill(520, 600, 'Propionyl CoA', { w: 230, hh: 56, fs: 25, tip: 'in-propionyl', stroke: '#30d15899' })}
      ${arr(`M640 600 C 700 600, 760 ${scY + 20}, ${scX - 20} ${scY + 6}`, '#30d158')}
    </g>
  `);
  const ctrl = document.createElement('div');
  ctrl.className = 'seg am-seg';
  ctrl.innerHTML = '<button data-val="0">Catabolic</button><button data-val="1">Building blocks out</button><button data-val="2">Refilling in</button><button data-val="3">All</button>';
  el.appendChild(ctrl);
  const legend = document.createElement('div');
  legend.className = 'am-legend';
  legend.innerHTML = [['1', 'Pyruvate carboxylase', 'pc'], ['2', 'Malic enzyme', 'me'], ['3', 'Aspartate transaminase', 'ast'], ['4', 'Glutamate dehydrogenase', 'gdh'], ['5', 'Alanine transaminase', 'alt']].map(([n, t, k]) => `<span data-tip="${k}"><b>${n}</b>${t}</span>`).join('');
  el.appendChild(legend);
  const g = n => svg.querySelector('.ag.' + n);
  const set = m => {
    ctrl.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.val === m));
    g('cat').style.opacity = 1;
    g('out').style.opacity = m === 1 || m === 3 ? 1 : 0.06;
    g('both').style.opacity = m >= 1 ? 1 : 0.06;
    g('in').style.opacity = m === 2 || m === 3 ? 1 : 0.06;
    legend.style.opacity = m >= 1 ? 1 : 0.3;
  };
  ctrl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(+b.dataset.val); });
  const css = document.createElement('style');
  css.textContent = `[data-widget="amphibolic"] .ag { transition: opacity .8s; } [data-widget="amphibolic"] [data-tip] { cursor: help; }`;
  el.appendChild(css);
  return { step(s) { set(s === 0 ? 0 : s === 1 ? 1 : 2); } };
});
