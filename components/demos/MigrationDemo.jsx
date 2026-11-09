"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, DemoFrame, Seg, useReducedMotion, useVisible } from "components/demos/Frame";

// The strangler fig, in miniature: a route table with a mode per route, live traffic flowing to Go or Laravel,
// shadow comparison, and a watchdog that puts a route back in shadow when Go starts answering wrong.

const START = [
 { path: "GET /home/popular-stores", mode: "serve", w: 5 },
 { path: "GET /orders/running", mode: "serve", w: 5 },
 { path: "GET /stores/{id}/menu", mode: "shadow", w: 4 },
 { path: "POST /rider/location", mode: "serve", w: 6 },
 { path: "GET /notifications", mode: "off", w: 2 },
 { path: "POST /orders/place", mode: "off", w: 2, locked: true },
];
const BROKEN = "GET /orders/running";
const DUR = 1100;

const BOX = { app: [16, 70, 104, 46], nginx: [178, 70, 104, 46], go: [400, 14, 120, 46], php: [400, 126, 120, 46] };
const mid = (b, side) => [side === "l" ? b[0] : side === "r" ? b[0] + b[2] : b[0] + b[2] / 2, b[1] + b[3] / 2];

function along(req, now) {
 const k = Math.min(1, (now - req.t0) / DUR);
 const [ax, ay] = mid(BOX.app, "r");
 const [nx, ny] = mid(BOX.nginx, "l");
 const [nx2] = mid(BOX.nginx, "r");
 const target = req.to === "go" ? BOX.go : BOX.php;
 const [tx, ty] = mid(target, "l");
 if (k < 0.45) {
  const t = k / 0.45;
  return { x: ax + (nx - ax) * t, y: ay + (ny - ay) * t, k };
 }
 const t = (k - 0.45) / 0.55;
 return { x: nx2 + (tx - nx2) * t, y: ny + (ty - ny) * t, k };
}

