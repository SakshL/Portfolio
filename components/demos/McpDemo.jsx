"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, DemoFrame, useReducedMotion } from "components/demos/Frame";

// Ordering through Claude, replayed step by step with the connector's real tool names, then a few ways a
// confident model could get it wrong, and what the server answers each time.

const SCRIPT = [
 { who: "user", text: "Find me momo nearby and send it home." },
 { who: "tool", name: "list_my_addresses", args: {}, result: { addresses: [{ id: 7, address_type: "home", address: "Sample Tole, ward 4" }] } },
 { who: "tool", name: "find_restaurants", args: { query: "momo", address_id: 7, open_only: true }, result: { stores: [{ id: 12, name: "Sample Momo House", open: true, delivery_time: "30-40 min" }] } },
 { who: "tool", name: "get_menu", args: { store_id: 12, search: "momo" }, result: { products: [{ id: 301, name: "Chicken momo, steamed", price: 180 }] } },
 { who: "tool", name: "add_to_cart", args: { item_id: 301, quantity: 2 }, result: { added: true, cart_lines: 1 } },
 { who: "tool", name: "checkout_preview", args: { address_id: 7 }, result: { total: 410, breakdown: { items_subtotal: 360, delivery_charge: 50 }, delivery_time: "30-40 min" }, note: "Priced by Acme's own quote endpoint, the same one checkout uses." },
 { who: "claude", text: "2 chicken momo from Sample Momo House to your home. Total Rs 410 with delivery, cash on delivery, about 30 to 40 minutes. Shall I place it?" },
 { who: "user", text: "Yes, place it." },
 { who: "tool", name: "place_order", args: { address_id: 7, payment_method: "cash_on_delivery", expected_total: 410, customer_confirmed: true }, result: { placed: true, order_id: "100245", total: 410, payment_method: "Cash on delivery" }, note: "The server prices the cart again before placing. It still says 410, so the order goes through." },
 { who: "claude", text: "Placed. Order 100245 should reach you in about 30 to 40 minutes." },
];

const TRICKS = [
 {
  key: "price",
  label: "Model invents a price",
  call: { name: "add_to_cart", args: { item_id: 301, quantity: 2, price: 100 } },
  error: 'Invalid arguments: json: unknown field "price"',
  why: "There is no price field to send. The decoder refuses unknown fields, so a made-up argument is an error, never a silent default.",
 },
 {
  key: "total",
  label: "Model sends an old total",
  call: { name: "place_order", args: { address_id: 7, payment_method: "cash_on_delivery", expected_total: 360, customer_confirmed: true } },
  error: "The total is now Rs 410.00, not what the customer confirmed. Show them the new checkout_preview and ask again. Nothing was placed.",
  why: "The server prices the cart again at the moment of placing. A total the customer did not see can never be charged.",
 },
 {
  key: "confirm",
  label: "Model skips the confirmation",
  call: { name: "place_order", args: { address_id: 7, payment_method: "cash_on_delivery", expected_total: 410, customer_confirmed: false } },
  error: "Ask the customer to confirm the order first, then call again with customer_confirmed true.",
  why: "The schema only allows true, so the model has to state, in a field a reviewer can see, that the customer said yes.",
 },
 {
  key: "retry",
  label: "Model retries after a timeout",
  call: { name: "place_order", args: { address_id: 7, payment_method: "cash_on_delivery", expected_total: 410, customer_confirmed: true } },
  ok: { placed: true, order_id: "100245", total: 410, payment_method: "Cash on delivery" },
  why: "Same customer, same cart, same address, same time window: the same idempotency key. The original result comes back and no second order is placed.",
 },
];

const j = (v) => JSON.stringify(v);

