'use client';

import React, { memo } from 'react';
import { Download, Home, Mail, MessageCircle, RotateCcw, ScrollText, Trophy, Wrench, ArrowRight } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  QUICK_ACTIONS,
  type BotReply,
  type ContactLink,
  type QuickActionId,
  type ReplyAction,
} from '@/lib/chatbot';

export interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
  reply?: BotReply;
  error?: boolean;
}

const QUICK_ICONS: Record<QuickActionId, React.ReactNode> = {
  skills: <Wrench size={16} aria-hidden="true" />,
  projects: <Trophy size={16} aria-hidden="true" />,
  experience: <ScrollText size={16} aria-hidden="true" />,
  resume: <Download size={16} aria-hidden="true" />,
  contact: <Mail size={16} aria-hidden="true" />,
  chat: <MessageCircle size={16} aria-hidden="true" />,
};

const CONTACT_ICONS: Record<ContactLink['kind'], React.ReactNode> = {
  email: <Mail size={15} aria-hidden="true" />,
  github: <FaGithub size={15} aria-hidden="true" />,
  linkedin: <FaLinkedin size={15} aria-hidden="true" />,
};

export interface MessageHandlers {
  busy: boolean;
  onQuick: (id: QuickActionId, label: string) => void;
  onAction: (action: ReplyAction, event: React.MouseEvent<HTMLElement>) => void;
}

const QuickActions = ({ busy, onQuick }: Pick<MessageHandlers, 'busy' | 'onQuick'>) => (
  <div className="ba-quick-grid" role="group" aria-label="Quick actions">
    {QUICK_ACTIONS.map((action, index) => (
      <button
        key={action.id}
        type="button"
        className={`ba-game-btn${action.id === 'resume' ? ' ba-game-btn--gold' : ''}`}
        style={{ '--stagger': index } as React.CSSProperties}
        disabled={busy}
        onClick={() => onQuick(action.id, action.label)}
      >
        <span className="ba-game-btn-icon">{QUICK_ICONS[action.id]}</span>
        <span>{action.label}</span>
      </button>
    ))}
  </div>
);

const ReplyBlockView = ({ reply, ...handlers }: { reply: BotReply } & MessageHandlers) => {
  const block = reply.block;
  if (!block) return null;

  switch (block.kind) {
    case 'quick-actions':
      return <QuickActions busy={handlers.busy} onQuick={handlers.onQuick} />;

    case 'contact':
      return (
        <ul className="ba-contact-list">
          {block.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="ba-contact-link"
                {...(link.kind === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {CONTACT_ICONS[link.kind]}
                <span>{link.label}</span>
                {link.kind !== 'email' && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      );
  }
};

const ActionChip = ({
  action,
  busy,
  onAction,
}: {
  action: ReplyAction;
  busy: boolean;
  onAction: MessageHandlers['onAction'];
}) => {
  if (action.kind === 'link') {
    return (
      <a
        href={action.href}
        className="ba-chip ba-chip--primary"
        {...(action.download ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {action.download && <Download size={13} aria-hidden="true" />}
        {action.label}
      </a>
    );
  }
  if (action.kind === 'section') {
    return (
      <a href={action.href} className="ba-chip ba-chip--primary" onClick={(event) => onAction(action, event)}>
        {action.label} <ArrowRight size={13} aria-hidden="true" />
      </a>
    );
  }
  return (
    <button
      type="button"
      className={`ba-chip${action.kind === 'retry' ? ' ba-chip--primary' : ''}`}
      disabled={busy}
      onClick={(event) => onAction(action, event)}
    >
      {action.kind === 'menu' && <Home size={13} aria-hidden="true" />}
      {action.kind === 'retry' && <RotateCcw size={13} aria-hidden="true" />}
      {action.label}
    </button>
  );
};

const BuilderMessage = ({ message, ...handlers }: { message: ChatMessage } & MessageHandlers) => {
  if (message.from === 'user') {
    return (
      <div className="ba-row ba-row--user">
        <p className="ba-bubble ba-bubble--user">
          <span className="sr-only">You said: </span>
          {message.text}
        </p>
      </div>
    );
  }

  const reply = message.reply;
  return (
    <div className="ba-row ba-row--bot" data-message-id={message.id}>
      <div className={`ba-bubble ba-bubble--bot${message.error ? ' ba-bubble--error' : ''}`}>
        <span className="sr-only">Builder: </span>
        <p>{message.text}</p>
        {reply && <ReplyBlockView reply={reply} {...handlers} />}
        {reply?.actions && reply.actions.length > 0 && (
          <div className="ba-chip-row">
            {reply.actions.map((action) => (
              <ActionChip key={`${action.kind}-${action.label}`} action={action} busy={handlers.busy} onAction={handlers.onAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(BuilderMessage);
