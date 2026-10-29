'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getBotReply, QUICK_QUESTIONS } from '@/lib/chatbot';
import { site } from '@/lib/site';
import { useReducedMotion } from '@/lib/useReducedMotion';
import Builder, { type BuilderMood } from '@/components/shared/Builder';

interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

const WELCOME =
  "Hey Chief! Need a tour of my village? I can show you my skills, projects, and developer journey — or ask me anything about working together.";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const MiniCloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
  </svg>
);

const TypingDots = () => (
  <span className="flex items-center gap-1" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-warm-light animate-bounce"
        style={{ animationDelay: `${i * 120}ms`, animationDuration: '900ms' }}
      />
    ))}
  </span>
);

const BlueprintSketch = () => (
  <svg width="26" height="34" viewBox="0 0 26 34" fill="none" aria-hidden="true" className="shrink-0">
    <rect x="1" y="1" width="24" height="32" rx="2" fill="#F7FAF8" stroke="#131B17" strokeWidth="1.6" />
    <path
      d="M5 8h16M5 13h16M5 18h9M5 23h13M5 28h7"
      stroke="#34D399"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="builder-sketch-line"
    />
  </svg>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, from: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState<BuilderMood>('idle');

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const flashMood = useCallback((next: BuilderMood, duration: number) => {
    setMood(next);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood('idle'), duration);
  }, []);

  const sendMessage = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isTyping) return;

      setMessages((prev) => [...prev, { id: nextId.current++, from: 'user', text }]);
      setInput('');
      setIsTyping(true);
      setMood('thinking');
      if (moodTimer.current) clearTimeout(moodTimer.current);

      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        setMessages((prev) => [...prev, { id: nextId.current++, from: 'bot', text: getBotReply(text) }]);
        setIsTyping(false);
        flashMood('success', 1600);
      }, 650);
    },
    [isTyping, flashMood],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const toggleOpen = () => {
    if (isOpen) {
      close();
      return;
    }
    setIsOpen(true);
    flashMood('success', 900);
  };

  const handleTilt = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const element = tiltRef.current;
    if (!element) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(320px) rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 22).toFixed(2)}deg)`;
  };

  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = '';
  };

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
      if (moodTimer.current) clearTimeout(moodTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, isTyping, reduced]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const assistantLabel = /your name/i.test(site.name) ? 'The Builder' : `${site.firstName}'s Builder`;
  const statusLabel =
    mood === 'thinking' ? 'Examining the blueprint' : mood === 'success' ? 'Build complete' : 'Online · Instant replies';

  return (
    <>
      {isOpen && (
        <div
          id="portfolio-chat-panel"
          role="dialog"
          aria-label={assistantLabel}
          className="chat-panel blueprint-grid fixed left-3 right-3 bottom-[5.5rem] z-[80] flex max-h-[min(540px,calc(100dvh-7.5rem))] flex-col overflow-hidden rounded-2xl border border-border-dark bg-cream shadow-2xl shadow-charcoal/20 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[370px]"
        >
          <div className="flex items-center gap-3 bg-charcoal px-4 py-3 text-cream">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-cream/25 bg-cream p-0.5">
              <Builder mood={mood} className="h-full w-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold tracking-wide">{assistantLabel}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-light">{statusLabel}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <CloseIcon />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 min-h-0 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.from === 'user'
                      ? 'rounded-br-sm bg-charcoal text-cream'
                      : 'rounded-bl-sm border border-border bg-white/80 text-charcoal'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm border border-border bg-white/80 px-3.5 py-2.5">
                  <BlueprintSketch />
                  <div>
                    <p className="text-[11px] font-medium text-warm">Sketching an answer…</p>
                    <TypingDots />
                  </div>
                  <span className="sr-only">The Builder is thinking</span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border-dark/60 bg-cream/70 px-4 pt-3 pb-3">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-border-dark bg-white/70 px-2.5 py-1 text-[11px] font-medium text-warm transition-colors hover:border-accent hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border-dark bg-white/70 p-2.5">
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the Builder a question..."
              autoComplete="off"
              maxLength={300}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-charcoal placeholder:text-warm-light focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <div className="group fixed right-4 bottom-5 z-[80] flex flex-col items-end sm:right-6 sm:bottom-6">
        {!isOpen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full right-0 mb-3 w-60 origin-bottom-right scale-95 rounded-2xl rounded-br-md border border-border-dark bg-cream px-3.5 py-2.5 text-left text-xs leading-relaxed text-charcoal opacity-0 shadow-xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
          >
            <span className="font-bold text-charcoal">Hey Chief!</span> Need a tour of my village? I can show you my
            skills, projects, and developer journey!
            <span className="absolute -bottom-[7px] right-6 h-3 w-3 rotate-45 border-r border-b border-border-dark bg-cream" />
          </div>
        )}

        <button
          ref={triggerRef}
          type="button"
          onClick={toggleOpen}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
          onBlur={resetTilt}
          aria-expanded={isOpen}
          aria-controls="portfolio-chat-panel"
          aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
          className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-charcoal bg-cream p-1.5 text-charcoal shadow-lg shadow-charcoal/20 transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal lg:h-[72px] lg:w-[72px]"
        >
          <div
            ref={tiltRef}
            className="h-full w-full transition-transform duration-150 ease-out will-change-transform"
          >
            <Builder mood={mood} className="h-full w-full" />
          </div>

          {isOpen ? (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-cream bg-charcoal text-cream">
              <MiniCloseIcon />
            </span>
          ) : (
            <span
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-cream bg-accent"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </>
  );
};

export default ChatBot;
