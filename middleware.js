import { NextResponse } from "next/server";

// One address for Google: example.com moves to example.com (301).
export function middleware(req) {
 const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
 if (host.startsWith("www.")) {
  const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${host.slice(4)}`);
  return NextResponse.redirect(url, 301);
 }
 return NextResponse.next();
}

export const config = { matcher: "/((?!_next/|api/).*)" };
