import Link from "next/link";

export const metadata = { title: "Unsubscribed", robots: { index: false } };

export default function Unsubscribed() {
 return (
  <div className="mx-auto mb-20 mt-10 w-full max-w-xl text-center">
   <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">You are unsubscribed</h1>
   <p className="mt-3 text-slate-600 dark:text-slate-400">No more emails from me. The blog is still here whenever you want it.</p>
   <Link href="/blog" className="mt-6 inline-block font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">
    Back to the blog
   </Link>
  </div>
 );
}
