"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// First-party, cookie-free analytics for this site (site-api /v1/e and /v1/vitals).
// A random session id lives in sessionStorage only; a Recruiter radar ?ref= token is kept for the visit.

function store(k, v) {
 try {
  if (v === undefined) return sessionStorage.getItem(k) || "";
  sessionStorage.setItem(k, v);
 } catch {}
 return v || "";
}

function sid() {
 let s = store("sid");
 if (!/^[A-Za-z0-9_-]{16,32}$/.test(s)) {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  s = btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  store("sid", s);
 }
 return s;
}

function send(url, body) {
 const data = JSON.stringify(body);
 try {
  if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([data], { type: "text/plain" }))) return;
 } catch {}
 fetch(url, { method: "POST", body: data, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

function skip(path) {
 return typeof navigator === "undefined" || navigator.webdriver || path.startsWith("/resume/print") || path.startsWith("/preview");
}

export function track(type, extra = {}) {
 if (skip(location.pathname)) return;
 send("/v1/e", { sid: sid(), type, path: location.pathname, ref: store("ref"), ...extra });
}

export function cvHref() {
 const q = new URLSearchParams();
 const r = store("ref");
 if (r) q.set("ref", r);
 q.set("sid", sid());
 return `/cv.pdf?${q}`;
}

export function Analytics() {
 const path = usePathname();
 const first = useRef(true);

 // capture ?ref= and UTM once, keep the address bar clean
 useEffect(() => {
  const u = new URL(location.href);
  const ref = (u.searchParams.get("ref") || "").toLowerCase();
  if (/^[a-z0-9-]{3,40}$/.test(ref)) store("ref", ref);
  // a tailored /for/<token> page counts as that company's link too
  const forTok = u.pathname.match(/^\/for\/([a-z0-9-]{3,40})\/?$/i);
  if (forTok) store("ref", forTok[1].toLowerCase());
  if (u.searchParams.has("ref")) {
   u.searchParams.delete("ref");
   history.replaceState(history.state, "", u.pathname + (u.search ? u.search : "") + u.hash);
  }
 }, []);

 // page views
 useEffect(() => {
  if (skip(path)) return;
  const utm = {};
  if (first.current) {
   const q = new URLSearchParams(location.search);
   ["source", "medium", "campaign"].forEach((k) => q.get(`utm_${k}`) && (utm[k] = q.get(`utm_${k}`)));
  }
  send("/v1/e", { sid: sid(), type: "pageview", path, ref: store("ref"), referrer: first.current ? document.referrer : "", utm });
  first.current = false;
 }, [path]);

 // time on page: heartbeat while the tab is visible
 useEffect(() => {
  const t = setInterval(() => {
   if (document.visibilityState === "visible" && !skip(location.pathname)) send("/v1/e", { sid: sid(), type: "heartbeat", path: location.pathname, ms: 15000 });
  }, 15000);
  return () => clearInterval(t);
 }, []);

 // outbound links, CV downloads, email clicks
 useEffect(() => {
  const onClick = (e) => {
   const a = e.target.closest?.("a[href]");
   if (!a) return;
   const href = a.getAttribute("href") || "";
   if (href.startsWith("mailto:")) return track("copy_email", { target: href.slice(7) });
   if (href.startsWith("/cv.pdf")) {
    a.setAttribute("href", cvHref()); // the API logs the download with this visit
    return;
   }
   try {
    const u = new URL(href, location.href);
    if (u.host !== location.host) track("outbound", { target: (u.host + u.pathname).replace(/\/$/, "").slice(0, 200) });
   } catch {}
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
 }, []);

 // real-user speed
 useEffect(() => {
  if (skip(location.pathname)) return;
  import("web-vitals").then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
   const report = (m) => send("/v1/vitals", { path: location.pathname, metric: m.name, value: m.value, rating: m.rating });
   onLCP(report);
   onINP(report);
   onCLS(report);
   onFCP(report);
   onTTFB(report);
  });
 }, []);

 return null;
}
