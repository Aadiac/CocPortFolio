import { getAllProjects } from '@/lib/projects';
import { site, socials } from '@/lib/site';

export const QUICK_QUESTIONS = [
  'What are your skills?',
  'Show me your projects',
  'Tell me your journey',
  'How can I contact you?',
] as const;

const isPlaceholder = (value: string) => /your |your-|you@example|placeholder/i.test(value);

const owner = () => (isPlaceholder(site.name) ? 'The developer behind this portfolio' : site.name);

const contactLine = () =>
  isPlaceholder(site.email)
    ? 'the contact form at the bottom of the page'
    : `email at ${site.email} or the contact form at the bottom of the page`;

const skillList =
  'React, Next.js, TypeScript, Node.js, Express, MongoDB, Tailwind CSS and GSAP, along with REST APIs, authentication, performance tuning and deployment on Vercel, AWS or Docker';

const projectTitles = () =>
  getAllProjects()
    .filter((project) => !/your project|placeholder/i.test(project.title))
    .slice(0, 3)
    .map((project) => project.title);

interface Intent {
  pattern: RegExp;
  reply: () => string;
}

const INTENTS: Intent[] = [
  {
    pattern: /\b(resume|cv|curriculum vitae)\b/,
    reply: () =>
      'The resume is linked from the home screen — look for the Resume button, or open /resume.pdf directly.',
  },
  {
    pattern: /\b(contact|email|e-mail|reach|hire|hiring|call|message|get in touch)\b/,
    reply: () =>
      `The fastest way to get in touch is by ${contactLine()}. You can also connect on ${socials.linkedin.label} or ${socials.github.label}.`,
  },
  {
    pattern: /\b(available|availability|open to work|freelance|opportunit|job|hire me)\b/,
    reply: () =>
      `Yes, Chief — I'm open to new opportunities and freelance work worldwide. Share a few details by ${contactLine()} and I'll get back to you.`,
  },
  {
    pattern: /\b(skill|skills|tech|stack|technolog|tool|framework|react|next|node|mongodb|typescript|javascript|tailwind|gsap|mern|frontend|backend)\b/,
    reply: () => `My toolbox covers ${skillList}.`,
  },
  {
    pattern: /\b(service|services|what do you do|what can you do|offer|help|speciali[sz]e)\b/,
    reply: () =>
      'I offer full-stack development, frontend engineering and performance optimisation — from interfaces and APIs to authentication, SEO and deployment. Ask about my skills for the full tool list.',
  },
  {
    pattern: /\b(project|projects|work|portfolio|case stud|demo)\b/,
    reply: () => {
      const titles = projectTitles();
      if (titles.length > 0) {
        return `Here's what's on the workbench: ${titles.join(', ')}. Scroll to the Work section to explore the case studies.`;
      }
      return "The workbench is the Work section — scroll down or use the Projects button on the home screen to see the builds.";
    },
  },
  {
    pattern: /\b(price|pricing|cost|rate|budget|quote|timeline|how much)\b/,
    reply: () =>
      "Pricing depends on scope, so every project is quoted individually. Share what you have in mind through the contact form and I'll follow up.",
  },
  {
    pattern: /\b(experience|education|background|about|who|bio|career|degree|university|studied|study|journey)\b/,
    reply: () =>
      'The About section walks through the background, experience and education timeline — that is the developer journey. Ask me about skills or projects for the short version.',
  },
  {
    pattern: /\b(where|location|located|based|country|city|timezone|time zone)\b/,
    reply: () =>
      isPlaceholder(site.location)
        ? "The About section covers where I'm based."
        : `${owner()} is based in ${site.location} (${site.timeZoneLabel}).`,
  },
  {
    pattern: /\b(navigate|navigation|menu|section|sections|page|where can i find)\b/,
    reply: () =>
      'Quick tour: About for background, Services for what I do, Work for projects, and Contact to get in touch.',
  },
  {
    pattern: /\b(thanks|thank you|thx|appreciate)\b/,
    reply: () => 'Anytime, Chief. Anything else you would like to know?',
  },
  {
    pattern: /\b(bye|goodbye|see you|later)\b/,
    reply: () => 'Thanks for stopping by, Chief. The village is always open — reach out any time.',
  },
  {
    pattern: /\b(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/,
    reply: () =>
      'Hey Chief! Ask me about skills, projects, the developer journey, or how to get in touch.',
  },
];

const FALLBACK =
  "That one is not in my blueprint yet, Chief. Try asking about skills, projects, availability, experience or contact details.";

export function getBotReply(raw: string): string {
  const text = raw.toLowerCase().trim();
  if (!text) return FALLBACK;

  for (const intent of INTENTS) {
    if (intent.pattern.test(text)) {
      return intent.reply();
    }
  }

  return FALLBACK;
}
