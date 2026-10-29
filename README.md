# Portfolio

A personal portfolio built with **Next.js 15**, **React 19**, **GSAP 3**, and **Lenis** — hardware-accelerated motion, interactive HTML5 canvas backgrounds, seamless page transitions, and an emerald-accented dark editorial design.

<!-- TODO: replace with your own deployment URL once it is live -->
**Live Site:** [your-domain.com](https://your-domain.com)

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your own values (optional for local dev)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

All optional. Without them the contact form falls back to writing submissions into `messages.txt` locally.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact emails through Resend (recommended for Vercel) |
| `GMAIL_APP_PASSWORD` | Fallback SMTP delivery through Gmail |
| `CONTACT_EMAIL` | Overrides the recipient address (defaults to `site.email`) |
| `NEXT_PUBLIC_GA_ID` | Enables Google Analytics when set |

---

## Make It Yours

Everything personal lives in a small number of files:

| What | Where |
|---|---|
| Name, handle, email, links, roles, site URL | `src/lib/site.ts` |
| Page titles, meta, Open Graph, Twitter cards | `src/lib/metadata.ts` |
| Hero headline and resume link | `src/components/sections/HomeBanner.tsx` |
| Bio and credentials | `src/components/sections/AboutMe.tsx` |
| Project case studies | `src/lib/projects.ts` |
| Project screenshots | `public/Projects/` |
| Resume | `public/resume.pdf` |
| Social preview image | `public/og-image.png` |
| Favicon | `public/logo.png` |

Remaining placeholders are marked with `TODO` comments — search the repo for `TODO`.

---

## Features

- **Kinetic motion & smooth scroll:** Lenis smooth scrolling with ScrollTrigger parallax and delta-time compensated physics.
- **Persistent curve navigation:** full-screen menu with dynamic SVG curve morphing and GPU-composited drawer transitions.
- **Generative canvases:** constellation node mesh and Perlin-noise particle flow field.
- **Resilient contact form:** Resend with a Gmail SMTP fallback, honeypot spam protection, rate limiting, and a local dev file logger.
- **Type-safe routing:** App Router with SSG for every project case study.
- **Accessibility & performance:** `prefers-reduced-motion` support, keyboard-trapped drawer, no render-blocking third-party scripts.

---

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Core:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [GSAP 3](https://gsap.com/) & [@gsap/react](https://gsap.com/resources/React)
- **Smooth scroll:** [Lenis](https://lenis.darkroom.engineering/)
- **Page transitions:** [next-transition-router](https://github.com/madebyconor/next-transition-router)
- **Typography:** Geist Sans, Geist Mono, Space Grotesk, Instrument Serif, Bungee
- **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)

---

## Credits

This project is based on an MIT-licensed portfolio template by [Aitezaz Sikandar](https://github.com/aitezazdev). The original copyright notice is retained in [LICENSE](./LICENSE); modifications are copyright their respective author.

---

## License

[MIT](./LICENSE)
