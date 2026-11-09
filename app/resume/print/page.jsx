import { getSite, monthYear } from "lib/api";
import { EB_Garamond } from "next/font/google";

// The CV PDF is printed from this page by headless Chromium (site-api → /v1/cv.pdf).
// Plain black and white, one column, A4.
export const dynamic = "force-dynamic";
export const metadata = { title: "CV (print)", robots: { index: false, follow: false } };

const serif = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"] });

function Section({ title, children }) {
 return (
  <section className="mt-5 break-inside-avoid-page">
   <h2 className="text-center text-[13px] font-medium uppercase tracking-[0.28em]">{title}</h2>
   <div className="mx-auto mb-3 mt-1 w-10 border-t border-black" />
   {children}
  </section>
 );
}

function Row({ left, right }) {
 return (
  <div className="flex items-baseline gap-2">
   <span className="font-semibold">{left}</span>
   <span className="flex-1 translate-y-[-3px] border-b border-dotted border-black/50" />
   <span className="whitespace-nowrap text-[12.5px]">{right}</span>
  </div>
 );
}

const span = (e) => (e.end && e.end === e.start ? monthYear(e.start) : `${monthYear(e.start)} – ${e.end ? monthYear(e.end) : "Present"}`);

export default async function ResumePrint({ searchParams }) {
 const site = await getSite({ focus: searchParams?.focus });
 const p = site?.profile || {};
 const work = (site?.experience || []).filter((e) => e.kind === "work");
 const lead = (site?.experience || []).filter((e) => e.kind === "leadership");
 const projects = (site?.projects || []).filter((x) => x.featured);
 const host = (u) => (u || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
 return (
  <div className={`${serif.className} cv mx-auto max-w-[760px] bg-white px-2 py-6 text-[13.5px] leading-[1.45] text-black`}>
   <style>{`@page { size: A4; margin: 14mm 15mm; } @media print { html, body { background: #fff !important; } .cv { padding: 0 !important; } }`}</style>
   <header className="text-center">
    <h1 className="text-[30px] font-normal uppercase tracking-[0.22em]">{p.name}</h1>
    <p className="mt-1 text-[16px]">{p.headline}</p>
    <p className="mt-1 text-[12.5px]">
     {[p.location, p.email, "example.com", host(p.links?.github), host(p.links?.linkedin)].filter(Boolean).join("  ·  ")}
    </p>
    <div className="mt-3 border-y-[1.5px] border-black py-[1.5px]" />
   </header>

   <Section title="Profile">
    <p className="text-justify">{(p.about_md || "").replace(/\*\*/g, "")}</p>
   </Section>

   {(p.strengths || []).length > 0 && (
    <Section title="How I work">
     <ul className="ml-5 list-disc space-y-0.5">
      {p.strengths.map((x) => (
       <li key={x.title}>
        <span className="font-semibold">{x.title}.</span> {x.body}
       </li>
      ))}
     </ul>
    </Section>
   )}

   <Section title="Experience">
    <div className="space-y-3">
     {work.map((e) => (
      <div key={e.id} className="break-inside-avoid">
       <Row left={e.org} right={span(e)} />
       <p className="italic">
        {e.title}
        {e.place ? `, ${e.place}` : ""}
       </p>
       {e.points?.length > 0 && (
        <ul className="ml-5 mt-1 list-disc">
         {e.points.map((pt) => (
          <li key={pt}>{pt}</li>
         ))}
        </ul>
       )}
      </div>
     ))}
    </div>
   </Section>

   {projects.length > 0 && (
    <Section title="Products">
     <ul className="ml-5 list-disc space-y-0.5">
      {projects.map((x) => (
       <li key={x.slug}>
        <span className="font-semibold">{x.name}</span>
        {x.url_label ? ` (${x.url_label})` : ""}: {x.summary}
       </li>
      ))}
     </ul>
    </Section>
   )}

   <Section title="Leadership">
    <div className="space-y-2">
     {lead.map((e) => (
      <div key={e.id} className="break-inside-avoid">
       <Row left={`${e.title}, ${e.org}`} right={span(e)} />
       {e.points?.[0] && <p>{e.points[0]}</p>}
      </div>
     ))}
    </div>
   </Section>

   <Section title="Skills">
    <table className="w-full">
     <tbody>
      {(p.skills || []).map((g) => (
       <tr key={g.label} className="align-top">
        <td className="w-[120px] pr-3 font-semibold">{g.label}</td>
        <td>{(g.items || []).join(", ")}</td>
       </tr>
      ))}
     </tbody>
    </table>
   </Section>

   <Section title="Education">
    {(p.education || []).map((e) => (
     <div key={e.school}>
      <Row left={e.school} right={[e.start, e.end].filter(Boolean).join(" – ")} />
      <p className="italic">
       {e.program}
       {e.place ? `, ${e.place}` : ""}
      </p>
     </div>
    ))}
   </Section>

   {(p.certifications || []).length > 0 && (
    <Section title="Certifications">
     <ul className="ml-5 list-disc">
      {p.certifications.map((c) => (
       <li key={c.name}>
        {c.name}, {c.org}
        {c.year ? ` (${c.year})` : ""}
       </li>
      ))}
     </ul>
    </Section>
   )}

   {(p.languages || []).length > 0 && (
    <Section title="Languages">
     <p className="text-center">{p.languages.join("  ·  ")}</p>
    </Section>
   )}
  </div>
 );
}
