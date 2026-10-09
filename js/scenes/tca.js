// The TCA cycle as a 3D wheel. A carbon cluster travels round; CO2 leaves, NADH/FADH2/GTP pile up in the centre.
// Carbon bookkeeping is faithful: the 2 CO2 of one turn come from oxaloacetate carbons, not the incoming acetyl carbons.
import { THREE, makeScene, studioLights, label, orbit, protein, glowMat, glowSprite, COLORS, damp } from './kit.js';
import { INTERMEDIATES, STEPS } from '../data/tca.js';

const R = 2.85;
const ang = i => Math.PI / 2 - i * Math.PI / 4;                 // node i, clockwise from the top
const pos = (a, r = R, y = 0) => new THREE.Vector3(r * Math.cos(a), y, -r * Math.sin(a));

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0, 12.2, 12.3], target: [0, -0.3, 0.4] });
  studioLights(scene, 1.05);

  const root = new THREE.Group(); scene.add(root);

  // ring
  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0x24242a, roughness: 0.35, metalness: 0.0, clearcoat: 0.6, envMap: ctx.envMap, envMapIntensity: 0.45, emissive: 0xff9f0a, emissiveIntensity: 0.05 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.11, 24, 220), ringMat);
  ring.rotation.x = Math.PI / 2;
  root.add(ring);

  // flowing light along the ring (clockwise)
  const NF = 60;
  const flow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), glowMat(0xffb340, 2.2), NF);
  root.add(flow);
  const m4 = new THREE.Matrix4();

  // intermediates
  const nodes = INTERMEDIATES.map((it, i) => {
    const g = new THREE.Group();
    g.position.copy(pos(ang(i)));
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 24), protein(0x5a5a64, ctx, { roughness: 0.3, clearcoat: 1, emissive: 0.0, env: 0.5 }));
    g.add(orb);
    const lb = label(`${it.n}<span class="cnum">${it.c}C</span>`, '');
    const out = pos(ang(i), R + 1.0, 0).sub(g.position);
    lb.position.copy(out);
    g.add(lb);
    g.userData = { orb, lb };
    root.add(g);
    return g;
  });

  // enzyme gates between nodes
  const gates = STEPS.slice(1).map((st, k) => {
    const a = ang(k) - Math.PI / 8;                              // between node k and k+1
    const g = new THREE.Group();
    g.position.copy(pos(a));
    g.rotation.y = a;                                            // ring around the tube
    const col = st.reg ? 0xff453a : 0xbfc3cc;
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 16, 40), protein(col, ctx, { emissive: st.reg ? 0.2 : 0.02, clearcoat: 1, env: 0.5 }));
    g.add(torus);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
    g.add(hit);
    const lb = label(st.short, 'sm');
    lb.position.copy(pos(a, R - 1.15).sub(g.position)).applyAxisAngle(new THREE.Vector3(0, 1, 0), -a);
    g.add(lb);
    g.userData = { tip: st.tip, torus, lb, base: st.reg ? 0.2 : 0.02 };
    root.add(g);
    return g;
  });

  // carbon cluster
  const carbonMat = protein(0xd0d0d8, ctx, { roughness: 0.3, clearcoat: 1, emissive: 0.12 });
  const acetylMat = protein(COLORS.acetyl, ctx, { roughness: 0.3, clearcoat: 1, emissive: 0.35 });
  const cGeo = new THREE.SphereGeometry(0.2, 24, 16);
  const cluster = new THREE.Group(); root.add(cluster);
  const carbons = [];
  const mk = (acetyl) => { const m = new THREE.Mesh(cGeo, acetyl ? acetylMat : carbonMat); m.userData.acetyl = acetyl; cluster.add(m); carbons.push(m); return m; };
  const clLabel = label('', 'big'); clLabel.position.set(0, 0.62, 0); cluster.add(clLabel);
  function layout(instant) {
    const n = carbons.length;
    carbons.forEach((c, i) => {
      const x = (i - (n - 1) / 2) * 0.33, y = (i % 2 ? 0.12 : -0.12), z = (i % 2 ? 0.08 : -0.08);
      if (instant) c.position.set(x, y, z);
      else gsap.to(c.position, { x, y, z, duration: 0.6, ease: 'power2.out' });
    });
    clLabel.element.textContent = n + 'C';
  }

  // acetyl CoA arriving, CO2 leaving, tokens
  const tokenGeo = new THREE.SphereGeometry(0.17, 24, 16);
  const tokens = [];       // products parked in the centre
  const fx = new THREE.Group(); root.add(fx);
  const COL = { nadh: COLORS.nadh, fadh: COLORS.fadh, gtp: COLORS.gtp };
  const TXT = { nadh: 'NADH', fadh: 'FADH<sub>2</sub>', gtp: 'GTP' };
  const parkSlot = { nadh: [-0.9, 0.2], fadh: [0.45, 0.2], gtp: [1.0, 0.2] };

  const centreLbl = label('', 'sm muted'); centreLbl.position.set(0, 0, 1.0); root.add(centreLbl);

  function spawnToken(kind, from, order, instant) {
    const m = new THREE.Mesh(tokenGeo, glowMat(COL[kind], 2.4));
    m.position.copy(from);
    fx.add(m);
    const n = tokens.filter(t => t.kind === kind).length;
    const [px, pz] = parkSlot[kind];
    const tx = px + (kind === 'nadh' ? n * 0.42 : 0), tz = pz - 0.1;
    const lb = label(TXT[kind], 'sm'); lb.position.set(0, 0.38, 0); m.add(lb);
    if (instant) m.position.set(tx, 0.1, tz);
    else {
      gsap.fromTo(m.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.5, delay: order * 0.25 });
      gsap.to(m.position, { x: tx, y: 0.1, z: tz, duration: 1.2, delay: 0.35 + order * 0.25, ease: 'power3.inOut' });
    }
    tokens.push({ kind, m, lb });
  }
  function spawnCO2(from) {
    // remove an oxaloacetate-derived carbon
    const idx = carbons.findIndex(c => !c.userData.acetyl);
    const c = carbons.splice(idx >= 0 ? idx : 0, 1)[0];
    const wp = c.getWorldPosition(new THREE.Vector3());
    root.worldToLocal(wp);
    cluster.remove(c);
    const g = new THREE.Group(); g.position.copy(wp); fx.add(g);
    const cm = new THREE.Mesh(cGeo, carbonMat); g.add(cm);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), protein(COLORS.oxygen, ctx, { emissive: 0.2 })); o.position.x = s * 0.27; g.add(o); }
    const halo = glowSprite(COLORS.co2, 1.1, 0.7); g.add(halo);
    const lb = label('CO<sub>2</sub>', 'sm'); lb.position.set(0, 0.42, 0); g.add(lb);
    const dir = from.clone().setY(0).normalize();
    gsap.to(g.position, { x: wp.x + dir.x * 2.6, y: 1.6, z: wp.z + dir.z * 2.6, duration: 2.2, ease: 'power2.out' });
    gsap.to(g.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 2.2 });
    gsap.to(halo.material, { opacity: 0, duration: 2.6, delay: 0.4 });
    gsap.to(lb.element.style, { opacity: 0, duration: 1, delay: 1.8, onComplete: () => fx.remove(g) });
    layout();
  }
  function spawnWater(at) {
    const g = new THREE.Group();
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), protein(COLORS.oxygen, ctx, { emissive: 0.15 })); g.add(o);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), protein(0xffffff, ctx)); h.position.set(s * 0.15, 0.1, 0); g.add(h); }
    const lb = label('H<sub>2</sub>O', 'sm'); lb.position.set(0, 0.36, 0); g.add(lb);
    const out = at.clone().setY(0).normalize().multiplyScalar(R + 1.8);
    g.position.set(out.x, 0.9, out.z); fx.add(g);
    gsap.to(g.position, { x: at.x, y: 0, z: at.z, duration: 1.1, ease: 'power2.in', onComplete: () => { fx.remove(g); } });
  }

  // state
  let cur = -1;
  function reset() {
    carbons.splice(0).forEach(c => cluster.remove(c));
    tokens.splice(0).forEach(t => fx.remove(t.m));
    fx.clear();
    for (let i = 0; i < 4; i++) mk(false);
    layout(true);
    cluster.position.copy(pos(ang(0))).setY(0.55);
    cur = 0;
  }

  // move cluster along the arc from node a to node b
  function travel(a, b, dur = 1.2) {
    const a0 = ang(a), a1 = ang(b) > a0 ? ang(b) - Math.PI * 2 : ang(b);
    const o = { t: 0 };
    gsap.to(o, { t: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => { cluster.position.copy(pos(a0 + (a1 - a0) * o.t)).setY(0.55); } });
  }

  function applyStep(s, instant) {
    // build state 0..s, animating only the last step
    if (s === 0) { reset(); cluster.visible = false; return; }
    cluster.visible = true;
    if (instant || s < cur || cur < 0) {
      reset();
      for (let k = 1; k <= Math.min(s, 8); k++) doStep(k, true);
      cur = s; return;
    }
    for (let k = cur + 1; k <= s; k++) doStep(k, k !== s);
    cur = s;
  }

  function doStep(k, quick) {
    if (k > 8) return;
    const st = STEPS[k];
    const from = pos(ang(k - 1)), to = pos(ang(k % 8));
    const gatePos = gates[k - 1].position.clone();
    if (k === 1) {
      // acetyl CoA (2 acetyl carbons) joins oxaloacetate
      const a1 = mk(true), a2 = mk(true);
      if (quick) { layout(true); }
      else {
        const start = cluster.worldToLocal(root.localToWorld(pos(ang(0) - 0.55, R + 2.2, 1.4)));
        [a1, a2].forEach((c, i) => { c.position.copy(start).add(new THREE.Vector3(i * 0.27, 0, 0)); });
        layout();
        const lb = label('Acetyl CoA <span class="cnum">2C</span>', 'sm'); lb.position.copy(pos(ang(0) - 0.55, R + 2.2, 1.9)); fx.add(lb);
        gsap.to(lb.element.style, { opacity: 0, duration: 0.8, delay: 1.3, onComplete: () => fx.remove(lb) });
      }
    }
    if (quick) {
      st.out.forEach(o => {
        if (o === 'co2') { const i = carbons.findIndex(c => !c.userData.acetyl); cluster.remove(carbons.splice(i, 1)[0]); layout(true); }
        else spawnToken(o, gatePos, 0, true);
      });
      cluster.position.copy(to).setY(0.55);
      return;
    }
    travel(k - 1, k % 8, 1.4);
    let order = 0;
    setTimeout(() => {
      st.out.forEach(o => { if (o === 'co2') spawnCO2(gatePos); else spawnToken(o, gatePos.clone().setY(0.4), order++); });
      if (st.in) spawnWater(gatePos);
    }, 650);
  }

  const controls = orbit(camera, ctx, new THREE.Vector3(0, -0.3, 0.4), { minPolar: 0.15, maxPolar: 1.25, minAzimuth: -0.9, maxAzimuth: 0.9 });

  let active = 0, hoverObj = null;
  function focus(s) {
    active = s;
    gates.forEach((g, i) => {
      const on = s === i + 1;
      g.userData.lb.element.classList.toggle('focus', on);
      g.userData.lb.element.classList.toggle('hidden', !(on || s === 0 || s === 9));
      g.userData.lb.element.classList.toggle('muted', s === 0 || s === 9);
    });
    nodes.forEach((n, i) => {
      const on = s >= 1 && s <= 8 && (i === s % 8 || i === s - 1);
      n.userData.lb.element.classList.toggle('focus', s >= 1 && s <= 8 && i === s % 8);
      n.userData.lb.element.style.opacity = s >= 1 && s <= 8 && !on ? 0.45 : 1;
    });
  }

  reset(); cluster.visible = false;

  return {
    scene, camera, controls,
    pickables: gates,
    bloom: [0.4, 0.45, 0.9],
    show(key, s, slide, changed) {
      if (changed) { cur = -1; applyStep(s, true); }
      else applyStep(s, false);
      focus(s);
    },
    hover(obj) {
      hoverObj = obj;
      gates.forEach(g => { g.userData.torus.material.emissiveIntensity = g === obj ? 0.9 : g.userData.base; });
    },
    update(dt, t) {
      // ring flow
      for (let i = 0; i < NF; i++) {
        const a = Math.PI / 2 - ((i / NF + t * 0.045) % 1) * Math.PI * 2;
        m4.makeTranslation(R * Math.cos(a), 0, -R * Math.sin(a));
        flow.setMatrixAt(i, m4);
      }
      flow.instanceMatrix.needsUpdate = true;
      gates.forEach((g, i) => {
        if (g === hoverObj) return;
        const on = active === i + 1;
        g.userData.torus.material.emissiveIntensity = on ? 0.6 + 0.3 * Math.sin(t * 5) : g.userData.base;
        g.userData.torus.scale.setScalar(on ? 1.25 : 1);
      });
      nodes.forEach((n, i) => { n.userData.orb.material.emissive.setHex(0xffb340); n.userData.orb.material.emissiveIntensity = active >= 1 && active <= 8 && i === active % 8 ? 0.6 + 0.2 * Math.sin(t * 4) : 0.0; });
      cluster.rotation.y = Math.sin(t * 0.8) * 0.3;
      ringMat.emissiveIntensity = 0.06 + (active >= 1 && active <= 8 ? 0.06 : 0);
    },
  };
}
