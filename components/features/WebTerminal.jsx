"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "lib/sound";
import { track } from "components/elements/client/Analytics";
import { useTerminal } from "components/features/useTerminal";

// Press ` to drop down a terminal: the same idea as `ssh example.com -p 2222`, in the browser.
export function WebTerminal() {
 const [open, setOpen] = useState(false);
 const { lines, out, input, setInput, cwd, busy, load, submit, onKeyDown } = useTerminal({ onExit: () => setOpen(false) });
 const inp = useRef(null);
 const end = useRef(null);

 useEffect(() => {
  const key = (e) => {
   const typing = /input|textarea|select/i.test(e.target?.tagName || "") || e.target?.isContentEditable;
   if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey && (!typing || e.target === inp.current)) {
    e.preventDefault();
    setOpen((v) => !v);
   } else if (e.key === "Escape") setOpen(false);
  };
  const toggle = () => setOpen((v) => !v);
  window.addEventListener("keydown", key);
  window.addEventListener("toggle-terminal", toggle);
  return () => {
   window.removeEventListener("keydown", key);
   window.removeEventListener("toggle-terminal", toggle);
  };
 }, []);

 useEffect(() => {
  if (!open) {
   if (lines.length) play("close");
   return;
  }
  play("whoosh");
  track("terminal");
  setTimeout(() => inp.current?.focus(), 60);
  if (!lines.length) {
   out({ t: "example.com, terminal edition", c: "hd" }, { t: "Type help to see what you can do. Press ` or Esc to close.", c: "dim" }, "");
   load().catch(() => out({ t: "Could not load the site data. Try again in a moment.", c: "err" }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [open]);

 useEffect(() => {
  end.current?.scrollIntoView({ block: "end" });
 }, [lines]);

 return (
  <div
   className={`force-ltr fixed inset-x-0 top-0 z-[2050] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${open ? "translate-y-0" : "pointer-events-none -translate-y-[105%]"}`}
   role="dialog"
   aria-label="Terminal"
   aria-hidden={!open}
  >
   <div className="mx-auto flex h-[min(60vh,560px)] max-w-5xl flex-col overflow-hidden rounded-b-2xl border border-t-0 border-white/10 bg-[#0c0d0c]/95 font-mono text-[13.5px] leading-relaxed text-zinc-200 shadow-2xl backdrop-blur max-sm:h-[70vh]" onClick={() => inp.current?.focus()}>
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs text-white/40">
     <span className="h-2.5 w-2.5 rounded-full bg-[#fb5f57]" />
     <span className="h-2.5 w-2.5 rounded-full bg-[#fdbf2d]" />
     <span className="h-2.5 w-2.5 rounded-full bg-[#27cb3f]" />
     <span className="ml-2">me@nepal: {cwd}</span>
     <button type="button" onClick={() => setOpen(false)} className="ml-auto rounded px-2 py-0.5 hover:bg-white/10 hover:text-white">
      Close
     </button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
     {lines.map((l, i) => (
      <div key={i} className={`whitespace-pre-wrap break-words ${{ hd: "font-semibold text-white", dim: "text-white/45", err: "text-[#fb7a72]", dir: "text-[#64acff]", file: "text-[#a2facf]", help: "text-zinc-300" }[l.c] || ""}`}>
       {l.c === "cmd" ? (
        <>
         <span className="text-[#a2facf]">me@nepal</span>
         <span className="text-white/40">:</span>
         <span className="text-[#64acff]">{l.cwd}</span>
         <span className="text-white/40">$ </span>
         {l.t}
        </>
       ) : (
        l.t || " "
       )}
      </div>
     ))}
     <form
      onSubmit={submit}
      className="flex items-center"
     >
      <label htmlFor="term-in" className="shrink-0">
       <span className="text-[#a2facf]">me@nepal</span>
       <span className="text-white/40">:</span>
       <span className="text-[#64acff]">{cwd}</span>
       <span className="text-white/40">$&nbsp;</span>
      </label>
      <input
       id="term-in"
       ref={inp}
       value={input}
       disabled={busy}
       onChange={(e) => setInput(e.target.value)}
       onKeyDown={onKeyDown}
       autoComplete="off"
       autoCapitalize="off"
       spellCheck={false}
       className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-white outline-0 caret-[#a2facf] sm:text-[13.5px]"
       aria-label="Terminal input"
      />
      {busy && <span className="text-white/40">thinking…</span>}
     </form>
     <div ref={end} />
    </div>
   </div>
  </div>
 );
}
