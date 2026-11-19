'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import AnimatedHeading from '@/components/ui/AnimateHeading';
import ScrollWordReveal from '@/components/ui/ScrollWordReveal';

export interface TechItem {
  name: string;
  /** Path under /public. Without one, the chip shows the name's initials. */
  icon?: string;
}

export interface StackCategory {
  id: string;
  title: string;
  label?: string;
  description?: string;
  technologies: TechItem[];
}

export const STACK_SECTIONS: StackCategory[] = [
  {
    id: 'frontend',
    title: 'FRONTEND',
    technologies: [
      { name: 'JavaScript', icon: '/Services/js.png' },
      { name: 'TypeScript', icon: '/Services/typescript.svg' },
      { name: 'React', icon: '/Services/react.png' },
      { name: 'Tailwind CSS', icon: '/Services/tailwind.png' },
      { name: 'Responsive Design' },
      { name: 'Framer Motion', icon: '/Services/framermotion.svg' },
      { name: 'Expo', icon: '/Services/expo.svg' },
      { name: 'React Context API', icon: '/Services/react.png' },
      { name: 'REST API Integration' },
      { name: 'Axios', icon: '/Services/axios.svg' },
      { name: 'WebSockets' },
    ],
  },
  {
    id: 'backend',
    title: 'BACKEND & REAL-TIME',
    technologies: [
      { name: 'Golang', icon: '/Services/go.svg' },
      { name: 'C++', icon: '/Services/cplusplus.svg' },
      { name: 'Node.js', icon: '/Services/node.png' },
      { name: 'Python', icon: '/Services/python.svg' },
      { name: 'Express.js', icon: '/Services/express.png' },
      { name: 'Socket.io', icon: '/Services/socketio.svg' },
      { name: 'Firebase', icon: '/Services/firebase.svg' },
      { name: 'gRPC', icon: '/Services/grpc.svg' },
      { name: 'Microservices' },
      { name: 'Distributed Systems' },
      { name: 'Auth (AuthN / AuthZ)' },
      { name: 'Concurrency' },
    ],
  },
  {
    id: 'database',
    title: 'DATABASE & ORM',
    technologies: [
      { name: 'MongoDB', icon: '/Services/mongodb.svg' },
      { name: 'PostgreSQL', icon: '/Services/postgresql.svg' },
      { name: 'MySQL', icon: '/Services/mysql.svg' },
      { name: 'Redis', icon: '/Services/redis.svg' },
      { name: 'SQL' },
    ],
  },
  {
    id: 'realtime',
    title: 'REAL-TIME & PROTOCOLS',
    technologies: [
      { name: 'WebSockets' },
      { name: 'Socket.IO', icon: '/Services/socketio.svg' },
      { name: 'HTTP/2' },
    ],
  },
  {
    id: 'devops',
    title: 'DEVOPS & CLOUD',
    technologies: [
      { name: 'Docker', icon: '/Services/docker.svg' },
      { name: 'GitHub Actions', icon: '/Services/githubactions.svg' },
      { name: 'GitLab', icon: '/Services/gitlab.svg' },
      { name: 'Linux', icon: '/Services/linux.svg' },
      { name: 'Shell Scripting' },
      { name: 'Networking' },
      { name: 'tcpdump' },
      { name: 'Wireshark' },
      { name: 'CMake' },
      { name: 'Make' },
    ],
  },
  {
    id: 'tools',
    title: 'AI, TESTING & TOOLS',
    technologies: [
      { name: 'Gemini AI', icon: '/Services/geminiai.svg' },
      { name: 'Git', icon: '/Services/git.png' },
      { name: 'Postman', icon: '/Services/postman-icon.svg' },
      { name: 'Claude AI', icon: '/Services/claude.svg' },
      { name: 'Codex', icon: '/Services/openai.svg' },
      { name: 'LLMs' },
      { name: 'RAG' },
      { name: 'Claude', icon: '/Services/claude.svg' },
      { name: 'Prompt Engineering' },
      { name: 'Vector Databases' },
      { name: 'Semantic Search' },
      { name: 'AI Agents' },
      { name: 'LLM Integration' },
      { name: 'Swagger / OpenAPI', icon: '/Services/swagger.svg' },
      { name: 'Figma', icon: '/Services/figma.png' },
    ],
  },
];

