"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "lib/sound";

// The top edge of the footer: a soft wave with a little me peeking over it.
// Eyes follow the pointer, he blinks, hops when clicked and says something short.
const LINES = [
 "Hi! Thanks for reading all the way down.",
 "Press X to see how this page is built.",
 "Try ssh example.com -p 2222",
 "Ask me anything, bottom right.",
 "Press ⌘K to jump anywhere.",
 "Built in Nepal.",
 "Okay, that tickles.",
];

export function Head({ look, blink }) {
 const [dx, dy] = look;
 return (
  <svg viewBox="0 0 240 250" className="block h-full w-full" aria-hidden="true">
   <defs>
    <radialGradient id="wf-skin" cx="45%" cy="38%" r="70%">
     <stop offset="0" stopColor="#f6d2ad" />
     <stop offset="0.6" stopColor="#e8b48a" />
     <stop offset="1" stopColor="#c98f67" />
    </radialGradient>
    <linearGradient id="wf-hair" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stopColor="#4a3427" />
     <stop offset="1" stopColor="#22160f" />
    </linearGradient>
    <radialGradient id="wf-shine" cx="40%" cy="25%" r="40%">
     <stop offset="0" stopColor="#7a5a45" stopOpacity="0.9" />
     <stop offset="1" stopColor="#7a5a45" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="wf-tee" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stopColor="#34343a" />
     <stop offset="1" stopColor="#1c1c20" />
    </linearGradient>
    <radialGradient id="wf-iris" cx="45%" cy="40%" r="60%">
     <stop offset="0" stopColor="#6b4630" />
     <stop offset="1" stopColor="#2a1a10" />
    </radialGradient>
   </defs>
   <path d="M38 250 C40 205 72 186 120 186 C168 186 200 205 202 250 Z" fill="url(#wf-tee)" />
   <path d="M100 188 Q120 204 140 188" fill="none" stroke="#FFD60A" strokeWidth="5" strokeLinecap="round" />
   <path d="M104 160 L104 190 Q120 200 136 190 L136 160 Z" fill="#d9a07a" />
   <ellipse cx="62" cy="122" rx="11" ry="16" fill="url(#wf-skin)" />
   <ellipse cx="178" cy="122" rx="11" ry="16" fill="url(#wf-skin)" />
   <path d="M60 114 q6 8 0 16" fill="none" stroke="#c48a63" strokeWidth="2.5" strokeLinecap="round" />
   <path d="M180 114 q-6 8 0 16" fill="none" stroke="#c48a63" strokeWidth="2.5" strokeLinecap="round" />
   <path d="M68 104 C68 62 92 46 120 46 C148 46 172 62 172 104 C172 142 154 178 120 181 C86 178 68 142 68 104 Z" fill="url(#wf-skin)" />
   <ellipse cx="88" cy="136" rx="11" ry="7" fill="#e88f7a" opacity="0.35" />
   <ellipse cx="152" cy="136" rx="11" ry="7" fill="#e88f7a" opacity="0.35" />
   <path d="M110 164 Q120 170 130 164 Q129 175 120 177 Q111 175 110 164 Z" fill="#3a2a20" opacity="0.38" />
   <path d="M84 140 Q90 168 120 178 Q150 168 156 140 Q150 172 120 180 Q90 172 84 140 Z" fill="#3a2a20" opacity="0.08" />
   <path d="M108 145 Q120 141 132 145" fill="none" stroke="#3a2a20" strokeWidth="2.6" strokeLinecap="round" opacity="0.3" />
   {blink ? (
    <>
     <path d="M86 116 Q97 121 108 116" fill="none" stroke="#2b1c13" strokeWidth="3.5" strokeLinecap="round" />
     <path d="M132 116 Q143 121 154 116" fill="none" stroke="#2b1c13" strokeWidth="3.5" strokeLinecap="round" />
    </>
   ) : (
    <>
     <ellipse cx="97" cy="114" rx="11.5" ry="12.5" fill="#fff" />
     <ellipse cx="143" cy="114" rx="11.5" ry="12.5" fill="#fff" />
     <g style={{ transform: `translate(${dx}px, ${dy}px)`, transition: "transform 120ms ease-out" }}>
      <circle cx="98" cy="116" r="7.5" fill="url(#wf-iris)" />
      <circle cx="142" cy="116" r="7.5" fill="url(#wf-iris)" />
      <circle cx="98" cy="116" r="3.6" fill="#120a06" />
      <circle cx="142" cy="116" r="3.6" fill="#120a06" />
      <circle cx="101" cy="112.5" r="2.4" fill="#fff" />
      <circle cx="145" cy="112.5" r="2.4" fill="#fff" />
     </g>
    </>
   )}
   <path d="M84 98 Q96 91 108 96" fill="none" stroke="#2b1c13" strokeWidth="5" strokeLinecap="round" />
   <path d="M132 96 Q144 91 156 98" fill="none" stroke="#2b1c13" strokeWidth="5" strokeLinecap="round" />
   <path d="M114 134 Q120 139 126 134" fill="none" stroke="#c48a63" strokeWidth="3" strokeLinecap="round" />
   <ellipse cx="120" cy="128" rx="6" ry="8" fill="#fff" opacity="0.12" />
   <path d="M106 151 Q120 161 134 151" fill="none" stroke="#7a3b2c" strokeWidth="3.5" strokeLinecap="round" />
   <path
    d="M62 112 C50 70 70 30 110 22 C126 14 150 16 166 28 C186 40 192 70 180 112 C178 98 172 88 166 84 C166 94 160 100 150 102 C154 94 154 86 150 80 C144 92 132 98 118 98 C124 92 126 86 124 80 C114 92 100 96 86 96 C92 90 94 84 92 78 C82 88 72 98 62 112 Z"
    fill="url(#wf-hair)"
   />
   <path
    d="M62 112 C50 70 70 30 110 22 C126 14 150 16 166 28 C186 40 192 70 180 112 C178 98 172 88 166 84 C166 94 160 100 150 102 C154 94 154 86 150 80 C144 92 132 98 118 98 C124 92 126 86 124 80 C114 92 100 96 86 96 C92 90 94 84 92 78 C82 88 72 98 62 112 Z"
    fill="url(#wf-shine)"
   />
   <path d="M84 36 C90 18 108 10 122 16 C108 18 98 26 92 38 Z" fill="#2c1d14" />
   <path d="M118 18 C130 6 152 8 160 20 C148 16 134 16 124 22 Z" fill="#33231a" />
   <path d="M150 22 C166 18 182 30 184 46 C176 36 164 30 154 30 Z" fill="#2c1d14" />
   <path d="M60 80 C56 64 62 52 72 44 C68 58 68 70 70 84 Z" fill="#2c1d14" />
   <path d="M80 56 Q98 44 120 46" fill="none" stroke="#8a6a52" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
   <path d="M126 38 Q148 36 166 52" fill="none" stroke="#8a6a52" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
  </svg>
 );
}

