// Cut-away mitochondrion with procedurally folded cristae.
import { THREE, makeScene, studioLights, label, orbit, rimMaterial, glowTexture, mulberry, damp, COLORS } from './kit.js';

const L = 4.4;        // length of the cylindrical body
const RO = 1.75;      // outer membrane radius
const RI = 1.5;       // inner membrane radius
const NFOLD = 12;

function profile(x, R) {               // capsule radius at x
  const h = L / 2, ax = Math.abs(x);
  if (ax <= h) return R;
  const d = ax - h;
  return d >= R ? 0 : Math.sqrt(R * R - d * d);
}

const rnd = mulberry(11);
const folds = Array.from({ length: NFOLD }, (_, k) => ({
  x: -L / 2 - 0.55 + (k + 0.5) * ((L + 1.1) / NFOLD) + (rnd() - 0.5) * 0.14,
  phi: k % 2 ? Math.PI : 0,            // alternate top / bottom origin
  depth: 0.58 + rnd() * 0.26,
  w: 0.055 + rnd() * 0.02,
}));

function foldDepth(x, th) {
  let d = 0;
  for (const f of folds) {
    const s = (x - f.x) / f.w;
    if (Math.abs(s) > 4) continue;
    const ang = Math.max(0, Math.cos(th - f.phi));
    const reach = f.depth * (0.22 + 0.78 * Math.pow(ang, 0.8));
    d = Math.max(d, reach * Math.exp(-s * s));
  }
  return d;
}

