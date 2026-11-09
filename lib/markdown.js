import "server-only";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// ```diagram name``` fences become <div data-diagram="name"></div>; the page swaps in the React diagram.
function remarkDiagrams() {
 return (tree) => {
  visit(tree, "code", (node, index, parent) => {
   if (node.lang !== "diagram" || !parent) return;
   const name = String(node.meta || node.value.split("\n")[0] || "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
   parent.children[index] = {
    type: "diagram",
    data: { hName: "div", hProperties: { dataDiagram: /^[a-z0-9-]+$/.test(name) ? name : "unknown" } },
    children: [],
   };
  });
 };
}

// Content is written by the owner, but it is still sanitised (defence in depth) before
// the trusted highlighter runs.
const schema = {
 ...defaultSchema,
 clobberPrefix: "",
 attributes: {
  ...defaultSchema.attributes,
  code: [["className", /^language-./]],
  div: [...(defaultSchema.attributes.div || []), "dataDiagram"],
  img: ["src", "alt", "title", "width", "height"],
 },
 protocols: { ...defaultSchema.protocols, src: ["https", "http"] },
};

const processor = unified()
 .use(remarkParse)
 .use(remarkGfm)
 .use(remarkDiagrams)
 .use(remarkRehype)
 .use(rehypeSanitize, schema)
 .use(rehypeSlug)
 .use(rehypeAutolinkHeadings, { behavior: "wrap" })
 .use(rehypePrettyCode, { theme: { dark: "github-dark", light: "github-light" }, keepBackground: false })
 .use(rehypeStringify);

export async function renderMarkdown(md) {
 const file = await processor.process(md || "");
 return String(file);
}

// Split rendered HTML around diagram placeholders: [{html}, {diagram}, {html}...]
export function splitDiagrams(html) {
 const parts = [];
 const re = /<div data-diagram="([a-z0-9-]+)"><\/div>/g;
 let last = 0;
 let m;
 while ((m = re.exec(html))) {
  if (m.index > last) parts.push({ html: html.slice(last, m.index) });
  parts.push({ diagram: m[1] });
  last = re.lastIndex;
 }
 if (last < html.length) parts.push({ html: html.slice(last) });
 return parts;
}