export function Hands() {
 // four fingers curled over the edge, nails showing, thumb on the inside
 const hand = (
  <>
   <path d="M64 204 C74 202 82 206 84 212 C86 219 80 223 72 221 C66 219 62 214 64 204 Z" fill="url(#wf-thumb)" />
   <ellipse cx="78" cy="214" rx="4" ry="3" fill="#f7dcc2" opacity="0.9" />
   <rect x="22" y="192" width="12.5" height="32" rx="6.25" fill="url(#wf-fing)" />
   <rect x="33.5" y="190" width="12.5" height="35" rx="6.25" fill="url(#wf-fing)" />
   <rect x="45" y="190" width="12.5" height="35" rx="6.25" fill="url(#wf-fing)" />
   <rect x="56.5" y="192" width="12" height="31" rx="6" fill="url(#wf-fing)" />
   <path d="M34 196 v22 M45.6 195 v24 M57 196 v22" stroke="#b97d57" strokeWidth="1.3" opacity="0.55" strokeLinecap="round" />
   <ellipse cx="28.2" cy="219" rx="3.1" ry="2.6" fill="#f7dcc2" opacity="0.85" />
   <ellipse cx="39.7" cy="220.5" rx="3.1" ry="2.6" fill="#f7dcc2" opacity="0.85" />
   <ellipse cx="51.2" cy="220.5" rx="3.1" ry="2.6" fill="#f7dcc2" opacity="0.85" />
   <ellipse cx="62.5" cy="218.5" rx="3" ry="2.5" fill="#f7dcc2" opacity="0.85" />
   <path d="M24 199 h43" stroke="#fff" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
  </>
 );
 return (
  <svg viewBox="0 0 240 250" className="block h-full w-full" aria-hidden="true">
   <defs>
    <linearGradient id="wf-fing" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stopColor="#f3c9a1" />
     <stop offset="0.7" stopColor="#e2a97f" />
     <stop offset="1" stopColor="#cf946c" />
    </linearGradient>
    <linearGradient id="wf-thumb" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stopColor="#f0c39b" />
     <stop offset="1" stopColor="#cf946c" />
    </linearGradient>
   </defs>
   <g>{hand}</g>
   <g transform="translate(240 0) scale(-1 1)">{hand}</g>
  </svg>
 );
}

