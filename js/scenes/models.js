// Reusable molecular models.
import { THREE, COLORS, protein, atom, bond, blob, glowMat, label, fade } from './kit.js';

/* ── PDH complex (schematic) ───────────────────────────────────────────
   E2 trimers sit on the 20 vertices of a pentagonal dodecahedron (the core),
   E3 dimers sit over the 12 pentagonal faces, E1 tetramers ring the outside. */
export function buildPDH(ctx, { scale = 1 } = {}) {
  const root = new THREE.Group();
  const phi = (1 + Math.sqrt(5)) / 2;
  const dodV = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) dodV.push(new THREE.Vector3(x, y, z));
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    dodV.push(new THREE.Vector3(0, a / phi, b * phi));
    dodV.push(new THREE.Vector3(a / phi, b * phi, 0));
    dodV.push(new THREE.Vector3(a * phi, 0, b / phi));
  }
  dodV.forEach(v => v.normalize());
  // edges = vertex pairs at the minimum distance
  let dmin = Infinity;
  for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) dmin = Math.min(dmin, dodV[i].distanceTo(dodV[j]));
  const edges = [];
  for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) if (dodV[i].distanceTo(dodV[j]) < dmin * 1.01) edges.push([i, j]);
  // face centres = icosahedron vertex directions
  const faces = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    faces.push(new THREE.Vector3(0, a, b * phi), new THREE.Vector3(a, b * phi, 0), new THREE.Vector3(a * phi, 0, b));
  }
  faces.forEach(v => v.normalize());

  const R = 1.0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();

  // E2: trimers on vertices
  const e2Geo = blob(0.2, { detail: 3, amp: 0.18, lumps: 0.05, seed: 2 });
  const E2 = new THREE.InstancedMesh(e2Geo, protein(COLORS.e2, ctx, { emissive: 0.08 }), 60);
  let k = 0;
  dodV.forEach((v, i) => {
    const t1 = new THREE.Vector3().crossVectors(v, new THREE.Vector3(0.3, 1, 0.1)).normalize();
    const t2 = new THREE.Vector3().crossVectors(v, t1).normalize();
    for (let j = 0; j < 3; j++) {
      const a = j / 3 * Math.PI * 2 + i;
      p.copy(v).multiplyScalar(R).addScaledVector(t1, Math.cos(a) * 0.15).addScaledVector(t2, Math.sin(a) * 0.15);
      q.setFromEuler(new THREE.Euler(i, j, i * j));
      m4.compose(p, q, s.set(1, 1, 1)); E2.setMatrixAt(k++, m4);
    }
  });
  E2.userData.tip = 'E2'; E2.name = 'E2';

  // core cage
  const cageMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS.e2).multiplyScalar(0.9), transparent: true, opacity: 0.45 });
  const cage = new THREE.Group();
  edges.forEach(([i, j]) => cage.add(bond(dodV[i].clone().multiplyScalar(R), dodV[j].clone().multiplyScalar(R), 0.025, cageMat)));
  cage.userData.tip = 'pdh-core';

  // E3 dimers over faces
  const e3Geo = blob(0.17, { detail: 3, amp: 0.15, seed: 5 });
  const E3 = new THREE.InstancedMesh(e3Geo, protein(COLORS.e3, ctx, { emissive: 0.08 }), 24);
  k = 0;
  faces.forEach((v, i) => {
    const t = new THREE.Vector3().crossVectors(v, new THREE.Vector3(1, 0.2, 0.3)).normalize();
    for (let j = 0; j < 2; j++) {
      p.copy(v).multiplyScalar(R * 1.45).addScaledVector(t, (j ? 1 : -1) * 0.14);
      q.setFromEuler(new THREE.Euler(i, j * 2, i));
      m4.compose(p, q, s.set(1, 1, 1)); E3.setMatrixAt(k++, m4);
    }
  });
  E3.userData.tip = 'E3'; E3.name = 'E3';

  // E1 heterotetramers around edges
  const e1Geo = blob(0.13, { detail: 3, amp: 0.16, seed: 9 });
  const E1 = new THREE.InstancedMesh(e1Geo, protein(COLORS.e1, ctx, { emissive: 0.08 }), edges.length * 4);
  k = 0;
  const e1Pos = [];
  edges.forEach(([i, j], n) => {
    const mid = dodV[i].clone().add(dodV[j]).normalize().multiplyScalar(R * 1.78);
    e1Pos.push(mid.clone());
    const tet = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    tet.forEach(([a, b, c], m) => {
      p.set(a, b, c).multiplyScalar(0.085).add(mid);
      q.setFromEuler(new THREE.Euler(n, m, n + m));
      m4.compose(p, q, s.set(1, 1, 1)); E1.setMatrixAt(k++, m4);
    });
  });
  E1.userData.tip = 'E1'; E1.name = 'E1';

  // lipoyl "swinging arms": E2 vertex → nearest E1
  const armPos = new Float32Array(dodV.length * 6);
  const armGeo = new THREE.BufferGeometry(); armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3));
  const arms = new THREE.LineSegments(armGeo, new THREE.LineBasicMaterial({ color: 0xfff2c4, transparent: true, opacity: 0.55 }));
  const armData = dodV.map(v => {
    let best = 0, bd = Infinity; e1Pos.forEach((e, n) => { const d = e.distanceTo(v); if (d < bd) { bd = d; best = n; } });
    let f3 = 0; bd = Infinity; faces.forEach((f, n) => { const d = f.distanceTo(v); if (d < bd) { bd = d; f3 = n; } });
    return { from: v.clone().multiplyScalar(R), a: e1Pos[best], b: faces[f3].clone().multiplyScalar(R * 1.45), ph: Math.random() * 6 };
  });

  root.add(cage, E2, E3, E1, arms);
  root.scale.setScalar(scale);

  const parts = { E1, E2, E3, cage };
  const mats = { E1: E1.material, E2: E2.material, E3: E3.material };
  let hl = null;
  return {
    group: root, parts, pickables: [E1, E3, E2],
    highlight(name) {
      hl = name;
      for (const n of ['E1', 'E2', 'E3']) {
        const m = mats[n];
        const on = !name || name === n;
        fade(m, on ? 1 : 0.06);
        m.emissiveIntensity = name === n ? 0.6 : 0.08;
      }
      cageMat.opacity = !name || name === 'E2' ? 0.45 : 0.04;
      arms.material.opacity = !name ? 0.55 : 0.12;
    },
    update(t) {
      armData.forEach((d, i) => {
        const w = 0.5 + 0.5 * Math.sin(t * 2.2 + d.ph);
        const tip = d.a.clone().lerp(d.b, w);
        armPos.set([d.from.x, d.from.y, d.from.z, tip.x, tip.y, tip.z], i * 6);
      });
      armGeo.attributes.position.needsUpdate = true;
    },
  };
}

