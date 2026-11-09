import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

// Called by site-api (127.0.0.1) after content changes.
export async function POST(request) {
 const secret = process.env.REVALIDATE_SECRET || "";
 let body = {};
 try {
  body = await request.json();
 } catch {}
 const given = Buffer.from(String(body.secret || ""));
 const want = Buffer.from(secret);
 if (!secret || given.length !== want.length || !timingSafeEqual(given, want)) {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
 }
 revalidateTag("site");
 return NextResponse.json({ ok: true });
}
