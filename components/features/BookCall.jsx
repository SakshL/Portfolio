"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "components/elements/client/Analytics";

const field = "w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[16px] text-zinc-800 outline-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:bg-[#1d1d1f] dark:text-white dark:focus:border-white/30 md:text-[15px]";

function ref() {
 try {
  return sessionStorage.getItem("ref") || "";
 } catch {
  return "";
 }
}

export function BookCall() {
 const [data, setData] = useState(null);
 const [err, setErr] = useState("");
 const [day, setDay] = useState("");
 const [pick, setPick] = useState("");
 const [form, setForm] = useState({ name: "", email: "", company: "", note: "", website: "" });
 const [token, setToken] = useState("");
 const [busy, setBusy] = useState(false);
 const [done, setDone] = useState(false);
 const tz = useMemo(() => {
  try {
   return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
   return "UTC";
  }
 }, []);

 const load = () =>
  fetch("/v1/book/slots")
   .then((r) => (r.ok ? r.json() : Promise.reject()))
   .then(setData)
   .catch(() => setErr("Booking is not open right now. Email hello@example.com instead."));

 useEffect(() => {
  load();
  fetch("/v1/contact/token")
   .then((r) => r.json())
   .then((d) => setToken(d.t || ""))
   .catch(() => {});
 }, []);

 const days = useMemo(() => {
  const out = {};
  for (const s of data?.slots || []) {
   const d = new Date(s);
   const k = d.toLocaleDateString("en-CA", { timeZone: tz });
   (out[k] ||= { label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }), slots: [] }).slots.push(s);
  }
  return out;
 }, [data, tz]);
 const dayKeys = Object.keys(days);
 const curDay = day && days[day] ? day : dayKeys[0];
 const time = (s) => new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
 const nepal = (s) => new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" });

 const submit = async (e) => {
  e.preventDefault();
  setBusy(true);
  setErr("");
  try {
   const r = await fetch("/v1/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, start: pick, tz, t: token, ref: ref() }) });
   const d = await r.json().catch(() => ({}));
   if (!r.ok) {
    if (r.status === 409) {
     setPick("");
     load();
    }
    throw new Error(d.error || "Something went wrong, please try again.");
   }
   track("book_call");
   setDone(true);
  } catch (e2) {
   setErr(e2.message.charAt(0).toUpperCase() + e2.message.slice(1));
  } finally {
   setBusy(false);
  }
 };

 if (done) {
  return (
   <div className="rounded-xl border bg-zinc-200/[25%] p-6 dark:border-neutral-800 dark:bg-[#161617]">
    <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">Request sent</h2>
    <p className="mt-2 text-slate-600 dark:text-slate-400">
     You asked for {new Date(pick).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz })} your time. I will confirm by email with a meeting link and a calendar invite.
    </p>
   </div>
  );
 }

 return (
  <div className="rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617] md:p-6">
   {!data && !err && <div className="h-40 animate-pulse rounded-lg bg-black/[5%] dark:bg-white/[5%]" aria-label="Loading" />}
   {data && dayKeys.length === 0 && <p className="text-slate-600 dark:text-slate-400">No open times in the next two weeks. Email hello@example.com and we will find one.</p>}
   {data && dayKeys.length > 0 && (
    <>
     <p className="text-sm text-zinc-500 dark:text-white/50">
      {data.minutes} minute video call. Times shown in your time zone ({tz}).
     </p>
     <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Day">
      {dayKeys.map((k) => (
       <button key={k} type="button" role="tab" aria-selected={k === curDay} onClick={() => (setDay(k), setPick(""))} className={`shrink-0 rounded-lg border px-3 py-2 text-sm duration-200 ${k === curDay ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-black/10 text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[6%]"}`}>
        {days[k].label}
       </button>
      ))}
     </div>
     <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {days[curDay].slots.map((s) => (
       <button key={s} type="button" onClick={() => setPick(s)} title={`${nepal(s)} in Nepal`} className={`rounded-lg border px-2 py-2 text-sm duration-200 ${s === pick ? "border-[#1491ff] bg-[#1491ff]/10 font-semibold text-zinc-900 dark:border-[#64acff] dark:bg-[#64acff]/15 dark:text-white" : "border-black/10 text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/[6%]"}`}>
        {time(s)}
       </button>
      ))}
     </div>
    </>
   )}
   {pick && (
    <form onSubmit={submit} className="mt-6 grid gap-3 border-t border-black/10 pt-5 dark:border-white/10 sm:grid-cols-2">
     <p className="text-sm text-zinc-600 dark:text-white/60 sm:col-span-2">
      {new Date(pick).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz })} your time ({nepal(pick)} in Nepal)
     </p>
     <input required maxLength={80} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} aria-label="Your name" />
     <input required type="email" maxLength={200} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} aria-label="Email" />
     <input maxLength={100} placeholder="Company (optional)" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`${field} sm:col-span-2`} aria-label="Company" />
     <textarea maxLength={1000} rows={3} placeholder="What would you like to talk about? (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${field} sm:col-span-2`} aria-label="Note" />
     <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" name="website" />
     <div className="flex items-center gap-3 sm:col-span-2">
      <button type="submit" disabled={busy} className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white duration-200 disabled:opacity-50 dark:bg-white dark:text-zinc-900">
       {busy ? "Sending" : "Request this time"}
      </button>
      <span className="text-xs text-zinc-500 dark:text-white/40">I confirm every call by email.</span>
     </div>
    </form>
   )}
   {err && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{err}</p>}
  </div>
 );
}
