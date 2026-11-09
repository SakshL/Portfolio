import Architecture from "components/diagrams/Architecture";
import { getPosts, formatDate } from "lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case studies", description: "Deep write-ups on the engineering behind Acme: the Go migration, live tracking, the money ledger and the Claude connector." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default async function Work() {
 const { items } = await getPosts("case_study");
 return (
  <div className="mx-auto mb-20 w-full max-w-5xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Case studies
    <Dot />
   </h1>
   <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">The longer stories behind Acme: the problem, what I built, the trade-offs and what I would change.</p>
   <div className="mt-8 grid gap-4 md:grid-cols-2">
    {items.map((p) => (
     <Link data-morph key={p.slug} href={`/work/${p.slug}`} className="group flex flex-col rounded-xl border bg-zinc-200/[25%] p-6 duration-200 hover:border-black/25 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
      <span className="text-xs text-zinc-500 dark:text-white/40">
       {formatDate(p.publish_at)} · {p.reading_minutes} min read
      </span>
      <span data-morph-title className="mt-2 text-xl font-semibold tracking-[-0.02em] text-zinc-800 dark:text-white">{p.title}</span>
      <span data-morph-summary className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{p.summary}</span>
      <span className="mt-4 text-sm font-medium text-zinc-800 dark:text-white">Read the case study →</span>
     </Link>
    ))}
   </div>
   <h2 className="mt-16 text-[1.6rem] font-semibold tracking-[-0.02em] text-zinc-800 dark:text-white">
    How Acme fits together
    <Dot />
   </h2>
   <p className="mb-6 mt-2 text-slate-600 dark:text-slate-400">
    Hover any part of the system. <Link href="/architecture" className="font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">Open the full map</Link>
   </p>
   <Architecture />
  </div>
 );
}