export default function MigrationDemo() {
 const reduced = useReducedMotion();
 const [ref, visible] = useVisible();
 const [routes, setRoutes] = useState(() => START.map((r) => ({ ...r, go: 0, php: 0, ok: 0, bad: 0, canaryBad: 0 })));
 const [traffic, setTraffic] = useState(false);
 const [broken, setBroken] = useState(false);
 const [reqs, setReqs] = useState([]);
 const [diff, setDiff] = useState(null);
 const [events, setEvents] = useState([]);
 const [now, setNow] = useState(0);
 const st = useRef({ routes, broken });
 st.current = { routes, broken };
 const seq = useRef(0);

 const note = (text, tone = "") => setEvents((e) => [{ id: ++seq.current, text, tone }, ...e].slice(0, 3));

 const setMode = (path, mode) => setRoutes((rs) => rs.map((r) => (r.path === path ? { ...r, mode, canaryBad: 0 } : r)));

 // traffic generator
 useEffect(() => {
  if (!traffic || !visible) return;
  const id = setInterval(() => {
   const { routes: rs, broken: br } = st.current;
   const total = rs.reduce((a, r) => a + r.w, 0);
   let pick = Math.random() * total;
   const r = rs.find((x) => (pick -= x.w) < 0) || rs[0];
   const wrong = br && r.path === BROKEN;
   const t0 = performance.now();
   const out = [];
   if (r.mode === "serve") out.push({ id: ++seq.current, to: "go", t0, path: r.path, wrong });
   else out.push({ id: ++seq.current, to: "php", t0, path: r.path });
   if (r.mode === "shadow") out.push({ id: ++seq.current, to: "go", t0, path: r.path, ghost: true, wrong });
   setReqs((q) => [...q.filter((x) => t0 - x.t0 < DUR + 300), ...out]);

   setRoutes((all) =>
    all.map((x) => {
     if (x.path !== r.path) return x;
     const y = { ...x };
     if (x.mode === "serve") y.go++;
     else y.php++;
     if (x.mode === "shadow") wrong ? y.bad++ : y.ok++;
     if (x.mode === "serve") y.canaryBad = wrong ? y.canaryBad + 1 : 0;
     return y;
    })
   );
   if (wrong) setDiff({ path: r.path, mode: r.mode });
  }, 520);
  return () => clearInterval(id);
 }, [traffic, visible]);

 // the watchdog: three bad canaries on a serving route put it back in shadow
 useEffect(() => {
  const hit = routes.find((r) => r.mode === "serve" && r.canaryBad >= 3);
  if (!hit) return;
  setMode(hit.path, "shadow");
  note(`Watchdog moved ${hit.path} back to shadow after 3 bad canary checks. Laravel answers again.`, "warn");
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [routes]);

 // animation clock while requests are in flight
 useEffect(() => {
  if (reduced || !reqs.length) return;
  let raf = 0;
  const tick = () => {
   setNow(performance.now());
   raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
 }, [reqs.length, reduced]);

 const live = reqs.filter((x) => now - x.t0 < DUR && now >= x.t0);
 const goN = routes.reduce((a, r) => a + r.go, 0);
 const phpN = routes.reduce((a, r) => a + r.php, 0);
 const share = goN + phpN ? Math.round((goN / (goN + phpN)) * 100) : 0;

 const toggleBreak = () => {
  note(broken ? "Go is fixed. The route can be promoted again." : `Go now returns a wrong order_status on ${BROKEN}.`, broken ? "" : "bad");
  if (broken) setDiff(null);
  setBroken(!broken);
  if (!traffic) setTraffic(true);
 };

 return (
  <DemoFrame
   title="Move a route without downtime"
   caption="Off: Laravel answers. Shadow: Laravel answers and Go is compared in the background. Serve: Go answers, Laravel is the fallback."
   controls={
    <>
     <Btn primary onClick={() => setTraffic((v) => !v)} aria-pressed={traffic}>
      {traffic ? "Stop traffic" : "Send traffic"}
     </Btn>
     <Btn on={broken} onClick={toggleBreak} aria-pressed={broken}>
      {broken ? "Fix Go" : "Break Go"}
     </Btn>
    </>
   }
  >
   <div ref={ref} className="overflow-hidden rounded-lg border border-black/5 bg-white/60 dark:border-white/5 dark:bg-white/[3%]">
    <svg viewBox="0 0 640 186" className="block h-auto w-full" role="img" aria-label="Requests flowing from the apps through nginx to Go or Laravel">
     <g fill="none" className="stroke-black/[15%] dark:stroke-white/[15%]" strokeWidth="1.4">
      <path d={`M${mid(BOX.app, "r").join(" ")} L${mid(BOX.nginx, "l").join(" ")}`} />
      <path d={`M${mid(BOX.nginx, "r").join(" ")} L${mid(BOX.go, "l").join(" ")}`} />
      <path d={`M${mid(BOX.nginx, "r").join(" ")} L${mid(BOX.php, "l").join(" ")}`} />
     </g>
     {[
      ["app", "Apps", "every request"],
      ["nginx", "nginx", "per-route switch"],
      ["go", "Go API", "sample: about 6 ms"],
      ["php", "Laravel", "sample: about 140 ms"],
     ].map(([k, a, b]) => {
      const [x, y, w, h] = BOX[k];
      const alarm = k === "go" && broken;
      return (
       <g key={k}>
        <rect x={x} y={y} width={w} height={h} rx="9" className={alarm ? "fill-red-500/10 stroke-red-500/60" : k === "go" ? "fill-[#1491ff]/10 stroke-[#1491ff]/50 dark:fill-[#64acff]/10 dark:stroke-[#64acff]/50" : "fill-white stroke-black/[15%] dark:fill-[#1d1d1f] dark:stroke-white/[15%]"} />
        <text x={x + w / 2} y={y + 20} textAnchor="middle" className="fill-zinc-800 text-[13px] font-semibold dark:fill-white">
         {a}
        </text>
        <text x={x + w / 2} y={y + 35} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-white/[45%]">
         {b}
        </text>
       </g>
      );
     })}
     <text x="540" y="40" className="fill-zinc-500 text-[10px] dark:fill-white/[45%]">
      {goN + phpN ? `${share}% of requests` : ""}
     </text>
     <text x="540" y="54" className="fill-zinc-500 text-[10px] dark:fill-white/[45%]">
      {goN + phpN ? "answered by Go" : ""}
     </text>
     {live.map((q) => {
      const p = along(q, now);
      return (
       <circle
        key={q.id}
        cx={p.x}
        cy={p.y}
        r={q.ghost ? 4 : 5}
        className={q.wrong && p.k > 0.95 ? "fill-red-500" : q.ghost ? "fill-none stroke-[#1491ff] dark:stroke-[#64acff]" : q.to === "go" ? "fill-[#1491ff] dark:fill-[#64acff]" : "fill-[#f97316]"}
        strokeWidth={q.ghost ? 1.5 : 0}
        strokeDasharray={q.ghost ? "2 2" : undefined}
       />
      );
     })}
    </svg>
   </div>

   <div className="mt-3 divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white/60 dark:divide-white/5 dark:border-white/5 dark:bg-white/[3%]">
    {routes.map((r) => (
     <div key={r.path} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-2">
      <span className={`min-w-0 flex-1 basis-40 truncate font-mono text-[11px] ${r.path === BROKEN && broken ? "text-red-600 dark:text-red-400" : "text-zinc-800 dark:text-white"}`}>{r.path}</span>
      {r.locked ? (
       <span className="rounded-md bg-black/[5%] px-2 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-white/[6%] dark:text-white/[45%]">money path, starts off</span>
      ) : (
       <Seg
        size="xs"
        label={`Mode for ${r.path}`}
        value={r.mode}
        onChange={(v) => setMode(r.path, v)}
        options={[
         ["off", "off"],
         ["shadow", "shadow", "bg-[#1491ff]/[15%] text-[#1477ff] dark:bg-[#64acff]/20 dark:text-[#64acff]"],
         ["serve", "serve", "bg-[#1491ff] text-white dark:bg-[#64acff] dark:text-zinc-900"],
        ]}
       />
      )}
      <span className="w-[8.5rem] text-right text-[11px] tabular-nums text-zinc-500 dark:text-white/[45%]">
       Go {r.go} · Laravel {r.php}
       {r.mode === "shadow" || r.ok || r.bad ? (
        <span className={r.bad ? "block text-red-600 dark:text-red-400" : "block"}>
         compared {r.ok + r.bad}, {r.bad} differ
        </span>
       ) : null}
      </span>
     </div>
    ))}
   </div>

   {(diff || events.length > 0) && (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
     {diff ? (
      <div className="min-w-0 rounded-lg border border-red-500/25 bg-red-500/[5%] p-2.5">
       <p className="text-[11px] font-semibold text-red-700 dark:text-red-300">
        {diff.mode === "serve" ? "Canary check failed" : "Shadow mismatch saved"} on {diff.path}
       </p>
       <pre className="mt-1.5 overflow-x-auto whitespace-pre font-mono text-[11px] leading-5">
        <span className="text-zinc-500 dark:text-white/[45%]">{"  \"id\": 41,\n"}</span>
        <span className="text-emerald-700 dark:text-emerald-400">{"- \"order_status\": \"picked_up\",   Laravel\n"}</span>
        <span className="text-red-700 dark:text-red-400">{"+ \"order_status\": \"confirmed\",   Go\n"}</span>
        <span className="text-zinc-500 dark:text-white/[45%]">{"  \"rider\": { ... }"}</span>
       </pre>
      </div>
     ) : (
      <div />
     )}
     <ul className="space-y-1.5">
      {events.map((e) => (
       <li key={e.id} className={`rounded-lg px-2.5 py-1.5 text-xs ${e.tone === "warn" ? "bg-amber-500/10 text-amber-800 dark:text-amber-300" : e.tone === "bad" ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-black/[4%] text-zinc-600 dark:bg-white/[5%] dark:text-white/60"}`}>
        {e.text}
       </li>
      ))}
     </ul>
    </div>
   )}
  </DemoFrame>
 );
}
