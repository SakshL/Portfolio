import { getActivity, getSite, xray } from "lib/api";
import { HEATMAP_MIN, Heatmap } from "components/features/Heatmap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipping now", description: "A running log of what I ship at Acme and elsewhere." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;
const tagLabel = { acme: "Acme", nimbus: "Nimbus", biz: "Acme POS", site: "This site", other: "Other" };

export default async function Now() {
 const [site, activity] = await Promise.all([getSite(), getActivity().catch(() => null)]);
 const byMonth = {};
 for (const s of site?.ship || []) {
  const k = new Date(s.date + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  (byMonth[k] ||= []).push(s);
 }
 return (
  <div className="mx-auto mb-20 w-full max-w-3xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Shipping now
    <Dot />
   </h1>
   <p className="mt-2 text-slate-600 dark:text-slate-400">Things that went live, newest first. Small or big, if it shipped it goes here. It updates itself as I work.</p>
   {site?.now?.text && (
    <p className="mt-6 flex items-start gap-2.5 rounded-xl border bg-zinc-200/[25%] p-4 text-zinc-800 dark:border-neutral-800 dark:bg-[#161617] dark:text-white" data-xray={xray(site, "now line · Autopilot")}>
     <span className="now-dot mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#27cb3f]" />
     <span>
      <span className="font-semibold">Right now: </span>
      {site.now.text}
     </span>
    </p>
   )}
   {activity?.total >= HEATMAP_MIN && (
    <div className="mt-8">
     <Heatmap data={activity} xrayNote={xray(activity, "commit counts from a root timer · server component")} />
    </div>
   )}
   {Object.entries(byMonth).map(([month, items]) => (
    <section key={month} className="mt-10">
     <h2 className="text-sm font-medium text-zinc-500 dark:text-white/40">{month}</h2>
     <ol className="mt-3 border-l border-black/10 dark:border-white/10">
      {items.map((s) => (
       <li key={s.id} className="relative pb-5 pl-6 last:pb-0">
        <span className="absolute -left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border-2 border-zinc-400 bg-white dark:border-neutral-600 dark:bg-[#121212]" />
        <p className="text-zinc-800 dark:text-white">{s.link ? <a href={s.link} target="_blank" rel="noopener" className="underline decoration-black/20 underline-offset-4 dark:decoration-white/25">{s.text}</a> : s.text}</p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-white/40">
         {new Date(s.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })} · {tagLabel[s.tag] || "Other"}
        </p>
       </li>
      ))}
     </ol>
    </section>
   ))}
  </div>
 );
}
