// PDH complex close-up: assembles, labels E1/E2/E3, then runs pyruvate → acetyl CoA.
import { THREE, makeScene, studioLights, label, orbit, COLORS, damp } from './kit.js';
import { buildPDH, buildPyruvate, buildCO2, buildAcetylCoA, token } from './models.js';

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0, 0.8, 15.5] });
  studioLights(scene, 1.05);

  const pdh = buildPDH(ctx, { scale: 1.25 });
  scene.add(pdh.group);

  const pyr = buildPyruvate(ctx), co2 = buildCO2(ctx), acoa = buildAcetylCoA(ctx), nadh = token(COLORS.nadh, 0.24);
  [pyr, co2, acoa, nadh].forEach(o => { o.traverse(c => { if (c.material) { c.material = c.material.clone(); c.material.transparent = true; } }); o.visible = false; scene.add(o); });
  pyr.userData.tip = 'pyruvate'; acoa.userData.tip = 'acetylcoa';

  const L = {
    E1: label('E1 · decarboxylase', ''), E2: label('E2 · transacetylase', ''), E3: label('E3 · dehydrogenase', ''),
    pyr: label('Pyruvate <span class="cnum">3C</span>', 'sm'), co2: label('CO<sub>2</sub>', 'sm'),
    acoa: label('Acetyl CoA <span class="cnum">2C</span>', 'sm'), nadh: label('NADH', 'sm'),
  };
  L.E1.position.set(2.0, 2.15, 0.6); L.E2.position.set(0, 0, 2.2); L.E3.position.set(-2.2, -1.8, 0.8);
  scene.add(L.E1, L.E2, L.E3);
  pyr.add(L.pyr); L.pyr.position.set(0, 0.75, 0);
  co2.add(L.co2); L.co2.position.set(0, 0.5, 0);
  acoa.add(L.acoa); L.acoa.position.set(0.4, 0.75, 0);
  nadh.add(L.nadh); L.nadh.position.set(0.5, 0, 0);
  L.E1.element.style.color = '#ff6482'; L.E2.element.style.color = '#bf8cff'; L.E3.element.style.color = '#5ac8fa';
  const enzLabels = [L.E1, L.E2, L.E3];

  const controls = orbit(camera, ctx, new THREE.Vector3(0, 0, 0), { minPolar: 0.5, maxPolar: 2.6 });

  let step = 0, clock = 0, react = false, hover = null, chipHL = null;
  const asm = { core: 0, e3: 0, e1: 0 };
  const { E1, E2, E3, cage } = pdh.parts;

  function assemble() {
    gsap.killTweensOf(asm);
    Object.assign(asm, { core: 0, e3: 0, e1: 0 });
    gsap.to(asm, { core: 1, duration: 1.4, ease: 'power3.out', delay: 0.2 });
    gsap.to(asm, { e3: 1, duration: 1.4, ease: 'power3.out', delay: 0.7 });
    gsap.to(asm, { e1: 1, duration: 1.6, ease: 'power3.out', delay: 1.1 });
  }

  function fade(o, a) { o.traverse(c => { if (c.material && c.material.transparent) c.material.opacity = a; }); }

  function reaction(t) {
    const T = 6;
    const u = t % T;
    const e = x => x * x * (3 - 2 * x);
    pyr.visible = u < 2.2;
    if (pyr.visible) {
      const k = e(Math.min(1, u / 2));
      pyr.position.set(3.6 - 2.4 * k, 3.4 - 2.6 * k, 0.6 + 0.9 * k);
      pyr.scale.setScalar(1 - Math.max(0, (u - 1.6) / 0.6) * 0.8);
      pyr.rotation.y = u;
      fade(pyr, Math.min(1, u * 3));
      L.pyr.element.style.opacity = u > 1.8 ? 0 : 1;
    }
    const v = u - 2.2;
    co2.visible = nadh.visible = acoa.visible = v > 0;
    if (v > 0) {
      const a = Math.min(1, v * 2) * (u > T - 0.7 ? (T - u) / 0.7 : 1);
      co2.position.set(-0.4 - v * 0.35, 2.1 + v * 0.55, 1.6); co2.rotation.z = v;
      nadh.position.set(0.6 + v * 0.25, -2.0 - v * 0.35, 1.6);
      acoa.position.set(2.2 + v * 0.7, -0.6 + Math.sin(v * 2) * 0.08, 1.4);
      [co2, nadh, acoa].forEach(o => { fade(o, a); o.scale.setScalar(Math.min(1, v * 2 + 0.3)); });
      [L.co2, L.nadh, L.acoa].forEach(l => { l.element.style.opacity = a; });
    }
  }

  return {
    scene, camera, controls,
    pickables: [...pdh.pickables, pyr, acoa],
    bloom: [0.42, 0.45, 0.85],
    show(key, s, slide, changed) {
      step = s;
      if (changed && s === 0) assemble();
      if (s > 0) { gsap.killTweensOf(asm); Object.assign(asm, { core: 1, e3: 1, e1: 1 }); }
      enzLabels.forEach(l => l.element.classList.toggle('hidden', s < 1));
      react = s >= 2;
      L.co2.element.classList.toggle('hidden', s < 4); L.nadh.element.classList.toggle('hidden', s < 4);
      co2.userData.hidden = nadh.userData.hidden = s < 4;
      if (!react) [pyr, co2, acoa, nadh].forEach(o => { o.visible = false; });
      clock = 0;
    },
    hide() { pdh.highlight(null); },
    hover(obj) { hover = obj && ['E1', 'E2', 'E3'].includes(obj.name) ? obj.name : null; pdh.highlight(hover || chipHL); },
    highlight(name, on) { chipHL = on ? name : null; pdh.highlight(chipHL); },
    update(dt, t) {
      clock += dt;
      pdh.update(t);
      const g = pdh.group;
      g.rotation.y += dt * 0.12;
      E2.scale.setScalar(0.4 + 0.6 * asm.core); cage.scale.setScalar(0.4 + 0.6 * asm.core);
      E3.scale.setScalar(1 + (1 - asm.e3) * 1.4); E1.scale.setScalar(1 + (1 - asm.e1) * 1.6);
      E2.visible = cage.visible = asm.core > 0.01; E3.visible = asm.e3 > 0.01; E1.visible = asm.e1 > 0.01;
      if (react) reaction(clock);
      if (react && step < 4) { co2.visible = false; nadh.visible = false; }
    },
  };
}
