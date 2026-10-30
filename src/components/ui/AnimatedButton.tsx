'use client';

import React, { useRef, useEffect, ElementType } from 'react';
import { gsap } from '@/lib/gsap';

interface AnimatedButtonProps {
  onClick?: (e: React.MouseEvent<any>) => void;
  topText: React.ReactNode;
  bottomText: React.ReactNode;
  variant?: 'light' | 'primary' | 'outline' | 'dark';
  className?: string;
  as?: ElementType;
  disabled?: boolean;
  [key: string]: any;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onClick,
  topText,
  bottomText,
  variant = 'dark',
  className = '',
  as = 'button',
  disabled = false,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<any>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  const Component = as;

  // Game-style surfaces live in globals.css (.btn-game--*); the gradient sits on
  // background-image, so the GSAP background-color tween only tints underneath it.
  let variantClass, rippleColor, hoverBgColor, originalBgColor;
  switch (variant) {
    case 'light':
      variantClass = 'btn-game--gold';
      rippleColor = 'rgba(255, 255, 255, 0.3)';
      hoverBgColor = '#F2B632';
      originalBgColor = '#F2B632';
      break;
    case 'primary':
      variantClass = 'btn-game--green';
      rippleColor = 'rgba(255, 255, 255, 0.25)';
      hoverBgColor = '#5FB13A';
      originalBgColor = '#5FB13A';
      break;
    case 'outline':
      variantClass = 'btn-game--parchment';
      rippleColor = 'rgba(122, 74, 36, 0.12)';
      hoverBgColor = '#F1DFB1';
      originalBgColor = '#F1DFB1';
      break;
    case 'dark':
    default:
      variantClass = 'btn-game--wood';
      rippleColor = 'rgba(255, 255, 255, 0.15)';
      hoverBgColor = '#7A4A24';
      originalBgColor = '#7A4A24';
      break;
  }

  const handleMouseEnter = (e: React.MouseEvent<any>) => {
    if (disabled) return;
    if (typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || !window.matchMedia('(hover: hover)').matches)) return;
    const button = buttonRef.current;
    const ripple = rippleRef.current;
    if (!button || !ripple) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );
    const finalScale = (maxDistance * 2) / 100;

    gsap.set(ripple, { left: x, top: y, scale: 0, opacity: 1 });
    gsap.to(ripple, { scale: finalScale, opacity: 0.6, duration: 0.6, ease: 'power2.out' });
    gsap.to(button, { backgroundColor: hoverBgColor, duration: 0.4, ease: 'power2.out' });
  };

  const handleButtonMouseLeave = () => {
    const button = buttonRef.current;
    const ripple = rippleRef.current;
    if (!button || !ripple) return;
    gsap.to(ripple, { scale: 0, opacity: 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(button, { backgroundColor: originalBgColor, duration: 0.4, ease: 'power2.out' });
  };

  useEffect(() => {
    const container = containerRef.current;
    const el = buttonRef.current;
    if (!container || !el || disabled) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches || !window.matchMedia('(hover: hover)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled]);

  return (
    <div ref={containerRef} className="inline-flex justify-center items-center md:p-8 md:-m-8 pointer-events-auto">
      <Component
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        disabled={disabled}
        className={`relative text-xs md:text-sm outline-none overflow-hidden h-10 md:h-12 px-4 sm:px-6 md:px-8 btn-game ${variantClass} group cursor-pointer inline-flex items-center justify-center ${className}`}
        style={{ transformOrigin: 'center' }}
        {...props}
      >
        <span
          ref={rippleRef}
          className="absolute pointer-events-none rounded-full w-[100px] h-[100px] -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: rippleColor, opacity: 0 }}
        />

        <span className="flex items-center justify-center h-full transition-transform duration-300 ease-in-out group-hover:-translate-y-full relative z-10">
          {topText}
        </span>

        <span aria-hidden="true" className="flex items-center justify-center h-full absolute inset-0 top-full transition-transform duration-300 ease-in-out group-hover:-translate-y-full z-10">
          {bottomText}
        </span>
      </Component>
    </div>
  );
};

export default AnimatedButton;
