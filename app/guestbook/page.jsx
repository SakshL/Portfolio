import { GuestbookSign } from "components/features/GuestbookSign";
import { GuestbookViews } from "components/features/GuestbookWall";
import { getGuestbook, xray, formatDate } from "lib/api";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guestbook", description: "Leave a note. Sign in with GitHub." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default async function GuestbookPage() {
 const gb = await getGuestbook().catch(() => ({ open: false, entries: [] }));
 const notes = gb.entries.map((e) => ({ id: e.id, login: e.login, avatar: e.avatar, message: e.message, date: formatDate(e.at) }));
 return (
  <div className="mx-auto mb-20 w-full max-w-2xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Guestbook
    <Dot />
   </h1>
   <p className="mb-8 mt-2 text-slate-600 dark:text-slate-400">Passing through? Leave a note for me and the next visitor.</p>
   <GuestbookSign open={gb.open} />
   <GuestbookViews notes={notes}>
    <ul className="mt-6 space-y-5" data-xray={xray(gb, "approved notes · server component")}>
     {gb.entries.length === 0 && <li className="text-sm text-zinc-500 dark:text-white/40">No notes yet. Be the first.</li>}
     {gb.entries.map((e) => (
      <li key={e.id} className="flex gap-3">
       {/* eslint-disable-next-line @next/next/no-img-element */}
       {e.avatar ? <img src={e.avatar + (e.avatar.includes("?") ? "&" : "?") + "s=64"} alt="" width={32} height={32} loading="lazy" className="mt-0.5 h-8 w-8 rounded-full" /> : <span className="mt-0.5 h-8 w-8 rounded-full bg-black/10 dark:bg-white/10" />}
       <div className="min-w-0">
        <p className="text-sm">
         <a href={`https://github.com/${e.login}`} target="_blank" rel="noopener nofollow" className="font-semibold text-zinc-800 dark:text-white">
          {e.name || e.login}
         </a>
         <span className="ml-2 text-xs text-zinc-500 dark:text-white/40">{formatDate(e.at)}</span>
        </p>
        <p className="mt-0.5 break-words text-zinc-700 dark:text-white/80">{e.message}</p>
       </div>
      </li>
     ))}
    </ul>
   </GuestbookViews>
  </div>
 );
}
