import { ImageResponse } from "next/og";

// Shared link-preview card (1200 x 630): dark grid, title, summary and the byline with my portrait.
// The home card (portrait: true) also shows the full portrait on the right.
// Runs at the edge; fonts and the badge are bundled as assets (same way the original preview image loaded its fonts).
export const ogSize = { width: 1200, height: 630 };

let assets = null;
async function load() {
 if (assets) return assets;
 const [bold, regular, badge] = await Promise.all([
  fetch(new URL("../public/fonts/bold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  fetch(new URL("../public/fonts/regular.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  fetch(new URL("../public/portrait-face.png", import.meta.url)).then((r) => r.arrayBuffer()),
 ]);
 const bust = await fetch(new URL("../public/portrait-bust.png", import.meta.url)).then((r) => r.arrayBuffer());
 assets = { bold, regular, badge, bust };
 return assets;
}

export async function ogCard({ eyebrow, title, summary, foot, portrait = false }) {
 const a = await load();
 const t = String(title || "Your Name");
 const size = t.length > 70 ? 54 : t.length > 45 ? 62 : 70;
 return new ImageResponse(
  (
   <div
    style={{
     width: "100%",
     height: "100%",
     display: "flex",
     flexDirection: "column",
     justifyContent: "space-between",
     padding: "64px 72px",
     position: "relative",
     backgroundColor: "#101110",
     color: "#fff",
     fontFamily: "Bold",
     backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255,255,255,0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
    }}
   >
    <div style={{ display: "flex", alignItems: "center", fontFamily: "Regular", fontSize: 26, color: "rgba(255,255,255,.55)" }}>
     <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#64acff", marginRight: 14 }} />
     {eyebrow}
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
     <div style={{ fontSize: portrait ? Math.min(size, 60) : size, lineHeight: 1.12, letterSpacing: "-0.02em", maxWidth: portrait ? 640 : 1000 }}>{t}</div>
     {summary && <div style={{ marginTop: 22, fontFamily: "Regular", fontSize: portrait ? 26 : 28, lineHeight: 1.4, color: "rgba(255,255,255,.6)", maxWidth: portrait ? 620 : 980 }}>{summary.length > 150 ? summary.slice(0, 147) + "..." : summary}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>
     {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
     {!portrait && <img src={a.badge} width={76} height={76} style={{ borderRadius: 38, backgroundColor: "#1f2024", border: "2px solid rgba(255,255,255,.12)" }} />}
     <div style={{ display: "flex", flexDirection: "column", marginLeft: portrait ? 0 : 20 }}>
      <div style={{ fontSize: 28 }}>Your Name</div>
      <div style={{ display: "flex", fontFamily: "Regular", fontSize: 22, color: "rgba(255,255,255,.55)" }}>
       <span>Founder of</span>
       <span style={{ color: "#FFD60A", marginLeft: 7 }}>Acme</span>
       <span style={{ marginLeft: 7 }}>· example.com</span>
      </div>
     </div>
     {foot && <div style={{ marginLeft: "auto", fontFamily: "Regular", fontSize: 22, color: "rgba(255,255,255,.45)" }}>{foot}</div>}
    </div>
    {portrait && (
     /* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */
     <img src={a.bust} width={480} height={476} style={{ position: "absolute", right: 36, bottom: 0 }} />
    )}
   </div>
  ),
  {
   ...ogSize,
   fonts: [
    { name: "Bold", data: a.bold, style: "normal", weight: 700 },
    { name: "Regular", data: a.regular, style: "normal", weight: 400 },
   ],
  }
 );
}
