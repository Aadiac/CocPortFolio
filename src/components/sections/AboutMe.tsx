'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import ScrollWordReveal from '@/components/ui/ScrollWordReveal';
import AnimatedHeading from '@/components/ui/AnimateHeading';
import CodeTyper from '@/components/ui/CodeTyper';
import FlowField from '@/components/canvas/FlowField';
import JourneyTimeline from '@/components/sections/JourneyTimeline';

const About = () => {
  const headingWords = [
    { t: 'WHO' },
    { t: 'am', serif: true },
    { t: 'i?' },
  ];
  const descriptionText =
    'I design distributed backend architectures with Go and C++, backed by clean full-stack execution.';
  const aboutMeText = `I am a Backend Engineer with 3 years of experience building high-performance distributed systems, low-latency microservices, and concurrent applications using Go, C++, and Linux.

My experience spans developing carrier-grade 5G PCF modules for live telecom networks to architecting real-time platforms using Node.js and WebSockets. I also work with AI technologies, including LLM integration, RAG pipelines, vector databases, and semantic search to build intelligent applications.

I focus on concurrency, memory efficiency, system performance, and designing scalable, reliable software.`;

  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        '.about-image-wrapper',
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', force3D: true },
      );

      tl.fromTo(
        '.about-label',
        { opacity: 0, letterSpacing: '0.45em' },
        { opacity: 1, letterSpacing: '0.3em', duration: 1, ease: 'power3.out' },
      );
    },
    { scope: sectionRef },
  );

  return (
    <div className="bg-cream">
      <section
        ref={sectionRef}
        id="about"
        className="min-h-screen bg-ink texture-wood text-light pt-24 md:pt-32 rounded-t-4xl overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-10 md:mb-20">
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

          <div className="grid grid-cols-12 gap-6 md:gap-8 pb-16 md:pb-24 items-center">
            <div className="col-span-12 md:col-span-5 lg:col-span-5 flex items-center justify-center">
              <div className="about-image-wrapper relative group w-full max-w-[350px] md:max-w-[380px] h-[360px] md:h-[480px] bg-elevated-dark rounded-2xl overflow-hidden border border-border-subtler shadow-2xl">
                <FlowField />
                <CodeTyper />
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 lg:col-span-6 md:col-start-6 lg:col-start-7 flex flex-col justify-center space-y-8">
              <span className="about-label font-mono text-sm sm:text-base md:text-base text-warm uppercase tracking-[0.3em] font-medium text-center md:text-left inline-block">
                (About Me)
              </span>
              <div className="space-y-6">
                {aboutMeText.split('\n\n').map((p, i) => (
                  <ScrollWordReveal
                    key={i}
                    text={p}
                    offset={['start 0.92', 'end 0.65']}
                    className="text-base sm:text-lg md:text-lg leading-relaxed font-sans"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <JourneyTimeline />
      </section>
    </div>
  );
};

export default About;