// half-shell surface (back half: z ≤ 0); the open side faces the camera
function shell(R, withFolds, nu, nv) {
  const xs = -L / 2 - R, xe = L / 2 + R;
  const pos = [], uv = [], idx = [], fold = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    // pack more samples into the caps for a smooth silhouette
    const x = xs + (xe - xs) * (0.5 - 0.5 * Math.cos(Math.PI * u)) * 0.12 + (xe - xs) * u * 0.88;
    const r0 = profile(x, R);
    for (let j = 0; j <= nv; j++) {
      const th = Math.PI + Math.PI * (j / nv);
      const fd = withFolds ? foldDepth(x, th) : 0;
      const capFade = withFolds ? Math.min(1, r0 / (R * 0.75)) : 1;
      const r = r0 * (1 - fd * capFade);
      pos.push(x, r * Math.cos(th), r * Math.sin(th));
      uv.push(u, j / nv);
      fold.push(fd * capFade);
    }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('fold', new THREE.Float32BufferAttribute(fold, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// outline of the cut (z = 0 plane) → a tube that reads as the membrane in section
function cutOutline(R, withFolds, samples = 900) {
  const pts = [];
  const xs = -L / 2 - R, xe = L / 2 + R;
  for (let i = 0; i <= samples; i++) {         // top edge, left → right (θ = 2π)
    const x = xs + (xe - xs) * i / samples;
    const r = profile(x, R) * (1 - (withFolds ? foldDepth(x, 0) * Math.min(1, profile(x, R) / (R * 0.75)) : 0));
    pts.push(new THREE.Vector3(x, r, 0));
  }
  for (let i = samples; i >= 0; i--) {         // bottom edge, right → left (θ = π)
    const x = xs + (xe - xs) * i / samples;
    const r = profile(x, R) * (1 - (withFolds ? foldDepth(x, Math.PI) * Math.min(1, profile(x, R) / (R * 0.75)) : 0));
    pts.push(new THREE.Vector3(x, -r, 0));
  }
  return pts;
}

function tubeFrom(pts, radius) {
  const path = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  return new THREE.TubeGeometry(path, pts.length, radius, 10, true);
}

export function create(ctx) {
  const { scene, camera } = makeScene(ctx, { fov: 32, pos: [0, 0.6, 13] });
  studioLights(scene, 1);
  const pt = new THREE.PointLight(0xff9a6a, 5, 10, 2); pt.position.set(0, 0, 2.5); scene.add(pt);

  const root = new THREE.Group();
  scene.add(root);
  const body = new THREE.Group();
  body.rotation.set(0.42, -0.18, -0.2);
  root.add(body);

  /* outer membrane */
  const outerMat = new THREE.MeshPhysicalMaterial({
    color: 0xb9c7ff, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.2,
    envMap: ctx.envMap, envMapIntensity: 1.1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false,
    emissive: 0x2a3a80, emissiveIntensity: 0.08,
  });
  const outer = new THREE.Mesh(shell(RO, false, 160, 64), outerMat);
  outer.userData.tip = 'outer-mem';
  body.add(outer);
  const outerRim = new THREE.Mesh(outer.geometry, rimMaterial(0x8fb0ff, { power: 3, intensity: 0.32, base: 0.0, side: THREE.DoubleSide }));
  body.add(outerRim);
  const outerEdge = new THREE.Mesh(tubeFrom(cutOutline(RO, false, 300), 0.055),
    new THREE.MeshPhysicalMaterial({ color: 0xdfe6ff, roughness: 0.3, envMap: ctx.envMap, emissive: 0x6f86ff, emissiveIntensity: 0.18, clearcoat: 1 }));
  outerEdge.userData.tip = 'outer-mem';
  body.add(outerEdge);

  /* inner membrane with cristae */
  const innerGeo = shell(RI, true, 760, 140);
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0xff7448, roughness: 0.42, metalness: 0, envMap: ctx.envMap, envMapIntensity: 0.75,
    clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color(0xffb08a), sheenRoughness: 0.5,
    side: THREE.DoubleSide, emissive: 0xff5a2a, emissiveIntensity: 0.03,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.userData.tip = 'inner-mem';
  body.add(inner);
  const innerEdge = new THREE.Mesh(tubeFrom(cutOutline(RI, true, 1100), 0.045),
    new THREE.MeshPhysicalMaterial({ color: 0xffc2a0, roughness: 0.3, envMap: ctx.envMap, emissive: 0xff7a40, emissiveIntensity: 0.25, clearcoat: 1 }));
  innerEdge.userData.tip = 'cristae';
  body.add(innerEdge);

  /* matrix: soft glowing particles + invisible pick volume */
  const N = 520, mp = new Float32Array(N * 3), r2 = mulberry(3);
  for (let i = 0; i < N; i++) {
    const x = (r2() - 0.5) * (L + RI * 1.4);
    const rr = profile(x, RI) * 0.78 * Math.sqrt(r2());
    const th = Math.PI + r2() * Math.PI;
    mp.set([x, rr * Math.cos(th), rr * Math.sin(th) * 0.9], i * 3);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const matrixPts = new THREE.Points(pg, new THREE.PointsMaterial({
    size: 0.07, map: glowTexture(), color: new THREE.Color(0x7fd6ff).multiplyScalar(1.6),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85,
  }));
  body.add(matrixPts);
  const matrixVol = new THREE.Mesh(new THREE.CapsuleGeometry(RI * 0.55, L * 0.9, 8, 24),
    new THREE.MeshBasicMaterial({ visible: false }));
  matrixVol.rotation.z = Math.PI / 2; matrixVol.position.z = -RI * 0.35;
  matrixVol.userData.tip = 'matrix';
  body.add(matrixVol);

  /* ETC complexes studding the cristae */
  const foldAttr = innerGeo.getAttribute('fold'), posAttr = innerGeo.getAttribute('position');
  const spots = [];
  const r3 = mulberry(5);
  for (let i = 0; i < posAttr.count; i += 7) {
    if (foldAttr.getX(i) > 0.25 && r3() < 0.06) spots.push(i);
  }
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 10, 8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc39bff).multiplyScalar(2.2), transparent: true, opacity: 0 }), spots.length);
  const m4 = new THREE.Matrix4();
  spots.forEach((vi, k) => { m4.makeTranslation(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi) + 0.03); dots.setMatrixAt(k, m4); });
  body.add(dots);

  /* labels */
  const L_ = {
    outer: label('Outer membrane', 'lbl'), inner: label('Inner membrane', 'lbl'),
    cristae: label('Cristae', 'lbl'), matrix: label('Matrix', 'lbl'),
    ims: label('Intermembrane space', 'lbl sm muted'),
  };
  L_.outer.position.set(-1.2, RO + 0.35, 0); L_.inner.position.set(1.9, -RI - 0.05, 0.3);
  L_.cristae.position.set(folds[6].x, RI * 0.62, 0.25); L_.matrix.position.set(-2.1, -0.62, -0.3);
  L_.ims.position.set(2.6, RO - 0.12, 0.2);
  Object.values(L_).forEach(l => { l.element.classList.add('hidden'); body.add(l); });
  const showLabels = on => Object.values(L_).forEach(l => l.element.classList.toggle('hidden', !on));

  const controls = orbit(camera, ctx, new THREE.Vector3(0, 0, 0), { minAzimuth: -0.7, maxAzimuth: 0.7, minPolar: 0.9, maxPolar: 2.1 });

  const state = { dist: 16, dotOp: 0, spin: 1, y: 0 };
  const target = { dist: 13, dotOp: 0, spin: 1, y: 0 };
  let t0 = 0;

  return {
    scene, camera, controls,
    pickables: [matrixVol, innerEdge, inner, outerEdge, outer],
    bloom: [0.35, 0.4, 0.92],
    show(key, step) {
      showLabels(false);
      if (key === 'title') { Object.assign(target, { dist: 17, dotOp: 0, spin: 1, y: 0 }); }
      else if (key === 'ch3') { Object.assign(target, { dist: 12, dotOp: 1, spin: 0.6, y: 0 }); }
      else if (key === 'etc-where') {
        Object.assign(target, { dist: 14.5, dotOp: step >= 1 ? 1 : 0.15, spin: 0.25, y: 0 });
        showLabels(true);
        L_.inner.element.classList.toggle('focus', step >= 1);
        L_.cristae.element.classList.toggle('focus', step >= 1);
      }
    },
    hide() {},
    hover(obj) {
      innerMat.emissiveIntensity = obj === inner || obj === innerEdge ? 0.16 : 0.03;
      outerMat.emissiveIntensity = obj === outer || obj === outerEdge ? 0.35 : 0.08;
    },
    update(dt, t) {
      t0 += dt * state.spin;
      for (const k in target) state[k] = damp(state[k], target[k], 2.2, dt);
      body.rotation.y = -0.18 + Math.sin(t0 * 0.35) * 0.22;
      body.rotation.x = 0.42 + Math.sin(t0 * 0.23) * 0.05;
      body.position.y = Math.sin(t0 * 0.5) * 0.06;
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, state.dist);
      dots.material.opacity = state.dotOp * (0.75 + 0.25 * Math.sin(t * 2.4));
      matrixPts.rotation.x = Math.sin(t * 0.1) * 0.02;
    },
  };
}
