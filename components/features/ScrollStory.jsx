"use client";

import { useEffect, useRef, useState } from "react";
import { Diagram, diagramCaption, diagramSteps } from "components/diagrams";

// Sticky diagram beside a case study: boxes light up one by one as you read down the article.
export function ScrollStory({ name }) {
 const steps = diagramSteps(name) || [];
 const labels = steps.map((x) => x.label);
 const n = labels.length;
 const [step, setStep] = useState(0);
 const ref = useRef(null);

 useEffect(() => {
  const body = document.querySelector("[data-story-body]");
  if (!body || !n) return;
  let raf = 0;
  const calc = () => {
   raf = 0;
   const r = body.getBoundingClientRect();
   const travel = Math.max(1, r.height - innerHeight * 0.5);
   const p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / travel));
   setStep(Math.min(n - 1, Math.floor(p * n)));
  };
  const on = () => {
   if (!raf) raf = requestAnimationFrame(calc);
  };
  calc();
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on);
  return () => {
   window.removeEventListener("scroll", on);
   window.removeEventListener("resize", on);
   cancelAnimationFrame(raf);
  };
 }, [n]);

 if (!n) return null;
 return (
  <div ref={ref} className="sticky top-24 rounded-2xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617]" data-xray="scroll story · the diagram follows your reading">
   <div className="mb-3 flex items-baseline justify-between gap-3">
    <p className="text-xs font-medium text-zinc-500 dark:text-white/40">Reading along</p>
    <p className="text-xs tabular-nums text-zinc-500 dark:text-white/40">
     {step + 1} / {n}
    </p>
   </div>
   <Diagram name={name} step={step} story />
   <ol className="mt-4 space-y-1.5">
    {steps.map((x, i) => (
     <li key={i} className={`flex gap-2.5 rounded-lg px-2 py-1.5 duration-300 ${i === step ? "bg-[#1491ff]/10 dark:bg-[#64acff]/10" : ""}`}>
      <span className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold duration-300 ${i <= step ? "bg-[#1491ff] text-white dark:bg-[#64acff] dark:text-zinc-900" : "bg-black/10 text-zinc-500 dark:bg-white/10 dark:text-white/40"}`}>{i + 1}</span>
      <span className={`min-w-0 duration-300 ${i <= step ? "" : "opacity-45"}`}>
       <span className="block text-sm font-medium leading-snug text-zinc-800 dark:text-white">{x.label}</span>
       {x.sub && <span className="block text-xs text-zinc-500 dark:text-white/45">{x.sub}</span>}
      </span>
     </li>
    ))}
   </ol>
   <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-white/40">{diagramCaption(name)}</p>
  </div>
 );
}
