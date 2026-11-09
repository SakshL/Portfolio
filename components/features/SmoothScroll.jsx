"use client";

import { useEffect } from "react";

// Smooth wheel scrolling: mouse-wheel notches glide with a little momentum instead of jumping.
// Trackpads, touch, keyboard and anything inside its own scroll box stay native. Off for reduced motion.
export function SmoothScroll() {
 useEffect(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
  let target = scrollY;
  let raf = 0;
  let moving = false;

  const max = () => document.documentElement.scrollHeight - innerHeight;
  const ownScroller = (el, dy) => {
   for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.closest?.("[data-native-scroll],dialog,[role=dialog]")) return true;
    const s = getComputedStyle(el);
    if (/(auto|scroll|overlay)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) {
     if ((dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) || (dy < 0 && el.scrollTop > 0)) return true;
    }
   }
   return false;
  };
  const step = () => {
   const cur = scrollY;
   const d = target - cur;
   if (Math.abs(d) < 0.6) {
    window.scrollTo({ top: target, behavior: "instant" });
    moving = false;
    raf = 0;
    return;
   }
   window.scrollTo({ top: cur + d * 0.14, behavior: "instant" });
   raf = requestAnimationFrame(step);
  };
  const wheel = (e) => {
   if (e.ctrlKey || e.defaultPrevented || e.deltaX) return;
   let dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
   // a mouse wheel sends whole, chunky steps; a trackpad sends many small ones and is smooth already
   if (e.deltaMode === 0 && (!Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 50)) return;
   if (document.body.style.overflow === "hidden" || ownScroller(e.target, dy)) return;
   e.preventDefault();
   if (!moving) target = scrollY;
   target = Math.max(0, Math.min(max(), target + dy));
   moving = true;
   if (!raf) raf = requestAnimationFrame(step);
  };
  const sync = () => {
   if (!moving) target = scrollY;
  };
  const stop = () => {
   moving = false;
   cancelAnimationFrame(raf);
   raf = 0;
  };
  addEventListener("wheel", wheel, { passive: false });
  addEventListener("scroll", sync, { passive: true });
  addEventListener("keydown", stop);
  addEventListener("pointerdown", stop);
  return () => {
   stop();
   removeEventListener("wheel", wheel);
   removeEventListener("scroll", sync);
   removeEventListener("keydown", stop);
   removeEventListener("pointerdown", stop);
  };
 }, []);
 return null;
}
