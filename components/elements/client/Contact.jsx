"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "../Button";
import { play } from "lib/sound";
import { Head } from "components/features/WaveFooter";
import { Wave } from "components/features/HeroBuddy";

const TOPICS = [
 { id: "hiring", label: "Hiring" },
 { id: "project", label: "Project or freelance" },
 { id: "hi", label: "Just saying hi" },
];
const BUDGETS = ["Not sure yet", "Under NPR 1,00,000", "NPR 1,00,000 to 5,00,000", "NPR 5,00,000 to 20,00,000", "Over NPR 20,00,000"];
const TIMELINES = ["No rush", "Within a month", "Within a week", "As soon as possible"];
const START = 10; // working hours in Nepal time
const END = 20;

const input =
 "my-2 w-full rounded-lg border-[1px] border-gray-300 p-2 font-normal text-zinc-800 outline-0 duration-200 focus:border-blue-700 dark:border-neutral-800 dark:bg-transparent dark:text-white focus:dark:border-blue-500";
const label = "w-full text-left text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400";

function Req() {
 return (
  <span aria-hidden={true} className="cursor-help text-red-500" title="Required">
   *
  </span>
 );
}

// What time is it in Nepal, and when will a reply likely come? Uses the visitor's own clock for the conversion.
function replyNote() {
 const now = new Date();
 const npt = new Date(now.getTime() + (5 * 60 + 45) * 60000); // read with getUTC* = Nepal wall clock
 const m = npt.getUTCHours() * 60 + npt.getUTCMinutes();
 const clock = npt.toLocaleTimeString("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" });
 // the next 10:00 in Nepal, as an instant
 const day = m < START * 60 ? 0 : 1;
 const next = new Date(Date.UTC(npt.getUTCFullYear(), npt.getUTCMonth(), npt.getUTCDate() + day, START, 0) - (5 * 60 + 45) * 60000);
 let local = "";
 try {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz && tz !== "Asia/Kathmandu" && tz !== "Asia/Katmandu") {
   const sameDay = next.toDateString() === now.toDateString();
   local = next.toLocaleString(undefined, { hour: "numeric", minute: "2-digit", ...(sameDay ? {} : { weekday: "long" }) }) + " your time";
  }
 } catch {}
 const after = `after ${START} AM Nepal time${local ? ` (${local})` : ""}`;
 let when;
 if (m >= START * 60 && m < (END - 1) * 60) when = "I'm at my desk right now, so expect a reply within a few hours.";
 else if (m >= (END - 1) * 60 && m < END * 60) when = "I'm wrapping up for the day, so you'll hear back tonight or first thing tomorrow.";
 else if (m >= END * 60) when = `I've finished for the day. Expect a reply tomorrow, ${after}.`;
 else if (m < 7 * 60) when = `I'm asleep right now. I'll reply ${after}.`;
 else when = "My day is just starting, so expect a reply by this afternoon.";
 return { clock, when };
}

function ThanksBuddy() {
 const [blink, setBlink] = useState(false);
 useEffect(() => {
  play("chime");
  const id = setInterval(() => {
   setBlink(true);
   setTimeout(() => setBlink(false), 140);
  }, 3800);
  return () => clearInterval(id);
 }, []);
 return (
  <div className="relative mx-auto h-[110px] w-[104px]" aria-hidden="true">
   <div className="h-full w-full animate-[page-enter_.5s_cubic-bezier(.2,.8,.2,1)]">
    <Head look={[0, 1]} blink={blink} />
   </div>
   <div className="hero-wave absolute -right-8 top-[34px] h-[48px] w-[40px]">
    <Wave />
   </div>
  </div>
 );
}

function callLine(at) {
 const t = new Date(at);
 if (isNaN(t)) return "";
 const mins = Math.round((t - Date.now()) / 60000);
 if (mins <= 10) return "Your phone should ring in a moment: a short call from me, from a Nepal number.";
 const clock = t.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit" });
 return `You'll also get a short call from me at ${clock} Nepal time, from a Nepal number.`;
}

