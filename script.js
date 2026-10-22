/* For Sukooooo babyy — 23 · 10 · 2005 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BIRTH = new Date(2005, 9, 23, 0, 0, 0);
const BIRTHDAY = new Date(2026, 9, 23, 0, 0, 0);
const DAY_AFTER = new Date(2026, 9, 24, 0, 0, 0);

const PHOTOS = [
  { src: "kisses.jpg", pos: "55% 40%", cap: "Filters had the right idea 💋" },
  { src: "sunshine.jpg", pos: "48% 30%", cap: "Sunlight tried. You still won ☀️" },
  { src: "yellow.jpg", pos: "65% 20%", cap: "My favourite colour is you in yellow 💛" },
  { src: "scrunchie.jpg", pos: "60% 30%", cap: "Scrunchie wali cutie 🎀" },
  { src: "night.jpg", pos: "50% 40%", cap: "Even at 2am, you glow 🌙" },
  { src: "stripes.jpg", pos: "62% 30%", cap: "Messy hair, perfect face" },
  { src: "alien.jpg", pos: "57% 25%", cap: "My cute little alien 👽 approved ✅" },
];

const REASONS = [
  "Your smile fixes days I didn't even know were broken.",
  "The way you say my name — normal word, but from you it sounds like home.",
  "You're the cutest little alien on this whole planet 👽",
  "You make sunlight look like it's trying too hard ☀️",
  "Your hair — always a little messy, always perfect.",
  "You care so deeply about everyone around you.",
  "Your laugh. That's it. That's the reason.",
  "You're my favourite notification, every single time.",
  "Tumhari baatein kabhi khatam nahi hoti — aur main chahta bhi nahi.",
  "You make ordinary days feel like festivals 🪔",
  "Radhe on your hand, Shyam on mine — some things are just meant to be.",
  "You're brave, even on the days you feel scared.",
  "Your sleepy late-night voice 🌙",
  "You put up with my nonsense (most of the time 😌).",
  "Your hugs could honestly end wars.",
  "You look like a dream in yellow 💛",
  "The way your eyes go soft when you're happy.",
  "You make me want to be a better person, every day.",
  "With you, even silence feels comfortable.",
  "You're my best friend and my favourite person — both at once.",
  "Because you're you, Sukooooo — and there's only one of you. 🤍",
];

const LETTER = [
  "Meri Sukooooo babyy,",
  "Happy 21st birthday, meri jaan. 🎂",
  "Aaj ka din sirf ek date nahi hai — ye wo din hai jab duniya ko uski sabse pyaari insaan mili. 23 October 2005 ko shayad kisi ko pata nahi tha, but the universe was quietly making my favourite person.",
  "Tum meri subah ki pehli smile ho, aur raat ki aakhri baat. Tumhari hasi se mera din banta hai, aur tumhari awaaz se mera ghar.",
  "Is saal tumhe woh sab mile jo tum deserve karti ho — dher saari khushiyaan, bina wajah muskurane ki reasons, aur bahut saara sukoon. (Haan, Sukoo se sukoon 😌)",
  "Aur jab bhi duniya thodi heavy lage, yaad rakhna — main hamesha tumhare saath hoon. Radhe ke saath Shyam ki tarah. 🦚",
  "I love you. Aaj, kal, aur har birthday ke baad bhi.",
  "— sirf tumhara Rishhuu 💙",
];

/* ---------- Toast ---------- */
const toastEl = $("#toast");
function toast(message, ms = 2600) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove("show"), ms);
}

/* ---------- Sukoo meter ---------- */
const meter = { total: 0, parts: {}, overflowed: false };
function love(key, amount, cap = amount) {
  const have = meter.parts[key] || 0;
  const add = Math.min(amount, cap - have);
  if (add <= 0) return;
  meter.parts[key] = have + add;
  meter.total = Math.min(100, meter.total + add);
  $("#meterFill").style.width = `${meter.total}%`;
  $("#meterPct").textContent = `${meter.total}%`;
  if (meter.total >= 100 && !meter.overflowed) {
    meter.overflowed = true;
    setTimeout(() => {
      $("#overflow").hidden = false;
      hearts(window.innerWidth / 2, window.innerHeight / 2, 60);
      sfx("chime");
    }, 900);
  }
}
$("#overflowClose").addEventListener("click", () => {
  $("#overflow").hidden = true;
  confetti(200);
});

