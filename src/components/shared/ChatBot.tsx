'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import type { BuilderState } from '@/components/shared/Builder';
import {
  BuilderFigure,
  BuilderPortrait,
  preloadBuilderSprites,
  type BodyPose,
} from '@/components/shared/builder/BuilderSprite';
import { WELCOME_TEXT } from '@/lib/chatbot';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { safeSessionStorage } from '@/utils/storage';
import type { PanelPhase, PanelActivity } from '@/components/shared/builder/BuilderChatPanel';
import '@/components/shared/builder/builder-assistant.css';

// The panel (and the portfolio data it renders) is only downloaded once the visitor shows intent.
const loadPanel = () => import('@/components/shared/builder/BuilderChatPanel');
const BuilderChatPanel = dynamic(loadPanel, { ssr: false });

const GREETED_KEY = 'builder-greeted';
const GREETING_DELAY = 1400;
const GREETING_AUTO_HIDE = 12000;

// Click sequence timings (ms). The panel opens while the hammer lands so it never feels delayed.
const IMPACT_AT = 140;
const PANEL_AT = 170;
const SETTLE_AT = 620;
const CLOSE_DURATION = 220;

// Full-body hammer strike (wide screens): raise pose, then strike pose, then the panel opens.
const STRIKE_AT = 160;
const STAGE_PANEL_AT = 340;
const STAGE_HIDE_AT = 340;
const STAGE_FADE_MS = 320;
const IMPACT_DURATION = 600;

// The full-body figure only has room beside the icon on wider screens.
const hasStageRoom = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches;

const ACTIVITY_DURATION: Partial<Record<BuilderState, number>> = {
  responding: 900,
  celebrating: 1300,
};

const Impact = () => (
  <span className="ba-impact" aria-hidden="true">
    <span className="ba-impact-ring" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <span key={i} className="ba-impact-spark" style={{ '--i': i } as React.CSSProperties} />
    ))}
  </span>
);

/**
 * Builder assistant orchestrator: owns the character state machine, the greeting bubble,
 * the hammer-impact effect and the panel's open/close lifecycle.
 */
