'use client';

import { useRef } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/gsap';
import AnimatedHeading from '@/components/ui/AnimateHeading';
import ScrollWordReveal from '@/components/ui/ScrollWordReveal';

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (window.innerWidth < 768) return;
      const allSections = servicesRef.current.filter(Boolean);
      const pinOffset = 50;
      allSections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: `top ${pinOffset + index * 100}px`,
          endTrigger: allSections[allSections.length - 1],
          end: 'bottom bottom',
          pin: true,
          pinSpacing: false,
        });
      });
    },
    { scope: sectionRef },
  );

  const headingWords = [
    { t: 'WHAT' },
    { t: 'i', serif: true },
    { t: 'DO' },
  ];
  const descriptionText =
    "I engineer scalable backend systems, high-performance microservices, and real-time applications using Go, C++, Node.js, and Linux. From building carrier-grade 5G telecom systems to developing AI-powered applications with LLMs and RAG, I focus on concurrency, system performance, and building reliable, intelligent software."
  const services = [
    {
      id: '01',
      title: 'Full Stack Development',
      description:
        'Building end-to-end web and mobile applications, from responsive frontend interfaces to scalable backend services and APIs. I develop maintainable, high-performance applications using modern JavaScript frameworks and backend technologies.',
      items: [
        'React.js & React Native (PostgreSQL, Express.js, React, Node.js)',
        'Go, Node.js ,REST APIs & Integration',
        'Database Design & Integration',
        'Authentication & Authorization',
      ],
    },
    {
      id: '02',
      title: 'Backend Development',
      description:
        'Designing and developing high-performance backend systems, scalable microservices, and reliable APIs. I focus on distributed architectures, concurrent processing, and low-latency systems using Go, C++, Node.js, and Linux.',
      items: [
        'Go, C++ & Node.js',
        'Microservices & Distributed Systems',
        'Concurrency & Performance Optimization',
        'REST APIs & Database Management'
      ],
    },
    {
      id: '03',
      title: 'Frontend Development',
      description:
        'Building responsive, interactive, and user-friendly web interfaces with a focus on clean design, performance, and seamless user experiences. I create modern web and mobile interfaces using React, React Native, and modern frontend technologies.',
      items: [
        ' React.js & React Native',
        'Responsive UI & Component Architecture',
        'State Management & API Integration',
      ],
    },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="min-h-screen bg-ink text-light pt-24 pb-16 md:pt-32 md:pb-20 px-6 sm:px-8 md:px-12 lg:px-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 md:mb-20">
          <AnimatedHeading
            words={headingWords}
            className="text-[clamp(2.5rem,7vw,6.5rem)] tracking-tight mb-4"
          />

          <div className="grid md:grid-cols-12 gap-4 md:gap-8">
            <div className="md:col-start-6 md:col-span-7 flex flex-col md:flex-row gap-3 md:gap-10">
              <span className="font-mono text-sm sm:text-base md:text-base text-warm uppercase tracking-[0.3em] font-medium whitespace-nowrap inline-block">
                (Services)
              </span>

              <ScrollWordReveal
                text={descriptionText}
                offset={['start 0.95', 'end 0.65']}
                className="max-w-2xl text-base sm:text-lg md:text-xl text-gray-soft font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="relative pb-8 md:pb-24">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => {
                servicesRef.current[index] = el;
              }}
              className="bg-ink pb-12 md:pb-20"
              style={{ zIndex: index + 1 }}
            >
              <div className="grid md:grid-cols-12 gap-4 items-center py-4 md:py-8 border-t border-border-subtle">
                <h3
                  className="font-display md:col-span-9 md:col-start-2 text-light font-bold text-2xl sm:text-2xl md:text-4xl lg:text-5xl leading-none"
                  style={{ transform: 'translateY(-0.1em)' }}
                >
                  {service.title}
                </h3>
              </div>

              <div className="grid md:grid-cols-12 gap-4 md:gap-8 pt-4 md:pt-6">
                <div className="md:col-span-7 md:col-start-6 space-y-4 md:space-y-6">
                  <ScrollWordReveal
                    text={service.description}
                    offset={['start 0.95', 'end 0.7']}
                    className="text-gray-soft text-base sm:text-base md:text-lg leading-relaxed font-sans"
                  />

                  <div className="divide-y divide-border-subtle">
                    {service.items.map((item, i) => (
                      <div key={i} className="py-3 flex items-center gap-3 md:gap-4">
                        <span className="text-accent-light text-xs md:text-sm font-mono font-bold">
                          0{i + 1}
                        </span>
                        <span className="text-base sm:text-base md:text-lg font-bold font-sans text-light">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
