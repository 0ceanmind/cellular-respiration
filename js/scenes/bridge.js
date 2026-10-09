// "The Bridge": pyruvate crosses into the matrix and PDH turns it into acetyl CoA + CO2 + NADH.
import { THREE, makeScene, studioLights, label, orbit, glowSprite, protein, COLORS, damp, mulberry, fade } from './kit.js';
import { buildPDH, buildPyruvate, buildCO2, buildAcetylCoA, token } from './models.js';

function bilayer(ctx, x, color) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.075, 10, 8);
  const mat = protein(color, ctx, { emissive: 0.02, roughness: 0.55, env: 0.45, clearcoat: 0.2 });
  const pts = [];
  for (let y = -2.5; y <= 2.5; y += 0.17) for (let z = -1.6; z <= 1.6; z += 0.17) {
    if (Math.hypot(y, z) < 0.42) continue;           // hole for the carrier
    pts.push([y, z]);
  }
  const im = new THREE.InstancedMesh(geo, mat, pts.length * 2);
  const m4 = new THREE.Matrix4();
  let k = 0;
  pts.forEach(([y, z]) => {
    for (const side of [-1, 1]) { m4.makeTranslation(x + side * 0.16, y, z); im.setMatrixAt(k++, m4); }
  });
  g.add(im);
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.1, 3.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.18), transparent: true, opacity: 0.3, depthWrite: false }));
  core.position.x = x; g.add(core);
  return g;
}

