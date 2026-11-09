"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LANGS } from "lib/i18n";
import { play } from "lib/sound";

// Language menu. The first visit follows the browser language; picking one here saves it for a year.
export function LangPicker({ lang = "en" }) {
 const router = useRouter();
 const [open, setOpen] = useState(false);
 const [pending, start] = useTransition();
 const box = useRef(null);
 useEffect(() => {
  if (!open) return;
  const off = (e) => !box.current?.contains(e.target) && setOpen(false);
  const esc = (e) => e.key === "Escape" && setOpen(false);
  document.addEventListener("pointerdown", off);
  document.addEventListener("keydown", esc);
  return () => {
   document.removeEventListener("pointerdown", off);
   document.removeEventListener("keydown", esc);
  };
 }, [open]);
 const pick = (code) => {
  setOpen(false);
  if (code === lang) return;
  document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
  play("toggleOn");
  start(() => router.refresh());
 };
 const current = LANGS.find((l) => l[0] === lang) || LANGS[0];
 return (
  <div ref={box} className="relative">
   <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={`Language: ${current[1]}`}
    title="Language"
    className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 duration-200 hover:bg-black/10 dark:text-white/80 dark:hover:bg-white/10 ${pending ? "opacity-60" : ""}`}
   >
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
     <circle cx="12" cy="12" r="9" />
     <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
    <span className="hidden uppercase lg:inline">{lang}</span>
   </button>
   {open && (
    <ul role="listbox" aria-label="Language" className="fixed inset-x-4 top-[80px] z-[120] grid max-h-[calc(100dvh-110px)] grid-cols-2 gap-0.5 overflow-y-auto rounded-xl border border-black/10 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-[#161617] sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-[70vh] sm:w-[420px]">
     {LANGS.map(([code, name, dir]) => (
      <li key={code}>
       <button
        type="button"
        role="option"
        aria-selected={code === lang}
        lang={code}
        onClick={() => pick(code)}
        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm duration-150 ${code === lang ? "bg-black/[6%] font-semibold text-zinc-900 dark:bg-white/10 dark:text-white" : "text-zinc-700 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/[6%]"}`}
       >
        <span dir={dir || "ltr"}>{name}</span>
       </button>
      </li>
     ))}
    </ul>
   )}
  </div>
 );
}