/* ---------- Tilt (mouse + gyroscope) ---------- */
const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
window.sukooTilt = tilt;
window.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  tilt.tx = (e.clientX / window.innerWidth) * 2 - 1;
  tilt.ty = (e.clientY / window.innerHeight) * 2 - 1;
});
window.addEventListener("deviceorientation", (e) => {
  if (e.gamma == null) return;
  tilt.tx = clamp(e.gamma / 28, -1, 1);
  tilt.ty = clamp((e.beta - 45) / 28, -1, 1);
});
// Only the gate card and the photo deck react to tilt, so write the CSS vars on those alone (never on
// :root, which would restyle the whole page every frame), only while on screen, and only when it moved.
const tiltTargets = new Set();
const tiltWatcher = new IntersectionObserver((entries) =>
  entries.forEach((en) => (en.isIntersecting ? tiltTargets.add(en.target) : tiltTargets.delete(en.target)))
);
(function tiltLoop() {
  const dx = (tilt.tx - tilt.x) * 0.08;
  const dy = (tilt.ty - tilt.y) * 0.08;
  if (Math.abs(dx) + Math.abs(dy) > 0.001) {
    tilt.x += dx;
    tilt.y += dy;
    tiltTargets.forEach((el) => {
      el.style.setProperty("--tx", tilt.x.toFixed(3));
      el.style.setProperty("--ty", tilt.y.toFixed(3));
    });
  }
  requestAnimationFrame(tiltLoop);
})();

/* ---------- FX canvas: hearts, confetti, fireworks ---------- */
const fx = $("#fx");
const fctx = fx.getContext("2d");
const COLORS = ["#ff5c8a", "#ffc2d9", "#ffcf6b", "#c13cff", "#19c3b3", "#ffffff", "#ff8fb1"];
let parts = [];
let fxFrame = null;

function sizeFx() {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  fx.width = window.innerWidth * ratio;
  fx.height = window.innerHeight * ratio;
  fctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener("resize", sizeFx);
sizeFx();

function addPart(p) {
  parts.push({ g: 0.12, drag: 0.99, rot: 0, vr: 0, life: 100, ...p, max: p.life || 100 });
  if (!fxFrame) fxFrame = requestAnimationFrame(tickFx);
}

function hearts(x, y, n = 10) {
  if (reduceMotion) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i += 1) {
    const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
    const s = rand(2, 7);
    addPart({ type: "heart", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.06, size: rand(10, 22), color: pick(["#ff5c8a", "#ff8fb1", "#ffc2d9", "#ff3d6e"]), life: rand(60, 110), vr: rand(-0.05, 0.05) });
  }
}

function confetti(n = 150, x = window.innerWidth / 2, y = window.innerHeight * 0.35) {
  if (reduceMotion) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i += 1) {
    const a = rand(0, Math.PI * 2);
    const s = rand(3, 11);
    addPart({ type: "confetti", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, g: rand(0.12, 0.22), size: rand(6, 12), color: pick(COLORS), life: rand(100, 170), rot: rand(0, Math.PI), vr: rand(-0.25, 0.25) });
  }
}

function fireworks(count = 6) {
  for (let i = 0; i < count; i += 1) {
    setTimeout(() => {
      addPart({ type: "rocket", x: rand(0.15, 0.85) * window.innerWidth, y: window.innerHeight + 10, vx: rand(-1, 1), vy: rand(-13, -10), g: 0.16, drag: 1, size: 3, color: pick(COLORS), life: 200 });
      sfx("whoosh");
    }, i * 380 + rand(0, 200));
  }
}

function explode(p) {
  const n = reduceMotion ? 24 : 50;
  const heartShape = Math.random() < 0.35;
  for (let i = 0; i < n; i += 1) {
    const t = (i / n) * Math.PI * 2;
    let vx;
    let vy;
    if (heartShape) {
      vx = 16 * Math.sin(t) ** 3 * 0.32;
      vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.32;
    } else {
      const s = rand(2, 6);
      vx = Math.cos(t) * s;
      vy = Math.sin(t) * s;
    }
    addPart({ type: "spark", x: p.x, y: p.y, vx, vy, g: 0.05, drag: 0.975, size: rand(1.6, 2.8), color: heartShape ? pick(["#ff5c8a", "#ffc2d9"]) : p.color, life: rand(60, 95) });
  }
  sfx("boom");
}

