import { header, contact, meta, technologies } from "/config";
import { formatDate, getSite, xray } from "lib/api";
import { AskBox } from "components/features/AskBox";
import { NepalClock } from "components/features/NepalClock";
import { HeroBuddy } from "components/features/HeroBuddy";
import { ProductShowcase } from "components/elements/ProductShowcase";
import { References } from "components/elements/References";
import { getT } from "lib/lang";
import { Rich } from "components/elements/Rich";
import { UI } from "lib/i18n";
import { ConvertNumber } from "/lib/utils";
import { UsersIcon, StarIcon } from "@heroicons/react/24/outline";
import sparkles from "/public/assets/svg/sparkles.svg";
import Dots from "components/decorations/Dots";
import { CodeCard } from "components/elements/CodeCard";
import { NameBuild } from "components/features/NameBuild";
import { Contact } from "components/elements/client/Contact";
import { RepoCard } from "components/elements/RepoCard";
import { GetUserData, GetPopular, getTotalContributionsForYears } from "lib/graphql";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ArrowIcon = () => (
 <svg className="arrowSymbol inline-block translate-x-[5px] duration-200 group-hover:translate-x-[10px] motion-reduce:transition-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path fill="currentColor" d="M7.28033 3.21967C6.98744 2.92678 6.51256 2.92678 6.21967 3.21967C5.92678 3.51256 5.92678 3.98744 6.21967 4.28033L7.28033 3.21967ZM11 8L11.5303 8.53033C11.8232 8.23744 11.8232 7.76256 11.5303 7.46967L11 8ZM6.21967 11.7197C5.92678 12.0126 5.92678 12.4874 6.21967 12.7803C6.51256 13.0732 6.98744 13.0732 7.28033 12.7803L6.21967 11.7197ZM6.21967 4.28033L10.4697 8.53033L11.5303 7.46967L7.28033 3.21967L6.21967 4.28033ZM10.4697 7.46967L6.21967 11.7197L7.28033 12.7803L11.5303 8.53033L10.4697 7.46967Z"></path>
  <path stroke="currentColor" d="M1.75 8H11" strokeWidth={2} strokeLinecap="round"></path>
 </svg>
);

export const metadata = {
 title: { absolute: "Your Name | Founder of Acme, full-stack developer in Nepal" },
 description: "Your Name is the founder of Acme and a full-stack developer in Your City, Nepal. He builds the apps, the Go backend and the servers they run on.",
 alternates: { canonical: "/" },
};

// who this site is about, for Google: a Person, linked to every profile, and the site itself
function personJsonLd(site) {
 const p = site?.profile || {};
 const links = p.links || {};
 return {
  "@context": "https://schema.org",
  "@graph": [
   {
    "@type": "Person",
    "@id": `${meta.url}/#person`,
    name: "Your Name",
    alternateName: ["Your Name", "your-github"],
    url: meta.url,
    image: { "@type": "ImageObject", url: `${meta.url}/portrait.jpg`, width: 800, height: 800, caption: "Your Name" },
    jobTitle: "Founder and full-stack developer",
    description: p.tagline || meta.description,
    worksFor: { "@type": "Organization", name: "Acme", url: "https://acme.example.com" },
    address: { "@type": "PostalAddress", addressLocality: "Your City", addressCountry: "NP" },
    nationality: { "@type": "Country", name: "Nepal" },
    knowsAbout: ["Go", "Next.js", "React", "TypeScript", "Laravel", "Swift", "Kotlin", "Flutter", "Linux servers", "Product engineering", "Team management"],
    sameAs: [
     `https://github.com/${meta.accounts.github.username}`,
     `https://www.linkedin.com/in/${meta.accounts.linkedin.username}/`,
     `https://www.facebook.com/${meta.accounts.facebook.username}`,
     `https://www.instagram.com/${meta.accounts.instagram.username}/`,
     `https://x.com/${meta.accounts.twitter.username.replace("@", "")}`,
     links.linkedin,
    ].filter((v, i, a) => v && a.indexOf(v) === i),
   },
   { "@type": "WebSite", "@id": `${meta.url}/#website`, url: meta.url, name: "Your Name", publisher: { "@id": `${meta.url}/#person` }, inLanguage: "en" },
   { "@type": "ProfilePage", "@id": `${meta.url}/#profile`, url: meta.url, name: "Your Name", mainEntity: { "@id": `${meta.url}/#person` }, isPartOf: { "@id": `${meta.url}/#website` } },
  ],
 };
}