function Thanks({ name, topic, page, callAt, onAgain }) {
 const [note] = useState(replyNote);
 const [ready, setReady] = useState(false);
 const [late, setLate] = useState(false);
 useEffect(() => {
  if (!page) return;
  let stop = false;
  const t0 = Date.now();
  const poll = async () => {
   if (stop) return;
   try {
    const r = await fetch(`/v1/for/${page.token}`, { cache: "no-store" });
    if (r.ok) {
     setReady(true);
     play("chime");
     return;
    }
   } catch {}
   if (Date.now() - t0 > 4 * 60000) return setLate(true);
   setTimeout(poll, 4000);
  };
  setTimeout(poll, 6000);
  return () => {
   stop = true;
  };
 }, [page]);
 const first = (name || "").trim().split(/\s+/)[0];
 return (
  <div className="w-full max-w-md py-2 text-center" role="status" aria-live="polite">
   <ThanksBuddy />
   <h2 className="mt-3 text-2xl font-semibold text-zinc-800 dark:text-white">Thanks{first ? `, ${first}` : ""}!</h2>
   <p className="mt-2 text-gray-600 dark:text-gray-300">
    Your message is in my inbox. It's <span className="font-semibold text-zinc-800 dark:text-white">{note.clock}</span> in Nepal. {note.when}
   </p>
   {callAt && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{callLine(callAt)}</p>}
   {topic === "hiring" && page && (
    <div className="mt-5 rounded-xl border border-[#1491ff]/30 bg-[#1491ff]/[6%] p-4 text-left">
     <p className="text-sm font-semibold text-zinc-800 dark:text-white">
      A page made for {page.role} at {page.company}
     </p>
     {ready ? (
      <>
       <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">It matches what the role asks for with real work of mine, plus a short cover letter.</p>
       <Link href={`/for/${page.token}`} className="mt-3 inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
        Open your page →
       </Link>
      </>
     ) : late ? (
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">It is taking longer than usual. I will send you the link with my reply.</p>
     ) : (
      <p className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
       <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#1491ff] border-t-transparent motion-reduce:animate-none" />
       Writing it from the job description now, usually under a minute.
      </p>
     )}
    </div>
   )}
   <button type="button" onClick={onAgain} className="mt-6 text-sm font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-white/50">
    Send another message
   </button>
  </div>
 );
}

