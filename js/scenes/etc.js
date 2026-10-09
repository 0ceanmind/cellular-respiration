// The inner mitochondrial membrane as a live simulation.
// Electrons flow NADH/FADH2 → I/II → Q → III → cyt c → IV → O2; protons are pumped 4·4·2 into the
// intermembrane space; the pool drives ATP synthase. Inhibitors, oligomycin and uncouplers change the
// physics, and the gauges (stats) emerge from it — including respiratory control (tight coupling).
import { THREE, makeScene, studioLights, label, orbit, protein, blob, glowMat, glowSprite, COLORS, damp, mulberry, clamp, fade } from './kit.js';

const X = { I: -4.7, II: -2.75, III: -0.55, IV: 1.75, V: 4.45 };
const TOP = 0.55, BOT = -0.55;                // membrane faces (IMS above, matrix below)
const POOL_MAX = 70;

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [-1.8, 3.4, 23.5], target: [0.2, -0.3, 0] });
  studioLights(scene, 1.0);
  const root = new THREE.Group(); scene.add(root);
  const rnd = mulberry(21);

  /* ── membrane ─────────────────────────────── */
  const holes = [[X.I - 1.15, X.I + 1.15, 0.65], [X.II - 0.45, X.II + 0.45, 0.5], [X.III - 1.0, X.III + 1.0, 0.75], [X.IV - 0.7, X.IV + 0.7, 0.7], [X.V - 0.75, X.V + 1.05, 0.75], [3.0 - 0.32, 3.0 + 0.32, 0.4]];
  const heads = [];
  for (let x = -5.9; x <= 6.1; x += 0.22) for (let z = -2.2; z <= 2.2; z += 0.22) {
    if (holes.some(([a, b, r]) => x > a && x < b && Math.abs(z) < r)) continue;
    heads.push([x + (rnd() - 0.5) * 0.04, z + (rnd() - 0.5) * 0.04]);
  }
  const headGeo = new THREE.SphereGeometry(0.1, 10, 8);
  const headMat = protein(0xffb08a, ctx, { emissive: 0.03, roughness: 0.55, env: 0.4, clearcoat: 0.2 });
  const im = new THREE.InstancedMesh(headGeo, headMat, heads.length * 2);
  const m4 = new THREE.Matrix4();
  let k = 0;
  heads.forEach(([x, z]) => { for (const y of [TOP, BOT]) { m4.makeTranslation(x, y, z); im.setMatrixAt(k++, m4); } });
  root.add(im);
  const core = new THREE.Mesh(new THREE.BoxGeometry(12.1, 0.95, 4.5), new THREE.MeshBasicMaterial({ color: 0x5a2c1c, transparent: true, opacity: 0.55, depthWrite: false }));
  core.position.x = 0.1;
  root.add(core);
  core.userData.tip = 'inner-mem';

  /* ── complexes ────────────────────────────── */
  const complexes = {};
  const mk = (name, color, parts, tip) => {
    const g = new THREE.Group();
    const mat = protein(color, ctx, { emissive: 0.08, clearcoat: 0.8 });
    parts.forEach(([s, p, seed]) => {
      const m = new THREE.Mesh(blob(1, { detail: 5, amp: 0.13, lumps: 0.04, seed, scale: s }), mat);
      m.position.set(...p); g.add(m);
    });
    g.userData = { tip, mat, base: 0.08 };
    root.add(g); complexes[name] = g;
    return g;
  };
  mk('C1', COLORS.c1, [[[1.15, 0.5, 0.55], [X.I, 0, 0], 1], [[0.5, 1.15, 0.55], [X.I + 0.6, -1.45, 0], 2]], 'C1');
  mk('C2', COLORS.c2, [[[0.62, 0.62, 0.55], [X.II, -1.0, 0], 3], [[0.35, 0.42, 0.35], [X.II, -0.15, 0], 4]], 'C2');
  mk('C3', COLORS.c3, [[[0.48, 1.15, 0.6], [X.III - 0.45, 0.1, 0], 5], [[0.48, 1.15, 0.6], [X.III + 0.45, 0.1, 0], 6]], 'C3');
  mk('C4', COLORS.c4, [[[0.62, 1.05, 0.62], [X.IV, 0.35, 0], 7]], 'C4');

  // ATP synthase (complex V)
  const V = new THREE.Group(); root.add(V);
  const vMat = protein(COLORS.c5, ctx, { emissive: 0.1, clearcoat: 0.9 });
  const rotor = new THREE.Group(); rotor.position.set(X.V, 0, 0); V.add(rotor);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.75, 6, 12), protein(0xffd28a, ctx, { emissive: 0.08 }));
    c.position.set(Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48); rotor.add(c);
  }
  const gamma = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.5, 16), protein(0x30d158, ctx, { emissive: 0.15 }));
  gamma.position.y = -1.05; rotor.add(gamma);
  const head = new THREE.Group(); head.position.set(X.V, -2.25, 0); V.add(head);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    const lobe = new THREE.Mesh(blob(1, { detail: 4, amp: 0.08, seed: 10 + i, scale: [0.3, 0.55, 0.3] }), i % 2 ? vMat : protein(0xffcf7a, ctx, { emissive: 0.08, clearcoat: 0.9 }));
    lobe.position.set(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36); head.add(lobe);
  }
  const aSub = new THREE.Mesh(blob(1, { detail: 4, amp: 0.1, seed: 30, scale: [0.28, 0.5, 0.32] }), protein(0xff6482, ctx, { emissive: 0.1 }));
  aSub.position.set(X.V + 0.78, 0, 0); V.add(aSub);
  const stalkCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(X.V + 0.85, -0.4, 0), new THREE.Vector3(X.V + 0.95, -1.4, 0), new THREE.Vector3(X.V + 0.6, -2.5, 0), new THREE.Vector3(X.V + 0.15, -2.95, 0)]);
  V.add(new THREE.Mesh(new THREE.TubeGeometry(stalkCurve, 30, 0.07, 10), protein(0xbf8cff, ctx, { emissive: 0.1 })));
  V.userData = { tip: 'C5', mat: vMat, base: 0.1 };
  complexes.C5 = V;

  // uncoupling channel (only visible in leak modes)
  const leak = new THREE.Group(); leak.position.set(3.0, 0, 0.0); root.add(leak);
  const leakMesh = new THREE.Mesh(blob(1, { detail: 4, amp: 0.1, seed: 40, scale: [0.3, 0.62, 0.3] }), protein(COLORS.heat, ctx, { emissive: 0.25 }));
  leak.add(leakMesh);
  const heatGlow = glowSprite(COLORS.heat, 3.2, 0); heatGlow.position.y = -0.6; leak.add(heatGlow);
  leak.userData = { tip: 'ucp1' };
  leak.visible = false;

  // oligomycin plug
  const plug = new THREE.Mesh(blob(1, { detail: 3, amp: 0.15, seed: 50, scale: [0.3, 0.22, 0.3] }), protein(0xff453a, ctx, { emissive: 0.4 }));
  plug.position.set(X.V + 0.62, 0.45, 0.25); plug.visible = false; plug.userData.tip = 'oligomycin'; root.add(plug);

  // mobile carriers
  const Q = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.34, 6, 12), glowMat(0xffe45c, 1.6));
  Q.rotation.z = Math.PI / 2; Q.userData.tip = 'coq'; root.add(Q);
  const cytc = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), protein(0xff6482, ctx, { emissive: 0.25 }));
  cytc.userData.tip = 'cytc'; root.add(cytc);

  // block markers
  const blocks = {};
  ['C1', 'C3', 'C4'].forEach(n => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.06, 12, 60), glowMat(0xff453a, 2.4));
    const x = n === 'C1' ? X.I + 0.3 : n === 'C3' ? X.III : X.IV;
    ring.position.set(x, n === 'C1' ? -0.6 : 0.2, 0.9); ring.visible = false; root.add(ring); blocks[n] = ring;
  });

  // +/− signs for the gradient
  const signs = new THREE.Group(); root.add(signs);
  const signMats = [glowMat(0xff453a, 1.6, 0), glowMat(0x64d2ff, 1.4, 0)];
  const plusGeo = new THREE.BoxGeometry(0.22, 0.05, 0.05), plusGeo2 = new THREE.BoxGeometry(0.05, 0.22, 0.05);
  for (let i = 0; i < 26; i++) {
    const top = i < 16;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(plusGeo, signMats[top ? 0 : 1]));
    if (top) g.add(new THREE.Mesh(plusGeo2, signMats[0]));
    g.position.set(-5.4 + rnd() * 11, top ? 2.4 + rnd() * 0.5 : -2.9 - rnd() * 0.4, -1.5 + rnd() * 3);
    signs.add(g);
  }

  /* ── labels ───────────────────────────────── */
  const L = {};
  const addL = (key, html, cls, p) => { const l = label(html, cls); l.position.set(...p); root.add(l); L[key] = l; return l; };
  addL('C1', 'I', 'big', [X.I - 0.2, 1.05, 0]);
  addL('C2', 'II', 'big', [X.II, -2.1, 0]);
  addL('C3', 'III', 'big', [X.III, 1.65, 0]);
  addL('C4', 'IV', 'big', [X.IV, 1.75, 0]);
  addL('C5', 'ATP synthase', '', [X.V + 0.2, 1.05, 0]);
  addL('Q', 'Q', 'sm', [0, 0, 0]);
  addL('cytc', 'Cyt c', 'sm', [0, 0, 0]);
  addL('ims', 'Intermembrane space', 'space', [-3.6, 3.0, -1]);
  addL('mx', 'Matrix', 'space', [-6.2, -2.1, -1]);
  addL('nadh', 'NADH', 'sm', [X.I + 0.6, -3.05, 0.4]);
  addL('fadh', 'FADH<sub>2</sub>', 'sm', [X.II - 0.05, -2.95, 0.4]);
  addL('o2', '½O<sub>2</sub> → H<sub>2</sub>O', 'sm', [X.IV, -1.35, 0.6]);
  addL('p1', '4 H<sup>+</sup>', 'sm', [X.I - 0.9, 1.55, 0.3]);
  addL('p3', '4 H<sup>+</sup>', 'sm', [X.III - 0.9, 2.25, 0.3]);
  addL('p4', '2 H<sup>+</sup>', 'sm', [X.IV + 0.75, 2.25, 0.3]);
  addL('phTop', '↓ pH · positive', 'sm', [3.6, 2.85, -0.5]);
  addL('phBot', '↑ pH · negative', 'sm', [-2.2, -3.4, -0.5]);
  addL('atp', 'ATP', 'big', [X.V + 1.2, -2.9, 0.4]);
  addL('heat', 'Heat', 'big', [3.0, -1.85, 0.9]);
  addL('agent', '', 'sm', [0, 0, 0]);
  L.p1.element.style.color = L.p3.element.style.color = L.p4.element.style.color = '#ff6961';
  L.atp.element.style.color = '#ffd60a'; L.heat.element.style.color = '#ff9a4a';
  L.agent.element.style.color = '#ff6961';
  // tokens for hover
  const tokNADH = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), glowMat(COLORS.nadh, 2)); tokNADH.position.set(X.I + 0.6, -2.7, 0.4); tokNADH.userData.tip = 'nadhTok'; root.add(tokNADH);
  const tokFADH = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), glowMat(COLORS.fadh, 2)); tokFADH.position.set(X.II - 0.05, -2.6, 0.4); tokFADH.userData.tip = 'fadhTok'; root.add(tokFADH);
  const tokO2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), glowMat(COLORS.o2, 2)); tokO2.position.set(X.IV, -1.0, 0.5); tokO2.userData.tip = 'o2Tok'; root.add(tokO2);

  /* ── particles ────────────────────────────── */
  const pool = (n, r, color, k) => { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 12, 10), glowMat(color, k), n); m.count = 0; m.frustumCulled = false; root.add(m); return m; };
  const eMesh = pool(160, 0.075, COLORS.e, 2.6);
  const hMesh = pool(220, 0.1, COLORS.h, 2.2);
  const aMesh = pool(40, 0.15, COLORS.atp, 2.4);
  const fMesh = pool(60, 0.09, COLORS.heat, 2.4);

  const v3 = (x, y, z = 0.35) => new THREE.Vector3(x, y, z);
  const curve = pts => new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  // electron routes: [curve, events {t: fraction, pump: complex, block: complex}]
  const qY = 0.02;
  const routeNADH = curve([v3(X.I + 0.6, -2.7), v3(X.I + 0.6, -1.6), v3(X.I + 0.25, -0.5), v3(X.I - 0.4, qY), v3(-3.3, qY), v3(-2.0, qY), v3(X.III - 0.45, 0.1), v3(X.III, 0.9), v3(X.III + 0.4, 1.3), v3(0.6, 1.45), v3(X.IV - 0.3, 1.2), v3(X.IV, 0.4), v3(X.IV, -0.4), v3(X.IV, -1.0)]);
  const routeFADH = curve([v3(X.II, -2.6), v3(X.II, -1.0), v3(X.II, -0.2), v3(-2.0, qY), v3(X.III - 0.45, 0.1), v3(X.III, 0.9), v3(X.III + 0.4, 1.3), v3(0.6, 1.45), v3(X.IV - 0.3, 1.2), v3(X.IV, 0.4), v3(X.IV, -0.4), v3(X.IV, -1.0)]);
  // fractions along each route where complexes sit (found numerically)
  const frac = (cv, x, y) => { let best = 0, bd = Infinity; for (let i = 0; i <= 400; i++) { const p = cv.getPoint(i / 400); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i / 400; } } return best; };
  const R = {
    nadh: { cv: routeNADH, len: routeNADH.getLength(), ev: [{ t: frac(routeNADH, X.I + 0.3, -0.6), c: 'C1', pump: 4 }, { t: frac(routeNADH, X.III, 0.6), c: 'C3', pump: 4 }, { t: frac(routeNADH, X.IV, 0.5), c: 'C4', pump: 2 }], q: [frac(routeNADH, X.I - 0.4, qY), frac(routeNADH, -2.0, qY)], cyt: [frac(routeNADH, X.III + 0.4, 1.3), frac(routeNADH, X.IV - 0.3, 1.2)] },
    fadh: { cv: routeFADH, len: routeFADH.getLength(), ev: [{ t: frac(routeFADH, X.II, -0.6), c: 'C2', pump: 0 }, { t: frac(routeFADH, X.III, 0.6), c: 'C3', pump: 4 }, { t: frac(routeFADH, X.IV, 0.5), c: 'C4', pump: 2 }], q: [frac(routeFADH, X.II, -0.2), frac(routeFADH, -2.0, qY)], cyt: [frac(routeFADH, X.III + 0.4, 1.3), frac(routeFADH, X.IV - 0.3, 1.2)] },
  };

  const S = {
    electrons: [], protons: [], atps: [], heats: [],
    pool: 0, rotor: 0, rotorTarget: 0, atpPhase: 0,
    srcNADH: false, srcFADH: false, spawnAcc: { nadh: 0, fadh: 0 },
    flowOn: false, pumpOn: false, synthOn: false,
    block: null, oligo: false, uncouple: false,
    stats: { o2: 0, atp: 0, grad: 0, heat: 0 },
    rates: { o2: 0, atp: 0, heat: 0 },
  };

  function spawnPair(src) {
    S.electrons.push({ src, s: 0, held: false, ev: 0, jit: (rnd() - 0.5) * 0.12 });
  }
  function spawnProton(x, yFrom, z) {
    S.protons.push({ st: 'pump', p: new THREE.Vector3(x + (rnd() - 0.5) * 0.4, yFrom, z + (rnd() - 0.5) * 0.6), t: 0, vx: 0, vz: 0 });
  }

  /* ── mode control ─────────────────────────── */
  let mode = 'static', step = 0, hl = null;
  function resetSim() {
    S.electrons = []; S.protons = []; S.atps = []; S.heats = [];
    S.pool = 0; S.rotorTarget = S.rotor; S.spawnAcc = { nadh: 0, fadh: 0 };
  }
  function config(o) {
    Object.assign(S, o);
    leak.visible = !!S.uncouple;
    plug.visible = !!S.oligo;
    Object.entries(blocks).forEach(([n, r]) => { r.visible = S.block === n; });
  }
  function labels(map) {
    const all = ['C1', 'C2', 'C3', 'C4', 'C5', 'Q', 'cytc', 'ims', 'mx', 'nadh', 'fadh', 'o2', 'p1', 'p3', 'p4', 'phTop', 'phBot', 'atp', 'heat', 'agent'];
    all.forEach(k => L[k].element.classList.toggle('hidden', !map.includes(k)));
  }
  function highlight(name) {
    hl = name;
    Object.entries(complexes).forEach(([n, g]) => {
      const on = !name || name === n || (name === 'mobile' && false);
      g.traverse(o => { if (o.isMesh && o.material) fade(o.material, on ? 1 : 0.14); });
      g.userData.mat.emissiveIntensity = name === n ? 0.5 : g.userData.base;
    });
    const mob = !name || name === 'mobile';
    fade(Q.material, mob ? 1 : 0.2); fade(cytc.material, mob ? 1 : 0.2);
    Q.scale.setScalar(name === 'mobile' ? 1.6 : 1); cytc.scale.setScalar(name === 'mobile' ? 1.4 : 1);
    Object.keys(L).forEach(k => { if (['C1', 'C2', 'C3', 'C4', 'C5'].includes(k)) L[k].element.classList.toggle('focus', name === k); });
    L.Q.element.classList.toggle('focus', name === 'mobile'); L.cytc.element.classList.toggle('focus', name === 'mobile');
  }

  const AGENTS = {
    none: {},
    rotenone: { block: 'C1', label: 'Rotenone' },
    antimycin: { block: 'C3', label: 'Antimycin A' },
    cyanide: { block: 'C4', label: 'Cyanide' },
    oligomycin: { oligo: true, label: 'Oligomycin' },
    dnp: { uncouple: true, label: '2,4-DNP' },
  };
  function setAgent(name) {
    const a = AGENTS[name] || {};
    config({ block: a.block || null, oligo: !!a.oligo, uncouple: !!a.uncouple });
    S.electrons.forEach(e => { e.held = false; });
    if (a.label) {
      L.agent.element.innerHTML = a.label;
      const p = a.block === 'C1' ? [X.I - 1.4, -1.9, 0.8] : a.block === 'C3' ? [X.III, -1.3, 0.9] : a.block === 'C4' ? [X.IV + 1.1, -1.4, 0.9] : a.oligo ? [X.V + 1.6, 0.55, 0.6] : [3.0, -1.0, 0.9];
      L.agent.position.set(...p);
    }
    L.agent.element.classList.toggle('hidden', !a.label);
    L.heat.element.classList.toggle('hidden', !a.uncouple);
  }

  /* ── simulation ───────────────────────────── */
  const tmp = new THREE.Vector3(), tmpM = new THREE.Matrix4(), ONE = new THREE.Vector3(1, 1, 1), QQ = new THREE.Quaternion();
  const synthEntry = new THREE.Vector3(X.V + 0.75, 0.75, 0.2);
  const leakEntry = new THREE.Vector3(3.0, 0.8, 0.1);

  function sim(dt, t) {
    const back = clamp((POOL_MAX - S.pool) / POOL_MAX * 1.5, 0, 1);       // respiratory control
    const rate = 0.85 * back;
    for (const src of ['nadh', 'fadh']) {
      const on = src === 'nadh' ? S.srcNADH : S.srcFADH;
      if (!on || !S.flowOn) continue;
      let r = rate * (src === 'fadh' && S.srcNADH ? 0.45 : 1);
      // carriers upstream of a block stay reduced, so new electrons of that route back up
      r *= clamp(1 - S.electrons.filter(e => e.held && e.src === src).length / 3, 0, 1);
      S.spawnAcc[src] += dt * r;
      if (S.spawnAcc[src] >= 1 && S.electrons.length < 70) { S.spawnAcc[src] -= 1; spawnPair(src); }
    }
    // electrons
    for (let i = S.electrons.length - 1; i >= 0; i--) {
      const e = S.electrons[i], rt = R[e.src];
      const speed = 2.6 / rt.len;
      // block?
      let stopAt = 1.01;
      const bEv = rt.ev.find(v => v.c === S.block);
      if (bEv) stopAt = bEv.t - 0.035;
      if (e.s < stopAt) { e.s = Math.min(e.s + speed * dt, stopAt); e.held = e.s >= stopAt - 1e-4; }
      // events
      while (e.ev < rt.ev.length && e.s >= rt.ev[e.ev].t) {
        const ev = rt.ev[e.ev];
        if (S.pumpOn && ev.pump) {
          const x = ev.c === 'C1' ? X.I : ev.c === 'C3' ? X.III : X.IV;
          for (let p = 0; p < ev.pump; p++) spawnProton(x, -1.0 - p * 0.18, 0.4);
        }
        e.ev++;
      }
      if (e.s >= 1) {
        S.electrons.splice(i, 1);
        S.rates.o2 += 1;
      }
    }
    // protons
    const synthOpen = S.synthOn && !S.oligo;
    let wantSynth = synthOpen ? 0.24 * S.pool * dt : 0;
    let wantLeak = S.uncouple ? 0.9 * S.pool * dt : 0;
    S._sAcc = (S._sAcc || 0) + wantSynth; S._lAcc = (S._lAcc || 0) + wantLeak;
    for (let i = S.protons.length - 1; i >= 0; i--) {
      const h = S.protons[i];
      if (h.st === 'pump') {
        h.t += dt * 1.3;
        h.p.y += dt * 2.6;
        if (h.p.y > 1.0) { h.st = 'pool'; h.vx = (rnd() - 0.5) * 1.2; h.vz = (rnd() - 0.5) * 0.8; S.pool++; }
      } else if (h.st === 'pool') {
        h.vx += (rnd() - 0.5) * 3 * dt; h.vz += (rnd() - 0.5) * 3 * dt;
        h.vx *= 0.98; h.vz *= 0.98;
        h.p.x = clamp(h.p.x + h.vx * dt, -5.6, 5.8); h.p.z = clamp(h.p.z + h.vz * dt, -2.0, 2.0);
        h.p.y = damp(h.p.y, 1.2 + (i % 7) * 0.2, 1.5, dt);
        if (h.p.x <= -5.59 || h.p.x >= 5.79) h.vx *= -1;
        if (S._sAcc >= 1 && synthOpen) { S._sAcc -= 1; h.st = 'toSynth'; S.pool--; }
        else if (S._lAcc >= 1 && S.uncouple) { S._lAcc -= 1; h.st = 'toLeak'; S.pool--; }
      } else if (h.st === 'toSynth' || h.st === 'toLeak') {
        const target = h.st === 'toSynth' ? synthEntry : leakEntry;
        tmp.subVectors(target, h.p);
        const d = tmp.length();
        h.p.addScaledVector(tmp.normalize(), Math.min(d, dt * 5));
        if (d < 0.08) h.st = h.st === 'toSynth' ? 'through' : 'leakThrough';
      } else if (h.st === 'through' || h.st === 'leakThrough') {
        h.p.y -= dt * 2.2;
        if (h.p.y < -0.9) {
          S.protons.splice(i, 1);
          if (h.st === 'through') { S.rotorTarget += Math.PI / 4; S.rates.atp += 1 / 2.67; }
          else { S.rates.heat += 1; if (S.heats.length < 50) S.heats.push({ p: h.p.clone(), t: 0, v: new THREE.Vector3((rnd() - 0.5) * 0.8, -0.6 - rnd() * 0.5, (rnd() - 0.5) * 0.6) }); }
        }
      }
    }
    if (!synthOpen) S._sAcc = 0;
    if (!S.uncouple) S._lAcc = 0;
    S._sAcc = Math.min(S._sAcc, 2); S._lAcc = Math.min(S._lAcc, 2);
    // rotor & ATP release (3 ATP per full turn)
    S.rotor = damp(S.rotor, S.rotorTarget, 6, dt);
    rotor.rotation.y = -S.rotor;
    while (S.rotor - S.atpPhase >= Math.PI * 2 / 3) {
      S.atpPhase += Math.PI * 2 / 3;
      if (S.atps.length < 36) S.atps.push({ p: new THREE.Vector3(X.V + (rnd() - 0.5) * 0.4, -2.75, 0.3), v: new THREE.Vector3(0.4 + rnd() * 0.5, -0.5 - rnd() * 0.4, (rnd() - 0.5) * 0.4), t: 0 });
    }
    S.atps.forEach(a => { a.t += dt; a.p.addScaledVector(a.v, dt); });
    S.atps = S.atps.filter(a => a.t < 2.6);
    S.heats.forEach(f => { f.t += dt; f.p.addScaledVector(f.v, dt); });
    S.heats = S.heats.filter(f => f.t < 1.6);

    // stats (exponential moving averages, normalised to the healthy NADH steady state)
    const k = 1 - Math.exp(-dt / 1.6);
    S.stats.o2 = damp(S.stats.o2, S.rates.o2 / dt / 0.75, 0.6, dt) || 0;
    S.stats.atp = damp(S.stats.atp, S.rates.atp / dt / 2.6, 0.6, dt) || 0;
    S.stats.heat = damp(S.stats.heat, S.rates.heat / dt / 6, 0.6, dt) || 0;
    S.stats.grad = damp(S.stats.grad, S.pool / POOL_MAX, 2, dt);
    S.rates.o2 = S.rates.atp = S.rates.heat = 0;
  }

  function draw(t) {
    // electrons (pairs)
    let n = 0;
    for (const e of S.electrons) {
      const rt = R[e.src];
      rt.cv.getPoint(Math.min(e.s, 1), tmp);
      for (const off of [-0.07, 0.07]) {
        if (n >= 160) break;
        const j = e.held ? Math.sin(t * 20 + off * 50) * 0.03 : 0;
        tmpM.compose(tmp.clone().add(new THREE.Vector3(off + j, e.jit, off * 0.5)), QQ, ONE);
        eMesh.setMatrixAt(n++, tmpM);
      }
    }
    eMesh.count = n; eMesh.instanceMatrix.needsUpdate = true;
    n = 0;
    for (const h of S.protons) { if (n >= 220) break; tmpM.compose(h.p, QQ, ONE); hMesh.setMatrixAt(n++, tmpM); }
    hMesh.count = n; hMesh.instanceMatrix.needsUpdate = true;
    n = 0;
    for (const a of S.atps) { const s = Math.min(1, a.t * 3) * (a.t > 2 ? (2.6 - a.t) / 0.6 : 1); tmpM.compose(a.p, QQ, tmp.set(s, s, s)); aMesh.setMatrixAt(n++, tmpM); }
    aMesh.count = n; aMesh.instanceMatrix.needsUpdate = true;
    n = 0;
    for (const f of S.heats) { const s = 1 - f.t / 1.6; tmpM.compose(f.p, QQ, tmp.set(s, s, s)); fMesh.setMatrixAt(n++, tmpM); }
    fMesh.count = n; fMesh.instanceMatrix.needsUpdate = true;

    // mobile carriers: follow the most recent electron through their segment, else idle drift
    const qe = S.electrons.find(e => { const q = R[e.src].q; return e.s >= q[0] && e.s <= q[1]; });
    if (qe) { R[qe.src].cv.getPoint(qe.s, tmp); Q.position.lerp(tmp.set(tmp.x, qY, 0.75), 0.25); }
    else Q.position.lerp(tmp.set(-3.1 + Math.sin(t * 0.7) * 1.1, qY, 0.75), 0.05);
    const ce = S.electrons.find(e => { const c = R[e.src].cyt; return e.s >= c[0] && e.s <= c[1]; });
    if (ce) { R[ce.src].cv.getPoint(ce.s, tmp); cytc.position.lerp(tmp.set(tmp.x, 1.45, 0.7), 0.25); }
    else cytc.position.lerp(tmp.set(0.6 + Math.sin(t * 0.6) * 0.9, 1.5, 0.7), 0.05);
    L.Q.position.copy(Q.position).add(new THREE.Vector3(0, 0.42, 0.2));
    L.cytc.position.copy(cytc.position).add(new THREE.Vector3(0, 0.5, 0));

    // gradient visuals
    const g = S.stats.grad;
    signMats[0].opacity = mode === 'static' ? 0 : clamp(g * 1.8) * (showSigns ? 1 : 0);
    signMats[1].opacity = signMats[0].opacity * 0.9;
    heatGlow.material.opacity = clamp(S.stats.heat * 0.9) * (S.uncouple ? 1 : 0);
    plug.rotation.y = t;
    Object.entries(blocks).forEach(([nme, r]) => { if (r.visible) r.material.color.setRGB(2.4, 0.4 + Math.sin(t * 6) * 0.2, 0.35); });
  }

  let showSigns = false;
  // fast-forward to steady state so gauges are meaningful the moment a slide opens
  function prewarm(sec) { const dt = 1 / 30; for (let i = 0; i < sec * 30; i++) sim(dt, i * dt); }
  const controls = orbit(camera, ctx, new THREE.Vector3(0, -0.2, 0), { minAzimuth: -0.7, maxAzimuth: 0.55, minPolar: 0.9, maxPolar: 1.85 });

  return {
    scene, camera, controls,
    get stats() { return S.stats; },
    bloom: [0.5, 0.45, 0.86],
    pickables: [tokNADH, tokFADH, tokO2, Q, cytc, plug, leak, ...Object.values(complexes), core],
    show(key, s, slide, changed) {
      step = s;
      if (changed) { resetSim(); highlight(null); }
      const warm = changed && (key === 'toxin-lab' || key === 'uncouplers');
      showSigns = false;
      if (key === 'etc-components') {
        mode = 'static';
        config({ flowOn: false, pumpOn: false, synthOn: false, block: null, oligo: false, uncouple: false, srcNADH: false, srcFADH: false });
        resetSim();
        const map = [null, 'C1', 'C2', 'C3', 'C4', 'mobile', 'C5'];
        highlight(map[s] || null);
        labels(['C1', 'C2', 'C3', 'C4', 'C5', 'Q', 'cytc', 'ims', 'mx']);
      } else if (key === 'chemiosmotic') {
        mode = 'flow';
        const fad = slide.querySelector('[data-control="entry"] .on')?.dataset.val === 'fadh';
        config({ flowOn: s >= 1, pumpOn: s >= 2, synthOn: s >= 4, block: null, oligo: false, uncouple: false, srcNADH: !fad, srcFADH: fad });
        showSigns = s >= 3;
        const ls = ['C1', 'C2', 'C3', 'C4', 'C5', 'Q', 'cytc', 'ims', 'mx', fad ? 'fadh' : 'nadh', 'o2'];
        if (s >= 2) ls.push(...(fad ? ['p3', 'p4'] : ['p1', 'p3', 'p4']));
        if (s >= 3) ls.push('phTop', 'phBot');
        if (s >= 4) ls.push('atp');
        labels(ls);
        highlight(null);
      } else if (key === 'uncouplers') {
        mode = 'flow';
        config({ flowOn: true, pumpOn: true, synthOn: true, block: null, oligo: false, uncouple: s >= 1, srcNADH: true, srcFADH: false });
        showSigns = true;
        setAgent(s >= 1 ? 'dnp' : 'none');
        L.agent.element.innerHTML = 'Uncoupler';
        labels(['C1', 'C2', 'C3', 'C4', 'C5', 'ims', 'mx', 'nadh', 'atp', ...(s >= 1 ? ['agent'] : []), ...(s >= 3 || s >= 1 ? ['heat'] : [])]);
        highlight(null);
      } else if (key === 'toxin-lab') {
        mode = 'flow';
        config({ flowOn: true, pumpOn: true, synthOn: true, srcNADH: true, srcFADH: true });
        showSigns = true;
        labels(['C1', 'C2', 'C3', 'C4', 'C5', 'ims', 'mx', 'nadh', 'fadh', 'o2', 'atp']);
        if (changed) setAgent('none');
        highlight(null);
      }
      if (warm) prewarm(14);
    },
    control(name, val) {
      if (name === 'entry') { resetSim(); this.show('chemiosmotic', step, document.querySelector('.slide.active'), false); }
      if (name === 'agent') setAgent(val);
    },
    hide() {},
    hover(obj) {
      Object.values(complexes).forEach(g => { if (!hl) g.userData.mat.emissiveIntensity = g === obj ? 0.45 : g.userData.base; });
    },
    highlight(name, on) { highlight(on ? name : (step ? [null, 'C1', 'C2', 'C3', 'C4', 'mobile', 'C5'][step] : null)); },
    update(dt, t) {
      if (mode !== 'static') sim(dt, t);
      else { S.rotor = damp(S.rotor, S.rotor + 0.4, 1, dt); rotor.rotation.y = -S.rotor * 0.3; }
      draw(t);
    },
  };
}
