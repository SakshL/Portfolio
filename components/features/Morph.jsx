"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Page morphs: clicking a card marked data-morph runs the navigation inside a View Transition, so the card's
// box grows into the article header while its title and summary glide into place (same view-transition-names).
let pending = null;

export function Morph() {
 const router = useRouter();
 const path = usePathname();

 // the new page has rendered: let the transition take its "after" snapshot
 useEffect(() => {
  if (pending) {
   const done = pending;
   pending = null;
   requestAnimationFrame(() => requestAnimationFrame(done));
  }
 }, [path]);

 useEffect(() => {
  const click = (e) => {
   if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
   const a = e.target.closest?.("a[data-morph]");
   if (!a || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
   const url = new URL(a.href, location.href);
   if (url.origin !== location.origin || url.pathname === location.pathname) return;
   e.preventDefault();
   // name the clicked card's parts so they pair with the article header
   const t = a.querySelector("[data-morph-title]");
   const s = a.querySelector("[data-morph-summary]");
   a.style.viewTransitionName = "morph-card";
   if (t) t.style.viewTransitionName = "morph-title";
   if (s) s.style.viewTransitionName = "morph-summary";
   document.documentElement.classList.add("vt-nav");
   const vt = document.startViewTransition(
    () =>
     new Promise((resolve) => {
      pending = resolve;
      router.push(url.pathname + url.search + url.hash);
      setTimeout(() => {
       if (pending === resolve) {
        pending = null;
        resolve();
       }
      }, 1500);
     })
   );
   vt.finished.finally(() => {
    document.documentElement.classList.remove("vt-nav");
    a.style.viewTransitionName = "";
    if (t) t.style.viewTransitionName = "";
    if (s) s.style.viewTransitionName = "";
   });
  };
  document.addEventListener("click", click);
  return () => document.removeEventListener("click", click);
 }, [router]);

 return null;
}