/* ── ball-and-stick molecules ─────────────────────────────────────────── */
const A = 0.36; // scene units per Å

function addAtoms(ctx, g, list, bonds, bondMat) {
  const meshes = list.map(([el, x, y, z]) => {
    const col = { C: COLORS.carbon, O: COLORS.oxygen, H: COLORS.hydrogen, S: 0xffd60a, Ca: COLORS.acetyl }[el];
    const r = { C: 0.27, O: 0.26, H: 0.15, S: 0.3, Ca: 0.27 }[el];
    const m = atom(col, r, ctx); m.position.set(x * A, y * A, z * A); g.add(m); return m;
  });
  bonds.forEach(([i, j]) => g.add(bond(meshes[i].position, meshes[j].position, 0.07, bondMat)));
  return meshes;
}

export function bondMaterial(ctx) {
  return protein(0xd8d8e0, ctx, { roughness: 0.3, emissive: 0.02 });
}

// pyruvate CH3–CO–COO⁻ (3 carbons)
export function buildPyruvate(ctx) {
  const g = new THREE.Group();
  const list = [
    ['C', 0, 0, 0], ['O', -0.68, 1.08, 0], ['O', -0.68, -1.08, 0],     // carboxylate (C1)
    ['C', 1.52, 0, 0], ['O', 2.18, -1.05, 0],                           // keto C2
    ['C', 2.3, 1.32, 0], ['H', 3.35, 1.2, 0], ['H', 1.95, 1.9, 0.9], ['H', 1.95, 1.9, -0.9],
  ];
  addAtoms(ctx, g, list, [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5], [5, 6], [5, 7], [5, 8]], bondMaterial(ctx));
  g.children.forEach(c => c.position.x -= 0.5);
  return g;
}

export function buildCO2(ctx) {
  const g = new THREE.Group();
  addAtoms(ctx, g, [['C', 0, 0, 0], ['O', -1.16, 0, 0], ['O', 1.16, 0, 0]], [[0, 1], [0, 2]], bondMaterial(ctx));
  return g;
}

// acetyl CoA: CH3–CO–S–CoA (CoA drawn as a stylised capsule)
export function buildAcetylCoA(ctx) {
  const g = new THREE.Group();
  const list = [
    ['C', 0, 0, 0], ['O', -0.66, -1.05, 0], ['C', -0.78, 1.3, 0],
    ['H', -1.85, 1.15, 0], ['H', -0.45, 1.85, 0.9], ['H', -0.45, 1.85, -0.9], ['S', 1.75, 0.1, 0],
  ];
  addAtoms(ctx, g, list, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5], [0, 6]], bondMaterial(ctx));
  const coa = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.5, 8, 20), protein(0x8e9cff, ctx, { emissive: 0.15, clearcoat: 1 }));
  coa.rotation.z = Math.PI / 2; coa.position.set(1.75 * A + 1.05, 0.04, 0);
  g.add(coa);
  return g;
}

export function token(color, size = 0.22) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 16), glowMat(color, 2.4));
  g.add(core);
  return g;
}
