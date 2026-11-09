// Languages the site can show. The interface strings below are translated by site-api (Claude) into each one
// and cached; posts are translated on first read. English is the source.
export const LANGS = [
 ["en", "English"],
 ["ne", "नेपाली"],
 ["hi", "हिन्दी"],
 ["bn", "বাংলা"],
 ["ur", "اردو", "rtl"],
 ["ta", "தமிழ்"],
 ["zh", "中文"],
 ["ja", "日本語"],
 ["ko", "한국어"],
 ["th", "ไทย"],
 ["vi", "Tiếng Việt"],
 ["id", "Bahasa Indonesia"],
 ["ms", "Bahasa Melayu"],
 ["fil", "Filipino"],
 ["ar", "العربية", "rtl"],
 ["fa", "فارسی", "rtl"],
 ["he", "עברית", "rtl"],
 ["tr", "Türkçe"],
 ["ru", "Русский"],
 ["uk", "Українська"],
 ["pl", "Polski"],
 ["cs", "Čeština"],
 ["de", "Deutsch"],
 ["nl", "Nederlands"],
 ["fr", "Français"],
 ["es", "Español"],
 ["pt", "Português"],
 ["it", "Italiano"],
 ["sv", "Svenska"],
 ["da", "Dansk"],
 ["nb", "Norsk"],
 ["fi", "Suomi"],
 ["el", "Ελληνικά"],
 ["ro", "Română"],
 ["hu", "Magyar"],
 ["sw", "Kiswahili"],
];
export const LANG_CODES = LANGS.map((l) => l[0]);
export const isRTL = (lang) => LANGS.some((l) => l[0] === lang && l[2] === "rtl");

// Browser language list ("de-CH,de;q=0.9,en;q=0.8") to the best supported code.
export function pickLang(accept = "") {
 for (const part of String(accept).toLowerCase().split(",")) {
  const tag = part.split(";")[0].trim();
  if (!tag) continue;
  if (LANG_CODES.includes(tag)) return tag;
  const base = tag.split("-")[0];
  if (base === "tl") return "fil";
  if (base === "no" || base === "nn") return "nb";
  if (LANG_CODES.includes(base)) return base;
 }
 return "en";
}

// t("English text", { time: "9:40 PM" }) → translated text with {placeholders} filled.
export function makeT(ui) {
 return (s, vars) => {
  let out = (ui && ui[s]) || s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, v);
  return out;
 };
}

// Every interface string that gets translated. Add new ones here; the API picks them up within 30 minutes.
export const UI = [
 // nav, footer, menus
 "Home", "Work", "Blog", "More", "CV", "Search", "Important Links", "Social", "Other", "Open source", "Contact", "Book a call", "Guestbook", "My setup", "Status",
 "Working with me", "Code I am proud of", "Shipping now", "Architecture", "How this site is built", "Language",
 "Built in Nepal with Next.js and Go, self-hosted.", "Press ⌘K to find anything on this site.",
 "Hours, communication, releases", "Real snippets, with the why", "A running log of what I ship", "How Acme fits together", "My public GitHub repositories", "The desk where Acme gets built", "Self-hosted Next.js and Go", "Work, partnerships or a chat",
 // hero
 "Founder of {acme} · Full-stack developer", "Right now: ", "See my work", "Download CV", "View CV",
 "Stars on repositories", "Commits", "Repositories forks", "Github Followers",
 "It's {time} in Nepal.",
 "I'm probably still coding.", "I'm probably asleep.", "I'm probably just waking up.", "I'm probably reading through last night's messages.", "I'm probably having dal bhat.", "I'm probably shipping something.", "I'm probably fixing a bug someone just found.", "I'm probably deep in code.", "I'm probably watching the dinner rush on Acme.", "I'm probably having dinner.",
 // home sections
 "What I'm building", "Live products, used every day in Eastern Nepal.", "Case studies", "The engineering behind Acme, in depth.", "Interactive architecture map →", "Apps, Go services, Redis, MariaDB, search, payments and AI. Hover any part.",
 "What went live lately.", "Full log", "Writing", "All posts", "Ask about my work", "A short answer with links to where I wrote about it.", "How I work", "What a team gets when I join.",
 "About me", "I started coding at the end of 2018, building websites with HTML, CSS and JavaScript in Discord developer communities.",
 "I learned Node.js by making Discord bots and shared them as open source. Then React, Next.js and Tailwind, and then real products: apps, backends and servers.",
 "In July 2025 I started {acme}. Today it delivers in Northtown and Southtown, and I'm building {nimbus} next to it. Outside code, I [a line about your hobbies].",
 "See my desk and the tools I use", "See all repositories", "Technologies I use", "...and many others!", "Contact me", "Do you want to stay in touch?", "Or contact me with...",
 // working with me, code, time zones
 "A short manual for teammates and hiring managers: when I am around, how I talk, how code ships and what happens when something breaks.",
 "Proof", "This site's live status", "In short", "When things broke", "Honest write-ups: what happened, how I found it, the fix and what changed.", "What people say",
 "Real pieces of the code behind Acme, lightly trimmed. Each one has a note on why it is written that way and what it prevents.",
 "Working hours", "{from} to {to} Nepal time (UTC+5:45).", "That is {from} to {to} in {city}, {hours} of your workday.", "That is {from} to {to} in {city}, outside a 9 to 6 workday there.", "I usually reply {when}.", "Overlap with a 9 to 6 workday in each city.", "none",
 // articles
 "Translated automatically from English.", "Read the original", "This page is being translated. Refresh in a minute to read it in your language.",
];
