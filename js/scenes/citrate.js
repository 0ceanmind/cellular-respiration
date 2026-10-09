// Citrate (C6H5O7^3−) ball-and-stick model; its three carboxylates glow in turn.
import { THREE, makeScene, studioLights, label, orbit, atom, bond, glowSprite, COLORS } from './kit.js';
import { bondMaterial } from './models.js';

const S = 0.62;                       // scene units per Å
const T = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(v => new THREE.Vector3(...v).normalize());

// three directions at the tetrahedral angle from bond direction b
function tetra(b, phase = 0) {
  const u = new THREE.Vector3().crossVectors(b, Math.abs(b.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(b, u).normalize();
  const c = Math.cos(109.47 * Math.PI / 180), s = Math.sin(109.47 * Math.PI / 180);
  return [0, 1, 2].map(k => {
    const a = phase + k * 2 * Math.PI / 3;
    return b.clone().multiplyScalar(c).addScaledVector(u, s * Math.cos(a)).addScaledVector(v, s * Math.sin(a)).normalize();
  });
}
// two carboxylate O directions at 120° from bond b
function trig(b, phase = 0) {
  const u = new THREE.Vector3().crossVectors(b, new THREE.Vector3(Math.cos(phase), 0.3, Math.sin(phase))).normalize();
  const c = Math.cos(120 * Math.PI / 180), s = Math.sin(120 * Math.PI / 180);
  return [1, -1].map(k => b.clone().multiplyScalar(c).addScaledVector(u, s * k).normalize());
}

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 30, pos: [0, 0.5, 14] });
  studioLights(scene, 1.1);
  const mol = new THREE.Group();
  scene.add(mol);
  const bmat = bondMaterial(ctx);

  const atoms = [];
  const add = (el, p) => {
    const col = { C: COLORS.carbon, O: COLORS.oxygen, H: COLORS.hydrogen }[el];
    const r = { C: 0.36, O: 0.34, H: 0.2 }[el];
    const m = atom(col, r, ctx); m.position.copy(p); mol.add(m); atoms.push(m); return m;
  };
  const link = (a, b) => mol.add(bond(a.position, b.position, 0.09, bmat));

  const C3 = add('C', new THREE.Vector3());
  // hydroxyl
  const O = add('O', T[0].clone().multiplyScalar(1.43 * S)); link(C3, O);
  const Hh = add('H', O.position.clone().add(tetra(T[0].clone().negate(), 0.4)[0].multiplyScalar(0.96 * S))); link(O, Hh);
  const carboxyls = [];
  const carboxyl = (Cpos, from, phase) => {
    const C = add('C', Cpos); link(from, C);
    const b = from.position.clone().sub(Cpos).normalize();
    const [d1, d2] = trig(b, phase);
    const o1 = add('O', Cpos.clone().addScaledVector(d1, 1.26 * S)); link(C, o1);
    const o2 = add('O', Cpos.clone().addScaledVector(d2, 1.26 * S)); link(C, o2);
    const g = new THREE.Group(); [C, o1, o2].forEach(a => g.attach(a));
    mol.add(g);
    const centre = Cpos.clone().addScaledVector(d1.clone().add(d2), 0.35 * S);
    const glow = glowSprite(0xff6a4e, 2.6, 0); glow.position.copy(centre); mol.add(glow);
    carboxyls.push({ g, glow, centre });
    g.userData.tip = 'carboxyl';
    return C;
  };
  // central carboxylate
  carboxyl(T[1].clone().multiplyScalar(1.54 * S), C3, 0.3);
  // two CH2–COO⁻ arms
  [T[2], T[3]].forEach((t, i) => {
    const CH2 = add('C', t.clone().multiplyScalar(1.54 * S)); link(C3, CH2);
    const dirs = tetra(t.clone().negate(), i * 1.1 + 0.2);
    carboxyl(CH2.position.clone().addScaledVector(dirs[0], 1.52 * S), CH2, 1.2 + i);
    [dirs[1], dirs[2]].forEach(d => { const H = add('H', CH2.position.clone().addScaledVector(d, 1.09 * S)); link(CH2, H); });
  });
  const ohGroup = new THREE.Group(); ohGroup.attach(O); ohGroup.attach(Hh); mol.add(ohGroup); ohGroup.userData.tip = 'hydroxyl';

  // centre the molecule
  const box = new THREE.Box3().setFromObject(mol), c = box.getCenter(new THREE.Vector3());
  mol.children.forEach(ch => ch.position.sub(c));
  carboxyls.forEach(k => k.centre.sub(c));

  const labels = carboxyls.map(k => { const l = label('–COO<sup>−</sup>', 'sm'); l.position.copy(k.centre).multiplyScalar(1.55); mol.add(l); return l; });
  const lo = label('–OH', 'sm muted'); lo.position.copy(O.position).multiplyScalar(1.6); mol.add(lo);

  const controls = orbit(camera, ctx, new THREE.Vector3(), { minPolar: 0.3, maxPolar: 2.8 });

  return {
    scene, camera, controls,
    pickables: [...carboxyls.map(k => k.g), ohGroup, mol],
    bloom: [0.5, 0.5, 0.85],
    show() {},
    hover(obj) {
      carboxyls.forEach(k => k.g.traverse(o => { if (o.material?.emissive) o.material.emissiveIntensity = obj === k.g ? 0.5 : 0.05; }));
    },
    update(dt, t) {
      mol.rotation.y += dt * 0.25;
      mol.rotation.x = Math.sin(t * 0.3) * 0.25;
      carboxyls.forEach((k, i) => {
        const ph = (t * 0.7 - i * 0.66) % 2;
        const a = Math.max(0, Math.sin(Math.min(ph, 1) * Math.PI));
        k.glow.material.opacity = 0.15 + a * 0.55;
        labels[i].element.style.opacity = 0.45 + a * 0.55;
      });
    },
  };
}
