"use client";

import { useEffect, useRef, useState } from "react";
import { Hands, Head } from "components/features/WaveFooter";
import { play } from "lib/sound";

// The cartoon me, peeking over the hero console card: waves on load, glances at what you hover, gives tips on click.
const TIPS = ["Hi, I'm Your Name. Welcome!", "Press ` to open a terminal.", "Press X to see how this page is built.", "Type acme anywhere for a surprise.", "Ask me anything, bottom right.", "Try ssh example.com -p 2222", "Everything here is built by me, in Nepal."];

export function Wave() {
 // an open hand, raised
 return (
  <svg viewBox="0 0 60 70" className="h-full w-full" aria-hidden="true">
   <defs>
    <linearGradient id="hb-hand" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stopColor="#f3c9a1" />
     <stop offset="1" stopColor="#d99e75" />
    </linearGradient>
   </defs>
   <rect x="12" y="30" width="34" height="32" rx="14" fill="url(#hb-hand)" />
   {[14, 22, 30, 38].map((x, i) => (
    <rect key={x} x={x} y={[10, 4, 6, 12][i]} width="8" height="30" rx="4" fill="url(#hb-hand)" />
   ))}
   <rect x="2" y="34" width="20" height="9" rx="4.5" transform="rotate(-35 12 38)" fill="url(#hb-hand)" />
   <path d="M18 40 h22" stroke="#c18761" strokeWidth="1.2" opacity=".5" strokeLinecap="round" />
  </svg>
 );
}

export function HeroBuddy() {
 const ref = useRef(null);
 const [look, setLook] = useState([0, 0]);
 const [blink, setBlink] = useState(false);
 const [waving, setWaving] = useState(false);
 const [tip, setTip] = useState("");
 const n = useRef(0);
 const timer = useRef(0);
 const tiltRef = useRef(null);
 const tiltAsked = useRef(false);

 useEffect(() => {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
   const w1 = setTimeout(() => setWaving(true), 700);
   const w2 = setTimeout(() => setWaving(false), 3000);
   timer.current = [w1, w2];
  }
  let raf = 0;
  let glance = 0;
  const aim = (x, y) => {
   const r = ref.current?.getBoundingClientRect();
   if (!r) return;
   const cx = r.left + r.width / 2;
   const cy = r.top + r.height * 0.45;
   const a = Math.atan2(y - cy, x - cx);
   const d = Math.min(1, Math.hypot(x - cx, y - cy) / 260);
   setLook([Math.cos(a) * 3.2 * d, Math.sin(a) * 3 * d]);
  };
  const move = (e) => {
   if (still || raf || Date.now() < glance) return;
   raf = requestAnimationFrame(() => {
    raf = 0;
    aim(e.clientX, e.clientY);
   });
  };
  // glance at whatever interactive thing is hovered
  const over = (e) => {
   if (still) return;
   const el = e.target.closest?.("a, button");
   if (!el || ref.current?.contains(el)) return;
   const r = el.getBoundingClientRect();
   aim(r.left + r.width / 2, r.top + r.height / 2);
   glance = Date.now() + 900;
  };
  // phones: the eyes follow the tilt (beta 45 is how a phone is usually held)
  let traf = 0;
  const tilt = (e) => {
   if (still || e.gamma == null || traf || Date.now() < glance) return;
   traf = requestAnimationFrame(() => {
    traf = 0;
    const gx = Math.max(-1, Math.min(1, e.gamma / 30));
    const gy = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 30));
    setLook([gx * 3.2, gy * 3]);
   });
  };
  tiltRef.current = tilt;
  window.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerover", over, { passive: true });
  // iOS asks for permission, so there it only starts after a tap on the buddy (see poke)
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") window.addEventListener("deviceorientation", tilt, { passive: true });
  let t;
  const loop = () => {
   t = setTimeout(() => {
    if (!still) {
     setBlink(true);
     setTimeout(() => setBlink(false), 130);
    }
    loop();
   }, 3000 + Math.random() * 3000);
  };
  loop();
  return () => {
   window.removeEventListener("pointermove", move);
   document.removeEventListener("pointerover", over);
   window.removeEventListener("deviceorientation", tilt);
   cancelAnimationFrame(traf);
   clearTimeout(t);
   (timer.current || []).forEach?.(clearTimeout);
  };
 }, []);

 const poke = () => {
  play("pop");
  const D = typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : null;
  if (D && typeof D.requestPermission === "function" && !tiltAsked.current) {
   tiltAsked.current = true;
   D.requestPermission()
    .then((r) => r === "granted" && tiltRef.current && window.addEventListener("deviceorientation", tiltRef.current, { passive: true }))
    .catch(() => {});
  }
  setTip(TIPS[n.current++ % TIPS.length]);
  setWaving(true);
  clearTimeout(timer.tip);
  timer.tip = setTimeout(() => {
   setTip("");
   setWaving(false);
  }, 2800);
 };

 return (
  <>
   <div ref={ref} className="pointer-events-none absolute top-[8px] right-10 z-0 h-[125px] w-[120px]">
    {tip && (
     <div role="status" className="absolute -left-2 top-6 w-max max-w-[220px] -translate-x-full animate-[page-enter_.25s_ease-out] rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900">
      {tip}
      <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-zinc-900 dark:bg-white" />
     </div>
    )}
    <button type="button" data-silent onClick={poke} aria-label="Say hi" className="peek pointer-events-auto block h-full w-full cursor-pointer">
     <Head look={look} blink={blink} />
    </button>
    {waving && (
     <div className="hero-wave pointer-events-none absolute -right-7 top-[38px] h-[52px] w-[44px]" aria-hidden="true">
      <Wave />
     </div>
    )}
   </div>
   <div className={`pointer-events-none absolute top-[8px] right-10 z-20 h-[125px] w-[120px] ${waving ? "hide-right-hand" : ""}`}>
    <Hands />
   </div>
  </>
 );
}
