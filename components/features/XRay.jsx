"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { play } from "lib/sound";

// X-ray mode: press X to see where every section of the page comes from.
// Server components mark sections with data-xray="GET /v1/site · 12 ms · cached 60 s · server component".
export function XRay() {
 const [on, setOn] = useState(false);
 const [boxes, setBoxes] = useState([]);
 const path = usePathname();

 const measure = useCallback(() => {
  const els = [...document.querySelectorAll("[data-xray]")];
  setBoxes(
   els
    .map((el) => {
     const r = el.getBoundingClientRect();
     return { label: el.getAttribute("data-xray"), x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    })
    .filter((b) => b.w > 0 && b.h > 0)
  );
 }, []);

 useEffect(() => {
  const onKey = (e) => {
   const typing = /input|textarea|select/i.test(e.target?.tagName || "") || e.target?.isContentEditable;
   if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
   if (e.key === "x" || e.key === "X") setOn((v) => (play(v ? "toggleOff" : "scan"), !v));
   else if (e.key === "Escape") setOn(false);
  };
  const onToggle = () => setOn((v) => (play(v ? "toggleOff" : "scan"), !v));
  window.addEventListener("keydown", onKey);
  window.addEventListener("toggle-xray", onToggle);
  return () => {
   window.removeEventListener("keydown", onKey);
   window.removeEventListener("toggle-xray", onToggle);
  };
 }, []);

 useEffect(() => {
  if (!on) return;
  measure();
  const t = setTimeout(measure, 300);
  window.addEventListener("resize", measure);
  return () => {
   clearTimeout(t);
   window.removeEventListener("resize", measure);
  };
 }, [on, path, measure]);

 if (!on) return null;
 const nav = typeof performance !== "undefined" ? performance.getEntriesByType("navigation")[0] : null;
 return (
  <>
   <div className="pointer-events-none absolute left-0 top-0 z-[1500] w-full" aria-hidden="true">
    {boxes.map((b, i) => (
     <div key={i} className="absolute rounded-lg border border-dashed border-[#1491ff] bg-[#1491ff]/[4%] dark:border-[#64acff]" style={{ left: b.x - 4, top: b.y - 4, width: b.w + 8, height: b.h + 8 }}>
      <span className="absolute -top-[11px] left-2 max-w-[calc(100%-16px)] truncate rounded bg-[#1491ff] px-1.5 py-[1px] font-mono text-[10.5px] text-white dark:bg-[#64acff] dark:text-zinc-900">{b.label}</span>
     </div>
    ))}
   </div>
   <div role="status" className="fixed bottom-4 left-1/2 z-[1600] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-white/90 px-4 py-2.5 text-sm text-zinc-800 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-[#161617]/90 dark:text-white">
    <span className="font-semibold">X-ray</span>
    <span className="truncate text-zinc-500 dark:text-white/50">
     {boxes.length} sections · Next.js 14 server components · Go API{nav ? ` · page served in ${Math.round(nav.responseStart - nav.requestStart)} ms` : ""}
    </span>
    <button type="button" onClick={() => setOn(false)} className="rounded-md border border-black/10 px-2 py-0.5 text-xs dark:border-white/15">
     Close
    </button>
   </div>
  </>
 );
}
