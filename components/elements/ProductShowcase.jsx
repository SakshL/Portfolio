import Image from "next/image";
import Link from "next/link";

// "What I'm building": every picture is a real screen from the product. Text comes from the studio (projects).
// Nimbus and Biz screens were captured from the real apps running a made-up demo shop, so no customer data shows.

const pic = (name) => `/assets/work/v2/${name}.webp`;


function Links({ p }) {
 return (
  <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-sm">
   {p.url && (
    <Link href={p.url} target="_blank" className="font-medium text-zinc-800 underline decoration-black/25 underline-offset-4 dark:text-white dark:decoration-white/30">
     {p.url_label || p.url.replace(/^https?:\/\//, "")} ↗
    </Link>
   )}
   {(p.extra_links || []).map((l) => (
    <Link key={l.href} href={l.href} target="_blank" className="text-zinc-500 hover:text-zinc-800 dark:text-white/50 dark:hover:text-white">
     {l.label}
    </Link>
   ))}
  </div>
 );
}

function Title({ p, size = "text-lg" }) {
 return (
  <div className="flex items-center gap-2.5">
   {p.icon_url && <Image src={p.icon_url} unoptimized alt="" width={28} height={28} className="h-7 w-7 rounded-[7px]" />}
   <h4 className={`font-semibold tracking-[-0.01em] text-zinc-800 dark:text-white ${size}`}>{p.name}</h4>
   <span className="ml-auto text-xs text-zinc-500 dark:text-white/40">{p.year}</span>
  </div>
 );
}

function Frame({ url, src, alt, w, h }) {
 return (
  <div className="overflow-hidden rounded-t-lg border border-b-0 border-black/[8%] bg-white shadow-[0_16px_30px_-20px_rgba(0,0,0,.45)] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1 motion-reduce:transition-none">
   <div className="flex h-5 items-center gap-1 border-b border-zinc-200 bg-zinc-100 px-2">
    <i className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
    <i className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
    <i className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
    <span className="ml-1.5 truncate text-[9px] text-zinc-500">{url}</span>
   </div>
   <Image src={src} unoptimized alt={alt} width={w} height={h} className="block h-auto w-full" />
  </div>
 );
}

const card = "group flex flex-col overflow-hidden rounded-2xl border border-black/[12%] bg-zinc-200/[25%] duration-200 hover:border-black/25 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700";
const stage = "relative h-[184px] overflow-hidden border-b border-black/10 dark:border-neutral-800";

function Body({ p, extra = "" }) {
 return (
  <div className="flex flex-1 flex-col gap-1.5 p-4">
   <Title p={p} />
   <p className="text-xs text-zinc-500 dark:text-white/40">{p.role}</p>
   <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
    {p.summary}
    {extra}
   </p>
   <div className="pt-1 text-[13px]">
    <Links p={p} />
   </div>
  </div>
 );
}

export function ProductShowcase({ projects = [] }) {
 const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
 const acme = by["acme"];
 const nimbus = by["nimbus"];
 const biz = by["acme-pos"];
 const rest = projects.filter((p) => !["acme", "nimbus", "acme-pos"].includes(p.slug));

 return (
  <div className="mx-auto max-w-5xl">
   <div className="grid gap-3 md:grid-cols-3">
    {acme && (
     <article className={card}>
      <div className={`${stage} flex items-end justify-center gap-1.5 bg-[#FFD60A] px-3 pt-4`} aria-label="Acme app screens">
       {[
        ["acme-track", "Acme app: live order tracking"],
        ["acme-grocery", "Acme app: grocery"],
        ["acme-pay", "Acme app: ways to pay"],
       ].map(([n, alt], i) => (
        <Image
         key={n}
         src={pic(n)}
         unoptimized
         alt={alt}
         width={480}
         height={719}
         className={`block h-auto w-[31%] max-w-[104px] self-start duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${i === 1 ? "mt-0 group-hover:-translate-y-1.5" : "mt-3 group-hover:-translate-y-1"}`}
        />
       ))}
      </div>
      <Body p={acme} />
     </article>
    )}
    {nimbus && (
     <article className={card}>
      <div className={`${stage} bg-[#eef0f6] px-4 pt-4`}>
       <Frame url="pay.example.com" src={pic("nimbus-dashboard")} alt="Nimbus merchant dashboard" w={1600} h={833} />
       <div className="absolute -bottom-6 right-3 w-[26%] max-w-[84px] overflow-hidden rounded-[14px] border-[3px] border-zinc-900 shadow-[0_16px_30px_-12px_rgba(0,0,0,.5)] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-2 group-hover:-rotate-2 motion-reduce:transition-none">
        <Image src={pic("nimbus-pay")} unoptimized alt="Nimbus pay page on a phone" width={420} height={538} className="block h-auto w-full" />
       </div>
      </div>
      <Body p={nimbus} />
     </article>
    )}
    {biz && (
     <article className={card}>
      <div className={`${stage} bg-[#f3f5f7] px-4 pt-4`}>
       <Frame url="pos.example.com" src={pic("biz-floor")} alt="Acme POS table floor with running bills and timers" w={1600} h={1033} />
      </div>
      <Body p={biz} />
     </article>
    )}
   </div>

   {rest.length > 0 && (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
     {rest.map((p) => (
      <article key={p.slug} className="flex flex-col gap-1 rounded-2xl border border-black/[12%] bg-zinc-200/[25%] px-4 py-3 dark:border-neutral-800 dark:bg-[#161617]">
       <h4 className="text-[15px] font-semibold text-zinc-800 dark:text-white">{p.url ? <Link href={p.url} target="_blank">{p.name} ↗</Link> : p.name}</h4>
       <p className="text-[13px] leading-snug text-slate-600 dark:text-slate-400">{p.summary}</p>
      </article>
     ))}
    </div>
   )}
  </div>
 );
}