const ChatBot = () => {
  const [phase, setPhase] = useState<PanelPhase>('closed');
  const [panelMounted, setPanelMounted] = useState(false);
  const [character, setCharacter] = useState<BuilderState>('idle');
  const [greetingVisible, setGreetingVisible] = useState(false);
  // One spark burst at a time, rendered where the hammer lands (full-body figure or icon).
  const [impact, setImpact] = useState<{ key: number; target: 'stage' | 'trigger' } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [stagePose, setStagePose] = useState<BodyPose | null>(null);
  const [stageVisible, setStageVisible] = useState(false);
  const [stageMode, setStageMode] = useState<'greeting' | 'strike' | null>(null);

  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef<PanelPhase>('closed');
  const openingRef = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const characterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageModeRef = useRef<'greeting' | 'strike' | null>(null);

  const updatePhase = useCallback((next: PanelPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  /** Sets a character state, optionally returning to `then` after `duration` ms. */
  const setCharacterFor = useCallback((next: BuilderState, duration?: number, then: BuilderState = 'ready') => {
    if (characterTimer.current) clearTimeout(characterTimer.current);
    characterTimer.current = null;
    setCharacter(next);
    if (duration) {
      characterTimer.current = setTimeout(() => {
        characterTimer.current = null;
        setCharacter(then);
      }, duration);
    }
  }, []);

  const fireImpact = useCallback(
    (target: 'stage' | 'trigger') => {
      const key = Date.now();
      setImpact({ key, target });
      schedule(() => setImpact((current) => (current?.key === key ? null : current)), IMPACT_DURATION);
    },
    [schedule],
  );

  const showStage = useCallback((mode: 'greeting' | 'strike', pose: BodyPose) => {
    stageModeRef.current = mode;
    setStageMode(mode);
    setStagePose(pose);
    setStageVisible(true);
  }, []);

  const hideStage = useCallback(() => {
    stageModeRef.current = null;
    setStageVisible(false);
    // Keep the mode (and its impact sparks) until the fade-out has finished.
    schedule(() => {
      if (stageModeRef.current === null) setStageMode(null);
    }, STAGE_FADE_MS);
  }, [schedule]);

  const dismissGreeting = useCallback(() => {
    setGreetingVisible(false);
    if (stageModeRef.current === 'greeting') hideStage();
  }, [hideStage]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      if (characterTimer.current) clearTimeout(characterTimer.current);
    };
  }, []);

  // Mount the (hidden) panel and warm the pose sprites once the browser is idle, so the first
  // open and every pose swap are instant.
  useEffect(() => {
    const mount = () => {
      setPanelMounted(true);
      preloadBuilderSprites(hasStageRoom());
    };
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(mount, { timeout: 4000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(mount, 2500);
    return () => clearTimeout(timer);
  }, []);

  // One automatic greeting per browser session, after the preloader has finished.
  useEffect(() => {
    if (safeSessionStorage.getItem(GREETED_KEY) === '1') return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      schedule(() => {
        if (phaseRef.current !== 'closed') return;
        safeSessionStorage.setItem(GREETED_KEY, '1');
        setCharacterFor('noticed');
        const withStage = !reducedRef.current && hasStageRoom();
        if (withStage) showStage('greeting', 'surprised');
        schedule(() => {
          if (phaseRef.current !== 'closed') return;
          setGreetingVisible(true);
          setCharacterFor('greeting', 1500, 'idle');
          if (withStage) {
            setStagePose('wave');
            schedule(() => {
              if (stageModeRef.current === 'greeting') setStagePose('idle');
            }, 1500);
          }
          schedule(dismissGreeting, GREETING_AUTO_HIDE);
        }, 650);
      }, GREETING_DELAY);
    };

    if (window.__preloaderDone) {
      start();
      return;
    }
    window.addEventListener('preloaderComplete', start, { once: true });
    return () => window.removeEventListener('preloaderComplete', start);
  }, [schedule, setCharacterFor, showStage, dismissGreeting]);

  const open = useCallback(() => {
    if (phaseRef.current === 'open' || openingRef.current) return;
    setGreetingVisible(false);
    safeSessionStorage.setItem(GREETED_KEY, '1');
    setPanelMounted(true);

    if (reduced || phaseRef.current === 'closing') {
      hideStage();
      updatePhase('open');
      setCharacterFor('ready');
      return;
    }

    openingRef.current = true;
    setCharacterFor('opening', SETTLE_AT);

    if (hasStageRoom()) {
      showStage('strike', 'hammer-raise');
      schedule(() => {
        setStagePose('hammer-strike');
        fireImpact('stage');
      }, STRIKE_AT);
      schedule(() => {
        openingRef.current = false;
        updatePhase('open');
      }, STAGE_PANEL_AT);
      schedule(() => {
        if (stageModeRef.current === 'strike') hideStage();
      }, STAGE_HIDE_AT);
      return;
    }

    hideStage();
    schedule(() => fireImpact('trigger'), IMPACT_AT);
    schedule(() => {
      openingRef.current = false;
      updatePhase('open');
    }, PANEL_AT);
  }, [reduced, schedule, setCharacterFor, updatePhase, showStage, hideStage, fireImpact]);

  const close = useCallback(() => {
    if (phaseRef.current !== 'open') return;
    updatePhase('closing');
    setCharacterFor('closing');
    schedule(
      () => {
        if (phaseRef.current !== 'closing') return;
        updatePhase('closed');
        setCharacterFor('idle');
        triggerRef.current?.focus({ preventScroll: true });
      },
      reduced ? 0 : CLOSE_DURATION,
    );
  }, [reduced, schedule, setCharacterFor, updatePhase]);

  const handleActivity = useCallback(
    (activity: PanelActivity) => {
      if (phaseRef.current !== 'open') return;
      setCharacterFor(activity, ACTIVITY_DURATION[activity]);
    },
    [setCharacterFor],
  );

  const handleTriggerClick = () => {
    if (phaseRef.current === 'open') close();
    else open();
  };

  const prefetchPanel = () => {
    void loadPanel();
  };

  useEffect(() => {
    if (!greetingVisible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissGreeting();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [greetingVisible, dismissGreeting]);

  const isOpen = phase !== 'closed';

  return (
    <div className={`builder-assistant${reduced ? ' ba-reduced' : ''}`}>
      {panelMounted && <BuilderChatPanel phase={phase} onClose={close} onActivity={handleActivity} />}

      <div className={`ba-dock${stageVisible ? ' ba-dock--stage' : ''}`}>
        <div
          className={`ba-stage${stageVisible ? ' is-visible' : ''}`}
          data-pose={stagePose ?? undefined}
          data-mode={stageMode ?? undefined}
          aria-hidden="true"
          onClick={stageMode === 'greeting' ? open : undefined}
        >
          {stagePose && <BuilderFigure pose={stagePose} />}
          {impact?.target === 'stage' && <Impact key={impact.key} />}
        </div>

        {greetingVisible && !isOpen && (
          <div className="ba-greeting" role="status">
            <button type="button" className="ba-greeting-body" onClick={open} onPointerEnter={prefetchPanel}>
              <span className="ba-greeting-title">Hey Chief!</span>
              <span className="ba-greeting-text">{WELCOME_TEXT.replace(/^Hey Chief! /, '')}</span>
              <span className="ba-greeting-cta">Tap to explore →</span>
            </button>
            <button type="button" className="ba-greeting-close" onClick={dismissGreeting} aria-label="Dismiss greeting">
              <X size={14} strokeWidth={3} aria-hidden="true" />
            </button>
          </div>
        )}

        {!greetingVisible && !isOpen && (
          <span className="ba-tooltip" aria-hidden="true">
            Talk to the Builder
          </span>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="ba-trigger"
          onClick={handleTriggerClick}
          onPointerEnter={(event) => {
            prefetchPanel();
            if (event.pointerType === 'mouse') setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onFocus={prefetchPanel}
          aria-expanded={phase === 'open'}
          aria-controls="builder-chat-panel"
          aria-label={phase === 'open' ? 'Close the Builder chat' : 'Talk to the Builder — open chat assistant'}
        >
          <span className="ba-character">
            <BuilderPortrait state={character} hovered={hovered && !isOpen} animate={!reduced} />
          </span>
          {impact?.target === 'trigger' && <Impact key={impact.key} />}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
