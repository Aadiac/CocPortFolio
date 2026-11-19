'use client';

import React from 'react';
import AnimatedLink from '@/components/ui/AnimateLink';
import Magnetic from '@/components/ui/Magnetic';
import { FaArrowUp } from 'react-icons/fa';
import { useHandleLinkClick } from '@/lib/navigation';
import { useLenis } from '@/components/providers/SmoothScrollProvider';
import { socialList, navLinks, isExternalLink } from '@/lib/site';
import Lenis from 'lenis';

const Footer = () => {
  const lenisRef = useLenis() as React.RefObject<Lenis | null> | null;
  const lenis = lenisRef?.current;

  const handleLinkClick = useHandleLinkClick();
  const links = navLinks.filter((l) => !('menuOnly' in l && l.menuOnly));

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-30 bg-ink border-t border-border-subtle px-6 sm:px-8 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 md:gap-12 mb-10 md:mb-12">
          <div>
            <h3 className="text-light/90 text-base sm:text-lg font-sans tracking-wide font-semibold mb-4 md:mb-6">
              Menu
            </h3>
            <ul className="flex flex-col gap-3 sm:gap-4 text-gray-soft text-xs sm:text-sm font-sans font-medium uppercase tracking-wide">
              {links.map((link) => (
                <AnimatedLink key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href);
                    }}
                  >
                    {link.name}
                  </a>
                </AnimatedLink>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-light/90 text-base sm:text-lg font-sans tracking-wide font-semibold mb-4 md:mb-6">
              Socials
            </h3>
            <ul className="flex flex-col gap-3 sm:gap-4 text-gray-soft text-xs sm:text-sm font-sans font-medium uppercase tracking-wide">
              {socialList.map((s) => (
                <AnimatedLink key={s.label}>
                  <a
                    href={s.href}
                    {...(isExternalLink(s.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {s.label}
                  </a>
                </AnimatedLink>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Magnetic strength={0.4}>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-elevated-dark border border-border-subtler flex items-center justify-center text-gray-soft hover:text-accent hover:border-accent hover:bg-accent/10 transition-all duration-300 group focus:outline-none"
              aria-label="Scroll to top"
            >
              <FaArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
