// Red blood cell (Evans–Fung biconcave profile) that morphs into a spiculated cell in pyruvate kinase
// deficiency: ATP falls → Na⁺/K⁺-ATPase fails → K⁺ leaks out fast, Na⁺ in slowly → cell shrinks and spiculates.
import { THREE, makeScene, studioLights, label, orbit, glowMat, glowSprite, COLORS, damp, mulberry } from './kit.js';

const R0 = 2.2;                          // cell radius (scene units) ≈ 3.91 µm
const K = R0 / 3.91;                     // units per µm
const C0 = 0.81, C1 = 7.83, C2 = -4.39;  // Evans & Fung (µm)
const NU = 90, NV = 128;

function halfThick(rho) {               // half-thickness at normalised radius rho (scene units)
  const r2 = rho * rho;
  return 0.5 * Math.sqrt(Math.max(0, 1 - r2)) * (C0 + C1 * r2 + C2 * r2 * r2) * K;
}

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0, 4.2, 12.5] });
  studioLights(scene, 1.1);
  const root = new THREE.Group(); scene.add(root);
  const rnd = mulberry(17);

  // spike directions (Fibonacci sphere)
  const spikes = [];
  const NS = 34;
  for (let i = 0; i < NS; i++) {
    const y = 1 - (i + 0.5) / NS * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
    spikes.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }

  // two vertex sets with identical topology: biconcave disc and spiculated spheroid
  const count = (NU * 2 + 1) * (NV + 1);
  const A = new Float32Array(count * 3), B = new Float32Array(count * 3);
  const idx = [];
  let k = 0;
  for (let i = 0; i <= NU * 2; i++) {
    const top = i <= NU;
    const u = top ? i / NU : (NU * 2 - i) / NU;          // 0 centre → 1 rim → 0 centre
    const rho = Math.sin(u * Math.PI / 2);
    for (let j = 0; j <= NV; j++) {
      const th = j / NV * Math.PI * 2;
      const c = Math.cos(th), s = Math.sin(th);
      const z = Math.max(halfThick(rho), 0.004) * (top ? 1 : -1);
      A.set([rho * R0 * c, z, rho * R0 * s], k * 3);
      // spheroid
      const a = R0 * 0.8, b = R0 * 0.52;
      const py = Math.sqrt(Math.max(0, 1 - rho * rho)) * b * (top ? 1 : -1);
      const p = new THREE.Vector3(rho * a * c, py, rho * a * s);
      const n = p.clone().normalize();
      let d = 0;
      for (const sp of spikes) { const ang = n.angleTo(sp); d += Math.exp(-(ang * ang) / (0.13 * 0.13)); }
      p.addScaledVector(n, Math.min(d, 1.2) * 0.42);
      B.set([p.x, p.y, p.z], k * 3);
      k++;
    }
  }
  for (let i = 0; i < NU * 2; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(A);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xb0001c, roughness: 0.4, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35,
    sheen: 0.55, sheenColor: new THREE.Color(0xff6b6b), sheenRoughness: 0.5,
    envMap: ctx.envMap, envMapIntensity: 0.7, emissive: 0x6a0012, emissiveIntensity: 0.3, side: THREE.DoubleSide,
  });
  const cell = new THREE.Mesh(geo, mat);
  cell.userData.tip = 'rbc-normal';
  root.add(cell);

  // Na⁺/K⁺ pumps around the rim
  const pumps = [];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    const g = glowSprite(0x64d2ff, 0.9, 0.9);
    g.userData.a = a;
    root.add(g); pumps.push(g);
  }
  // ions & ATP sparkles (instanced)
  const ion = (n, color, r) => { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), glowMat(color, 2.2), n); m.frustumCulled = false; root.add(m); return m; };
  const NK = 46, NNa = 40, NA = 40;
  const kMesh = ion(NK, 0xbf5af2, 0.075), naMesh = ion(NNa, 0x30d158, 0.075), atpMesh = ion(NA, COLORS.atp, 0.06);
  const kP = Array.from({ length: NK }, () => ({ r: rnd() * 0.8, a: rnd() * 6.28, y: (rnd() - 0.5), s: rnd(), out: 0 }));
  const naP = Array.from({ length: NNa }, () => ({ r: 1.25 + rnd() * 0.6, a: rnd() * 6.28, y: (rnd() - 0.5) * 2.2, s: rnd(), inw: 0 }));
  const atpP = Array.from({ length: NA }, () => ({ r: rnd() * 0.75, a: rnd() * 6.28, y: (rnd() - 0.5), ph: rnd() * 6 }));

  // labels
  const L = {
    shape: label('Biconcave · flexible', ''), pump: label('Na<sup>+</sup>/K<sup>+</sup>-ATPase', 'sm'),
    atp: label('ATP ↓ → pump fails', 'sm'), k: label('K<sup>+</sup> out · fast', 'sm'), na: label('Na<sup>+</sup> in · slow', 'sm'),
    spic: label('Shrunken · rigid · spiculated', ''), spleen: label('→ removed by the spleen (hemolysis)', 'sm'),
    bpg: label('2,3-BPG ↑ → O<sub>2</sub> released more easily', 'sm'),
  };
  L.shape.position.set(0, 2.1, 0); L.spic.position.set(0, 2.5, 0);
  L.pump.position.set(R0 + 0.35, 0.65, 0.6); L.atp.position.set(-R0 - 0.2, 1.3, 0.4);
  L.k.position.set(R0 + 0.6, -0.9, 0.6); L.na.position.set(-R0 - 0.5, -0.8, 0.6);
  L.spleen.position.set(0, -2.45, 0); L.bpg.position.set(0, -3.0, 0);
  L.atp.element.style.color = '#ffd60a'; L.k.element.style.color = '#d6a6ff'; L.na.element.style.color = '#30d158';
  L.bpg.element.style.color = '#ff9f9f';
  Object.values(L).forEach(l => scene.add(l));        // fixed in view, not orbiting with the cell

  const controls = orbit(camera, ctx, new THREE.Vector3(0, 0, 0), { minPolar: 0.2, maxPolar: 2.9 });

  const st = { m: 0, atp: 1 }, tg = { m: 0, atp: 1 };
  let lastM = -1, step = 0, pkOn = false;
  const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);

  function apply() {
    const def = pkOn || step >= 3;
    tg.m = def ? 1 : 0;
    tg.atp = def || step >= 2 ? 0.12 : 1;
    const show = (l, on) => l.element.classList.toggle('hidden', !on);
    show(L.shape, !def); show(L.spic, def);
    show(L.pump, true); show(L.atp, def || step >= 2);
    show(L.k, def); show(L.na, def);
    show(L.spleen, def && (step >= 4 || pkOn)); show(L.bpg, def && (step >= 4 || pkOn));
    cell.userData.tip = def ? 'rbc-spic' : 'rbc-normal';
  }

  return {
    scene, camera, controls,
    pickables: [cell],
    bloom: [0.4, 0.45, 0.9],
    show(key, s, slide, changed) {
      step = s;
      const seg = slide.querySelector('[data-control="pk"] .on');
      pkOn = seg ? seg.dataset.val === 'on' : false;
      if (s >= 3 && !pkOn) { pkOn = false; }
      slide.querySelectorAll('[data-control="pk"] button').forEach(b => b.classList.toggle('on', (b.dataset.val === 'on') === (pkOn || s >= 3)));
      apply();
    },
    control(name, val) { if (name === 'pk') { pkOn = val === 'on'; if (!pkOn && step >= 3) step = 2; apply(); } },
    hover(obj) { mat.emissiveIntensity = obj ? 0.6 : 0.35; },
    update(dt, t) {
      st.m = damp(st.m, tg.m, 1.4, dt); st.atp = damp(st.atp, tg.atp, 1.8, dt);
      if (Math.abs(st.m - lastM) > 0.002) {
        for (let i = 0; i < pos.length; i++) pos[i] = A[i] + (B[i] - A[i]) * st.m;
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
        lastM = st.m;
      }
      root.rotation.y = t * 0.18;
      const scale = 1 - st.m * 0.08;
      // pumps
      pumps.forEach(p => {
        const rr = (R0 - st.m * 0.5) * 1.0;
        p.position.set(Math.cos(p.userData.a) * rr, 0, Math.sin(p.userData.a) * rr);
        p.material.opacity = 0.25 + 0.65 * st.atp * (0.7 + 0.3 * Math.sin(t * 4 + p.userData.a * 3));
        p.scale.setScalar(0.7 + 0.4 * st.atp);
      });
      // K⁺ leaks out quickly when the pump fails
      kP.forEach((p, i) => {
        if (st.m > 0.3) p.out = Math.min(1, p.out + dt * (0.18 + p.s * 0.35));
        else p.out = Math.max(0, p.out - dt * 0.4);
        const r = (p.r + p.out * 2.4) * R0 * (1 - st.m * 0.25);
        const a = p.a + t * 0.15;
        v.set(Math.cos(a) * r, p.y * (0.5 + p.out * 1.5), Math.sin(a) * r);
        m4.compose(v, q, one.set(1, 1, 1).multiplyScalar(p.out > 0.95 ? 0.0001 : 1)); kMesh.setMatrixAt(i, m4);
        if (p.out >= 1) { p.out = 0; p.r = rnd() * 0.8; }
      });
      kMesh.instanceMatrix.needsUpdate = true;
      // Na⁺ drifts in slowly
      naP.forEach((p, i) => {
        if (st.m > 0.3) p.inw = Math.min(1, p.inw + dt * 0.06 * (0.5 + p.s));
        else p.inw = Math.max(0, p.inw - dt * 0.3);
        const r = (p.r - p.inw * 1.1) * R0;
        const a = p.a - t * 0.1;
        v.set(Math.cos(a) * r, p.y * (1 - p.inw * 0.6), Math.sin(a) * r);
        m4.compose(v, q, one.set(1, 1, 1)); naMesh.setMatrixAt(i, m4);
        if (p.inw >= 1) { p.inw = 0; }
      });
      naMesh.instanceMatrix.needsUpdate = true;
      // ATP sparkles: count follows ATP level
      atpP.forEach((p, i) => {
        const on = i / NA < st.atp;
        const a = p.a + t * 0.5;
        v.set(Math.cos(a) * p.r * R0 * scale, p.y * 0.35 + Math.sin(t * 2 + p.ph) * 0.05, Math.sin(a) * p.r * R0 * scale);
        m4.compose(v, q, one.set(1, 1, 1).multiplyScalar(on ? 1 : 0.0001)); atpMesh.setMatrixAt(i, m4);
      });
      atpMesh.instanceMatrix.needsUpdate = true;
      cell.scale.setScalar(scale);
    },
  };
}
