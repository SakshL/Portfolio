"use client";

import { play } from "lib/sound";
import { useCallback, useEffect, useRef, useState } from "react";

// A hidden endless runner: me on a delivery scooter through a flat little Your City street.
// Opens when you type "acme", on a window "play-game" event, or from the terminal (game).
const H = 300; // logical height, width follows the screen
const GROUND = 268; // where the wheels touch the road
const KERB = 226; // where the buildings stand
const GRAVITY = 2300;
const JUMP = -760;
const PX = 96; // rider x
const BEST_KEY = "delivery-best";
const OBST = { pothole: { w: 46, h: 10 }, puddle: { w: 56, h: 8 }, cone: { w: 20, h: 30 }, cow: { w: 66, h: 46 } };
const KINDS = ["pothole", "cone", "cow", "puddle", "cone", "pothole", "cow"];
const FLAGS = ["#3b6fd8", "#f2f2f2", "#d8453b", "#3a9a5b", "#f2c230"];
const PAL = {
 light: { sky: "#eef1f3", hill: "#dde2dc", stupa: "#ffffff", top: "#ecebe6", eye: "#3a3a3a", gold: "#d6a21e", brick: ["#c4674b", "#b55a40", "#a85238"], ledge: "#e9e2d6", win: "#5b3426", pole: "#8a8a8a", walk: "#d6d0c4", road: "#56565c", dash: "#e8e8e8", hole: "#2e2e33", text: "#27272a", cow: "#f1ede4" },
 dark: { sky: "#111113", hill: "#1c1c20", stupa: "#4a4a50", top: "#3e3e44", eye: "#141416", gold: "#a07a1a", brick: ["#6e3a2c", "#5f3226", "#7a4232"], ledge: "#3a2c26", win: "#FFD60A", pole: "#4a4a50", walk: "#232327", road: "#2a2a2e", dash: "#5a5a60", hole: "#0d0d0f", text: "#fafafa", cow: "#cfc9bd" },
};

