"use client";

import { useEffect, useRef, useState } from "react";
import "styles/skyline.css";

// Your City at the very bottom of the page, in depth: the Himalaya (lit and shaded faces, alpenglow at dawn and
// dusk), the forested valley rim, Swayambhu with its prayer flags, Dharahara, a five-tier pagoda, a dense city with
// water tanks and rebar on the roofs, and the power lines every street has. Layers rise in as you scroll; the sky
// follows Nepal time. Everything is drawn from fixed seeds, so the server and the browser draw the same city.

const W = 1440;
const H = 300;

function rng(seed) {
 let s = seed;
 return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const f1 = (n) => Math.round(n * 10) / 10;

// ---------- Himalaya ----------
const PEAKS = [
 [-20, 152], [45, 134], [110, 142], [190, 104], [240, 118], [330, 140], [410, 110], [455, 124], [540, 98], [600, 120], [680, 140],
 [760, 88], [808, 72], [860, 98], [950, 126], [1030, 106], [1088, 82], [1150, 114], [1235, 136], [1300, 110], [1352, 120], [1430, 140], [1500, 152],
];
const range = (() => {
 const r = rng(11);
 const pts = [];
 const facets = [];
 for (let i = 0; i < PEAKS.length; i++) {
  const [x, y] = PEAKS[i];
  pts.push([x, y]);
  const nx = PEAKS[i + 1];
  if (!nx) break;
  const sx = (x + nx[0]) / 2 + (r() - 0.5) * 16;
  const sy = Math.max(y, nx[1]) + 22 + r() * 18;
  // rocky shoulders between summit and saddle
  const a = [f1(x + (sx - x) * 0.4), f1(y + (sy - y) * 0.32 + (r() - 0.5) * 6)];
  const b = [f1(sx + (nx[0] - sx) * 0.55), f1(sy + (nx[1] - sy) * 0.6 + (r() - 0.5) * 6)];
  pts.push(a, [f1(sx), f1(sy)], b);
  // shaded east face: summit, down the shoulder to the saddle, then straight down
  facets.push(`M${x} ${y} L${a[0]} ${a[1]} L${f1(sx)} ${f1(sy)} L${f1(sx + 6)} 250 L${f1(x + 14 + r() * 10)} 250 L${f1(x - 3 + r() * 4)} ${f1(y + 44)} L${f1(x + 3 + r() * 3)} ${f1(y + 20)} Z`);
 }
 const ridge = `M-40 ${H} L` + pts.map(([x, y]) => `${x} ${y}`).join(" L") + ` L${W + 60} ${H} Z`;
 // ragged snow line
 let snow = `M-40 0 H${W + 60} V150`;
 for (let x = W + 60; x >= -40; x -= 22) snow += ` L${x} ${f1(146 + Math.sin(x / 37) * 7 + (r() - 0.5) * 6)}`;
 return { ridge, facets, snow: snow + " Z" };
})();

// ---------- valley rim with a tree-line edge ----------
const HILLS = (() => {
 const r = rng(23);
 let d = `M-10 ${H} L-10 214`;
 for (let x = -10; x <= W + 10; x += 9) {
  const base = 212 + Math.sin(x / 140) * 8 + Math.sin(x / 61 + 1) * 4;
  d += ` Q${x + 4.5} ${f1(base - 4 - r() * 4)} ${x + 9} ${f1(base)}`;
 }
 return d + ` L${W + 10} ${H} Z`;
})();

// Swayambhu hill: rounded, wooded
const SWAY_X = 560;
const SWAY_TOP = 196;
const SWAY_HILL = (() => {
 const r = rng(31);
 let d = `M440 ${H} L440 240`;
 for (let x = 440; x <= 680; x += 8) {
  const t = (x - SWAY_X) / 120;
  const base = SWAY_TOP + 44 * t * t + 4;
  d += ` Q${x + 4} ${f1(base - 3 - r() * 4)} ${x + 8} ${f1(base)}`;
 }
 return d + ` L688 ${H} Z`;
})();

// prayer flags: strings from the spire down both sides of the hill
const FLAG_COLORS = ["#2563eb", "#f8fafc", "#dc2626", "#16a34a", "#eab308"];
const FLAG_STRINGS = [
 [SWAY_X, 140, 470, 248, 506, 170],
 [SWAY_X, 140, 500, 238, 524, 182],
 [SWAY_X, 140, 620, 238, 596, 182],
 [SWAY_X, 140, 652, 248, 614, 170],
];
const FLAGS = FLAG_STRINGS.map(([x0, y0, x1, y1, cx, cy]) => {
 const n = 13;
 const flags = [];
 for (let i = 1; i < n; i++) {
  const t = i / n;
  const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
  const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
  flags.push({ x: f1(x), y: f1(y), c: FLAG_COLORS[i % 5] });
 }
 return { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, flags };
});

// ---------- city ----------
function city(seed, { y0, minH, maxH, calm, gap, tanks, rebar, roofs, winP }) {
 const r = rng(seed);
 const out = [];
 for (let x = -6; x < W + 6; ) {
  const w = 14 + Math.round(r() * 26);
  const mid = x + w / 2;
  const quiet = calm.some(([a, b]) => mid > a && mid < b);
  const h = Math.round(minH + r() * ((quiet ? minH + 10 : maxH) - minH));
  const top = y0 - h;
  const b = { x, w, h, top, tank: null, rebar: [], roof: null, wins: [], room: null };
  if (r() < tanks) b.tank = { x: x + 3 + Math.round(r() * Math.max(1, w - 11)) };
  if (r() < rebar) for (let i = 0; i < 2 + Math.floor(r() * 3); i++) b.rebar.push(x + 2 + Math.round(r() * (w - 4)));
  if (r() < roofs) b.roof = true;
  else if (r() < 0.25 && w > 22) b.room = { x: x + 4 + Math.round(r() * (w - 18)), w: 10 };
  for (let wy = top + 6; wy < y0 - 6; wy += 9) for (let wx = x + 4; wx < x + w - 5; wx += 7) if (r() < winP) b.wins.push([wx, wy, r() < 0.06]);
  out.push(b);
  x += w + Math.round(r() * gap);
 }
 return out;
}
const CALM = [[470, 660], [700, 770], [815, 945]];
const BACK = city(41, { y0: 266, minH: 10, maxH: 34, calm: [[500, 620]], gap: 2, tanks: 0.3, rebar: 0.15, roofs: 0.2, winP: 0.12 });
const FRONT = city(57, { y0: H, minH: 18, maxH: 70, calm: CALM, gap: 3, tanks: 0.5, rebar: 0.35, roofs: 0.15, winP: 0.22 });

// ---------- power lines ----------
const POLES = [92, 318, 1010, 1218, 1400];
const WIRES = [];
for (let i = 0; i < POLES.length - 1; i++) {
 const a = POLES[i];
 const b = POLES[i + 1];
 if (b - a > 420) continue; // no wires across the landmarks
 for (const [k, dy] of [[0, 0], [1, 6], [2, 12]]) {
  const sag = 16 + k * 3;
  WIRES.push(`M${a - 9 + k * 9} ${206 + dy} Q${(a + b) / 2} ${206 + dy + sag * 2} ${b - 9 + k * 9} ${206 + dy}`);
 }
}

// ---------- sky ----------
function nepalNow() {
 const now = new Date();
 const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
 const g = (t) => +parts.find((x) => x.type === t).value;
 const m = g("hour") * 60 + g("minute");
 const doy = Math.floor((Date.UTC(g("year"), g("month") - 1, g("day")) - Date.UTC(g("year"), 0, 1)) / 864e5);
 const season = Math.cos((2 * Math.PI * (doy + 11)) / 365); // 1 in late December, -1 in late June
 return { m, rise: 362 + 50 * season, set: 1082 - 52 * season, now };
}
function phaseOf({ m, rise, set }) {
 if (m >= rise - 50 && m < rise + 40) return "dawn";
 if (m >= rise + 40 && m < set - 45) return "day";
 if (m >= set - 45 && m < set + 40) return "dusk";
 return "night";
}
function moonAge(now) {
 const ref = Date.UTC(2000, 0, 6, 18, 14) / 864e5;
 return ((((now.getTime() / 864e5 - ref) / 29.530588853) % 1) + 1) % 1;
}
function moonPath(cx, cy, rad, age) {
 const rx = Math.abs(Math.cos(2 * Math.PI * age)) * rad;
 const top = `${cx} ${cy - rad}`;
 const bot = `${cx} ${cy + rad}`;
 if (age < 0.5) return `M${top} A${rad} ${rad} 0 0 1 ${bot} A${rx} ${rad} 0 0 ${age < 0.25 ? 0 : 1} ${top} Z`;
 return `M${top} A${rad} ${rad} 0 0 0 ${bot} A${rx} ${rad} 0 0 ${age < 0.75 ? 0 : 1} ${top} Z`;
}
const arc = (t) => ({ x: f1(160 + 1120 * t), y: f1(200 - Math.sin(Math.PI * t) * 112) });
const STARS = (() => {
 const s = rng(99);
 return Array.from({ length: 70 }, () => ({ x: f1(s() * W), y: f1(8 + s() * 140), r: f1(0.5 + s() * 1.1), d: f1(s() * 4) }));
})();
const CLOUDS = [
 { x: 180, y: 52, s: 1 },
 { x: 760, y: 34, s: 0.8 },
 { x: 1180, y: 66, s: 1.15 },
];

const Cloud = ({ x, y, s }) => (
 <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse cx="0" cy="8" rx="46" ry="9" />
  <ellipse cx="-16" cy="2" rx="20" ry="11" />
  <ellipse cx="10" cy="-2" rx="24" ry="14" />
  <ellipse cx="32" cy="4" rx="16" ry="9" />
 </g>
);

function Buildings({ list, y0, tone }) {
 return (
  <>
   {list.map((b, i) => (
    <g key={i}>
     {b.roof ? <path d={`M${b.x - 1} ${b.top} L${b.x + b.w / 2} ${b.top - 7} L${b.x + b.w + 1} ${b.top} Z`} fill={`var(--${tone})`} /> : null}
     <rect x={b.x} y={b.top} width={b.w} height={y0 - b.top} fill={`var(--${tone})`} />
     {b.room && <rect x={b.room.x} y={b.top - 7} width={b.room.w} height="7" fill={`var(--${tone})`} />}
     {b.tank && <rect x={b.tank.x} y={b.top - 8} width="7" height="8" rx="1.2" fill={`var(--${tone}-tank)`} />}
     {b.rebar.map((x, j) => (
      <line key={j} x1={x} x2={x} y1={b.top} y2={b.top - 4 - (j % 2) * 2} stroke={`var(--${tone})`} strokeWidth="0.9" />
     ))}
     {b.wins.map(([x, y, flick], j) => (
      <rect key={j} className={flick ? "ktm-win ktm-flick" : "ktm-win"} x={x} y={y} width="3" height="4" rx="0.4" style={flick ? { animationDelay: `${(i * 7 + j) % 9}s` } : undefined} />
     ))}
    </g>
   ))}
  </>
 );
}

export function KathmanduSkyline() {
 const ref = useRef(null);
 const [sky, setSky] = useState(null);

 useEffect(() => {
  const tick = () => {
   const t = nepalNow();
   // ?sky=dawn|day|dusk|night previews a time of day
   const force = new URLSearchParams(location.search).get("sky");
   if (force && /^(dawn|day|dusk|night)$/.test(force)) t.m = { dawn: t.rise, day: (t.rise + t.set) / 2, dusk: t.set, night: (t.set + 1440 + t.rise) / 2 % 1440 }[force];
   const phase = phaseOf(t);
   let sun = null;
   let moon = null;
   if (t.m >= t.rise - 12 && t.m <= t.set + 12) sun = arc((t.m - t.rise + 12) / (t.set - t.rise + 24));
   else {
    const len = 1440 - (t.set - t.rise) - 24;
    moon = { ...arc(((t.m - t.set - 12 + 1440) % 1440) / len), age: moonAge(t.now) };
   }
   setSky({ phase, sun, moon });
  };
  tick();
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
 }, []);

 useEffect(() => {
  const el = ref.current;
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf = 0;
  const update = () => {
   raf = 0;
   const b = el.getBoundingClientRect();
   const p = Math.max(0, Math.min(1, (innerHeight - b.top) / (b.height * 0.95)));
   el.style.setProperty("--draw", p.toFixed(3));
  };
  const onScroll = () => {
   if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  return () => {
   removeEventListener("scroll", onScroll);
   removeEventListener("resize", onScroll);
   cancelAnimationFrame(raf);
  };
 }, []);

 const phase = sky?.phase || "day";
 const night = phase === "night";

 return (
  <div ref={ref} className="ktm h-[210px] w-full sm:h-[250px] md:h-[300px] print:hidden" data-phase={phase} aria-hidden="true" style={{ "--draw": 0 }}>
   {["dawn", "day", "dusk", "night"].map((p) => (
    <div key={p} className={`ktm-sky ktm-sky-${p}`} />
   ))}
   <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
    <defs>
     <clipPath id="ktm-range">
      <path d={range.ridge} />
     </clipPath>
     <linearGradient id="ktm-haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="var(--haze)" stopOpacity="0" />
      <stop offset="1" stopColor="var(--haze)" stopOpacity="0.85" />
     </linearGradient>
     <radialGradient id="ktm-glow">
      <stop offset="0" stopColor="var(--sun)" stopOpacity="0.45" />
      <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
     </radialGradient>
     <radialGradient id="ktm-moonglow">
      <stop offset="0" stopColor="#dbe4f5" stopOpacity="0.28" />
      <stop offset="1" stopColor="#dbe4f5" stopOpacity="0" />
     </radialGradient>
     <linearGradient id="ktm-street" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="var(--lamp)" stopOpacity="0" />
      <stop offset="1" stopColor="var(--lamp)" stopOpacity="0.3" />
     </linearGradient>
    </defs>

    {/* stars, moon, sun, clouds */}
    <g className="ktm-fade" style={{ opacity: night ? 1 : 0 }}>
     {STARS.map((s, i) => (
      <circle key={i} className="ktm-star" cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${s.d}s` }} />
     ))}
    </g>
    {sky?.moon && (
     <g className="ktm-fade" style={{ opacity: night ? 1 : 0.6 }}>
      <circle cx={sky.moon.x} cy={sky.moon.y} r="46" fill="url(#ktm-moonglow)" />
      <circle cx={sky.moon.x} cy={sky.moon.y} r="12" fill="#e2e8f0" opacity="0.12" />
      <path d={moonPath(sky.moon.x, sky.moon.y, 12, sky.moon.age)} fill="#f1f5f9" />
     </g>
    )}
    {sky?.sun && (
     <g>
      <circle cx={sky.sun.x} cy={sky.sun.y} r="90" fill="url(#ktm-glow)" />
      <circle cx={sky.sun.x} cy={sky.sun.y} r="15" fill="var(--sun)" />
     </g>
    )}
    <g className="ktm-clouds ktm-fade" fill="var(--cloud)" style={{ opacity: night ? 0 : 1 }}>
     {CLOUDS.map((c, i) => (
      <Cloud key={i} {...c} />
     ))}
    </g>

    {/* Himalaya */}
    <g className="ktm-layer" style={{ "--rise": "26px", "--from": 0 }}>
     <path d={range.ridge} fill="var(--rock)" />
     <path d={range.snow} clipPath="url(#ktm-range)" fill="var(--snow)" />
     <g clipPath="url(#ktm-range)" fill="var(--shade)">
      {range.facets.map((d, i) => (
       <path key={i} d={d} />
      ))}
     </g>
     <rect x="-40" y="150" width={W + 100} height="110" fill="url(#ktm-haze)" />
    </g>

    {/* valley rim */}
    <g className="ktm-layer" style={{ "--rise": "34px", "--from": 0.08 }}>
     <path d={HILLS} fill="var(--hill)" />
     <rect x="-10" y="215" width={W + 20} height="60" fill="url(#ktm-haze)" opacity="0.55" />
    </g>

    {/* back city */}
    <g className="ktm-layer" style={{ "--rise": "40px", "--from": 0.16 }}>
     <Buildings list={BACK} y0={266} tone="back" />
     <rect x="0" y="262" width={W} height={H - 262} fill="var(--back)" />
    </g>

    {/* Swayambhu */}
    <g className="ktm-layer" style={{ "--rise": "52px", "--from": 0.2 }}>
     <path d={SWAY_HILL} fill="var(--wood)" />
     <g className="ktm-flags">
      {FLAGS.map((s, i) => (
       <g key={i}>
        <path d={s.d} fill="none" stroke="var(--string)" strokeWidth="0.6" />
        {s.flags.map((f, j) => (
         <path key={j} d={`M${f.x - 2} ${f.y} h4 l-2 5 Z`} fill={f.c} opacity="var(--flag-op)" />
        ))}
       </g>
      ))}
     </g>
     {/* platform, dome, harmika with eyes, 13 rings, parasol */}
     <rect x={SWAY_X - 40} y={SWAY_TOP - 2} width="80" height="6" rx="1" fill="var(--plinth)" />
     <path d={`M${SWAY_X - 33} ${SWAY_TOP - 1} C${SWAY_X - 33} ${SWAY_TOP - 22} ${SWAY_X - 18} ${SWAY_TOP - 27} ${SWAY_X} ${SWAY_TOP - 27} C${SWAY_X + 18} ${SWAY_TOP - 27} ${SWAY_X + 33} ${SWAY_TOP - 22} ${SWAY_X + 33} ${SWAY_TOP - 1} Z`} fill="var(--stupa)" />
     <path d={`M${SWAY_X + 8} ${SWAY_TOP - 26} C${SWAY_X + 22} ${SWAY_TOP - 24} ${SWAY_X + 33} ${SWAY_TOP - 18} ${SWAY_X + 33} ${SWAY_TOP - 1} H${SWAY_X + 12} Z`} fill="var(--shade)" opacity="0.45" />
     <rect x={SWAY_X - 7} y={SWAY_TOP - 37} width="14" height="10" fill="var(--gold)" />
     <path d={`M${SWAY_X - 5.5} ${SWAY_TOP - 32.5} q1.8 -1.8 3.6 0 M${SWAY_X + 1.9} ${SWAY_TOP - 32.5} q1.8 -1.8 3.6 0 M${SWAY_X} ${SWAY_TOP - 31} v2.5`} stroke="var(--eyes)" strokeWidth="0.8" fill="none" />
     <path d={`M${SWAY_X - 5.5} ${SWAY_TOP - 37} L${SWAY_X - 1.8} ${SWAY_TOP - 60} H${SWAY_X + 1.8} L${SWAY_X + 5.5} ${SWAY_TOP - 37} Z`} fill="var(--gold)" />
     <path d={Array.from({ length: 6 }, (_, i) => `M${f1(SWAY_X - 4.8 + i * 0.6)} ${SWAY_TOP - 40 - i * 3.4} h${f1(9.6 - i * 1.2)}`).join(" ")} stroke="var(--gold-line)" strokeWidth="0.6" />
     <path d={`M${SWAY_X - 6} ${SWAY_TOP - 60} Q${SWAY_X} ${SWAY_TOP - 66} ${SWAY_X + 6} ${SWAY_TOP - 60} Z`} fill="var(--gold)" />
     <path d={`M${SWAY_X} ${SWAY_TOP - 64} V${SWAY_TOP - 71}`} stroke="var(--gold)" strokeWidth="1.3" />
    </g>

    {/* Dharahara */}
    <g className="ktm-layer" style={{ "--rise": "56px", "--from": 0.24 }} fill="var(--tower)">
     <path d="M724 300 L729.5 170 H740.5 L746 300 Z" />
     <path d="M737 170 H740.5 L746 300 H741.5 Z" fill="var(--shade)" opacity="0.55" />
     <rect x="725" y="164" width="20" height="5" rx="1" />
     <path d="M730 164 L731 146 H739 L740 164 Z" />
     <rect x="728" y="141" width="14" height="4" rx="1" />
     <path d="M731.5 141 C731.5 133 733 129 735 126 C737 129 738.5 133 738.5 141 Z" fill="var(--gold)" />
     <path d="M735 126 V112" stroke="var(--gold)" strokeWidth="1.1" />
     <path d="M733.5 196 v6 M736.5 226 v6 M733.5 256 v6 M734 152 v6" stroke="var(--shade)" strokeWidth="1.4" />
    </g>

    {/* five-tier pagoda on a stepped plinth */}
    <g className="ktm-layer" style={{ "--rise": "56px", "--from": 0.26 }}>
     {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={880 - (58 - i * 7)} y={274 - i * 6} width={(58 - i * 7) * 2} height="6.5" fill="var(--plinth)" />
     ))}
     {[0, 1, 2, 3, 4].map((i) => {
      const y = 244 - i * 17;
      const bw = 15 - i * 2;
      const rw = 33 - i * 4.4;
      return (
       <g key={i}>
        <rect x={880 - bw} y={y - 9} width={bw * 2} height="10" fill="var(--temple)" />
        <path d={`M${f1(880 - rw)} ${y - 7} Q${880 - rw * 0.4} ${y - 9} ${880} ${y - 17} Q${880 + rw * 0.4} ${y - 9} ${f1(880 + rw)} ${y - 7} L${f1(880 + rw - 3)} ${y - 5} H${f1(880 - rw + 3)} Z`} fill="var(--roof)" />
        <path d={`M${880} ${y - 17} Q${880 + rw * 0.4} ${y - 9} ${f1(880 + rw)} ${y - 7} L${f1(880 + rw - 3)} ${y - 5} H880 Z`} fill="var(--shade)" opacity="0.35" />
       </g>
      );
     })}
     <path d="M880 159 V148" stroke="var(--gold)" strokeWidth="1.6" />
     <circle cx="880" cy="147" r="2" fill="var(--gold)" />
    </g>

    {/* front city, street glow and power lines */}
    <g className="ktm-layer" style={{ "--rise": "70px", "--from": 0.3 }}>
     <rect x="0" y="250" width={W} height="50" fill="url(#ktm-street)" />
     <Buildings list={FRONT} y0={H} tone="front" />
     <g stroke="var(--wire)" strokeWidth="0.7" fill="none">
      {WIRES.map((d, i) => (
       <path key={i} d={d} />
      ))}
     </g>
     {POLES.map((x) => (
      <g key={x} fill="var(--front)">
       <rect x={x - 1.6} y="198" width="3.2" height={H - 198} />
       <rect x={x - 14} y="204" width="28" height="2.4" />
       <rect x={x - 7} y="214" width="12" height="7" rx="1" />
      </g>
     ))}
     {/* pigeons on the wire */}
     <g fill="var(--front)">
      {[
       [178, 224],
       [186, 225.5],
       [1092, 225],
      ].map(([x, y], i) => (
       <path key={i} d={`M${x} ${y} q2 -3.5 4.5 -1 q1.5 -1 2.5 0.4 l-1.5 0.8 q-2 2 -5.5 -0.2 Z`} />
      ))}
     </g>
    </g>

    {/* birds crossing the sky in daylight */}
    <g className="ktm-birds ktm-fade" fill="none" stroke="var(--bird)" strokeWidth="1.1" strokeLinecap="round" style={{ opacity: night ? 0 : 1 }}>
     <path d="M0 0 q3 -3 6 0 q3 -3 6 0" />
     <path d="M16 8 q2.5 -2.5 5 0 q2.5 -2.5 5 0" />
     <path d="M-12 12 q2 -2 4 0 q2 -2 4 0" />
    </g>
   </svg>
  </div>
 );
}
