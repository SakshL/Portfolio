"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, DemoFrame, Seg, useReducedMotion } from "components/demos/Frame";

// The replay checker, in miniature: for each historical order, build the plan in memory, compare every row it
// would write with what the legacy code actually wrote, and flag the one that does not add up.

const m = (n) => n.toFixed(2);

const ORDERS = [
 { id: "A-101", type: "Cash", status: "Delivered", paid: 500, store: 425, rider: 50, company: 25, cash: true },
 { id: "A-102", type: "QR", status: "Delivered", paid: 640, store: 544, rider: 60, company: 36 },
 { id: "A-103", type: "Wallet", status: "Delivered", paid: 320, store: 272, rider: 30, company: 18 },
 { id: "A-104", type: "Wallet + cash", status: "Cancelled", paid: 200, cancelled: true },
 { id: "A-105", type: "QR", status: "Delivered", paid: 380, store: 323, rider: 35, company: 22 },
 { id: "A-106", type: "Cash", status: "Delivered", paid: 410, store: 348.5, rider: 40, company: 21.5, cash: true },
];

function planFor(o) {
 if (o.cancelled)
  return [
   ["Load", "customer wallet"],
   ["Add", `wallet balance +${m(o.paid)} (refund of the wallet part)`],
   ["Insert", "wallet_transactions row: refund"],
   ["Save", "all rows"],
  ];
 const steps = [
  ["Load", "company wallet"],
  ["Load", "restaurant wallet"],
  ["Load", "rider wallet"],
  ["Add", `restaurant earned +${m(o.store)}`],
 ];
 if (o.cash) steps.push(["Add", `rider cash_held +${m(o.paid)}`]);
 steps.push(["Insert", "settlements row"], ["Save", "all rows"]);
 return steps;
}

function compareFor(o, fixed) {
 if (o.cancelled)
  return [
   ["refund row", fixed ? "refund 200.00" : "none", "refund 200.00"],
   ["wallet change", fixed ? "+200.00" : "+0.00", "+200.00"],
  ];
 const rows = [
  ["store_amount", m(o.store), m(o.store)],
  ["delivery_charge", m(o.rider), m(o.rider)],
  ["admin_commission", m(o.company), m(o.company)],
 ];
 if (o.cash) rows.push(["cash_in_hand", m(o.paid), m(o.paid)]);
 return rows;
}

