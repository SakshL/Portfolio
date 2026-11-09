"use client";

// Browser errors go to /v1/client-error, which forwards them to Sentry and GlitchTip on the server (no DSN here).
// Only errors from this site's own scripts; at most 5 per page view; the same error once.
const sent = new Set();
let count = 0;
const NOISE = /ResizeObserver loop|Script error\.?$|Load failed|NetworkError|Failed to fetch|AbortError|chrome-extension:|moz-extension:|safari-extension:/i;

export function reportError(kind, err, extra = {}) {
 try {
  if (typeof window === "undefined" || count >= 5) return;
  const message = String((err && (err.message || err.reason?.message)) || err || "").slice(0, 500);
  const stack = String((err && (err.stack || err.reason?.stack)) || "").slice(0, 4000);
  const source = extra.source || "";
  if (!message || NOISE.test(message) || NOISE.test(source) || NOISE.test(stack.split("\n")[1] || "")) return;
  if (source && !source.startsWith(location.origin)) return; // someone else's script
  const key = kind + message;
  if (sent.has(key)) return;
  sent.add(key);
  count++;
  const body = JSON.stringify({
   kind,
   type: String((err && err.name) || "Error").replace(/[^A-Za-z0-9_.$ -]/g, "").slice(0, 60),
   message,
   stack,
   digest: err && typeof err.digest === "string" ? err.digest.slice(0, 40) : undefined,
   source: source.slice(0, 300),
   path: location.pathname,
  });
  fetch("/v1/client-error", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
 } catch {}
}