function drawHeart(c, s) {
  c.beginPath();
  c.moveTo(0, -s * 0.2);
  c.bezierCurveTo(0, -s * 0.5, -s * 0.5, -s * 0.5, -s * 0.5, -s * 0.2);
  c.bezierCurveTo(-s * 0.5, s * 0.1, 0, s * 0.3, 0, s * 0.5);
  c.bezierCurveTo(0, s * 0.3, s * 0.5, s * 0.1, s * 0.5, -s * 0.2);
  c.bezierCurveTo(s * 0.5, -s * 0.5, 0, -s * 0.5, 0, -s * 0.2);
  c.fill();
}

function tickFx() {
  fctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const next = [];
  for (const p of parts) {
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;

    if (p.type === "rocket" && (p.vy >= -1.5 || p.life <= 0)) {
      explode(p);
      continue;
    }
    if (p.life <= 0 || p.y > window.innerHeight + 40) continue;
    next.push(p);

    fctx.save();
    fctx.globalAlpha = Math.min(1, p.life / 30);
    fctx.translate(p.x, p.y);
    fctx.rotate(p.rot);
    fctx.fillStyle = p.color;
    if (p.type === "heart") {
      drawHeart(fctx, p.size);
    } else if (p.type === "confetti") {
      fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.5);
    } else {
      // A faint wide dot under a bright core fakes the glow; canvas shadowBlur is far too slow here.
      fctx.globalCompositeOperation = "lighter";
      fctx.globalAlpha *= 0.25;
      fctx.beginPath();
      fctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
      fctx.fill();
      fctx.globalAlpha *= 4;
      fctx.beginPath();
      fctx.arc(0, 0, p.size, 0, Math.PI * 2);
      fctx.fill();
    }
    fctx.restore();
  }
  // Sparks pushed by explode() are visited by this same for...of, so `next` already holds them.
  parts = next;
  fxFrame = parts.length ? requestAnimationFrame(tickFx) : null;
}

