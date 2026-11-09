"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

// Acme architecture, simplified. Positions are in a 1000 x 640 viewBox.
const W = 150;
const H = 46;

export const nodes = [
 // clients
 { id: "customer", x: 20, y: 40, label: "Customer app", sub: "Swift · Kotlin", group: "Clients", what: "Ordering, payments, live tracking, voice ordering and chat.", why: "Native screens replaced Flutter one by one, so the app stayed shippable the whole time." },
 { id: "restaurant", x: 20, y: 110, label: "Restaurant app", sub: "iOS · Android", group: "Clients", what: "Accept orders, mark them ready, manage the menu and see payouts.", why: "Restaurants run it on cheap Android phones, so it stays light." },
 { id: "rider", x: 20, y: 180, label: "Rider app", sub: "iOS · Android", group: "Clients", what: "Picks up jobs, navigates and streams its location every few seconds.", why: "Location updates go to the realtime service, never through the main API." },
 { id: "web", x: 20, y: 250, label: "Website", sub: "Next.js", group: "Clients", what: "acme.example.com: browse and order on the web, town pages, tracking links.", why: "Server-rendered so pages are fast on slow mobile data." },
 { id: "ops", x: 20, y: 320, label: "Ops console", sub: "Next.js", group: "Clients", what: "Orders, riders, stores, money, support and live maps for the team.", why: "One place to run the company, with role checks on every screen." },
 { id: "claude", x: 20, y: 390, label: "AI assistants", sub: "MCP connector", group: "Clients", what: "Claude can search restaurants and place orders through the Acme connector.", why: "The connector uses the same API rules as the app, nothing special." },

 // edge
 { id: "nginx", x: 250, y: 200, label: "Nginx router", sub: "per-route switch", group: "Edge", what: "Every request lands here. A route table decides: Go or the old Laravel code.", why: "This is how the migration runs with no downtime: flip one route, watch it, flip back in seconds if needed." },

 // services
 { id: "goapi", x: 470, y: 40, label: "Go API", sub: "customer · admin · vendor", group: "Services", what: "The main HTTP APIs, written in Go. Most busy routes already run here.", why: "Lower latency and far less memory per request than the PHP stack." },
 { id: "realtime", x: 470, y: 110, label: "Realtime", sub: "WebSocket · SSE", group: "Services", what: "Pushes order status, chat and rider positions to every screen.", why: "Driven by Redis pub/sub, so any service can publish an event." },
 { id: "dispatch", x: 470, y: 180, label: "Dispatch", sub: "Go", group: "Services", what: "Finds the nearest free riders and offers them the order.", why: "Reads the live rider index in Redis GEO instead of scanning the database." },
 { id: "workers", x: 470, y: 250, label: "Workers + cron", sub: "outbox · scheduler", group: "Services", what: "Notifications, payment retries, reports and timed jobs.", why: "An outbox makes side effects happen once, even after a crash." },
 { id: "laravel", x: 470, y: 320, label: "Laravel", sub: "legacy, shrinking", group: "Services", what: "The original backend. Routes leave it one at a time.", why: "Kept running until the last route is ported, so nothing breaks." },
 { id: "ai", x: 470, y: 390, label: "AI services", sub: "voice · agents", group: "Services", what: "Voice ordering, the menu importer and Laayendra, the ops agent.", why: "Each one calls the normal APIs with its own narrow permissions." },

 // data
 { id: "mariadb", x: 720, y: 40, label: "MariaDB", sub: "source of truth", group: "Data", what: "Orders, users, stores, the money ledger.", why: "Money only moves through ledger entries that are checked automatically." },
 { id: "redis", x: 720, y: 125, label: "Redis", sub: "cache · pub/sub · GEO", group: "Data", what: "Hot caches, the event bus and the live rider location index.", why: "Rider positions change every few seconds; Redis GEO answers 'who is near' instantly." },
 { id: "search", x: 720, y: 210, label: "Meilisearch", sub: "search", group: "Data", what: "Restaurant and dish search that handles typos and Nepali names.", why: "Synced from the database by a worker, so search never slows down orders." },
 { id: "r2", x: 720, y: 295, label: "Object storage", sub: "images", group: "Data", what: "Menu photos, banners and documents behind a CDN.", why: "Images stopped competing with the API for server bandwidth." },

 // external
 { id: "fonepay", x: 720, y: 390, label: "Fonepay", sub: "QR payments", group: "External", what: "Dynamic QR codes for each order; the payment result arrives over a socket.", why: "Retries are idempotent, so a payment is never counted twice." },
 { id: "monitor", x: 250, y: 390, label: "Monitoring", sub: "metrics · crashes", group: "External", what: "Prometheus, Grafana, crash tracking and product analytics.", why: "A small team needs alarms, not dashboards nobody watches." },
];

