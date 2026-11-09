const withBundleAnalyzer = require("@next/bundle-analyzer")({
 enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
 pageExtensions: ["jsx", "js"],
 eslint: {
  ignoreDuringBuilds: true,
 },
 env: {
  VERSION: process.env.npm_package_version,
 },
 async headers() {
  return [
   {
    source: "/(.*)",
    headers: [
     {
      key: "Access-Control-Allow-Origin",
      value: "https://example.com",
     },
     {
      key: "Access-Control-Allow-Methods",
      value: "GET,OPTIONS",
     },
     {
      key: "Access-Control-Allow-Headers",
      value: "Content-Type",
     },
     {
      key: "Referrer-Policy",
      value: "no-referrer",
     },
     {
      key: "X-Content-Type-Options",
      value: "nosniff",
     },
     {
      key: "X-DNS-Prefetch-Control",
      value: "on",
     },
     {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
     },
     {
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
     },
     {
      key: "X-XSS-Protection",
      value: "1; mode=block",
     },
     {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
     },
    ],
   },
   {
    source: "/(.*).xml",
    headers: [
     {
      key: "Content-Type",
      value: "application/xml",
     },
    ],
   },
   {
    source: "/(.*).json",
    headers: [
     {
      key: "Content-Type",
      value: "application/json",
     },
     {
      key: "Cache-Control",
      value: "public, max-age=604800, must-revalidate",
     },
    ],
   },
   {
    source: "/assets/(.*)",
    headers: [
     {
      key: "Cache-Control",
      value: "public, max-age=31536000, must-revalidate",
     },
    ],
   },
   {
    source: "/favicon.ico",
    headers: [
     {
      key: "Cache-Control",
      value: "public, max-age=31536000, must-revalidate",
     },
    ],
   },
  ];
 },
 // /v1 is routed to the Go API by nginx; this rewrite only matters when Next is hit directly.
 async rewrites() {
  return { fallback: [{ source: "/v1/:path*", destination: `${process.env.SITE_API_URL || "http://127.0.0.1:8080"}/v1/:path*` }] };
 },
 async redirects() {
  return [
   {
    source: "/uses",
    destination: "/setup",
    permanent: false,
   },
   {
    source: "/discord",
    destination: "https://discord.gg/your-invite",
    permanent: true,
   },
   {
    source: "/twitter",
    destination: "https://twitter.com/me",
    permanent: true,
   },
   {
    source: "/instagram",
    destination: "https://www.instagram.com/your-handle/",
    permanent: true,
   },
   {
    source: "/github",
    destination: "https://github.com/your-handle",
    permanent: true,
   },
   {
    source: "/r/:path*",
    destination: "/:path*",
    permanent: true,
   },
   {
    source: "/discord-server",
    destination: "/discord",
    permanent: true,
   },
   {
    source: "/your-handle.pdf",
    destination: "/cv.pdf",
    permanent: true,
   },
   {
    source: "/feed.xml",
    destination: "/feed",
    permanent: true,
   },
  ];
 },
};

module.exports = () => {
 const plugins = [withBundleAnalyzer];
 const config = plugins.reduce((acc, next) => next(acc), {
  ...nextConfig,
 });
 return config;
};