/* ---------- Audio: music box Happy Birthday ---------- */
const audio = { ctx: null, master: null, music: null, on: true, playing: false, timer: null, notes: [] };
const MELODY = [
  [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [523.25, 1], [493.88, 2],
  [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [587.33, 1], [523.25, 2],
  [392.0, 0.75], [392.0, 0.25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440.0, 2],
  [698.46, 0.75], [698.46, 0.25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 3],
];

function initAudio() {
  if (audio.ctx) return audio.ctx.resume();
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return Promise.resolve();
  const ctx = new Engine();
  audio.ctx = ctx;
  audio.master = ctx.createGain();
  audio.master.gain.value = 0.9;
  audio.master.connect(ctx.destination);

  // Soft echo so it sounds like a music box in a room.
  audio.music = ctx.createGain();
  audio.music.gain.value = 0.16;
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.28;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2400;
  audio.music.connect(audio.master);
  audio.music.connect(delay);
  delay.connect(tone).connect(feedback).connect(delay);
  tone.connect(audio.master);
  return ctx.resume();
}

function chimeNote(freq, at, dest, volume = 0.5) {
  const ctx = audio.ctx;
  const out = [];
  [[1, volume], [2, volume * 0.28], [3, volume * 0.08]].forEach(([mult, vol]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = mult === 3 ? "triangle" : "sine";
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6 / mult);
    osc.connect(gain).connect(dest);
    osc.start(at);
    osc.stop(at + 1.7);
    out.push(osc);
  });
  return out;
}

function playMelody() {
  if (!audio.ctx || !audio.on || !audio.playing) return;
  const beat = 0.5;
  let t = audio.ctx.currentTime + 0.15;
  audio.notes = [];
  MELODY.forEach(([f, beats]) => {
    audio.notes.push(...chimeNote(f, t, audio.music));
    t += beats * beat;
  });
  const loopLength = t - audio.ctx.currentTime;
  audio.timer = setTimeout(playMelody, (loopLength + 3) * 1000);
}

function startMusic() {
  if (!audio.ctx || !audio.on || audio.playing) return;
  audio.playing = true;
  audio.music.gain.cancelScheduledValues(audio.ctx.currentTime);
  audio.music.gain.setTargetAtTime(0.16, audio.ctx.currentTime, 0.1);
  playMelody();
}

function stopMusic() {
  audio.playing = false;
  clearTimeout(audio.timer);
  audio.notes.forEach((osc) => { try { osc.stop(); } catch { /* already finished */ } });
  audio.notes = [];
}

function sfx(kind) {
  if (!audio.ctx || !audio.on) return;
  const ctx = audio.ctx;
  const now = ctx.currentTime;
  if (kind === "pop") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(rand(520, 700), now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(audio.master);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (kind === "chime") {
    [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => chimeNote(f, now + i * 0.09, audio.master, 0.12));
  } else if (kind === "whoosh" || kind === "boom") {
    const len = kind === "boom" ? 0.6 : 0.5;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = buffer;
    filter.type = kind === "boom" ? "lowpass" : "bandpass";
    filter.frequency.value = kind === "boom" ? 500 : 1800;
    gain.gain.value = kind === "boom" ? 0.22 : 0.05;
    src.connect(filter).connect(gain).connect(audio.master);
    src.start(now);
  }
}

$("#soundBtn").addEventListener("click", () => {
  audio.on = !audio.on;
  $("#soundBtn").setAttribute("aria-pressed", String(audio.on));
  if (audio.on) {
    initAudio();
    startMusic();
    toast("Music on ♪");
  } else {
    stopMusic();
    toast("Music paused");
  }
});

/* ---------- Gate + countdown ---------- */
function pad(n) { return String(n).padStart(2, "0"); }
function updateGate() {
  const now = new Date();
  const el = $("#gateCount");
  if (now < BIRTHDAY) {
    const d = BIRTHDAY - now;
    const h = Math.floor(d / 3600000);
    const m = Math.floor((d / 60000) % 60);
    const s = Math.floor((d / 1000) % 60);
    el.innerHTML = `your birthday begins in<b>${h ? `${h}h ` : ""}${pad(m)}m ${pad(s)}s</b>`;
    if (!updateGate.turning) {
      updateGate.turning = true;
      $(".sub").innerHTML = 'babyy, you\'re turning <b class="chip">21</b> ✨';
    }
  } else if (now < DAY_AFTER) {
    el.innerHTML = "it's officially<b>your day 🎂</b>";
  } else {
    el.innerHTML = "still celebrating you<b>every single day 🤍</b>";
  }
}
updateGate();
setInterval(updateGate, 1000);

$("#openBtn").addEventListener("click", () => {
  // iOS asks for motion permission; it must be requested inside this tap.
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission().catch(() => {});
  }
  initAudio().then(startMusic).catch(() => {});
  const rect = $("#openBtn").getBoundingClientRect();
  hearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
  confetti(180, window.innerWidth / 2, window.innerHeight * 0.45);
  $("#gate").classList.add("open");
  document.body.classList.remove("locked");
  window.dispatchEvent(new Event("sukoo:open"));
  setTimeout(() => { $("#gate").hidden = true; }, 950);
  setTimeout(() => toast("Happy Birthday, Sukooooo babyy 🤍", 3200), 900);
});

/* ---------- Hero name ---------- */
let oCount = 5;
function fitName() {
  const chars = 3 + oCount;
  const size = clamp((Math.min(window.innerWidth, 900) * 0.9) / (chars * 0.42), 40, 150);
  $("#nameBtn").style.setProperty("--name-size", `${size}px`);
}
$("#nameBtn").addEventListener("click", (e) => {
  oCount += 1;
  if (oCount > 18) {
    oCount = 5;
    toast("okay okay, o's overflow ho gaye 😂");
  } else if (oCount === 8) {
    toast("Sukoooooooo 🥺");
  } else if (oCount === 12) {
    toast("itna pyaar? haan, itna pyaar 🫶");
  } else if (oCount === 16) {
    toast("keep going… there's no limit to how much I love you");
  }
  $("#os").textContent = "o".repeat(oCount);
  fitName();
  hearts(e.clientX, e.clientY, 8);
  sfx("pop");
  love("name", 2, 8);
});
window.addEventListener("resize", fitName);
fitName();

window.addEventListener("sukoo:heart", (e) => {
  hearts(e.detail.x, e.detail.y, 16);
  sfx("chime");
  love("heart", 2, 6);
  const lines = ["the glass heart is yours. so is the real one 💗", "spin it again 🔄", "careful… it's fragile. treat it gently 🥹", "dhak dhak 💓"];
  toast(pick(lines));
});

/* ---------- Gallery deck ---------- */
const deck = $("#deck");
let order = PHOTOS.map((_, i) => i);
const seen = new Set([0]);
const cards = PHOTOS.map((photo) => {
  const fig = document.createElement("figure");
  fig.className = "card";
  fig.innerHTML = `<img src="assets/photos/${photo.src}" alt="${photo.cap}" loading="lazy" style="object-position:${photo.pos}" /><span class="sheen"></span>`;
  deck.appendChild(fig);
  return fig;
});

function layoutDeck(dragX = 0) {
  order.forEach((idx, depth) => {
    const card = cards[idx];
    card.classList.toggle("top", depth === 0);
    card.style.zIndex = String(PHOTOS.length - depth);
    card.style.opacity = depth > 2 ? "0" : "1";
    if (depth === 0) {
      card.style.transform = `translateX(${dragX}px) rotate(${dragX / 16}deg) rotateX(calc(var(--ty) * -12deg)) rotateY(calc(var(--tx) * 16deg))`;
    } else {
      const side = depth % 2 ? 1 : -1;
      card.style.transform = `translate3d(${side * depth * 6}px, ${depth * 10}px, ${-depth * 40}px) rotate(${side * depth * 2.5}deg)`;
    }
  });
  $("#deckCount").textContent = `${order[0] + 1} / ${PHOTOS.length}`;
  showCaption(PHOTOS[order[0]].cap);
}

const deckCaption = $("#deckCaption");
function showCaption(text) {
  if (deckCaption.textContent === text) return;
  if (!deckCaption.textContent) {
    deckCaption.textContent = text;
    return;
  }
  deckCaption.classList.add("swap");
  clearTimeout(showCaption.timer);
  showCaption.timer = setTimeout(() => {
    deckCaption.textContent = text;
    deckCaption.classList.remove("swap");
  }, 200);
}

function markSeen() {
  seen.add(order[0]);
  love("deck", 2, 14);
  if (seen.size === PHOTOS.length && !markSeen.done) {
    markSeen.done = true;
    toast("Saari dekh li! But you're even cuter in real life 🥹", 3200);
    hearts(window.innerWidth / 2, window.innerHeight / 2, 24);
  }
}

function flick(dir) {
  const top = cards[order[0]];
  top.style.transform = `translateX(${dir * 140}%) rotate(${dir * 28}deg)`;
  top.style.opacity = "0";
  sfx("pop");
  setTimeout(() => {
    order.push(order.shift());
    layoutDeck();
    markSeen();
  }, 260);
}

function back() {
  order.unshift(order.pop());
  const top = cards[order[0]];
  top.style.transition = "none";
  top.style.transform = "translateX(-140%) rotate(-28deg)";
  top.offsetWidth; // commit the off-screen start position before animating in
  top.style.transition = "";
  layoutDeck();
  sfx("pop");
}

let drag = null;
deck.addEventListener("pointerdown", (e) => {
  const top = cards[order[0]];
  if (!top.contains(e.target)) return;
  drag = { x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId, horizontal: null };
  top.classList.add("dragging");
});
deck.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (drag.horizontal === null && Math.hypot(dx, dy) > 8) {
    drag.horizontal = Math.abs(dx) > Math.abs(dy);
    if (drag.horizontal) deck.setPointerCapture(e.pointerId);
  }
  if (drag.horizontal) {
    drag.dx = dx;
    layoutDeck(dx);
  }
});
function endDrag() {
  if (!drag) return;
  cards[order[0]].classList.remove("dragging");
  if (Math.abs(drag.dx) > 80) flick(Math.sign(drag.dx));
  else if (drag.horizontal === null) flick(1); // a plain tap also moves to the next photo
  else layoutDeck();
  drag = null;
}
deck.addEventListener("pointerup", endDrag);
deck.addEventListener("pointercancel", () => { if (drag) { cards[order[0]].classList.remove("dragging"); drag = null; layoutDeck(); } });
$("#nextCard").addEventListener("click", () => flick(1));
$("#prevCard").addEventListener("click", back);
layoutDeck();
tiltWatcher.observe($("#gate"));
tiltWatcher.observe(deck);