function compartment(color, w, h) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  return m;
}

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [4.2, 2.6, 17.2], target: [0.6, 0, 0] });
  studioLights(scene, 1);

  // compartments
  const cyto = compartment('rgba(255,159,10,0.16)', 8, 7); cyto.position.set(-2.4, 0, -2.5); scene.add(cyto);
  const matrix = compartment('rgba(90,200,250,0.18)', 10, 7); matrix.position.set(2.8, 0, -2.5); scene.add(matrix);

  // double membrane + pyruvate carrier
  const memOuter = bilayer(ctx, -0.55, 0x9fb4ff); const memInner = bilayer(ctx, 0.35, 0xff8f66);
  scene.add(memOuter, memInner);
  const carrier = new THREE.Group();
  for (const x of [-0.55, 0.35]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 16, 48), protein(0x30d158, ctx, { emissive: 0.9 }));
    ring.rotation.y = Math.PI / 2; ring.position.x = x; carrier.add(ring);
  }
  carrier.userData.tip = 'matrixLoc';
  scene.add(carrier);

  // PDH (small) and a TCA ring hint
  const pdh = buildPDH(ctx, { scale: 0.62 });
  pdh.group.position.set(1.95, 0, 0);
  scene.add(pdh.group);
  const tca = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.09, 20, 80), protein(0xff9f0a, ctx, { emissive: 0.35, clearcoat: 1 }));
  tca.position.set(4.25, 0, 0); tca.rotation.x = 0.5;
  tca.userData.tip = 'amphibolic';
  scene.add(tca);
  const tcaGlow = glowSprite(0xff9f0a, 2.6, 0.0); tcaGlow.position.copy(tca.position); scene.add(tcaGlow);

  // molecules
  const pyr = buildPyruvate(ctx); pyr.userData.tip = 'pyruvate';
  const co2 = buildCO2(ctx);
  const acoa = buildAcetylCoA(ctx); acoa.userData.tip = 'acetylcoa';
  const nadh = token(COLORS.nadh, 0.2);
  const ghost = buildAcetylCoA(ctx); ghost.position.set(3.9, 1.25, 0); ghost.scale.setScalar(0.7);
  ghost.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0; } });
  scene.add(pyr, co2, acoa, nadh, ghost);

  // labels
  const L = {
    cyto: label('Cytosol', 'space'), matrix: label('Mitochondrial matrix', 'space'),
    pyr: label('Pyruvate <span class="cnum">3C</span>', 'sm'), co2: label('CO<sub>2</sub>', 'sm'),
    acoa: label('Acetyl CoA <span class="cnum">2C</span>', 'sm'), nadh: label('NADH', 'sm'),
    pdh: label('PDH complex', ''), tca: label('TCA cycle', ''), ghost: label('Entry point', 'sm muted'),
    mem: label('Mitochondrial membranes', 'sm muted'),
  };
  L.cyto.position.set(-2.4, 2.75, 0); L.matrix.position.set(2.6, 2.75, 0);
  L.pdh.position.set(1.95, -1.5, 0); L.tca.position.set(4.25, -1.15, 0); L.ghost.position.set(3.9, 1.8, 0);
  L.mem.position.set(-0.1, -2.95, 0);
  scene.add(L.cyto, L.matrix, L.pdh, L.tca, L.ghost, L.mem);
  L.pyr.position.set(0, 0.75, 0); pyr.add(L.pyr);
  L.co2.position.set(0, 0.5, 0); co2.add(L.co2);
  L.acoa.position.set(0.4, 0.75, 0); acoa.add(L.acoa);
  L.nadh.position.set(0.45, 0, 0); nadh.add(L.nadh);

  const controls = orbit(camera, ctx, new THREE.Vector3(0.6, 0, 0), { minAzimuth: -0.2, maxAzimuth: 0.75, minPolar: 1.05, maxPolar: 1.85 });

  // timeline (seconds) of one crossing
  const T = 8.0;
  const rnd = mulberry(4);
  let mode = 'loop', clock = 0, step = 0;
  const vis = { tca: 0.3, ghost: 0, pdh: 0.35, comp: 0.5 };
  const tgt = { tca: 0.3, ghost: 0, pdh: 0.35, comp: 0.5 };

  function setAlpha(obj, a) {
    obj.traverse(o => { if (o.material && 'opacity' in o.material) fade(o.material, a); });
  }
  function place(t) {
    // pyruvate path: cytosol → carrier → PDH
    const ease = x => x * x * (3 - 2 * x);
    const show = (o, on) => { o.visible = on; };
    if (t < 4.0) {
      show(pyr, true); show(co2, false); show(acoa, false); show(nadh, false);
      L.pyr.element.classList.remove('hidden');
      let x;
      if (t < 1.4) x = -3.2 + 1.4 * ease(t / 1.4);
      else if (t < 2.8) x = -1.8 + 3.0 * ease((t - 1.4) / 1.4);
      else x = 1.2 + 0.75 * ease((t - 2.8) / 1.2);
      pyr.position.set(x, Math.sin(t * 2) * 0.06, 0);
      pyr.rotation.set(0, Math.sin(t) * 0.3, Math.sin(t * 0.7) * 0.2);
      const s = t > 3.3 ? 1 - (t - 3.3) / 0.7 * 0.8 : 1;
      pyr.scale.setScalar(Math.max(0.15, s * 0.78));
      if (t > 3.6) L.pyr.element.classList.add('hidden');
    } else {
      show(pyr, false);
      const u = t - 4.0;
      show(co2, true); show(acoa, u > 0.5); show(nadh, u > 0.25);
      co2.position.set(1.95 + u * 0.15, 0.9 + u * 0.5, 0.2); co2.rotation.z = u * 0.6;
      co2.scale.setScalar(Math.min(0.78, u * 2.5));
      nadh.position.set(2.05, -0.9 - u * 0.3, 0.25);
      nadh.scale.setScalar(Math.min(1, u * 3));
      const v = Math.max(0, u - 0.5);
      acoa.position.set(2.25 + Math.min(v, 2.2) * 0.62, 0.05 + Math.sin(v * 2) * 0.05, 0.1);
      acoa.scale.setScalar(Math.min(0.78, v * 2.5 + 0.2));
      const fadeA = t > T - 0.8 ? Math.max(0, (T - t) / 0.8) : 1;
      [co2, acoa, nadh].forEach(o => o.traverse(c => { if (c.material && 'opacity' in c.material) fade(c.material, fadeA); }));
      [L.co2, L.acoa, L.nadh].forEach(l => l.element.style.opacity = fadeA);
    }
    pdh.group.scale.setScalar(0.62 * (1 + (t > 3.4 && t < 4.6 ? Math.sin((t - 3.4) / 1.2 * Math.PI) * 0.1 : 0)));
  }

  // clone materials so fading one molecule never touches another
  [co2, acoa, nadh].forEach(o => o.traverse(c => { if (c.material) c.material = c.material.clone(); }));

  return {
    scene, camera, controls,
    pickables: [carrier, tca, ...pdh.pickables],
    bloom: [0.45, 0.45, 0.85],
    show(key, s) {
      step = s;
      if (key === 'ch1') { mode = 'loop'; Object.assign(tgt, { tca: 0.9, ghost: 0, pdh: 1, comp: 0.7 }); }
      else {
        mode = s >= 4 ? 'loop' : 'wait';
        Object.assign(tgt, { tca: s >= 1 ? 1 : 0.3, ghost: s >= 2 && s < 4 ? 1 : 0, pdh: s >= 3 ? 1 : 0.3, comp: s >= 3 ? 1 : 0.45 });
        if (mode === 'wait') clock = 0.0;
      }
      L.tca.element.classList.toggle('focus', key !== 'ch1' && s === 1);
      L.ghost.element.classList.toggle('hidden', !(key !== 'ch1' && s >= 2 && s < 4));
      L.cyto.element.classList.toggle('focus', key !== 'ch1' && s === 3);
      L.matrix.element.classList.toggle('focus', key !== 'ch1' && s === 3);
      L.pdh.element.classList.toggle('focus', key !== 'ch1' && s === 3);
    },
    hover(obj) { pdh.highlight(obj && ['E1', 'E2', 'E3'].includes(obj.name) ? obj.name : null); },
    update(dt, t) {
      for (const k in tgt) vis[k] = damp(vis[k], tgt[k], 3, dt);
      if (mode === 'loop') clock = (clock + dt) % T;
      else clock = Math.min(clock + dt, 0.9);     // pyruvate idles in the cytosol
      place(mode === 'loop' ? clock : 0.05 + Math.sin(t * 0.8) * 0.04);
      pdh.update(t);
      pdh.group.rotation.y = t * 0.25; pdh.group.rotation.x = Math.sin(t * 0.3) * 0.3;
      tca.rotation.z = -t * 0.8;
      tca.material.emissiveIntensity = 0.1 + vis.tca * 0.5;
      fade(tca.material, 0.25 + vis.tca * 0.75);
      tcaGlow.material.opacity = vis.tca * 0.35;
      setAlpha(ghost, vis.ghost * 0.9);
      pdh.group.traverse(o => { if (o.material && o.material.emissive) o.material.emissiveIntensity = 0.04 + vis.pdh * 0.12; });
      cyto.material.opacity = vis.comp; matrix.material.opacity = vis.comp;
      carrier.children.forEach((r, i) => { r.material.emissiveIntensity = 0.3 + 0.25 * Math.sin(t * 3 + i); });
    },
  };
}
