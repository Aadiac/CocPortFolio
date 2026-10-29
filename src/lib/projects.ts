export interface ProjectStat {
  value: string;
  label: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  type: string;
  role: string;
  tech: string[];
  description: string;
  overview: string;
  architecture: string;
  implementation: string;
  stats: ProjectStat[];
  accent: string;
  myRole: string[];
  images: string[];
  hoverImage: string;
  github: string;
  liveUrl: string;
}

// TODO: Replace this placeholder with your own case studies.
// Duplicate the object to add more projects. `slug` becomes the URL: /projects/<slug>.
// Screenshots live in public/Projects/ — swap the image paths for your own files.
const projects: Project[] = [
  {
    id: 1,
    slug: 'your-project',
    title: 'Your Project',
    type: 'Web Application',
    role: 'Full Stack Developer',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    description:
      'A one-line summary of what this project does and who it is for.',
    overview:
      'Describe the problem this project solves and the core experience it delivers. Two or three sentences is enough.',
    architecture:
      'Explain how the system is put together: the frontend, the API, the database, and how data flows between them.',
    implementation:
      'Call out the interesting technical decisions — the hard problem you solved, the trade-off you made, and the result.',
    stats: [
      { value: '—', label: 'Add a metric' },
      { value: '—', label: 'Add a metric' },
      { value: '—', label: 'Add a metric' },
    ],
    accent: '#34D399',
    myRole: [
      'Describe a responsibility you owned end to end.',
      'Describe a second responsibility and the impact it had.',
      'Describe a third responsibility, tool, or integration.',
    ],
    images: [
      '/Projects/placeholder-1.webp',
      '/Projects/placeholder-2.webp',
      '/Projects/placeholder-3.webp',
    ],
    hoverImage: '/Projects/placeholder-1.webp',
    github: 'https://github.com/yourhandle/your-project',
    liveUrl: 'https://example.com',
  },
];

export function getAllProjects(): Project[] {
  return projects;
}
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: projects[(idx - 1 + projects.length) % projects.length],
    next: projects[(idx + 1) % projects.length],
  };
}
