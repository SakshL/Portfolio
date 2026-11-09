"use client";

import { useEffect, useState } from "react";

// "I overlap 5h with London": the owner's working hours (Nepal time, UTC+5:45) against a 9 to 6 workday elsewhere.
const NPT = 345;
const CITIES = [
 ["San Francisco", "America/Los_Angeles"],
 ["New York", "America/New_York"],
 ["London", "Europe/London"],
 ["Berlin", "Europe/Berlin"],
 ["Dubai", "Asia/Dubai"],
 ["Singapore", "Asia/Singapore"],
 ["Sydney", "Australia/Sydney"],
];

function offsetMin(tz) {
 try {
  const d = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(d).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  return Math.round((asUTC - d.getTime()) / 60000);
 } catch {
  return 0;
 }
}

const toMin = (hm) => {
 const [h, m] = String(hm || "").split(":").map(Number);
 return (h || 0) * 60 + (m || 0);
};

// minutes shared between my window and their 9:00 to 18:00, both in UTC, wrapping around midnight
function overlap(mine, theirs) {
 let n = 0;
 for (const k of [-1440, 0, 1440]) n += Math.max(0, Math.min(mine[1], theirs[1] + k) - Math.max(mine[0], theirs[0] + k));
 return n;
}

const clock = (min) => {
 const m = ((Math.round(min) % 1440) + 1440) % 1440;
 const h = Math.floor(m / 60);
 return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const hours = (min) => (min <= 0 ? "none" : `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ""}`);

export function TimeOverlap({ start = "10:00", end = "20:00", replyTime = "", compact = false, labels = null }) {
 const t = (k, vars) => {
  let out = (labels && labels[k]) || k;
  if (vars) for (const [a, b] of Object.entries(vars)) out = out.replace(`{${a}}`, b);
  return out;
 };
 const [rows, setRows] = useState(null);
 const [you, setYou] = useState(null);
 useEffect(() => {
  let s = toMin(start) - NPT;
  let e = toMin(end) - NPT;
  if (e <= s) e += 1440;
  const mine = [s, e];
  const work = (off) => [9 * 60 - off, 18 * 60 - off];
  setRows(CITIES.map(([name, tz]) => ({ name, mins: overlap(mine, work(offsetMin(tz))) })));
  try {
   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
   if (tz && tz !== "Asia/Kathmandu" && tz !== "Asia/Katmandu") {
    const off = offsetMin(tz);
    setYou({ city: tz.split("/").pop().replace(/_/g, " "), from: clock(s + off), to: clock(e + off), mins: overlap(mine, work(off)) });
   }
  } catch {}
 }, [start, end]);

 return (
  <div className="rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]">
   <p className="font-semibold text-zinc-800 dark:text-white">{t("Working hours")}</p>
   <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
    {t("{from} to {to} Nepal time (UTC+5:45).", { from: clock(toMin(start)), to: clock(toMin(end)) })}
    {you ? " " + (you.mins > 0 ? t("That is {from} to {to} in {city}, {hours} of your workday.", { from: you.from, to: you.to, city: you.city, hours: hours(you.mins) }) : t("That is {from} to {to} in {city}, outside a 9 to 6 workday there.", { from: you.from, to: you.to, city: you.city })) : ""}
    {replyTime ? " " + t("I usually reply {when}.", { when: replyTime }) : ""}
   </p>
   {!compact && (
    <ul className="mt-4 grid gap-2 text-sm">
     {(rows || CITIES.map(([name]) => ({ name, mins: null }))).map((r) => (
      <li key={r.name} className="grid grid-cols-[110px_1fr_64px] items-center gap-3">
       <span className="text-zinc-700 dark:text-white/80">{r.name}</span>
       <span className="h-2 overflow-hidden rounded-full bg-black/[6%] dark:bg-white/[8%]">
        <span className="block h-full rounded-full bg-zinc-800 transition-[width] duration-700 dark:bg-white/80" style={{ width: r.mins == null ? 0 : `${Math.min(100, (r.mins / 540) * 100)}%` }} />
       </span>
       <span className="text-right tabular-nums text-slate-600 dark:text-slate-400">{r.mins == null ? "" : r.mins <= 0 ? t("none") : hours(r.mins)}</span>
      </li>
     ))}
    </ul>
   )}
   {!compact && <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">{t("Overlap with a 9 to 6 workday in each city.")}</p>}
  </div>
 );
}
