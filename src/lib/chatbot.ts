import { site, socials } from '@/lib/site';

/**
 * Shared types and menu actions for the Builder assistant.
 * Every question is answered by /api/chat, which retrieves from the resume (src/lib/rag).
 * This module only covers replies that are not answers: menus, contact links, the resume file.
 */

// Same file the home banner's Resume button links to.
export const RESUME_URL = '/resume.pdf';

export type QuickActionId = 'skills' | 'projects' | 'experience' | 'resume' | 'contact' | 'chat';

export const QUICK_ACTIONS: ReadonlyArray<{ id: QuickActionId; label: string }> = [
  { id: 'skills', label: 'Explore My Skills' },
  { id: 'projects', label: 'View My Projects' },
  { id: 'experience', label: 'My Experience' },
  { id: 'resume', label: 'Download My Resume' },
  { id: 'contact', label: 'Contact Me' },
  { id: 'chat', label: 'Chat With Me' },
];

export type ReplyAction =
  | { kind: 'section'; label: string; href: string }
  | { kind: 'link'; label: string; href: string; download?: boolean }
  | { kind: 'retry'; label: string; id: QuickActionId }
  | { kind: 'menu'; label: string }
  | { kind: 'quick'; label: string; id: QuickActionId }
  /** Asks `question`, or `label` when no question is given. */
  | { kind: 'ask'; label: string; question?: string };

export interface ContactLink {
  label: string;
  href: string;
  kind: 'email' | 'github' | 'linkedin';
}

export type ReplyBlock = { kind: 'quick-actions' } | { kind: 'contact'; links: ContactLink[] };

export interface BotReply {
  text: string;
  block?: ReplyBlock;
  actions?: ReplyAction[];
  /** Hint for the character animation after the reply lands. */
  mood?: 'responding' | 'celebrating';
}

/** The panel resolves `resume` (network check) and `ask` (RAG request) itself. */
export type BotResult = { type: 'reply'; reply: BotReply } | { type: 'resume' } | { type: 'ask'; question: string };

export const WELCOME_TEXT = `Hey, I'm the Builder! Ask me about ${site.firstName}'s skills and projects.`;

const MENU_ACTION: ReplyAction = { kind: 'menu', label: 'Main menu' };

// The template ships with placeholder data. Clearly fake links are never offered as working destinations.
const PLACEHOLDER_LINK = /yourhandle|your-domain|example\.com|you@example/i;

const isRealLink = (href: string | undefined): href is string => !!href && !PLACEHOLDER_LINK.test(href);

export function getContactLinks(): ContactLink[] {
  const links: ContactLink[] = [];
  if (isRealLink(site.email)) links.push({ label: site.email, href: `mailto:${site.email}`, kind: 'email' });
  if (isRealLink(socials.linkedin.href)) links.push({ label: 'LinkedIn', href: socials.linkedin.href, kind: 'linkedin' });
  if (isRealLink(socials.github.href)) links.push({ label: 'GitHub', href: socials.github.href, kind: 'github' });
  return links;
}

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

const chatReply = (): BotReply => ({
  text: 'Pull up a stool, Chief! Ask me anything about my resume. Tap a question or type your own:',
  actions: [
    { kind: 'ask', label: 'How many years of experience do you have?' },
    { kind: 'ask', label: 'What did you build for 5G systems?' },
    { kind: 'ask', label: "What's your current role?" },
    { kind: 'ask', label: 'What is your notice period?' },
    { kind: 'ask', label: 'Where are you based?' },
    MENU_ACTION,
  ],
});

export const menuReply = (): BotReply => ({
  text: 'What shall we explore next, Chief?',
  block: { kind: 'quick-actions' },
});

export const welcomeReply = (): BotReply => ({
  text: WELCOME_TEXT,
});

export function getReplyForAction(id: QuickActionId): BotResult {
  switch (id) {
    case 'skills':
      return { type: 'ask', question: 'What are your technical skills?' };
    case 'projects':
      return { type: 'ask', question: 'What projects have you built?' };
    case 'experience':
      return { type: 'ask', question: 'Walk me through your work experience and education.' };
    case 'contact':
      return { type: 'reply', reply: contactReply() };
    case 'resume':
      return { type: 'resume' };
    case 'chat':
      return { type: 'reply', reply: chatReply() };
  }
}
