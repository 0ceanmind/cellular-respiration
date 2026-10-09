// Glycolysis as a 3D production line (the lecture's 7-step scheme).
// Investment: 2 ATP add 2 phosphates → aldolase splits 6C into two 3C halves on parallel tracks →
// each half: +Pᵢ & NADH (4), ATP (5), H2O out (6), ATP (7) → 2 pyruvate. Net: 2 ATP + 2 NADH.
import { THREE, makeScene, studioLights, label, orbit, protein, glowMat, glowSprite, COLORS } from './kit.js';
import { GSTEPS } from '../data/glyco.js';

const XS = [null, -4.2, -2.9, -1.6, -0.1, 1.3, 2.7, 4.1];
const X0 = -5.5, XEND = 5.4, YT = 1.15;

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0.2, 4.0, 23.5], target: [0.2, -0.2, 0] });
  studioLights(scene, 1.05);
  const root = new THREE.Group(); scene.add(root);

  /* ── tracks ─────────────────────────────── */
  const trackMat = new THREE.MeshPhysicalMaterial({ color: 0x3a3a44, roughness: 0.3, clearcoat: 0.8, envMap: ctx.envMap, envMapIntensity: 0.5, transparent: true, opacity: 0.9 });
  const V = (x, y) => new THREE.Vector3(x, y, 0);
  const main = new THREE.CatmullRomCurve3([V(X0 - 0.4, 0), V(-2.3, 0), V(-1.6, 0)]);
  const up = new THREE.CatmullRomCurve3([V(-1.6, 0), V(-1.15, YT * 0.75), V(-0.7, YT), V(XEND + 0.3, YT)], false, 'centripetal');
  const dn = new THREE.CatmullRomCurve3([V(-1.6, 0), V(-1.15, -YT * 0.75), V(-0.7, -YT), V(XEND + 0.3, -YT)], false, 'centripetal');
  [main, up, dn].forEach(c => root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 120, 0.07, 12), trackMat)));
  // flow lights
  const NF = 54;
  const flow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), glowMat(0x6eb6ff, 2), NF);
  root.add(flow);
  const m4 = new THREE.Matrix4(), tmp = new THREE.Vector3();

  /* ── stations ───────────────────────────── */
  const gates = [];
  const badges = [];
  GSTEPS.slice(1).forEach((st, i) => {
    const k = i + 1, x = XS[k];
    const ys = k <= 3 ? [0] : [YT, -YT];
    const g = new THREE.Group();
    const col = st.ctrl ? 0xff453a : 0xc7cad2;
    const mat = protein(col, ctx, { emissive: st.ctrl ? 0.2 : 0.03, clearcoat: 1, env: 0.6 });
    ys.forEach(y => {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 16, 40), mat);
      t.rotation.y = Math.PI / 2; t.position.set(x, y, 0); g.add(t);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, y, 0); g.add(hit);
    });
    g.userData = { tip: st.tip, mat, base: st.ctrl ? 0.2 : 0.03, k };
    root.add(g); gates.push(g);
    const b = label(String(k), 'sm'); b.position.set(x, (k <= 3 ? 0 : YT) + 0.72, 0); root.add(b); badges.push(b);
    if (st.ctrl) b.element.style.color = '#ff6961';
  });
  // poison markers (arsenate at 4, fluoride at 6)
  const poisons = {};
  [[4, 'Arsenate', 'arsenate-mech'], [6, 'Fluoride', 'fluoride']].forEach(([k, n, tip]) => {
    const l = label(`☠ ${n}`, 'sm'); l.position.set(XS[k], -YT - 0.85, 0); l.element.style.color = '#ff6961'; root.add(l); poisons[k] = l;
  });
  const nameL = label('', ''); root.add(nameL);
  const startL = label('Glucose <span class="cnum">6C</span>', ''); startL.position.set(X0, 0.85, 0); root.add(startL);
  const endL = [label('Pyruvate <span class="cnum">3C</span>', ''), label('Pyruvate <span class="cnum">3C</span>', '')];
  endL[0].position.set(XEND - 0.1, YT - 0.62, 0); endL[1].position.set(XEND - 0.1, -YT + 0.62, 0); endL.forEach(l => root.add(l));
  const netL = label('Net · <b style="color:#ffd60a">2 ATP</b> + <b style="color:#30d158">2 NADH</b>', 'big'); netL.position.set(1.8, -2.75, 0); root.add(netL);

  /* ── molecules ──────────────────────────── */
  const cMat = protein(0xbfc3cc, ctx, { roughness: 0.35, clearcoat: 1, emissive: 0.02 });
  const pMat = glowMat(0xff7a45, 1.7);
  const cGeo = new THREE.SphereGeometry(0.17, 20, 14), pGeo = new THREE.SphereGeometry(0.13, 16, 12);
  function molecule(n) {
    const g = new THREE.Group();
    g.userData = { phos: [] };
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + Math.PI / 2;
      const r = n === 6 ? 0.34 : 0.22;
      const c = new THREE.Mesh(cGeo, cMat); c.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); g.add(c);
    }
    root.add(g);
    return g;
  }
  function addP(g, idx) {
    const p = new THREE.Mesh(pGeo, pMat);
    const a = [Math.PI / 2, -Math.PI / 2, 0, Math.PI][idx % 4];
    const r = g.children.length >= 6 ? 0.62 : 0.46;
    p.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.05); g.add(p); g.userData.phos.push(p);
    return p;
  }
  function removeP(g) { const p = g.userData.phos.pop(); if (p) g.remove(p); }

  // scene-local tweens/timers so a reset never touches other slides' animations
  let gen = 0;
  const tweens = [];
  const tw = (...a) => { const t = gsap.to(...a); tweens.push(t); return t; };
  const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen) fn(); }, ms); };
  let hexa = null, tri = [];
  const fx = new THREE.Group(); root.add(fx);
  const tokGeo = new THREE.SphereGeometry(0.2, 18, 12);
  function token(color, from, to, dur, delay, vanish = true) {
    const m = new THREE.Mesh(tokGeo, glowMat(color, 2.4));
    m.position.copy(from); m.scale.setScalar(0.01); fx.add(m);
    tw(m.scale, { x: 1, y: 1, z: 1, duration: 0.35, delay });
    tw(m.position, { x: to.x, y: to.y, z: to.z, duration: dur, delay, ease: 'power2.inOut' });
    if (vanish) tw(m.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.35, delay: delay + dur, onComplete: () => fx.remove(m) });
    else tw(m.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.6, delay: delay + dur + 0.8, onComplete: () => fx.remove(m) });
    return m;
  }

  function reset() {
    gen++; tweens.splice(0).forEach(t => t.kill());
    fx.clear();
    if (hexa) root.remove(hexa); tri.forEach(t => root.remove(t));
    hexa = molecule(6); hexa.position.set(X0, 0, 0); tri = [];
  }
  // fast-forward to the state after step s (no animation)
  function stateAt(s) {
    reset();
    if (s >= 1) { hexa.position.x = XS[1]; addP(hexa, 0); }
    if (s >= 2) { hexa.position.x = XS[2]; addP(hexa, 1); }
    if (s >= 3) {
      root.remove(hexa); hexa = null;
      tri = [molecule(3), molecule(3)];
      tri.forEach((t, i) => { t.position.set(XS[3] + 0.75, i ? -YT : YT, 0); addP(t, 0); });
    }
    const xAt = { 4: XS[4], 5: XS[5], 6: XS[6], 7: XS[7], 8: XEND };
    if (s >= 4) tri.forEach(t => { t.position.x = xAt[Math.min(s, 8)]; addP(t, 1); });
    if (s >= 5) tri.forEach(t => removeP(t));
    if (s >= 7) tri.forEach(t => removeP(t));
  }
  function animateStep(s) {
    const above = y => new THREE.Vector3(0, y + 2.2, 0.4);
    if (s === 1 || s === 2) {
      tw(hexa.position, { x: XS[s], duration: 1.0, ease: 'power2.inOut' });
      token(COLORS.atp, new THREE.Vector3(XS[s] - 0.6, 2.6, 0.5), new THREE.Vector3(XS[s], 0.2, 0.2), 0.9, 0.5);
      later(() => { if (hexa) { const p = addP(hexa, s - 1); p.scale.setScalar(0.01); tw(p.scale, { x: 1, y: 1, z: 1, duration: 0.4 }); } }, 1350);
    } else if (s === 3) {
      tw(hexa.position, { x: XS[3], duration: 0.9, ease: 'power2.inOut' });
      later(() => {
        if (!hexa) return;
        const h = hexa; hexa = null;
        const flash = glowSprite(0xffffff, 3, 0.9); flash.position.set(XS[3], 0, 0); fx.add(flash);
        tw(flash.material, { opacity: 0, duration: 0.8, onComplete: () => fx.remove(flash) });
        root.remove(h);
        tri = [molecule(3), molecule(3)];
        tri.forEach((t, i) => {
          t.position.set(XS[3], 0, 0); addP(t, 0);
          const o = { u: 0 }, c = i ? dn : up;
          tw(o, { u: 1, duration: 1.0, ease: 'power2.out', onUpdate: () => { const p = c.getPoint(o.u * 0.16); t.position.set(p.x, p.y, 0); }, onComplete: () => tw(t.position, { x: XS[3] + 0.75, y: i ? -YT : YT, duration: 0.5, ease: 'power2.out' }) });
        });
      }, 950);
    } else if (s >= 4 && s <= 7) {
      tri.forEach((t, i) => {
        const y = i ? -YT : YT;
        tw(t.position, { x: XS[s], y, duration: 1.0, ease: 'power2.inOut' });
        if (s === 4) {
          token(0xff7a45, new THREE.Vector3(XS[4] - 0.7, y + (i ? -1.4 : 1.4), 0.4), new THREE.Vector3(XS[4], y, 0.2), 0.8, 0.6);
          later(() => { const p = addP(t, 1); p.scale.setScalar(0.01); tw(p.scale, { x: 1, y: 1, z: 1, duration: 0.4 }); }, 1400);
          token(COLORS.nadh, new THREE.Vector3(XS[4], y, 0.3), new THREE.Vector3(XS[4] + 0.3, y + (i ? -1.6 : 1.7), 0.5), 1.0, 1.3, false);
        }
        if (s === 5 || s === 7) {
          later(() => removeP(t), 1150);
          token(COLORS.atp, new THREE.Vector3(XS[s], y, 0.3), new THREE.Vector3(XS[s] + 0.3, y + (i ? -1.7 : 1.8), 0.5), 1.0, 1.1, false);
        }
        if (s === 6) {
          const w = token(COLORS.o2, new THREE.Vector3(XS[6], y, 0.3), new THREE.Vector3(XS[6] + 0.4, y + (i ? -1.5 : 1.5), 0.5), 1.0, 1.1, false);
          w.scale.setScalar(0.7);
        }
        if (s === 7) later(() => tw(t.position, { x: XEND, duration: 0.9, ease: 'power2.inOut' }), 1800);
      });
    }
  }

  const controls = orbit(camera, ctx, new THREE.Vector3(0.2, -0.2, 0), { minPolar: 0.9, maxPolar: 1.9, minAzimuth: -0.6, maxAzimuth: 0.6 });
  let cur = -1, hoverObj = null, active = 0;

  function decorate(s) {
    active = s;
    badges.forEach((b, i) => b.element.classList.toggle('focus', s === i + 1));
    const st = GSTEPS[s];
    nameL.element.classList.toggle('hidden', !st);
    if (st) {
      nameL.element.innerHTML = st.short;
      nameL.position.set(XS[s], (s <= 3 ? 0 : YT) + 1.35, 0);
      nameL.element.classList.add('focus');
    }
    Object.entries(poisons).forEach(([k, l]) => l.element.classList.toggle('hidden', !(s === +k || s === 8)));
    startL.element.classList.toggle('hidden', s >= 1);
    endL.forEach(l => l.element.classList.toggle('hidden', s < 7));
    netL.element.classList.toggle('hidden', s < 8);
  }

  reset();
  return {
    scene, camera, controls,
    pickables: gates,
    bloom: [0.42, 0.45, 0.88],
    show(key, s, slide, changed) {
      if (changed || s < cur || s > cur + 1) stateAt(Math.min(s, 8));
      else if (s === cur + 1 && s <= 7) animateStep(s);
      cur = s;
      decorate(s);
    },
    hover(obj) {
      hoverObj = obj;
      gates.forEach(g => { g.userData.mat.emissiveIntensity = g === obj ? 0.9 : g.userData.base; });
    },
    update(dt, t) {
      let n = 0;
      for (let i = 0; i < NF; i++) {
        const u = (i / NF + t * 0.05) % 1;
        if (i % 3 === 0) main.getPoint(u, tmp); else up.getPoint(u, tmp);
        if (i % 3 === 2) dn.getPoint(u, tmp);
        m4.makeTranslation(tmp.x, tmp.y, tmp.z); flow.setMatrixAt(n++, m4);
      }
      flow.instanceMatrix.needsUpdate = true;
      gates.forEach(g => {
        if (g === hoverObj) return;
        const on = g.userData.k === active;
        g.userData.mat.emissiveIntensity = on ? 0.55 + 0.25 * Math.sin(t * 5) : g.userData.base;
        g.scale.setScalar(1);
      });
      if (hexa) hexa.rotation.z = Math.sin(t * 0.8) * 0.3;
      tri.forEach((m, i) => { m.rotation.z = Math.sin(t * 0.9 + i) * 0.35; });
    },
  };
}
