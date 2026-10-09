// "The Split": β-D-glucose (chair) is phosphorylated, splits between C3 and C4 (as aldolase does on
// fructose 1,6-bisphosphate: C1–C3 → DHAP, C4–C6 → G3P) and ends as two pyruvate: net 2 ATP + 2 NADH.
import { THREE, makeScene, studioLights, label, orbit, atom, bond, glowMat, glowSprite, COLORS, fade, damp } from './kit.js';
import { buildPyruvate, bondMaterial } from './models.js';

const S = 0.62;                                     // scene units per Å
const T = 11;                                       // loop length (s)

function tetra(b, phase = 0) {
  const u = new THREE.Vector3().crossVectors(b, Math.abs(b.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(b, u).normalize();
  const c = Math.cos(109.47 * Math.PI / 180), s = Math.sin(109.47 * Math.PI / 180);
  return [0, 1, 2].map(k => { const a = phase + k * 2 * Math.PI / 3; return b.clone().multiplyScalar(c).addScaledVector(u, s * Math.cos(a)).addScaledVector(v, s * Math.sin(a)).normalize(); });
}

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0, 1.2, 16.5] });
  studioLights(scene, 1.1);
  const root = new THREE.Group(); scene.add(root);

  /* ── build glucose (chair) as two halves ─────────────── */
  const halves = [new THREE.Group(), new THREE.Group()];      // [C1–C3, C4–C6 + ring O]
  halves.forEach(h => root.add(h));
  const bmat = bondMaterial(ctx);
  const mats = [];
  const mk = (el, p, half) => {
    const col = { C: COLORS.carbon, O: COLORS.oxygen, H: 0xc8c8ce }[el];
    const r = { C: 0.33, O: 0.31, H: 0.19 }[el];
    const m = atom(col, r, ctx); m.position.copy(p); halves[half].add(m); mats.push(m.material); return m;
  };
  const link = (a, b, half) => { const m = bond(a.position, b.position, 0.08, bmat); halves[half].add(m); return m; };

  const R = 1.45, H = 0.25;
  const ringAtoms = [];
  for (let i = 0; i < 6; i++) {
    const th = i * Math.PI / 3, h = i % 2 ? -H : H;
    const p = new THREE.Vector3(R * Math.cos(th), h, R * Math.sin(th)).multiplyScalar(S);
    const isO = i === 5;
    const half = i <= 2 ? 0 : 1;
    ringAtoms.push({ m: mk(isO ? 'O' : 'C', p, half), th, h, half });
  }
  // ring bonds; the two that cross the split (C3–C4, O5–C1) live in a separate group
  const cross = new THREE.Group(); root.add(cross);
  const crossMat = bmat.clone();
  for (let i = 0; i < 6; i++) {
    const a = ringAtoms[i], b = ringAtoms[(i + 1) % 6];
    if (a.half === b.half) link(a.m, b.m, a.half);
    else cross.add(bond(a.m.position, b.m.position, 0.08, crossMat));
  }
  // substituents: all equatorial OH (β-anomer), axial H; C5 carries CH2OH (C6)
  const phosAnchors = [];
  ringAtoms.forEach((ra, i) => {
    if (i === 5) return;
    const radial = new THREE.Vector3(Math.cos(ra.th), 0, Math.sin(ra.th));
    const eq = radial.clone().add(new THREE.Vector3(0, -Math.sign(ra.h) * 0.35, 0)).normalize();
    const ax = new THREE.Vector3(0, Math.sign(ra.h), 0);
    const hA = mk('H', ra.m.position.clone().addScaledVector(ax, 1.09 * S), ra.half); link(ra.m, hA, ra.half);
    if (i === 4) {
      const c6 = mk('C', ra.m.position.clone().addScaledVector(eq, 1.52 * S), 1); link(ra.m, c6, 1);
      const d = tetra(eq.clone().negate(), 0.6);
      const o6 = mk('O', c6.position.clone().addScaledVector(d[0], 1.43 * S), 1); link(c6, o6, 1);
      [d[1], d[2]].forEach(v => { const hh = mk('H', c6.position.clone().addScaledVector(v, 1.09 * S), 1); link(c6, hh, 1); });
      const ho = mk('H', o6.position.clone().addScaledVector(d[0].clone().add(new THREE.Vector3(0, 0.7, 0)).normalize(), 0.96 * S), 1); link(o6, ho, 1);
      phosAnchors[1] = o6;                                    // C6 phosphate (hexokinase / glucokinase)
    } else {
      const o = mk('O', ra.m.position.clone().addScaledVector(eq, 1.43 * S), ra.half); link(ra.m, o, ra.half);
      const ho = mk('H', o.position.clone().addScaledVector(eq.clone().add(new THREE.Vector3(0, 0.75, 0)).normalize(), 0.96 * S), ra.half); link(o, ho, ra.half);
      if (i === 0) phosAnchors[0] = o;                        // C1 phosphate (PFK-1)
    }
  });
  // centre
  const box = new THREE.Box3().setFromObject(root), ctr = box.getCenter(new THREE.Vector3());
  [...halves, cross].forEach(g => g.children.forEach(c => c.position.sub(ctr)));
  const restA = halves[0].position.clone(), restB = halves[1].position.clone();

  // phosphate groups
  const phos = phosAnchors.map((o, k) => {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), glowMat(0xff7a45, 1.6));
    g.add(p);
    const dir = o.position.clone().setY(0).normalize();
    g.position.copy(o.position).addScaledVector(dir, 0.55).add(new THREE.Vector3(0, 0.15, 0));
    halves[k].add(g);
    g.visible = false;
    return g;
  });

  // pyruvate × 2 (fade in after the split)
  const pyr = [buildPyruvate(ctx), buildPyruvate(ctx)];
  pyr.forEach(p => { p.traverse(c => { if (c.material) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0; } }); p.scale.setScalar(1.15); root.add(p); });

  // tokens
  const tokenGeo = new THREE.SphereGeometry(0.22, 20, 14);
  const fx = new THREE.Group(); root.add(fx);
  const atpIn = [0, 1].map(() => new THREE.Mesh(tokenGeo, glowMat(COLORS.atp, 2.4)));
  const atpOut = [0, 1, 2, 3].map(() => new THREE.Mesh(tokenGeo, glowMat(COLORS.atp, 2.4)));
  const nadh = [0, 1].map(() => new THREE.Mesh(tokenGeo, glowMat(COLORS.nadh, 2.4)));
  [...atpIn, ...atpOut, ...nadh].forEach(m => { m.visible = false; fx.add(m); });
  const flash = glowSprite(0xffffff, 5, 0); root.add(flash);

  // labels
  const L = {
    glc: label('Glucose <span class="cnum">6C</span>', 'big'),
    c3a: label('3C', 'sm'), c3b: label('3C', 'sm'),
    pyrA: label('Pyruvate <span class="cnum">3C</span>', ''), pyrB: label('Pyruvate <span class="cnum">3C</span>', ''),
    inv: label('−2 ATP', 'sm'), gain: label('+4 ATP · +2 NADH', 'sm'),
    net: label('Net · 2 ATP + 2 NADH', 'big'),
    cyto: label('Cytosol', 'space'), aer: label('O<sub>2</sub> present → mitochondria → CO<sub>2</sub> + H<sub>2</sub>O + energy', 'sm muted'),
  };
  L.glc.position.set(0, 2.5, 0); L.inv.position.set(0, 3.1, 0); L.gain.position.set(0, 3.1, 0); L.net.position.set(0, -2.9, 0);
  L.cyto.position.set(-3.6, 3.6, -1); L.aer.position.set(0, -3.75, 0);
  L.inv.element.style.color = '#ffd60a'; L.gain.element.style.color = '#ffd60a';
  Object.values(L).forEach(l => root.add(l));
  L.c3a.position.set(0, 1.5, 0); halves[0].add(L.c3a); L.c3b.position.set(0, 1.5, 0); halves[1].add(L.c3b);

  halves[0].userData.tip = 'g-half-a'; halves[1].userData.tip = 'g-half-b';
  pyr.forEach(p => { p.userData.tip = 'pyruvate'; });

  const controls = orbit(camera, ctx, new THREE.Vector3(0, 0, 0), { minPolar: 0.5, maxPolar: 2.6 });

  let clock = 0, key = '', step = 0;
  const ease = x => x * x * (3 - 2 * x);
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const show = (l, on, a = 1) => { l.element.classList.toggle('hidden', !on); if (on) l.element.style.opacity = a; };
  const SEP = 2.15;

  function frame(t) {
    // investment: ATP flies in, phosphates appear
    const inv = seg(t, 2.4, 3.6);
    atpIn.forEach((m, k) => {
      m.visible = inv > 0 && inv < 1;
      const target = phos[k].getWorldPosition(new THREE.Vector3()); root.worldToLocal(target);
      m.position.set(k ? 2.6 : -2.6, 3.2, 0.5).lerp(target, ease(inv));
      m.scale.setScalar(1 - inv * 0.6);
    });
    phos.forEach(p => { p.visible = t > 3.5 && t < T - 0.6; p.scale.setScalar(Math.min(1, (t - 3.5) * 4)); });
    // split
    const sp = ease(seg(t, 3.9, 5.0));
    halves[0].position.copy(restA).add(new THREE.Vector3(-SEP * sp, 0.4 * sp, 0));
    halves[1].position.copy(restB).add(new THREE.Vector3(SEP * sp, -0.4 * sp, 0));
    crossMat.opacity = 1 - sp; crossMat.transparent = true; cross.visible = sp < 0.98;
    flash.material.opacity = Math.max(0, 1 - Math.abs(t - 4.1) * 3) * 0.9;
    // halves → pyruvate
    const morph = ease(seg(t, 5.2, 6.2));
    const fadeOut = 1 - ease(seg(t, T - 1.2, T - 0.3));
    const fadeIn = ease(seg(t, 0, 0.8));
    mats.forEach(m => fade(m, Math.min(1 - morph, fadeIn) || 0.0001));
    phos.forEach(p => p.children[0].material.opacity = 1 - morph);
    pyr.forEach((p, k) => {
      p.position.set(k ? SEP + 0.2 : -SEP - 0.2, k ? -0.3 : 0.5, 0);
      p.rotation.y = t * 0.6 + k;
      p.traverse(c => { if (c.material) c.material.opacity = morph * fadeOut; });
    });
    // payoff: 4 ATP + 2 NADH rise from the halves
    const pay = seg(t, 5.6, 7.2);
    atpOut.forEach((m, k) => {
      m.visible = pay > 0 && t < T - 0.3;
      const base = new THREE.Vector3(k < 2 ? -SEP : SEP, k < 2 ? 0.5 : -0.3, 0);
      m.position.copy(base).add(new THREE.Vector3((k % 2 ? 0.5 : -0.5), 1.0 + ease(pay) * 1.6, 0.6));
      m.scale.setScalar(Math.min(1, pay * 3) * fadeOut);
    });
    nadh.forEach((m, k) => {
      m.visible = pay > 0 && t < T - 0.3;
      const base = new THREE.Vector3(k ? SEP : -SEP, k ? -0.3 : 0.5, 0);
      m.position.copy(base).add(new THREE.Vector3(0, -1.2 - ease(pay) * 1.0, 0.6));
      m.scale.setScalar(Math.min(1, pay * 3) * fadeOut);
    });
    // labels
    show(L.glc, t < 3.9, 1 - seg(t, 3.5, 3.9));
    show(L.inv, t > 2.4 && t < 4.4, Math.min(seg(t, 2.4, 2.8), 1 - seg(t, 4.0, 4.4)));
    show(L.c3a, t > 4.3 && t < 5.6, 1 - seg(t, 5.2, 5.6)); show(L.c3b, t > 4.3 && t < 5.6, 1 - seg(t, 5.2, 5.6));
    show(L.pyrA, t > 5.8 && t < T - 0.4, Math.min(seg(t, 5.8, 6.3), fadeOut)); show(L.pyrB, t > 5.8 && t < T - 0.4, Math.min(seg(t, 5.8, 6.3), fadeOut));
    L.pyrA.position.set(-SEP - 0.2, 1.75, 0); L.pyrB.position.set(SEP + 0.2, 0.95, 0);
    show(L.gain, t > 6.0 && t < 8.0, Math.min(seg(t, 6.0, 6.4), 1 - seg(t, 7.6, 8.0)));
    show(L.net, t > 7.6 && t < T - 0.4, Math.min(seg(t, 7.6, 8.1), fadeOut));
  }

  return {
    scene, camera, controls,
    pickables: [...halves, ...pyr],
    bloom: [0.28, 0.4, 0.93],
    show(k, s) {
      key = k; step = s;
      L.cyto.element.classList.toggle('hidden', !(k === 'g-background' && s >= 3));
      L.cyto.element.classList.toggle('focus', k === 'g-background' && s >= 3);
      L.aer.element.classList.toggle('hidden', !(k === 'g-background' && s >= 2));
    },
    update(dt, t) {
      clock = (clock + dt) % T;
      root.rotation.y = Math.sin(t * 0.25) * 0.5;
      root.rotation.x = 0.95 + Math.sin(t * 0.2) * 0.08;
      frame(clock);
    },
    hover() {},
  };
}