export default function LedgerDemo() {
 const reduced = useReducedMotion();
 const [fixed, setFixed] = useState(false);
 const [cur, setCur] = useState(-1); // order being replayed
 const [shown, setShown] = useState(0); // plan steps revealed for the current order
 const [done, setDone] = useState({}); // id -> "ok" | "bad"
 const [running, setRunning] = useState(false);
 const [picked, setPicked] = useState(null);
 const timer = useRef(0);

 const verdict = (o) => (compareFor(o, fixed).every(([, a, b]) => a === b) ? "ok" : "bad");

 const replay = () => {
  clearTimeout(timer.current);
  setPicked(null);
  if (reduced) {
   setDone(Object.fromEntries(ORDERS.map((o) => [o.id, verdict(o)])));
   setCur(ORDERS.length - 1);
   setShown(99);
   setRunning(false);
   return;
  }
  setDone({});
  setCur(0);
  setShown(0);
  setRunning(true);
 };

 useEffect(() => {
  if (!running || cur < 0) return;
  const o = ORDERS[cur];
  const steps = planFor(o).length;
  if (shown < steps + 1) {
   timer.current = setTimeout(() => setShown((s) => s + 1), shown === steps ? 420 : 200);
  } else {
   timer.current = setTimeout(() => {
    setDone((d) => ({ ...d, [o.id]: verdict(o) }));
    if (cur < ORDERS.length - 1) {
     setCur((c) => c + 1);
     setShown(0);
    } else setRunning(false);
   }, 380);
  }
  return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [running, cur, shown]);

 useEffect(() => () => clearTimeout(timer.current), []);

 // changing the legacy code resets the run
 useEffect(() => {
  clearTimeout(timer.current);
  setRunning(false);
  setDone({});
  setCur(-1);
  setShown(0);
  setPicked(null);
 }, [fixed]);

 const finished = Object.keys(done).length === ORDERS.length && !running;
 const focus = picked !== null ? picked : cur;
 const o = focus >= 0 ? ORDERS[focus] : null;
 const steps = o ? planFor(o) : [];
 const revealAll = picked !== null || !running || focus !== cur;
 const vis = revealAll ? steps.length + 1 : shown;
 const bad = Object.values(done).filter((v) => v === "bad").length;
 const delivered = ORDERS.filter((x) => !x.cancelled);

 return (
  <DemoFrame
   title="Replay the money"
   caption="Each order is rebuilt as a plan in memory and compared with what the legacy code really wrote."
   controls={
    <>
     <Seg
      label="Legacy code"
      value={fixed ? "after" : "before"}
      onChange={(v) => setFixed(v === "after")}
      options={[
       ["before", "Before the fix"],
       ["after", "After the fix"],
      ]}
     />
     <Btn primary onClick={replay} disabled={running}>
      {running ? "Replaying..." : finished ? "Replay again" : "Replay history"}
     </Btn>
    </>
   }
  >
   <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    {/* orders */}
    <div className="overflow-hidden rounded-lg border border-black/5 bg-white/60 dark:border-white/5 dark:bg-white/[3%]">
     <div className="grid grid-cols-[4.2rem_1fr_auto] gap-2 border-b border-black/5 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 dark:border-white/5 dark:text-white/40">
      <span>Order</span>
      <span>Paid by</span>
      <span>Replay</span>
     </div>
     {ORDERS.map((x, i) => {
      const v = done[x.id];
      const active = running && i === cur;
      return (
       <button
        key={x.id}
        type="button"
        onClick={() => v && setPicked(i)}
        disabled={!v}
        className={`grid w-full grid-cols-[4.2rem_1fr_auto] items-center gap-2 border-b border-black/5 px-2.5 py-2 text-left text-xs last:border-0 duration-300 dark:border-white/5 ${
         v === "bad" ? "bg-red-500/10" : active ? "bg-[#1491ff]/[8%] dark:bg-[#64acff]/10" : focus === i && v ? "bg-black/[3%] dark:bg-white/[4%]" : ""
        } ${v ? "cursor-pointer hover:bg-black/[4%] dark:hover:bg-white/[5%]" : "cursor-default"}`}
       >
        <span className="font-mono font-semibold text-zinc-800 dark:text-white">{x.id}</span>
        <span className="min-w-0 truncate text-zinc-600 dark:text-white/60">
         {x.type} · {x.status}
        </span>
        <span className="text-[11px] font-semibold">
         {v === "ok" && <span className="text-emerald-600 dark:text-emerald-400">match</span>}
         {v === "bad" && <span className="text-red-600 dark:text-red-400">caught</span>}
         {!v && active && <span className="text-[#1477ff] dark:text-[#64acff]">checking</span>}
         {!v && !active && <span className="text-zinc-400 dark:text-white/25">waiting</span>}
        </span>
       </button>
      );
     })}
    </div>

    {/* plan and comparison for the focused order */}
    <div className="min-w-0 rounded-lg border border-black/5 bg-white/60 p-2.5 dark:border-white/5 dark:bg-white/[3%]">
     {!o ? (
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-1 text-center">
       <p className="text-sm font-semibold text-zinc-800 dark:text-white">Press Replay history</p>
       <p className="max-w-[260px] text-xs text-zinc-500 dark:text-white/[45%]">The checker uses a read-only database user. It rebuilds each order and compares row by row.</p>
      </div>
     ) : (
      <>
       <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/40">
        Plan for <span className="font-mono text-zinc-800 dark:text-white">{o.id}</span>, built in memory
       </p>
       <ol className="mt-1.5 space-y-0.5">
        {steps.map(([verb, what], j) => (
         <li key={j} className={`flex gap-2 font-mono text-[11px] duration-200 ${j < vis ? "opacity-100" : "opacity-0"}`}>
          <span className="w-10 shrink-0 text-[#6310ff] dark:text-[#a2facf]">{verb}</span>
          <span className="min-w-0 break-words text-zinc-700 dark:text-white/75">{what}</span>
         </li>
        ))}
       </ol>
       <div className={`mt-2.5 duration-300 ${vis > steps.length ? "opacity-100" : "opacity-0"}`}>
        <div className="grid grid-cols-[minmax(0,1.3fr)_1fr_1fr_1rem] gap-x-2 border-t border-black/5 pt-2 text-[10px] font-semibold text-zinc-500 dark:border-white/5 dark:text-white/40">
         <span>Column</span>
         <span>Stored</span>
         <span>Replayed</span>
         <span />
        </div>
        {compareFor(o, fixed).map(([col, a, b]) => (
         <div key={col} className={`grid grid-cols-[minmax(0,1.3fr)_1fr_1fr_1rem] items-center gap-x-2 py-0.5 font-mono text-[11px] ${a === b ? "text-zinc-700 dark:text-white/75" : "text-red-600 dark:text-red-400"}`}>
          <span className="truncate">{col}</span>
          <span>{a}</span>
          <span>{b}</span>
          <span aria-label={a === b ? "match" : "mismatch"}>{a === b ? "✓" : "✗"}</span>
         </div>
        ))}
        {o.cancelled && !fixed && (
         <p className="mt-2 rounded-md bg-red-500/10 px-2.5 py-2 text-xs leading-relaxed text-red-700 dark:text-red-300">
          <b>Caught: wallet not refunded on cancel.</b> This order was paid partly from the wallet and then cancelled. The legacy code never gave the wallet part back. The fix went into Laravel first, then Go matched it.
         </p>
        )}
        {!o.cancelled && (
         <p className="mt-2 text-[11px] text-zinc-500 dark:text-white/[45%]">
          Paid {m(o.paid)} = restaurant {m(o.store)} + rider {m(o.rider)} + company {m(o.company)}
         </p>
        )}
       </div>
      </>
     )}
    </div>
   </div>

   {/* summary checks */}
   <div className={`mt-3 grid gap-2 duration-300 sm:grid-cols-3 ${finished ? "opacity-100" : "pointer-events-none opacity-40"}`}>
    <Check ok={finished && bad === 0} warn={finished && bad > 0} label="Plans match stored rows" value={finished ? `${ORDERS.length - bad} of ${ORDERS.length} orders` : "not run yet"} />
    <Check ok={finished} label="Money in equals money out" value={finished ? `${delivered.length} of ${delivered.length} delivered orders` : "not run yet"} />
    <Check ok={finished} label="Wallet balance chain" value={finished ? "each row = previous + credits minus debits" : "not run yet"} />
   </div>
  </DemoFrame>
 );
}

function Check({ ok, warn, label, value }) {
 return (
  <div className={`rounded-lg border px-2.5 py-2 ${warn ? "border-red-500/30 bg-red-500/[6%]" : "border-black/5 bg-white/60 dark:border-white/5 dark:bg-white/[3%]"}`}>
   <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-white">
    <span className={warn ? "text-red-600 dark:text-red-400" : ok ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>{warn ? "✗" : ok ? "✓" : "·"}</span>
    {label}
   </p>
   <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-white/[45%]">{value}</p>
  </div>
 );
}
