// Shared 3D toolkit: materials, labels, glow sprites, organic "protein" geometry.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export { THREE };

export const COLORS = {
  nadh: 0x30d158, fadh: 0xff6fae, co2: 0x6aa8ff, gtp: 0xff9f0a, atp: 0xffd60a,
  h: 0xff453a, e: 0xffe45c, o2: 0x64d2ff, heat: 0xff7a1a,
  e1: 0xff6482, e2: 0xbf8cff, e3: 0x5ac8fa,
  c1: 0x7d7aff, c2: 0xd070ff, c3: 0x2d9bff, c4: 0x2ad4b4, c5: 0xffb340,
  carbon: 0x9a9aa2, oxygen: 0xff5a4e, hydrogen: 0xf2f2f7, acetyl: 0x64d2ff,
};

/* ── labels ─────────────────────────────────────────── */
export function label(html, cls = '') {
  const el = document.createElement('div');
  el.className = 'lbl ' + cls;
  el.innerHTML = html;
  const o = new CSS2DObject(el);
  o.center.set(0.5, 0.5);
  return o;
}

/* ── background vignette ────────────────────────────── */
let _bg;
export function backgroundTexture() {
  if (_bg) return _bg;
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(700, 250, 40, 600, 300, 900);
  grd.addColorStop(0, '#10131c'); grd.addColorStop(0.55, '#05060a'); grd.addColorStop(1, '#000');
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 576);
  _bg = new THREE.CanvasTexture(c); _bg.colorSpace = THREE.SRGBColorSpace;
  return _bg;
}

/* ── glow sprite texture ────────────────────────────── */
let _glow;
export function glowTexture() {
  if (_glow) return _glow;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

export function glowSprite(color, size = 1, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(m); s.scale.setScalar(size);
  return s;
}

/* ── materials ──────────────────────────────────────── */
export function protein(color, ctx, o = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: o.roughness ?? 0.42, metalness: 0,
    clearcoat: o.clearcoat ?? 0.55, clearcoatRoughness: 0.35,
    sheen: 0.6, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.4), sheenRoughness: 0.5,
    envMap: ctx.envMap, envMapIntensity: o.env ?? 0.9,
    emissive: new THREE.Color(color), emissiveIntensity: o.emissive ?? 0.06,
    transparent: o.opacity !== undefined, opacity: o.opacity ?? 1,
    side: o.side ?? THREE.FrontSide,
  });
}

export function glass(color, ctx, opacity = 0.18) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.12, metalness: 0, transparent: true, opacity,
    envMap: ctx.envMap, envMapIntensity: 1.2, clearcoat: 1, clearcoatRoughness: 0.1,
    side: THREE.DoubleSide, depthWrite: false,
  });
}

// unlit emissive colour that blooms (values > 1 exceed the bloom threshold)
export function glowMat(color, intensity = 2.2, opacity = 1) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), transparent: opacity < 1, opacity, toneMapped: true });
  return m;
}

// view-dependent rim glow — gives membranes a soft, luminous edge
export function rimMaterial(color, { power = 2.2, intensity = 1.4, base = 0.05, opacity = 1, side = THREE.FrontSide, clip } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side, blending: THREE.AdditiveBlending,
    clipping: !!clip, clippingPlanes: clip || null,
    uniforms: { uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uInt: { value: intensity }, uBase: { value: base }, uOpacity: { value: opacity } },
    vertexShader: `
      #include <common>
      #include <clipping_planes_pars_vertex>
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        #include <clipping_planes_vertex>
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      #include <common>
      #include <clipping_planes_pars_fragment>
      uniform vec3 uColor; uniform float uPower; uniform float uInt; uniform float uBase; uniform float uOpacity;
      varying vec3 vN; varying vec3 vV;
      void main(){
        #include <clipping_planes_fragment>
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        gl_FragColor = vec4(uColor * (uBase + f * uInt), (uBase + f) * uOpacity);
      }`,
  });
}

/* ── organic protein-like blob ─────────────────────── */
const noise = new SimplexNoise({ random: mulberry(7) });
export function mulberry(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function blob(radius = 1, { detail = 5, amp = 0.12, freq = 1.6, seed = 0, scale = [1, 1, 1], lumps = 0.06 } = {}) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const d = noise.noise3d(n.x * freq + seed, n.y * freq + seed * 1.7, n.z * freq - seed) * amp
      + noise.noise3d(n.x * freq * 4.1 + seed, n.y * freq * 4.1, n.z * freq * 4.1) * lumps;
    v.addScaledVector(n, d * radius);
    v.set(v.x * scale[0], v.y * scale[1], v.z * scale[2]);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ── controls ───────────────────────────────────────── */
export function orbit(camera, ctx, target = new THREE.Vector3(), o = {}) {
  const c = new OrbitControls(camera, ctx.renderer.domElement);
  c.target.copy(target);
  c.enableDamping = true; c.dampingFactor = 0.06;
  c.enablePan = false; c.enableZoom = o.zoom ?? false;
  c.rotateSpeed = 0.55;
  c.minPolarAngle = o.minPolar ?? 0.25; c.maxPolarAngle = o.maxPolar ?? Math.PI - 0.25;
  if (o.minAzimuth !== undefined) { c.minAzimuthAngle = o.minAzimuth; c.maxAzimuthAngle = o.maxAzimuth; }
  return c;
}

/* ── lights ─────────────────────────────────────────── */
export function studioLights(scene, k = 1) {
  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x0b0b12, 0.55 * k));
  const key = new THREE.DirectionalLight(0xffffff, 2.2 * k); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ab4ff, 1.4 * k); rim.position.set(-7, 3, -6); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffd7a8, 0.5 * k); fill.position.set(-4, -5, 6); scene.add(fill);
}

/* ── tiny tween helpers (frame based) ───────────────── */
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = t => t * t * (3 - 2 * t);
export const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export function damp(cur, target, lambda, dt) { return lerp(cur, target, 1 - Math.exp(-lambda * dt)); }

// set emissive boost on all meshes under obj (for hover highlight)
export function setGlow(obj, amount) {
  obj.traverse(o => {
    if (o.isMesh && o.material && o.material.emissive) {
      if (o.userData.baseEmissive === undefined) o.userData.baseEmissive = o.material.emissiveIntensity;
      o.material.emissiveIntensity = o.userData.baseEmissive + amount;
    }
  });
}

export function makeScene(ctx, { fov = 35, pos = [0, 0, 12], target = [0, 0, 0] } = {}) {
  const scene = new THREE.Scene();
  scene.background = backgroundTexture();
  const camera = new THREE.PerspectiveCamera(fov, 1920 / 1080, 0.1, 200);
  camera.position.set(...pos);
  camera.lookAt(...target);
  return { scene, camera };
}

// ball-and-stick helpers
const _sph = new THREE.SphereGeometry(1, 32, 24);
const _cyl = new THREE.CylinderGeometry(1, 1, 1, 16, 1);
export function atom(color, r, ctx, emissive = 0.05) {
  const m = new THREE.Mesh(_sph, protein(color, ctx, { roughness: 0.28, clearcoat: 1, emissive }));
  m.scale.setScalar(r);
  return m;
}
export function bond(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(_cyl, mat);
  m.scale.set(r, d.length(), r);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
