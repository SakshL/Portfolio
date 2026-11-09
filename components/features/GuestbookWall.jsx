"use client";

import { play } from "lib/sound";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// The guestbook as a wall of sticky notes. Drag them around; where they land is saved for this viewer only.
const VIEW_KEY = "guestbook-view";
const POS_KEY = "guestbook-wall";
const STEP = 16;
const PAPER = ["bg-[#f4ecd4] dark:bg-[#2a271d]", "bg-[#e3ecdc] dark:bg-[#1f2820]", "bg-[#dfe7ef] dark:bg-[#1d2430]", "bg-[#efe1e1] dark:bg-[#2c2023]", "bg-[#e9e5f0] dark:bg-[#24212d]"];
const KEYS = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] };

const load = (k, fallback) => {
 try {
  const v = localStorage.getItem(k);
  return v ? JSON.parse(v) : fallback;
 } catch {
  return fallback;
 }
};
const store = (k, v) => {
 try {
  localStorage.setItem(k, JSON.stringify(v));
 } catch {
  // storage blocked, the choice just lasts for this visit
 }
};
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

// a small stable random stream per note id, so rotation and colour never jump between visits
function seeded(id) {
 let h = 2166136261;
 for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
 return () => {
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
 };
}

export function GuestbookViews({ notes, children }) {
 const [view, setView] = useState("list");
 useEffect(() => {
  if (load(VIEW_KEY, "list") === "wall") setView("wall");
 }, []);
 const pick = (v) => {
  setView(v);
  store(VIEW_KEY, v);
 };
 return (
  <div className="mt-10">
   <div role="group" aria-label="View" className="inline-flex rounded-lg border border-black/10 p-0.5 text-sm dark:border-neutral-800">
    {["list", "wall"].map((v) => (
     <button key={v} type="button" aria-pressed={view === v} onClick={() => pick(v)} className={`rounded-md px-3 py-1 duration-200 motion-reduce:transition-none ${view === v ? "bg-black/[6%] font-semibold text-zinc-800 dark:bg-white/10 dark:text-white" : "text-slate-600 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-white"}`}>
      {v === "list" ? "List" : "Wall"}
     </button>
    ))}
   </div>
   {view === "wall" ? <GuestbookWall notes={notes} /> : children}
  </div>
 );
}

