import Link from "next/link";
import { notFound } from "next/navigation";
import { getFor, getSite } from "lib/api";
import { TimeOverlap } from "components/features/TimeOverlap";
import { getT, labels, TIME_KEYS } from "lib/lang";

// A private page written for one company: Studio → Radar → Job match. Never indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
 const f = await getFor(params.token).catch(() => null);
 return { title: f ? `For ${f.company}` : "Not found", robots: { index: false, follow: false } };
}

const card = "rounded-2xl border bg-zinc-200/[25%] dark:border-neutral-800 dark:bg-[#161617]";

export default async function ForCompany({ params }) {
 const f = await getFor(params.token).catch(() => null);
 if (!f?.match) notFound();
 const site = await getSite({ ref: f.token }).catch(() => null);
 const p = site?.profile || {};
 const m = f.match;
 const { t } = await getT();
 const letter = (m.cover_letter || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
 return (
  <div className="page-enter mx-auto mb-20 w-full max-w-4xl">
   <header className={`${card} p-8 md:p-10`}>
    <p className="text-sm font-medium text-zinc-500 dark:text-white/50">
     For {f.company}
     {f.role ? ` · ${f.role}` : ""}
    </p>
    <h1 className="mt-2 text-[40px] font-black leading-none tracking-[-0.04em] text-zinc-800 dark:text-white md:text-[56px]">Your Name</h1>
    <p className="mt-3 text-lg font-semibold text-zinc-800/80 dark:text-white/80">{m.headline}</p>
    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">{m.intro}</p>
    <div className="mt-7 flex flex-wrap gap-3">
     <Link data-magnet href="/cv.pdf" target="_blank" className="dark:hover:bg-white/85 inline-flex items-center rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white duration-200 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">
      Download CV
     </Link>
     <Link data-magnet href="/book" className="border-black/15 inline-flex items-center rounded-xl border px-5 py-3 font-semibold text-zinc-800 duration-200 hover:bg-black/5 dark:border-neutral-700 dark:text-white dark:hover:bg-white/[6%]">
      Book a call
     </Link>
     <Link href="/" className="link arrow inline-flex items-center px-1 py-3 font-semibold text-zinc-800 dark:text-white">
      See the whole site
     </Link>
    </div>
   </header>

   {m.why_me?.length > 0 && (
    <section className="mt-12">
     <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">What you asked for, and where I have done it</h2>
     <div className="grid gap-3">
      {m.why_me.map((x) => (
       <div key={x.need} className={`${card} spot grid gap-2 p-5 md:grid-cols-[220px_1fr] md:gap-6`}>
        <p className="font-semibold text-zinc-800 dark:text-white">{x.need}</p>
        <div>
         <p className="leading-relaxed text-slate-600 dark:text-slate-400">{x.proof}</p>
         {x.href && (
          <Link data-morph href={x.href} className="mt-2 inline-block text-sm font-semibold text-zinc-800 underline decoration-black/20 underline-offset-4 hover:decoration-black/50 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/60">
           Read how
          </Link>
         )}
        </div>
       </div>
      ))}
     </div>
    </section>
   )}

   <section className="mt-12 grid gap-6 md:grid-cols-[1.5fr_1fr]">
    <div className={`${card} p-6 md:p-8`}>
     <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-white">Cover letter</h2>
     <div className="space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
      {letter.map((para, i) => (
       <p key={i} className="whitespace-pre-line">
        {para}
       </p>
      ))}
     </div>
    </div>
    <div className="flex flex-col gap-6">
     <TimeOverlap start={p.work_hours?.start} end={p.work_hours?.end} replyTime={p.reply_time} labels={labels(t, TIME_KEYS)} />
     <div className={`${card} p-5`}>
      <p className="font-semibold text-zinc-800 dark:text-white">More proof</p>
      <ul className="mt-2 space-y-1.5 text-sm">
       <li><Link className="link" href="/working-with-me">Working with me</Link></li>
       <li><Link className="link" href="/code">Code I am proud of</Link></li>
       <li><Link className="link" href="/work">Case studies</Link></li>
       <li><Link className="link" href="/resume">Full CV</Link></li>
      </ul>
     </div>
    </div>
   </section>
  </div>
 );
}
