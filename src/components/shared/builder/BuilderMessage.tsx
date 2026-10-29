'use client';

import React, { memo } from 'react';
import { Download, Home, Mail, RotateCcw, ScrollText, Trophy, Wrench, ArrowRight } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaExternalLinkAlt } from 'react-icons/fa';
import {
  QUICK_ACTIONS,
  type BotReply,
  type ContactLink,
  type ProjectSummary,
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
};

const CONTACT_ICONS: Record<ContactLink['kind'], React.ReactNode> = {
  email: <Mail size={15} aria-hidden="true" />,
  github: <FaGithub size={15} aria-hidden="true" />,
  linkedin: <FaLinkedin size={15} aria-hidden="true" />,
  instagram: <FaInstagram size={15} aria-hidden="true" />,
};

export interface MessageHandlers {
  busy: boolean;
  claimedProject: string | null;
  onQuick: (id: QuickActionId, label: string) => void;
  onAction: (action: ReplyAction, event: React.MouseEvent<HTMLElement>) => void;
  onOpenProject: (project: ProjectSummary, event: React.MouseEvent<HTMLAnchorElement>) => void;
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

const ProjectCard = ({
  project,
  index,
  claimed,
  onOpen,
}: {
  project: ProjectSummary;
  index: number;
  claimed: boolean;
  onOpen: MessageHandlers['onOpenProject'];
}) => (
  <article
    className={`ba-achievement${claimed ? ' is-claimed' : ''}`}
    style={{ '--stagger': index } as React.CSSProperties}
    aria-label={`Project: ${project.title}`}
  >
    <div className="ba-achievement-banner">
      <span className="ba-achievement-emblem" aria-hidden="true">
        <Trophy size={14} />
      </span>
      Achievement unlocked
    </div>
    <div className="ba-achievement-body">
      {project.type && <p className="ba-achievement-type">{project.type}</p>}
      <h3 className="ba-achievement-title">{project.title}</h3>
      <p className="ba-achievement-desc">{project.description}</p>
      {project.tech.length > 0 && (
        <ul className="ba-tags" aria-label="Technologies used">
          {project.tech.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      )}
      <div className="ba-achievement-actions">
        <a href={project.caseStudyHref} className="ba-gold-btn" onClick={(event) => onOpen(project, event)}>
          View Project <ArrowRight size={14} aria-hidden="true" />
        </a>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="ba-text-link">
            Live <FaExternalLinkAlt size={10} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="ba-text-link">
            <FaGithub size={12} aria-hidden="true" /> Code
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  </article>
);

const ReplyBlockView = ({ reply, ...handlers }: { reply: BotReply } & MessageHandlers) => {
  const block = reply.block;
  if (!block) return null;

  switch (block.kind) {
    case 'quick-actions':
      return <QuickActions busy={handlers.busy} onQuick={handlers.onQuick} />;

    case 'skills':
      return (
        <div className="ba-skills">
          {block.groups.map((group) => (
            <div key={group.title} className="ba-skill-group">
              <h3 className="ba-block-heading">{group.title}</h3>
              <ul className="ba-tags">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'projects':
      return (
        <div className="ba-achievements">
          {block.projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              claimed={handlers.claimedProject === project.slug}
              onOpen={handlers.onOpenProject}
            />
          ))}
        </div>
      );

    case 'experience':
      return (
        <ol className="ba-timeline">
          {block.items.map((item) => (
            <li key={`${item.year}-${item.title}`}>
              <span className="ba-year">{item.year}</span>
              <div>
                <p className="ba-timeline-title">{item.title}</p>
                {(item.organization || item.type) && (
                  <p className="ba-timeline-meta">{[item.organization, item.type].filter(Boolean).join(' · ')}</p>
                )}
                {item.detail && <p className="ba-timeline-meta">{item.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      );

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
