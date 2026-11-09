"use client";

import { useEffect, useState } from "react";
import { play, setSound, soundOn } from "lib/sound";

export function SoundToggle({ className = "" }) {
 const [on, setOn] = useState(true);
 useEffect(() => {
  setOn(soundOn());
  const f = () => setOn(soundOn());
  window.addEventListener("sound-change", f);
  return () => window.removeEventListener("sound-change", f);
 }, []);
 return (
  <button
   type="button"
   data-silent
   aria-label={on ? "Mute sounds" : "Turn sounds on"}
   title={on ? "Mute sounds" : "Turn sounds on"}
   onClick={() => {
    const next = !on;
    setSound(next);
    if (next) play("toggleOn");
   }}
   className={`flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 duration-200 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10 ${className}`}
  >
   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {on ? (
     <>
      <path className="sound-wave" d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path className="sound-wave sound-wave-2" d="M18.5 5.5a9 9 0 0 1 0 13" />
     </>
    ) : (
     <path d="m16 9 5 6m0-6-5 6" />
    )}
   </svg>
  </button>
 );
}