function Headline({ text }) {
 // keep the word Acme in Acme yellow
 const parts = String(text).split(/(Acme)/);
 return parts.map((p, i) =>
  p === "Acme" ? (
   <span key={i} className="rounded-md bg-[#FFD60A] px-1.5 text-zinc-900 dark:bg-transparent dark:px-0 dark:text-[#FFD60A]">
    Acme
   </span>
  ) : (
   <span key={i}>{p}</span>
  )
 );
}

export default async function HomePage({ searchParams }) {
 const repos = await GetPopular();
 const reposData = repos.repositories.edges;
 const userData = await GetUserData();
 const contributions = await getTotalContributionsForYears();
 const site = await getSite({ ref: searchParams?.ref }).catch(() => null);
 const featured = (site?.projects || []).filter((p) => p.featured);
 const alsoBuilt = (site?.projects || []).filter((p) => !p.featured).map((p) => ({ name: p.name, text: p.summary, href: p.url || undefined }));
 const cases = site?.case_studies || [];
 const ship = (site?.ship || []).slice(0, 6);
 const posts = (site?.posts_recent || []).slice(0, 3);
 const { t, dict, lang } = await getT();
 const ne = dict?.profile || {};
 const clock = lang === "en" ? null : Object.fromEntries(UI.filter((x) => x.startsWith("I'm probably") || x.startsWith("It's {time}")).map((x) => [x, t(x)]));
 const strengths = ne.strengths?.length ? ne.strengths : site?.profile?.strengths || [];

 return (
  <>
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(site)).replace(/</g, "\\u003c") }} />
   <div className="bg-cover bg-fixed bg-right before:absolute before:inset-0 before:z-[-1] before:bg-[length:30px_30px] before:bg-center before:opacity-5 before:bg-grid-[#000] dark:before:bg-grid-[#fff]">
    <div className="move-area mx-auto -mt-24 flex flex-1 pb-14 pt-36 md:min-h-screen md:py-0 flex-col justify-center duration-300 motion-reduce:transition-none md:w-[90%] xl:w-4/5">
     <div className="md:grid-cols-0 grid lg:grid-cols-5">
      <div className="flex flex-col items-center md:col-span-3 md:items-start">
       <NameBuild text={header.title} className="relative m-0 text-center text-[51px] font-black leading-[1.02] tracking-[-0.04em] text-zinc-800 dark:text-white md:text-left md:text-[64px] lg:text-[76px] xl:text-[88px]" />
       <h2 className="mt-3 text-center text-[1.35rem] font-semibold text-zinc-800/80 dark:text-white/80 md:text-left md:text-[1.6rem]">
        {site?.focus && site?.profile?.headline ? (
         <Headline text={site.profile.headline} />
        ) : (
         <Rich text={t("Founder of {acme} · Full-stack developer")} parts={{ acme: <span className="rounded-md bg-[#FFD60A] px-1.5 text-zinc-900 dark:bg-transparent dark:px-0 dark:text-[#FFD60A]">Acme</span> }} />
        )}
       </h2>
       <p className="mt-3 max-w-lg text-center text-lg text-slate-600 dark:text-slate-400 md:text-left">{ne.tagline || header.description}</p>
       <NepalClock labels={clock} />
       <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <Link data-magnet href="#work" className="dark:hover:bg-white/85 group inline-flex items-center rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white duration-200 hover:bg-zinc-700 motion-reduce:transition-none dark:bg-white dark:text-zinc-900">
         {t("See my work")}
         <ArrowIcon />
        </Link>
        <Link data-magnet href="/cv.pdf" target="_blank" className="border-black/15 inline-flex items-center rounded-xl border px-5 py-3 font-semibold text-zinc-800 duration-200 hover:bg-black/5 motion-reduce:transition-none dark:border-neutral-700 dark:text-white dark:hover:bg-white/[6%]">
         {t("Download CV")}
        </Link>
        <Link href="/resume" className="arrow link group relative ml-1 inline-block p-2 pb-1 pl-0 pr-0 font-semibold">
         <>
          {t("View CV")}
          <ArrowIcon />
         </>
        </Link>
       </div>
      </div>

      <div className="hidden items-center motion-reduce:transition-none md:col-span-3 md:-mb-7 md:mt-7 md:flex lg:col-span-2 lg:mb-0 lg:mt-0">
       <div className="relative w-full pt-28">
        <HeroBuddy />
        <div className="force-ltr relative z-10 block w-full">
         <CodeCard userData={userData} contributions={contributions} />
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>

   <section id={"additional-info"}>
    <div>
     <hr className="m-[0_auto] mb-8 h-[1px] w-full border-none bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.2)_50%,transparent)] px-8 duration-300 motion-reduce:transition-none dark:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1)_50%,transparent)]" />
     <div className="m-[0_auto] mb-8 grid grid-cols-3 gap-x-6 gap-y-10 px-8 text-center  text-zinc-800/70 dark:text-white/70 md:grid-cols-4 md:gap-x-10 lg:grid-cols-4">
      <p className="font-semibold duration-200 motion-reduce:transition-none">
       <Link target="_blank" className="group flex items-center justify-center text-center duration-200 hover:text-zinc-800 motion-reduce:transition-none dark:hover:text-white" href={`https://github.com/${meta.accounts.github.username}`}>
        <>
         <StarIcon className="-mt-[2px] mr-1 inline h-5 w-5 stroke-black/[50%] duration-200 group-hover:stroke-black motion-reduce:transition-none dark:stroke-white/[70%] dark:group-hover:stroke-white" aria-hidden="true" role="img" /> <span>{userData && ConvertNumber(userData.userStars)} {t("Stars on repositories")}</span>
        </>
       </Link>
      </p>
      <p className="hidden font-semibold duration-200 motion-reduce:transition-none md:block">
       <Link target="_blank" className="group flex items-center justify-center text-center duration-200 hover:text-zinc-800 motion-reduce:transition-none dark:hover:text-white" href={`https://github.com/${meta.accounts.github.username}`}>
        <>
         <svg className="mr-1 inline h-5 w-5 fill-black/[50%] duration-200 group-hover:fill-black motion-reduce:transition-none dark:fill-white/[70%] dark:group-hover:fill-white" aria-hidden="true" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"></path>
         </svg>
         <span>{userData && ConvertNumber(contributions.total)} {t("Commits")}</span>
        </>
       </Link>
      </p>
      <p className="font-semibold duration-200 motion-reduce:transition-none">
       <Link target="_blank" className="group flex items-center justify-center text-center duration-200 hover:text-zinc-800 motion-reduce:transition-none dark:hover:text-white" href={`https://github.com/${meta.accounts.github.username}`}>
        <>
         <svg viewBox="0 0 32 32" className="-mt-[2px] mr-1 inline h-5 w-5 fill-black/[50%] duration-200 group-hover:fill-black motion-reduce:transition-none dark:fill-white/[70%] dark:group-hover:fill-white" aria-hidden="true" role="img">
          <path fill="currentColor" d="M9 10a3 3 0 1 1 0-6a3 3 0 0 1 0 6Zm1 1.9A5.002 5.002 0 0 0 9 2a5 5 0 0 0-1 9.9v8.2A5.002 5.002 0 0 0 9 30a5 5 0 0 0 1-9.9V18h9a5 5 0 0 0 5-5v-1.1A5.002 5.002 0 0 0 23 2a5 5 0 0 0-1 9.9V13a3 3 0 0 1-3 3h-9v-4.1ZM23 10a3 3 0 1 1 0-6a3 3 0 0 1 0 6ZM12 25a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z" />
         </svg>{" "}
         <span>{userData && ConvertNumber(userData.userForks)} {t("Repositories forks")}</span>
        </>
       </Link>
      </p>
      <p className="font-semibold duration-200 motion-reduce:transition-none">
       <Link target="_blank" className="group flex items-center justify-center text-center duration-200 hover:text-zinc-800 motion-reduce:transition-none dark:hover:text-white" href={`https://github.com/${meta.accounts.github.username}?tab=followers`}>
        <>
         <UsersIcon className="-mt-[2px] mr-1 inline h-5 w-5 stroke-black/[50%] duration-200 group-hover:stroke-black motion-reduce:transition-none dark:stroke-white/[70%] dark:group-hover:stroke-white" aria-hidden="true" role="img" /> <span>{userData && ConvertNumber(userData.userFollowers)} {t("Github Followers")}</span>
        </>
       </Link>
      </p>
     </div>
    </div>
   </section>

   <section id={"work"} data-reveal className="scroll-mt-20 pt-12 lg:px-24">
    <h3 className="m-6 mb-2 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
     {t("What I'm building")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
    </h3>
    <p className="mb-10 text-center text-slate-600 dark:text-slate-400">{t("Live products, used every day in Eastern Nepal.")}</p>
    <div data-xray={xray(site, site?.focus ? `server component · ordered for ${site.focus}` : "server component")}>
     <ProductShowcase projects={featured} />
    </div>
    <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
     {alsoBuilt.map((item) => {
      const inner = (
       <>
        <span className="block font-semibold text-zinc-800 dark:text-white">{item.name}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{item.text}</span>
       </>
      );
      const cls = "block h-full rounded-xl border bg-zinc-200/[25%] px-4 py-3 backdrop-blur-[9px] duration-200 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617]";
      return item.href ? (
       <Link key={item.name} href={item.href} target="_blank" className={`${cls} hover:bg-zinc-200/60 dark:hover:border-neutral-700 dark:hover:bg-[#202021]`}>
        {inner}
       </Link>
      ) : (
       <div key={item.name} className={cls}>
        {inner}
       </div>
      );
     })}
    </div>
   </section>

   <section id={"engineering"} data-reveal className="scroll-mt-20 pt-16 lg:px-24">
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.4fr_1fr]">
     <div>
      <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
       {t("Case studies")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
      </h3>
      <p className="mb-5 text-slate-600 dark:text-slate-400">{t("The engineering behind Acme, in depth.")}</p>
      <div className="grid gap-3" data-xray={xray(site, "case_studies[] · server component")}>
       {cases.slice(0, 4).map((c) => (
        <Link data-morph key={c.slug} href={`/work/${c.slug}`} className="group rounded-xl border bg-zinc-200/[25%] p-4 duration-200 hover:border-black/25 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
         <span data-morph-title className="block font-semibold text-zinc-800 dark:text-white">{c.title}</span>
         <span data-morph-summary className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{c.summary}</span>
        </Link>
       ))}
       <Link href="/architecture" className="group rounded-xl border border-dashed p-4 duration-200 hover:border-black/25 dark:border-neutral-700 dark:hover:border-neutral-500">
        <span className="block font-semibold text-zinc-800 dark:text-white">{t("Interactive architecture map →")}</span>
        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{t("Apps, Go services, Redis, MariaDB, search, payments and AI. Hover any part.")}</span>
       </Link>
      </div>
     </div>
     <div>
      <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
       {t("Shipping now")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
      </h3>
      <p className="mb-5 text-slate-600 dark:text-slate-400">{t("What went live lately.")}</p>
      <ol className="border-l border-black/10 dark:border-white/10" data-xray={xray(site, "ship[] · server component")}>
       {ship.map((s) => (
        <li key={s.id} className="relative pb-4 pl-5 last:pb-0">
         <span className="absolute -left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border-2 border-zinc-400 bg-white dark:border-neutral-600 dark:bg-[#121212]" />
         <p className="text-sm text-zinc-800 dark:text-white">{s.text}</p>
         <p className="text-xs text-zinc-500 dark:text-white/40">{new Date(s.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}</p>
        </li>
       ))}
      </ol>
      <Link href="/now" className="mt-4 inline-block text-sm font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">
       {t("Full log")}
      </Link>
     </div>
    </div>
    {posts.length > 0 && (
     <div className="mx-auto mt-14 max-w-5xl">
      <div className="mb-5 flex items-end justify-between">
       <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
        {t("Writing")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
       </h3>
       <Link href="/blog" className="text-sm font-medium text-zinc-800 underline decoration-black/20 underline-offset-4 dark:text-white dark:decoration-white/25">
        {t("All posts")}
       </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3" data-xray={xray(site, "posts_recent[] · server component")}>
       {posts.map((p) => (
        <Link data-morph key={p.slug} href={`/blog/${p.slug}`} className="flex flex-col rounded-xl border bg-zinc-200/[25%] p-4 duration-200 hover:border-black/25 dark:border-neutral-800 dark:bg-[#161617] dark:hover:border-neutral-700">
         <span className="text-xs text-zinc-500 dark:text-white/40">
          {formatDate(p.publish_at)} · {p.reading_minutes} min
         </span>
         <span data-morph-title className="mt-2 font-semibold text-zinc-800 dark:text-white">{p.title}</span>
         <span data-morph-summary className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.summary}</span>
        </Link>
       ))}
      </div>
     </div>
    )}
   </section>

   {site?.features?.ask && (
    <section id={"ask"} data-reveal className="scroll-mt-20 pt-16 lg:px-24">
     <div className="mx-auto max-w-3xl" data-xray="POST /v1/ask · retrieval over my posts + Claude · client component">
      <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
       {t("Ask about my work")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
      </h3>
      <p className="mb-5 text-slate-600 dark:text-slate-400">{t("A short answer with links to where I wrote about it.")}</p>
      <AskBox />
     </div>
    </section>
   )}

   {strengths.length > 0 && (
    <section id={"how-i-work"} data-reveal className="scroll-mt-20 pt-16 lg:px-24">
     <h3 className="m-6 mb-2 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
      {t("How I work")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
     </h3>
     <p className="mb-8 text-center text-slate-600 dark:text-slate-400">{t("What a team gets when I join.")}</p>
     <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3" data-xray={xray(site, "profile.strengths[] · edited in Studio")}>
      {strengths.map((x) => (
       <div key={x.title} className="spot rounded-xl border bg-zinc-200/[25%] p-5 dark:border-neutral-800 dark:bg-[#161617]">
        <h4 className="font-semibold text-zinc-800 dark:text-white">{x.title}</h4>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{x.body}</p>
       </div>
      ))}
     </div>
     <References items={site.profile.references} className="mx-auto mt-4 max-w-5xl" />
     <p className="mt-6 text-center">
      <Link href="/working-with-me" className="arrow link group relative inline-block font-semibold text-zinc-800 dark:text-white">
       {t("Working with me")}
       <ArrowIcon />
      </Link>
     </p>
    </section>
   )}

   <section id={"about"} data-reveal className="scroll-mt-20 pt-12 lg:px-24">
    <div className="relative mx-auto mb-7 text-center">
     <span className="absolute right-0 top-[90px] z-[-1] fill-black/40 dark:fill-neutral-800">
      <Dots h="107" w="134" />
     </span>
     <span className="absolute -bottom-7 left-0 z-[-1] fill-black/40 dark:fill-neutral-800">
      <Dots h="70" w="134" />
     </span>
     <Image src={sparkles} alt="sparkles" width={"auto"} height={"auto"} className="hide pointer-events-none m-[0_auto] animate-pulse" />
     <h3 className="m-6 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
      {t("About me")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
     </h3>

     <div className="prose m-auto px-6 text-center  dark:prose-dark">
      <p>{t("I started coding at the end of 2018, building websites with HTML, CSS and JavaScript in Discord developer communities.")}</p>
      <p>{t("I learned Node.js by making Discord bots and shared them as open source. Then React, Next.js and Tailwind, and then real products: apps, backends and servers.")}</p>
      <p>
       <Rich
        text={t("In July 2025 I started {acme}. Today it delivers in Northtown and Southtown, and I'm building {nimbus} next to it. Outside code, I [a line about your hobbies].")}
        parts={{
         acme: (
          <Link href="https://acme.example.com" target="_blank">
           Acme
          </Link>
         ),
         nimbus: (
          <Link href="https://pay.example.com" target="_blank">
           Nimbus
          </Link>
         ),
        }}
       />
      </p>
      <p>
       <Link href="/setup">{t("See my desk and the tools I use")}</Link>
      </p>
     </div>
    </div>
   </section>

   <section id={"repositories"} data-reveal className="scroll-mt-20 pt-12 lg:px-24">
    <div className="relative mx-auto before:absolute before:inset-0 before:z-[-1] before:bg-[length:22px_22px] before:bg-center before:bg-repeat-space before:opacity-10 before:bg-grid-[#000] before:gradient-mask-t-0 dark:before:opacity-20 dark:before:bg-grid-[#fff]" id={"repositories"}>
     <h3 className="m-6 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
      {t("Open source")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
     </h3>
     <div className="relative">
      <div className="mx-auto mb-4 grid max-w-6xl grid-cols-1 gap-4 text-zinc-800 dark:text-white md:grid-cols-2 lg:grid-cols-3">
       {reposData &&
        reposData.map((repo) => {
         return repo.node.owner.login == "your-github" ? <RepoCard key={repo.node.id} {...repo.node} /> : null;
        })}
      </div>
      <div className="flex pb-4">
       <div className="flex flex-1 flex-col items-center justify-center duration-200 motion-reduce:transition-none">
        <Link className="arrow link group pointer-events-auto relative mt-5 inline-block items-center justify-center p-2 pb-1 pl-0 pr-0  font-semibold duration-200 motion-reduce:transition-none" href="/repositories">
         <>
          {t("See all repositories")}
          <svg className="arrowSymbol inline-block translate-x-[5px] duration-200 group-hover:translate-x-[10px] motion-reduce:transition-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
           <path fill="currentColor" d="M7.28033 3.21967C6.98744 2.92678 6.51256 2.92678 6.21967 3.21967C5.92678 3.51256 5.92678 3.98744 6.21967 4.28033L7.28033 3.21967ZM11 8L11.5303 8.53033C11.8232 8.23744 11.8232 7.76256 11.5303 7.46967L11 8ZM6.21967 11.7197C5.92678 12.0126 5.92678 12.4874 6.21967 12.7803C6.51256 13.0732 6.98744 13.0732 7.28033 12.7803L6.21967 11.7197ZM6.21967 4.28033L10.4697 8.53033L11.5303 7.46967L7.28033 3.21967L6.21967 4.28033ZM10.4697 7.46967L6.21967 11.7197L7.28033 12.7803L11.5303 8.53033L10.4697 7.46967Z"></path>
           <path stroke="currentColor" d="M1.75 8H11" strokeWidth={2} strokeLinecap="round"></path>
          </svg>
         </>
        </Link>
       </div>
      </div>
     </div>
    </div>
   </section>
   <section id={"techs"} data-reveal className="scroll-mt-20 pt-12 lg:px-24">
    <div className="relative mx-auto mb-7 text-center">
     <span className="absolute right-0 top-[90px] z-[-1] fill-black/40 dark:fill-neutral-800">
      <Dots h="107" w="134" />
     </span>
     <span className="absolute -bottom-7 left-0 z-[-1] fill-black/40 dark:fill-neutral-800">
      <Dots h="70" w="134" />
     </span>

     <h3 className="m-6 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
      {t("Technologies I use")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
     </h3>
    </div>
    <div className="mt-6 grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
     {technologies.map((tech, index) => {
      return (
       <div key={index}>
        {tech.link ? (
         <Link href={tech.link} target="_blank" className="relative mx-auto flex w-full cursor-pointer items-center justify-between rounded-xl border bg-zinc-200/[25%] px-4 py-2 text-sm font-semibold text-blue-900 backdrop-blur-[9px] duration-200 hover:bg-zinc-200/60 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617] dark:text-white dark:hover:border-neutral-700 dark:hover:bg-[#202021]">
          <Image className={`${tech.class ?? ""} h-8 w-8 rounded-md`} loading="lazy" width={32} height={32} src={tech.icon} alt={tech.name} />
          <span className="font-semibold">{tech.name}</span>
         </Link>
        ) : (
         <div key={index} className="relative mx-auto flex w-full cursor-pointer items-center justify-between rounded-xl border bg-zinc-200/[25%] px-4 py-2 text-sm font-semibold text-blue-900 backdrop-blur-[9px] duration-200 hover:bg-zinc-200/60 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617] dark:text-white dark:hover:border-neutral-700 dark:hover:bg-[#202021]">
          <Image className={`${tech.class ?? ""} h-8 w-8 rounded-md`} loading="lazy" width={32} height={32} src={tech.icon} alt={tech.name} />
          <span className="font-semibold">{tech.name}</span>
         </div>
        )}
       </div>
      );
     })}
    </div>
    <p className="mt-9 text-center  text-xl font-semibold ">{t("...and many others!")}</p>
   </section>

   <section id={"contact"}>
    <div className="h-full scroll-mt-20 py-36 pt-24 lg:px-36">
     <header>
      <Image src={sparkles} alt="sparkles" width={"auto"} height={"auto"} className="hide pointer-events-none m-[0_auto] animate-pulse" />
      <h3 className="m-6 mb-2 text-center text-[35px] font-semibold tracking-[-0.03em] text-zinc-800 duration-300 motion-reduce:transition-none dark:text-white md:text-[35px] lg:text-[37px] xl:text-[40px]">
       {t("Contact me")}<span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
      </h3>
      <p className="pb-1 text-center text-base text-gray-600 dark:text-gray-300">{t("Do you want to stay in touch?")}</p>
     </header>
     <div className="relative">
      <div className="relative mt-6 grid h-full w-full grid-cols-1 gap-6 divide-x divide-none dark:divide-none md:grid-cols-2 md:divide-gray-200 md:dark:divide-white/20">
       <div className="relative m-[0_auto] mb-4 flex w-full max-w-screen-sm rounded-[10px] border-[1px] border-black/[15%] bg-white p-5 shadow-lg duration-200 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617]">
        <Contact />
       </div>
       <div className="space-y-4 p-4">
        <p className=" text-xl font-semibold">{t("Or contact me with...")}</p>
        {contact.links.map((element, index) => (
         <Link className="group ml-auto mt-2 flex h-12 w-full items-center gap-3 rounded-md border bg-zinc-200/[25%] px-4 py-2 text-sm font-semibold text-blue-900 backdrop-blur-[9px] duration-200 hover:bg-zinc-200/60 motion-reduce:transition-none dark:border-neutral-800 dark:bg-[#161617] dark:text-white dark:hover:border-neutral-700 dark:hover:bg-[#202021]" href={element.href} key={index} target="_blank">
          <>
           {element.icon} {element.title}
          </>
         </Link>
        ))}
       </div>
       <span className="absolute right-0 top-[90px] z-[-1] fill-black/40 dark:fill-neutral-800">
        <Dots h="107" w="134" />
       </span>
       <span className="absolute -bottom-7 left-0 z-[-1] fill-black/40 dark:fill-neutral-800">
        <Dots h="70" w="134" />
       </span>
      </div>
     </div>
    </div>
   </section>
  </>
 );
}
