'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import AnimatedHeading from '@/components/ui/AnimateHeading';
import { MILESTONES } from '@/lib/milestones';
import s from './journey-timeline.module.css';

/* ==========================================================================
   HAMMER SPRITE CONFIG
   --------------------------------------------------------------------------
   The supplied artwork is a 4 x 2 sheet of 8 hammer angles (left to right,
   top to bottom). Each milestone rests on its own pose: milestone 1 uses the
   first image, milestone 2 the second, and so on. The sprite switches
   directly at each milestone — no in-between frames while scrolling.

   To swap in your own sheet:
   1. Drop your sprite in /public (keep the transparent PNG/WebP).
   2. Update `src`, `width`, `height`, `cols` and `rows` below.
   3. That is it — the CSS grid and frame math adapt automatically.
   ========================================================================== */

const HAMMER = {
  src: '/hammer-sprite.webp',
  width: 1376,
  height: 768,
  cols: 4,
  rows: 2,
} as const;

const FRAME_COUNT = HAMMER.cols * HAMMER.rows;
const CELL_W = HAMMER.width / HAMMER.cols;
const CELL_H = HAMMER.height / HAMMER.rows;

/** Sprite-sheet cell -> CSS background-position (percentage based). */
function framePosition(frame: number): string {
  const col = frame % HAMMER.cols;
  const row = Math.floor(frame / HAMMER.cols);
  const x = HAMMER.cols > 1 ? (col * 100) / (HAMMER.cols - 1) : 0;
  const y = HAMMER.rows > 1 ? (row * 100) / (HAMMER.rows - 1) : 0;
  return `${x}% ${y}%`;
}

/**
 * Milestone -> hammer pose, one-to-one: milestone 0 uses frame 0, milestone 1
 * uses frame 1, and so on. If you add more milestones than sheet cells the
 * sequence wraps. There is no interpolation between poses.
 */
