import { StarIcon, ArchiveBoxIcon, FolderIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const ForkIcon = (props) => (
 <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
  <path fill="currentColor" d="M9 10a3 3 0 1 1 0-6a3 3 0 0 1 0 6Zm1 1.9A5.002 5.002 0 0 0 9 2a5 5 0 0 0-1 9.9v8.2A5.002 5.002 0 0 0 9 30a5 5 0 0 0 1-9.9V18h9a5 5 0 0 0 5-5v-1.1A5.002 5.002 0 0 0 23 2a5 5 0 0 0-1 9.9V13a3 3 0 0 1-3 3h-9v-4.1ZM23 10a3 3 0 1 1 0-6a3 3 0 0 1 0 6ZM12 25a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z" />
 </svg>
);

export function RepoCard(repo) {
 const description = repo.description ? (repo.description.length > 110 ? `${repo.description.substring(0, 110)}...` : repo.description) : "No description";
 const language = repo.primaryLanguage ? repo.primaryLanguage.name : "Markdown";

 return (
  <Link id={repo.name} href={repo.url} target="_blank" className="card group z-10 flex h-full flex-col rounded-xl border bg-zinc-200/[25%] p-5 text-left backdrop-blur-md duration-200 ease-in-out hover:bg-zinc-200/60 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700 dark:hover:bg-[#1b1b1c]">
   <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-white">
    <FolderIcon className="h-5 w-5 flex-none fill-black/[10%] stroke-black/[70%] dark:fill-white/[10%] dark:stroke-white/[70%]" />
    <span className="truncate">{repo.name.replace(/-/g, " ")}</span>
    <span className="ml-auto text-sm opacity-40 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none">↗</span>
   </div>
   <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
   <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-800/60 dark:text-white/60">
    <span className="flex items-center gap-1.5">
     <span className="block h-2.5 w-2.5 rounded-full bg-gray-400" style={{ backgroundColor: repo.primaryLanguage ? repo.primaryLanguage.color : "" }}></span>
     {language}
    </span>
    <span className="flex items-center gap-1">
     <StarIcon className="h-4 w-4" aria-hidden="true" /> {repo.stargazerCount}
    </span>
    <span className="flex items-center gap-1">
     <ForkIcon className="h-4 w-4" /> {repo.forkCount}
    </span>
    {repo.isArchived && (
     <span className="flex items-center gap-1">
      <ArchiveBoxIcon className="h-4 w-4" aria-hidden="true" /> Archived
     </span>
    )}
   </div>
  </Link>
 );
}

export function RepoCardSkeleton() {
 return (
  <div className="rounded-xl border border-black/[15%] bg-white p-5 dark:border-neutral-800 dark:bg-[#161617]">
   <div className="h-6 w-2/4 animate-pulse rounded-md bg-zinc-200/[15%]" />
   <div className="mt-3 h-6 w-5/6 animate-pulse rounded-md bg-zinc-200/[15%]" />
   <div className="mt-3 flex gap-2">
    {Array.from({ length: 3 }).map((_, index) => (
     <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200/[15%]" key={index} />
    ))}
   </div>
  </div>
 );
}
