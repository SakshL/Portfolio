"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AskChat, Me } from "components/features/AskChat";
import { play } from "lib/sound";

// Floating "Ask" on every page. Cmd+K questions and ?ask= links land here.
export function AskWidget() {
 const [enabled, setEnabled] = useState(false);
 const [open, setOpen] = useState(false);
 const [mounted, setMounted] = useState(false); // keep the chat alive after first open
 const path = usePathname();
 const hidden = path.startsWith("/resume/print") || path.startsWith("/preview");

 useEffect(() => {
  fetch("/v1/features")
   .then((r) => r.json())
   .then((f) => setEnabled(!!f.ask))
   .catch(() => {});
 }, []);

 useEffect(() => {
  if (!enabled) return;
  const show = (q) => {
   setMounted(true);
   setOpen(true);
   play("whoosh");
   if (q) setTimeout(() => window.dispatchEvent(new CustomEvent("ask-run", { detail: q })), 80);
  };
  const onAsk = (e) => show(String(e.detail || ""));
  const onKey = (e) => e.key === "Escape" && setOpen(false);
  window.addEventListener("ask-question", onAsk);
  window.addEventListener("keydown", onKey);
  const v = new URLSearchParams(location.search).get("ask");
  if (v) {
   const u = new URL(location.href);
   u.searchParams.delete("ask");
   history.replaceState(history.state, "", u.pathname + u.search + u.hash);
   show(v.slice(0, 300));
  }
  return () => {
   window.removeEventListener("ask-question", onAsk);
   window.removeEventListener("keydown", onKey);
  };
 }, [enabled]);

 if (!enabled || hidden) return null;
 return (
  <div className="print:hidden">
   <button
    type="button"
    data-silent
    onClick={() => {
     setMounted(true);
     setOpen((v) => !v);
     play(open ? "close" : "whoosh");
    }}
    aria-expanded={open}
    aria-label={open ? "Close the Ask chat" : "Ask about my work"}
    className={`fixed bottom-5 right-5 z-[1700] flex items-center gap-2 rounded-full bg-zinc-900 py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-xl shadow-black/25 duration-300 hover:scale-[1.04] dark:bg-white dark:text-zinc-900 ${open ? "max-sm:hidden" : ""}`}
   >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
     {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />}
    </svg>
    {open ? "Close" : "Ask"}
   </button>
   {mounted && (
    <div
     role="dialog"
     aria-label="Ask about my work"
     className={`fixed z-[1650] flex origin-bottom-right flex-col overflow-hidden border bg-white shadow-2xl duration-300 ease-[cubic-bezier(.2,.8,.2,1)] dark:border-neutral-800 dark:bg-[#161617] max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-16 max-sm:rounded-2xl sm:bottom-20 sm:right-5 sm:h-[min(600px,calc(100vh-120px))] sm:w-[400px] sm:rounded-2xl ${open ? "visible scale-100 opacity-100" : "pointer-events-none invisible translate-y-3 scale-95 opacity-0"}`}
    >
     <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
      <div className="flex items-center gap-2.5">
       <Me size={34} />
       <div>
        <p className="font-semibold text-zinc-800 dark:text-white">Ask about my work</p>
        <p className="text-xs text-zinc-500 dark:text-white/40">Answers with sources, from my own writing</p>
       </div>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-zinc-500 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
       </svg>
      </button>
     </div>
     <AskChat compact listen autoFocus={open} />
    </div>
   )}
  </div>
 );
}
