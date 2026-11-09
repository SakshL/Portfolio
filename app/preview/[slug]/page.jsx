import { Article } from "components/content/Article";
import { getPreview } from "lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function Preview({ params, searchParams }) {
 const data = await getPreview(params.slug, searchParams?.token);
 if (!data) notFound();
 const kind = data.post.kind === "case_study";
 return <Article data={data} base={kind ? "/work" : "/blog"} label={kind ? "Case studies" : "Writing"} preview />;
}
