import { getSite, monthYear } from "lib/api";
import { renderMarkdown } from "lib/markdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
 title: "CV",
 description: "Your Name: founder of Acme and Nimbus, full-stack developer based in Your City, Nepal.",
};

function toTimeline(e) {
 const when = e.end && e.end === e.start ? monthYear(e.start) : `${monthYear(e.start)} – ${e.end ? monthYear(e.end) : "now"}`;
 return { when, title: e.title, org: e.org, href: e.org_url || undefined, where: e.place || undefined, points: e.points?.length > 1 ? e.points : undefined, text: e.points?.length === 1 ? e.points[0] : undefined };
}

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

const card = "rounded-2xl border bg-zinc-200/[25%] backdrop-blur-[9px] dark:border-neutral-800 dark:bg-[#161617]";

function Heading({ children }) {
 return (
  <h2 className="mb-6 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
   {children}
   <Dot />
  </h2>
 );
}

function Timeline({ items }) {
 return (
  <ol className="relative ml-1 border-l border-black/10 dark:border-neutral-800">
   {items.map((item, i) => (
    <li key={item.title + item.org} className="relative pb-10 pl-7 last:pb-0">
     <span className={`absolute -left-[6px] top-[7px] h-[11px] w-[11px] rounded-full border-2 ${i === 0 && item.when.includes("now") ? "border-[#27cb3f] bg-[#27cb3f]" : "border-zinc-400 bg-white dark:border-neutral-600 dark:bg-[#121212]"}`} />
     <p className="text-sm font-medium text-zinc-500 dark:text-white/50">{item.when}</p>
     <h3 className="mt-1 text-lg font-semibold text-zinc-800 dark:text-white">
      {item.title}
      <span className="font-normal text-zinc-500 dark:text-white/60">
       {" · "}
       {item.href ? (
        <Link href={item.href} target="_blank" className="underline decoration-black/20 underline-offset-4 hover:decoration-current dark:decoration-white/25">
         {item.org}
        </Link>
       ) : (
        item.org
       )}
      </span>
     </h3>
     {item.where && <p className="text-sm text-zinc-500 dark:text-white/50">{item.where}</p>}
     {item.text && <p className="mt-2 text-slate-600 dark:text-slate-400">{item.text}</p>}
     {item.points && (
      <ul className="mt-3 space-y-1.5">
       {item.points.map((point) => (
        <li key={point} className="flex gap-3 text-slate-600 dark:text-slate-400">
         <span className="mt-[9px] h-1 w-1 flex-none rounded-full bg-zinc-400 dark:bg-white/40" />
         {point}
        </li>
       ))}
      </ul>
     )}
    </li>
   ))}
  </ol>
 );
}

