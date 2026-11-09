import { meta } from "config";
import { getPosts } from "lib/api";

export const dynamic = "force-dynamic";

const esc = (s) => String(s || "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export async function GET() {
 const [posts, cases] = await Promise.all([getPosts("post"), getPosts("case_study")]);
 const items = [...cases.items.map((p) => ({ ...p, path: "/work" })), ...posts.items.map((p) => ({ ...p, path: "/blog" }))].sort((a, b) => (a.publish_at < b.publish_at ? 1 : -1));
 const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(meta.title)}</title>
<link>${meta.url}</link>
<description>Engineering notes from building Acme, Nimbus and Acme POS.</description>
<language>en</language>
<atom:link href="${meta.url}/feed" rel="self" type="application/rss+xml"/>
${items
 .map(
  (p) => `<item>
<title>${esc(p.title)}</title>
<link>${meta.url}${p.path}/${p.slug}</link>
<guid>${meta.url}${p.path}/${p.slug}</guid>
<pubDate>${new Date(p.publish_at).toUTCString()}</pubDate>
<description>${esc(p.summary)}</description>
</item>`
 )
 .join("\n")}
</channel>
</rss>`;
 return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
