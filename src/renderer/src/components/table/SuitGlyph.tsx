import { Suit } from '@renderer/engine/types'

export function suitColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? 'var(--color-crimson)' : 'var(--color-ink)'
}

interface SuitGlyphProps {
  suit: Suit
  size?: number
  className?: string
  /** Override the suit's natural ink/crimson color -- needed on dark backgrounds where ink would vanish. */
  color?: string
}

/**
 * Hand-drawn suit glyphs (not generic Unicode text glyphs), each with a
 * small decorative flourish, rendered at a fixed 0-100 viewBox so they can
 * be dropped at any size across corner indices, pips, and the card back.
 */
export function SuitGlyph({ suit, size = 20, className, color: colorOverride }: SuitGlyphProps): React.JSX.Element {
  const color = colorOverride ?? suitColor(suit)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {suit === 'H' && <HeartPath color={color} />}
      {suit === 'D' && <DiamondPath color={color} />}
      {suit === 'S' && <SpadePath color={color} />}
      {suit === 'C' && <ClubPath color={color} />}
    </svg>
  )
}

function HeartPath({ color }: { color: string }): React.JSX.Element {
  return (
    <g>
      <path
        d="M50 88 C18 64 2 42 2 24 C2 8 14 -2 29 -2 C40 -2 48 5 50 16 C52 5 60 -2 71 -2 C86 -2 98 8 98 24 C98 42 82 64 50 88 Z"
        fill={color}
      />
      <path
        d="M50 20 C48 12 42 6 33 5"
        stroke="rgba(255,235,200,0.55)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

function DiamondPath({ color }: { color: string }): React.JSX.Element {
  return (
    <g>
      <path d="M50 -2 L96 46 L50 98 L4 46 Z" fill={color} />
      <path
        d="M50 14 L82 46"
        stroke="rgba(255,235,200,0.5)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

function SpadePath({ color }: { color: string }): React.JSX.Element {
  return (
    <g>
      <path
        d="M50 0 C82 26 100 46 100 64 C100 80 88 90 74 90 C63 90 55 84 51 75 C51 84 55 90 66 96 L34 96 C45 90 49 84 49 75 C45 84 37 90 26 90 C12 90 0 80 0 64 C0 46 18 26 50 0 Z"
        fill={color}
      />
      <path
        d="M50 14 C56 22 62 28 68 34"
        stroke="rgba(255,235,200,0.5)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

function ClubPath({ color }: { color: string }): React.JSX.Element {
  return (
    <g>
      <circle cx="50" cy="30" r="24" fill={color} />
      <circle cx="26" cy="58" r="24" fill={color} />
      <circle cx="74" cy="58" r="24" fill={color} />
      <path d="M42 68 L58 68 L68 98 L32 98 Z" fill={color} />
      <path
        d="M50 18 C54 22 57 27 58 32"
        stroke="rgba(255,235,200,0.5)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}
