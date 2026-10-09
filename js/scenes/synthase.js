// ATP synthase close-up (oriented like the textbook figure: F1 up in the matrix, Fo in the membrane).
// Rotor = c-ring + γ + ε; stator = a + peripheral stalk + δ + α3β3. Protons enter via a, ride the ring, exit
// to the matrix; every 120° of rotation one β subunit releases an ATP (3 per turn). Oligomycin jams Fo.
import { THREE, makeScene, studioLights, label, orbit, protein, blob, glowMat, glowSprite, COLORS, damp, mulberry, clamp, fade } from './kit.js';

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [2.2, 2.6, 14.5], target: [0, 1.55, 0] });
  studioLights(scene, 1.05);
  const root = new THREE.Group(); scene.add(root);
  const rnd = mulberry(8);

  // membrane disc
  const heads = [];
  for (let x = -3.0; x <= 3.6; x += 0.24) for (let z = -2.6; z <= 2.6; z += 0.24) {
    if ((x - 0.3) * (x - 0.3) / 10.9 + z * z / 6.8 > 1) continue;
    if (Math.hypot(x, z) < 1.05 || Math.hypot(x - 1.3, z) < 0.55) continue;
    heads.push([x, z]);
  }
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), protein(0xffb08a, ctx, { emissive: 0.02, env: 0.4, roughness: 0.55, clearcoat: 0.2 }), heads.length * 2);
  const m4 = new THREE.Matrix4(); let k = 0;
  heads.forEach(([x, z]) => { for (const y of [0.62, -0.62]) { m4.makeTranslation(x, y, z); im.setMatrixAt(k++, m4); } });
  im.userData.tip = 'inner-mem';
  root.add(im);

  const parts = {};   // name → { group, mats[] }
  const reg = (name, obj, tip) => { obj.userData.tip = tip; parts[name] = obj; return obj; };

  // rotor
  const rotor = new THREE.Group(); root.add(rotor);
  const cring = new THREE.Group(); rotor.add(cring);
  const cSubs = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.05, 8, 16), protein(0xff9f0a, ctx, { emissive: 0.08, clearcoat: 0.9 }));
    c.position.set(Math.cos(a) * 0.72, 0, Math.sin(a) * 0.72); cring.add(c); cSubs.push(c);
  }
  reg('c', cring, 'sub-c');
  const gamma = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.3, 20), protein(0x30d158, ctx, { emissive: 0.1 }));
  gamma.position.set(0.05, 1.75, 0); gamma.rotation.z = 0.06; rotor.add(gamma);
  const eps = new THREE.Mesh(blob(1, { detail: 3, amp: 0.1, seed: 3, scale: [0.26, 0.22, 0.26] }), protein(0x7ee6a0, ctx, { emissive: 0.1 }));
  eps.position.set(0.32, 0.92, 0.1); rotor.add(eps);
  reg('g', gamma, 'sub-g'); eps.userData.tip = 'sub-g';
  // a cam on γ shows which β is being squeezed
  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), protein(0x30d158, ctx, { emissive: 0.3 }));
  cam.position.set(0.3, 2.45, 0); rotor.add(cam);

  // stator: a subunit, peripheral stalk, δ, α3β3
  const aSub = new THREE.Mesh(blob(1, { detail: 4, amp: 0.1, seed: 9, scale: [0.42, 0.72, 0.5] }), protein(0xff6482, ctx, { emissive: 0.08 }));
  aSub.position.set(1.3, -0.02, 0); root.add(aSub); reg('a', aSub, 'sub-a');
  const stalk = new THREE.CatmullRomCurve3([new THREE.Vector3(1.45, 0.4, 0), new THREE.Vector3(1.65, 1.6, 0), new THREE.Vector3(1.55, 3.0, 0), new THREE.Vector3(1.05, 4.05, 0), new THREE.Vector3(0.55, 4.25, 0)]);
  const bMesh = new THREE.Mesh(new THREE.TubeGeometry(stalk, 40, 0.11, 12), protein(0xbf8cff, ctx, { emissive: 0.08 }));
  root.add(bMesh); reg('b', bMesh, 'sub-b');
  const delta = new THREE.Mesh(blob(1, { detail: 3, amp: 0.1, seed: 11, scale: [0.42, 0.3, 0.42] }), protein(0xff453a, ctx, { emissive: 0.12 }));
  delta.position.set(0.25, 4.32, 0); root.add(delta); reg('d', delta, 'sub-d');
  const hexa = new THREE.Group(); hexa.position.y = 3.05; root.add(hexa);
  const betas = [];
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + Math.PI / 6;
    const isB = i % 2 === 0;
    const lobe = new THREE.Mesh(blob(1, { detail: 4, amp: 0.07, seed: 20 + i, scale: [0.46, 0.98, 0.46] }), protein(isB ? 0x5ac8fa : 0x7d7aff, ctx, { emissive: 0.07, clearcoat: 0.9 }));
    lobe.position.set(Math.cos(a) * 0.66, 0, Math.sin(a) * 0.66);
    lobe.userData.tip = 'sub-ab';
    hexa.add(lobe);
    if (isB) betas.push({ lobe, a });
  }
  reg('ab', hexa, 'sub-ab');

  // oligomycin plug
  const plug = new THREE.Group();
  const pm = new THREE.Mesh(blob(1, { detail: 3, amp: 0.18, seed: 60, scale: [0.32, 0.28, 0.32] }), protein(0xff453a, ctx, { emissive: 0.35 }));
  plug.add(pm); plug.add(glowSprite(0xff453a, 1.6, 0.45));
  plug.position.set(0.98, 0.0, 0.42); plug.visible = false; plug.userData.tip = 'oligomycin';
  root.add(plug);

  // labels
  const L = {};
  const addL = (key, html, cls, p, parent = root) => { const l = label(html, cls); l.position.set(...p); parent.add(l); L[key] = l; return l; };
  addL('F1', 'F<sub>1</sub> · matrix', 'big', [-2.4, 3.1, 0]);
  addL('F0', 'F<sub>o</sub> · membrane', 'big', [-2.0, 0.95, 0.8]);
  addL('ab', 'α<sub>3</sub>β<sub>3</sub>', 'sm', [-0.95, 4.05, 0.6]);
  addL('g', 'γ', 'sm', [-0.45, 1.75, 0.4]);
  addL('d', 'δ', 'sm', [0.25, 4.85, 0]);
  addL('b', 'b', 'sm', [2.05, 1.9, 0]);
  addL('a', 'a', 'sm', [1.95, -0.25, 0.5]);
  addL('c', 'c-ring', 'sm', [-0.15, -1.15, 1.0]);
  addL('mx', 'Matrix', 'space', [-3.6, 5.0, -1]);
  addL('ims', 'Intermembrane space', 'space', [-2.8, -1.85, -1]);
  addL('atp', 'ADP + P<sub>i</sub> → ATP', 'sm', [2.3, 3.6, 0.6]);
  addL('oligo', 'Oligomycin', 'sm', [2.25, 0.55, 0.9]);
  L.atp.element.style.color = '#ffd60a'; L.oligo.element.style.color = '#ff6961';

  // particles
  const hMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 12, 10), glowMat(COLORS.h, 2.3), 60); hMesh.count = 0; hMesh.frustumCulled = false; root.add(hMesh);
  const aMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 16, 12), glowMat(COLORS.atp, 2.4), 30); aMesh.count = 0; aMesh.frustumCulled = false; root.add(aMesh);
  const protons = [], atps = [];
  const S = { omega: 0, omegaT: 0, angle: 0, nextATP: Math.PI * 2 / 3, run: false, oligo: false, spawn: 0, plugIn: 0 };

  const controls = orbit(camera, ctx, new THREE.Vector3(0, 1.55, 0), { minPolar: 0.6, maxPolar: 2.2 });

  const groups = { F0: [cring, aSub, bMesh], F1: [hexa, gamma, eps, delta, cam] };
  let hl = null;
  function highlight(name) {
    hl = name;
    const on = o => !name || groups[name]?.includes(o);
    [cring, aSub, bMesh, hexa, gamma, eps, delta, cam].forEach(o => {
      o.traverse(m => { if (m.isMesh && m.material) { fade(m.material, on(o) ? 1 : 0.12); if (m.material.emissive) m.material.emissiveIntensity = name && on(o) ? 0.32 : 0.08; } });
    });
    L.F1.element.classList.toggle('focus', name === 'F1'); L.F0.element.classList.toggle('focus', name === 'F0');
  }

  let key = '', step = 0;
  function setOligo(on) {
    S.oligo = on; plug.visible = true;
    gsap.to(S, { plugIn: on ? 1 : 0, duration: 1.0, ease: on ? 'back.out(1.6)' : 'power2.in', onComplete: () => { if (!on) plug.visible = false; } });
    L.oligo.element.classList.toggle('hidden', !on);
    L.atp.element.classList.toggle('hidden', on);
  }

  return {
    scene, camera, controls,
    pickables: [plug, aSub, bMesh, delta, gamma, eps, cring, hexa, im],
    bloom: [0.45, 0.45, 0.86],
    show(k, s, slide, changed) {
      key = k; step = s;
      ['F1', 'F0', 'ab', 'g', 'd', 'b', 'a', 'c', 'mx', 'ims', 'atp', 'oligo'].forEach(n => L[n].element.classList.remove('hidden'));
      L.oligo.element.classList.add('hidden');
      if (k === 'atp-synthase') {
        highlight(s === 1 ? 'F0' : s === 2 ? 'F1' : null);
        S.run = s >= 3 || s === 0; S.omegaT = s >= 3 ? 1.5 : 0.35;
        if (changed && S.oligo) setOligo(false);
        L.atp.element.classList.toggle('hidden', s < 3);
      } else if (k === 'oligomycin') {
        highlight(null);
        S.run = true;
        const segOn = slide.querySelector('[data-control="oligo"] .on')?.dataset.val === 'on';
        const want = s >= 1 || segOn;
        if (want !== S.oligo) setOligo(want);
        L.oligo.element.classList.toggle('hidden', !want); L.atp.element.classList.toggle('hidden', want);
        slide.querySelectorAll('[data-control="oligo"] button').forEach(b => b.classList.toggle('on', (b.dataset.val === 'on') === want));
        S.omegaT = 1.5;
      }
    },
    control(name, val) { if (name === 'oligo') setOligo(val === 'on'); },
    highlight(name, on) { highlight(on ? name : (key === 'atp-synthase' ? (step === 1 ? 'F0' : step === 2 ? 'F1' : null) : null)); },
    hover(obj) {},
    update(dt, t) {
      // protons arrive from the IMS while running and not jammed
      const jam = S.oligo ? 1 : 0;
      const target = S.run ? S.omegaT * (1 - jam) : 0;
      S.omega = damp(S.omega, target, S.oligo ? 3 : 1.5, dt);
      S.angle += S.omega * dt;
      rotor.rotation.y = -S.angle;
      if (S.run && step >= (key === 'atp-synthase' ? 3 : 0)) {
        S.spawn += dt * (S.oligo ? 0.6 : S.omegaT * 1.25);
        if (S.spawn >= 1 && protons.length < 40) { S.spawn = 0; protons.push({ st: 'in', p: new THREE.Vector3(1.2 + rnd() * 0.6, -2.2, (rnd() - 0.5) * 0.6), ang: 0, t: 0 }); }
      }
      // proton states
      for (let i = protons.length - 1; i >= 0; i--) {
        const h = protons[i];
        if (h.st === 'in') {
          const tgt = new THREE.Vector3(1.0, -0.45, 0.15);
          if (S.oligo) tgt.set(1.25 + (i % 4) * 0.12, -1.25 - Math.floor(i / 4) * 0.18, 0.4);
          h.p.lerp(tgt, 1 - Math.exp(-dt * 2.5));
          if (!S.oligo && h.p.distanceTo(tgt) < 0.06) { h.st = 'ride'; h.ang = S.angle; h.start = S.angle; }
        } else if (h.st === 'ride') {
          // carried round on a c subunit (about 300°) at mid-membrane, then released upward
          const rel = S.angle - h.start;
          const a = rel;                                           // c subunits advance with the rotor angle
          h.p.set(Math.cos(a) * 0.95, 0.0, Math.sin(a) * 0.95 * 1.0);
          if (rel > Math.PI * 1.7) { h.st = 'out'; h.v = new THREE.Vector3(0.3, 1.2, 0.2); }
        } else if (h.st === 'out') {
          h.p.addScaledVector(h.v, dt);
          h.t += dt;
          if (h.t > 1.4) protons.splice(i, 1);
        }
      }
      // 3 ATP per turn
      while (S.angle >= S.nextATP) {
        S.nextATP += Math.PI * 2 / 3;
        if (S.run && atps.length < 24 && (key !== 'atp-synthase' || step >= 3)) {
          const b = betas[atps.length % 3];
          const p = new THREE.Vector3(Math.cos(b.a) * 1.1, 3.4, Math.sin(b.a) * 1.1);
          atps.push({ p, v: p.clone().setY(0).normalize().multiplyScalar(0.7).setY(0.55), t: 0 });
        }
      }
      for (let i = atps.length - 1; i >= 0; i--) { const a = atps[i]; a.t += dt; a.p.addScaledVector(a.v, dt); if (a.t > 2.4) atps.splice(i, 1); }
      // draw
      const Q = new THREE.Quaternion(), V1 = new THREE.Vector3();
      let n = 0;
      protons.forEach(h => { const mm = new THREE.Matrix4().compose(h.p, Q, V1.set(1, 1, 1).multiplyScalar(h.st === 'out' ? Math.max(0, 1 - h.t / 1.4) : 1)); hMesh.setMatrixAt(n++, mm); });
      hMesh.count = n; hMesh.instanceMatrix.needsUpdate = true;
      n = 0;
      atps.forEach(a => { const s = Math.min(1, a.t * 3) * (a.t > 1.8 ? (2.4 - a.t) / 0.6 : 1); aMesh.setMatrixAt(n++, new THREE.Matrix4().compose(a.p, Q, V1.set(s, s, s))); });
      aMesh.count = n; aMesh.instanceMatrix.needsUpdate = true;
      // β subunit "breathing" as the γ cam passes (binding change)
      betas.forEach(b => {
        const d = Math.cos(b.a - S.angle);                           // cam faces this β when d → 1
        b.lobe.scale.set(1 - Math.max(0, d) * 0.08, 1, 1 - Math.max(0, d) * 0.08);
        if (!hl) b.lobe.material.emissiveIntensity = 0.07 + Math.max(0, d) * 0.25 * (S.omega > 0.2 ? 1 : 0);
      });
      plug.position.set(0.98 + (1 - S.plugIn) * 1.8, (1 - S.plugIn) * -1.2, 0.42);
      plug.scale.setScalar(0.2 + S.plugIn * 0.8);
      plug.rotation.y = t * 0.8;
    },
  };
}