export function GuestbookWall({ notes }) {
 const board = useRef(null);
 const drag = useRef(null);
 const moved = useRef(false);
 const [dim, setDim] = useState(null);
 const [saved, setSaved] = useState({});
 const [order, setOrder] = useState([]);
 const [live, setLive] = useState(null);
 const [still, setStill] = useState(false);

 useEffect(() => {
  setSaved(load(POS_KEY, {}) || {});
  setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const el = board.current;
  if (!el) return;
  const fit = () => setDim({ w: el.clientWidth, h: el.clientHeight, s: el.clientWidth < 480 ? 140 : 168 });
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  return () => ro.disconnect();
 }, []);

 const looks = useMemo(
  () =>
   notes.map((n) => {
    const r = seeded(n.id);
    return { rot: r() * 6 - 3, paper: PAPER[Math.floor(r() * PAPER.length)], jx: r() * 2 - 1, jy: r() * 2 - 1 };
   }),
  [notes]
 );

 const cols = dim ? Math.max(1, Math.floor(dim.w / (dim.s + 16))) : 1;
 const minH = dim ? Math.ceil(notes.length / cols) * (dim.s + 28) + 40 : 0;

 // the tidy spot for note i, in px
 const tidy = (i) => {
  const cw = dim.w / cols;
  const x = (i % cols) * cw + (cw - dim.s) / 2 + looks[i].jx * 10;
  const y = 20 + Math.floor(i / cols) * (dim.s + 28) + looks[i].jy * 8;
  return [clamp(x, 0, dim.w - dim.s), clamp(y, 0, dim.h - dim.s)];
 };
 // saved spots are fractions of the free space, so they survive a resize
 const spot = (n, i) => {
  const f = saved[n.id];
  if (!f) return tidy(i);
  return [f[0] * Math.max(0, dim.w - dim.s), f[1] * Math.max(0, dim.h - dim.s)];
 };

 const raise = useCallback((id) => setOrder((o) => [...o.filter((v) => v !== id), id]), []);

 const place = (id, x, y) => {
  const f = [clamp(x, 0, dim.w - dim.s) / Math.max(1, dim.w - dim.s), clamp(y, 0, dim.h - dim.s) / Math.max(1, dim.h - dim.s)];
  setSaved((cur) => {
   const next = { ...cur, [id]: f };
   store(POS_KEY, next);
   return next;
  });
 };

 const down = (e, id, x, y) => {
  if (e.button > 0) return;
  drag.current = { id, sx: e.clientX, sy: e.clientY, x0: x, y0: y, pid: e.pointerId, on: false };
 };
 const at = (g, e) => [clamp(g.x0 + e.clientX - g.sx, 0, dim.w - dim.s), clamp(g.y0 + e.clientY - g.sy, 0, dim.h - dim.s)];
 const move = (e) => {
  const g = drag.current;
  if (!g || e.pointerId !== g.pid) return;
  if (!g.on) {
   if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 4) return;
   g.on = true;
   e.currentTarget.setPointerCapture?.(e.pointerId);
   raise(g.id);
  }
  const [x, y] = at(g, e);
  setLive({ id: g.id, x, y });
 };
 const up = (e) => {
  const g = drag.current;
  drag.current = null;
  if (!g || !g.on) return;
  moved.current = true; // swallow the click that follows a drag
  setTimeout(() => (moved.current = false), 0);
  const [x, y] = at(g, e);
  place(g.id, x, y);
  setLive(null);
  play("pop");
 };
 const nudge = (e, id, x, y) => {
  const k = KEYS[e.key];
  if (!k) return;
  e.preventDefault();
  raise(id);
  place(id, x + k[0], y + k[1]);
 };
 const tidyUp = () => {
  setSaved({});
  setOrder([]);
  store(POS_KEY, {});
 };

 return (
  <div className="mt-6">
   <div className="mb-3 flex items-center justify-between gap-3">
    <p className="text-xs text-slate-600 dark:text-slate-400">Drag the notes around. Only you see where they land.</p>
    <button type="button" onClick={tidyUp} className="shrink-0 rounded-lg border border-black/10 px-3 py-1 text-sm text-zinc-800 duration-200 hover:bg-black/5 motion-reduce:transition-none dark:border-neutral-800 dark:text-white dark:hover:bg-white/10">
     Tidy up
    </button>
   </div>
   <div ref={board} className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-200/[25%] dark:border-neutral-800 dark:bg-[#161617] max-sm:h-[110vh]" style={minH > 420 ? { minHeight: minH } : undefined}>
    {notes.length === 0 && <p className="p-5 text-sm text-zinc-500 dark:text-white/40">No notes yet. Be the first.</p>}
    {dim &&
     notes.map((n, i) => {
      const lifted = live?.id === n.id;
      const [x, y] = lifted ? [live.x, live.y] : spot(n, i);
      const L = looks[i];
      return (
       <div
        key={n.id}
        tabIndex={0}
        role="group"
        aria-roledescription="sticky note"
        aria-label={`Note from @${n.login}. Arrow keys move it.`}
        onPointerDown={(e) => down(e, n.id, x, y)}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
         if (moved.current) {
          e.preventDefault();
          e.stopPropagation();
         }
        }}
        onKeyDown={(e) => nudge(e, n.id, x, y)}
        className={`absolute flex touch-none select-none flex-col overflow-hidden rounded-md border p-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 dark:focus-visible:ring-white ${L.paper} ${lifted ? "cursor-grabbing border-black/25 dark:border-white/25" : "cursor-grab border-black/10 duration-200 motion-reduce:transition-none dark:border-white/10"}`}
        style={{ width: dim.s, height: dim.s, left: x, top: y, zIndex: lifted ? 999 : order.indexOf(n.id) + 2, transform: `rotate(${lifted ? 0 : L.rot}deg) scale(${lifted && !still ? 1.05 : 1})` }}
       >
        <div className="flex min-w-0 items-center gap-1.5">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         {n.avatar ? <img src={n.avatar + (n.avatar.includes("?") ? "&" : "?") + "s=64"} alt="" width={20} height={20} loading="lazy" draggable={false} className="h-5 w-5 shrink-0 rounded-full" /> : <span className="h-5 w-5 shrink-0 rounded-full bg-black/10 dark:bg-white/10" />}
         <a href={`https://github.com/${n.login}`} target="_blank" rel="noopener nofollow" draggable={false} className="truncate text-xs font-semibold text-zinc-800 dark:text-white">
          @{n.login}
         </a>
        </div>
        <p className="mt-2 line-clamp-5 break-words text-[13px] leading-snug text-zinc-700 dark:text-white/80 max-sm:line-clamp-4">{n.message}</p>
        <p className="mt-auto pt-1 text-[11px] text-zinc-500 dark:text-white/40">{n.date}</p>
       </div>
      );
     })}
   </div>
  </div>
 );
}
