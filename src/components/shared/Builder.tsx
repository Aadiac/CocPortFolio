export type BuilderMood = 'idle' | 'thinking' | 'success';

interface BuilderProps {
  mood?: BuilderMood;
  className?: string;
}

/**
 * Inline SVG "Builder" mascot used by the chat assistant.
 * Animations live in globals.css and are keyed off the `builder--<mood>` class.
 */
const Builder = ({ mood = 'idle', className = '' }: BuilderProps) => (
  <svg
    viewBox="0 0 120 120"
    className={`builder builder--${mood} ${className}`.trim()}
    aria-hidden="true"
    focusable="false"
  >
    <g className="builder-bob">
      <ellipse cx="60" cy="114" rx="30" ry="4" fill="#131B17" opacity="0.12" />

      <g className="builder-blueprint">
        <rect
          x="12"
          y="62"
          width="24"
          height="32"
          rx="2"
          transform="rotate(-8 24 78)"
          fill="#F7FAF8"
          stroke="#131B17"
          strokeWidth="2"
        />
        <path
          d="M17 70h14M17 76h14M17 82h9M17 88h12"
          transform="rotate(-8 24 78)"
          stroke="#34D399"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      <rect x="47" y="96" width="9" height="12" rx="3" fill="#131B17" />
      <rect x="64" y="96" width="9" height="12" rx="3" fill="#131B17" />
      <rect x="43" y="105" width="16" height="7" rx="3.5" fill="#131B17" />
      <rect x="61" y="105" width="16" height="7" rx="3.5" fill="#131B17" />

      <rect x="54" y="62" width="12" height="8" rx="2" fill="#F3C9A6" stroke="#131B17" strokeWidth="2" />

      <path
        d="M40 78c0-7 5-12 12-12h16c7 0 12 5 12 12v20H40Z"
        fill="#F7FAF8"
        stroke="#131B17"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M47 68h26v30H47Z" fill="#131B17" />
      <path d="M51 72v5M69 72v5" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="84" r="2.5" fill="#34D399" />

      <path d="M44 80 30 88" stroke="#F3C9A6" strokeWidth="9" strokeLinecap="round" />
      <path d="M44 80 36 84" stroke="#F7FAF8" strokeWidth="10" strokeLinecap="round" />
      <circle cx="28" cy="89" r="5" fill="#F3C9A6" stroke="#131B17" strokeWidth="2" />

      <g className="builder-hammer-arm">
        <path d="M76 80 88 82" stroke="#F3C9A6" strokeWidth="9" strokeLinecap="round" />
        <path d="M76 80 82 81" stroke="#F7FAF8" strokeWidth="10" strokeLinecap="round" />
        <rect x="88" y="56" width="5" height="28" rx="2.5" fill="#A97449" stroke="#131B17" strokeWidth="2" />
        <rect x="81" y="46" width="19" height="11" rx="3" fill="#94A39B" stroke="#131B17" strokeWidth="2" />
        <circle cx="90" cy="82" r="5" fill="#F3C9A6" stroke="#131B17" strokeWidth="2" />
      </g>

      <g className="builder-head">
        <rect x="43" y="38" width="34" height="30" rx="12" fill="#F3C9A6" stroke="#131B17" strokeWidth="2.5" />
        <circle cx="42" cy="53" r="4" fill="#F3C9A6" stroke="#131B17" strokeWidth="2" />
        <circle cx="78" cy="53" r="4" fill="#F3C9A6" stroke="#131B17" strokeWidth="2" />
        <g className="builder-eyes">
          <circle cx="53" cy="52" r="2.2" fill="#131B17" />
          <circle cx="67" cy="52" r="2.2" fill="#131B17" />
        </g>
        <path d="M54 61c3 3 9 3 12 0" stroke="#131B17" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path
          d="M40 36c0-11 9-20 20-20s20 9 20 20Z"
          fill="#34D399"
          stroke="#131B17"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="34" y="33" width="52" height="7" rx="3.5" fill="#34D399" stroke="#131B17" strokeWidth="2.5" />
      </g>
    </g>
  </svg>
);

export default Builder;
