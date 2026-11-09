"use client";

// Tiny synthesized UI sounds (Web Audio, no files). Off when the visitor mutes them; quiet by design.
let ctx = null;
let enabled = null;

export function soundOn() {
 if (enabled === null) {
  try {
   enabled = localStorage.getItem("sound") !== "off";
  } catch {
   enabled = true;
  }
 }
 return enabled;
}

export function setSound(on) {
 enabled = on;
 try {
  localStorage.setItem("sound", on ? "on" : "off");
 } catch {}
 window.dispatchEvent(new Event("sound-change"));
}

function ac() {
 if (typeof window === "undefined") return null;
 if (!ctx) {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  ctx = new C();
 }
 if (ctx.state === "suspended") ctx.resume();
 return ctx;
}

// one shared output with a gentle compressor so stacked sounds never clip
let out = null;
function master(a) {
 if (out) return out;
 const comp = a.createDynamicsCompressor();
 comp.threshold.value = -18;
 comp.ratio.value = 4;
 const g = a.createGain();
 g.gain.value = 0.9;
 comp.connect(g).connect(a.destination);
 out = comp;
 return out;
}

function env(a, node, { at = 0, attack = 0.003, decay = 0.08, peak = 0.1 }) {
 const g = a.createGain();
 const t = a.currentTime + at;
 g.gain.setValueAtTime(0.0001, t);
 g.gain.exponentialRampToValueAtTime(peak, t + attack);
 g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
 node.connect(g).connect(master(a));
 return t;
}

function tone(a, { f1, f2 = f1, at = 0, decay = 0.08, type = "sine", peak = 0.08 }) {
 const o = a.createOscillator();
 o.type = type;
 const t = env(a, o, { at, decay, peak });
 o.frequency.setValueAtTime(f1, t);
 o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + decay);
 o.start(t);
 o.stop(t + decay + 0.03);
}

function noise(a, { at = 0, decay = 0.03, freq = 2500, q = 1.4, peak = 0.06, type = "bandpass", sweep = 0 }) {
 const len = Math.floor(a.sampleRate * (decay + 0.05));
 const buf = a.createBuffer(1, len, a.sampleRate);
 const d = buf.getChannelData(0);
 for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
 const src = a.createBufferSource();
 src.buffer = buf;
 const f = a.createBiquadFilter();
 f.type = type;
 f.Q.value = q;
 src.connect(f);
 const t = env(a, f, { at, decay, peak, attack: 0.002 });
 f.frequency.setValueAtTime(freq, t);
 if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + decay);
 src.start(t);
 src.stop(t + decay + 0.05);
}

// Soft, tactile sounds; each kind of control has its own.
const SOUNDS = {
 // a plain button: a soft key press
 tap: (a) => (noise(a, { decay: 0.018, freq: 3200, q: 0.9, peak: 0.05 }), tone(a, { f1: 190, f2: 120, decay: 0.045, peak: 0.07 })),
 // nav and menu links: the lightest tick
 nav: (a) => noise(a, { decay: 0.012, freq: 5200, q: 1.2, peak: 0.035 }),
 // cards that open a page: a rounder, lower knock
 card: (a) => (tone(a, { f1: 320, f2: 150, decay: 0.09, peak: 0.08 }), noise(a, { decay: 0.02, freq: 1800, q: 0.8, peak: 0.035 })),
 // main actions: a small two-note pluck
 primary: (a) => (tone(a, { f1: 587, f2: 580, decay: 0.12, type: "triangle", peak: 0.06 }), tone(a, { f1: 880, f2: 870, at: 0.055, decay: 0.16, type: "triangle", peak: 0.05 })),
 pop: (a) => (tone(a, { f1: 420, f2: 900, decay: 0.07, peak: 0.07 }), noise(a, { decay: 0.015, freq: 4000, peak: 0.025 })),
 toggleOn: (a) => (tone(a, { f1: 520, decay: 0.05, type: "triangle", peak: 0.05 }), tone(a, { f1: 780, at: 0.045, decay: 0.07, type: "triangle", peak: 0.05 })),
 toggleOff: (a) => (tone(a, { f1: 780, decay: 0.05, type: "triangle", peak: 0.05 }), tone(a, { f1: 520, at: 0.045, decay: 0.07, type: "triangle", peak: 0.05 })),
 whoosh: (a) => noise(a, { decay: 0.22, freq: 500, sweep: 3200, q: 0.7, peak: 0.045 }),
 close: (a) => noise(a, { decay: 0.16, freq: 2600, sweep: 500, q: 0.7, peak: 0.035 }),
 chime: (a) => (tone(a, { f1: 784, decay: 0.22, peak: 0.05 }), tone(a, { f1: 1175, at: 0.08, decay: 0.32, peak: 0.04 })),
 error: (a) => (tone(a, { f1: 220, f2: 190, decay: 0.1, type: "triangle", peak: 0.06 }), tone(a, { f1: 196, f2: 170, at: 0.11, decay: 0.12, type: "triangle", peak: 0.05 })),
 tick: (a) => noise(a, { decay: 0.008, freq: 6000, q: 2, peak: 0.02 }),
 scan: (a) => tone(a, { f1: 300, f2: 1400, decay: 0.25, type: "sine", peak: 0.04 }),
 click: (a) => SOUNDS.tap(a),
};

export function play(name) {
 if (!soundOn()) return;
 const a = ac();
 if (!a || !SOUNDS[name]) return;
 try {
  SOUNDS[name](a);
 } catch {}
}
