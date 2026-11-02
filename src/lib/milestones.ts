/**
 * Shared milestone data for the portfolio.
 *
 * Used by the scroll-driven Journey timeline and the Builder chatbot, so the
 * rendered section and the assistant always stay in sync. Replace the
 * placeholders below with your real roles, certifications, awards and
 * education.
 */

export interface Milestone {
  year: string;
  type: string;
  title: string;
  organization: string;
  description: string;
  tags: string[];
  /** Adds a soft pulsing halo around the dot (useful for your current role). */
  current?: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    year: '2026 — Present',
    type: 'Industry',
    title: 'Your Current Role',
    organization: 'Company name',
    description:
      'Leading front-end architecture for a product used by thousands of people every day.',
    tags: ['React', 'Next.js', 'Design systems'],
    current: true,
  },
  {
    year: '2025',
    type: 'Certification',
    title: 'Your Certification',
    organization: 'Issuing organization',
    description:
      'Cloud architecture, cost-aware scaling and resilient deployments.',
    tags: ['AWS', 'Cloud', 'CI/CD'],
  },
  {
    year: '2024',
    type: 'Award',
    title: 'Your Award or Recognition',
    organization: 'Awarding body',
    description:
      'Recognised for craft, performance and attention to detail.',
    tags: ['Craft', 'Performance'],
  },
  {
    year: '2023',
    type: 'Industry',
    title: 'Full-Stack Developer',
    organization: 'Previous company',
    description:
      'Shipped end-to-end features across React, Node and Postgres.',
    tags: ['TypeScript', 'Node.js', 'Postgres'],
  },
  {
    year: '2022 — 2026',
    type: 'Education',
    title: 'Your Degree',
    organization: 'University name',
    description:
      'Focused on distributed systems and human-computer interaction.',
    tags: ['Systems', 'HCI'],
  },
  {
    year: '2021',
    type: 'Certification',
    title: 'Front-End Developer',
    organization: 'Coursera',
    description:
      'Foundations in accessible, responsive interface engineering.',
    tags: ['Accessibility', 'CSS'],
  },
];
