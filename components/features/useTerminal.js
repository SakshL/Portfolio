"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useRef, useState } from "react";
import { play, setSound } from "lib/sound";
import { switchTheme } from "lib/themeRipple";

// The command set shared by the drop-down terminal (press `) and the console card on the home page.
export const PAGES = { "~": "/", home: "/", work: "/work", blog: "/blog", now: "/now", setup: "/setup", cv: "/resume", architecture: "/architecture", status: "/status", colophon: "/colophon", guestbook: "/guestbook", book: "/book", contact: "/contact", working: "/working-with-me", code: "/code" };
const COMMANDS = ["help", "whoami", "about", "ls", "cd", "cat", "open", "projects", "now", "cv", "contact", "ask", "ssh", "date", "theme", "sound", "xray", "game", "history", "echo", "clear", "exit"];
const HELP = [
 ["whoami", "who runs this site"],
 ["about", "a little more about me"],
 ["ls [dir]", "list pages, posts or case studies"],
 ["cd <page>", "go to a page (work, blog, now, setup, cv...)"],
 ["cat <slug>", "read a post's summary"],
 ["open <slug>", "open a post or page"],
 ["projects", "what I'm building"],
 ["now", "what shipped lately"],
 ["ask <question>", "ask about my work"],
 ["cv", "download my CV"],
 ["contact", "how to reach me"],
 ["ssh", "the real terminal version"],
 ["theme / sound / xray", "toggles"],
 ["game", "ride a delivery run"],
 ["clear, exit", ""],
];