function frameForMilestone(index: number): number {
  return index % FRAME_COUNT;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

type CSSVars = React.CSSProperties & { [key: `--${string}`]: string | number };
type SpriteLayer = HTMLSpanElement | null;

interface Point {
  x: number;
  y: number;
}

/** Fraction of the viewport where the hammer "reads" the active milestone. */
const FOCUS_LINE = 0.5;
/** Distance (px) around a dot where the hammer is magnetically pulled to it. */
const SNAP_DISTANCE = 96;

export default function JourneyTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hammerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const spriteLayersRef = useRef<SpriteLayer[]>([]);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const reduced = useReducedMotion();

  // Warm the browser cache before the timeline scrolls into view.
  useEffect(() => {
    const img = new window.Image();
    img.src = HAMMER.src;
  }, []);

  /* ------------------------------------------------------------------------
     Entrance reveal (cards + dots)
     ------------------------------------------------------------------------ */
  useGSAP(
    () => {
      if (reduced) return;

      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const card = row.querySelector<HTMLElement>(`.${s.card}`);
        const dot = row.querySelector<HTMLElement>(`.${s.dot}`);
        const connector = row.querySelector<HTMLElement>(`.${s.connector}`);
        const isLeft = i % 2 === 0;

        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 88%', once: true },
        });

        if (card) {
          tl.from(
            card,
            {
              opacity: 0,
              x: isLeft ? -38 : 38,
              y: 22,
              duration: 0.8,
              ease: 'power4.out',
            },
            0,
          );
        }
        if (dot) {
          tl.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(2.4)' }, 0.08);
        }
        if (connector) {
          tl.from(
            connector,
            { scaleX: 0, duration: 0.45, ease: 'power3.out' },
            0.12,
          );
        }
      });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  /* ------------------------------------------------------------------------
     Scroll mechanics
     ------------------------------------------------------------------------ */
  useGSAP(
    () => {
      const timeline = timelineRef.current;
      const rail = railRef.current;
      const progress = progressRef.current;
      const hammer = hammerRef.current;
      const tilt = tiltRef.current;
      const swing = swingRef.current;
      const sprite = spriteRef.current;

      if (!timeline || !rail || !progress || !hammer || !tilt || !swing || !sprite) {
        return;
      }

      const points: Point[] = [];
      let railStart = 0;
      let railSpan = 1;

      let frameCurrent = 0;
      let activeIndex = -1;
      let striking = false;
      let strikeToken = 0;
      let strikeTl: gsap.core.Timeline | null = null;
      const sparkTls = new Set<gsap.core.Timeline>();
      let idleTimer = 0;
      let resizeTimer = 0;
      let rafId = 0;
      let hasScrolled = false;
      let alive = true;
      let previousFocus: number | null = null;
      let previousHammerY: number | null = null;
      let lastStrike = { index: -1, at: 0 };

      /* ---------------- measurement ---------------- */

      const measure = () => {
        const tl = timelineRef.current;
        if (!tl) return;

        const next: Point[] = [];
        for (const dot of dotRefs.current) {
          if (!dot) continue;

          // Sum offsetLeft/offsetTop up the offsetParent chain. Unlike
          // getBoundingClientRect, this ignores the entrance transforms.
          let x = 0;
          let y = 0;
          let node: HTMLElement | null = dot;
          while (node && node !== tl) {
            x += node.offsetLeft;
            y += node.offsetTop;
            node = node.offsetParent as HTMLElement | null;
          }

          next.push({ x: x + dot.offsetWidth / 2, y: y + dot.offsetHeight / 2 });
        }

        if (!next.length) return;

        points.length = 0;
        points.push(...next);

        railStart = points[0].y;
        railSpan = Math.max(1, points[points.length - 1].y - railStart);

        rail.style.top = `${railStart}px`;
        rail.style.height = `${railSpan}px`;
        rail.style.bottom = 'auto';

        // Keep the rail glued to the real dot column at every breakpoint.
        tl.style.setProperty('--rail-x', `${points[0].x}px`);
      };

      /* ---------------- helpers ---------------- */

      const applyFrame = (value: number) => {
        const frame = ((Math.round(value) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
        if (frame === frameCurrent) return;
        frameCurrent = frame;

        spriteLayersRef.current.forEach((layer, i) => {
          if (layer) layer.style.opacity = i === frame ? '1' : '0';
        });
      };

      const setActive = (index: number) => {
        if (index === activeIndex) return;
        activeIndex = index;

        rowRefs.current.forEach((row, i) => {
          if (!row) return;
          const active = i === index;
          row.classList.toggle(s.isActive, active);
          row.setAttribute('aria-current', active ? 'step' : 'false');
        });
      };

      /* ---------------- strike animation ---------------- */

      const strike = (index: number, direction: 1 | -1) => {
        if (reduced || !hasScrolled) return;

        const now = performance.now();
        if (lastStrike.index === index && now - lastStrike.at < 240) return;
        lastStrike = { index, at: now };

        const dot = dotRefs.current[index];
        if (!dot) return;

        const rays = dot.querySelectorAll<HTMLElement>(`.${s.ray}`);
        const ring = dot.querySelector<HTMLElement>(`.${s.sparkRing}`);
        const flash = dot.querySelector<HTMLElement>(`.${s.sparkFlash}`);
        const baseFrame = frameForMilestone(index);

        strikeTl?.kill();
        const token = ++strikeToken;
        striking = true;
        applyFrame(baseFrame);

        const tl = gsap.timeline({
          onComplete: () => {
            if (token !== strikeToken) return;
            striking = false;
            update();
          },
        });
        strikeTl = tl;

        // Hammer motion only. A follow-up strike may interrupt this, which is
        // safe because the final tween always settles the swing back to 0.
        tl.to(swing, { rotation: -13 * direction, duration: 0.1, ease: 'power2.out' }, 0)
          .to(swing, { rotation: 8 * direction, duration: 0.14, ease: 'power4.in' }, 0.1)
          .to(swing, { rotation: 0, duration: 0.62, ease: 'elastic.out(1, 0.4)' }, 0.24);

        // Impact effects run on their own timeline so a fast follow-up strike
        // can never freeze a spark ring halfway through its fade.
        const fx = gsap.timeline();
        sparkTls.add(fx);
        fx.eventCallback('onComplete', () => {
          sparkTls.delete(fx);
        });

        fx.to(
          sprite,
          { scale: 1.07, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' },
          0.04,
        );

        // Spark burst + ring + impact flash.
        if (rays.length) {
          fx.fromTo(
            rays,
            { scaleY: 0.2, opacity: 0.95 },
            {
              scaleY: 1.08,
              opacity: 0,
              duration: 0.5,
              stagger: 0.012,
              ease: 'power2.out',
            },
            0.08,
          );
        }
        if (ring) {
          fx.fromTo(
            ring,
            { scale: 0.25, opacity: 0.9 },
            { scale: 2.15, opacity: 0, duration: 0.58, ease: 'power2.out' },
            0.08,
          );
        }
        if (flash) {
          fx.fromTo(
            flash,
            { scale: 0.35, opacity: 0.85 },
            { scale: 1.5, opacity: 0, duration: 0.32, ease: 'power2.out' },
            0.08,
          );
        }

        // Dot thump.
        fx.fromTo(
          dot,
          { scale: 1 },
          { scale: 1.3, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' },
          0.06,
        );
      };

      /* ---------------- per-frame scroll update ---------------- */

      let yTo: (value: number) => void = () => {};
      let xTo: (value: number) => void = () => {};
      let oTo: (value: number) => void = () => {};
      let tiltTo: (value: number) => void = () => {};

      if (!reduced) {
        yTo = gsap.quickTo(hammer, 'y', { duration: 0.42, ease: 'power3.out' });
        xTo = gsap.quickTo(hammer, 'x', { duration: 0.42, ease: 'power3.out' });
        oTo = gsap.quickTo(hammer, 'opacity', {
          duration: 0.45,
          ease: 'power2.out',
        });
        tiltTo = gsap.quickTo(tilt, 'rotation', {
          duration: 0.55,
          ease: 'power3.out',
        });
      }

      function update() {
        const tl = timelineRef.current;
        if (!tl || !points.length) return;

        const rect = tl.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const firstY = points[0].y;
        const lastY = points[points.length - 1].y;

        // Viewport focus line expressed in timeline coordinates.
        const focusY = vh * FOCUS_LINE - rect.top;

        // Trigger crossings against the raw focus line for exact timing.
        if (previousFocus !== null && previousFocus !== focusY) {
          let crossed = -1;
          let direction: 1 | -1 = 1;

          points.forEach((point, i) => {
            if (previousFocus! < point.y && focusY >= point.y) {
              crossed = i;
              direction = 1;
            } else if (previousFocus! > point.y && focusY <= point.y) {
              crossed = i;
              direction = -1;
            }
          });

          if (crossed >= 0) strike(crossed, direction);
        }
        previousFocus = focusY;

        const clampedY = gsap.utils.clamp(firstY, lastY, focusY);

        // Magnetic snap: ease towards the nearest dot inside the snap radius.
        let nearestIndex = 0;
        let nearestDist = Infinity;
        points.forEach((point, i) => {
          const d = Math.abs(clampedY - point.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIndex = i;
          }
        });

        const nearest = points[nearestIndex];
        let targetY = clampedY;
        if (nearestDist < SNAP_DISTANCE) {
          const pull = 1 - nearestDist / SNAP_DISTANCE;
          targetY = clampedY + (nearest.y - clampedY) * pull * 0.9;
        }

        // Nudge the sprite right on small screens so the art clears the edge.
        const xShift = window.innerWidth < 768 ? Math.min(14, nearest.x * 0.6) : 0;
        const targetX = nearest.x + xShift;
        const visible = rect.top < vh * 0.8 && rect.bottom > vh * 0.22;

        if (reduced) {
          gsap.set(hammer, { x: targetX, y: targetY, opacity: visible ? 1 : 0 });
          gsap.set(tilt, { rotation: 0 });
        } else {
          xTo(targetX);
          yTo(targetY);
          oTo(visible ? 1 : 0);

          // Scroll velocity -> travel tilt. Eases back upright when idle.
          if (previousHammerY !== null) {
            const velocity = targetY - previousHammerY;
            const targetTilt = gsap.utils.clamp(-9, 9, -velocity * 0.45);
            tiltTo(targetTilt);

            if (Math.abs(targetTilt) > 0.35) {
              window.clearTimeout(idleTimer);
              idleTimer = window.setTimeout(() => tiltTo(0), 140);
            }
          }
        }
        previousHammerY = targetY;

        // Active card/dot = nearest milestone to the (snapped) hammer.
        let active = 0;
        let activeDistance = Infinity;
        points.forEach((point, i) => {
          const d = Math.abs(targetY - point.y);
          if (d < activeDistance) {
            activeDistance = d;
            active = i;
          }
        });
        setActive(active);

        // Gold progress fill.
        const progressValue = gsap.utils.clamp(0, 1, (targetY - firstY) / (lastY - firstY || 1));
        gsap.set(progress, { scaleY: progressValue });

        // One pose per milestone: the sprite switches directly to the pose of
        // the nearest milestone. No interpolation, no intermediate frames.
        if (!striking) applyFrame(frameForMilestone(active));
      }

      /* ---------------- listeners ---------------- */

      const requestUpdate = () => {
        hasScrolled = true;
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          update();
        });
      };

      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          measure();
          update();
        }, 120);
      };

      const onRefresh = () => {
        measure();
        update();
      };

      measure();
      update();

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      ScrollTrigger.addEventListener('refresh', onRefresh);

      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(timeline);

      document.fonts?.ready.then(() => {
        if (!alive) return;
        measure();
        update();
      });

      return () => {
        alive = false;
        window.removeEventListener('scroll', requestUpdate);
        window.removeEventListener('resize', onResize);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        resizeObserver.disconnect();
        window.clearTimeout(idleTimer);
        window.clearTimeout(resizeTimer);
        if (rafId) window.cancelAnimationFrame(rafId);
        strikeTl?.kill();
        sparkTls.forEach((tl) => tl.kill());
        sparkTls.clear();
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="relative border-t border-white/10 pt-16 pb-20 md:pt-24 md:pb-28"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16">
        <header className="mb-14 md:mb-24">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-warm md:text-sm">
                (Milestones)
              </span>
              <AnimatedHeading
                words={[{ t: 'The' }, { t: 'path', serif: true }, { t: 'so far.' }]}
                containerClassName="mt-5"
                showLine={false}
                className="text-[clamp(2.5rem,7vw,6.5rem)] tracking-tight"
              />
            </div>

            <div className="max-w-sm md:pb-2">
              <p className="font-sans text-sm leading-relaxed text-gray-soft md:text-base">
                Six stops, one hammer. Scroll to swing through the roles, awards
                and certifications that built the path.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
                <span className="h-px w-8 bg-gold/60" />
                Follow the strike
              </span>
            </div>
          </div>
        </header>

        <div ref={timelineRef} className={s.timeline}>
          {/* Vertical rail + gold progress fill */}
          <div ref={railRef} aria-hidden="true" className={s.rail}>
            <span ref={progressRef} className={s.railProgress} />
          </div>

          {/* The hammer. All positioning is driven by measured dot anchors. */}
          <div ref={hammerRef} aria-hidden="true" className={s.hammer}>
            <div
              className={s.hammerPlacement}
              style={{ aspectRatio: `${CELL_W} / ${CELL_H}` }}
            >
              <div ref={tiltRef} className={s.hammerTilt}>
                <div ref={swingRef} className={s.hammerSwing}>
                  <div ref={spriteRef} className={s.sprite}>
                    {Array.from({ length: FRAME_COUNT }, (_, frame) => (
                      <span
                        key={frame}
                        ref={(el) => {
                          spriteLayersRef.current[frame] = el;
                        }}
                        className={s.spriteLayer}
                        style={{
                          backgroundImage: `url(${HAMMER.src})`,
                          backgroundSize: `${HAMMER.cols * 100}% ${HAMMER.rows * 100}%`,
                          backgroundPosition: framePosition(frame),
                          opacity: frame === 0 ? 1 : 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ol className={s.list}>
            {MILESTONES.map((milestone, index) => {
              const isLeft = index % 2 === 0;

              return (
                <li
                  key={`${milestone.year}-${milestone.title}`}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  data-side={isLeft ? 'left' : 'right'}
                  data-current={milestone.current ? 'true' : undefined}
                  className={`${s.row} relative grid grid-cols-[44px_minmax(0,1fr)] gap-x-5 md:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] md:gap-x-0`}
                >
                  {/* Target node on the rail */}
                  <div className={`${s.node} col-start-1 row-start-1 md:col-start-2`}>
                    <span
                      aria-hidden="true"
                      className={`${s.connector} ${
                        isLeft ? s.connectorLeft : s.connectorRight
                      }`}
                    />

                    <span
                      ref={(el) => {
                        dotRefs.current[index] = el;
                      }}
                      className={s.dot}
                    >
                      <span className={s.dotCore} />
                      <span className={s.dotHalo} />

                      {/* Impact effects */}
                      <span aria-hidden="true" className={s.spark}>
                        <span className={s.sparkFlash} />
                        <span className={s.sparkRing} />
                        {Array.from({ length: 8 }, (_, ray) => (
                          <span
                            key={ray}
                            className={s.rayWrap}
                            style={
                              {
                                '--angle': `${ray * 45}deg`,
                              } as CSSVars
                            }
                          >
                            <span className={s.ray} />
                          </span>
                        ))}
                      </span>
                    </span>
                  </div>

                  {/* Milestone card */}
                  <article
                    className={`${s.card} col-start-2 row-start-1 ${
                      isLeft
                        ? 'md:col-start-1 md:col-end-2 md:pr-10'
                        : 'md:col-start-3 md:col-end-4 md:pl-10'
                    }`}
                  >
                    <span aria-hidden="true" className={s.cardIndex}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className={s.cardTop}>
                      <span className={s.type}>{milestone.type}</span>
                      <span className={s.year}>{milestone.year}</span>
                    </div>

                    <h4 className={s.title}>{milestone.title}</h4>
                    <p className={s.org}>{milestone.organization}</p>
                    <p className={s.detail}>{milestone.description}</p>

                    <ul className={s.tags}>
                      {milestone.tags.map((tag) => (
                        <li key={tag} className={s.tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
