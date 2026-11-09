"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { play, soundOn } from "lib/sound";

// Site-wide feel: a soft click on every press, a reveal as sections scroll in.
// which sound fits the thing being pressed
function kindOf(el) {
 if (el.getAttribute("role") === "tab" || el.getAttribute("role") === "switch" || el.getAttribute("aria-pressed") !== null) return "toggleOn";
 if (el.closest("nav, header")) return "nav";
 if (el.type === "submit" || el.hasAttribute("data-magnet") || el.hasAttribute("data-primary")) return "primary";
 if (el.tagName === "A" && /rounded-(xl|2xl|\[20px\])/.test(el.className) && /\bborder\b/.test(el.className)) return "card";
 if (el.tagName === "A" && el.closest("article, .rounded-xl, .rounded-2xl")) return "card";
 return "tap";
}

let last = 0;

export function Interactions() {
 const path = usePathname();

 useEffect(() => {
  const down = (e) => {
   const el = e.target.closest?.("a, button, [role=button], summary, kbd");
   if (!el) return;
   // a tiny tap on Android phones (iOS has no vibration API), tied to the sound switch
   if (e.pointerType === "touch" && navigator.vibrate && soundOn()) navigator.vibrate(8);
   if (el.closest("[data-silent]")) return;
   // plain text links inside articles stay quiet
   if (el.tagName === "A" && el.closest(".prose") && !el.dataset.sound) return;
   if (performance.now() - last < 70) return;
   last = performance.now();
   play(el.dataset.sound || kindOf(el));
  };
  document.addEventListener("pointerdown", down, { passive: true });
  return () => document.removeEventListener("pointerdown", down);
 }, []);

 // a soft spotlight follows the pointer over cards; buttons marked data-magnet lean toward it
 useEffect(() => {
  if (!window.matchMedia("(hover: hover)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf = 0;
  let last = null;
  let mag = null;
  const move = (e) => {
   if (raf) return;
   raf = requestAnimationFrame(() => {
    raf = 0;
    const card = e.target.closest?.(".rounded-xl.border, .rounded-2xl.border, .rounded-\\[20px\\].border");
    if (card) {
     const r = card.getBoundingClientRect();
     card.style.setProperty("--sx", `${e.clientX - r.left}px`);
     card.style.setProperty("--sy", `${e.clientY - r.top}px`);
     card.classList.add("spot");
    }
    if (last && last !== card) last.classList.remove("spot");
    last = card;
    const m = e.target.closest?.("[data-magnet]");
    if (mag && mag !== m) mag.style.transform = "";
    if (m) {
     const r = m.getBoundingClientRect();
     const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
     const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
     m.style.transform = `translate(${(dx * 6).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
    }
    mag = m;
   });
  };
  const leave = () => {
   if (last) last.classList.remove("spot");
   if (mag) mag.style.transform = "";
   last = mag = null;
  };
  window.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerleave", leave);
  return () => {
   window.removeEventListener("pointermove", move);
   document.removeEventListener("pointerleave", leave);
  };
 }, []);

 useEffect(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = [...document.querySelectorAll("[data-reveal]:not(.revealed)")];
  if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("revealed"));
  const io = new IntersectionObserver(
   (entries) =>
    entries.forEach((en) => {
     if (en.isIntersecting) {
      en.target.classList.add("revealed");
      io.unobserve(en.target);
     }
    }),
   { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  els.forEach((el) => {
   // already on screen: show at once, no flash
   const r = el.getBoundingClientRect();
   if (r.top < innerHeight * 0.92) el.classList.add("revealed");
   else {
    el.classList.add("will-reveal");
    io.observe(el);
   }
  });
  return () => io.disconnect();
 }, [path]);

 return null;
}
