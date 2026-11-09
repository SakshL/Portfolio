"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Depth3D } from "components/features/Depth3D";
import { play } from "lib/sound";

const ALT = "My desk at night: a wall-mounted Dahua 27-inch 4K monitor showing example.com, a 14-inch MacBook Pro, an AJAZZ AK820 Pro keyboard with yellow accents and an Attack Shark R1 mouse on a black and white marble desk mat";
const set = (ext) => ["800", "1600", "2400"].map((w) => `/assets/setup/my-setup-v2-${w}.${ext} ${w}w`).join(", ");

function Picture({ sizes, className }) {
 return (
  <picture>
   <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
   <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src="/assets/setup/my-setup-v2-1600.jpg" srcSet={set("jpg")} sizes={sizes} width={1600} height={2000} alt={ALT} decoding="async" className={className} />
  </picture>
 );
}

// Photo with hotspots on each item, linked to the gear list next to it.
export function SetupView({ gear }) {
 const [active, setActive] = useState(null);
 const stage = useRef(null);
 // the 3D view reports its offset each frame; CSS variables move the card, the light and the dots without re-rendering
 const onOffset = useCallback(([x, y]) => {
  const el = stage.current;
  if (!el) return;
  el.style.setProperty("--ox", x.toFixed(4));
  el.style.setProperty("--oy", y.toFixed(4));
 }, []);
 const [zoom, setZoom] = useState(false);

 useEffect(() => {
  if (!zoom) return;
  const k = (e) => e.key === "Escape" && setZoom(false);
  window.addEventListener("keydown", k);
  document.body.style.overflow = "hidden";
  return () => {
   window.removeEventListener("keydown", k);
   document.body.style.overflow = "";
  };
 }, [zoom]);

 const cur = gear.find((g) => g.id === active);
 return (
  <div className="grid gap-10 md:grid-cols-[minmax(0,520px)_1fr] lg:gap-14">
   <div className="md:sticky md:top-24 md:self-start" ref={stage} style={{ perspective: "1400px" }}>
    <div className="setup-card relative overflow-hidden rounded-2xl border shadow-2xl shadow-black/30 dark:border-neutral-800">
     <button type="button" data-silent onClick={() => (play("whoosh"), setZoom(true))} className="block w-full cursor-zoom-in" aria-label="Open the desk photo full screen">
      <Picture sizes="(max-width: 768px) 100vw, 520px" className="h-auto w-full" />
     </button>
     <Depth3D src="/assets/setup/my-setup-v2-1600.jpg" depth="/assets/setup/setup-depth.png" onOffset={onOffset} />
     <span className="setup-glare pointer-events-none absolute inset-0" aria-hidden="true" />
     {gear.map((g) => (
      <button
       key={g.id}
       type="button"
       data-sound="tick"
       onMouseEnter={() => setActive(g.id)}
       onMouseLeave={() => setActive(null)}
       onFocus={() => setActive(g.id)}
       onBlur={() => setActive(null)}
       onClick={() => setActive((a) => (a === g.id ? null : g.id))}
       aria-label={g.name}
       className="hotspot absolute -translate-x-1/2 -translate-y-1/2 p-2"
       style={{ left: `calc(${g.x}% + var(--ox, 0) * ${((g.d - 0.42) * 4.2).toFixed(3)}%)`, top: `calc(${g.y}% + var(--oy, 0) * ${((g.d - 0.42) * 4.2).toFixed(3)}%)` }}
      >
       <span className={`block h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.25)] duration-200 ${active === g.id ? "scale-125 bg-[#64acff]" : "hotspot-ring bg-white/80"}`} />
      </button>
     ))}
     {cur && (
      <div
       role="status"
       className="pointer-events-none absolute z-10 w-56 animate-[page-enter_.2s_ease-out] rounded-xl border border-white/10 bg-zinc-900/90 p-3 text-white shadow-xl backdrop-blur"
       style={{ left: `clamp(8px, ${cur.x > 55 ? `calc(${cur.x}% - 236px)` : `calc(${cur.x}% + 20px)`}, calc(100% - 232px))`, top: `clamp(8px, calc(${cur.y}% - 30px), calc(100% - 150px))` }}
      >
       <p className="text-xs text-white/50">{cur.kind}</p>
       <p className="font-semibold">{cur.name}</p>
       <p className="mt-1 text-[13px] leading-snug text-white/75">{cur.note}</p>
       {cur.specs?.length > 0 && <p className="mt-1.5 text-[12px] leading-snug text-white/50">{cur.specs.slice(0, 3).join(" · ")}</p>}
      </div>
     )}
     <span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-black/55 px-2 py-1 text-xs text-white backdrop-blur">Move around to see it in 3D. Tap the dots, or the photo to zoom</span>
    </div>
    <p className="mt-3 text-sm text-zinc-500 dark:text-white/40">Yes, that is this website on the monitor.</p>
   </div>

   <div>
    <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">On the desk</h2>
    <ul className="mt-3 space-y-2">
     {gear.map((g) => (
      <li key={g.id}>
       <div
        onMouseEnter={() => setActive(g.id)}
        onMouseLeave={() => setActive(null)}
        className={`rounded-xl border p-4 duration-200 ${active === g.id ? "border-[#1491ff]/60 bg-[#1491ff]/[6%] dark:border-[#64acff]/50 dark:bg-[#64acff]/[7%]" : "bg-zinc-200/[25%] dark:border-neutral-800 dark:bg-[#161617]"}`}
       >
        <p className="text-xs text-zinc-500 dark:text-white/40">{g.kind}</p>
        <p className="font-semibold text-zinc-800 dark:text-white">{g.name}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{g.note}</p>
        {g.specs?.length > 0 && (
         <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${g.name} specs`}>
          {g.specs.map((sp) => (
           <li key={sp} className="rounded-md border border-black/10 px-2 py-0.5 text-xs text-zinc-600 dark:border-white/10 dark:text-white/60">
            {sp}
           </li>
          ))}
         </ul>
        )}
       </div>
      </li>
     ))}
    </ul>
   </div>

   {zoom && (
    <div role="dialog" aria-modal="true" aria-label="Desk photo" className="fixed inset-0 z-[2100] flex animate-[page-enter_.25s_ease-out] items-center justify-center bg-black/90 p-3" onClick={() => setZoom(false)}>
     <Picture sizes="100vw" className="max-h-[92vh] w-auto rounded-xl object-contain" />
     <button type="button" onClick={() => setZoom(false)} className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white">
      Close
     </button>
    </div>
   )}
  </div>
 );
}
