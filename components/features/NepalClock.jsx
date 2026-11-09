"use client";

import { useEffect, useState } from "react";

// "It's 9:40 PM in Nepal. I'm probably shipping something." Also tints the hero by time of day in Nepal.
function nepal() {
 const d = new Date();
 const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit", hour12: false }).formatToParts(d).map((p) => [p.type, p.value]));
 const h = Number(parts.hour) % 24;
 const m = h * 60 + Number(parts.minute);
 const time = d.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit", hour12: true });
 // a real day: dal bhat in the morning and the evening
 const day = [
  [60, "I'm probably still coding.", "night"],
  [5 * 60, "I'm probably asleep.", "night"],
  [7 * 60, "I'm probably just waking up.", "dawn"],
  [9 * 60, "I'm probably reading through last night's messages.", "day"],
  [10 * 60 + 30, "I'm probably having dal bhat.", "day"],
  [13 * 60, "I'm probably shipping something.", "day"],
  [14 * 60, "I'm probably fixing a bug someone just found.", "day"],
  [17 * 60 + 30, "I'm probably deep in code.", "day"],
  [19 * 60 + 30, "I'm probably watching the dinner rush on Acme.", "evening"],
  [20 * 60 + 30, "I'm probably having dinner.", "evening"],
  [23 * 60, "I'm probably shipping something.", "evening"],
  [24 * 60, "I'm probably still coding.", "night"],
 ];
 const [, line, part] = day.find(([until]) => m < until);
 return { time, line, part };
}

export function NepalClock({ labels = null }) {
 const [s, setS] = useState(null);
 useEffect(() => {
  const tick = () => {
   const v = nepal();
   setS(v);
   document.documentElement.setAttribute("data-daypart", v.part);
  };
  tick();
  const t = setInterval(tick, 15000);
  return () => clearInterval(t);
 }, []);
 return (
  <p className="mt-4 flex min-h-[24px] items-center gap-2 text-sm text-zinc-600 dark:text-white/60" data-xray="Nepal time, computed in your browser" suppressHydrationWarning>
   {s && (
    <>
     <span aria-hidden="true" className="text-base leading-none">
      {s.part === "night" ? "☾" : s.part === "evening" ? "◐" : "☀"}
     </span>
     <span>
      {labels ? (
       <>
        {(labels["It's {time} in Nepal."] || "It's {time} in Nepal.").split("{time}").map((part, i) => (i === 0 ? part : [<span key={i} className="font-semibold text-zinc-800 tabular-nums dark:text-white">{s.time}</span>, part]))} {labels[s.line] || s.line}
       </>
      ) : (
       <>
        It&apos;s <span className="font-semibold text-zinc-800 tabular-nums dark:text-white">{s.time}</span> in Nepal. {s.line}
       </>
      )}
     </span>
    </>
   )}
  </p>
 );
}
