/* ============================================================
   DN RING SHADER  ·  v1.0  ·  Nov 2026
   ------------------------------------------------------------
   The ring in the home hero ("One Hub to Rule Them All"), in the
   same hologram language as the bust on dannemirovsky.com
   (dn-bust-shader.js there): additive orange, fresnel edges,
   soft scanlines, a flicker, a halo shell behind the silhouette.

   WHAT IS ITS OWN
     Letters    the inscription is painted into the model's colour
                texture (orange on gold); a colour mask finds it, the
                letters burn Warm White-hot and a blurred copy of the
                mask (a high mip level) on a slightly inflated shell
                gives them a soft glow
     Flame      a quantised fbm flame on a plane behind the ring,
                stepped into scan bands so it reads as digital haze
     Haze       motes drifting up through the flame
     Motion     a ring spun on a table: it stands on its edge, turns
                about the vertical, its axis precesses a few degrees
                and it bobs a little; the cursor tilts it slightly
     Colour     ambient art, like the topo: translucent orange that
                doesn't count against the one-orange-focal budget

   GLSL notes: never call smoothstep with edge0 > edge1 (undefined; on
   Chrome's Metal backend it can draw nothing); use 1.0 - smoothstep(lo, hi, x).
   With three's AdditiveBlending (SRC_ALPHA, ONE) write vec4(col, a): vec4(col * a, a)
   applies alpha twice, and the faint layers (flame, table) vanish.

   USE (home page only, desktop widths)
     <div class="hero__ring" data-hero-ring data-model="/assets/models/one-ring.glb" aria-hidden="true"></div>
     <script type="importmap">{"imports":{"three":"…three@0.160.0/build/three.module.min.js"}}</script>
     <script type="module" src="/assets/js/dn-ring-shader.js"></script>
   Preview hooks: ?ring-still freezes the spin; window.__ring in the console.
   ============================================================ */
const host = document.querySelector('[data-hero-ring]');
const wide = window.matchMedia('(min-width: 1100px)');
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0';

if (host && wide.matches) {
  const start = () => Promise.all([
    import(`${CDN}/build/three.module.min.js`),
    import(`${CDN}/examples/jsm/loaders/GLTFLoader.js`),
    import(`${CDN}/examples/jsm/libs/meshopt_decoder.module.js`),
  ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }]) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    return loader.loadAsync(host.dataset.model).then((gltf) => init(THREE, gltf));
  }).catch((err) => { console.error('[ring]', err); host.classList.add('is-failed'); });
  ('requestIdleCallback' in window) ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 400);
}

