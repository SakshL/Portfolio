import Architecture from "components/diagrams/Architecture";
import Link from "next/link";

export const metadata = { title: "Architecture", description: "An interactive map of how Acme is built: apps, the Go services, Redis, MariaDB, search, payments and AI." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default function ArchitecturePage() {
 return (
  <div className="mx-auto mb-20 w-full max-w-6xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    How Acme is built
    <Dot />
   </h1>
   <p className="mb-8 mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
    A simplified map of the system I built and run. Every request goes through one router, which decides whether the new Go code or the old Laravel code answers it. That switch is how the whole backend is moving to Go without downtime. The <Link href="/work" className="font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">case studies</Link> go deeper.
   </p>
   <Architecture />
  </div>
 );
}