/* ---------- Kiss game ---------- */
const arena = $("#arena");
const game = { running: false, score: 0, timer: null };
function spawnKiss() {
  const roll = Math.random();
  const kind = roll < 0.08 ? "🧸" : roll < 0.3 ? "💖" : "💋";
  const el = document.createElement("button");
  el.type = "button";
  el.className = "kiss";
  el.textContent = kind;
  el.setAttribute("aria-label", kind === "🧸" ? "Catch the teddy" : "Catch the kiss");
  el.style.left = `${rand(12, 88)}%`;
  el.style.setProperty("--h", `${arena.clientHeight}px`);
  el.style.setProperty("--dur", `${rand(3.4, 5.2) - Math.min(game.score, 18) * 0.05}s`);
  el.style.setProperty("--sway", `${rand(10, 34)}px`);
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (!game.running) return;
    const r = el.getBoundingClientRect();
    hearts(r.left + r.width / 2, r.top + r.height / 2, kind === "🧸" ? 18 : 8);
    sfx("pop");
    el.remove();
    game.score = Math.min(21, game.score + (kind === "🧸" ? 3 : 1));
    $("#kissCount").textContent = game.score;
    if (game.score >= 21) winGame();
  });
  el.addEventListener("animationend", () => el.remove());
  arena.appendChild(el);
}
function startGame() {
  game.running = true;
  game.score = 0;
  $("#kissCount").textContent = "0";
  $("#arenaStart").hidden = true;
  $("#coupon").hidden = true;
  spawnKiss();
  game.timer = setInterval(spawnKiss, 520);
}
function winGame() {
  game.running = false;
  clearInterval(game.timer);
  arena.querySelectorAll(".kiss").forEach((k) => k.remove());
  $("#coupon").hidden = false;
  const r = arena.getBoundingClientRect();
  confetti(160, r.left + r.width / 2, r.top + r.height / 2);
  sfx("chime");
  love("game", 15);
  toast("21 kisses caught! Coupon unlocked 💌");
}
$("#startGame").addEventListener("click", startGame);
$("#replayGame").addEventListener("click", startGame);

