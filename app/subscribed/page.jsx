import Link from "next/link";

export const metadata = { title: "Subscribed", robots: { index: false } };

export default function Subscribed({ searchParams }) {
 const bad = searchParams?.error;
 return (
  <div className="mx-auto mb-20 mt-10 w-full max-w-xl text-center">
   <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">{bad ? "That link did not work" : "You are in"}</h1>
   <p className="mt-3 text-slate-600 dark:text-slate-400">{bad ? "It may be old or already used. Try subscribing again from the blog." : "Thanks for subscribing. You will get one email when a new post goes up."}</p>
   <Link href="/blog" className="mt-6 inline-block font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">
    Read the blog
   </Link>
  </div>
 );
}
