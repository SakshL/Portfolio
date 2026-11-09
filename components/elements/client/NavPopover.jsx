"use client";

import { Transition, Popover } from "@headlessui/react";
import { BoltIcon, ChevronRightIcon, CodeBracketIcon, CodeBracketSquareIcon, ComputerDesktopIcon, EnvelopeOpenIcon, Squares2X2Icon, UserGroupIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const moreLinks = [
 { href: "/working-with-me", title: "Working with me", sub: "Hours, communication, releases", Icon: UserGroupIcon },
 { href: "/code", title: "Code I am proud of", sub: "Real snippets, with the why", Icon: CodeBracketSquareIcon },
 { href: "/now", title: "Shipping now", sub: "A running log of what I ship", Icon: BoltIcon },
 { href: "/architecture", title: "Architecture", sub: "How Acme fits together", Icon: Squares2X2Icon },
 { href: "/repositories", title: "Open source", sub: "My public GitHub repositories", Icon: CodeBracketIcon },
 { href: "/setup", title: "My setup", sub: "The desk where Acme gets built", Icon: ComputerDesktopIcon },
 { href: "/colophon", title: "How this site is built", sub: "Self-hosted Next.js and Go", Icon: WrenchScrewdriverIcon },
 { href: "/contact", title: "Contact", sub: "Work, partnerships or a chat", Icon: EnvelopeOpenIcon },
];
import clsx from "clsx";
import Link from "next/link";
import { makeT } from "lib/i18n";

export default function NavPopover({ ui = null, ...props }) {
 const t = makeT(ui);
 return (
  <Popover {...props}>
   {({ open, close }) => (
    <>
     <Popover.Button
      className={clsx(
       {
        "active bg-black/10 text-gray-800 dark:bg-white/10 dark:text-gray-200": open,
        "text-gray-600 dark:text-gray-400": !open,
       },
       "nav-border group relative hidden rounded-lg p-1 transition-all duration-200 hover:bg-black/10 hover:text-gray-800 motion-reduce:transition-none dark:hover:bg-white/10 dark:hover:text-gray-200 sm:px-3 sm:py-2 md:flex md:items-center"
      )}
     >
      <span>{t("More")}</span>
      <ChevronRightIcon
       className={clsx(
        {
         "rotate-90 text-gray-800 dark:text-gray-200": open,
         "text-gray-600 dark:text-gray-400": !open,
        },
        "ml-1 h-4 w-4 duration-150 ease-in-out group-hover:rotate-90 group-hover:text-gray-800 dark:group-hover:text-gray-200"
       )}
      />
     </Popover.Button>
     <Transition enter="transition ease-out duration-100 motion-reduce:transition-none" enterFrom="transform opacity-0 duration-100 scale-95 motion-reduce:transition-none" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-100 motion-reduce:transition-none" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
      <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform rounded-lg border-[1px] border-black/[10%] bg-white/90 px-4 pt-3 opacity-100 shadow-lg backdrop-blur-xl duration-100 dark:border-neutral-800 dark:bg-[#161617]/90 sm:px-0 ">
       <div className="relative p-3">
        {moreLinks.map(({ href, title, sub, Icon }, i) => (
         <Link key={href} href={href} onClick={() => close()} className={clsx(i > 0 && "mt-1", "flex items-center rounded-lg p-3 transition duration-150 ease-in-out hover:bg-blue-400/20 dark:hover:bg-white/5")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-400/20 text-white dark:bg-white/10 dark:text-zinc-800 sm:h-12 sm:w-12">
           <Icon className="inline h-[24px] w-[24px] stroke-black duration-200 motion-reduce:transition-none dark:stroke-white/[70%]" />
          </div>
          <div className="ml-4">
           <p className="text-sm font-medium text-gray-900 dark:text-white">{t(title)}</p>
           <p className="text-sm text-gray-500 dark:text-gray-400">{t(sub)}</p>
          </div>
         </Link>
        ))}
       </div>
      </Popover.Panel>
     </Transition>
    </>
   )}
  </Popover>
 );
}
