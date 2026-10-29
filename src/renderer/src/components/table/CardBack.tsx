interface CardBackProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Decoratively dense ornate back design used for face-down AI hands --
 * doesn't need to convey rank/suit, so it leans further into pattern.
 */
export function CardBack({ className, style }: CardBackProps): React.JSX.Element {
  return (
    <div
      className={`relative aspect-[5/7] w-full overflow-hidden rounded-[10px] border border-[var(--color-gold-dim)] shadow-[0_6px_14px_rgba(0,0,0,0.5)] ${className ?? ''}`}
      style={{
        background: 'linear-gradient(155deg, var(--color-wood-700), var(--color-wood-900) 70%)',
        ...style
      }}
    >
      <svg viewBox="0 0 140 196" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect
          x="4"
          y="4"
          width="132"
          height="188"
          rx="8"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.2"
          opacity={0.8}
        />
        <rect
          x="9"
          y="9"
          width="122"
          height="178"
          rx="5"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="0.6"
          opacity={0.5}
        />
        <defs>
          <pattern id="quatrefoil" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2.1" fill="var(--color-gold)" opacity={0.35} />
            <path
              d="M10 4 C12.5 4 14 6 14 8.5 C16.5 8.5 18 10.5 18 13 C18 15.5 16.5 17 14 17 C14 19.5 12.5 21 10 21 C7.5 21 6 19.5 6 17 C3.5 17 2 15.5 2 13 C2 10.5 3.5 8.5 6 8.5 C6 6 7.5 4 10 4 Z"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="0.5"
              opacity={0.3}
            />
          </pattern>
        </defs>
        <rect x="12" y="12" width="116" height="172" rx="4" fill="url(#quatrefoil)" />
        <g transform="translate(70 98)">
          <circle
            r="30"
            fill="var(--color-wood-800)"
            stroke="var(--color-gold)"
            strokeWidth="1.4"
            opacity={0.9}
          />
          <circle r="24" fill="none" stroke="var(--color-gold)" strokeWidth="0.6" opacity={0.6} />
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fontSize="30"
            fill="var(--color-gold-bright)"
            fontFamily="var(--font-display)"
            opacity={0.9}
          >
            B
          </text>
        </g>
      </svg>
    </div>
  )
}
