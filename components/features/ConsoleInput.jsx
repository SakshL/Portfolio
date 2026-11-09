"use client";

import { useEffect, useRef, useState } from "react";
import { useTerminal } from "components/features/useTerminal";
import { track } from "components/elements/client/Analytics";

const TONE = { hd: "font-semibold", dim: "opacity-55", err: "text-[#e5484d] dark:text-[#fb7a72]", dir: "text-[#1477ff] dark:text-[#64acff]", file: "text-[#0d8a5a] dark:text-[#a2facf]" };

function Arrow() {
 return (
  <>
   <span className="font-semibold text-[#ea4aaa]" aria-hidden="true">
    →
   </span>{" "}
   <span className="font-semibold text-[#66e777]" aria-hidden="true">
    ~/me
   </span>{" "}
   <span className="font-semibold italic text-slate-700 dark:text-slate-300" aria-hidden="true">
    $
   </span>{" "}
  </>
 );
}

// The last prompt of the home console card: type commands right in the card (same commands as the ` terminal).
export function ConsoleInput() {
 const { lines, input, setInput, busy, submit, onKeyDown } = useTerminal();
 const [focused, setFocused] = useState(false);
 const inp = useRef(null);
 const box = useRef(null);
 const used = useRef(false);

 useEffect(() => {
  // keep the newest line in view inside the card, without moving the page
  const scroller = box.current?.closest("[data-console-scroll]");
  if (!scroller) return;
  // the card keeps the size it loaded with: new lines scroll inside it, so the hero never jumps
  if (lines.length && !scroller.style.height) scroller.style.height = scroller.offsetHeight + "px";
  if (!lines.length) scroller.style.height = "";
  scroller.scrollTop = scroller.scrollHeight;
 }, [lines, busy]);

 useEffect(() => {
  const card = box.current?.closest("[data-console]");
  if (!card) return;
  const focus = (e) => {
   if (e.target.closest("a,button")) return;
   if (window.getSelection()?.toString()) return;
   inp.current?.focus({ preventScroll: true });
  };
  card.addEventListener("click", focus);
  return () => card.removeEventListener("click", focus);
 }, []);

 return (
  <div ref={box}>
   {lines.map((l, i) =>
    l.c === "cmd" ? (
     <div key={i} className="mt-2 whitespace-pre-wrap break-words">
      <Arrow />
      <span className="italic">{l.t}</span>
     </div>
    ) : l.k !== undefined ? (
     <div key={i} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 pl-4 text-zinc-700 dark:text-white/80">
      <span className="truncate font-medium">{l.k}</span>
      <span className="whitespace-normal break-words opacity-70">{l.v}</span>
     </div>
    ) : (
     <div key={i} className={`whitespace-pre-wrap break-words pl-4 text-zinc-700 dark:text-white/80 ${TONE[l.c] || ""}`}>
      {l.t || " "}
     </div>
    )
   )}
   <form onSubmit={submit} className="mt-2 flex items-center">
    <label htmlFor="console-in" className="shrink-0">
     <Arrow />
    </label>
    <div className="relative ml-1.5 min-w-0 flex-1">
     <input
      id="console-in"
      ref={inp}
      value={input}
      disabled={busy}
      onChange={(e) => {
       setInput(e.target.value);
       if (!used.current) {
        used.current = true;
        track("console");
       }
      }}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="go"
      aria-label="Type a command, for example help"
      style={{ outline: "none" }}
      className="w-full border-0 bg-transparent p-0 text-[16px] italic text-inherit caret-[#66e777] outline-none focus:outline-none sm:text-sm"
     />
     {!input && !busy && (
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 text-[15px] sm:text-sm" aria-hidden="true">
       {!focused && <span className="inline-block h-[1.1em] w-[0.55em] animate-[cursor_750ms_infinite] bg-current opacity-70" />}
       <span className="opacity-35">{focused ? "try help, ls blog or ask what Acme is" : "type help"}</span>
      </span>
     )}
     {busy && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center opacity-50">thinking…</span>}
    </div>
   </form>
  </div>
 );
}
