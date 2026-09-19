import { motion } from 'framer-motion'
import { sortHand } from '@renderer/engine/cards'
import { Card as CardModel, Hand as HandModel, Seat } from '@renderer/engine/types'
import { Card } from './Card'
import { CardBack } from './CardBack'

interface HandProps {
  seat: Seat
  hand: HandModel
  faceUp: boolean
  /** Cards the human may legally click right now (empty if it isn't their turn to act on this hand). */
  playableCards: CardModel[]
  onPlay?: (card: CardModel) => void
  orientation: 'horizontal' | 'vertical'
  label: string
}

// Fixed pixel dimensions (rather than Tailwind's space-x/space-y utilities,
// which don't reliably apply negative arbitrary values here) so a full
// 13-card fan never overflows the viewport.
const SIZES = {
  horizontal: { width: 72, overlap: 38 },
  vertical: { width: 52, overlap: 50 }
}

export function Hand({ hand, faceUp, playableCards, onPlay, orientation, label }: HandProps): React.JSX.Element {
  const sorted = sortHand(hand)
  const isPlayable = (c: CardModel): boolean => playableCards.some((p) => p.suit === c.suit && p.rank === c.rank)
  const { width, overlap } = SIZES[orientation]
  const isHorizontal = orientation === 'horizontal'

  const containerStyle: React.CSSProperties = isHorizontal
    ? { display: 'flex', flexDirection: 'row' }
    : { display: 'flex', flexDirection: 'column' }

  const offsetStyle = (i: number): React.CSSProperties =>
    i === 0 ? {} : isHorizontal ? { marginLeft: -overlap } : { marginTop: -overlap }

  if (!faceUp) {
    return (
      <div className="flex flex-col items-center gap-1">
        <SeatLabel label={label} />
        <div style={containerStyle}>
          {hand.map((_, i) => (
            <div key={i} style={{ width, position: 'relative', zIndex: i, ...offsetStyle(i) }}>
              <CardBack />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <SeatLabel label={label} />
      <div style={containerStyle}>
        {sorted.map((card, i) => {
          const playable = isPlayable(card)
          return (
            <motion.div
              key={`${card.suit}${card.rank}`}
              layout
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.28 }}
              style={{ width, position: 'relative', zIndex: i, ...offsetStyle(i) }}
            >
              <Card
                card={card}
                interactive={playable ? 'enabled' : onPlay ? 'disabled' : 'static'}
                onClick={playable && onPlay ? () => onPlay(card) : undefined}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SeatLabel({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="font-display text-xs tracking-[0.2em] text-[var(--color-gold-bright)] opacity-80 uppercase">
      {label}
    </div>
  )
}
