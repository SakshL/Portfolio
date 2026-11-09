"use client";

import { useEffect, useState } from "react";
import { track } from "components/elements/client/Analytics";

export function Subscribe({ compact = false }) {
 const [email, setEmail] = useState("");
 const [website, setWebsite] = useState("");
 const [token, setToken] = useState("");
 const [state, setState] = useState("idle"); // idle | busy | done | error
 const [msg, setMsg] = useState("");

 useEffect(() => {
  fetch("/v1/contact/token")
   .then((r) => r.json())
   .then((d) => setToken(d.t || ""))
   .catch(() => {});
 }, []);

 const submit = async (e) => {
  e.preventDefault();
  setState("busy");
  try {
   let ref = "";
   try {
    ref = sessionStorage.getItem("ref") || "";
   } catch {}
   const r = await fetch("/v1/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website, t: token, ref }) });
   const d = await r.json().catch(() => ({}));
   if (!r.ok) throw new Error(d.error || "Something went wrong");
   track("subscribe");
   setState("done");
  } catch (e2) {
   setMsg(e2.message.charAt(0).toUpperCase() + e2.message.slice(1));
   setState("error");
  }
 };

 return (
  <div className={`not-prose rounded-xl border bg-zinc-200/[25%] dark:border-neutral-800 dark:bg-[#161617] ${compact ? "p-4" : "p-5"}`}>
   <p className="font-semibold text-zinc-800 dark:text-white">Get new posts by email</p>
   <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">One email when something new goes up. No tracking pixels, unsubscribe in one click.</p>
   {state === "done" ? (
    <p className="mt-3 text-sm text-zinc-800 dark:text-white">Check your inbox and click the link to confirm.</p>
   ) : (
    <form onSubmit={submit} className="mt-3 flex gap-2">
     <input type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Email address" className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-[16px] text-zinc-800 outline-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:bg-[#1d1d1f] dark:text-white dark:focus:border-white/30 md:text-[15px]" />
     <input tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
     <button type="submit" disabled={state === "busy"} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white duration-200 disabled:opacity-50 dark:bg-white dark:text-zinc-900">
      Subscribe
     </button>
    </form>
   )}
   {state === "error" && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{msg}</p>}
  </div>
 );
}
