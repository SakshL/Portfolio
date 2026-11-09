import { meta } from "/config";
import { ConvertNumber } from "/lib/utils";
import Link from "next/link";
import { ConsoleInput } from "components/features/ConsoleInput";

function Prompt({ children }) {
 return (
  <div className="mt-2 first:mt-0">
   <span className="font-semibold text-[#ea4aaa]" aria-hidden="true">
    →
   </span>{" "}
   <span className="font-semibold text-[#66e777]" aria-hidden="true">
    ~/me
   </span>{" "}
   <span className="font-semibold italic text-slate-700 dark:text-slate-300" aria-hidden="true">
    $
   </span>{" "}
   <span className="italic">{children}</span>
  </div>
 );
}

function Out({ children }) {
 return <div className="pl-4 text-zinc-700 dark:text-white/80">{children}</div>;
}

export function CodeCard({ userData, contributions }) {
 return (
  <div data-console className="card cursor-text border-b-black/15 shadow-code block w-full rounded-md border text-sm backdrop-blur-md transition-colors motion-reduce:transition-none dark:border-[1px] dark:border-neutral-800 dark:bg-[#161617]/30">
   <div className="w-fill border-b-dark/5 relative flex h-8 items-center gap-[6px] border-b bg-white/[0.05%] p-2 dark:border-b-white/10">
    <div className="h-3.5 w-3.5 cursor-no-drop rounded-full bg-[#fb5f57]" />
    <div className="h-3.5 w-3.5 cursor-no-drop rounded-full bg-[#fdbf2d]" />
    <div className="h-3.5 w-3.5 cursor-no-drop rounded-full bg-[#27cb3f]" />
    <div className="absolute bottom-0 top-0 flex w-full items-center justify-center">
     <span className="opacity-50" aria-hidden="true">
      Console
     </span>
    </div>
   </div>
   <div data-console-scroll className="max-h-[440px] min-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain whitespace-nowrap p-4 leading-6">
    <Prompt>whoami</Prompt>
    <Out>
     <span className="font-semibold">Your Name</span> · founder &amp; developer
    </Out>
    <Prompt>ls building/</Prompt>
    <Out>
     <Link href="https://acme.example.com" target="_blank">
      acme/
     </Link>
     {"  "}
     <Link href="https://pay.example.com" target="_blank">
      nimbus/
     </Link>
     {"  "}
     <Link href="https://pos.example.com" target="_blank">
      acme-pos/
     </Link>
    </Out>
    <Prompt>cat stack.txt</Prompt>
    <Out>Go · Next.js · Swift · Kotlin · Redis</Out>
    {userData && contributions && (
     <>
      <Prompt>
       github --user=
       <Link href={`https://github.com/${meta.accounts.github.username}`} target="_blank">
        {meta.accounts.github.username}
       </Link>
      </Prompt>
      <Out>
       <span className="font-semibold">{ConvertNumber(userData.userStars)}</span> stars · <span className="font-semibold">{ConvertNumber(userData.userForks)}</span> forks · coding since 2018
      </Out>
     </>
    )}
    <ConsoleInput />
   </div>
  </div>
 );
}
