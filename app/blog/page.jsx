import { PostList } from "components/content/PostList";
import { Subscribe } from "components/features/Subscribe";
import { CompanyBlog } from "components/content/CompanyBlog";
import { getPosts } from "lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog", description: "Engineering notes from building Acme, Nimbus and Acme POS in Nepal." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default async function Blog({ searchParams }) {
 const tag = typeof searchParams?.tag === "string" ? searchParams.tag.toLowerCase().slice(0, 30) : "";
 const all = await getPosts("post");
 const items = tag ? all.items.filter((p) => p.tags?.includes(tag)) : all.items;
 const tags = [...new Set(all.items.flatMap((p) => p.tags || []))].sort();
 return (
  <div className="mx-auto mb-20 w-full max-w-3xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Writing
    <Dot />
   </h1>
   <p className="mt-2 text-slate-600 dark:text-slate-400">Notes from building Acme, Nimbus and Acme POS in Nepal: what worked, what broke and what I would do again. For Acme's product news, see the <a href="https://blog.example.com" target="_blank" rel="noopener" className="font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">company blog</a>.</p>
   {tags.length > 0 && (
    <div className="mt-6 flex flex-wrap gap-1.5">
     <Link href="/blog" className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${!tag ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-black/[6%] text-zinc-600 dark:bg-white/10 dark:text-white/70"}`}>
      All
     </Link>
     {tags.map((t) => (
      <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tag === t ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-black/[6%] text-zinc-600 dark:bg-white/10 dark:text-white/70"}`}>
       {t}
      </Link>
     ))}
    </div>
   )}
   <div className="mt-6">
    <PostList items={items} />
   </div>
   {!tag && <CompanyBlog />}
   <div className="mt-12">
    <Subscribe />
   </div>
  </div>
 );
}
