import { getAllProjects } from '@/lib/projects';
import { site, socials } from '@/lib/site';
import { STACK_SECTIONS } from '@/components/sections/TechStack';
import { CREDENTIALS } from '@/components/sections/AboutMe';

/**
 * Deterministic, portfolio-aware replies for the Builder assistant.
 * Everything here is derived from the data the site already renders — nothing is invented.
 * This is a rule-based intent matcher, not a live AI model.
 */

// Same file the home banner's Resume button links to.
export const RESUME_URL = '/resume.pdf';

export type QuickActionId = 'skills' | 'projects' | 'experience' | 'resume' | 'contact';

export const QUICK_ACTIONS: ReadonlyArray<{ id: QuickActionId; label: string }> = [
  { id: 'skills', label: 'Explore My Skills' },
  { id: 'projects', label: 'View My Projects' },
  { id: 'experience', label: 'My Experience' },
  { id: 'resume', label: 'Download My Resume' },
  { id: 'contact', label: 'Contact Me' },
];

export type ReplyAction =
  | { kind: 'section'; label: string; href: string }
  | { kind: 'link'; label: string; href: string; download?: boolean }
  | { kind: 'retry'; label: string; id: QuickActionId }
  | { kind: 'menu'; label: string }
  | { kind: 'quick'; label: string; id: QuickActionId };

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface ProjectSummary {
  slug: string;
  title: string;
  type: string;
  description: string;
  tech: string[];
  caseStudyHref: string;
  github?: string;
  liveUrl?: string;
}

export interface ExperienceItem {
  year: string;
  title: string;
  organization: string;
  type: string;
  detail?: string;
}

export interface ContactLink {
  label: string;
  href: string;
  kind: 'email' | 'github' | 'linkedin' | 'instagram';
}

export type ReplyBlock =
  | { kind: 'quick-actions' }
  | { kind: 'skills'; groups: SkillGroup[] }
  | { kind: 'projects'; projects: ProjectSummary[] }
  | { kind: 'experience'; items: ExperienceItem[] }
  | { kind: 'contact'; links: ContactLink[] };

export interface BotReply {
  text: string;
  block?: ReplyBlock;
  actions?: ReplyAction[];
  /** Hint for the character animation after the reply lands. */
  mood?: 'responding' | 'celebrating';
}

/** The resume needs a network check, so the panel resolves it instead of this module. */
export type BotResult = { type: 'reply'; reply: BotReply } | { type: 'resume' };

export const WELCOME_TEXT =
  "Hey Chief! Welcome to my village. I'm your personal Builder. Want to explore my skills, projects, or experience?";

const MENU_ACTION: ReplyAction = { kind: 'menu', label: 'Main menu' };

// ---------------------------------------------------------------------------
// Placeholder detection: the template ships with placeholder data. Links that are
// clearly placeholders are never offered as working destinations.

const PLACEHOLDER_LINK = /yourhandle|your-domain|example\.com|you@example/i;
const PLACEHOLDER_TEXT = /^your |^company name$|^university name$|^issuing organization$|^optional detail$|placeholder/i;

