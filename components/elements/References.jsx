// Quotes from people I have worked with. Only shown once added in Studio, each with that person's permission.
export function References({ items = [], className = "" }) {
 const list = (items || []).filter((x) => x?.quote && x?.name);
 if (!list.length) return null;
 return (
  <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
   {list.map((x) => (
    <figure key={x.name + x.quote.slice(0, 20)} className="rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]">
     <blockquote className="leading-relaxed text-zinc-700 dark:text-white/80">&ldquo;{x.quote}&rdquo;</blockquote>
     <figcaption className="mt-3 text-sm">
      <span className="font-semibold text-zinc-800 dark:text-white">{x.name}</span>
      {(x.role || x.org) && <span className="text-slate-600 dark:text-slate-400">, {[x.role, x.org].filter(Boolean).join(", ")}</span>}
     </figcaption>
    </figure>
   ))}
  </div>
 );
}
