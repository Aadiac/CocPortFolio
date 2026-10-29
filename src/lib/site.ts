// TODO: Replace every placeholder below with your own details.
// This file is the single source of truth for your name, links and contact info.
export const site = {
  name: 'Your Name',
  firstName: 'Your',
  lastName: 'Name',
  handle: 'yourhandle',
  brand: 'yourname.dev',
  email: 'you@example.com',
  location: 'Your City, Country',
  timeZone: 'UTC',
  timeZoneLabel: 'UTC',
  url: 'https://your-domain.com',
  tagline: 'Full stack developer crafting fast, expressive web experiences.',
  roles: [
    'Full Stack Developer',
    'React & Next.js Engineer',
    'MERN Stack Developer',
    'Open to Work Worldwide',
  ],
} as const;

export type SocialKey = 'github' | 'linkedin' | 'instagram' | 'source';

export const socials: Record<SocialKey, { label: string; href: string }> = {
  github: { label: 'GitHub', href: 'https://github.com/yourhandle' },
  linkedin: { label: 'Linkedin', href: 'https://linkedin.com/in/yourhandle' },
  instagram: { label: 'Instagram', href: 'https://instagram.com/yourhandle' },
  source: { label: 'Source Code', href: 'https://github.com/yourhandle/portfolio' },
};

export const socialList: Array<{ label: string; href: string }> = [
  socials.linkedin,
  socials.instagram,
  socials.github,
  socials.source,
];

export const navLinks = [
  { name: 'Home', href: '/#top', menuOnly: true },
  { name: 'About', href: '/#about' },
  { name: 'Services', href: '/#services' },
  { name: 'Work', href: '/#projects' },
  { name: 'Contact', href: '/#contact' },
] as const;