export default function McpDemo() {
 const reduced = useReducedMotion();
 const [n, setN] = useState(1);
 const [auto, setAuto] = useState(false);
 const [tricks, setTricks] = useState([]);
 const box = useRef(null);
 const done = n >= SCRIPT.length;

 useEffect(() => {
  if (!auto || done) return setAuto(false);
  const t = setTimeout(() => setN((x) => x + 1), reduced ? 300 : 1100);
  return () => clearTimeout(t);
 }, [auto, n, done, reduced]);

 useEffect(() => {
  const el = box.current;
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
 }, [n, tricks, reduced]);

 const reset = () => {
  setN(1);
  setTricks([]);
  setAuto(false);
 };

 return (
  <DemoFrame
   title="Order through Claude"
   caption="The model only gets narrow tools. Prices and payment are always decided by the server."
   controls={
    <>
     <Btn primary onClick={() => (done ? reset() : setAuto((v) => !v))}>
      {done ? "Start over" : auto ? "Pause" : n > 1 ? "Play the rest" : "Play"}
     </Btn>
     {!done && (
      <Btn onClick={() => setN((x) => Math.min(SCRIPT.length, x + 1))} disabled={auto}>
       Next step
      </Btn>
     )}
    </>
   }
  >
   <div ref={box} className="max-h-[430px] space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-black/5 bg-white/60 p-2.5 dark:border-white/5 dark:bg-white/[3%]" aria-live="polite">
    {SCRIPT.slice(0, n).map((m, i) => (
     <Line key={i} m={m} fresh={i === n - 1 && !reduced} />
    ))}
    {tricks.map((t, i) => (
     <div key={t.key + i} className="space-y-1.5">
      <Tool name={t.call.name} args={t.call.args} tone={t.ok ? "ok" : "bad"} fresh={!reduced}>
       {t.ok ? (
        <Result ok text={j(t.ok)} />
       ) : (
        <p className="mt-1.5 rounded-md bg-red-500/10 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-red-700 dark:text-red-300">{t.error}</p>
       )}
       <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600 dark:text-white/60">{t.why}</p>
      </Tool>
     </div>
    ))}
   </div>

   <div className={`mt-3 duration-300 ${done ? "opacity-100" : "opacity-50"}`}>
    <p className="mb-1.5 text-[11px] font-semibold text-zinc-500 dark:text-white/40">{done ? "Now try to break it" : "After the order, try to break it"}</p>
    <div className="flex flex-wrap gap-1.5">
     {TRICKS.map((t) => (
      <Btn key={t.key} disabled={!done} onClick={() => setTricks((x) => [...x, t])}>
       {t.label}
      </Btn>
     ))}
    </div>
   </div>
  </DemoFrame>
 );
}

function Line({ m, fresh }) {
 const anim = fresh ? "animate-[demo-in_.35s_ease-out]" : "";
 if (m.who === "tool")
  return (
   <Tool name={m.name} args={m.args} fresh={fresh}>
    <Result text={j(m.result)} />
    {m.note && <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-white/[45%]">{m.note}</p>}
   </Tool>
  );
 const user = m.who === "user";
 return (
  <div className={`flex ${user ? "justify-end" : "justify-start"} ${anim}`}>
   <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${user ? "rounded-br-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "rounded-bl-md border border-black/5 bg-white text-zinc-800 dark:border-white/10 dark:bg-[#1d1d1f] dark:text-white/90"}`}>
    {!user && <span className="mb-0.5 block text-[10px] font-semibold text-[#d97757]">Claude</span>}
    {m.text}
   </div>
  </div>
 );
}

function Tool({ name, args, children, tone, fresh }) {
 return (
  <div className={`rounded-lg border px-2.5 py-2 ${fresh ? "animate-[demo-in_.35s_ease-out]" : ""} ${tone === "bad" ? "border-red-500/25 bg-red-500/[4%]" : tone === "ok" ? "border-emerald-500/25 bg-emerald-500/[4%]" : "border-black/5 bg-zinc-50 dark:border-white/5 dark:bg-black/20"}`}>
   <p className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[11px]">
    <span className="text-zinc-400 dark:text-white/[35%]">tool</span>
    <span className="font-semibold text-[#6310ff] dark:text-[#a2facf]">{name}</span>
    <span className="min-w-0 break-all text-zinc-600 dark:text-white/60">{j(args)}</span>
   </p>
   {children}
  </div>
 );
}

function Result({ text, ok }) {
 return (
  <p className={`mt-1 break-all font-mono text-[11px] leading-relaxed ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500 dark:text-white/[45%]"}`}>
   <span className="text-zinc-400 dark:text-white/30">→ </span>
   {text}
  </p>
 );
}
