'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import Builder, { type BuilderState } from '@/components/shared/Builder';
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

const ACTIVITY_DURATION: Partial<Record<BuilderState, number>> = {
  responding: 900,
  celebrating: 1300,
};

/**
 * Builder assistant orchestrator: owns the character state machine, the greeting bubble,
 * the hammer-impact effect and the panel's open/close lifecycle.
 */
const ChatBot = () => {
  const [phase, setPhase] = useState<PanelPhase>('closed');
  const [panelMounted, setPanelMounted] = useState(false);
  const [character, setCharacter] = useState<BuilderState>('idle');
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [impactKey, setImpactKey] = useState(0);

  const reduced = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef<PanelPhase>('closed');
  const openingRef = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const characterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const dismissGreeting = useCallback(() => setGreetingVisible(false), []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      if (characterTimer.current) clearTimeout(characterTimer.current);
    };
  }, []);

  // Mount the (hidden) panel once the browser is idle so the first open never waits on the chunk.
  useEffect(() => {
    const mount = () => setPanelMounted(true);
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
        schedule(() => {
          if (phaseRef.current !== 'closed') return;
          setGreetingVisible(true);
          setCharacterFor('greeting', 1500, 'idle');
          schedule(() => setGreetingVisible(false), GREETING_AUTO_HIDE);
        }, 650);
      }, GREETING_DELAY);
    };

    if (window.__preloaderDone) {
      start();
      return;
    }
    window.addEventListener('preloaderComplete', start, { once: true });
    return () => window.removeEventListener('preloaderComplete', start);
  }, [schedule, setCharacterFor]);

  const open = useCallback(() => {
    if (phaseRef.current === 'open' || openingRef.current) return;
    setGreetingVisible(false);
    safeSessionStorage.setItem(GREETED_KEY, '1');
    setPanelMounted(true);

    if (reduced || phaseRef.current === 'closing') {
      updatePhase('open');
      setCharacterFor('ready');
      return;
    }

    openingRef.current = true;
    setCharacterFor('opening', SETTLE_AT);
    schedule(() => setImpactKey((key) => key + 1), IMPACT_AT);
    schedule(() => {
      openingRef.current = false;
      updatePhase('open');
    }, PANEL_AT);
  }, [reduced, schedule, setCharacterFor, updatePhase]);

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
      if (event.key === 'Escape') setGreetingVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [greetingVisible]);

  const isOpen = phase !== 'closed';

  return (
    <div className={`builder-assistant${reduced ? ' ba-reduced' : ''}`}>
      {panelMounted && <BuilderChatPanel phase={phase} onClose={close} onActivity={handleActivity} />}

      <div className="ba-dock">
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
          onPointerEnter={prefetchPanel}
          onFocus={prefetchPanel}
          aria-expanded={phase === 'open'}
          aria-controls="builder-chat-panel"
          aria-label={phase === 'open' ? 'Close the Builder chat' : 'Talk to the Builder — open chat assistant'}
        >
          <Builder state={character} className="ba-character" />
          {impactKey > 0 && !reduced && (
            <span key={impactKey} className="ba-impact" aria-hidden="true">
              <span className="ba-impact-ring" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="ba-impact-spark" style={{ '--i': i } as React.CSSProperties} />
              ))}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
