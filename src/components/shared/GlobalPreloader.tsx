'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/*
 * Builder loading sequence, played frame by frame from public/builder/loader/*.webp.
 * Plan → hammer strikes (repeated while the page is still loading) → built → wipe brow → thumbs-up → exit.
 */
type LoaderFrame = 'plan' | 'plan-open' | 'raise' | 'swing' | 'impact' | 'built' | 'wipe' | 'thumbs-up';

const FRAMES: LoaderFrame[] = ['plan', 'plan-open', 'raise', 'swing', 'impact', 'built', 'wipe', 'thumbs-up'];
const FRAME_SIZE = { width: 353, height: 440 };

const INTRO: [LoaderFrame, number][] = [
  ['plan', 380],
  ['plan-open', 380],
];
const STRIKE: [LoaderFrame, number][] = [
  ['raise', 280],
  ['swing', 110],
  ['impact', 300],
];
const FINALE: [LoaderFrame, number][] = [
  ['built', 420],
  ['wipe', 460],
  ['thumbs-up', 560],
];

const MIN_DISPLAY_MS = 1400;
const HARD_CAP_MS = 3200;

export default function GlobalPreloader({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);
  const [frame, setFrame] = useState<LoaderFrame>('plan');
  const [finishing, setFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dimension, setDimension] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  const targetRef = useRef(0);
  const displayedRef = useRef(0);
  const fontsResolvedRef = useRef(false);
  const loadedRef = useRef(false);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const playExitAnimation = useRef(() => {});
  playExitAnimation.current = () => {
    if (!containerRef.current || !curvePathRef.current) {
      onCompleteRef.current?.();
      return;
    }

    const targetD = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
      dimension.width / 2
    } ${dimension.height} 0 ${dimension.height} L0 0`;

    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current?.();
      },
    });

    tl.to(curvePathRef.current, {
      attr: { d: targetD },
      duration: 0.7,
      ease: 'power3.inOut',
      delay: 0.15,
    }).to(
      containerRef.current,
      {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
      },
      '<',
    );
  };

  useEffect(() => {
    startedAtRef.current = performance.now();
    document.fonts?.ready.then(() => {
      fontsResolvedRef.current = true;
    });
    const onLoad = () => {
      loadedRef.current = true;
    };
    if (document.readyState === 'complete') loadedRef.current = true;
    window.addEventListener('load', onLoad);

    const capTimer = setTimeout(() => {
      fontsResolvedRef.current = true;
      loadedRef.current = true;
    }, HARD_CAP_MS - MIN_DISPLAY_MS);

    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(capTimer);
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const elapsed = performance.now() - startedAtRef.current;

      let target = Math.min(90, (elapsed / MIN_DISPLAY_MS) * 88);
      if (fontsResolvedRef.current) target = Math.max(target, 55);
      if (loadedRef.current) target = Math.max(target, 80);
      if (fontsResolvedRef.current && loadedRef.current && elapsed >= MIN_DISPLAY_MS) {
        target = 100;
      }

      targetRef.current = target;
      displayedRef.current += (targetRef.current - displayedRef.current) * 0.09;
      const shown = displayedRef.current >= 99.5 ? 100 : displayedRef.current;
      setProgress(shown);

      if (shown === 100 && !finishedRef.current) {
        finishedRef.current = true;
        try {
          sessionStorage.setItem('preloader-seen', '1');
        } catch {}
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Frame player. The hammer keeps striking while loading; once progress reaches 100%
  // the current strike finishes, then the finale plays and the curtain lifts.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const play = (steps: [LoaderFrame, number][], done: () => void, i = 0) => {
      if (cancelled) return;
      if (i >= steps.length) {
        done();
        return;
      }
      const [next, hold] = steps[i];
      setFrame(next);
      timer = setTimeout(() => play(steps, done, i + 1), hold);
    };

    const exit = () => setTimeout(() => !cancelled && playExitAnimation.current(), 120);

    const finale = () => {
      setFinishing(true);
      play(FINALE, exit);
    };

    const strikeLoop = () => play(STRIKE, () => (finishedRef.current ? finale() : strikeLoop()));

    // Reduced motion: one still pose, no frame cycling.
    const waitStill = () => {
      if (cancelled) return;
      if (finishedRef.current) {
        setFinishing(true);
        setFrame('thumbs-up');
        exit();
        return;
      }
      timer = setTimeout(waitStill, 100);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFrame('built');
      waitStill();
    } else {
      play(INTRO, strikeLoop);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ready = mounted && dimension.width > 0 && dimension.height > 0;
  const initialPath = ready
    ? `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
        dimension.width / 2
      } ${dimension.height + 300} 0 ${dimension.height} L0 0`
    : '';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#21160D] cursor-wait text-cream select-none pointer-events-auto"
      style={{ willChange: 'transform' }}
      role="status"
      aria-live="polite"
    >
      <div className="z-10 flex flex-col items-center gap-4">
        {/* All frames stay mounted (decoded once); only the current one is visible. */}
        <div
          className={`preloader-builder${frame === 'impact' && !reduced ? ' preloader-builder--impact' : ''}`}
          aria-hidden="true"
        >
          {FRAMES.map((name) => (
            <Image
              key={name}
              src={`/builder/loader/${name}.webp`}
              alt=""
              width={FRAME_SIZE.width}
              height={FRAME_SIZE.height}
              className="preloader-builder-frame"
              style={{ visibility: name === frame ? 'visible' : 'hidden' }}
              priority={name === 'plan' || name === 'raise'}
              loading="eager"
              unoptimized
              draggable={false}
            />
          ))}
        </div>
        <p className="font-display text-xl sm:text-2xl font-medium tracking-wide text-cream opacity-90">
          {finishing ? 'Village ready!' : 'Building the village…'}
        </p>
      </div>

      <div className="absolute bottom-8 left-8 z-10 flex items-baseline gap-3 font-mono" aria-hidden="true">
        <span className="text-accent text-sm uppercase tracking-widest">loading</span>
        <span className="text-cream text-lg tabular-nums">{Math.round(progress)}%</span>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent z-10"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />

      {ready && (
        <svg className="absolute top-0 -z-10 h-[calc(100%+300px)] w-full pointer-events-none">
          <path ref={curvePathRef} className="fill-[#141516]" d={initialPath} />
        </svg>
      )}
    </div>
  );
}
