export const meta = {
 title: "Your Name",
 author: "Your Name",
 description: "I build products for Nepal from Your City: the apps, the backend and the servers they run on.",
 //url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`,
 url: "https://example.com",
 themeColor: "#091430",
 locale: "en_US",
 siteName: "Your Name",
 accounts: {
  github: {
   username: "your-github",
   repo: "Portfolio",
  },
  twitter: {
   username: "@your-handle",
  },
  discord: {
   username: "your-handle",
   invite: "https://discord.gg/your-invite",
   id: "000000000000000000",
  },
  instagram: {
   username: "your-handle",
  },
  linkedin: {
   username: "your-handle",
  },
  facebook: {
   username: "your-handle",
  },
 },
};

export const header = {
 title: "Your Name",
 subtitle: "Founder of Acme · Full-stack developer",
 description: meta.description,
 code: {
  user: "your-handle",
 },
};

export const nav = {
 left: [
  {
   href: "/",
   title: "Home",
  },
  {
   href: "/work",
   title: "Work",
  },
  {
   href: "/blog/",
   title: "Blog",
  },
 ],
 right: [
  {
   href: "/resume/",
   title: "CV",
  },
  {
   href: `https://www.linkedin.com/in/${meta.accounts.linkedin.username}/`,
   title: "LinkedIn",
   target: "_blank",
  },
 ],
};

