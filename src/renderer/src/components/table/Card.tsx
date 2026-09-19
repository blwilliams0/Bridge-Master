import { Card as CardModel } from '@renderer/engine/types'
import { rankLabel } from '@renderer/engine/cards'
import { CardFrame } from './CardFrame'
import { SuitGlyph, suitColor } from './SuitGlyph'
import { pipLayoutFor } from './pipLayout'

interface CardProps {
  card: CardModel
  className?: string
  style?: React.CSSProperties
  /** Whether the card reads as playable right now (adds lift + glow, vs. dimmed/disabled). */
  interactive?: 'enabled' | 'disabled' | 'static'
  onClick?: () => void
}

const COURT_LETTERS: Partial<Record<number, string>> = { 11: 'J', 12: 'Q', 13: 'K' }

export function Card({ card, className, style, interactive = 'static', onClick }: CardProps): React.JSX.Element {
  const color = suitColor(card.suit)
  const label = rankLabel(card.rank)
  const courtLetter = COURT_LETTERS[card.rank]
  const pips = pipLayoutFor(card.rank)

  const clickable = interactive === 'enabled'

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      aria-label={`${label} of ${card.suit}`}
      className={`group relative aspect-[5/7] w-full select-none rounded-[10px] border text-left transition-all duration-150 ${
        clickable
          ? 'cursor-pointer border-[var(--color-gold)] shadow-[0_4px_10px_rgba(0,0,0,0.45)] hover:-translate-y-3 hover:shadow-[0_10px_22px_rgba(0,0,0,0.55),0_0_16px_var(--color-amber-glow)]'
          : interactive === 'disabled'
            ? 'cursor-not-allowed border-[var(--color-gold-dim)] opacity-40 saturate-50'
            : 'border-[var(--color-gold-dim)] shadow-[0_3px_8px_rgba(0,0,0,0.4)]'
      } ${className ?? ''}`}
      style={{
        background: 'linear-gradient(160deg, var(--color-parchment-light), var(--color-parchment) 65%, var(--color-parchment-950))',
        ...style
      }}
    >
      <CardFrame />

      {/* corner indices */}
      <Corner label={label} suit={card.suit} color={color} />
      <Corner label={label} suit={card.suit} color={color} flipped />

      {/* center content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {courtLetter ? (
          <CourtMedallion letter={courtLetter} color={color} suit={card.suit} />
        ) : card.rank === 14 ? (
          <SuitGlyph suit={card.suit} size={42} />
        ) : pips ? (
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            {pips.map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y}) ${p.rotate ? 'rotate(180)' : ''}`}>
                <g transform="translate(-6 -6) scale(0.12)">
                  <SuitGlyph suit={card.suit} size={100} />
                </g>
              </g>
            ))}
          </svg>
        ) : null}
      </div>
    </button>
  )
}

function Corner({
  label,
  suit,
  color,
  flipped
}: {
  label: string
  suit: CardModel['suit']
  color: string
  flipped?: boolean
}): React.JSX.Element {
  return (
    <div
      className={`absolute flex flex-col items-center leading-none ${
        flipped ? 'bottom-1.5 right-1.5 rotate-180' : 'left-1.5 top-1.5'
      }`}
    >
      <span
        className="font-display text-[15px] font-semibold"
        style={{ color, fontFamily: 'var(--font-display)' }}
      >
        {label}
      </span>
      <SuitGlyph suit={suit} size={11} className="mt-0.5" />
    </div>
  )
}

function CourtMedallion({
  letter,
  color,
  suit
}: {
  letter: string
  color: string
  suit: CardModel['suit']
}): React.JSX.Element {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="34" fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity={0.85} />
      <circle cx="50" cy="50" r="29" fill="none" stroke="var(--color-gold)" strokeWidth="0.7" opacity={0.55} />
      {[0, 90, 180, 270].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <circle cx="50" cy="16" r="1.6" fill="var(--color-gold-bright)" />
        </g>
      ))}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="40"
        fontFamily="var(--font-display)"
        fontWeight={600}
        fill={color}
      >
        {letter}
      </text>
      <g transform="translate(39 84) scale(0.22)">
        <SuitGlyph suit={suit} size={100} />
      </g>
    </svg>
  )
}
