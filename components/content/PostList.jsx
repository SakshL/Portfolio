import { formatDate } from "lib/api";
import Link from "next/link";

export function PostList({ items, base = "/blog" }) {
 if (!items.length) return <p className="text-slate-600 dark:text-slate-400">Nothing here yet.</p>;
 return (
  <ol className="divide-y divide-black/10 dark:divide-white/10">
   {items.map((p) => (
    <li key={p.slug}>
     <Link data-morph href={`${base}/${p.slug}`} className="group grid gap-1 py-5 sm:grid-cols-[120px_1fr] sm:gap-6">
      <time className="pt-0.5 text-sm text-zinc-500 dark:text-white/40" dateTime={p.publish_at}>
       {formatDate(p.publish_at)}
      </time>
      <span>
       <span data-morph-title className="block font-semibold text-zinc-800 duration-200 group-hover:text-[#1491ff] dark:text-white dark:group-hover:text-[#64acff]">{p.title}</span>
       {p.summary && <span data-morph-summary className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{p.summary}</span>}
       <span className="mt-2 block text-xs text-zinc-500 dark:text-white/40">
        {p.reading_minutes} min read{p.tags?.length ? ` · ${p.tags.join(", ")}` : ""}
       </span>
      </span>
     </Link>
    </li>
   ))}
  </ol>
 );
}
