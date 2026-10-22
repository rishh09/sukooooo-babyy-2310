/* The 3D glass heart in the hero. Falls back to an emoji heart if WebGL is unavailable. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector("#heart3d");
const hero = document.querySelector("#hero");
const tilt = window.sukooTilt || { x: 0, y: 0 };

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
} catch {
  document.body.classList.add("no-webgl");
  throw new Error("WebGL unavailable");
}

const isPhone = window.matchMedia("(max-width: 760px)").matches;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isPhone ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 9);

/* Heart geometry (classic bezier heart, extruded with a soft bevel) */
const shape = new THREE.Shape();
shape.moveTo(5, 5);
shape.bezierCurveTo(5, 5, 4, 0, 0, 0);
shape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
shape.bezierCurveTo(16, 7, 16, 0, 10, 0);
shape.bezierCurveTo(7, 0, 5, 5, 5, 5);

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 3.2,
  bevelEnabled: true,
  bevelSegments: isPhone ? 10 : 16,
  bevelSize: 2.4,
  bevelThickness: 2.6,
  curveSegments: isPhone ? 36 : 56,
});
geometry.center();
geometry.rotateZ(Math.PI);
geometry.scale(0.12, 0.12, 0.12);
geometry.computeVertexNormals();

const glass = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffd1e3"),
  metalness: 0,
  roughness: 0.06,
  transmission: 1,
  thickness: 1.4,
  ior: 1.5,
  iridescence: 0.7,
  iridescenceIOR: 1.35,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  attenuationColor: new THREE.Color("#ff4f8b"),
  attenuationDistance: 3.5,
  envMapIntensity: 1.4,
});

const heart = new THREE.Mesh(geometry, glass);
heart.position.y = 0.9;
scene.add(heart);

/* Small glass hearts drifting around, plus glowing orbs behind for the glass to refract */
const minis = [];
const miniGlass = glass.clone();
miniGlass.attenuationColor = new THREE.Color("#c13cff");
for (let i = 0; i < (isPhone ? 5 : 8); i += 1) {
  const m = new THREE.Mesh(geometry, i % 2 ? glass : miniGlass);
  const s = 0.18 + Math.random() * 0.16;
  m.scale.setScalar(s);
  m.userData = {
    r: 2.6 + Math.random() * 1.6,
    a: (i / (isPhone ? 5 : 8)) * Math.PI * 2,
    y: (Math.random() - 0.5) * 3.2 + 0.9,
    speed: 0.15 + Math.random() * 0.2,
    spin: (Math.random() - 0.5) * 1.5,
  };
  scene.add(m);
  minis.push(m);
}

const orbColors = ["#ff5c8a", "#ffcf6b", "#19c3b3", "#c13cff", "#2b6bff", "#ff8fb1"];
const orbs = orbColors.map((c, i) => {
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.6) })
  );
  orb.userData = { a: (i / orbColors.length) * Math.PI * 2, r: 1.7 };
  orb.position.z = -2.2;
  scene.add(orb);
  return orb;
});

const key = new THREE.PointLight("#ff8fb1", 30, 20);
key.position.set(3, 3, 4);
scene.add(key);
const rim = new THREE.PointLight("#19c3b3", 18, 20);
rim.position.set(-4, -2, 3);
scene.add(rim);

/* Size to the hero. On portrait screens the heart sits smaller and higher, above the title. */
const layout = { scale: 1, y: 0.9, lookY: 0.6 };
function resize() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const portrait = w < h;
  layout.scale = portrait ? 0.62 : 1;
  layout.y = portrait ? 2.1 : 0.9;
  camera.position.z = portrait ? 11 + (h / w - 1.4) * 2 : 9;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

/* Interaction: drag to spin, tap to make it beat */
const spin = { vx: 0, vy: 0, extraX: 0, extraY: 0, drag: null };
let beat = 0;
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function hitsHeart(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObject(heart).length > 0;
}

canvas.addEventListener("pointerdown", (e) => {
  spin.drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, horizontal: null };
});
canvas.addEventListener("pointermove", (e) => {
  const d = spin.drag;
  if (!d) return;
  if (d.horizontal === null && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) {
    d.horizontal = Math.abs(e.clientX - d.sx) > Math.abs(e.clientY - d.sy);
    if (d.horizontal) canvas.setPointerCapture(e.pointerId);
  }
  if (!d.horizontal) return;
  spin.vy = (e.clientX - d.x) * 0.01;
  spin.vx = (e.clientY - d.y) * 0.004;
  d.x = e.clientX;
  d.y = e.clientY;
});
canvas.addEventListener("pointerup", (e) => {
  const d = spin.drag;
  spin.drag = null;
  if (!d || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) return;
  beat = 1;
  spin.vy += hitsHeart(e) ? 0.35 : 0.12;
  window.dispatchEvent(new CustomEvent("sukoo:heart", { detail: { x: e.clientX, y: e.clientY } }));
});
canvas.addEventListener("pointercancel", () => { spin.drag = null; });

/* Render only while the hero is on screen */
let visible = true;
new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  spin.extraY += spin.vy;
  spin.extraX += spin.vx;
  spin.vy *= 0.94;
  spin.vx *= 0.9;
  spin.extraX *= 0.96;

  // A double "lub-dub" heartbeat every ~1.4s, plus a big beat on tap.
  const p = (t % 1.4) / 1.4;
  const idle = Math.exp(-((p - 0.1) ** 2) / 0.002) * 0.06 + Math.exp(-((p - 0.26) ** 2) / 0.002) * 0.04;
  beat = Math.max(0, beat - dt * 2.4);
  heart.scale.setScalar(layout.scale * (1 + idle + Math.sin(beat * Math.PI) * 0.22));

  heart.rotation.y = t * 0.5 + spin.extraY + tilt.x * 0.6;
  heart.rotation.x = Math.sin(t * 0.7) * 0.12 + spin.extraX + tilt.y * 0.35;
  heart.position.y = layout.y + Math.sin(t * 1.1) * 0.08;

  minis.forEach((m) => {
    const u = m.userData;
    const a = u.a + t * u.speed;
    const r = u.r * (layout.scale < 1 ? 0.75 : 1);
    m.position.set(Math.cos(a) * r, u.y + (layout.y - 0.9) + Math.sin(t + u.a) * 0.25, Math.sin(a) * r * 0.6 - 0.6);
    m.rotation.y = t * u.spin;
    m.rotation.z = Math.sin(t * 0.6 + u.a) * 0.3;
  });

  orbs.forEach((o) => {
    const a = o.userData.a - t * 0.35;
    o.position.x = Math.cos(a) * o.userData.r * layout.scale;
    o.position.y = layout.y + Math.sin(a) * o.userData.r * 0.8 * layout.scale;
  });

  camera.position.x = tilt.x * 0.5;
  camera.position.y = -tilt.y * 0.3;
  camera.lookAt(0, layout.lookY, 0);
  renderer.render(scene, camera);
});
