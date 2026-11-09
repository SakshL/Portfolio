import { getStatus, xray } from "lib/api";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status", description: "Live uptime, speed and deploys for this website." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;
const card = "rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617]";
const fmtPct = (v) => (v === null || v === undefined ? "No data yet" : `${v.toFixed(v === 100 ? 0 : 2)}%`);
const ms = (v) => (v < 1 ? "under 1 ms" : `${v} ms`);
const compName = { site: "Website", api: "API", studio: "Studio", ssh: "SSH app" };
const when = (iso) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

function Bars({ days }) {
 return (
  <div className="mt-3 flex h-8 gap-[2px]" role="img" aria-label="Uptime for each of the last 90 days">
   {days.map((d) => {
    const v = d.up_pct;
    const color = v === null ? "bg-black/[7%] dark:bg-white/[7%]" : v >= 99.9 ? "bg-emerald-500/80" : v >= 98 ? "bg-amber-400" : "bg-red-500";
    return <span key={d.d} title={`${d.d}: ${v === null ? "no data" : v + "%"}`} className={`flex-1 rounded-[2px] ${color}`} />;
   })}
  </div>
 );
}

function Target({ name, t }) {
 const ok = t.uptime_24h === null || t.uptime_24h >= 99;
 return (
  <section className={card}>
   <div className="flex flex-wrap items-baseline justify-between gap-2">
    <h2 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-white">
     <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-400"}`} />
     {name}
    </h2>
    <p className="text-sm text-zinc-500 dark:text-white/50">
     {fmtPct(t.uptime_30d)} last 30 days{t.p50_ms_24h !== null && ` · ${ms(t.p50_ms_24h)} typical, ${ms(t.p95_ms_24h)} slowest 5% (24h)`}
    </p>
   </div>
   <Bars days={t.days} />
   <div className="mt-1.5 flex justify-between text-[11px] text-zinc-500 dark:text-white/35">
    <span>90 days ago</span>
    <span>
     24h {fmtPct(t.uptime_24h)} · 90d {fmtPct(t.uptime_90d)}
    </span>
    <span>Today</span>
   </div>
  </section>
 );
}

const vitalName = { LCP: "Largest paint", INP: "Response to input", CLS: "Layout shift", FCP: "First paint", TTFB: "Server response" };
const rateCls = { good: "text-emerald-600 dark:text-emerald-400", "needs-improvement": "text-amber-600 dark:text-amber-300", poor: "text-red-600 dark:text-red-400" };

export default async function StatusPage() {
 const s = await getStatus().catch(() => null);
 if (!s) {
  return (
   <div className="mx-auto mb-20 w-full max-w-3xl">
    <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">Status<Dot /></h1>
    <p className="mt-2 text-slate-600 dark:text-slate-400">The status service is not answering right now. Ironic, I know.</p>
   </div>
  );
 }
 const rum = s.rum || {};
 return (
  <div className="mx-auto mb-20 w-full max-w-3xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Status
    <Dot />
   </h1>
   <p className="mt-2 text-slate-600 dark:text-slate-400">This website, measured live. The Go API checks the site and itself every minute, and real visitors report how fast pages feel.</p>

   <div className="mt-8 space-y-3" data-xray={xray(s, "uptime probes every 60 s · server component")}>
    <Target name="Website" t={s.targets.site} />
    <Target name="API" t={s.targets.api} />
   </div>

   <h2 className="mt-10 text-sm font-medium text-zinc-500 dark:text-white/40">Real visitors, last 28 days (75th percentile)</h2>
   <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5" data-xray="POST /v1/vitals from real browsers · web-vitals">
    {["LCP", "INP", "CLS", "FCP", "TTFB"].map((k) => {
     const v = rum[k] || {};
     const val = v.p75 === null || v.p75 === undefined ? "-" : k === "CLS" ? Number(v.p75).toFixed(2) : `${Math.round(v.p75)} ms`;
     return (
      <div key={k} className={card}>
       <p className="text-xs text-zinc-500 dark:text-white/40">{vitalName[k]}</p>
       <p className={`mt-1 text-lg font-semibold ${rateCls[v.rating] || "text-zinc-800 dark:text-white"}`}>{val}</p>
       <p className="text-[11px] text-zinc-500 dark:text-white/35">{v.samples || 0} samples</p>
      </div>
     );
    })}
   </div>

   <h2 className="mt-10 text-sm font-medium text-zinc-500 dark:text-white/40">Recent deploys</h2>
   <ol className="mt-3 border-l border-black/10 dark:border-white/10" data-xray="deploys table · written by the deploy scripts">
    {(s.deploys || []).length === 0 && <li className="pl-5 text-sm text-zinc-500">Nothing yet.</li>}
    {(s.deploys || []).map((d, i) => (
     <li key={i} className="relative pb-4 pl-5 last:pb-0">
      <span className="absolute -left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border-2 border-zinc-400 bg-white dark:border-neutral-600 dark:bg-[#121212]" />
      <p className="text-sm text-zinc-800 dark:text-white">
       <span className="font-medium">{compName[d.component] || d.component}</span>
       {d.sha && <code className="ml-2 rounded bg-black/[6%] px-1 py-[1px] text-xs dark:bg-white/10">{d.sha}</code>}
       {d.note && <span className="ml-2 text-zinc-600 dark:text-white/60">{d.note}</span>}
      </p>
      <p className="text-xs text-zinc-500 dark:text-white/40">{when(d.at)}</p>
     </li>
    ))}
   </ol>

   <p className="mt-10 text-xs text-zinc-500 dark:text-white/35">
    API {s.api?.version} on {s.api?.go}, up since {when(s.api?.started_at)}. Checked {when(s.now)}. Self-hosted on one VPS in the cloud, behind Nginx.
   </p>
  </div>
 );
}
