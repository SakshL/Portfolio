import Link from "next/link";
import { getSite } from "lib/api";
import { renderMarkdown } from "lib/markdown";
import { getT } from "lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Code I am proud of", description: "Real snippets from the Go, Swift and Kotlin code behind Acme, with why each one is written that way." };

const dot = <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;
const LANG = { go: "Go", swift: "Swift", kotlin: "Kotlin", ts: "TypeScript", js: "JavaScript", php: "PHP" };

export default async function CodePage() {
 const site = await getSite().catch(() => null);
 const { t } = await getT();
 const snippets = (site?.profile?.snippets || []).filter((x) => x?.published && x?.code);
 const rendered = await Promise.all(snippets.map((x) => renderMarkdown("```" + (x.lang || "") + "\n" + x.code.replace(/```/g, "` ` `") + "\n```")));
 return (
  <div className="page-enter mx-auto mb-20 w-full max-w-4xl">
   <h1 className="text-[40px] font-black tracking-[-0.04em] text-zinc-800 dark:text-white md:text-[52px]">{t("Code I am proud of")}{dot}</h1>
   <p className="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-400">{t("Real pieces of the code behind Acme, lightly trimmed. Each one has a note on why it is written that way and what it prevents.")}</p>
   {snippets.length === 0 && <p className="mt-10 text-slate-600 dark:text-slate-400">Coming soon. Meanwhile, the <Link className="link" href="/work">case studies</Link> go deep on the engineering.</p>}
   <div className="mt-10 space-y-10">
    {snippets.map((x, i) => (
     <article key={x.title} id={`s${i + 1}`} className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
       <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">{x.title}</h2>
       <span className="text-sm text-slate-500">
        {LANG[x.lang] || x.lang}
        {x.file ? ` · ${x.file}` : ""}
       </span>
      </div>
      <p className="mt-2 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">{x.why}</p>
      <div className="code-snippet prose mt-4 max-w-none overflow-hidden rounded-xl border text-[13.5px] dark:prose-dark dark:border-neutral-800 [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:rounded-none [&_pre]:bg-zinc-50 [&_pre]:p-4 dark:[&_pre]:bg-[#161617]" dangerouslySetInnerHTML={{ __html: rendered[i] }} />
     </article>
    ))}
   </div>
  </div>
 );
}
