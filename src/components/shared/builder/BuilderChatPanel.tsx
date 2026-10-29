'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Send, X } from 'lucide-react';
import Builder from '@/components/shared/Builder';
import BuilderMessage, { type ChatMessage } from '@/components/shared/builder/BuilderMessage';
import {
  getBotReply,
  getReplyForAction,
  menuReply,
  welcomeReply,
  RESUME_URL,
  type BotReply,
  type BotResult,
  type ProjectSummary,
  type QuickActionId,
  type ReplyAction,
} from '@/lib/chatbot';
import { useHandleLinkClick } from '@/lib/navigation';
import { useReducedMotion } from '@/lib/useReducedMotion';

export type PanelPhase = 'closed' | 'open' | 'closing';
export type PanelActivity = 'thinking' | 'responding' | 'celebrating' | 'ready';

interface BuilderChatPanelProps {
  phase: PanelPhase;
  onClose: () => void;
  onActivity: (activity: PanelActivity) => void;
}

// The replies are computed locally; this short pause only lets the "working" state read clearly.
const THINK_MS = 520;
const RESUME_TIMEOUT_MS = 8000;
const CLAIM_MS = 260;

const createWelcome = (): ChatMessage[] => [{ id: 0, from: 'bot', text: welcomeReply().text, reply: welcomeReply() }];

const isNarrowViewport = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

