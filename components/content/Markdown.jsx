import { Diagram } from "components/diagrams";
import { renderMarkdown, splitDiagrams } from "lib/markdown";

export async function Markdown({ md }) {
 const parts = splitDiagrams(await renderMarkdown(md));
 return (
  <div className="prose prose-zinc max-w-none dark:prose-dark prose-headings:tracking-[-0.02em] prose-a:text-[#1491ff] prose-pre:rounded-xl prose-img:rounded-xl dark:prose-a:text-[#64acff]">
   {parts.map((p, i) => (p.diagram ? <Diagram key={i} name={p.diagram} /> : <div key={i} dangerouslySetInnerHTML={{ __html: p.html }} />))}
  </div>
 );
}