export default async function Resume({ searchParams }) {
 const site = await getSite({ focus: searchParams?.focus, ref: searchParams?.ref });
 const profile = site?.profile || {};
 const experience = (site?.experience || []).filter((e) => e.kind === "work").map(toTimeline);
 const leadership = (site?.experience || []).filter((e) => e.kind === "leadership").map(toTimeline);
 const skills = (profile.skills || []).map((g) => ({ label: g.label, items: g.items || [] }));
 const certifications = (profile.certifications || []).map((c) => ({ name: c.name, org: [c.org, c.year].filter(Boolean).join(", ") }));
 const edu = (profile.education || [])[0];
 const aboutHtml = await renderMarkdown(profile.about_md || "");
 return (
  <div className="mx-auto mb-20 w-full max-w-5xl">
   {/* Header */}
   <header className={`${card} relative overflow-hidden p-8 md:p-10`}>
    <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:30px_30px]" />
    <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
     <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-white/50">CV</p>
      <h1 className="mt-1 text-[44px] font-black leading-none tracking-[-0.04em] text-zinc-800 dark:text-white md:text-[60px]">Your Name</h1>
      <p className="mt-3 text-lg font-semibold text-zinc-800/80 dark:text-white/80">Founder &amp; full-stack developer</p>
      <p className="mt-1 text-slate-600 dark:text-slate-400">Your City, Nepal · coding since 2018</p>
     </div>
     <div className="flex flex-wrap gap-3">
      <Link href="/cv.pdf" target="_blank" className="dark:hover:bg-white/85 inline-flex items-center rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white duration-200 hover:bg-zinc-700 motion-reduce:transition-none dark:bg-white dark:text-zinc-900">
       Download CV
      </Link>
      <Link href="/contact" className="border-black/15 inline-flex items-center rounded-xl border px-5 py-3 font-semibold text-zinc-800 duration-200 hover:bg-black/5 motion-reduce:transition-none dark:border-neutral-700 dark:text-white dark:hover:bg-white/[6%]">
       Contact
      </Link>
     </div>
    </div>
    <div className="relative mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-white/60">
     <Link href="https://github.com/your-github" target="_blank" className="hover:text-zinc-900 dark:hover:text-white">
      GitHub ↗
     </Link>
     <Link href="https://www.linkedin.com/in/your-handle/" target="_blank" className="hover:text-zinc-900 dark:hover:text-white">
      LinkedIn ↗
     </Link>
     <Link href="https://acme.example.com" target="_blank" className="hover:text-zinc-900 dark:hover:text-white">
      acme.example.com ↗
     </Link>
     <Link href="/#work" className="hover:text-zinc-900 dark:hover:text-white">
      Products →
     </Link>
    </div>
   </header>

   {/* About */}
   <section className="mt-16">
    <Heading>About</Heading>
    <div className="max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 [&_strong]:font-semibold [&_strong]:text-zinc-800 dark:[&_strong]:text-white" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
   </section>

   {(profile.strengths || []).length > 0 && (
    <section className="mt-16">
     <Heading>How I work</Heading>
     <div className="grid gap-4 md:grid-cols-3">
      {profile.strengths.map((x) => (
       <div key={x.title} className={`${card} p-6`}>
        <h3 className="font-semibold text-zinc-800 dark:text-white">{x.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{x.body}</p>
       </div>
      ))}
     </div>
    </section>
   )}

   {/* Experience */}
   <section className="mt-16">
    <Heading>Experience</Heading>
    <Timeline items={experience} />
   </section>

   {/* Leadership */}
   <section className="mt-16">
    <Heading>Leadership</Heading>
    <Timeline items={leadership} />
   </section>

   {/* Skills + education */}
   <section className="mt-16 grid gap-6 lg:grid-cols-5">
    <div className={`${card} p-6 lg:col-span-3`}>
     <h2 className="mb-5 text-xl font-semibold text-zinc-800 dark:text-white">
      Skills
      <Dot />
     </h2>
     <div className="space-y-4">
      {skills.map((group) => (
       <div key={group.label} className="grid gap-2 sm:grid-cols-[120px_1fr]">
        <p className="pt-0.5 text-sm font-medium text-zinc-500 dark:text-white/50">{group.label}</p>
        <div className="flex flex-wrap gap-1.5">
         {group.items.map((item) => (
          <span key={item} className="rounded-full bg-[#6310ff]/10 px-2.5 py-0.5 text-sm font-medium text-[#6310ff] dark:bg-[#1491ff]/20 dark:text-[#64acff]">
           {item}
          </span>
         ))}
        </div>
       </div>
      ))}
     </div>
    </div>

    <div className="flex flex-col gap-6 lg:col-span-2">
     <div className={`${card} p-6`}>
      <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-white">
       Education
       <Dot />
      </h2>
      {edu && (
       <>
        <p className="font-semibold text-zinc-800 dark:text-white">{edu.school}</p>
        <p className="text-slate-600 dark:text-slate-400">{edu.program}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-white/50">
         {[edu.start, edu.end].filter(Boolean).join(" – ")}
         {edu.place ? ` · ${edu.place}` : ""}
        </p>
       </>
      )}
     </div>
     <div className={`${card} p-6`}>
      <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-white">
       Certifications
       <Dot />
      </h2>
      <ul className="space-y-3">
       {certifications.map((c) => (
        <li key={c.name}>
         <p className="font-medium text-zinc-800 dark:text-white">{c.name}</p>
         <p className="text-sm text-zinc-500 dark:text-white/50">{c.org}</p>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </section>

   <p className="mt-16 text-center text-slate-600 dark:text-slate-400">
    Languages: {(profile.languages || []).join(", ")} ·{" "}
    <Link href="/cv.pdf" target="_blank" className="font-semibold text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">
     Full CV as PDF
    </Link>
   </p>
  </div>
 );
}
