import { ogCard, ogSize } from "lib/og";

export const runtime = "edge";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Your Name, founder of Acme";

export default async function Image() {
 return ogCard({
  eyebrow: "example.com",
  title: "I build products for Nepal from Your City.",
  summary: "The apps, the backend and the servers they run on. Founder of Acme, building Nimbus and Acme POS.",
  foot: "",
  portrait: true,
 });
}