export const contact = {
 links: [
  {
   href: "mailto:hello@example.com",
   title: "Email",
   icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 duration-200 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
   ),
  },
  {
   href: `https://www.instagram.com/${meta.accounts.instagram.username}/`,
   title: "Instagram",
   icon: (
    <svg fill="none" className="h-5 w-5" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
     <g clipPath="url(#g)">
      <path d="m11.001 0c-2.9874 0-3.3624 0.013063-4.5357 0.066458-1.171 0.053625-1.9704 0.23902-2.6698 0.51104-0.72349 0.28096-1.3372 0.65679-1.9486 1.2684-0.61188 0.61141-0.98771 1.2251-1.2696 1.9484-0.27271 0.69965-0.45834 1.4992-0.51105 2.6698-0.052251 1.1733-0.066001 1.5485-0.066001 4.5359 0 2.9874 0.013292 3.3612 0.066459 4.5345 0.053855 1.1711 0.23925 1.9704 0.51105 2.6698 0.28119 0.7235 0.65702 1.3372 1.2687 1.9486 0.61119 0.6119 1.2249 0.9886 1.9479 1.2696 0.69988 0.272 1.4994 0.4574 2.6703 0.511 1.1734 0.0534 1.5481 0.0665 4.5353 0.0665 2.9876 0 3.3614-0.0131 4.5348-0.0665 1.171-0.0536 1.9713-0.239 2.6711-0.511 0.7233-0.281 1.3361-0.6577 1.9473-1.2696 0.6119-0.6114 0.9877-1.2251 1.2696-1.9484 0.2704-0.6996 0.456-1.4992 0.511-2.6697 0.0528-1.1734 0.0665-1.5474 0.0665-4.5348 0-2.9874-0.0137-3.3623-0.0665-4.5357-0.055-1.171-0.2406-1.9704-0.511-2.6698-0.2819-0.72348-0.6577-1.3372-1.2696-1.9486-0.6119-0.61188-1.2238-0.98771-1.9479-1.2684-0.7013-0.27202-1.5011-0.45742-2.6721-0.51104-1.1734-0.053396-1.5469-0.066458-4.5353-0.066458h0.0032zm-0.9868 1.9823c0.2929-4.6e-4 0.6197 0 0.9868 0 2.937 0 3.2851 0.01054 4.445 0.06325 1.0725 0.04904 1.6546 0.22825 2.0423 0.37881 0.5134 0.19938 0.8793 0.43771 1.2641 0.82271 0.385 0.385 0.6233 0.75167 0.8232 1.265 0.1506 0.38729 0.33 0.96938 0.3788 2.0419 0.0527 1.1596 0.0642 1.5079 0.0642 4.4436 0 2.9356-0.0115 3.2839-0.0642 4.4435-0.049 1.0725-0.2282 1.6546-0.3788 2.0419-0.1994 0.5133-0.4382 0.8789-0.8232 1.2636-0.385 0.385-0.7505 0.6234-1.2641 0.8227-0.3873 0.1513-0.9698 0.33-2.0423 0.3791-1.1596 0.0527-1.508 0.0641-4.445 0.0641-2.9372 0-3.2854-0.0114-4.445-0.0641-1.0725-0.0495-1.6546-0.2287-2.0426-0.3793-0.51333-0.1994-0.88-0.4377-1.265-0.8227-0.385-0.385-0.62334-0.7508-0.82317-1.2643-0.15057-0.3873-0.33001-0.9694-0.37882-2.0419-0.05271-1.1596-0.06325-1.5079-0.06325-4.4454 0-2.9374 0.01054-3.2839 0.06325-4.4435 0.04904-1.0725 0.22825-1.6546 0.37882-2.0423 0.19937-0.51333 0.43817-0.88 0.82317-1.265 0.38501-0.385 0.75168-0.62333 1.265-0.82316 0.38775-0.15125 0.97007-0.33 2.0426-0.37927 1.0148-0.04584 1.408-0.05959 3.4582-0.06188v0.00275z" fill="url(#f)" />
      <path d="m16.849 3.7817c-0.2611 0-0.5163 0.07742-0.7334 0.22249-0.2171 0.14506-0.3863 0.35125-0.4861 0.59245-0.1 0.24126-0.1261 0.50669-0.0751 0.76276s0.1768 0.49124 0.3614 0.67585c0.1846 0.18458 0.4199 0.31025 0.676 0.36113 0.2561 0.05087 0.5215 0.0247 0.7627-0.07531 0.2412-0.09996 0.4473-0.26922 0.5923-0.48634 0.145-0.21715 0.2223-0.4724 0.2222-0.73351 0-0.72873-0.5912-1.32-1.32-1.32v4.6e-4z" fill="url(#e)" />
      <path d="m10.977 5.324c-3.1196 0-5.649 2.5293-5.649 5.6489 0 3.1197 2.5294 5.6478 5.649 5.6478 3.1197 0 5.6484-2.5281 5.6484-5.6478 0-3.1196-2.5287-5.6489-5.6484-5.6489zm0.0229 9.2853c1.9934 0 3.6094-1.6159 3.6094-3.6093 0-1.9934-1.616-3.6094-3.6094-3.6094-1.9934 0-3.6094 1.616-3.6094 3.6094 0 1.9934 1.616 3.6093 3.6094 3.6093z" clipRule="evenodd" fill="url(#d)" fillRule="evenodd" />
      <path d="m11.001 0c-2.9874 0-3.3624 0.013063-4.5357 0.066458-1.171 0.053625-1.9704 0.23902-2.6698 0.51104-0.72349 0.28096-1.3372 0.65679-1.9486 1.2684-0.61188 0.61141-0.98771 1.2251-1.2696 1.9484-0.27271 0.69965-0.45834 1.4992-0.51105 2.6698-0.052251 1.1733-0.066001 1.5485-0.066001 4.5359 0 2.9874 0.013292 3.3612 0.066459 4.5345 0.053855 1.1711 0.23925 1.9704 0.51105 2.6698 0.28119 0.7235 0.65702 1.3372 1.2687 1.9486 0.61119 0.6119 1.2249 0.9886 1.9479 1.2696 0.69988 0.272 1.4994 0.4574 2.6703 0.511 1.1734 0.0534 1.5481 0.0665 4.5353 0.0665 2.9876 0 3.3614-0.0131 4.5348-0.0665 1.171-0.0536 1.9713-0.239 2.6711-0.511 0.7233-0.281 1.3361-0.6577 1.9473-1.2696 0.6119-0.6114 0.9877-1.2251 1.2696-1.9484 0.2704-0.6996 0.456-1.4992 0.511-2.6697 0.0528-1.1734 0.0665-1.5474 0.0665-4.5348 0-2.9874-0.0137-3.3623-0.0665-4.5357-0.055-1.171-0.2406-1.9704-0.511-2.6698-0.2819-0.72348-0.6577-1.3372-1.2696-1.9486-0.6119-0.61188-1.2238-0.98771-1.9479-1.2684-0.7013-0.27202-1.5011-0.45742-2.6721-0.51104-1.1734-0.053396-1.5469-0.066458-4.5353-0.066458h0.0032zm-0.9868 1.9823c0.2929-4.6e-4 0.6197 0 0.9868 0 2.937 0 3.2851 0.01054 4.445 0.06325 1.0725 0.04904 1.6546 0.22825 2.0423 0.37881 0.5134 0.19938 0.8793 0.43771 1.2641 0.82271 0.385 0.385 0.6233 0.75167 0.8232 1.265 0.1506 0.38729 0.33 0.96938 0.3788 2.0419 0.0527 1.1596 0.0642 1.5079 0.0642 4.4436 0 2.9356-0.0115 3.2839-0.0642 4.4435-0.049 1.0725-0.2282 1.6546-0.3788 2.0419-0.1994 0.5133-0.4382 0.8789-0.8232 1.2636-0.385 0.385-0.7505 0.6234-1.2641 0.8227-0.3873 0.1513-0.9698 0.33-2.0423 0.3791-1.1596 0.0527-1.508 0.0641-4.445 0.0641-2.9372 0-3.2854-0.0114-4.445-0.0641-1.0725-0.0495-1.6546-0.2287-2.0426-0.3793-0.51333-0.1994-0.88-0.4377-1.265-0.8227-0.385-0.385-0.62334-0.7508-0.82317-1.2643-0.15057-0.3873-0.33001-0.9694-0.37882-2.0419-0.05271-1.1596-0.06325-1.5079-0.06325-4.4454 0-2.9374 0.01054-3.2839 0.06325-4.4435 0.04904-1.0725 0.22825-1.6546 0.37882-2.0423 0.19937-0.51333 0.43817-0.88 0.82317-1.265 0.38501-0.385 0.75168-0.62333 1.265-0.82316 0.38775-0.15125 0.97007-0.33 2.0426-0.37927 1.0148-0.04584 1.408-0.05959 3.4582-0.06188v0.00275z" fill="url(#c)" />
      <path d="m16.849 3.7817c-0.2611 0-0.5163 0.07742-0.7334 0.22249-0.2171 0.14506-0.3863 0.35125-0.4861 0.59245-0.1 0.24126-0.1261 0.50669-0.0751 0.76276s0.1768 0.49124 0.3614 0.67585c0.1846 0.18458 0.4199 0.31025 0.676 0.36113 0.2561 0.05087 0.5215 0.0247 0.7627-0.07531 0.2412-0.09996 0.4473-0.26922 0.5923-0.48634 0.145-0.21715 0.2223-0.4724 0.2222-0.73351 0-0.72873-0.5912-1.32-1.32-1.32v4.6e-4z" fill="url(#b)" />
      <path d="m10.977 5.324c-3.1196 0-5.649 2.5293-5.649 5.6489 0 3.1197 2.5294 5.6478 5.649 5.6478 3.1197 0 5.6484-0.5281 5.6484-5.6478 0-3.1196-2.5287-5.6489-5.6484-5.6489zm0.0229 9.2853c1.9934 0 3.6094-1.6159 3.6094-3.6093 0-1.9934-1.616-3.6094-3.6094-3.6094-1.9934 0-3.6094 1.616-3.6094 3.6094 0 1.9934 1.616 3.6093 3.6094 3.6093z" clipRule="evenodd" fill="url(#a)" fillRule="evenodd" />
     </g>
     <defs>
      <radialGradient id="f" cx="0" cy="0" r="1" gradientTransform="translate(5.8438 23.694) rotate(-90) scale(21.804 20.279)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#FFD600" offset="0" />
       <stop stopColor="#FF7A00" offset=".5" />
       <stop stopColor="#FF0069" offset="1" />
      </radialGradient>
      <radialGradient id="e" cx="0" cy="0" r="1" gradientTransform="translate(5.8437 23.694) rotate(-90) scale(21.804 20.279)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#FFD600" offset="0" />
       <stop stopColor="#FF7A00" offset=".5" />
       <stop stopColor="#FF0069" offset="1" />
      </radialGradient>
      <radialGradient id="d" cx="0" cy="0" r="1" gradientTransform="translate(5.8438 23.694) rotate(-90) scale(21.804 20.279)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#FF7A00" offset="0" />
       <stop stopColor="#fd5" offset=".1" />
       <stop stopColor="#FF7A00" offset=".5" />
       <stop stopColor="#FF0069" offset="1" />
      </radialGradient>
      <radialGradient id="c" cx="0" cy="0" r="1" gradientTransform="translate(-3.6855 1.5849) rotate(78.681) scale(9.7463 40.175)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#7638FA" offset="0" />
       <stop stopColor="#7638FA" offset=".128" />
       <stop stopColor="#D300C5" stopOpacity="0" offset="1" />
      </radialGradient>
      <radialGradient id="b" cx="0" cy="0" r="1" gradientTransform="translate(-3.6856 1.5849) rotate(78.681) scale(9.7463 40.175)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#3771C8" offset="0" />
       <stop stopColor="#3771C8" offset=".128" />
       <stop stopColor="#60f" stopOpacity="0" offset="1" />
      </radialGradient>
      <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="translate(-3.6855 1.5849) rotate(78.681) scale(9.7463 40.175)" gradientUnits="userSpaceOnUse">
       <stop stopColor="#3771C8" offset="0" />
       <stop stopColor="#60f" stopOpacity="0" offset="1" />
      </radialGradient>
      <clipPath id="g">
       <rect width="22" height="22" fill="#fff" />
      </clipPath>
     </defs>
    </svg>
   ),
  },
  {
   href: "https://www.facebook.com/your-handle",
   title: "Facebook",
   icon: (
    <svg className="h-5 w-5 fill-[#0866FF]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
     <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
   ),
  },
  {
   href: "https://www.linkedin.com/in/your-handle/",
   title: "LinkedIn",
   icon: (
    <svg className="h-5 w-5 fill-[#0A66C2] duration-200 motion-reduce:transition-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
   ),
  },
 ],
};

