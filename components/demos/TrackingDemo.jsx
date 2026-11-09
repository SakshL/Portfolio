"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, DemoFrame, Seg, clock, useReducedMotion, useVisible } from "components/demos/Frame";

// Live tracking, in miniature: riders move along streets, their phones send sparse, noisy GPS fixes, and the
// marker either jumps to each fix (raw) or glides between them with a duration that follows the real gap (smoothed).

const ROUTES = [
 [[30, 290], [190, 290], [190, 170], [410, 170], [410, 60], [610, 60]],
 [[610, 300], [610, 230], [300, 230], [300, 100], [80, 100], [80, 30]],
 [[30, 170], [110, 170], [110, 250], [470, 250], [470, 310], [610, 310]],
];
const EXTRA = [
 [[190, 30], [190, 170]],
 [[410, 170], [410, 330]],
 [[300, 230], [300, 330]],
 [[470, 60], [470, 250]],
 [[30, 60], [190, 60]],
 [[520, 170], [610, 170]],
];
const COLORS = ["#1491ff", "#f59e0b", "#10b981"];
const STORE = { x: 300, y: 170 };
const RADIUS = 125;

function measure(route) {
 const segs = [];
 let total = 0;
 for (let i = 1; i < route.length; i++) {
  const [x1, y1] = route[i - 1];
  const [x2, y2] = route[i];
  const len = Math.hypot(x2 - x1, y2 - y1);
  segs.push({ x1, y1, x2, y2, len, at: total });
  total += len;
 }
 return { segs, total };
}
const MEASURED = ROUTES.map(measure);

function pointAt(m, d) {
 let t = d % (2 * m.total);
 if (t > m.total) t = 2 * m.total - t;
 const s = m.segs.find((x) => t <= x.at + x.len) || m.segs[m.segs.length - 1];
 const k = (t - s.at) / s.len;
 return { x: s.x1 + (s.x2 - s.x1) * k, y: s.y1 + (s.y2 - s.y1) * k };
}

const rnd = (a, b) => a + Math.random() * (b - a);

function makeRiders() {
 return MEASURED.map((m, i) => {
  const d = rnd(0, m.total);
  const p = pointAt(m, d);
  return { i, m, d, speed: rnd(34, 46), pings: [{ ...p, t: 0 }], disp: { ...p }, from: { ...p }, to: { ...p }, g0: 0, gd: 1, gaps: [2.4], next: rnd(0.4, 2.2), lastSql: -99 };
 });
}