const edges = [
 ["customer", "nginx"], ["restaurant", "nginx"], ["rider", "realtime"], ["rider", "nginx"], ["web", "nginx"], ["ops", "nginx"], ["claude", "goapi"],
 ["nginx", "goapi"], ["nginx", "laravel"], ["nginx", "realtime"],
 ["goapi", "mariadb"], ["goapi", "redis"], ["goapi", "search"], ["laravel", "mariadb"],
 ["realtime", "redis"], ["dispatch", "redis"], ["dispatch", "mariadb"], ["workers", "mariadb"], ["workers", "redis"],
 ["goapi", "fonepay"], ["workers", "fonepay"], ["ai", "goapi"], ["goapi", "r2"], ["workers", "search"],
 ["goapi", "monitor"],
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

// "Play an order": one pretend order moving through the system. A simulation, no real data.
const STEPS = [
 { from: "customer", to: "nginx", title: "You tap Place order", text: "The app sends the cart, the address and how you want to pay." },
 { from: "nginx", to: "goapi", title: "The router picks Go", text: "The order route already runs on Go, so Nginx sends it there. Flip one line and the same request would go to Laravel." },
 { from: "goapi", to: "mariadb", title: "Checked and saved", text: "Go checks prices, opening hours and the delivery zone again on the server, then writes the order and its ledger entries in one transaction." },
 { from: "goapi", to: "fonepay", title: "A QR for this order", text: "For QR payment it asks Fonepay for a dynamic code. The result arrives later, and retries can never count a payment twice." },
 { from: "goapi", to: "redis", title: "An event goes out", text: "An order.created event lands on the Redis bus. The API does not wait for anyone to read it." },
 { from: "redis", to: "realtime", title: "Realtime hears it", text: "The realtime service listens to the bus and picks the event up." },
 { from: "realtime", to: "restaurant", title: "The restaurant phone rings", text: "The order is pushed over a live socket to the restaurant app. They accept and start cooking." },
 { from: "dispatch", to: "redis", title: "Who is close?", text: "Dispatch asks the Redis GEO index for free riders near the restaurant, instead of scanning the database." },
 { from: "realtime", to: "rider", title: "A rider gets the offer", text: "The nearest free rider sees the job and accepts it." },
 { from: "rider", to: "realtime", title: "Live location", text: "The rider app streams its position every few seconds, straight to the realtime service." },
 { from: "realtime", to: "customer", title: "You watch it move", text: "Your map updates from the socket. No refresh, no polling." },
 { from: "workers", to: "customer", title: "Picked up, nearby, delivered", text: "Workers send the push notifications through an outbox, so each one goes out once, even after a crash." },
 { from: "workers", to: "mariadb", title: "Money settles", text: "Delivered. The ledger records what the restaurant and the rider earn, and checks that every entry balances." },
];

// "Send a test order": the same path with real timings from Acme's servers (GET /v1/trace). No order is placed.
const fmt = (v, unit = "ms") => (v == null ? "n/a" : unit === "us" ? `${v < 10 ? v.toFixed(1) : Math.round(v)} µs` : `${v < 10 ? v.toFixed(1) : Math.round(v)} ms`);
const animDur = (ms) => Math.min(2.4, 0.45 + Math.sqrt(Math.max(0, ms || 0)) / 12);
const HOPS = [
 { from: "customer", to: "nginx", key: "edge", label: "Your request reaches the server", note: "Round trip from your browser to the server in Nepal, measured just now." },
 { from: "nginx", to: "goapi", key: "go_ms", label: "Go answers", note: "Median of real requests to the Go API in the last 30 minutes.", race: { to: "laravel", key: "laravel_ms" } },
 { from: "goapi", to: "redis", key: "redis_us", unit: "us", label: "Redis cache and events", note: "Average time Redis takes per command, from its own counters." },
 { from: "goapi", to: "mariadb", key: "db_ms", label: "MariaDB", note: "A live status query the monitor runs against the real database." },
 { from: "goapi", to: "search", key: "search_ms", label: "Search", note: "Meilisearch health check, timed just now." },
 { from: "goapi", to: "nginx", key: null, label: "Back through the router" },
 { from: "nginx", to: "customer", key: null, label: "Back on your screen" },
];

function edgePath(a, b) {
 const [x1, y1, x2, y2] = anchor(a, b);
 const mx = (x1 + x2) / 2;
 return Math.abs(y1 - y2) < 1 || Math.abs(x1 - x2) < 1 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
}

function anchor(a, b) {
 // connect right edge of a to left edge of b (or the reverse), else vertical
 const ax = a.x + W / 2;
 const bx = b.x + W / 2;
 if (Math.abs(a.x - b.x) < 10) {
  const down = b.y > a.y;
  return [ax, down ? a.y + H : a.y, bx, down ? b.y : b.y + H];
 }
 const right = b.x > a.x;
 return [right ? a.x + W : a.x, a.y + H / 2, right ? b.x : b.x + W, b.y + H / 2];
}

function Mover({ a, b, still, dur = 1.1, ghost = false }) {
 const ref = useRef(null);
 useEffect(() => {
  ref.current?.beginElement?.();
 }, [a, b]);
 const [, , x2, y2] = anchor(a, b);
 const cls = "fill-[#1491ff] stroke-white dark:fill-[#64acff] dark:stroke-[#161617]";
 if (still) return <circle cx={x2} cy={y2} r={6} strokeWidth={2} className={cls} />;
 return (
  <circle r={ghost ? 5 : 6} strokeWidth={2} className={ghost ? "fill-[#fb923c] stroke-white dark:stroke-[#161617]" : cls} style={ghost ? undefined : { filter: "drop-shadow(0 0 6px rgb(20 145 255 / 0.8))" }}>
   <animateMotion ref={ref} begin="indefinite" dur={`${dur}s`} fill="freeze" path={edgePath(a, b)} />
  </circle>
 );
}

export default function Architecture({ compact = false }) {
 const [hover, setHover] = useState("nginx");
 const [step, setStep] = useState(-1); // -1 = not playing
 const [playing, setPlaying] = useState(false);
 const [still, setStill] = useState(false);
 const cur = step >= 0 ? STEPS[step] : null;
 const active = cur ? cur.to : hover;
 const setActive = (id) => !cur && setHover(id);

 useEffect(() => {
  setStill(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false);
 }, []);
 useEffect(() => {
  if (!playing) return;
  const t = setTimeout(() => {
   if (step < STEPS.length - 1) setStep((v) => v + 1);
   else setPlaying(false);
  }, 3200);
  return () => clearTimeout(t);
 }, [playing, step]);
 const play = () => {
  clearTimeout(timer.current);
  setLive(null);
  setStep(0);
  setPlaying(true);
 };
 const stopPlay = () => {
  setPlaying(false);
  setStep(-1);
 };
 const [live, setLive] = useState(null); // {i, data, done, err}
 const timer = useRef(null);
 useEffect(() => () => clearTimeout(timer.current), []);
 const runLive = async () => {
  clearTimeout(timer.current);
  setPlaying(false);
  setStep(-1);
  setLive({ i: 0, data: null, done: false });
  try {
   await fetch("/v1/health", { cache: "no-store" });
   const t0 = performance.now();
   await fetch("/v1/health", { cache: "no-store" });
   const edge = Math.round((performance.now() - t0) * 10) / 10;
   const r = await fetch("/v1/trace", { cache: "no-store" });
   if (!r.ok) throw new Error("trace");
   const data = { ...(await r.json()), edge };
   const go = (i) => {
    if (i >= HOPS.length) {
     setLive((v) => v && { ...v, i: HOPS.length - 1, data, done: true });
     return;
    }
    setLive((v) => v && { ...v, i, data });
    const h = HOPS[i];
    const ms = h.key === "redis_us" ? 0.01 : h.key ? data[h.key] : 2;
    timer.current = setTimeout(() => go(i + 1), (still ? 0.4 : animDur(ms) + 0.35) * 1000);
   };
   go(0);
  } catch {
   setLive({ i: 0, data: null, done: true, err: true });
  }
 };
 const hop = live && live.data && !live.done ? HOPS[live.i] : null;
 const val = (key) => (live?.data && key ? live.data[key] : null);
 const walked = new Set();
 if (live?.data)
  HOPS.slice(0, live.i + 1).forEach((h) => {
   walked.add(h.from + ">" + h.to);
   if (h.race) walked.add(h.from + ">" + h.race.to);
  });
 const reached = {};
 if (live?.data)
  HOPS.slice(0, live.i + 1).forEach((h) => {
   if (h.key) reached[h.to] = fmt(val(h.key), h.unit);
   if (h.race) reached[h.race.to] = fmt(val(h.race.key));
  });

 const linked = useMemo(() => {
  const s = new Set([active]);
  edges.forEach(([a, b]) => {
   if (a === active) s.add(b);
   if (b === active) s.add(a);
  });
  return s;
 }, [active]);
 const node = byId[active];

 return (
  <div className={clsx("not-prose", compact ? "" : "grid gap-6 lg:grid-cols-[1fr_300px]")}>
   <div className="overflow-x-auto rounded-xl border bg-zinc-200/[25%] p-3 dark:border-neutral-800 dark:bg-[#161617]">
    {!compact && (
     <div className="mb-2 flex flex-wrap items-center gap-2">
      {step < 0 ? (
       <button type="button" onClick={play} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white duration-200 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/85">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
         <path d="M2 1.5v9l8-4.5z" fill="currentColor" />
        </svg>
        Play an order
       </button>
      ) : null}
      {step < 0 && (
       <button type="button" onClick={runLive} disabled={!!live && !live.done} className="inline-flex items-center gap-2 rounded-lg border border-[#1491ff]/40 bg-[#1491ff]/10 px-3 py-1.5 text-sm font-semibold text-[#0b6bcb] duration-200 hover:bg-[#1491ff]/20 disabled:opacity-60 dark:text-[#64acff]">
        <span className="relative flex h-2 w-2">
         <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1491ff] opacity-60 motion-reduce:hidden" />
         <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1491ff]" />
        </span>
        {live && !live.done ? "Sending..." : live ? "Send another" : "Send a test order"}
       </button>
      )}
      {step >= 0 && (
       <>
        <button type="button" onClick={() => setPlaying((v) => !v)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-white/15 dark:text-white">
         {playing ? "Pause" : step === STEPS.length - 1 ? "Done" : "Resume"}
        </button>
        <button type="button" disabled={step === 0} onClick={() => (setPlaying(false), setStep((v) => Math.max(0, v - 1)))} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-800 disabled:opacity-40 dark:border-white/15 dark:text-white" aria-label="Previous step">
         Back
        </button>
        <button type="button" disabled={step === STEPS.length - 1} onClick={() => (setPlaying(false), setStep((v) => Math.min(STEPS.length - 1, v + 1)))} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-800 disabled:opacity-40 dark:border-white/15 dark:text-white" aria-label="Next step">
         Next
        </button>
        <button type="button" onClick={stopPlay} className="rounded-lg px-2 py-1.5 text-sm text-zinc-500 dark:text-white/50">
         Stop
        </button>
        <span className="ml-auto text-xs text-zinc-500 dark:text-white/40">
         Step {step + 1} of {STEPS.length}
        </span>
       </>
      )}
      {live && step < 0 && (
       <button type="button" onClick={() => (clearTimeout(timer.current), setLive(null))} className="rounded-lg px-2 py-1.5 text-sm text-zinc-500 dark:text-white/50">
        Clear
       </button>
      )}
     </div>
    )}
    <svg viewBox="0 0 900 450" className="min-w-[720px] text-zinc-800 dark:text-white" role="img" aria-label="Acme architecture diagram">
     <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
       <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
      </marker>
     </defs>
     {["Clients", "Edge", "Services", "Data"].map((g, i) => (
      <text key={g} x={[20, 250, 470, 720][i]} y={22} className="fill-current text-[11px] font-semibold opacity-40">
       {g}
      </text>
     ))}
     {edges.map(([a, b]) => {
      const [x1, y1, x2, y2] = anchor(byId[a], byId[b]);
      const on = live?.data ? walked.has(a + ">" + b) || walked.has(b + ">" + a) : !cur && (a === active || b === active);
      const mx = (x1 + x2) / 2;
      return (
       <path
        key={a + b}
        d={Math.abs(y1 - y2) < 1 || Math.abs(x1 - x2) < 1 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={on ? 1.6 : 1}
        className={clsx("duration-200", on ? "opacity-80" : "opacity-[0.12]")}
        markerEnd="url(#arr)"
       />
      );
     })}
     {cur && (
      <g key={"step" + step} className="text-[#1491ff] dark:text-[#64acff]">
       <path id="order-path" d={edgePath(byId[cur.from], byId[cur.to])} fill="none" stroke="currentColor" strokeWidth={2.2} strokeDasharray="5 4" markerEnd="url(#arr)" />
       <Mover a={byId[cur.from]} b={byId[cur.to]} still={still} />
      </g>
     )}
     {hop && (
      <g key={"hop" + live.i} className="text-[#1491ff] dark:text-[#64acff]">
       <path d={edgePath(byId[hop.from], byId[hop.to])} fill="none" stroke="currentColor" strokeWidth={2.2} strokeDasharray="5 4" />
       <Mover a={byId[hop.from]} b={byId[hop.to]} still={still} dur={animDur(hop.key === "redis_us" ? 0.01 : val(hop.key) || 2)} />
       {hop.race && (
        <g className="text-[#fb923c]">
         <path d={edgePath(byId[hop.from], byId[hop.race.to])} fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="3 5" />
         <Mover a={byId[hop.from]} b={byId[hop.race.to]} still={still} dur={animDur(val(hop.race.key) || 50)} ghost />
        </g>
       )}
      </g>
     )}
     {nodes.map((n) => {
      const on = live?.data ? n.id in reached || HOPS.some((h, i) => i <= live.i && (h.from === n.id || h.to === n.id)) : cur ? n.id === cur.from || n.id === cur.to : linked.has(n.id);
      const sel = n.id === active;
      return (
       <g
        key={n.id}
        tabIndex={0}
        role="button"
        aria-label={`${n.label}: ${n.what}`}
        onMouseEnter={() => setActive(n.id)}
        onFocus={() => setActive(n.id)}
        onClick={() => setActive(n.id)}
        style={{ outline: "none" }}
        className={clsx("cursor-pointer duration-200", on ? "opacity-100" : "opacity-40")}
       >
        <rect x={n.x} y={n.y} width={W} height={H} rx={9} className={clsx("duration-200", sel ? "fill-zinc-900 dark:fill-white" : "fill-white dark:fill-[#1d1d1f]")} stroke="currentColor" strokeOpacity={sel ? 1 : 0.18} />
        <text x={n.x + 12} y={n.y + 20} className={clsx("text-[12.5px] font-semibold", sel ? "fill-white dark:fill-zinc-900" : "fill-current")}>
         {n.label}
        </text>
        {reached[n.id] && (
         <g className="pointer-events-none">
          <rect x={n.x + W - 62} y={n.y - 11} width={60} height={20} rx={10} className={n.id === "laravel" ? "fill-[#fb923c]" : "fill-[#1491ff]"} />
          <text x={n.x + W - 32} y={n.y + 3} textAnchor="middle" className="fill-white text-[11px] font-semibold">
           {reached[n.id]}
          </text>
         </g>
        )}
        <text x={n.x + 12} y={n.y + 36} className={clsx("text-[10.5px]", sel ? "fill-white/70 dark:fill-zinc-900/70" : "fill-current opacity-55")}>
         {n.sub}
        </text>
       </g>
      );
     })}
    </svg>
   </div>
   {!compact && (
    <aside className="rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]" aria-live="polite">
     {live ? (
      <>
       <p className="text-xs font-medium text-zinc-500 dark:text-white/40">Test order · real timings</p>
       <h3 className="mt-1 text-xl font-semibold text-zinc-800 dark:text-white">{live.err ? "Could not reach the server" : live.done ? "Back on your screen" : hop ? hop.label : "Sending..."}</h3>
       {live.err ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">The timing service did not answer. Try again in a moment.</p>
       ) : (
        <ul className="mt-4 space-y-2.5 text-sm">
         {HOPS.filter((h) => h.key).map((h) => {
          const idx = HOPS.indexOf(h);
          const shown = live.data && idx <= live.i;
          return (
           <li key={h.key} className={clsx("duration-300", shown ? "opacity-100" : "opacity-30")}>
            <div className="flex items-baseline justify-between gap-3">
             <span className="font-medium text-zinc-800 dark:text-white">{h.label}</span>
             <span className="shrink-0 font-semibold tabular-nums text-[#0b6bcb] dark:text-[#64acff]">{shown ? fmt(val(h.key), h.unit) : "..."}</span>
            </div>
            {shown && <p className="mt-0.5 text-xs text-zinc-500 dark:text-white/40">{h.note}</p>}
            {shown && h.race && val(h.race.key) != null && (
             <p className="mt-1.5 rounded-md bg-[#fb923c]/10 px-2 py-1 text-xs text-[#c2410c] dark:text-[#fdba74]">
              The same kind of request on the old Laravel code: {fmt(val(h.race.key))}. That gap is why routes are moving to Go.
             </p>
            )}
           </li>
          );
         })}
        </ul>
       )}
       <p className="mt-6 text-xs text-zinc-500 dark:text-white/40">No order is placed and no data is read. The numbers come from the monitoring that watches Acme in production.</p>
      </>
     ) : cur ? (
      <>
       <p className="text-xs font-medium text-zinc-500 dark:text-white/40">
        Step {step + 1} of {STEPS.length} · {byId[cur.from].label} to {byId[cur.to].label}
       </p>
       <h3 className="mt-1 text-xl font-semibold text-zinc-800 dark:text-white">{cur.title}</h3>
       <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{cur.text}</p>
       <div className="mt-5 flex gap-1" aria-hidden="true">
        {STEPS.map((_, i) => (
         <span key={i} className={clsx("h-1 flex-1 rounded-full duration-300", i <= step ? "bg-[#1491ff] dark:bg-[#64acff]" : "bg-black/10 dark:bg-white/10")} />
        ))}
       </div>
       <p className="mt-6 text-xs text-zinc-500 dark:text-white/40">A pretend order. The path is real, the data is not.</p>
      </>
     ) : (
      <>
     <p className="text-xs font-medium text-zinc-500 dark:text-white/40">{node.group}</p>
     <h3 className="mt-1 text-xl font-semibold text-zinc-800 dark:text-white">{node.label}</h3>
     <p className="text-sm text-zinc-500 dark:text-white/50">{node.sub}</p>
     <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-white">What it does</p>
     <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{node.what}</p>
     <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-white">Why it is built this way</p>
     <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{node.why}</p>
     <p className="mt-6 text-xs text-zinc-500 dark:text-white/40">Hover or tap any box. Lines show what it talks to. Or press Play an order, or send a test order to see real timings.</p>
      </>
     )}
    </aside>
   )}
  </div>
 );
}