export const footer = {
 categories: [
  {
   title: "Important Links",
   links: [
    {
     title: "Home",
     href: "/",
    },
    {
     title: "Open source",
     href: "/repositories",
    },
    {
     title: "Blog",
     href: "/blog",
    },
    {
     title: "CV",
     href: "/resume",
    },
   ],
  },
  {
   title: "Social",
   links: [
    {
     title: "Github",
     href: `https://github.com/${meta.accounts.github.username}`,
     target: "_blank",
    },
    {
     title: "Instagram",
     href: `https://instagram.com/${meta.accounts.instagram.username}`,
     target: "_blank",
    },

    {
     title: "LinkedIn",
     href: `https://www.linkedin.com/in/${meta.accounts.linkedin.username}/`,
     target: "_blank",
    },
    {
     title: "Facebook",
     href: `https://www.facebook.com/${meta.accounts.facebook.username}`,
     target: "_blank",
    },
   ],
  },
  {
   title: "Other",
   links: [
    {
     title: "Acme",
     href: "https://acme.example.com",
     target: "_blank",
    },
    {
     title: "Contact",
     href: "/contact",
    },
    {
     title: "Working with me",
     href: "/working-with-me",
    },
    {
     title: "Book a call",
     href: "/book",
    },
    {
     title: "Guestbook",
     href: "/guestbook",
    },
    {
     title: "My setup",
     href: "/setup",
    },
    {
     title: "Status",
     href: "/status",
    },
   ],
  },
 ],
};

