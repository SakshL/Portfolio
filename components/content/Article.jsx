import { Markdown } from "components/content/Markdown";
import { Subscribe } from "components/features/Subscribe";
import { ScrollStory } from "components/features/ScrollStory";
import { meta } from "config";
import { formatDate } from "lib/api";
import Link from "next/link";
import "styles/blog.css";

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export function Article({ data, base = "/blog", label = "Blog", preview = false, note = null }) {
 const { post, prev, next } = data;
 // case studies with a flow diagram get a sticky "reading along" diagram on wide screens
 const storyName = post.kind === "case_study" ? ((post.body_md || "").match(/```diagram ([a-z0-9-]+)/) || [])[1] : null;
 const story = storyName && storyName !== "architecture" ? storyName : null;
 const structured = {
  "@context": "https://schema.org",
  "@type": post.kind === "case_study" ? "TechArticle" : "BlogPosting",
  headline: post.title,
  description: post.summary,
  datePublished: post.publish_at,
  dateModified: post.updated_at || post.publish_at,
  author: { "@type": "Person", name: meta.author, url: meta.url, image: `${meta.url}/portrait.jpg` },
  url: `${meta.url}${base}/${post.slug}`,
 };
 return (
  <article className={`mx-auto mb-20 w-full ${story ? "max-w-2xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14" : "max-w-2xl"}`}>
   <div className="min-w-0">
   {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />}
   {preview && <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">Preview. Only people with this link can see it, and it expires in 30 minutes.</p>}
   <Link href={base} className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-white/50 dark:hover:text-white">
    ← {label}
   </Link>
   {note && (
    <p className="mt-4 rounded-lg border border-black/10 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:text-slate-400">
     {note.text}{" "}
     {note.original && (
      <Link href="?original=1" className="font-medium text-zinc-800 underline underline-offset-4 dark:text-white">
       {note.original}
      </Link>
     )}
    </p>
   )}
   <div style={{ viewTransitionName: "morph-card" }} className="mt-4 rounded-xl">
   <h1 style={{ viewTransitionName: "morph-title" }} className="text-[2.1rem] font-semibold leading-tight tracking-[-0.03em] text-zinc-800 dark:text-white md:text-[2.6rem]">
    {post.title}
    <Dot />
   </h1>
   {post.summary && <p style={{ viewTransitionName: "morph-summary" }} className="mt-3 text-lg text-slate-600 dark:text-slate-400">{post.summary}</p>}
   </div>
   <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-black/10 pb-6 text-sm text-zinc-500 dark:border-white/10 dark:text-white/50">
    <span>{meta.author}</span>
    <span>·</span>
    <time dateTime={post.publish_at}>{post.publish_at ? formatDate(post.publish_at) : "Draft"}</time>
    <span>·</span>
    <span>{post.reading_minutes} min read</span>
    {post.tags?.length > 0 && (
     <span className="flex flex-wrap gap-1.5">
      {post.tags.map((t) => (
       <Link key={t} href={`${base}?tag=${encodeURIComponent(t)}`} className="rounded-full bg-[#6310ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6310ff] dark:bg-[#1491ff]/20 dark:text-[#64acff]">
        {t}
       </Link>
      ))}
     </span>
    )}
   </div>
   <div className="mt-8" data-story-body>
    <Markdown md={post.body_md} />
   </div>
   {!preview && (
    <div className="mt-12">
     <Subscribe compact />
    </div>
   )}
   {(prev || next) && (
    <nav className="mt-14 grid gap-3 border-t border-black/10 pt-6 dark:border-white/10 sm:grid-cols-2">
     {prev ? (
      <Link href={`${base}/${prev.slug}`} className="rounded-xl border p-4 duration-200 hover:bg-zinc-200/50 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
       <span className="text-xs text-zinc-500 dark:text-white/40">Older</span>
       <span className="mt-1 block font-semibold text-zinc-800 dark:text-white">{prev.title}</span>
      </Link>
     ) : (
      <span />
     )}
     {next && (
      <Link href={`${base}/${next.slug}`} className="rounded-xl border p-4 text-right duration-200 hover:bg-zinc-200/50 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
       <span className="text-xs text-zinc-500 dark:text-white/40">Newer</span>
       <span className="mt-1 block font-semibold text-zinc-800 dark:text-white">{next.title}</span>
      </Link>
     )}
    </nav>
   )}
   </div>
   {story && (
    <aside className="hidden lg:block">
     <ScrollStory name={story} />
    </aside>
   )}
  </article>
 );
}

export function articleMetadata(post, base) {
 if (!post) return {};
 return {
  title: post.title,
  description: post.summary,
  alternates: { canonical: `${meta.url}${base}/${post.slug}` },
  openGraph: { title: post.title, description: post.summary, type: "article", publishedTime: post.publish_at, url: `${meta.url}${base}/${post.slug}` },
  twitter: { card: "summary_large_image", title: post.title, description: post.summary },
 };
}
