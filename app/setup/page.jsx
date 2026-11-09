import Link from "next/link";
import { SetupView } from "components/features/SetupView";

export const metadata = {
 title: "My setup",
 description: "The desk where Acme gets built: the machines, the keyboard, and the tools I use every day.",
 openGraph: { images: [{ url: "/assets/setup/my-setup-v2-1600.jpg", width: 1600, height: 2000 }] },
};

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

// x / y are the hotspot positions on the photo, in percent
const gear = [
 {
  id: "monitor",
  d: 0.28,
  kind: "Monitor",
  name: "Dahua LM27-U401A",
  note: "27-inch 4K on the wall at eye level, so the desk stays clear.",
  specs: ["27-inch 4K UHD, 3840 x 2160", "IPS, 60 Hz", "1.07 billion colours", "98% DCI-P3, 100% sRGB", "USB-C, HDMI, DisplayPort"],
  x: 72,
  y: 17,
 },
 {
  id: "mac",
  d: 0.55,
  kind: "Laptop",
  name: "MacBook Pro 14-inch (2024)",
  note: "Everything runs from it: the code, the iOS builds and this site's studio.",
  specs: ["Apple M4 Pro", "24 GB memory", "512 GB SSD", "Liquid Retina XDR display", "macOS Tahoe"],
  x: 46,
  y: 48,
 },
 {
  id: "keyboard",
  d: 0.95,
  kind: "Keyboard",
  name: "AJAZZ AK820 Pro",
  note: "Grey and white keycaps with a yellow Esc, Enter and space bar. Yellow is Acme's colour, so it fits.",
  specs: ["75% layout", "Wired, 2.4 GHz and Bluetooth", "Hot-swappable switches", "RGB lighting"],
  x: 34,
  y: 86,
 },
 {
  id: "knob",
  d: 0.97,
  kind: "Keyboard",
  name: "AK820 Pro knob and screen",
  note: "A volume knob and a tiny colour screen in the corner of the AK820 Pro.",
  specs: ["Rotary knob", "Built-in TFT screen"],
  x: 80,
  y: 93,
 },
 {
  id: "mouse",
  d: 0.8,
  kind: "Mouse",
  name: "Attack Shark R1",
  note: "Light and white, on the right of the mat.",
  specs: ["Wired, 2.4 GHz and Bluetooth 5.2"],
  x: 82,
  y: 66,
 },
 {
  id: "mat",
  d: 0.7,
  kind: "Desk mat",
  name: "Marble desk mat",
  note: "Black and white marble pattern, covering the whole desk.",
  specs: [],
  x: 12,
  y: 70,
 },
];

const tools = [
 ["Editor", "VS Code."],
 ["System", "macOS Tahoe on Apple silicon."],
 ["AI", "Claude Code every day, for building, reviewing and running the servers."],
 ["Mobile", "Xcode and Android Studio for the native Acme apps."],
 ["Browser", "Chrome."],
 ["Backend", "Go, Next.js, MariaDB, Redis and Nginx on my own Linux servers."],
 ["Network", "A private network that puts the laptop, the phone and the servers on one secure link."],
];

export default function SetupPage() {
 return (
  <div className="mx-auto mb-20 w-full max-w-5xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    My setup
    <Dot />
   </h1>
   <p className="mb-10 mt-2 max-w-2xl text-slate-600 dark:text-slate-400">The desk where Acme gets built, mostly after dark. Hover or tap the dots to see what is what.</p>
   <SetupView gear={gear} />
   <section className="mt-16" data-reveal>
    <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">On the screen</h2>
    <dl className="mt-3 divide-y divide-black/10 dark:divide-white/10">
     {tools.map(([k, v]) => (
      <div key={k} className="grid gap-1 py-3 sm:grid-cols-[120px_1fr] sm:gap-6">
       <dt className="text-sm font-medium text-zinc-500 dark:text-white/50">{k}</dt>
       <dd className="text-slate-700 dark:text-slate-300">{v}</dd>
      </div>
     ))}
    </dl>
    <p className="mt-8 text-sm text-zinc-500 dark:text-white/40">
     How this website is built is on <Link href="/colophon" className="underline underline-offset-4">its own page</Link>. Want the terminal version? <code className="text-[13px]">ssh example.com -p 2222</code>
    </p>
   </section>
  </div>
 );
}
