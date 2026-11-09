import { getAcmeBlog } from "lib/acmeBlog";

const fmt = (d) => {
 const t = new Date(d);
 return isNaN(t) ? "" : t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" });
};

// "I also write for Acme's company blog", with its latest posts.
export async function CompanyBlog() {
 const posts = await getAcmeBlog(3);
 return (
  <section className="mt-8 rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]" aria-labelledby="company-blog">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
     <h2 id="company-blog" className="text-lg font-semibold text-zinc-800 dark:text-white">
      Acme's company blog
     </h2>
     <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">Product news and stories from the team behind Acme, written for customers, riders and restaurant partners.</p>
    </div>
    <a href="https://blog.example.com" target="_blank" rel="noopener" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 duration-200 hover:border-black/25 dark:border-white/[15%] dark:bg-transparent dark:text-white dark:hover:border-white/[30%]">
     blog.example.com
     <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M4 2h6v6M10 2 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
    </a>
   </div>
   {posts.length > 0 && (
    <ul className="mt-4 divide-y divide-black/[7%] dark:divide-white/[7%]">
     {posts.map((p) => (
      <li key={p.link}>
       <a href={p.link} target="_blank" rel="noopener" className="group block py-3">
        <span className="text-xs text-zinc-500 dark:text-white/40">
         {fmt(p.date)}
         {p.category ? ` · ${p.category}` : ""}
        </span>
        <span className="mt-0.5 block font-medium text-zinc-800 duration-200 group-hover:text-[#1491ff] dark:text-white dark:group-hover:text-[#64acff]">{p.title}</span>
        {p.summary && <span className="mt-0.5 line-clamp-2 block text-sm text-slate-600 dark:text-slate-400">{p.summary}</span>}
       </a>
      </li>
     ))}
    </ul>
   )}
  </section>
 );
}
