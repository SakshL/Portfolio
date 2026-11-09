import "server-only";
import { getLang } from "lib/lang";

const API = process.env.SITE_API_URL || "http://127.0.0.1:8080";

// All content comes from the Go API (site-api). Cached for 60 s and dropped instantly
// when the studio changes something (the API calls /api/revalidate with the "site" tag).
// Each result carries a hidden _xray note (endpoint, time, cache) that X-ray mode shows.
async function get(path, { revalidate = 60, noStore = false } = {}) {
 const t0 = performance.now();
 const res = await fetch(`${API}${path}`, noStore ? { cache: "no-store" } : { next: { revalidate, tags: ["site"] } });
 if (res.status === 404) return null;
 if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
 const data = await res.json();
 const ms = Math.max(1, Math.round(performance.now() - t0));
 if (data && typeof data === "object") Object.defineProperty(data, "_xray", { value: `GET ${path.split("?")[0]} · ${ms} ms · ${noStore ? "no cache" : `cached ${revalidate} s`}`, enumerable: false });
 return data;
}

export function xray(data, what = "server component") {
 return data?._xray ? `${data._xray} · ${what}` : what;
}

const refRe = /^[a-z0-9-]{3,40}$/;
const focusRe = /^(backend|mobile|founder)$/;

export async function getSite({ ref = "", focus = "" } = {}) {
 const q = new URLSearchParams();
 if (focusRe.test(focus || "")) q.set("focus", focus);
 else if (refRe.test((ref || "").toLowerCase())) q.set("ref", ref.toLowerCase());
 const lang = getLang();
 if (lang !== "en") q.set("lang", lang);
 const qs = q.toString();
 return get(`/v1/site${qs ? `?${qs}` : ""}`);
}

export async function getStatus() {
 return get("/v1/status", { revalidate: 30 });
}

export async function getActivity() {
 return get("/v1/activity", { revalidate: 300 });
}

export async function getGuestbook() {
 return (await get("/v1/guestbook", { revalidate: 30 })) || { open: false, entries: [] };
}

export async function getPosts(kind = "post", { tag = "", limit = 200 } = {}) {
 const q = new URLSearchParams({ kind, limit: String(limit) });
 if (tag) q.set("tag", tag);
 const lang = getLang();
 if (lang !== "en") q.set("lang", lang);
 return (await get(`/v1/posts?${q}`)) || { items: [], total: 0 };
}

export async function getPost(slug, { original = false } = {}) {
 if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
 const lang = original ? "en" : getLang();
 if (lang === "en") return get(`/v1/posts/${slug}`);
 const data = await get(`/v1/posts/${slug}?lang=${lang}`, { noStore: true });
 return data;
}

export async function getPreview(slug, token) {
 if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
 return get(`/v1/preview/${slug}?token=${encodeURIComponent(token || "")}`, { noStore: true });
}

export async function getSpeed() {
 return get("/v1/speed", { revalidate: 300 });
}

export function formatDate(iso, opts = { year: "numeric", month: "short", day: "numeric" }) {
 if (!iso) return "";
 return new Date(iso).toLocaleDateString("en-GB", { timeZone: "Asia/Kathmandu", ...opts });
}

export function monthYear(ym) {
 if (!ym) return "now";
 const [y, m] = ym.split("-").map(Number);
 return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

// A tailored page for one company (Studio → Radar → Job match). 404 when the link is off or has no match.
export async function getFor(token) {
 const t = String(token || "").toLowerCase();
 if (!refRe.test(t)) return null;
 return get(`/v1/for/${t}`, { noStore: true });
}
