'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { BuilderState } from '@/components/shared/Builder';

/*
 * Pose sprites cut from the two Builder pose sheets (public/builder/*.webp).
 * The sheets are separate poses, not animation frames, so a state change swaps to a
 * different pose with a short "pop" transition instead of tweening between them.
 */

export type PortraitPose = 'idle' | 'blink' | 'wave' | 'surprised' | 'thinking' | 'hammer' | 'happy' | 'thumbs-up';
export type BodyPose =
  | 'idle'
  | 'happy'
  | 'surprised'
  | 'wave'
  | 'hammer-raise'
  | 'hammer-strike'
  | 'blueprint'
  | 'thumbs-up';

// Every pose of a sheet shares one canvas, so swapping never shifts the character.
const PORTRAIT_SIZE = { width: 242, height: 256 };
const BODY_SIZE = { width: 256, height: 400 };

const portraitSrc = (pose: PortraitPose) => `/builder/portrait-${pose}.webp`;
const bodySrc = (pose: BodyPose) => `/builder/body-${pose}.webp`;

const PORTRAIT_FOR_STATE: Record<BuilderState, PortraitPose> = {
  idle: 'idle',
  noticed: 'surprised',
  greeting: 'wave',
  opening: 'hammer',
  ready: 'idle',
  thinking: 'thinking',
  responding: 'happy',
  celebrating: 'thumbs-up',
  closing: 'blink',
};

const ALL_PORTRAITS: PortraitPose[] = ['idle', 'blink', 'wave', 'surprised', 'thinking', 'hammer', 'happy', 'thumbs-up'];
const ALL_BODIES: BodyPose[] = ['idle', 'happy', 'surprised', 'wave', 'hammer-raise', 'hammer-strike', 'blueprint', 'thumbs-up'];

let preloaded = false;

/** Warm the browser cache so pose swaps never show an empty frame. */
export function preloadBuilderSprites(includeBodies: boolean) {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;
  const urls = [...ALL_PORTRAITS.map(portraitSrc), ...(includeBodies ? ALL_BODIES.map(bodySrc) : [])];
  urls.forEach((url) => {
    const img = new window.Image();
    img.decoding = 'async';
    img.src = url;
  });
}

const BLINK_STATES = new Set<BuilderState>(['idle', 'ready']);

interface BuilderPortraitProps {
  state: BuilderState;
  hovered: boolean;
  animate: boolean;
}

/** The floating chat icon: one portrait pose at a time, chosen from the character state. */
export const BuilderPortrait = ({ state, hovered, animate }: BuilderPortraitProps) => {
  const [blinking, setBlinking] = useState(false);
  const canBlink = animate && !hovered && BLINK_STATES.has(state);

  useEffect(() => {
    if (!canBlink) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setBlinking(true);
          timer = setTimeout(() => {
            setBlinking(false);
            schedule();
          }, 160);
        },
        3200 + Math.random() * 3000,
      );
    };
    schedule();
    return () => {
      clearTimeout(timer);
      setBlinking(false);
    };
  }, [canBlink]);

  let pose = PORTRAIT_FOR_STATE[state];
  if (hovered && BLINK_STATES.has(state)) pose = 'happy';
  else if (blinking && canBlink) pose = 'blink';

  return (
    <span className="ba-sprite ba-sprite--portrait" data-state={state}>
      <Image
        key={pose}
        src={portraitSrc(pose)}
        alt=""
        width={PORTRAIT_SIZE.width}
        height={PORTRAIT_SIZE.height}
        className={`ba-sprite-img${pose === 'blink' ? '' : ' ba-pose-pop'}`}
        priority={pose === 'idle'}
        unoptimized
        draggable={false}
      />
    </span>
  );
};

interface BuilderFigureProps {
  pose: BodyPose;
}

/** Full-body Builder used for the larger moments (greeting, hammer strike). */
export const BuilderFigure = ({ pose }: BuilderFigureProps) => (
  <Image
    key={pose}
    src={bodySrc(pose)}
    alt=""
    width={BODY_SIZE.width}
    height={BODY_SIZE.height}
    className="ba-sprite-img ba-pose-pop"
    unoptimized
    draggable={false}
  />
);
