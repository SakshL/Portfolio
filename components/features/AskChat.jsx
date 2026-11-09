"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "components/elements/client/Analytics";
import { BookCall } from "components/features/BookCall";
import { play } from "lib/sound";

export const SUGGEST = ["Has he built payment systems?", "What does he use Go for?", "Is he open to remote work?", "Has he led a team?"];

function store(k) {
 try {
  return sessionStorage.getItem(k) || "";
 } catch {
  return "";
 }
}

function rid() {
 const b = new Uint8Array(9);
 crypto.getRandomValues(b);
 return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Answer text with [n] markers turned into small links to the cited page.
export function Answer({ text, sources, typing }) {
 const byN = Object.fromEntries((sources || []).map((s) => [s.n, s]));
 const parts = text.split(/(\[\d{1,2}\])/g);
 return (
  <p className={`whitespace-pre-line leading-relaxed text-zinc-800 dark:text-white/90 ${typing ? "typing-caret" : ""}`}>
   {parts.map((p, i) => {
    const m = p.match(/^\[(\d{1,2})\]$/);
    if (!m) return <span key={i}>{p}</span>;
    const s = byN[Number(m[1])];
    if (!s) return typing ? <span key={i} className="mx-[1px] align-super text-[11px] text-zinc-400">{m[1]}</span> : null;
    return (
     <Link key={i} href={s.href} title={s.title} className="mx-[1px] align-super text-[11px] font-semibold text-[#1491ff] no-underline dark:text-[#64acff]">
      {m[1]}
     </Link>
    );
   })}
  </p>
 );
}

async function streamAsk(body, onDelta) {
 const r = await fetch("/v1/ask/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
 if (!r.ok || !r.body) {
  const d = await r.json().catch(() => ({}));
  throw new Error(d.error || "Something went wrong, please try again.");
 }
 const reader = r.body.getReader();
 const dec = new TextDecoder();
 let buf = "";
 let done = null;
 for (;;) {
  const { value, done: end } = await reader.read();
  if (end) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
   const block = buf.slice(0, i);
   buf = buf.slice(i + 2);
   const ev = (block.match(/^event: (.*)$/m) || [])[1];
   const data = (block.match(/^data: (.*)$/m) || [])[1];
   if (!ev || !data) continue;
   const d = JSON.parse(data);
   if (ev === "delta") onDelta(d.t);
   else if (ev === "done") done = d;
   else if (ev === "error") throw new Error(d.error);
  }
 }
 if (!done) throw new Error("The answer was cut off, please try again.");
 return done;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// My portrait next to every answer: the Ask assistant answers as me.
export function Me({ size = 28 }) {
 return (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/portrait-face.webp" alt="" width={size} height={size} className="shrink-0 rounded-full bg-zinc-100 ring-1 ring-black/10 dark:bg-zinc-800 dark:ring-white/10" style={{ width: size, height: size }} />
 );
}

export function AskChat({ compact = false, autoFocus = false, onAsked, listen = false }) {
 const [turns, setTurns] = useState([]);
 const [q, setQ] = useState("");
 const [busy, setBusy] = useState(false);
 const [booking, setBooking] = useState(false);
 const thread = useRef("");
 const input = useRef(null);
 const end = useRef(null);
 const path = usePathname();

 useEffect(() => {
  if (autoFocus) setTimeout(() => input.current?.focus(), 60);
 }, [autoFocus]);
 useEffect(() => {
  if (compact) end.current?.scrollIntoView({ block: "end" });
 }, [turns, compact, booking]);

 const ask = useCallback(
  async (question) => {
   const text = (question ?? "").trim();
   if (text.length < 2 || busy) return;
   if (!thread.current) thread.current = rid();
   const history = turns.filter((t) => t.a && !t.error).map((t) => ({ q: t.q, a: t.a }));
   setQ("");
   setBusy(true);
   setBooking(false);
   setTurns((ts) => [...ts, { q: text, a: "", typing: true }]);
   play("pop");
   track("ask");
   onAsked?.();
   const patch = (f) => setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...f(t) } : t)));
   try {
    const d = await streamAsk({ q: text, sid: store("sid"), ref: store("ref"), page: path, thread: thread.current, history }, (delta) => patch((t) => ({ a: t.a + delta })));
    patch(() => ({ a: d.answer, sources: d.sources, next: d.next, actions: d.actions, typing: false }));
    play("chime");
   } catch (e) {
    patch(() => ({ error: cap(e.message), typing: false }));
   } finally {
    setBusy(false);
    setTimeout(() => input.current?.focus({ preventScroll: true }), 30);
   }
  },
  [busy, turns, path, onAsked]
 );

 // questions from the command menu
 useEffect(() => {
  if (!listen) return;
  const f = (e) => ask(String(e.detail || "").slice(0, 300));
  window.addEventListener("ask-run", f);
  return () => window.removeEventListener("ask-run", f);
 }, [ask, listen]);

 const last = turns[turns.length - 1];
 return (
  <div className={compact ? "flex min-h-0 flex-1 flex-col" : ""}>
   <div className={compact ? "min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4" : "space-y-5"}>
    {turns.length === 0 && (
     <div>
      {compact && <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Ask anything about my work. Answers come only from what I have written here, with links.</p>}
      <div className="flex flex-wrap gap-2">
       {SUGGEST.map((s) => (
        <button key={s} type="button" onClick={() => ask(s)} className="rounded-lg border border-black/10 px-2.5 py-1 text-left text-sm text-zinc-600 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/[6%]">
         {s}
        </button>
       ))}
      </div>
     </div>
    )}
    {turns.map((t, i) => (
     <div key={i} className="space-y-2">
      <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">{t.q}</p>
      {(t.a || t.typing) && (
       <div className="flex items-start gap-2.5">
        <Me />
        <div className="min-w-0 flex-1 pt-0.5">
         {t.typing && !t.a && (
          <div className="flex gap-1 py-2" aria-label="Thinking">
           {[0, 1, 2].map((k) => (
            <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${k * 120}ms` }} />
           ))}
          </div>
         )}
         {t.a && <Answer text={t.a} sources={t.sources} typing={t.typing} />}
        </div>
       </div>
      )}
      {t.error && <p className="text-sm text-red-600 dark:text-red-400">{t.error}</p>}
      {t.sources?.length > 0 && (
       <ul className="ml-[38px] space-y-0.5 border-l border-black/10 pl-3 dark:border-white/10">
        {t.sources.map((s) => (
         <li key={s.n} className="text-[13px]">
          <span className="mr-1.5 text-[11px] font-semibold text-[#1491ff] dark:text-[#64acff]">{s.n}</span>
          <Link href={s.href} className="text-zinc-600 underline decoration-black/20 underline-offset-4 dark:text-white/60 dark:decoration-white/25">
           {s.title}
          </Link>
         </li>
        ))}
       </ul>
      )}
      {t.actions?.length > 0 && (
       <div className="ml-[38px] flex flex-wrap gap-2 pt-1">
        {t.actions.map((a) =>
         a.type === "book" ? (
          <button key="book" type="button" onClick={() => setBooking((v) => !v)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
           {booking && i === turns.length - 1 ? "Hide times" : a.label}
          </button>
         ) : a.type === "open" ? (
          <Link key={a.href} href={a.href} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-800 hover:bg-black/5 dark:border-white/[15%] dark:text-white dark:hover:bg-white/[6%]">
           {a.label}
          </Link>
         ) : (
          <a key={a.type} href={a.href} target={a.type === "cv" ? "_blank" : undefined} rel="noopener" className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-zinc-800 hover:bg-black/5 dark:border-white/[15%] dark:text-white dark:hover:bg-white/[6%]">
           {a.label}
          </a>
         )
        )}
       </div>
      )}
      {booking && i === turns.length - 1 && (
       <div className="ml-[38px] pt-2">
        <BookCall />
       </div>
      )}
     </div>
    ))}
    {last?.next?.length > 0 && !busy && (
     <div className="flex flex-wrap gap-2">
      {last.next.map((s) => (
       <button key={s} type="button" onClick={() => ask(s)} className="rounded-lg border border-dashed border-black/15 px-2.5 py-1 text-left text-sm text-zinc-600 hover:bg-black/5 dark:border-white/[15%] dark:text-white/60 dark:hover:bg-white/[6%]">
        {s}
       </button>
      ))}
     </div>
    )}
    <div ref={end} />
   </div>
   <form
    onSubmit={(e) => {
     e.preventDefault();
     ask(q);
    }}
    className={`flex gap-2 ${compact ? "border-t border-black/10 p-3 dark:border-white/10" : "mt-5"}`}
   >
    <input
     ref={input}
     value={q}
     onChange={(e) => setQ(e.target.value)}
     maxLength={300}
     placeholder={turns.length ? "Ask a follow-up" : "Ask anything about my work"}
     aria-label="Ask a question about my work"
     className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[16px] text-zinc-800 outline-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:bg-[#1d1d1f] dark:text-white dark:focus:border-white/30 md:text-[15px]"
    />
    <button type="submit" disabled={busy || q.trim().length < 2} className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900">
     {busy ? "..." : "Ask"}
    </button>
   </form>
   {turns.length > 0 && !busy && (
    <button
     type="button"
     onClick={() => {
      setTurns([]);
      thread.current = "";
      setBooking(false);
     }}
     className={`text-xs text-zinc-500 underline underline-offset-4 dark:text-white/40 ${compact ? "mb-3 ml-3 self-start" : "mt-3"}`}
    >
     New chat
    </button>
   )}
  </div>
 );
}
