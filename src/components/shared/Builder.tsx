export type BuilderState =
  | 'idle'
  | 'noticed'
  | 'greeting'
  | 'opening'
  | 'ready'
  | 'thinking'
  | 'responding'
  | 'celebrating'
  | 'closing';

interface BuilderProps {
  state?: BuilderState;
  /** Portrait mode drops the floating island so the character fits a small avatar. */
  portrait?: boolean;
  className?: string;
}

const OUTLINE = '#2B1D12';

/**
 * Original inline-SVG Builder mascot: hard hat, bushy beard, hammer and a floating grass island.
 * Every animation lives in builder-assistant.css and is keyed off the `builder--<state>` class,
 * so the artwork stays a pure, dependency-free component.
 */
const Builder = ({ state = 'idle', portrait = false, className = '' }: BuilderProps) => (
  <svg
    viewBox={portrait ? '28 14 64 64' : '0 0 120 132'}
    className={`builder builder--${state} ${className}`.trim()}
    aria-hidden="true"
    focusable="false"
  >
    {!portrait && <ellipse className="builder-shadow" cx="60" cy="128" rx="30" ry="3.5" fill="#000" opacity="0.2" />}

    <g className="builder-float">
      {!portrait && (
        <g className="builder-island">
          <path
            d="M23 106c0-3 3-5 7-5h60c4 0 7 2 7 5l-8 11c-7 7-19 9-29 9s-22-2-29-9Z"
            fill="#9A6233"
            stroke={OUTLINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M34 114c6 4 14 6 26 6s20-2 26-6" stroke="#7A4A24" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="44" cy="119" rx="3" ry="2" fill="#7A4A24" />
          <ellipse cx="72" cy="121" rx="2.5" ry="1.6" fill="#B98552" />
          <ellipse cx="60" cy="104" rx="38" ry="7.5" fill="#6CC04A" stroke={OUTLINE} strokeWidth="2.5" />
          <path
            d="M27 106l3-4 2 4 3-3 2 4M84 106l3-4 2 4 3-3 2 4M50 110l2-3 2 3 2-3 2 3"
            stroke="#4F9A33"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <ellipse cx="48" cy="102" rx="10" ry="2" fill="#8FD86B" opacity="0.7" />
        </g>
      )}

      <g className="builder-body">
        {/* Boots */}
        <rect x="45" y="96" width="12" height="9" rx="3.5" fill="#5A3A1F" stroke={OUTLINE} strokeWidth="2" />
        <rect x="63" y="96" width="12" height="9" rx="3.5" fill="#5A3A1F" stroke={OUTLINE} strokeWidth="2" />

        {/* Trousers */}
        <path d="M46 86h28v12H63v-4h-6v4H46Z" fill="#3D6DB5" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />

        {/* Left arm resting on the hip */}
        <path d="M43 74 35 85" stroke="#C9573A" strokeWidth="9" strokeLinecap="round" />
        <circle cx="35" cy="87" r="4.5" fill="#F4C49A" stroke={OUTLINE} strokeWidth="2" />

        {/* Shirt and leather apron */}
        <path
          d="M40 90c0-16 6-24 20-24s20 8 20 24Z"
          fill="#D9643A"
          stroke={OUTLINE}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M49 72h22v18H49Z" fill="#8A5A2E" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M54 79h12v6H54Z" fill="none" stroke="#5A3A1F" strokeWidth="1.6" />
        <path d="M49 72 45 68M71 72l4-4" stroke="#5A3A1F" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="42" y="86" width="36" height="5" rx="1.5" fill="#4A2C14" stroke={OUTLINE} strokeWidth="1.6" />
        <rect x="56.5" y="85.5" width="7" height="6" rx="1" fill="#F2B632" stroke={OUTLINE} strokeWidth="1.4" />

        {/* Hammer arm (pivots at the shoulder) */}
        <g className="builder-hammer-arm">
          <path d="M77 74 87 81" stroke="#C9573A" strokeWidth="9" strokeLinecap="round" />
          <rect x="87.5" y="55" width="5" height="31" rx="2.5" fill="#B07A43" stroke={OUTLINE} strokeWidth="2" />
          <rect x="79" y="45" width="22" height="12" rx="3" fill="#9AA3A8" stroke={OUTLINE} strokeWidth="2.2" />
          <path d="M82 48h16" stroke="#E4EAED" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="90" cy="82" r="4.8" fill="#F4C49A" stroke={OUTLINE} strokeWidth="2" />
        </g>

        {/* Head (pivots at the neck) */}
        <g className="builder-head">
          <circle cx="45" cy="51" r="3.6" fill="#F4C49A" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="75" cy="51" r="3.6" fill="#F4C49A" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="60" cy="50" r="15" fill="#F4C49A" stroke={OUTLINE} strokeWidth="2.5" />
          <path
            d="M45 52c0 13 6 20 15 20s15-7 15-20c-4 6-9 8-15 8s-11-2-15-8Z"
            fill="#8B4A22"
            stroke={OUTLINE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <ellipse className="builder-mouth" cx="60" cy="62.5" rx="3.2" ry="2" fill="#5A1F14" />
          <path
            d="M49 57c4-4 8-4 11-1 3-3 7-3 11 1-4 4-8 4-11 2-3 2-7 2-11-2Z"
            fill="#6E3A1A"
            stroke={OUTLINE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <ellipse cx="60" cy="53" rx="3.6" ry="3" fill="#E8A87C" stroke={OUTLINE} strokeWidth="1.2" />
          <g className="builder-brows">
            <path d="M50 41.5c2-1.6 5-1.6 7 0M63 41.5c2-1.6 5-1.6 7 0" stroke="#5A2E12" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
          <g className="builder-eyes">
            <ellipse cx="53.5" cy="46.5" rx="2.1" ry="2.7" fill={OUTLINE} />
            <ellipse cx="66.5" cy="46.5" rx="2.1" ry="2.7" fill={OUTLINE} />
            <circle cx="54.2" cy="45.6" r="0.75" fill="#fff" />
            <circle cx="67.2" cy="45.6" r="0.75" fill="#fff" />
          </g>
          {/* Hard hat */}
          <path
            d="M42 39c0-12 8-20 18-20s18 8 18 20Z"
            fill="#F5C02E"
            stroke={OUTLINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M60 20v18" stroke="#D99A12" strokeWidth="4" />
          <path d="M48 30c2-5 5-7 8-8" stroke="#FFF2B8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <rect x="37" y="37" width="46" height="6" rx="3" fill="#F5C02E" stroke={OUTLINE} strokeWidth="2.5" />
        </g>
      </g>

      {/* State props: only made visible by their state's CSS */}
      <g className="builder-alert">
        <circle cx="92" cy="24" r="7" fill="#F2B632" stroke={OUTLINE} strokeWidth="2" />
        <path d="M92 20v4.5" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="92" cy="28" r="1.3" fill={OUTLINE} />
      </g>
      <g className="builder-thought" fill="#FFF8E7" stroke={OUTLINE} strokeWidth="1.5">
        <circle cx="80" cy="30" r="2" />
        <circle cx="86" cy="24" r="2.8" />
        <circle cx="94" cy="16" r="3.8" />
      </g>
      <g className="builder-sparkles" fill="#F2B632" stroke={OUTLINE} strokeWidth="1">
        <path d="M24 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        <path d="M100 66l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z" />
        <path d="M30 64l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2Z" />
      </g>
    </g>
  </svg>
);

export default Builder;