/* ---------- Radhe + Shyam merge ---------- */
const merge = $("#merge");
const mergeState = { p: 0, joined: false, drag: null };
function sizeMerge() {
  const w = merge.clientWidth;
  const hw = Math.min(w * 0.3, 140);
  merge.style.setProperty("--hw", `${hw}px`);
  merge.style.setProperty("--travel", `${w / 2 - hw}px`);
}
function setP(p) {
  mergeState.p = clamp(p, 0, 1);
  merge.style.setProperty("--p", mergeState.p.toFixed(3));
}
function joinHalves() {
  if (mergeState.joined) return;
  mergeState.joined = true;
  setP(1);
  merge.classList.add("joined");
  $("#mergeBtn").hidden = true;
  $("#mergeLine").hidden = false;
  const r = merge.getBoundingClientRect();
  hearts(r.left + r.width / 2, r.top + r.height / 2, 40);
  sfx("chime");
  love("merge", 12);
  toast("Radhe 🤍 Shyam");
}
["#halfL", "#halfR"].forEach((sel, i) => {
  const half = $(sel);
  const dir = i === 0 ? 1 : -1;
  half.addEventListener("pointerdown", (e) => {
    if (mergeState.joined) return;
    half.setPointerCapture(e.pointerId);
    mergeState.drag = { x: e.clientX, p: mergeState.p, dir };
    merge.classList.add("dragging");
  });
  half.addEventListener("pointermove", (e) => {
    const d = mergeState.drag;
    if (!d) return;
    const travel = parseFloat(merge.style.getPropertyValue("--travel")) || 100;
    setP(d.p + ((e.clientX - d.x) * d.dir) / travel);
    if (mergeState.p > 0.9) {
      mergeState.drag = null;
      merge.classList.remove("dragging");
      joinHalves();
    }
  });
  const release = () => {
    if (!mergeState.drag) return;
    mergeState.drag = null;
    merge.classList.remove("dragging");
    if (mergeState.p > 0.75) joinHalves();
  };
  half.addEventListener("pointerup", release);
  half.addEventListener("pointercancel", release);
});
$("#mergeBtn").addEventListener("click", joinHalves);
window.addEventListener("resize", sizeMerge);
sizeMerge();

