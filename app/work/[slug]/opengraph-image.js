import { getPost } from "lib/api";
import { ogCard, ogSize } from "lib/og";

export const runtime = "edge";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Your Name";

export default async function Image({ params }) {
 const p = await getPost(params.slug).catch(() => null);
 const post = p?.post || p;
 return ogCard({
  eyebrow: "Case study",
  title: post?.title || "Your Name",
  summary: post?.summary,
  foot: post?.reading_minutes ? `${post.reading_minutes} min read` : "",
 });
}
