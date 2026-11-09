import { meta } from "config";
import { getPosts } from "lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap() {
 const [posts, cases] = await Promise.all([getPosts("post").catch(() => ({ items: [] })), getPosts("case_study").catch(() => ({ items: [] }))]);
 // real dates only: Google ignores lastmod when it is always "now"
 const newest = (items) => items.map((p) => p.updated_at || p.publish_at).filter(Boolean).sort().pop();
 const latest = newest([...posts.items, ...cases.items]);
 const pages = [
  ["", 1, latest],
  ["/work", 0.9, newest(cases.items)],
  ["/blog", 0.9, newest(posts.items)],
  ["/resume", 0.9],
  ["/working-with-me", 0.8],
  ["/code", 0.7],
  ["/now", 0.6],
  ["/architecture", 0.6],
  ["/setup", 0.5],
  ["/contact", 0.6],
  ["/book", 0.5],
  ["/repositories", 0.4],
  ["/colophon", 0.4],
  ["/guestbook", 0.3],
  ["/status", 0.2],
 ].map(([r, priority, lastModified]) => ({ url: `${meta.url}${r}`, priority, ...(lastModified ? { lastModified } : {}) }));
 return [
  ...pages,
  ...cases.items.map((p) => ({ url: `${meta.url}/work/${p.slug}`, lastModified: p.updated_at || p.publish_at, priority: 0.7 })),
  ...posts.items.map((p) => ({ url: `${meta.url}/blog/${p.slug}`, lastModified: p.updated_at || p.publish_at, priority: 0.7 })),
 ];
}