// crest of the wave sits at x = 39% of the width, y = 34 of a 120 tall box
const WAVE = "M0 70 C120 40 220 40 330 62 C420 80 470 30 560 34 C680 40 700 92 820 88 C940 84 980 38 1100 44 C1220 50 1280 96 1440 70 L1440 120 L0 120 Z";

export function WaveFooter() {
 const ref = useRef(null);
 const [look, setLook] = useState([0, 0]);
 const [blink, setBlink] = useState(false);
 const [hop, setHop] = useState(0);
 const [line, setLine] = useState("");
 const n = useRef(0);
 const still = useRef(false);
 const timer = useRef(0);

 useEffect(() => {
  still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let visible = false;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  if (ref.current) io.observe(ref.current);
  const move = (e) => {
   if (!visible || still.current || raf) return;
   raf = requestAnimationFrame(() => {
    raf = 0;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.45;
    const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
    const dist = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 300);
    setLook([Math.cos(ang) * 3.2 * dist, Math.sin(ang) * 3 * dist]);
   });
  };
  window.addEventListener("pointermove", move, { passive: true });
  let t;
  const loop = () => {
   t = setTimeout(() => {
    if (!still.current) {
     setBlink(true);
     setTimeout(() => setBlink(false), 130);
    }
    loop();
   }, 2500 + Math.random() * 3500);
  };
  loop();
  return () => {
   window.removeEventListener("pointermove", move);
   io.disconnect();
   clearTimeout(t);
  };
 }, []);

 const poke = () => {
  play("pop");
  setHop((h) => h + 1);
  setLine(LINES[n.current++ % LINES.length]);
  clearTimeout(timer.current);
  timer.current = setTimeout(() => setLine(""), 3200);
 };

 return (
  <div className="relative -mb-px h-[150px] w-full text-zinc-100 dark:text-[#1f1f23] print:hidden">
   <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full" aria-hidden="true">
    <path d={WAVE} fill="currentColor" />
   </svg>
   {/* the character: a fixed-size hill keeps his hands on the edge at any screen width */}
   <div className="absolute bottom-0 left-1/2 h-[150px] w-[230px] -translate-x-1/2 md:left-[30%] md:w-[270px]">
    <div ref={ref} className="absolute bottom-[56px] left-1/2 h-[146px] w-[140px] -translate-x-1/2 md:bottom-[52px] md:h-[177px] md:w-[170px]">
     {line && (
      <div role="status" className="absolute -top-10 left-1/2 z-10 w-max max-w-[230px] -translate-x-1/2 animate-[page-enter_.25s_ease-out] rounded-xl bg-zinc-900 px-3 py-1.5 text-center text-xs font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900">
       {line}
       <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-zinc-900 dark:bg-white" />
      </div>
     )}
     <button type="button" data-silent onClick={poke} aria-label="Say hi" key={hop} className={`peek block h-full w-full cursor-pointer ${hop && !still.current ? "hop" : ""}`}>
      <Head look={look} blink={blink} />
     </button>
    </div>
    <svg viewBox="0 0 270 90" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-0 h-[90px] w-full" aria-hidden="true">
     <path d="M0 90 C70 90 60 10 135 10 C210 10 200 90 270 90 Z" fill="currentColor" />
    </svg>
    <div className="pointer-events-none absolute bottom-[56px] left-1/2 h-[146px] w-[140px] -translate-x-1/2 md:bottom-[52px] md:h-[177px] md:w-[170px]">
     <Hands />
    </div>
   </div>
  </div>
 );
}