function init(THREE, gltf) {
  const q = new URLSearchParams(location.search);
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || q.has('ring-still');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  const cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const ORANGE = new THREE.Color('#FF8050');
  const WHITE = new THREE.Color('#F5F3EE');
  const GLOW = new THREE.Color('#FF5E1A');
  const EMBER = new THREE.Color('#CC4C16');

  /* ---------- the ring: unpacked to floats, stood on its edge, D units across ---------- */
  let src = null;
  gltf.scene.traverse((o) => { if (o.isMesh && !src) src = o; });
  const tex = src.material.map, nrm = src.material.normalMap;
  if (tex) { tex.colorSpace = THREE.NoColorSpace; tex.updateMatrix(); tex.anisotropy = 4; }
  if (nrm) nrm.colorSpace = THREE.NoColorSpace;
  src.updateWorldMatrix(true, false);
  const sg = src.geometry, cnt = sg.attributes.position.count;
  const fp = new Float32Array(cnt * 3), fn = new Float32Array(cnt * 3), fu = new Float32Array(cnt * 2);
  const v3 = new THREE.Vector3(), v2 = new THREE.Vector2();
  const nMat = new THREE.Matrix3().getNormalMatrix(src.matrixWorld);
  for (let i = 0; i < cnt; i++) {
    v3.fromBufferAttribute(sg.attributes.position, i).applyMatrix4(src.matrixWorld).toArray(fp, i * 3);
    v3.fromBufferAttribute(sg.attributes.normal, i).applyMatrix3(nMat).normalize().toArray(fn, i * 3);
    v2.fromBufferAttribute(sg.attributes.uv, i);
    if (tex) v2.applyMatrix3(tex.matrix);
    v2.toArray(fu, i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(fn, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(fu, 2));
  geo.setIndex(sg.index);
  // the model lies flat (its hole along Y); stand it up so the hole faces the camera
  geo.rotateX(Math.PI / 2);
  geo.computeBoundingBox();
  const size = geo.boundingBox.getSize(new THREE.Vector3());
  const D = 2.6, k = D / Math.max(size.x, size.y);
  const centre = geo.boundingBox.getCenter(new THREE.Vector3());
  geo.translate(-centre.x, -centre.y, -centre.z).scale(k, k, k);

  const U = {
    uTime: { value: 0 },
    uD: { value: D },
    uMap: { value: tex },
    uNrm: { value: nrm },
    uOrange: { value: ORANGE },
    uWhite: { value: WHITE },
    uGlow: { value: GLOW },
    uEmber: { value: EMBER },
  };

  const FRAG_COMMON = /* glsl */`
    uniform float uTime;
    uniform vec3 uOrange, uWhite, uGlow, uEmber;
    uniform sampler2D uMap;
    float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float scanF(float y)  { return 0.8 + 0.2 * smoothstep(-0.2, 1.0, sin(y * 520.0 - uTime * 14.0)); }
    float flickF()        { return 0.92 + 0.08 * noise(vec2(uTime * 24.0, 1.0)); }
    float breathe()       { return 0.85 + 0.15 * sin(uTime * 1.3); }
    // the inscription: orange on gold, so red well above green
    float letters(vec3 c) { return smoothstep(0.16, 0.34, c.r - c.g) * smoothstep(0.45, 0.75, c.r); }`;

  /* ---------- 1. depth-only pass, so only the nearest surface is drawn ---------- */
  const depthPass = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    side: THREE.DoubleSide, colorWrite: false,
    vertexShader: `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.0); }`,
    polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2,
  }));
  depthPass.renderOrder = 0;

  /* ---------- 2. the hologram surface, with the letters burning through ---------- */
  const solid = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    defines: nrm ? { USE_NRM: 1 } : {},
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vY;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vP = mv.xyz;
        vY = (modelMatrix * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: FRAG_COMMON + /* glsl */`
      uniform sampler2D uNrm;
      varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vY;
      vec3 detailNormal(vec3 N) {
        #ifdef USE_NRM
        vec3 m = texture2D(uNrm, vUv).xyz * 2.0 - 1.0;
        vec3 q0 = dFdx(vP), q1 = dFdy(vP);
        vec2 s0 = dFdx(vUv), s1 = dFdy(vUv);
        vec3 q1p = cross(q1, N), q0p = cross(N, q0);
        vec3 T = q1p * s0.x + q0p * s1.x, B = q1p * s0.y + q0p * s1.y;
        float det = max(dot(T, T), dot(B, B));
        float sc = det == 0.0 ? 0.0 : inversesqrt(det);
        vec3 r = T * (m.x * sc) + B * (m.y * sc) + N * max(m.z, 0.05);
        float l = dot(r, r);
        return (l > 1e-6 && l < 1e6) ? r * inversesqrt(l) : N;
        #else
        return N;
        #endif
      }
      void main() {
        vec3 c = texture2D(uMap, vUv).rgb;
        float L = letters(c);
        float lum = pow(dot(c, vec3(0.3, 0.55, 0.15)), 0.6) * 1.2;
        vec3 N = detailNormal(normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0));
        vec3 V = normalize(-vP);
        float fres = pow(1.0 - abs(dot(N, V)), 2.2);
        float spec = pow(max(dot(reflect(-normalize(vec3(-0.4, 0.8, 0.6)), N), V), 0.0), 18.0);   // a glint as it turns
        float edge = clamp(fres * 1.1, 0.0, 1.0);
        vec3 body = mix(uOrange, uWhite, clamp(lum * 0.3 + edge * 0.45 + spec * 0.5 - 0.15, 0.0, 0.75));
        float a = (0.22 + lum * 0.35 + edge * 1.3 + spec * 0.8) * scanF(vY) * flickF() * 0.62;
        // letters: Warm White at the core, orange at the rim, always brighter than the gold
        float burn = L * breathe() * flickF();
        vec3 hot = mix(uOrange, uWhite, 0.55 + 0.35 * burn);
        vec3 col = body * a + hot * burn * 1.25;
        float alpha = clamp(a + burn, 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      }`,
  }));
  solid.renderOrder = 2;

  /* ---------- 3. letter glow: a blurred copy of the mask on an inflated shell ---------- */
  const letterGlow = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position + normal * 0.03, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: FRAG_COMMON + /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float soft = letters(texture2D(uMap, vUv, 3.5).rgb);     // a high mip level: the mask, blurred
        float facing = smoothstep(0.0, 0.5, abs(dot(normalize(vN), vV)));
        float a = soft * facing * breathe() * 0.55;
        gl_FragColor = vec4(mix(uGlow, uOrange, 0.5) * a, a);
      }`,
  }));
  letterGlow.renderOrder = 3;

  /* ---------- 4. halo: an inflated shell seen from behind (outer silhouette) ---------- */
  const shell = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position + normal * 0.07, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        vY = (modelMatrix * vec4(position, 1.0)).y;
        mv.z -= 0.3;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: FRAG_COMMON + /* glsl */`
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float d = abs(dot(normalize(vN), normalize(vV)));
        float crackle = 0.65 + 0.35 * noise(vec2(floor(vY * 60.0), floor(uTime * 18.0)));
        float a = pow(d, 1.6) * crackle * 0.4;
        gl_FragColor = vec4(uGlow * a, a);
      }`,
  }));
  shell.renderOrder = 1;

  /* ---------- 5. the flame behind: quantised fbm, stepped into scan bands ---------- */
  const FW = D * 2.0, FH = D * 2.0;
  const flame = new THREE.Mesh(
    new THREE.PlaneGeometry(FW, FH),
    new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */`
        uniform float uTime; uniform vec3 uOrange, uGlow, uEmber, uWhite;
        varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
        void main() {
          // digital: rows snap to scan bands, columns to coarse cells
          vec2 uv = vUv;
          vec2 g = vec2(floor(uv.x * 120.0) / 120.0, floor(uv.y * 90.0) / 90.0);
          float t = uTime;
          vec2 p = vec2((g.x - 0.5) * 3.0, g.y * 3.2 - t * 0.9);
          float n = fbm(p + vec2(fbm(p * 0.8 + t * 0.15), 0.0) * 0.8);
          // wide behind the ring, breaking into tongues above it
          float x = abs(g.x - 0.5) * 2.0;
          float width = mix(0.95, 0.12, pow(g.y, 1.25));
          float body = 1.0 - smoothstep(width * 0.35, width, x + (n - 0.5) * 0.7);
          float rise = (1.0 - smoothstep(0.35, 1.0, g.y)) * smoothstep(0.0, 0.22, g.y);
          float f = body * rise * (0.5 + n * 1.0);
          float band = 0.75 + 0.25 * step(0.5, fract(uv.y * 90.0 + t * 0.6));   // scan bands drifting up
          float drop = 0.55 + 0.45 * step(0.04, h(vec2(floor(uv.y * 90.0), floor(t * 6.0))));   // the odd row dims
          vec3 col = mix(uEmber, uOrange, smoothstep(0.2, 0.75, f));
          col = mix(col, uWhite, smoothstep(0.85, 1.25, f) * 0.35);
          float a = clamp(f * band * drop * 0.42, 0.0, 0.6);
          gl_FragColor = vec4(col, a);          // additive blending already scales by alpha
        }`,
    })
  );
  flame.position.set(0, D * 0.42, -D * 0.6);
  flame.renderOrder = -2;

  /* ---------- 6. haze: motes drifting up through the flame ---------- */
  const NM = 120;
  const mp = new Float32Array(NM * 3), ms = new Float32Array(NM);
  for (let i = 0; i < NM; i++) {
    mp[i * 3] = (Math.random() - 0.5) * FW * 0.7;
    mp[i * 3 + 1] = (Math.random() - 0.5) * FH;
    mp[i * 3 + 2] = (Math.random() - 0.5) * 1.4 - D * 0.2;
    ms[i] = 0.12 + Math.random() * 0.3;
  }
  const motesGeo = new THREE.BufferGeometry();
  motesGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({
    color: ORANGE, size: 2.2 * DPR, sizeAttenuation: false, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  }));
  motes.position.y = flame.position.y;

  /* ---------- 7. the table: a faint glow where the edge would touch ---------- */
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(D * 1.4, D * 0.35),
    new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */`
        uniform float uTime; uniform vec3 uGlow; varying vec2 vUv;
        void main() {
          vec2 c = (vUv - 0.5) * vec2(2.0, 2.0);
          float a = (1.0 - smoothstep(0.0, 1.0, length(c))) * 0.3 * (0.85 + 0.15 * sin(uTime * 2.1));
          gl_FragColor = vec4(uGlow, a);
        }`,
    })
  );
  table.position.set(0, -D / 2 - 0.05, -0.2);
  table.renderOrder = -1;

  // spin (inner) inside precession (outer), so the axis wanders as a spun ring's does
  const spin = new THREE.Group();
  [depthPass, shell, solid, letterGlow].forEach((o) => spin.add(o));
  const ring = new THREE.Group();
  ring.add(spin);
  scene.add(flame, motes, table, ring);

  /* ---------- sizing: the whole scene (flame included) fits the canvas ---------- */
  // frame from just under the ring to where the flame has mostly faded; the tips may run off the top
  const top = flame.position.y + FH * 0.32, bottom = -D / 2 - 0.25;
  const SH = top - bottom, SW = D * 1.35;
  const midY = (top + bottom) / 2;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, midY, Math.max(SH / tan, SW / (tan * camera.aspect)));
    camera.lookAt(0, midY, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ---------- pointer tilt (on the hero, not just the canvas) ---------- */
  const target = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  const hero = host.closest('header, section') || document.body;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  hero.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  /* ---------- loop ---------- */
  const SPIN = (Math.PI * 2) / 10;      // one turn every 10s
  let running = false, raf = 0, last = performance.now(), t = 0;

  function pose(time) {
    spin.rotation.y = time * SPIN;
    ring.rotation.z = Math.sin(time * 0.55) * 0.07 + tilt.x * 0.08;    // the axis precesses a few degrees
    ring.rotation.x = Math.cos(time * 0.55) * 0.05 + tilt.y * 0.06;
    ring.position.y = Math.sin(time * 0.9) * 0.04;                       // and it lifts a little
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    U.uTime.value = t;
    tilt.x += (target.x - tilt.x) * 0.05;
    tilt.y += (target.y - tilt.y) * 0.05;
    pose(t);
    const p = motesGeo.attributes.position.array;
    for (let i = 0; i < NM; i++) {
      p[i * 3 + 1] += ms[i] * dt;
      if (p[i * 3 + 1] > FH / 2) p[i * 3 + 1] = -FH / 2;
    }
    motesGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  function renderOnce() { U.uTime.value = 2.2; pose(1.1); renderer.render(scene, camera); }
  function play() { if (running || still) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function pause() { running = false; cancelAnimationFrame(raf); }

  host.classList.add('is-ready');
  window.__ring = { U, spin, ring, flame, motes, table, camera, renderer, pose, render: () => renderer.render(scene, camera) };
  if (still) { renderOnce(); return; }

  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && !document.hidden ? play() : pause(); }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? pause() : play()));
  play();
}
