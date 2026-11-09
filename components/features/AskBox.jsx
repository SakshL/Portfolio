"use client";

import { AskChat } from "components/features/AskChat";

export function AskBox() {
 return (
  <div className="rounded-xl border bg-zinc-200/[25%] p-4 dark:border-neutral-800 dark:bg-[#161617] md:p-5">
   <AskChat />
   <p className="mt-4 text-xs text-zinc-500 dark:text-white/35">Answers come only from what I have written on this site, with links to the source. Questions are logged so I can see what people want to know.</p>
  </div>
 );
}
