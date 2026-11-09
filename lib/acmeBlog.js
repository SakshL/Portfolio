import "server-only";

// Latest posts from Acme's company blog (blog.example.com), read from its RSS feed. Cached for an hour;
// if the feed is down the card simply shows the link without posts.
const FEED = "https://blog.example.com/feed.xml";

const unescape = (s) =>
 (s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .trim();
const tag = (xml, name) => unescape((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1]);

export async function getAcmeBlog(limit = 3) {
 try {
  const res = await fetch(FEED, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
  if (!res.ok) return [];
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
   .map((m) => ({ title: tag(m[1], "title"), link: tag(m[1], "link"), date: tag(m[1], "pubDate"), category: tag(m[1], "category"), summary: tag(m[1], "description") }))
   .filter((p) => p.title && /^https:\/\/blog\.acme\.com\.np\//.test(p.link))
   .slice(0, limit);
 } catch {
  return [];
 }
}