/* ---------- Reasons jar ---------- */
const jarBody = $("#jarBody");
const jarNotes = [];
for (let i = 0; i < REASONS.length; i += 1) {
  const n = document.createElement("i");
  n.textContent = pick(["💌", "💗", "💌", "💕", "📜"]);
  n.style.left = `${rand(8, 74)}%`;
  n.style.bottom = `${rand(4, 52)}%`;
  n.style.transform = `rotate(${rand(-30, 30)}deg)`;
  jarBody.appendChild(n);
  jarNotes.push(n);
}
const reasonOrder = REASONS.slice(0, -1).map((_, i) => i).sort(() => Math.random() - 0.5).concat(REASONS.length - 1);
let opened = 0;
$("#jarBtn").addEventListener("click", () => {
  const jar = $("#jarBtn");
  jar.classList.remove("shake");
  void jar.offsetWidth;
  jar.classList.add("shake");
  let idx;
  if (opened < REASONS.length) {
    idx = reasonOrder[opened];
    jarNotes[opened].classList.add("gone");
    opened += 1;
    $("#jarCount").textContent = opened;
    love("jar", 1, 21);
  } else {
    idx = Math.floor(Math.random() * REASONS.length);
  }
  const note = $("#note");
  note.hidden = true;
  void note.offsetWidth;
  $("#noteNum").textContent = `reason #${idx + 1}`;
  $("#noteText").textContent = REASONS[idx];
  note.hidden = false;
  sfx("pop");
  if (opened === REASONS.length && !jar.dataset.done) {
    jar.dataset.done = "1";
    $(".jar-label").textContent = "khaali 🥹";
    setTimeout(() => {
      toast("Saare 21 padh liye! Jar khaali, dil full 🥹", 3400);
      confetti(160);
    }, 500);
  }
});

/* ---------- Cake ---------- */
const candles = $$(".candle");
const cakeStatus = $("#cakeStatus");
let mic = null;
function blowOut(candle) {
  if (candle.classList.contains("out")) return;
  candle.classList.add("out");
  sfx("whoosh");
  if (candles.every((c) => c.classList.contains("out"))) wishGranted();
}
function wishGranted() {
  stopMic();
  cakeStatus.textContent = "Wish granted ✨ (main personally ensure karunga)";
  const r = $("#cakeScene").getBoundingClientRect();
  confetti(200, r.left + r.width / 2, r.top + r.height * 0.3);
  hearts(r.left + r.width / 2, r.top + r.height * 0.3, 20);
  sfx("chime");
  love("cake", 10);
  $("#blowBtn").textContent = "🕯️ Light them again";
  $("#blowBtn").disabled = false;
}
function relight() {
  candles.forEach((c) => c.classList.remove("out"));
  cakeStatus.textContent = "";
  $("#blowBtn").textContent = "🌬️ Blow the candles";
}
function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  clearTimeout(mic.timeout);
  mic.stream.getTracks().forEach((t) => t.stop());
  mic = null;
}
candles.forEach((c) => c.addEventListener("click", () => blowOut(c)));
$("#blowBtn").addEventListener("click", async () => {
  if (candles.every((c) => c.classList.contains("out"))) {
    relight();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    toast("Mic nahi mila — tap the flames instead 🔥");
    return;
  }
  try {
    await initAudio();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audio.ctx.createMediaStreamSource(stream);
    const analyser = audio.ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    mic = { stream, raf: 0, timeout: 0, loud: 0 };
    $("#blowBtn").disabled = true;
    cakeStatus.textContent = "Make your wish… now blow! 🌬️";
    mic.timeout = setTimeout(() => {
      stopMic();
      $("#blowBtn").disabled = false;
      cakeStatus.textContent = "Mic thoda shy hai — tap the flames 🔥";
    }, 15000);
    const listen = () => {
      if (!mic) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += ((v - 128) / 128) ** 2;
      const rms = Math.sqrt(sum / data.length);
      mic.loud = rms > 0.14 ? mic.loud + 1 : Math.max(0, mic.loud - 1);
      if (mic.loud > 6) {
        mic.loud = 0;
        const lit = candles.find((c) => !c.classList.contains("out"));
        if (lit) blowOut(lit);
      }
      if (mic) mic.raf = requestAnimationFrame(listen);
    };
    listen();
  } catch {
    toast("Mic permission nahi mili — just tap the flames 🔥");
    $("#blowBtn").disabled = false;
  }
});

/* ---------- Letter ---------- */
const letterState = { typing: false, done: false, skip: false };
$("#sealBtn").addEventListener("click", () => {
  const env = $("#envelope");
  env.classList.add("opening");
  sfx("chime");
  setTimeout(() => env.classList.add("gone"), 1300);
  setTimeout(() => {
    env.hidden = true;
    $("#letterCard").hidden = false;
    typeLetter();
  }, 1950);
});