const isRealLink = (href: string | undefined): href is string => !!href && !PLACEHOLDER_LINK.test(href);
const isPlaceholderText = (value: string) => PLACEHOLDER_TEXT.test(value.trim());

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => (word === '&' || word === 'ai' ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');

// ---------------------------------------------------------------------------
// Data selectors

export function getSkillGroups(): SkillGroup[] {
  return STACK_SECTIONS.map((section) => ({
    title: titleCase(section.title),
    items: section.technologies.map((tech) => tech.name),
  }));
}

export function getProjectSummaries(): ProjectSummary[] {
  return getAllProjects().map((project) => ({
    slug: project.slug,
    title: project.title,
    type: project.type,
    description: project.description,
    tech: project.tech,
    caseStudyHref: `/projects/${project.slug}`,
    github: isRealLink(project.github) ? project.github : undefined,
    liveUrl: isRealLink(project.liveUrl) ? project.liveUrl : undefined,
  }));
}

export function getExperienceItems(): ExperienceItem[] {
  return CREDENTIALS.filter((item) => !isPlaceholderText(item.title)).map((item) => ({
    year: item.year,
    title: item.title,
    organization: isPlaceholderText(item.organization) ? '' : item.organization,
    type: item.type,
    detail: 'stat' in item && item.stat && !isPlaceholderText(item.stat) ? item.stat : undefined,
  }));
}

export function getContactLinks(): ContactLink[] {
  const links: ContactLink[] = [];
  if (isRealLink(site.email)) links.push({ label: site.email, href: `mailto:${site.email}`, kind: 'email' });
  if (isRealLink(socials.linkedin.href)) links.push({ label: 'LinkedIn', href: socials.linkedin.href, kind: 'linkedin' });
  if (isRealLink(socials.github.href)) links.push({ label: 'GitHub', href: socials.github.href, kind: 'github' });
  if (isRealLink(socials.instagram.href))
    links.push({ label: 'Instagram', href: socials.instagram.href, kind: 'instagram' });
  return links;
}

// ---------------------------------------------------------------------------
// Technology lookup ("Have you worked with Docker?")

interface TechEntry {
  name: string;
  group: string;
  aliases: RegExp;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const aliasesFor = (name: string): string[] => {
  const lower = name.toLowerCase();
  const aliases = new Set<string>([lower]);
  const withoutJs = lower.replace(/\.js$/, '');
  // "next" alone is too common a word to count as a mention of Next.js.
  if (withoutJs !== 'next') aliases.add(withoutJs);
  aliases.add(lower.replace(/[.\s]/g, ''));
  if (lower === 'tailwind css') aliases.add('tailwind');
  if (lower === 'redux toolkit') aliases.add('redux');
  if (lower === 'gemini ai') aliases.add('gemini');
  if (lower === 'javascript') aliases.add('js');
  if (lower === 'typescript') aliases.add('ts');
  return [...aliases].filter((alias) => alias.length > 1);
};

let techIndex: TechEntry[] | null = null;

const getTechIndex = (): TechEntry[] => {
  if (techIndex) return techIndex;
  const entries = new Map<string, TechEntry>();
  const add = (name: string, group: string) => {
    const key = name.toLowerCase();
    if (entries.has(key)) return;
    const pattern = aliasesFor(name).map(escapeRegExp).join('|');
    entries.set(key, { name, group, aliases: new RegExp(`(^|[^a-z0-9])(${pattern})(?![a-z0-9])`, 'i') });
  };
  getSkillGroups().forEach((group) => group.items.forEach((item) => add(item, group.title)));
  getAllProjects().forEach((project) => project.tech.forEach((tech) => add(tech, 'Projects')));
  techIndex = [...entries.values()];
  return techIndex;
};

const findTech = (text: string) => getTechIndex().filter((entry) => entry.aliases.test(text));

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// ---------------------------------------------------------------------------
// Replies

const skillsReply = (): BotReply => ({
  text: "Here's the toolbox I build with, Chief — sorted by workshop:",
  block: { kind: 'skills', groups: getSkillGroups() },
  actions: [{ kind: 'section', label: 'View Skills Section', href: '/#tech-stack' }, MENU_ACTION],
});

const projectsReply = (): BotReply => {
  const projects = getProjectSummaries();
  if (projects.length === 0) {
    return {
      text: 'The workbench is empty right now — check the Work section for the latest builds.',
      actions: [{ kind: 'section', label: 'Open Work Section', href: '/#projects' }, MENU_ACTION],
    };
  }
  return {
    text:
      projects.length === 1
        ? 'One build is finished and on display in the village:'
        : `${projects.length} builds are finished and on display in the village:`,
    block: { kind: 'projects', projects },
    actions: [{ kind: 'section', label: 'Open Work Section', href: '/#projects' }, MENU_ACTION],
    mood: 'celebrating',
  };
};

const experienceReply = (): BotReply => {
  const items = getExperienceItems();
  const actions: ReplyAction[] = [{ kind: 'section', label: 'View Experience Section', href: '/#about' }, MENU_ACTION];
  if (items.length === 0) {
    return {
      text: 'My experience and education timeline lives in the About section — I can walk you straight there.',
      actions,
    };
  }
  return { text: "Here's the path so far:", block: { kind: 'experience', items }, actions };
};

const contactReply = (): BotReply => {
  const links = getContactLinks();
  return {
    text:
      links.length > 0
        ? 'Send a raven any of these ways, or use the contact form at the bottom of the page:'
        : 'The best way to reach me is the contact form at the bottom of the page.',
    block: links.length > 0 ? { kind: 'contact', links } : undefined,
    actions: [{ kind: 'section', label: 'Open Contact Form', href: '/#contact' }, MENU_ACTION],
  };
};

export const menuReply = (): BotReply => ({
  text: 'What shall we explore next, Chief?',
  block: { kind: 'quick-actions' },
});

export const welcomeReply = (): BotReply => ({
  text: WELCOME_TEXT,
  block: { kind: 'quick-actions' },
});

const text = (value: string, actions: ReplyAction[] = [MENU_ACTION]): BotResult => ({
  type: 'reply',
  reply: { text: value, actions },
});

export function getReplyForAction(id: QuickActionId): BotResult {
  switch (id) {
    case 'skills':
      return { type: 'reply', reply: skillsReply() };
    case 'projects':
      return { type: 'reply', reply: projectsReply() };
    case 'experience':
      return { type: 'reply', reply: experienceReply() };
    case 'contact':
      return { type: 'reply', reply: contactReply() };
    case 'resume':
      return { type: 'resume' };
  }
}

const ASK_ABOUT_TECH =
  /\b(?:worked with|work with|working with|use|used|using|know|knows|familiar with|experience (?:with|in)|skilled in|good at|code in|program in|write)\s+([a-z0-9.#+\-\s]{1,30}?)\s*\??$/;

const FALLBACK =
  "That one isn't in my blueprints, Chief. Try asking about my skills, projects, experience, or contact details.";

export function getBotReply(raw: string): BotResult {
  const input = raw.toLowerCase().trim();
  if (!input) return text(FALLBACK);

  if (/\b(menu|start over|options|what can you do|help)\b/.test(input)) {
    return { type: 'reply', reply: menuReply() };
  }

  if (/\b(resume|cv|curriculum vitae)\b/.test(input)) return { type: 'resume' };

  const techMatches = findTech(input);
  const isGenericSkills = /\b(skills?|tech|stack|technolog\w*|tools?|frameworks?|languages?|toolbox)\b/.test(input);
  if (techMatches.length > 0 && !isGenericSkills) {
    const lines = techMatches.slice(0, 4).map((entry) =>
      entry.group === 'Projects' ? `${entry.name} (used in my projects)` : `${entry.name} (${entry.group})`,
    );
    return text(`Yes, Chief! ${joinList(lines)} ${techMatches.length > 1 ? 'are' : 'is'} in my toolbox.`, [
      { kind: 'quick', label: 'See all skills', id: 'skills' },
      MENU_ACTION,
    ]);
  }

  if (isGenericSkills) return getReplyForAction('skills');

  if (/\b(contact|email|e-mail|reach|get in touch|message you|linkedin|github)\b/.test(input)) {
    return getReplyForAction('contact');
  }

  const asked = input.match(ASK_ABOUT_TECH)?.[1]?.trim();
  if (asked && !/^(it|that|this|you|me|them|any|anything)$/.test(asked)) {
    return text(
      `${asked.charAt(0).toUpperCase()}${asked.slice(1)} isn't listed in my portfolio's tech stack, so I won't claim it. Want to see what is?`,
      [{ kind: 'quick', label: 'See my skills', id: 'skills' }, MENU_ACTION],
    );
  }

  if (/\b(projects?|portfolio|case stud\w*|demo|builds?|built)\b/.test(input)) return getReplyForAction('projects');

  if (/\b(experience|education|background|career|degree|university|studied|study|journey|worked|jobs? history|roles?)\b/.test(input)) {
    return getReplyForAction('experience');
  }

  if (/\b(available|availability|open to work|freelance|opportunit\w*|hire|hiring)\b/.test(input)) {
    return text(
      "Yes, Chief — I'm open to new opportunities and freelance work. Share a few details through the contact form and I'll get back to you.",
      [{ kind: 'section', label: 'Open Contact Form', href: '/#contact' }, MENU_ACTION],
    );
  }

  if (/\b(services?|what do you do|offer|speciali[sz]e)\b/.test(input)) {
    return text(
      'I offer full-stack development, frontend engineering and performance optimisation — from interfaces and APIs to authentication, SEO and deployment.',
      [{ kind: 'section', label: 'View Services', href: '/#services' }, MENU_ACTION],
    );
  }

  if (/\b(price|pricing|cost|rate|budget|quote|timeline|how much)\b/.test(input)) {
    return text(
      "Pricing depends on scope, so every project is quoted individually. Share what you have in mind through the contact form and I'll follow up.",
      [{ kind: 'section', label: 'Open Contact Form', href: '/#contact' }, MENU_ACTION],
    );
  }

  if (/\b(where|location|located|based|country|city|timezone|time zone)\b/.test(input)) {
    return text(
      isPlaceholderText(site.location)
        ? "The About section covers where I'm based."
        : `I'm based in ${site.location} (${site.timeZoneLabel}).`,
      [{ kind: 'section', label: 'View About Section', href: '/#about' }, MENU_ACTION],
    );
  }

  if (/\b(about|who are you|who is|bio)\b/.test(input)) {
    return text('The About section tells the story — who I am and how I build.', [
      { kind: 'section', label: 'View About Section', href: '/#about' },
      MENU_ACTION,
    ]);
  }

  if (/\b(thanks|thank you|thx|appreciate)\b/.test(input)) return text('Anytime, Chief. Anything else you would like to see?');
  if (/\b(bye|goodbye|see you|later)\b/.test(input)) {
    return text('Thanks for stopping by, Chief. The village gates are always open.');
  }
  if (/\b(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/.test(input)) {
    return { type: 'reply', reply: menuReply() };
  }

  return { type: 'reply', reply: { text: FALLBACK, block: { kind: 'quick-actions' } } };
}
