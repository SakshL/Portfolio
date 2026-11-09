"use client";

import { useEffect, useRef, useState } from "react";

// Shared shell for the playable case study demos: a labelled card, a header row for controls and a caption.
export function DemoFrame({ title, controls, caption, children }) {
 return (
  <figure className="not-prose my-8">
   <style>{"@keyframes demo-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"}</style>
   <div className="rounded-xl border bg-zinc-200/[25%] p-3 dark:border-neutral-800 dark:bg-[#161617] sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
     <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1491ff]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1477ff] dark:bg-[#64acff]/[15%] dark:text-[#64acff]">
       <span className="h-1.5 w-1.5 rounded-full bg-current" />
       Try it
      </span>
      <span className="truncate text-sm font-semibold text-zinc-800 dark:text-white">{title}</span>
     </div>
     <div className="flex flex-wrap items-center gap-1.5">{controls}</div>
    </div>
    {children}
   </div>
   <figcaption className="mt-2 text-center text-xs text-zinc-500 dark:text-white/40">{caption} Sample data, simulated in your browser.</figcaption>
  </figure>
 );
}

export function Btn({ on, primary, children, className = "", ...p }) {
 const base = "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1491ff]";
 const look = primary
  ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/[85%]"
  : on
  ? "border border-[#1491ff]/50 bg-[#1491ff]/10 text-[#1477ff] dark:border-[#64acff]/50 dark:bg-[#64acff]/[15%] dark:text-[#64acff]"
  : "border border-black/10 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[4%] dark:text-white/80 dark:hover:bg-white/[8%]";
 return (
  <button type="button" className={`${base} ${look} ${className}`} {...p}>
   {children}
  </button>
 );
}

export function Seg({ value, options, onChange, label, size = "sm" }) {
 return (
  <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/10 dark:bg-white/[4%]">
   {options.map(([v, text, tone]) => (
    <button
     key={v}
     type="button"
     role="radio"
     aria-checked={value === v}
     onClick={() => onChange(v)}
     className={`rounded-md px-2 ${size === "xs" ? "py-0.5 text-[11px]" : "py-1 text-xs"} font-semibold duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1491ff] ${
      value === v ? tone || "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500 hover:text-zinc-800 dark:text-white/50 dark:hover:text-white"
     }`}
    >
     {text}
    </button>
   ))}
  </div>
 );
}

export function useReducedMotion() {
 const [r, setR] = useState(false);
 useEffect(() => {
  const m = matchMedia("(prefers-reduced-motion: reduce)");
  setR(m.matches);
  const on = () => setR(m.matches);
  m.addEventListener?.("change", on);
  return () => m.removeEventListener?.("change", on);
 }, []);
 return r;
}

// true while the element is on screen, so demos only animate when someone can see them
export function useVisible() {
 const ref = useRef(null);
 const [v, setV] = useState(false);
 useEffect(() => {
  const el = ref.current;
  if (!el || !("IntersectionObserver" in window)) return setV(true);
  const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: "80px" });
  io.observe(el);
  return () => io.disconnect();
 }, []);
 return [ref, v];
}

export const clock = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
