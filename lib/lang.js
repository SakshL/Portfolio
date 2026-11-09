import "server-only";
import { cookies, headers } from "next/headers";
import { LANG_CODES, makeT, pickLang } from "lib/i18n";

const API = process.env.SITE_API_URL || "http://127.0.0.1:8080";

// The visitor's language: the lang cookie (picker or first visit), else their browser's Accept-Language.
export function getLang() {
 try {
  const c = cookies().get("lang")?.value;
  if (c && LANG_CODES.includes(c)) return c;
  return pickLang(headers().get("accept-language") || "");
 } catch {
  return "en";
 }
}

// { ui, profile } for a language, or null for English / not translated yet.
export async function getDict(lang = getLang()) {
 if (!lang || lang === "en") return null;
 try {
  const res = await fetch(`${API}/v1/i18n/${lang}`, { next: { revalidate: 300, tags: ["site"] } });
  return res.ok ? await res.json() : null;
 } catch {
  return null;
 }
}

export async function getT(lang = getLang()) {
 const dict = await getDict(lang);
 return { t: makeT(dict?.ui), dict, lang };
}

// A plain {english: translated} map for client components (functions cannot be passed to them).
export const TIME_KEYS = ["Working hours", "{from} to {to} Nepal time (UTC+5:45).", "That is {from} to {to} in {city}, {hours} of your workday.", "That is {from} to {to} in {city}, outside a 9 to 6 workday there.", "I usually reply {when}.", "Overlap with a 9 to 6 workday in each city.", "none"];
export function labels(t, keys) {
 return Object.fromEntries(keys.map((k) => [k, t(k)]));
}
