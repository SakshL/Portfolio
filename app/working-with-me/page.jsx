import Link from "next/link";
import { getPosts, getSite, formatDate } from "lib/api";
import { renderMarkdown } from "lib/markdown";
import { TimeOverlap } from "components/features/TimeOverlap";
import { References } from "components/elements/References";
import { getT, labels, TIME_KEYS } from "lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Working with me", description: "How Your Name works day to day: hours, communication, code review, releases and incidents." };

const dot = <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default async function WorkingWithMe() {
 const [site, incidents] = await Promise.all([getSite().catch(() => null), getPosts("post", { tag: "incident", limit: 6 }).catch(() => ({ items: [] }))]);
 const p = site?.profile || {};
 const { t, dict } = await getT();
 const tp = dict?.profile || {};
 const html = await renderMarkdown(tp.working_md || p.working_md || "");
 const strengths = tp.strengths?.length ? tp.strengths : p.strengths || [];
 return (
  <div className="page-enter mx-auto mb-20 w-full max-w-4xl">
   <h1 className="text-[40px] font-black tracking-[-0.04em] text-zinc-800 dark:text-white md:text-[52px]">{t("Working with me")}{dot}</h1>
   <p className="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-400">{t("A short manual for teammates and hiring managers: when I am around, how I talk, how code ships and what happens when something breaks.")}</p>

   <div className="mt-10 grid gap-6 md:grid-cols-[1.6fr_1fr]">
    <div className="prose max-w-none dark:prose-dark prose-headings:tracking-[-0.02em] prose-strong:text-zinc-900 dark:prose-strong:text-white [&_h2_a]:no-underline" dangerouslySetInnerHTML={{ __html: html }} />
    <aside className="flex flex-col gap-4 md:sticky md:top-24 md:self-start">
     <TimeOverlap start={p.work_hours?.start} end={p.work_hours?.end} replyTime={(tp?.reply_time) || p.reply_time} labels={labels(t, TIME_KEYS)} />
     <div className="rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]">
      <p className="font-semibold text-zinc-800 dark:text-white">{t("Proof")}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
       <li><Link className="link" href="/code">{t("Code I am proud of")}</Link></li>
       <li><Link className="link" href="/work">{t("Case studies")}</Link></li>
       <li><Link className="link" href="/status">{t("This site's live status")}</Link></li>
       <li><Link className="link" href="/book">{t("Book a call")}</Link></li>
      </ul>
     </div>
    </aside>
   </div>

   {strengths.length > 0 && (
    <section className="mt-14">
     <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">{t("In short")}{dot}</h2>
     <div className="grid gap-4 md:grid-cols-3">
      {strengths.map((x) => (
       <div key={x.title} className="spot rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]">
        <h3 className="font-semibold text-zinc-800 dark:text-white">{x.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{x.body}</p>
       </div>
      ))}
     </div>
    </section>
   )}

   {incidents.items?.length > 0 && (
    <section className="mt-14">
     <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">{t("When things broke")}{dot}</h2>
     <p className="mb-5 text-slate-600 dark:text-slate-400">{t("Honest write-ups: what happened, how I found it, the fix and what changed.")}</p>
     <div className="grid gap-3">
      {incidents.items.map((x) => (
       <Link data-morph key={x.slug} href={`/blog/${x.slug}`} className="group rounded-xl border bg-zinc-200/[25%] p-4 duration-200 hover:border-black/25 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
        <span data-morph-title className="block font-semibold text-zinc-800 dark:text-white">{x.title}</span>
        <span data-morph-summary className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{x.summary}</span>
        <span className="mt-1 block text-xs text-slate-500">{formatDate(x.publish_at)}</span>
       </Link>
      ))}
     </div>
    </section>
   )}

   {(p.references || []).length > 0 && (
    <section className="mt-14">
     <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">{t("What people say")}{dot}</h2>
     <References items={p.references} />
    </section>
   )}
  </div>
 );
}
