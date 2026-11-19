/**
 * Shared milestone data for the portfolio.
 *
 * Used by the scroll-driven Journey timeline. Replace the
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
    year: 'Jul 2026 — Present',
    type: 'Professional Experience',
    title: 'Full Stack Ai Developer',
    organization: 'Y’s Technologies',
    description:
      'Developed cross-platform mobile apps and React-based web applications, building scalable backend services using Go and Node.js. Worked on AI-powered solutions involving LLMs, RAG, Claude, and AI development tools.',
    tags: ['Go', 'Node.js', 'React Native', 'WebSockets' ,'LLMs' , 'RAG ','Claude' , 'Vector Databases' ,'Prompt Engineering' , 'AI Integration'],
    current: true,
  },
  {
    year: 'Dec 2023 — Jun 2026',
    type: 'Professional Experience',
    title: 'Backend Developer',
    organization: '6D Technologies',
    description:
      'Developed low-latency Go and C++ microservices for 5G systems, implementing core features of the 5G Policy Control Function (PCF) deployed in Singtels production network. Worked extensively with Linux and Docker for development, deployment, and system-level operations.',
    tags: ['Go', 'C++', 'Linux', 'Docker', '5G Core', 'Microservices', 'PostgreSQL', 'GitLab ', 'Distributed Systems', 'Concurrency'],
  },
  {
    year: '2019 — 2023',
    type: 'Education',
    title: 'B.Tech — Computer Science & Engineering',
    organization: 'APJ Abdul Kalam Technological University',
    description:
      'Undergraduate degree in computer science and engineering.',
    tags: ['Computer Science'],
  },
];