/** "Distributed Systems" -> "DS", "Redis" -> "RE", "C++" -> "C+". */
const initials = (name: string) => {
  const words = name.replace(/[()]/g, '').split(/[\s/&-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
};

const TechStack = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  const headingWords = [
    { t: 'MY' },
    { t: 'TECH' },
    { t: 'stack', serif: true },
  ];
  const descriptionText =
    'A selection of technologies I use to design, build, and deploy applications.';

  const filterOptions = [
    { id: 'all', label: 'All Categories' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend & Real-Time' },
    { id: 'database', label: 'Database & ORM' },
    { id: 'realtime', label: 'Real-Time & Protocols' },
    { id: 'devops', label: 'DevOps & Cloud' },
    { id: 'tools', label: 'AI, Testing & Tools' },
  ];

  const visibleSections =
    activeFilter === 'all'
      ? STACK_SECTIONS
      : STACK_SECTIONS.filter((sec) => sec.id === activeFilter);

  useGSAP(
    () => {
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        const items = section.querySelectorAll('.tech-item');
        const title = titleRefs.current[index];

        if (title) {
          gsap.fromTo(
            title,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'top 70%',
                scrub: 0.5,
              },
            },
          );
        }

        if (items.length > 0) {
          gsap.fromTo(
            items,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.05,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'top 70%',
                scrub: 0.5,
              },
            },
          );
        }
      });
    },
    { scope: containerRef, dependencies: [activeFilter] },
  );

  return (
    <section
      ref={containerRef}
      id="tech-stack"
      className="bg-ink texture-wood text-light pt-24 pb-16 md:pt-32 md:pb-20 rounded-b-4xl overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-10 md:mb-14 hidden md:block">
          <AnimatedHeading
            words={headingWords}
            className="text-[clamp(2.5rem,7vw,6.5rem)] tracking-tight mb-4"
          />
          <ScrollWordReveal
            text={descriptionText}
            offset={['start 0.95', 'end 0.7']}
            className="text-base sm:text-lg md:text-xl text-gray-soft font-sans leading-relaxed"
          />
        </div>

        <div className="mb-8 md:hidden">
          <AnimatedHeading
            words={[{ t: 'MY' }, { t: 'stack', serif: true }]}
            className="text-[clamp(2.5rem,7vw,6.5rem)] tracking-tight mb-4"
          />
        </div>

        <div className="mb-12 flex flex-wrap gap-2 sm:gap-3 items-center">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`text-xs sm:text-sm font-mono tracking-wider px-3.5 py-1.5 rounded-[10px] border-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gold text-charcoal border-gold-dark font-semibold shadow-[0_3px_0_#B97F0F]'
                    : 'bg-elevated text-light border-wood shadow-[0_3px_0_#170F08] hover:border-gold hover:text-parchment'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-16 md:space-y-24">
          {visibleSections.map((stack, index) => (
            <div
              key={stack.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className="flex flex-col md:flex-row md:items-start md:justify-between gap-6"
            >
              <div className="md:w-1/3">
                <h3
                  ref={(el) => {
                    titleRefs.current[index] = el;
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-accent-light tracking-tight font-display uppercase flex flex-col gap-2"
                >
                  {stack.title.includes(' & ') ? (
                    <>
                      <span>{stack.title.split(' & ')[0]} &</span>
                      <span>{stack.title.split(' & ')[1]}</span>
                    </>
                  ) : (
                    stack.title
                  )}
                </h3>
                <span className="font-mono text-xs text-warm-light tracking-widest uppercase block mt-2">
                  {stack.technologies.length} Technologies
                </span>
              </div>

              <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {stack.technologies.map((tech, i) => (
                  <div key={i} className="tech-item h-full">
                    <div className={`chip-parchment flex items-center gap-3 p-3 h-full min-w-0 cursor-pointer ${i % 2 === 0 ? 'aura-gold' : 'aura-elixir'}`}>
                      <div className="w-10 h-10 flex items-center justify-center relative flex-shrink-0">
                        {tech.icon ? (
                          <Image
                            src={tech.icon}
                            alt={tech.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="w-full h-full rounded-lg bg-charcoal/10 border border-charcoal/20 flex items-center justify-center font-mono text-xs font-bold text-charcoal"
                          >
                            {initials(tech.name)}
                          </span>
                        )}
                      </div>
                      <p lang="en" className="min-w-0 text-xs sm:text-sm font-mono font-bold text-charcoal leading-tight hyphens-auto [overflow-wrap:anywhere]">
                        {tech.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