async function typeLetter() {
  letterState.typing = true;
  const box = $("#letterText");
  const caret = document.createElement("span");
  caret.className = "caret";
  for (let i = 0; i < LETTER.length; i += 1) {
    const p = document.createElement("p");
    if (i === LETTER.length - 1) p.className = "sign";
    box.appendChild(p);
    const text = LETTER[i];
    for (let c = 0; c < text.length; c += 1) {
      if (letterState.skip) break;
      p.textContent = text.slice(0, c + 1);
      p.appendChild(caret);
      const ch = text[c];
      await new Promise((r) => setTimeout(r, ".,—!?".includes(ch) ? 180 : 26));
    }
    p.textContent = text;
    if (!letterState.skip) await new Promise((r) => setTimeout(r, 380));
  }
  caret.remove();
  letterState.typing = false;
  letterState.done = true;
  $(".letter-skip").textContent = "🤍";
  const r = $("#letterCard").getBoundingClientRect();
  hearts(r.left + r.width / 2, Math.min(r.bottom, window.innerHeight) - 40, 30);
  love("letter", 10);
}
$("#letterCard").addEventListener("click", () => {
  if (letterState.typing) letterState.skip = true;
});

/* ---------- Finale: photo ring + seconds alive ---------- */
const ring = $("#ring");
const ringPhotos = [...PHOTOS.map((p) => p.src), "radhe-shyam.jpg"];
ringPhotos.forEach((src, i) => {
  const fig = document.createElement("figure");
  fig.style.setProperty("--a", `${(360 / ringPhotos.length) * i}deg`);
  fig.innerHTML = `<img src="assets/photos/${src}" alt="" loading="lazy" />`;
  ring.appendChild(fig);
});
const spin = { angle: 0, vel: 0.25, drag: null, visible: false };
(function spinLoop() {
  if (spin.visible) {
    if (!spin.drag) {
      spin.vel += (0.25 - spin.vel) * 0.02;
      spin.angle += spin.vel;
    }
    ring.style.transform = `rotateX(${-6 + tilt.y * 8}deg) rotateY(${spin.angle}deg)`;
  }
  requestAnimationFrame(spinLoop);
})();
const stage = $("#ringStage");
stage.addEventListener("pointerdown", (e) => {
  spin.drag = { x: e.clientX, last: e.clientX, t: performance.now(), horizontal: null, y: e.clientY };
});
stage.addEventListener("pointermove", (e) => {
  const d = spin.drag;
  if (!d) return;
  if (d.horizontal === null && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
    d.horizontal = Math.abs(e.clientX - d.x) > Math.abs(e.clientY - d.y);
    if (d.horizontal) stage.setPointerCapture(e.pointerId);
  }
  if (!d.horizontal) return;
  const dx = e.clientX - d.last;
  spin.angle += dx * 0.4;
  spin.vel = dx * 0.4;
  d.last = e.clientX;
});
const releaseSpin = () => { spin.drag = null; };
stage.addEventListener("pointerup", releaseSpin);
stage.addEventListener("pointercancel", releaseSpin);

function updateAlive() {
  const secs = Math.floor((Date.now() - BIRTH.getTime()) / 1000);
  $("#aliveSec").textContent = secs.toLocaleString("en-IN");
}
updateAlive();
setInterval(updateAlive, 1000);

$("#fireworksBtn").addEventListener("click", () => {
  fireworks(7);
  love("finale", 4);
});
$("#restartBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast("Round two? 🥰");
});

/* ---------- Reveal on scroll ---------- */
const revealer = new IntersectionObserver(
  (entries) => entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("in");
      revealer.unobserve(en.target);
    }
  }),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => revealer.observe(el));

let finaleCelebrated = false;
new IntersectionObserver(
  ([en]) => {
    spin.visible = en.isIntersecting;
    if (en.isIntersecting && !finaleCelebrated) {
      finaleCelebrated = true;
      setTimeout(() => fireworks(5), 600);
      love("finale", 4);
    }
  },
  { threshold: 0.35 }
).observe($("#finale"));

/* ---------- Tap anywhere for hearts ---------- */
document.addEventListener("pointerdown", (e) => {
  if (document.body.classList.contains("locked")) return;
  if (e.target.closest("button, a, .deck, .arena, .merge, .ring-stage, #heart3d, .letter, .overflow")) return;
  hearts(e.clientX, e.clientY, 7);
});
