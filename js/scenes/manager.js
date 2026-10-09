import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1920, H = 1080;

const LOADERS = {
  mito: () => import('./mito.js'),
  glucose: () => import('./glucose.js'),
  glyline: () => import('./glyline.js'),
  rbc: () => import('./rbc.js'),
  bridge: () => import('./bridge.js'),
  pdh: () => import('./pdh.js'),
  citrate: () => import('./citrate.js'),
  tca: () => import('./tca.js'),
  etc: () => import('./etc.js'),
  synthase: () => import('./synthase.js'),
};

// where the scene's origin should sit horizontally (stage px offset from centre)
const VIEWS = { center: 0, right: 380, 'right-wide': 400, left: -380 };

export class SceneManager {
  constructor(app, canvas, labelEl) {
    this.app = app;
    this.canvas = canvas;
    this.labelEl = labelEl;
    this.instances = {};
    this.pending = {};
    this.active = null;
    this.activeName = null;
    this.viewShift = { x: 0 };
    this.token = 0;
    this.quality = 1;                 // adaptive resolution multiplier
    this.perf = { frames: 0, time: 0, good: 0 };

    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    r.setClearColor(0x000000, 1);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.localClippingEnabled = true;
    r.setSize(W, H, false);

    const pmrem = new THREE.PMREMGenerator(r);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.css = new CSS2DRenderer({ element: labelEl });
    this.css.setSize(W, H);

    this.composer = new EffectComposer(r);
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.55, 0.8);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.hovered = null;
    this.ctx = { THREE, renderer: r, envMap: this.envMap, app, setBloom: (s, rad, th) => this.setBloom(s, rad, th) };

    this.bindPointer();
    app.on('highlight', (name, on) => this.active?.highlight?.(name, on));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.clock.getDelta(); });
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setBloom(strength = 0.55, radius = 0.55, threshold = 0.8) {
    this.bloom.strength = strength; this.bloom.radius = radius; this.bloom.threshold = threshold;
  }

  resize(scale = this.lastScale || 1) {
    this.lastScale = scale;
    const pr = Math.max(0.5, Math.min((window.devicePixelRatio || 1) * scale, 2) * this.quality);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(W, H, false);
    this.composer.setPixelRatio(pr);
    this.composer.setSize(W, H);
  }

  async get(name) {
    if (this.instances[name]) return this.instances[name];
    if (!this.pending[name]) {
      this.pending[name] = LOADERS[name]().then(m => {
        const inst = m.create(this.ctx);
        inst.name = name;
        inst.scene.traverse(o => { if (o.isCSS2DObject) o.element.style.display = 'none'; });
        if (inst.controls) inst.controls.enabled = false;
        this.instances[name] = inst;
        return inst;
      });
    }
    return this.pending[name];
  }

  preload() {
    const names = Object.keys(LOADERS);
    let i = 0;
    const nextOne = () => {
      if (i >= names.length) return;
      const n = names[i++];
      this.get(n).then(inst => {
        try { this.renderer.compile(inst.scene, inst.camera); } catch (e) { /* ignore */ }
        setTimeout(nextOne, 120);
      }).catch(e => { console.error('scene', n, e); nextOne(); });
    };
    setTimeout(nextOne, 900);
  }

  hideLabels(inst) {
    inst?.scene.traverse(o => { if (o.isCSS2DObject) o.element.style.display = 'none'; });
  }

  async setSlide(slide, step, changed) {
    const name = slide.dataset.scene || null;
    const key = slide.dataset.key;
    const view = slide.dataset.view in VIEWS ? VIEWS[slide.dataset.view] : (+slide.dataset.view || 0);
    const token = ++this.token;

    if (!name) {
      if (this.active) {
        this.canvas.classList.remove('on'); this.labelEl.style.opacity = 0;
        const old = this.active;
        setTimeout(() => {
          if (token !== this.token) return;
          old.hide?.(); if (old.controls) old.controls.enabled = false;
          this.hideLabels(old);
          this.active = null; this.activeName = null;
        }, 650);
      }
      return;
    }

    if (name === this.activeName && this.active) {
      if (changed) gsap.to(this.viewShift, { x: view, duration: 1.2, ease: 'power3.inOut' });
      this.active.show(key, step, slide, changed);
      return;
    }

    const inst = await this.get(name);
    if (token !== this.token) return;

    const swap = () => {
      if (token !== this.token) return;
      if (this.active && this.active !== inst) {
        this.active.hide?.(); if (this.active.controls) this.active.controls.enabled = false;
        this.hideLabels(this.active);
      }
      this.active = inst; this.activeName = name;
      this.viewShift.x = view;
      if (inst.controls) inst.controls.enabled = true;
      inst.bloom ? this.setBloom(...inst.bloom) : this.setBloom();
      inst.show(key, step, slide, true);
      this.clock.getDelta();
      this.canvas.classList.add('on'); this.labelEl.style.opacity = 1;
    };

    if (this.active && this.canvas.classList.contains('on')) {
      this.canvas.classList.remove('on'); this.labelEl.style.opacity = 0;
      setTimeout(swap, 420);
    } else swap();
  }

  bindPointer() {
    const c = this.canvas;
    let px = 0, py = 0, queued = false, down = false;
    c.addEventListener('pointerdown', () => { down = true; this.app.tips.hide(0); });
    addEventListener('pointerup', () => { down = false; });
    c.addEventListener('pointerleave', () => { this.setHover(null); });
    c.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (down || queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; this.pick(px, py); });
    });
  }

  pick(x, y) {
    const inst = this.active;
    if (!inst || !inst.pickables?.length) return this.setHover(null);
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, inst.camera);
    const hits = this.raycaster.intersectObjects(inst.pickables, true);
    let target = null;
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.tip) o = o.parent;
      if (o && o.visible !== false) { target = o; break; }
    }
    this.setHover(target, x, y);
  }

  setHover(obj, x, y) {
    if (obj !== this.hovered) {
      this.active?.hover?.(obj, this.hovered);
      this.hovered = obj;
      this.canvas.style.cursor = obj ? 'help' : '';
    }
    if (obj) this.app.tips.show(obj.userData.tip, { x, y });
    else this.app.tips.hide();
  }

  // keep 3D smooth on any projector/laptop: lower the render resolution if frames drop, recover when there is headroom
  adapt(dt) {
    const p = this.perf;
    p.frames++; p.time += dt;
    if (p.time < 1.5) return;
    const fps = p.frames / p.time;
    p.frames = 0; p.time = 0;
    if (fps < 45 && this.quality > 0.55) { this.quality = Math.max(0.55, this.quality - 0.15); p.good = 0; this.resize(); }
    else if (fps > 57 && this.quality < 1 && ++p.good >= 4) { this.quality = Math.min(1, this.quality + 0.1); p.good = 0; this.resize(); }
  }

  loop() {
    requestAnimationFrame(this.loop);
    const inst = this.active;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!inst || document.hidden) return;
    const t = this.clock.elapsedTime;
    this.adapt(dt);
    inst.update?.(dt, t);
    inst.controls?.update();
    const cam = inst.camera;
    cam.setViewOffset(W, H, -this.viewShift.x, 0, W, H);
    this.renderPass.scene = inst.scene;
    this.renderPass.camera = cam;
    this.composer.render(dt);
    this.css.render(inst.scene, cam);
  }
}