const strip = (md) => (md || "").replace(/[*_`#>]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

let shared = null; // site data, loaded once per page view and shared by both terminals

export function useTerminal({ onExit } = {}) {
 const [lines, setLines] = useState([]);
 const [input, setInput] = useState("");
 const [cwd, setCwd] = useState("~");
 const [busy, setBusy] = useState(false);
 const hist = useRef([]);
 const hpos = useRef(-1);
 const router = useRouter();
 const { resolvedTheme, setTheme } = useTheme();

 const out = useCallback((...ls) => setLines((cur) => [...cur, ...ls.map((l) => (typeof l === "string" ? { t: l } : l))].slice(-400)), []);

 const load = useCallback(async () => {
  if (shared) return shared;
  const [site, posts, cases, features] = await Promise.all([
   fetch("/v1/site").then((r) => r.json()),
   fetch("/v1/posts?kind=post&limit=200").then((r) => r.json()),
   fetch("/v1/posts?kind=case_study&limit=50").then((r) => r.json()),
   fetch("/v1/features").then((r) => r.json()).catch(() => ({})),
  ]);
  shared = { site, posts: posts.items || [], cases: cases.items || [], features };
  return shared;
 }, []);

 const find = (d, name) => d.posts.find((p) => p.slug === name) || d.cases.find((p) => p.slug === name);

 const run = async (raw) => {
  const line = raw.trim();
  out({ t: line, c: "cmd", cwd });
  if (!line) return;
  hist.current = [line, ...hist.current.filter((h) => h !== line)].slice(0, 50);
  hpos.current = -1;
  const [cmd, ...args] = line.split(/\s+/);
  const arg = args.join(" ");
  let d;
  try {
   d = await load();
  } catch {
   return out({ t: "Could not load the site data.", c: "err" });
  }
  const p = d.site?.profile || {};
  switch (cmd.toLowerCase()) {
   case "help":
    return out(...HELP.map(([a, b]) => ({ t: a.padEnd(18) + b, c: "help", k: a, v: b })));
   case "whoami":
    return out({ t: p.name || "Your Name", c: "hd" }, p.headline || "", p.location || "");
   case "about":
    return out(strip(p.about_md) || "Builder from Nepal, based in Your City.");
   case "ls": {
    const dir = (arg || cwd).replace(/^~\/?/, "").replace(/\/$/, "") || "~";
    if (dir === "~" || dir === "") return out({ t: "work/  blog/  now/  setup/  cv/  architecture/  status/  guestbook/  book/  contact/", c: "dir" });
    if (dir === "blog") return out(...d.posts.map((x) => ({ t: x.slug, c: "file" })));
    if (dir === "work") return out(...d.cases.map((x) => ({ t: x.slug, c: "file" })), { t: "(projects: type projects)", c: "dim" });
    return out({ t: `ls: ${dir}: nothing to list here`, c: "dim" });
   }
   case "cd": {
    const to = (arg || "~").replace(/^~\/?/, "").replace(/\/$/, "") || "~";
    if (to === ".." || to === "~") {
     setCwd("~");
     router.push("/");
     return;
    }
    if (!PAGES[to]) return out({ t: `cd: no such page: ${to}`, c: "err" });
    setCwd("~/" + to);
    router.push(PAGES[to]);
    return out({ t: `→ ${PAGES[to]}`, c: "dim" });
   }
   case "cat": {
    const x = find(d, arg);
    if (!x) return out({ t: `cat: ${arg || "?"}: no such post. Try ls blog.`, c: "err" });
    return out({ t: x.title, c: "hd" }, { t: `${new Date(x.publish_at).toDateString()} · ${x.reading_minutes} min read`, c: "dim" }, x.summary || "", { t: `open ${x.slug} to read it`, c: "dim" });
   }
   case "open": {
    const x = find(d, arg);
    if (x) {
     router.push(`/${x.kind === "case_study" ? "work" : "blog"}/${x.slug}`);
     return out({ t: `→ opening ${x.title}`, c: "dim" });
    }
    if (PAGES[arg]) {
     router.push(PAGES[arg]);
     return out({ t: `→ ${PAGES[arg]}`, c: "dim" });
    }
    return out({ t: `open: ${arg || "?"}: not found`, c: "err" });
   }
   case "projects":
    return out(...(d.site?.projects || []).map((x) => ({ t: `${x.name.padEnd(20)} ${x.summary}`, c: x.featured ? "file" : "dim", k: x.name, v: x.summary })));
   case "now":
    return out(...(d.site?.ship || []).slice(0, 8).map((x) => ({ t: `${x.date}  ${x.text}`, c: "file" })));
   case "cv":
    window.open("/cv.pdf", "_blank", "noopener");
    return out({ t: "Opening cv.pdf", c: "dim" });
   case "contact":
    return out("hello@example.com", ...Object.entries(p.links || {}).map(([k, v]) => ({ t: `${k.padEnd(10)} ${v}`, c: "dim", k, v })), { t: "or: cd book", c: "dim" });
   case "ssh":
    return out({ t: "ssh example.com -p 2222", c: "file" }, { t: "No password. The whole site, in your terminal.", c: "dim" });
   case "date":
    return out(new Date().toLocaleString("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "full", timeStyle: "short" }) + " in Nepal");
   case "theme": {
    const next = arg === "dark" || arg === "light" ? arg : resolvedTheme === "dark" ? "light" : "dark";
    switchTheme(setTheme, next);
    return out({ t: `theme: ${next}`, c: "dim" });
   }
   case "sound":
    setSound(arg !== "off");
    return out({ t: `sound: ${arg === "off" ? "off" : "on"}`, c: "dim" });
   case "xray":
    window.dispatchEvent(new Event("toggle-xray"));
    return out({ t: "x-ray toggled", c: "dim" });
   case "game":
    onExit?.();
    window.dispatchEvent(new Event("play-game"));
    return out({ t: "Starting the scooter...", c: "dim" });
   case "history":
    return out(...hist.current.slice().reverse().map((h, i) => ({ t: `${String(i + 1).padStart(3)}  ${h}`, c: "dim" })));
   case "echo":
    return out(arg);
   case "clear":
    return setLines([]);
   case "exit":
    setLines([]);
    return onExit?.();
   case "ask": {
    if (!arg) return out({ t: "ask: what would you like to know?", c: "err" });
    if (!d.features?.ask) return out({ t: "ask is resting right now. Try contact.", c: "dim" });
    setBusy(true);
    try {
     const r = await fetch("/v1/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: arg, page: location.pathname }) });
     const j = await r.json();
     if (!r.ok) throw new Error(j.error || "no answer");
     out(j.answer.replace(/\[\d+\]/g, ""), ...(j.sources || []).map((s) => ({ t: `  ${s.title}  ${s.href}`, c: "dim" })));
     play("chime");
    } catch (e) {
     out({ t: `ask: ${e.message}`, c: "err" });
    } finally {
     setBusy(false);
    }
    return;
   }
   case "sudo":
    return out({ t: "Permission denied. Nice try.", c: "err" });
   case "rm":
    return out({ t: "Not today.", c: "err" });
   case "vim":
   case "nano":
   case "emacs":
    return out({ t: "Editors are for the studio. Try cat.", c: "dim" });
   default:
    return out({ t: `command not found: ${cmd}. Type help.`, c: "err" });
  }
 };

 const complete = () => {
  const parts = input.split(/\s+/);
  let pool = COMMANDS;
  if (parts.length > 1) pool = parts[0] === "cd" ? Object.keys(PAGES) : shared ? [...shared.posts, ...shared.cases].map((x) => x.slug).concat(Object.keys(PAGES)) : [];
  const last = parts[parts.length - 1];
  const hits = pool.filter((x) => x.startsWith(last));
  if (hits.length === 1) setInput([...parts.slice(0, -1), hits[0]].join(" ") + (parts.length === 1 ? " " : ""));
  else if (hits.length > 1) out({ t: hits.join("  "), c: "dim" });
 };

 const submit = (e) => {
  e?.preventDefault();
  const v = input;
  setInput("");
  run(v);
 };

 const onKeyDown = (e) => {
  if (e.key === "Tab") {
   e.preventDefault();
   complete();
  } else if (e.key === "ArrowUp") {
   e.preventDefault();
   hpos.current = Math.min(hist.current.length - 1, hpos.current + 1);
   if (hist.current[hpos.current]) setInput(hist.current[hpos.current]);
  } else if (e.key === "ArrowDown") {
   e.preventDefault();
   hpos.current = Math.max(-1, hpos.current - 1);
   setInput(hpos.current < 0 ? "" : hist.current[hpos.current]);
  } else if (e.key === "l" && e.ctrlKey) {
   e.preventDefault();
   setLines([]);
  }
 };

 return { lines, setLines, out, input, setInput, cwd, busy, load, submit, onKeyDown };
}
