import { getSpeed, getSite } from "lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "How this site is built", description: "Self-hosted Next.js and Go, passkey-only admin, first-party analytics and live speed numbers from real visitors." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

const fmt = { LCP: (v) => `${(v / 1000).toFixed(2)} s`, INP: (v) => `${Math.round(v)} ms`, CLS: (v) => v.toFixed(3), FCP: (v) => `${(v / 1000).toFixed(2)} s`, TTFB: (v) => `${Math.round(v)} ms` };
const names = { LCP: "Largest paint", INP: "Interaction", CLS: "Layout shift", FCP: "First paint", TTFB: "Server response" };
const dot = { good: "bg-[#27cb3f]", "needs-improvement": "bg-[#fdbf2d]", poor: "bg-[#fb5f57]" };

const stack = [
 ["Pages", "Next.js 14 with React Server Components. Content is fetched on the server and cached, then refreshed the moment I publish."],
 ["API", "A small Go service with SQLite in WAL mode. It serves content, the contact form, analytics and the admin."],
 ["Admin", "A private studio on its own subdomain. Passkey sign-in only, no passwords. Every change is written to an audit log."],
 ["Hosting", "My own Linux server behind Nginx, with Let's Encrypt certificates and Cloudflare DNS. No platform in between."],
 ["CV", "The CV page and the PDF come from the same data. When I edit my experience, headless Chromium prints a fresh PDF."],
 ["Analytics", "First-party and cookie-free. IP addresses are cut to the network before storage; the network owner comes from a public dataset, not a tracking company."],
 ["Writing", "Markdown stored in the database, rendered on the server, sanitised, with code highlighting and diagrams drawn as React SVG."],
 ["Ask", "Questions are matched against my own posts with a small BM25 search in Go, and Claude writes a short answer that may only use those passages and must cite them."],
 ["Terminal", "The SSH version is a Go program built on Bubble Tea. It reads the same public API, has no shell behind it, and limits every session."],
 ["Status", "The API checks the site and itself every minute. Uptime, latency and deploys are on the status page."],
 ["Source", "Private. Happy to walk through it in an interview."],
];

export default async function Colophon() {
 const [speed, site] = await Promise.all([getSpeed().catch(() => null), getSite().catch(() => null)]);
 const rum = speed?.rum || {};
 return (
  <div className="mx-auto mb-20 w-full max-w-3xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    How this site is built
    <Dot />
   </h1>
   <p className="mt-2 text-slate-600 dark:text-slate-400">I moved this site off a hosting platform onto my own server and rebuilt it the way I build Acme: Go behind, Next.js in front, nothing I cannot debug.</p>

   <h2 className="mt-10 text-lg font-semibold text-zinc-800 dark:text-white">Things to try</h2>
   <ul className="mt-4 grid gap-3 sm:grid-cols-2">
    {[
     [<kbd key="k" className="rounded border border-black/15 px-1.5 text-sm dark:border-white/20">X</kbd>, "X-ray mode: see which API call and cache drew each part of the page."],
     [<kbd key="k" className="rounded border border-black/15 px-1.5 text-sm dark:border-white/20">⌘K</kbd>, "Find anything, or type a question to ask about my work."],
     [<code key="c" className="text-sm">ssh example.com -p 2222</code>, "This whole site, in your terminal."],
     [<Link key="l" href="/architecture" className="font-medium underline underline-offset-4">Play an order</Link>, "Watch one pretend order travel through Acme's backend."],
     [<Link key="l" href="/status" className="font-medium underline underline-offset-4">Status</Link>, "Live uptime, speed and deploys for this site."],
     [<Link key="l" href="/guestbook" className="font-medium underline underline-offset-4">Guestbook</Link>, "Sign in with GitHub and leave a note."],
     [<Link key="l" href="/setup" className="font-medium underline underline-offset-4">My setup</Link>, "The desk, with hotspots on every piece of gear."],
    ].map(([k, v], i) => (
     <li key={i} className="rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617]">
      <p className="text-zinc-800 dark:text-white">{k}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{v}</p>
     </li>
    ))}
   </ul>

   <h2 className="mt-10 text-lg font-semibold text-zinc-800 dark:text-white">Speed from real visitors</h2>
   <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">75th percentile over the last 28 days, measured in visitors' browsers.</p>
   <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
    {["LCP", "INP", "CLS", "FCP", "TTFB"].map((m) => {
     const r = rum[m];
     return (
      <div key={m} className="rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617]">
       <p className="text-xs text-zinc-500 dark:text-white/40">{names[m]}</p>
       <p className="mt-1 text-xl font-semibold text-zinc-800 dark:text-white">{r?.p75 != null ? fmt[m](r.p75) : "..."}</p>
       <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-white/40">
        {r?.rating && <span className={`h-2 w-2 rounded-full ${dot[r.rating]}`} />}
        {r?.samples ? `${m}, ${r.samples} visits` : `${m}, collecting`}
       </p>
      </div>
     );
    })}
   </div>
   {speed?.psi?.mobile && (
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
     Lighthouse performance score: <span className="font-semibold text-zinc-800 dark:text-white">{speed.psi.mobile.score}</span> on mobile
     {speed.psi.desktop ? (
      <>
       , <span className="font-semibold text-zinc-800 dark:text-white">{speed.psi.desktop.score}</span> on desktop
      </>
     ) : null}
     , checked daily.
    </p>
   )}

   <h2 className="mt-12 text-lg font-semibold text-zinc-800 dark:text-white">The stack</h2>
   <dl className="mt-4 divide-y divide-black/10 dark:divide-white/10">
    {stack.map(([k, v]) => (
     <div key={k} className="grid gap-1 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
      <dt className="text-sm font-medium text-zinc-500 dark:text-white/50">{k}</dt>
      <dd className="text-slate-700 dark:text-slate-300">{v}</dd>
     </div>
    ))}
   </dl>
   <p className="mt-10 text-sm text-zinc-500 dark:text-white/40">
    Build {site?.version || "dev"} · <Link href="/architecture" className="underline underline-offset-4">How Acme is built</Link>
   </p>
  </div>
 );
}
