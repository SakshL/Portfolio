import { Article, articleMetadata } from "components/content/Article";
import { getPost } from "lib/api";
import { notFound } from "next/navigation";
import { getT } from "lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
 const data = await getPost(params.slug);
 return data?.post?.kind === "post" ? articleMetadata(data.post, "/blog") : {};
}

export default async function BlogPost({ params, searchParams }) {
 const original = searchParams?.original === "1";
 const data = await getPost(params.slug, { original });
 if (!data || data.post.kind !== "post") notFound();
 const { t, lang } = await getT();
 const note = original || lang === "en" ? null : data.translating ? { text: t("This page is being translated. Refresh in a minute to read it in your language.") } : data.lang ? { text: t("Translated automatically from English."), original: t("Read the original") } : null;
 return <Article data={data} base="/blog" label={t("Writing")} note={note} />;
}