export default function TrackingDemo() {
 const reduced = useReducedMotion();
 const [ref, visible] = useVisible();
 const [mode, setMode] = useState("smooth");
 const [near, setNear] = useState(false);
 const [playing, setPlaying] = useState(true);
 const [log, setLog] = useState([]);
 const [ready, setReady] = useState(false);
 const [, setFrame] = useState(0);
 const riders = useRef(null);
 const simT = useRef(0);
 const modeRef = useRef(mode);
 modeRef.current = mode;
 const seq = useRef(0);

 // random start positions are made in the browser only, so the server and client render the same first frame
 useEffect(() => {
  if (!riders.current) {
   riders.current = makeRiders();
   setReady(true);
  }
 }, []);

 useEffect(() => {
  if (reduced) setPlaying(false);
 }, [reduced]);

 useEffect(() => {
  if (!playing || !visible || !riders.current) return;
  let raf = 0;
  let last = performance.now();
  const tick = (now) => {
   const dt = Math.min(0.1, (now - last) / 1000);
   last = now;
   simT.current += dt;
   const T = simT.current;
   const fresh = [];
   for (const r of riders.current) {
    r.d += r.speed * dt;
    if (T >= r.next) {
     // a GPS fix: true position plus a little noise
     const p = pointAt(r.m, r.d);
     const ping = { x: p.x + rnd(-4, 4), y: p.y + rnd(-4, 4), t: T };
     const gap = T - r.pings[r.pings.length - 1].t;
     r.gaps = [...r.gaps, gap].slice(-4);
     r.pings = [...r.pings, ping].slice(-5);
     const avg = r.gaps.reduce((a, b) => a + b, 0) / r.gaps.length;
     r.from = { ...r.disp };
     r.to = { x: ping.x, y: ping.y };
     r.g0 = T;
     r.gd = Math.min(4.5, Math.max(0.6, avg * 1.12));
     // sometimes the phone goes quiet for a while (bad coverage), mostly every 1.6 to 3.4 s
     r.next = T + (Math.random() < 0.12 ? rnd(4.5, 6) : rnd(1.6, 3.4));
     const sql = T - r.lastSql >= 5;
     if (sql) r.lastSql = T;
     fresh.push({ id: ++seq.current, at: clock(), rider: r.i, sql, gap });
    }
    const lp = r.pings[r.pings.length - 1];
    if (modeRef.current === "raw") r.disp = { x: lp.x, y: lp.y };
    else {
     const k = (T - r.g0) / r.gd;
     if (k <= 1) r.disp = { x: r.from.x + (r.to.x - r.from.x) * k, y: r.from.y + (r.to.y - r.from.y) * k };
     else {
      // a late fix: keep going a little along the last heading, then hold
      const extra = Math.min(k - 1, 0.35);
      r.disp = { x: r.to.x + (r.to.x - r.from.x) * extra, y: r.to.y + (r.to.y - r.from.y) * extra };
     }
    }
   }
   if (fresh.length) setLog((l) => [...fresh.reverse(), ...l].slice(0, 4));
   setFrame((f) => (f + 1) % 1e6);
   raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
 }, [playing, visible, ready]);

 const T = simT.current;
 const list = riders.current || [];
 const nearby = list
  .map((r) => {
   const lp = r.pings[r.pings.length - 1];
   return { r, dist: Math.hypot(lp.x - STORE.x, lp.y - STORE.y), seen: Math.max(0, T - lp.t) };
  })
  .filter((x) => x.dist <= RADIUS)
  .sort((a, b) => a.dist - b.dist);

 return (
  <DemoFrame
   title="Live rider tracking"
   caption="Raw jumps to each GPS fix. Smoothed glides for about as long as the real gap between fixes."
   controls={
    <>
     <Seg
      label="Marker motion"
      value={mode}
      onChange={setMode}
      options={[
       ["raw", "Raw fixes"],
       ["smooth", "Smoothed"],
      ]}
     />
     <Btn on={near} onClick={() => setNear((v) => !v)} aria-pressed={near}>
      Who is near?
     </Btn>
     <Btn onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause" : "Play"}>
      {playing ? "Pause" : "Play"}
     </Btn>
    </>
   }
  >
   <div ref={ref} className="overflow-hidden rounded-lg border border-black/5 bg-[#eef0f3] dark:border-white/5 dark:bg-[#121214]">
    <svg viewBox="0 0 640 340" className="block h-auto w-full" role="img" aria-label="A small map with riders moving along streets">
     {/* blocks */}
     <g className="fill-white/70 dark:fill-white/[3%]">
      {[
       [40, 40, 130, 40], [210, 40, 180, 110], [430, 80, 160, 70], [40, 120, 50, 30], [130, 190, 50, 40], [210, 190, 70, 40],
       [320, 190, 80, 40], [490, 190, 100, 40], [40, 270, 130, 50], [210, 270, 70, 50], [320, 270, 80, 50], [490, 270, 100, 20],
       [100, 120, 180, 30], [430, 20, 160, 20],
      ].map(([x, y, w, h], i) => (
       <rect key={i} x={x} y={y} width={w} height={h} rx="6" />
      ))}
     </g>
     {/* streets */}
     <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {[...ROUTES, ...EXTRA].map((r, i) => (
       <polyline key={i} points={r.map((p) => p.join(",")).join(" ")} className="stroke-white dark:stroke-[#26262b]" strokeWidth="14" />
      ))}
      {[...ROUTES, ...EXTRA].map((r, i) => (
       <polyline key={"l" + i} points={r.map((p) => p.join(",")).join(" ")} className="stroke-black/[7%] dark:stroke-white/[6%]" strokeWidth="1" strokeDasharray="5 7" />
      ))}
     </g>

     {/* who is near: GEOSEARCH around the restaurant */}
     {near && <circle cx={STORE.x} cy={STORE.y} r={RADIUS} className="fill-[#1491ff]/[7%] stroke-[#1491ff]/50 dark:fill-[#64acff]/[8%] dark:stroke-[#64acff]/50" strokeDasharray="4 5" />}
     <g transform={`translate(${STORE.x} ${STORE.y})`}>
      <rect x="-9" y="-9" width="18" height="18" rx="5" className="fill-zinc-900 dark:fill-white" />
      <path d="M-4 -1 h8 M-4 2.5 h8 M-2 -4.5 v2 M2 -4.5 v2" className="stroke-white dark:stroke-zinc-900" strokeWidth="1.4" strokeLinecap="round" />
     </g>

     {/* fixes and riders */}
     {list.map((r) => (
      <g key={r.i}>
       {r.pings.map((p, j) => (
        <circle key={j} cx={p.x} cy={p.y} r="2.6" fill={COLORS[r.i]} opacity={0.12 + (j / r.pings.length) * 0.4} />
       ))}
       {near && nearby.some((x) => x.r === r) && <circle cx={r.disp.x} cy={r.disp.y} r="15" fill="none" stroke={COLORS[r.i]} strokeWidth="2" opacity="0.6" />}
       <circle cx={r.disp.x} cy={r.disp.y} r="8" fill={COLORS[r.i]} className="stroke-white dark:stroke-[#121214]" strokeWidth="2.5" />
       <text x={r.disp.x} y={r.disp.y + 3} textAnchor="middle" className="fill-white text-[8px] font-bold">
        {r.i + 1}
       </text>
      </g>
     ))}
    </svg>
   </div>

   <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
    <div className="min-w-0 rounded-lg border border-black/5 bg-white/60 p-2.5 dark:border-white/5 dark:bg-white/[3%]">
     <p className="mb-1.5 text-[11px] font-semibold text-zinc-500 dark:text-white/40">Each fix, on the server</p>
     {log.length === 0 && <p className="py-1 text-xs text-zinc-500 dark:text-white/40">{playing ? "Waiting for the first fix..." : "Press Play to start the riders."}</p>}
     <ul className="space-y-1">
      {log.map((e) => (
       <li key={e.id} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-zinc-600 dark:text-white/60">
        <span className="font-mono tabular-nums text-zinc-400 dark:text-white/30">{e.at}</span>
        <span className="font-semibold" style={{ color: COLORS[e.rider] }}>
         Rider {e.rider + 1}
        </span>
        <Chip>POST /location</Chip>
        <Chip dim={!e.sql}>{e.sql ? "SQL write" : "SQL skipped, gate held"}</Chip>
        <Chip>GEOADD</Chip>
        <Chip>PUBLISH</Chip>
        <Chip>socket</Chip>
        {e.gap > 4 && <span className="text-amber-600 dark:text-amber-400">after {e.gap.toFixed(1)} s of silence</span>}
       </li>
      ))}
     </ul>
    </div>
    <div className="rounded-lg border border-black/5 bg-white/60 p-2.5 dark:border-white/5 dark:bg-white/[3%]">
     <p className="mb-1.5 text-[11px] font-semibold text-zinc-500 dark:text-white/40">{near ? "GEOSEARCH near the restaurant" : "Nearby riders"}</p>
     {!near ? (
      <p className="text-xs text-zinc-500 dark:text-white/40">Press Who is near? to ask the live index which riders are close to the restaurant.</p>
     ) : nearby.length ? (
      <ul className="space-y-1">
       {nearby.map(({ r, dist, seen }) => (
        <li key={r.i} className="flex items-center justify-between gap-2 text-xs text-zinc-700 dark:text-white/75">
         <span className="font-semibold" style={{ color: COLORS[r.i] }}>
          Rider {r.i + 1}
         </span>
         <span className="tabular-nums text-zinc-500 dark:text-white/[45%]">
          {(dist / 125).toFixed(1)} km · seen {seen.toFixed(0)} s ago
         </span>
        </li>
       ))}
      </ul>
     ) : (
      <p className="text-xs text-zinc-500 dark:text-white/40">No rider inside the circle right now.</p>
     )}
    </div>
   </div>
  </DemoFrame>
 );
}

function Chip({ children, dim }) {
 return <span className={`rounded px-1.5 py-px font-mono text-[10px] ${dim ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-black/[5%] text-zinc-600 dark:bg-white/[7%] dark:text-white/[65%]"}`}>{children}</span>;
}
