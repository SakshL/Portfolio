"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function GuestbookSign({ open }) {
 const [me, setMe] = useState(undefined); // undefined = loading, null = signed out
 const [msg, setMsg] = useState("");
 const [state, setState] = useState("idle");
 const [err, setErr] = useState("");
 const router = useRouter();

 useEffect(() => {
  fetch("/v1/guestbook/me")
   .then((r) => (r.ok ? r.json() : null))
   .then(setMe)
   .catch(() => setMe(null));
  if (new URLSearchParams(location.search).get("error")) setErr("GitHub sign-in did not finish. Please try again.");
 }, []);

 if (!open) return <p className="text-sm text-zinc-500 dark:text-white/50">Signing is closed for now.</p>;
 if (me === undefined) return <div className="h-24 animate-pulse rounded-xl bg-black/[5%] dark:bg-white/[5%]" />;

 if (!me) {
  return (
   <div className="flex flex-wrap items-center gap-3">
    <a href="/v1/guestbook/login" className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white duration-200 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/85">
     <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
     </svg>
     Sign in with GitHub to sign
    </a>
    <span className="text-xs text-zinc-500 dark:text-white/40">Only your public name and avatar. No access to your repos.</span>
    {err && <p className="w-full text-sm text-red-600 dark:text-red-400">{err}</p>}
   </div>
  );
 }

 if (state === "done") return <p className="text-sm text-zinc-800 dark:text-white">Thanks, @{me.login}. Your note shows up once I have read it.</p>;

 const submit = async (e) => {
  e.preventDefault();
  setState("busy");
  setErr("");
  try {
   const r = await fetch("/v1/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
   const d = await r.json().catch(() => ({}));
   if (!r.ok) throw new Error(d.error || "Something went wrong");
   setState("done");
   router.refresh();
  } catch (e2) {
   setErr(e2.message.charAt(0).toUpperCase() + e2.message.slice(1));
   setState("idle");
  }
 };

 return (
  <form id="sign" onSubmit={submit} className="rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617]">
   <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-white/60">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {me.avatar && <img src={me.avatar + (me.avatar.includes("?") ? "&" : "?") + "s=48"} alt="" width={24} height={24} className="rounded-full" />}
    Signing as <span className="font-semibold text-zinc-800 dark:text-white">@{me.login}</span>
    <button type="button" onClick={() => fetch("/v1/guestbook/logout", { method: "POST" }).then(() => setMe(null))} className="ml-auto text-xs underline underline-offset-4">
     Sign out
    </button>
   </div>
   <textarea required minLength={2} maxLength={280} rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Say hi, leave a thought" aria-label="Your note" className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[16px] text-zinc-800 outline-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:bg-[#1d1d1f] dark:text-white dark:focus:border-white/30 md:text-[15px]" />
   <div className="mt-2 flex items-center gap-3">
    <button type="submit" disabled={state === "busy" || msg.trim().length < 2} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900">
     Sign
    </button>
    <span className="text-xs text-zinc-500 dark:text-white/40">{280 - msg.length} left · no links</span>
   </div>
   {err && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{err}</p>}
  </form>
 );
}
