"use client";

// Dark mode ripple: the new theme spreads out as a circle from where the visitor last clicked or tapped
// (or from the centre for keyboard and terminal switches). Uses View Transitions; falls back to a plain switch.
let last = null;
if (typeof window !== "undefined") {
 window.addEventListener("pointerdown", (e) => (last = { x: e.clientX, y: e.clientY, at: Date.now() }), { capture: true, passive: true });
}

export function switchTheme(setTheme, next) {
 const root = document.documentElement;
 const want = next === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : next;
 const isDark = root.classList.contains("dark");
 if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches || (want === "dark") === isDark) {
  setTheme(next);
  return;
 }
 const p = last && Date.now() - last.at < 4000 ? last : { x: innerWidth / 2, y: innerHeight / 3 };
 const r = Math.hypot(Math.max(p.x, innerWidth - p.x), Math.max(p.y, innerHeight - p.y));
 root.classList.add("vt-theme");
 const vt = document.startViewTransition(() => {
  // apply the class now so the "after" snapshot is in the new theme; next-themes catches up right after
  root.classList.toggle("dark", want === "dark");
  root.classList.toggle("light", want === "light");
  root.style.colorScheme = want;
  setTheme(next);
 });
 vt.ready
  .then(() => {
   root.animate({ clipPath: [`circle(0px at ${p.x}px ${p.y}px)`, `circle(${r}px at ${p.x}px ${p.y}px)`] }, { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" });
  })
  .catch(() => {});
 vt.finished.finally(() => root.classList.remove("vt-theme"));
}
