"use client";

import { cvHref, track } from "components/elements/client/Analytics";
import { useTheme } from "next-themes";
import { play } from "lib/sound";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { switchTheme } from "lib/themeRipple";

const EMAIL = "hello@example.com";
const typeLabel = { page: "Page", post: "Post", case_study: "Case study", project: "Project", action: "Action" };

function score(item, q) {
 if (!q) return 1;
 const t = item.title.toLowerCase();
 const h = (item.hint || "").toLowerCase();
 if (t.startsWith(q)) return 4;
 if (t.includes(q)) return 3;
 if (q.split(/\s+/).every((w) => t.includes(w) || h.includes(w))) return 2;
 return 0;
}

export function CommandMenu() {
 const [open, setOpen] = useState(false);
 const [q, setQ] = useState("");
 const [items, setItems] = useState(null);
 const [sel, setSel] = useState(0);
 const [note, setNote] = useState("");
 const [features, setFeatures] = useState({});
 const input = useRef(null);
 const router = useRouter();
 const { resolvedTheme, setTheme } = useTheme();

 const actions = useMemo(
  () => [
   { type: "action", title: "Copy email address", hint: EMAIL, keepOpen: true, run: () => navigator.clipboard?.writeText(EMAIL).then(() => (setNote("Email copied"), track("copy_email", { target: EMAIL }))) },
   { type: "action", title: "Download CV (PDF)", hint: "cv.pdf", run: () => window.open(cvHref(), "_blank") },
   { type: "action", title: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme", hint: "theme", run: () => switchTheme(setTheme, resolvedTheme === "dark" ? "light" : "dark") },
   { type: "action", title: "Open terminal", hint: "or press ` anywhere", run: () => window.dispatchEvent(new Event("toggle-terminal")) },
   { type: "action", title: "X-ray mode", hint: "see where every section comes from (or press X)", run: () => window.dispatchEvent(new Event("toggle-xray")) },
   { type: "action", title: "Try the terminal version", hint: "ssh example.com -p 2222", keepOpen: true, run: () => navigator.clipboard?.writeText("ssh example.com -p 2222").then(() => setNote("SSH command copied")) },
  ],
  [resolvedTheme, setTheme]
 );

 const toggle = useCallback((v) => {
  setOpen(v);
  setQ("");
  setSel(0);
  setNote("");
 }, []);

 useEffect(() => {
  const onKey = (e) => {
   const typing = /input|textarea|select/i.test(e.target?.tagName || "") || e.target?.isContentEditable;
   if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    toggle(!open);
   } else if (e.key === "/" && !typing && !open) {
    e.preventDefault();
    toggle(true);
   } else if (e.key === "Escape" && open) {
    toggle(false);
   }
  };
  const onOpen = () => toggle(true);
  window.addEventListener("keydown", onKey);
  window.addEventListener("open-cmdk", onOpen);
  return () => {
   window.removeEventListener("keydown", onKey);
   window.removeEventListener("open-cmdk", onOpen);
  };
 }, [open, toggle]);

 useEffect(() => {
  if (!open) return;
  track("cmdk");
  play("whoosh");
  setTimeout(() => input.current?.focus(), 10);
  fetch("/v1/features")
   .then((r) => r.json())
   .then(setFeatures)
   .catch(() => {});
  if (!items)
   fetch("/v1/search")
    .then((r) => r.json())
    .then(setItems)
    .catch(() => setItems([]));
 }, [open, items]);

 const results = useMemo(() => {
  const ql = q.trim().toLowerCase();
  const list = [...actions, ...(items || [])]
   .map((it) => ({ it, s: score(it, ql) }))
   .filter((x) => x.s > 0)
   .sort((a, b) => b.s - a.s)
   .slice(0, 12)
   .map((x) => x.it);
  if (features.ask && q.trim().length >= 3) {
   const question = q.trim().slice(0, 300);
   const askIt = {
    type: "action",
    title: `Ask: ${question}`,
    hint: "an answer from my writing, with sources",
    run: () => window.dispatchEvent(new CustomEvent("ask-question", { detail: question })),
   };
   // a question goes first; a short word stays below real matches
   if (/\?$|^(what|how|has|does|did|is|can|who|why|where|when)\b/i.test(question) || list.length === 0) list.unshift(askIt);
   else list.push(askIt);
  }
  return list;
 }, [q, items, actions, features, router]);

 const run = (it) => {
  if (!it) return;
  if (it.type === "action") {
   it.run();
   if (!it.keepOpen) toggle(false);
   return;
  }
  toggle(false);
  if (/^https?:\/\//.test(it.href)) window.open(it.href, "_blank", "noopener");
  else router.push(it.href);
 };

 if (!open) return null;
 return (
  <div className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => toggle(false)}>
   <div role="dialog" aria-modal="true" aria-label="Command menu" className="w-full max-w-xl overflow-hidden rounded-xl border bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#161617]" onMouseDown={(e) => e.stopPropagation()}>
    <input
     ref={input}
     value={q}
     onChange={(e) => {
      setQ(e.target.value);
      setSel(0);
     }}
     onKeyDown={(e) => {
      if (e.key === "ArrowDown") {
       e.preventDefault();
       setSel((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
       e.preventDefault();
       setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
       e.preventDefault();
       run(results[sel]);
      }
     }}
     placeholder="Search pages, posts, projects, or type a command"
     className="w-full border-b border-black/10 bg-transparent px-4 py-3.5 text-[15px] text-zinc-800 outline-none placeholder:text-zinc-400 dark:border-white/10 dark:text-white"
    />
    <ul className="max-h-[50vh] overflow-y-auto p-2">
     {items === null && <li className="px-3 py-2 text-sm text-zinc-500">Loading...</li>}
     {items !== null && results.length === 0 && <li className="px-3 py-2 text-sm text-zinc-500">No results</li>}
     {results.map((it, i) => (
      <li key={it.type + it.title}>
       <button
        type="button"
        onMouseEnter={() => setSel(i)}
        onClick={() => run(it)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === sel ? "bg-black/[6%] dark:bg-white/[8%]" : ""}`}
       >
        <span className="min-w-0 flex-1">
         <span className="block truncate text-sm font-medium text-zinc-800 dark:text-white">{it.title}</span>
         {it.hint && <span className="block truncate text-xs text-zinc-500 dark:text-white/40">{it.hint}</span>}
        </span>
        <span className="text-xs text-zinc-400 dark:text-white/30">{typeLabel[it.type] || ""}</span>
       </button>
      </li>
     ))}
    </ul>
    <div className="flex items-center justify-between border-t border-black/10 px-4 py-2 text-xs text-zinc-500 dark:border-white/10 dark:text-white/40">
     <span>{note || "↑ ↓ to move, Enter to open, Esc to close"}</span>
     <span>⌘K</span>
    </div>
   </div>
  </div>
 );
}

export function CommandButton() {
 return (
  <button
   type="button"
   onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
   className="hidden items-center gap-2 rounded-lg border border-black/10 px-2.5 py-1.5 text-sm text-gray-600 duration-200 hover:bg-black/5 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 md:flex"
   aria-label="Open command menu"
  >
   Search
   <kbd className="rounded border border-black/10 px-1 text-[11px] dark:border-white/15">⌘K</kbd>
  </button>
 );
}
