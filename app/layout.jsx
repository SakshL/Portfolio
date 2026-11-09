import clsx from "clsx";
import { Suspense } from "react";
import { Analytics } from "components/elements/client/Analytics";
import { CommandMenu } from "components/elements/client/CommandMenu";
import { XRay } from "components/features/XRay";
import { AskWidget } from "components/features/AskWidget";
import { Interactions } from "components/features/Interactions";
import { Morph } from "components/features/Morph";
import { WebTerminal } from "components/features/WebTerminal";
import { DeliveryGame } from "components/features/DeliveryGame";
import { SmoothScroll } from "components/features/SmoothScroll";
import { ErrorReporter } from "components/features/ErrorReporter";
import { Nav } from "components/elements/client/Nav";
import { ProgressBar } from "components/elements/client/Progress";
import { Theme } from "components/elements/client/Theme";
import { Footer } from "components/elements/Footer";
import { Hotjar } from "components/elements/Hotjar";
import { meta } from "config";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { getT } from "lib/lang";
import { isRTL } from "lib/i18n";
import { ServerThemeProvider } from "next-themes";
import "styles/globals.css";
import "styles/progress.css";

const inter = Inter({ subsets: ["latin"] });
// Nepali text falls back to this; Latin glyphs still come from Inter
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-deva", display: "swap" });

export const metadata = {
 metadataBase: new URL(meta.url),
 title: {
  default: meta.title,
  template: `%s | ${meta.title}`,
 },
 description: meta.description,
 openGraph: {
  title: meta.title,
  description: meta.description,
  url: meta.url,
  siteName: meta.title,
  locale: meta.locale,
  type: "website",
 },
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   "max-video-preview": -1,
   "max-image-preview": "large",
   "max-snippet": -1,
  },
 },
 twitter: {
  title: meta.title,
  description: meta.description,
  author: meta.accounts.twitter.username,
  card: "summary_large_image",
 },
 icons: {
  icon: [
   { url: "/icon-v2.svg", type: "image/svg+xml" },
   { url: "/favicon.ico?v=2", sizes: "48x48" },
  ],
  shortcut: "/favicon.ico?v=2",
  apple: "/apple-touch-icon-v2.png",
 },
};

export default async function RootLayout({ children }) {
 const { dict, lang } = await getT();
 const ui = dict?.ui || null;
 return (
  <ServerThemeProvider attribute="class">
   <html lang={lang} dir={isRTL(lang) ? "rtl" : "ltr"} className={deva.variable}>
    <head>{process.env.HOTJAR_ID && <Hotjar id={process.env.HOTJAR_ID} />}</head>
    <body className={clsx("bg-main", inter.className)} style={lang === "ne" || lang === "hi" ? { fontFamily: `${inter.style.fontFamily}, var(--font-deva), sans-serif` } : undefined}>
     <Theme>
      <Nav lang={lang} ui={ui} />
      <main className="mt-24 flex min-h-screen flex-col px-6 antialiased print:m-0 print:min-h-0 print:p-0">
       <Suspense fallback={null}>
        <ProgressBar />
       </Suspense>
       {children}
      </main>
      <Footer ui={ui} />
      <Analytics />
      <CommandMenu />
      <XRay />
      <AskWidget />
      <Interactions />
      <Morph />
      <WebTerminal />
      <DeliveryGame />
      <SmoothScroll />
      <ErrorReporter />
     </Theme>
    </body>
   </html>
  </ServerThemeProvider>
 );
}