export function Contact(props) {
 const empty = { email: "", name: "", phone: "", message: "", company: "", role: "", job_link: "", jd: "", budget: "", timeline: "", website: "" };
 const [callMe, setCallMe] = useState(true);
 const [formData, setFormData] = useState(empty);
 const [topic, setTopic] = useState("");
 const [sent, setSent] = useState(null);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [token, setToken] = useState("");
 const top = useRef(null);
 useEffect(() => {
  if (error) play("error");
 }, [error]);

 useEffect(() => {
  fetch("/v1/contact/token")
   .then((r) => r.json())
   .then((d) => setToken(d.t || ""))
   .catch(() => {});
 }, []);

 const fail = (msg) => {
  setLoading(false);
  setError(msg);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const { email, name } = formData;
  let message = formData.message;
  const phone = (formData.phone || "").trim();
  if (topic === "hiring") {
   if (!formData.company.trim() || !formData.role.trim()) return fail("Please add the company and the role.");
   if (formData.job_link.trim() && !/^https?:\/\/\S+\.\S+/.test(formData.job_link.trim())) return fail("The job link should be a full web address, starting with https://");
   if (!message.trim()) message = `Hiring for ${formData.role.trim()} at ${formData.company.trim()}.`;
  }
  if (!phone) return fail("Please enter your phone number!");
  if (!/^\+?[0-9][0-9 ()-]{5,18}[0-9]$/.test(phone)) return fail("That phone number looks wrong. Use digits, like +977 98XXXXXXXX.");
  if (!email) return fail("Please enter your email address!");
  if (!email.includes("@") || !email.includes(".")) return fail("Please enter a valid email address!");
  if (email.trim().length < 5 || email.trim().length > 200) return fail("Email address looks too long!");
  if (!name) return fail("Please enter your name!");
  if (!name.trim() || name.trim().length < 3 || name.trim().length > 60) return fail("Name must be between 3 and 60 characters!");
  if (!message) return fail("Please enter a message!");
  if (!message.trim() || message.trim().length < 10 || message.trim().length > 5000) return fail("Message must be between 10 and 5000 characters!");

  try {
   let ref = "";
   let sid = "";
   try {
    ref = sessionStorage.getItem("ref") || "";
    sid = sessionStorage.getItem("sid") || "";
   } catch {}
   const extra =
    topic === "hiring"
     ? { company: formData.company, role: formData.role, job_link: formData.job_link.trim(), jd: formData.jd }
     : topic === "project"
       ? { budget: formData.budget, timeline: formData.timeline }
       : {};
   const response = await fetch("/v1/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, message, website: formData.website || "", t: token, ref, sid, topic, no_call: !callMe, ...extra }),
   });
   const result = await response.json().catch(() => ({}));
   if (!response.ok || result.error) {
    setError(result.error || "Could not send the message. Please try again.");
   } else {
    setSent({ name, topic, callAt: result.call_at || "", page: result.token ? { token: result.token, company: formData.company.trim(), role: formData.role.trim() } : null });
    setFormData(empty);
    setTimeout(() => top.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
   }
  } catch (err) {
   setError("Could not send the message. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 if (sent) {
  return (
   <div ref={top} className="flex w-full justify-center">
    <Thanks {...sent} onAgain={() => (setSent(null), setTopic(""))} />
   </div>
  );
 }

 const msgLabel = topic === "hiring" ? "Anything else I should know?" : topic === "project" ? "Tell me about the project" : "Message";
 const msgHint = topic === "hiring" ? "The team, the stack, how you found me..." : topic === "project" ? "What do you want built, and for whom?" : "What would you like to talk about?";

 return (
  <form {...props} ref={top} onSubmit={handleSubmit} className="relative flex w-full flex-col items-center justify-center">
   <div className="z-[2] mb-4 w-full">
    <p id="contact_topic" className={label}>
     What is this about?
    </p>
    <div role="radiogroup" aria-labelledby="contact_topic" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
     {TOPICS.map((t) => (
      <button
       key={t.id}
       type="button"
       role="radio"
       aria-checked={topic === t.id}
       onClick={() => setTopic(topic === t.id ? "" : t.id)}
       className={`rounded-lg border px-3 py-2 text-sm font-semibold duration-200 ${topic === t.id ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-gray-300 text-zinc-700 hover:border-zinc-500 dark:border-neutral-800 dark:text-white/80 dark:hover:border-neutral-600"}`}
      >
       {t.label}
      </button>
     ))}
    </div>
   </div>

   {topic === "hiring" && (
    <div className="z-[2] w-full animate-[page-enter_.3s_ease-out]">
     <div className="block w-full gap-1.5 md:flex">
      <label htmlFor="contact_company" className={label}>
       Company
       <Req />
       <input value={formData.company} name="company" onChange={handleChange} id="contact_company" className={input} type="text" placeholder="Where you work" autoComplete="organization" />
      </label>
      <label htmlFor="contact_role" className={label}>
       Role
       <Req />
       <input value={formData.role} name="role" onChange={handleChange} id="contact_role" className={input} type="text" placeholder="Senior Backend Engineer" />
      </label>
     </div>
     <label htmlFor="contact_joblink" className={label}>
      Job link
      <input value={formData.job_link} name="job_link" onChange={handleChange} id="contact_joblink" className={input} type="url" inputMode="url" placeholder="https://..." />
     </label>
     <label htmlFor="contact_jd" className={label}>
      Job description
      <span className="ml-1 font-normal text-gray-500 dark:text-gray-500">optional</span>
      <textarea value={formData.jd} name="jd" onChange={handleChange} id="contact_jd" className={`${input} max-h-56 min-h-[90px]`} placeholder="Paste it here and I'll build you a page showing how my work fits this role, in about a minute." />
     </label>
    </div>
   )}

   {topic === "project" && (
    <div className="z-[2] block w-full animate-[page-enter_.3s_ease-out] gap-1.5 md:flex">
     <label htmlFor="contact_budget" className={label}>
      Budget
      <select value={formData.budget} name="budget" onChange={handleChange} id="contact_budget" className={`${input} dark:bg-[#161617]`}>
       <option value="">Choose one</option>
       {BUDGETS.map((b) => (
        <option key={b}>{b}</option>
       ))}
      </select>
     </label>
     <label htmlFor="contact_timeline" className={label}>
      Timeline
      <select value={formData.timeline} name="timeline" onChange={handleChange} id="contact_timeline" className={`${input} dark:bg-[#161617]`}>
       <option value="">Choose one</option>
       {TIMELINES.map((b) => (
        <option key={b}>{b}</option>
       ))}
      </select>
     </label>
    </div>
   )}

   <div className="z-[2] block w-full items-center justify-center gap-1.5 text-left md:flex">
    <label htmlFor="contact_name" className={label}>
     Name
     <Req />
     <input value={formData.name} name="name" onChange={handleChange} id="contact_name" className={input} type="text" placeholder="Your name" autoComplete="name" />
    </label>
    <label htmlFor="contact_email" className={label}>
     Email
     <Req />
     <input value={formData.email} name="email" onChange={handleChange} id="contact_email" className={input} type="email" placeholder="you@company.com" autoComplete="email" />
    </label>
   </div>
   <div className="z-[2] block w-full">
    <label htmlFor="contact_phone" className={label}>
     Phone
     <Req />
     <input value={formData.phone} name="phone" onChange={handleChange} id="contact_phone" inputMode="tel" autoComplete="tel" className={input} type="tel" placeholder="+977 98XXXXXXXX" required />
    </label>
    <label htmlFor="contact_callme" className="-mt-1 mb-1 flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
     <input id="contact_callme" type="checkbox" checked={callMe} onChange={(e) => setCallMe(e.target.checked)} className="h-4 w-4 accent-zinc-900 dark:accent-white" />
     Give me a quick call to confirm it arrived (Nepal mobile numbers)
    </label>
   </div>
   <div className="mt-2 flex w-full items-center justify-center gap-1.5">
    <label htmlFor="contact_message" className={label}>
     {msgLabel}
     {topic !== "hiring" && <Req />}
     <textarea value={formData.message} name="message" onChange={handleChange} id="contact_message" className={`${input} max-h-40 min-h-[80px]`} placeholder={msgHint} />
    </label>
   </div>
   <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
    <label>
     Website
     <input tabIndex={-1} autoComplete="off" name="website" value={formData.website || ""} onChange={handleChange} />
    </label>
   </div>
   {error ? <p className="self-start text-sm font-semibold tracking-wide text-red-500 ">{error}</p> : <></>}
   <div className="w-full py-2">
    <Button type="submit" className="ml-auto" disabled={loading}>
     {loading ? "Sending..." : "Send"}
    </Button>
   </div>
  </form>
 );
}