export const technologies = [
 {
  name: "Go",
  icon: "/assets/tech/go.svg",
  link: "https://go.dev/",
 },
 {
  name: "TypeScript",
  icon: "/assets/tech/typescript.svg",
  link: "https://www.typescriptlang.org/",
 },
 {
  name: "Next.js",
  icon: "/assets/tech/next.svg",
  class: "invert-0 dark:invert",
  link: "https://nextjs.org/",
 },
 {
  name: "React",
  icon: "/assets/tech/react.svg",
  link: "https://react.dev/",
 },
 {
  name: "Swift",
  icon: "/assets/tech/swift.svg",
  link: "https://www.swift.org/",
 },
 {
  name: "Kotlin",
  icon: "/assets/tech/kotlin.svg",
  link: "https://kotlinlang.org/",
 },
 {
  name: "Node.js",
  icon: "/assets/tech/nodejs.svg",
  link: "https://nodejs.org/",
 },
 {
  name: "PHP",
  icon: "/assets/tech/php.svg",
  link: "https://www.php.net/",
 },
 {
  name: "Laravel",
  icon: "/assets/tech/laravel.svg",
  link: "https://laravel.com/",
 },
 {
  name: "Python",
  icon: "/assets/tech/python.svg",
  link: "https://www.python.org/",
 },
 {
  name: "Redis",
  icon: "/assets/tech/redis.svg",
  link: "https://redis.io/",
 },
 {
  name: "MariaDB",
  icon: "/assets/tech/mariadb.svg",
  link: "https://mariadb.org/",
 },
 {
  name: "Nginx",
  icon: "/assets/tech/nginx.svg",
  link: "https://nginx.org/",
 },
 {
  name: "Docker",
  icon: "/assets/tech/docker.svg",
  link: "https://www.docker.com/",
 },
 {
  name: "Cloudflare",
  icon: "/assets/tech/cloudflare.svg",
  link: "https://www.cloudflare.com/",
 },
 {
  name: "TailwindCSS",
  icon: "/assets/tech/tailwindcss.svg",
  link: "https://tailwindcss.com/",
 },
 {
  name: "Git",
  icon: "/assets/tech/git.svg",
  link: "https://git-scm.com/",
 },
 {
  name: "MongoDB",
  icon: "/assets/tech/mongodb.svg",
  link: "https://www.mongodb.com/",
 },
 {
  name: "Express.js",
  icon: "/assets/tech/express.svg",
  class: "invert-0 dark:invert",
  link: "https://expressjs.com/",
 },
 {
  name: "Discord.js",
  icon: "/assets/tech/discordjs.svg",
  link: "https://discord.js.org/",
 },
];
