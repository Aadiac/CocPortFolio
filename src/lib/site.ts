// TODO: Replace every placeholder below with your own details.
// This file is the single source of truth for your name, links and contact info.
export const site = {
  name: 'Aadith P S',
  firstName: 'Aadith',
  lastName: 'P S',
  handle: 'yourhandle',
  brand: 'yourname.dev',
  email: 'aadithpsaadi@gmail.com',
  location: 'Thrissur, Kerala, India',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  url: 'https://your-domain.com',
  tagline: 'Backend engineer building high-performance Go microservices and data pipelines.',
  roles: [
    'Full Stack Developer',
    'Go lang developer',
    'Backend Developer',
    'Ai Engineer',
  ],
} as const;

// Quick facts the Builder chat answers from ("How many years of experience?", "How long with Go?").
// Leave a value empty ('') and the chat says that detail isn't shared yet instead of guessing.
export const profile = {
  totalExperience: '3 years', // e.g. '3 years'
  currentRole: 'a Full Stack Developer at Y’s Technologies', // e.g. 'Backend Engineer at Acme'
  education: 'B.Tech in Computer Science & Engineering at APJ Abdul Kalam Technological University (2019–2023)', // e.g. 'B.Tech in Computer Science, XYZ University (2022)'
  noticePeriod: '30 days', // e.g. '30 days' or 'Immediately'
  // Years per technology, matched against the visitor's question by name (case-insensitive).
  techExperience: {
    Go: '3 years', // e.g. '2 years'
    'C++': '2.5 years',
  } as Record<string, string>,
};

export type SocialKey = 'github' | 'linkedin' | 'email';

export const socials: Record<SocialKey, { label: string; href: string }> = {
  github: { label: 'GitHub', href: 'https://github.com/Aadiac' },
  linkedin: { label: 'Linkedin', href: 'https://www.linkedin.com/in/aadith-ps' },
  email: { label: 'Email', href: `mailto:${site.email}` },
};

export const socialList: Array<{ label: string; href: string }> = [
  socials.linkedin,
  socials.github,
  socials.email,
];

// mailto: links open the mail app, so they must not open a new blank tab.
export const isExternalLink = (href: string) => !href.startsWith('mailto:');

export const navLinks = [
  { name: 'Home', href: '/#top', menuOnly: true },
  { name: 'About', href: '/#about' },
  { name: 'Services', href: '/#services' },
  { name: 'Work', href: '/#projects' },
  { name: 'Contact', href: '/#contact' },
] as const;