function rng(seed) {
 let s = seed >>> 0;
 return () => {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

// one strip of low brick buildings that repeats forever
const TILE = 980;
const BUILDINGS = (() => {
 const r = rng(7);
 const out = [];
 let x = 0;
 while (x < TILE - 60) {
  const w = Math.min(70 + Math.floor(r() * 60), TILE - x);
  const h = 60 + Math.floor(r() * 80);
  const wins = [];
  for (let wy = 14; wy < h - 20; wy += 24) for (let wx = 10; wx < w - 14; wx += 20) wins.push([wx, wy, r() < 0.45]);
  out.push({ x, w, h, c: Math.floor(r() * 3), wins });
  x += w + 4 + Math.floor(r() * 12);
 }
 return out;
})();

const readBest = () => {
 try {
  return Number(localStorage.getItem(BEST_KEY)) || 0;
 } catch {
  return 0;
 }
};
const saveBest = (n) => {
 try {
  localStorage.setItem(BEST_KEY, String(n));
 } catch {
  // storage blocked, the best score just lives for this visit
 }
};
const typingIn = (el) => !!el && (/^(input|textarea|select)$/i.test(el.tagName || "") || el.isContentEditable);
const ell = (c, x, y, rx, ry, fill) => {
 c.fillStyle = fill;
 c.beginPath();
 c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
 c.fill();
};
// flat lists: x, y, w, h per rectangle
const box = (c, fill, list) => {
 c.fillStyle = fill;
 for (let i = 0; i < list.length; i += 4) c.fillRect(list[i], list[i + 1], list[i + 2], list[i + 3]);
};
// flat lists: x1, y1, x2, y2 per segment
const segs = (c, stroke, width, list) => {
 c.strokeStyle = stroke;
 c.lineWidth = width;
 c.beginPath();
 for (let i = 0; i < list.length; i += 4) c.moveTo(list[i], list[i + 1]), c.lineTo(list[i + 2], list[i + 3]);
 c.stroke();
};
const poly = (c, fill, pts) => {
 c.fillStyle = fill;
 c.beginPath();
 for (let i = 0; i < pts.length; i += 2) c[i ? "lineTo" : "moveTo"](pts[i], pts[i + 1]);
 c.closePath();
 c.fill();
};
const tiles = (W, off, size, fn) => {
 for (let base = -(((off % size) + size) % size) - size; base < W + size; base += size) fn(base);
};

function stupa(c, x, y, p) {
 box(c, p.stupa, [x - 40, y - 8, 80, 8]);
 c.beginPath();
 c.arc(x, y - 8, 30, Math.PI, 0);
 c.fill();
 box(c, p.top, [x - 9, y - 51, 18, 14]);
 box(c, p.eye, [x - 7, y - 46, 5, 2, x + 2, y - 46, 5, 2]);
 poly(c, p.gold, [x - 8, y - 51, x + 8, y - 51, x, y - 84]);
 // flags strung from the spire, the Boudha way
 for (const s of [-1, 1]) {
  segs(c, p.pole, 0.8, [x, y - 84, x + s * 62, y - 8]);
  for (let i = 1; i < 8; i++) box(c, FLAGS[i % 5], [x + s * 62 * (i / 8) - 2, y - 84 + 76 * (i / 8), 4, 5]);
 }
}

function cow(c, x, p) {
 const y = GROUND;
 box(c, p.cow, [x + 4, y - 38, 46, 24, x + 6, y - 14, 5, 14, x + 16, y - 14, 5, 14, x + 36, y - 14, 5, 14, x + 44, y - 14, 5, 14, x + 48, y - 44, 16, 14]);
 box(c, "#8a5a3c", [x + 14, y - 38, 12, 10, x + 34, y - 28, 10, 9, x + 60, y - 38, 6, 7]);
 segs(c, "#8a7a60", 2, [x + 52, y - 44, x + 50, y - 50, x + 60, y - 44, x + 62, y - 50, x + 4, y - 36, x, y - 20]);
 ell(c, x + 58, y - 40, 1.4, 1.4, "#1c1c1c");
}

function obstacle(c, o, p) {
 const { x, w, h } = o;
 if (o.kind === "pothole") {
  ell(c, x + w / 2, GROUND + 1, w / 2, 6, p.walk);
  ell(c, x + w / 2, GROUND + 2, w / 2 - 3, 4.5, p.hole);
 } else if (o.kind === "puddle") {
  ell(c, x + w / 2, GROUND + 1, w / 2, 5, "#6f98bb");
  box(c, "#b9d1e4", [x + w / 2 - 12, GROUND - 1, 14, 1.5]);
 } else if (o.kind === "cone") {
  box(c, "#f28c28", [x - 3, GROUND - 4, w + 6, 4]);
  poly(c, "#f28c28", [x + 2, GROUND - 4, x + w - 2, GROUND - 4, x + w / 2 + 2, GROUND - h, x + w / 2 - 2, GROUND - h]);
  box(c, "#ffffff", [x + 6, GROUND - 18, w - 12, 4]);
 } else cow(c, x, p);
}

function bag(c, x, y) {
 c.strokeStyle = "#1c1c1c";
 c.lineWidth = 1.6;
 c.beginPath();
 c.arc(x, y - 9, 5, Math.PI, 0);
 c.stroke();
 box(c, "#FFD60A", [x - 10, y - 9, 20, 19]);
 box(c, "#1c1c1c", [x - 10, y - 3, 20, 2]);
}

function rider(c, x, y, spin, tilt) {
 c.save();
 c.translate(x, y);
 c.rotate(tilt);
 // delivery box on the back in Acme yellow, then the scooter, seat and handlebar
 box(c, "#FFD60A", [-46, -52, 26, 24]);
 box(c, "#1c1c1c", [-46, -44, 26, 3]);
 poly(c, "#2a9d8f", [-36, -14, -30, -28, 4, -28, 10, -18, 18, -18, 22, -42, 28, -42, 34, -14]);
 box(c, "#1f1f22", [-28, -32, 26, 5, 16, -48, 12, 3]);
 for (const wx of [-22, 26]) {
  ell(c, wx, -11, 11, 11, "#1f1f22");
  ell(c, wx, -11, 4.5, 4.5, "#9a9aa0");
  segs(c, "#9a9aa0", 1.2, [wx + Math.cos(spin) * 8, -11 + Math.sin(spin) * 8, wx - Math.cos(spin) * 8, -11 - Math.sin(spin) * 8]);
 }
 // me: jeans, dark tee with the yellow collar, arm on the bar
 poly(c, "#3c4a6b", [-18, -34, 6, -36, 12, -18, 5, -18, 1, -28, -18, -27]);
 box(c, "#2a2a30", [-20, -60, 18, 28]);
 c.lineCap = "round";
 segs(c, "#e8b48a", 5, [-8, -55, 18, -47]);
 box(c, "#d9a07a", [-15, -66, 8, 7]);
 c.strokeStyle = "#FFD60A";
 c.lineWidth = 2;
 c.beginPath();
 c.moveTo(-17, -60);
 c.quadraticCurveTo(-11, -56, -5, -60);
 c.stroke();
 // the head, a flat version of the cartoon in the footer
 const hx = -11;
 const hy = -78;
 ell(c, hx - 11, hy + 1, 3, 4.5, "#e8b48a");
 ell(c, hx + 11, hy + 1, 3, 4.5, "#e8b48a");
 ell(c, hx, hy, 11.5, 13, "#e8b48a");
 ell(c, hx - 5, hy + 6, 3, 2, "rgba(232,143,122,.35)");
 ell(c, hx + 7, hy + 6, 3, 2, "rgba(232,143,122,.35)");
 c.fillStyle = "#2b1c13";
 c.beginPath();
 c.moveTo(hx - 13, hy);
 c.bezierCurveTo(hx - 16, hy - 14, hx - 6, hy - 20, hx + 1, hy - 19);
 c.bezierCurveTo(hx + 10, hy - 19, hx + 16, hy - 12, hx + 13, hy);
 const fringe = [10, -7, 5, -5, 1, -9, -4, -5, -9, -8];
 for (let i = 0; i < fringe.length; i += 2) c.lineTo(hx + fringe[i], hy + fringe[i + 1]);
 c.closePath();
 c.fill();
 ell(c, hx - 2, hy + 1, 1.7, 1.9, "#2b1c13");
 ell(c, hx + 6, hy + 1, 1.7, 1.9, "#2b1c13");
 c.strokeStyle = "#7a3b2c";
 c.lineWidth = 1.4;
 c.beginPath();
 c.arc(hx + 2, hy + 4, 3.6, 0.2 * Math.PI, 0.8 * Math.PI);
 c.stroke();
 c.restore();
}

export function DeliveryGame() {
 const [open, setOpen] = useState(false);
 const [phase, setPhase] = useState("ready");
 const [result, setResult] = useState(null);
 const openRef = useRef(false);
 const wrap = useRef(null);
 const canvas = useRef(null);
 const closeBtn = useRef(null);
 const dialog = useRef(null);
 const G = useRef(null);

 const close = useCallback(() => setOpen(false), []);

 // triggers: type "acme", or a "play-game" event
 useEffect(() => {
  let buf = "";
  const key = (e) => {
   if (openRef.current || e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target) || !e.key || e.key.length !== 1) return;
   buf = (buf + e.key.toLowerCase()).slice(-5);
   if (buf === "acme") {
    buf = "";
    setOpen(true);
   }
  };
  const show = () => setOpen(true);
  window.addEventListener("keydown", key);
  window.addEventListener("play-game", show);
  return () => {
   window.removeEventListener("keydown", key);
   window.removeEventListener("play-game", show);
  };
 }, []);

 const start = useCallback(() => {
  const g = G.current;
  Object.assign(g, { y: GROUND, vy: 0, speed: 320, dist: 0, count: 0, obs: [], bags: [], next: 520, phase: "play", last: 0 });
  setResult(null);
  setPhase("play");
 }, []);

 const action = useCallback(() => {
  const g = G.current;
  if (!g || performance.now() < g.cool) return;
  if (g.phase === "ready" || g.phase === "over") return start();
  if (g.phase === "paused") {
   g.phase = "play";
   g.last = 0;
   return setPhase("play");
  }
  if (g.y >= GROUND - 1) {
   g.vy = JUMP;
   play("tap");
  }
 }, [start]);

 useEffect(() => {
  openRef.current = open;
  if (!open) return;
  const prev = document.activeElement;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  play("whoosh");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const g = (G.current = { y: GROUND, vy: 0, speed: 320, dist: 0, scroll: 0, count: 0, obs: [], bags: [], next: 520, phase: "ready", shake: 0, cool: 0, last: 0, W: 760, scale: 1 });
  setPhase("ready");
  setResult(null);
  const focusT = setTimeout(() => closeBtn.current?.focus(), 30);

  const fit = () => {
   const el = wrap.current;
   const cv = canvas.current;
   if (!el || !cv) return;
   const dpr = Math.min(2, window.devicePixelRatio || 1);
   const { width, height } = el.getBoundingClientRect();
   cv.width = Math.round(width * dpr);
   cv.height = Math.round(height * dpr);
   g.scale = (height / H) * dpr;
   g.W = width / (height / H);
  };
  fit();
  const ro = new ResizeObserver(fit);
  if (wrap.current) ro.observe(wrap.current);

  const crash = () => {
   g.phase = "over";
   g.cool = performance.now() + 450;
   if (!reduce) g.shake = 0.3;
   play("error");
   if (navigator.vibrate) navigator.vibrate(12);
   const m = Math.floor(g.dist / 40);
   const score = m + g.count * 25;
   const best = readBest();
   if (score > best) saveBest(score);
   setResult({ score, best: Math.max(best, score), m, count: g.count, fresh: score > best });
   setPhase("over");
  };

  const update = (dt) => {
   g.speed = Math.min(720, g.speed + 7 * dt);
   const mv = g.speed * dt;
   g.dist += mv;
   g.scroll += mv;
   g.vy += GRAVITY * dt;
   g.y = Math.min(GROUND, g.y + g.vy * dt);
   if (g.y === GROUND) g.vy = 0;
   g.next -= mv;
   if (g.next <= 0) {
    const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
    const { w, h } = OBST[kind];
    const gap = g.speed * (0.9 + Math.random() * 0.8) + 150;
    g.obs.push({ kind, x: g.W + 30, w, h });
    if (Math.random() < 0.3) g.bags.push({ x: g.W + 30 + w / 2, y: GROUND - h - 70 });
    else if (Math.random() < 0.6) g.bags.push({ x: g.W + 30 + w + gap / 2, y: GROUND - 100 - Math.random() * 50 });
    g.next = gap + w;
   }
   for (const o of g.obs) o.x -= mv;
   for (const b of g.bags) b.x -= mv;
   g.obs = g.obs.filter((o) => o.x + o.w > -60);
   g.bags = g.bags.filter((b) => b.x > -40 && !b.got);
   const L = PX - 30;
   const R = PX + 32;
   const T = g.y - 84;
   const B = g.y - 2;
   for (const b of g.bags) {
    if (b.x + 11 > L && b.x - 11 < R && b.y + 10 > T && b.y - 12 < B) {
     b.got = true;
     g.count++;
     play("pop");
    }
   }
   for (const o of g.obs) if (o.x + 6 < R && o.x + o.w - 6 > L && GROUND - o.h + 2 < B) return crash();
  };

  const draw = (t) => {
   const cv = canvas.current;
   const c = cv?.getContext("2d");
   if (!c) return;
   const p = document.documentElement.classList.contains("dark") ? PAL.dark : PAL.light;
   const W = g.W;
   const off = reduce ? 0 : g.scroll;
   c.setTransform(g.scale, 0, 0, g.scale, 0, 0);
   if (g.shake > 0) c.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
   c.fillStyle = p.sky;
   c.fillRect(-10, -10, W + 20, H + 20);
   // far: hills and a stupa
   tiles(W, off * 0.15, 1200, (b) => {
    ell(c, b + 150, KERB, 230, 58, p.hill);
    ell(c, b + 600, KERB, 260, 80, p.hill);
    ell(c, b + 1010, KERB, 210, 52, p.hill);
    stupa(c, b + 600, KERB - 78, p);
   });
   // mid: brick buildings
   tiles(W, off * 0.45, TILE, (b) => {
    for (const s of BUILDINGS) {
     const x = b + s.x;
     if (x > W || x + s.w < 0) continue;
     c.fillStyle = p.brick[s.c];
     c.fillRect(x, KERB - s.h, s.w, s.h);
     c.fillStyle = p.ledge;
     c.fillRect(x - 2, KERB - s.h, s.w + 4, 4);
     c.fillStyle = p.win;
     for (const [wx, wy, lit] of s.wins) if (lit || p === PAL.light) c.fillRect(x + wx, KERB - s.h + wy, 8, 11);
    }
   });
   // prayer flags strung across the street
   tiles(W, off * 0.6, 460, (b) => {
    segs(c, p.pole, 2, [b, KERB, b, 116]);
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(b, 120);
    c.quadraticCurveTo(b + 230, 170, b + 460, 120);
    c.stroke();
    for (let i = 1; i < 15; i++) {
     const k = i / 15;
     c.fillStyle = FLAGS[i % 5];
     c.fillRect(b + 460 * k - 5, (1 - k) * (1 - k) * 120 + 2 * k * (1 - k) * 170 + k * k * 120, 10, 12);
    }
   });
   box(c, p.walk, [-10, KERB, W + 20, 14]);
   box(c, p.road, [-10, KERB + 14, W + 20, H]);
   c.fillStyle = p.dash;
   tiles(W, g.scroll, 64, (b) => c.fillRect(b, 288, 30, 3));
   for (const o of g.obs) obstacle(c, o, p);
   for (const b of g.bags) bag(c, b.x, b.y + (reduce ? 0 : Math.sin(t / 200 + b.x / 50) * 2));
   rider(c, PX, g.y, g.dist / 11, reduce ? 0 : Math.max(-0.12, Math.min(0.12, g.vy * 0.00016)));
   c.fillStyle = p.text;
   c.font = "600 14px ui-sans-serif, system-ui, sans-serif";
   c.textAlign = "left";
   c.fillText(`${g.count} ${g.count === 1 ? "delivery" : "deliveries"} · ${Math.floor(g.dist / 40)} m`, 16, 26);
   c.textAlign = "right";
   c.fillText(`Score ${Math.floor(g.dist / 40) + g.count * 25}`, W - 16, 26);
  };

  let raf = 0;
  const loop = (t) => {
   raf = requestAnimationFrame(loop);
   const dt = g.last ? Math.min(0.05, (t - g.last) / 1000) : 0;
   g.last = t;
   if (g.phase === "play") update(dt);
   if (g.shake > 0) g.shake -= dt;
   draw(t);
  };
  raf = requestAnimationFrame(loop);

  const vis = () => {
   if (document.hidden && g.phase === "play") {
    g.phase = "paused";
    setPhase("paused");
   }
  };
  const down = (e) => {
   e.stopPropagation(); // the game owns the keyboard while it is open
   if (e.key === "Escape") {
    e.preventDefault();
    close();
   } else if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    if (!e.repeat) action();
   } else if (e.key === "Tab") {
    const f = [...(dialog.current?.querySelectorAll("button") || [])];
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
   }
  };
  const up = (e) => e.key === " " && e.preventDefault();
  document.addEventListener("visibilitychange", vis);
  window.addEventListener("keydown", down, true);
  window.addEventListener("keyup", up, true);
  return () => {
   cancelAnimationFrame(raf);
   clearTimeout(focusT);
   ro.disconnect();
   document.removeEventListener("visibilitychange", vis);
   window.removeEventListener("keydown", down, true);
   window.removeEventListener("keyup", up, true);
   document.body.style.overflow = overflow;
   play("close");
   if (prev && prev.focus && !prev.closest?.("[aria-hidden='true']")) prev.focus();
  };
 }, [open, action, close]);

 if (!open) return null;

 return (
  <div ref={dialog} role="dialog" aria-modal="true" aria-label="Delivery game" className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/60 px-4">
   <div className="w-full max-w-[760px] overflow-hidden rounded-xl border border-black/10 bg-white text-zinc-800 dark:border-neutral-800 dark:bg-[#161617] dark:text-white">
    <div className="flex items-center gap-3 border-b border-black/10 px-4 py-2.5 dark:border-neutral-800">
     <p className="text-sm font-semibold">Delivery run</p>
     <p className="text-xs text-slate-600 dark:text-slate-400 max-sm:hidden">Space, arrow up or tap to jump. Esc to close.</p>
     <button ref={closeBtn} type="button" onClick={close} className="ml-auto rounded-lg border border-black/10 px-3 py-1 text-sm duration-200 hover:bg-black/5 dark:border-neutral-800 dark:hover:bg-white/10">
      Close
     </button>
    </div>
    <div
     ref={wrap}
     className="relative h-[240px] w-full cursor-pointer touch-none select-none sm:h-[300px]"
     onPointerDown={(e) => {
      if (e.button > 0 || e.target.closest("button")) return;
      e.preventDefault();
      action();
     }}
    >
     <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
     {phase !== "play" && (
      <div className="absolute inset-0 flex items-center justify-center p-4">
       <div role="status" className="max-w-xs rounded-xl border border-black/10 bg-white px-5 py-4 text-center dark:border-neutral-800 dark:bg-[#161617]">
        {phase === "ready" && (
         <>
          <p className="font-semibold">Deliver the food.</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Grab the yellow bags. Jump the cows, cones, puddles and potholes.</p>
          <p className="mt-3 text-sm font-semibold">Press Space or tap to ride</p>
         </>
        )}
        {phase === "paused" && (
         <>
          <p className="font-semibold">Paused.</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Press Space or tap to keep riding.</p>
         </>
        )}
        {phase === "over" && result && (
         <>
          <p className="font-semibold">Crashed. The food is fine.</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{result.score}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
           {result.fresh ? "New best." : `Best ${result.best}.`} {result.count} {result.count === 1 ? "delivery" : "deliveries"}, {result.m} m.
          </p>
          <p className="mt-3 text-sm font-semibold">Press Space to ride again</p>
          <button type="button" onClick={close} className="mt-3 rounded-lg border border-black/10 px-3 py-1 text-sm duration-200 hover:bg-black/5 dark:border-neutral-800 dark:hover:bg-white/10">
           Close
          </button>
         </>
        )}
       </div>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