const isModifiedClick = (event: React.MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const BuilderChatPanel = ({ phase, onClose, onActivity }: BuilderChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(createWelcome);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [claimedProject, setClaimedProject] = useState<string | null>(null);

  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const busyRef = useRef(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeRequest = useRef<AbortController | null>(null);
  const reduced = useReducedMotion();
  const router = useRouter();
  const navigate = useHandleLinkClick();

  const cancelPending = useCallback(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = null;
    resumeRequest.current?.abort();
    resumeRequest.current = null;
    busyRef.current = false;
    setBusy(false);
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const pushBot = useCallback(
    (reply: BotReply, error = false) => {
      const safeReply: BotReply = reply.text.trim()
        ? reply
        : { ...menuReply(), text: "Hmm, my blueprint came back blank, Chief. Pick something from the menu?" };
      setMessages((prev) => [...prev, { id: nextId.current++, from: 'bot', text: safeReply.text, reply: safeReply, error }]);
      busyRef.current = false;
      setBusy(false);
      onActivity(error ? 'ready' : (safeReply.mood ?? 'responding'));
    },
    [onActivity],
  );

  const fetchResume = useCallback(async () => {
    const controller = new AbortController();
    resumeRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), RESUME_TIMEOUT_MS);
    const minimumWait = new Promise((resolve) => setTimeout(resolve, reduced ? 0 : THINK_MS));

    try {
      const response = await fetch(RESUME_URL, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      await minimumWait;
      // Cancelled by a restart while waiting.
      if (resumeRequest.current !== controller) return;

      if (response.ok) {
        const link = document.createElement('a');
        link.href = RESUME_URL;
        link.download = '';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        pushBot({
          text: "Here's the resume scroll, Chief! The download should have started — if not, use the button below.",
          actions: [
            { kind: 'link', label: 'Download Resume', href: RESUME_URL, download: true },
            { kind: 'menu', label: 'Main menu' },
          ],
          mood: 'celebrating',
        });
      } else if (response.status === 404) {
        pushBot({
          text: "The resume hasn't been added to this village yet, so there's nothing to download right now. You can still reach out directly.",
          actions: [
            { kind: 'quick', label: 'Contact options', id: 'contact' },
            { kind: 'menu', label: 'Main menu' },
          ],
        });
      } else {
        throw new Error(`Unexpected status ${response.status}`);
      }
    } catch {
      // Aborted because the panel was restarted or unmounted: stay silent.
      if (resumeRequest.current !== controller) return;
      pushBot(
        {
          text: "I couldn't reach the resume vault just now. Check your connection and try again.",
          actions: [
            { kind: 'retry', label: 'Try again', id: 'resume' },
            { kind: 'menu', label: 'Main menu' },
          ],
        },
        true,
      );
    } finally {
      clearTimeout(timeout);
      if (resumeRequest.current === controller) resumeRequest.current = null;
    }
  }, [pushBot, reduced]);

  const process = useCallback(
    (userText: string, resolve: () => BotResult) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setMessages((prev) => [...prev, { id: nextId.current++, from: 'user', text: userText }]);
      onActivity('thinking');

      const result = resolve();
      if (result.type === 'resume') {
        void fetchResume();
        return;
      }
      replyTimer.current = setTimeout(
        () => {
          replyTimer.current = null;
          pushBot(result.reply);
        },
        reduced ? 0 : THINK_MS,
      );
    },
    [fetchResume, onActivity, pushBot, reduced],
  );

  const handleQuick = useCallback(
    (id: QuickActionId, label: string) => process(label, () => getReplyForAction(id)),
    [process],
  );

  const goTo = useCallback(
    (href: string) => {
      navigate(href);
      if (isNarrowViewport()) onClose();
    },
    [navigate, onClose],
  );

  const handleAction = useCallback(
    (action: ReplyAction, event: React.MouseEvent<HTMLElement>) => {
      switch (action.kind) {
        case 'section':
          if (isModifiedClick(event)) return;
          event.preventDefault();
          goTo(action.href);
          return;
        case 'menu':
          process('Main menu', () => ({ type: 'reply', reply: menuReply() }));
          return;
        case 'quick':
        case 'retry':
          handleQuick(action.id, action.label);
          return;
        default:
          return;
      }
    },
    [goTo, handleQuick, process],
  );

  const handleOpenProject = useCallback(
    (project: ProjectSummary, event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(event)) return;
      event.preventDefault();
      if (claimedProject) return;
      setClaimedProject(project.slug);
      onActivity('celebrating');
      router.prefetch(project.caseStudyHref);
      setTimeout(
        () => {
          setClaimedProject(null);
          router.push(project.caseStudyHref);
          if (isNarrowViewport()) onClose();
        },
        reduced ? 0 : CLAIM_MS,
      );
    },
    [claimedProject, onActivity, onClose, reduced, router],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busyRef.current) return;
    setInput('');
    process(text, () => getBotReply(text));
  };

  const restart = () => {
    cancelPending();
    nextId.current = 1;
    setMessages(createWelcome());
    setInput('');
    onActivity('ready');
    inputRef.current?.focus({ preventScroll: true });
  };

  // Focus management: keyboard/mouse users land in the input; touch users get the panel itself
  // so the on-screen keyboard does not cover the welcome message.
  useEffect(() => {
    if (phase !== 'open') return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const target = fine ? inputRef.current : panelRef.current;
    const frame = requestAnimationFrame(() => target?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onClose]);

  // New user messages scroll to the bottom; new bot replies scroll to their first line so
  // long cards are read from the top.
  useEffect(() => {
    const list = listRef.current;
    if (!list || phase === 'closed') return;
    const last = messages[messages.length - 1];
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
    if (last?.from === 'bot' && messages.length > 1) {
      const node = list.querySelector<HTMLElement>(`[data-message-id="${last.id}"]`);
      if (node) {
        list.scrollTo({ top: node.offsetTop - 12, behavior });
        return;
      }
    }
    list.scrollTo({ top: list.scrollHeight, behavior });
  }, [messages, busy, phase, reduced]);

  return (
    <section
      ref={panelRef}
      id="builder-chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="builder-chat-title"
      aria-describedby="builder-chat-subtitle"
      tabIndex={-1}
      hidden={phase === 'closed'}
      className={`ba-panel ba-panel--${phase}`}
      data-lenis-prevent
    >
      <header className="ba-header">
        <span className="ba-portrait" aria-hidden="true">
          <Builder state={busy ? 'thinking' : 'ready'} portrait />
        </span>
        <div className="ba-header-text">
          <h2 id="builder-chat-title" className="ba-title">
            Builder&apos;s Workshop
          </h2>
          <p id="builder-chat-subtitle" className="ba-subtitle">
            Your guide to my developer village
          </p>
          <p className="ba-status">
            <span className={`ba-status-dot${busy ? ' is-busy' : ''}`} aria-hidden="true" />
            {busy ? 'Working on it…' : 'Ready to help'}
          </p>
        </div>
        <div className="ba-header-actions">
          <button type="button" className="ba-icon-btn" onClick={restart} aria-label="Restart conversation" title="Restart">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <button type="button" className="ba-icon-btn" onClick={onClose} aria-label="Close the Builder chat" title="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div ref={listRef} className="ba-messages" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => (
          <BuilderMessage
            key={message.id}
            message={message}
            busy={busy}
            claimedProject={claimedProject}
            onQuick={handleQuick}
            onAction={handleAction}
            onOpenProject={handleOpenProject}
          />
        ))}

        {busy && (
          <div className="ba-row ba-row--bot">
            <div className="ba-bubble ba-bubble--bot ba-thinking">
              <svg width="26" height="32" viewBox="0 0 26 32" aria-hidden="true" className="ba-blueprint">
                <rect x="1" y="1" width="24" height="30" rx="2" />
                <path d="M5 8h16M5 13h16M5 18h9M5 23h13" />
              </svg>
              <div>
                <p className="ba-thinking-text">The Builder is working on it…</p>
                <span className="ba-progress" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="ba-input-row">
        <label htmlFor="builder-chat-input" className="sr-only">
          Ask the Builder a question
        </label>
        <input
          id="builder-chat-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about skills, projects…"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={300}
          className="ba-input"
        />
        <button type="submit" className="ba-send" disabled={!input.trim() || busy} aria-label="Send message">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};

export default BuilderChatPanel;
