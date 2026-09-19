import { AnimatePresence, motion } from 'framer-motion'
import { PlayedCard, Seat } from '@renderer/engine/types'
import { Card } from './Card'

const SEAT_OFFSET: Record<Seat, { x: number; y: number }> = {
  N: { x: 0, y: -46 },
  S: { x: 0, y: 46 },
  E: { x: 58, y: 0 },
  W: { x: -58, y: 0 }
}

interface TrickAreaProps {
  cards: PlayedCard[]
  winner: Seat | null
}

export function TrickArea({ cards, winner }: TrickAreaProps): React.JSX.Element {
  return (
    <div className="relative flex h-[190px] w-[190px] items-center justify-center">
      <AnimatePresence>
        {cards.map((pc) => {
          const offset = SEAT_OFFSET[pc.seat]
          const isWinner = winner === pc.seat
          return (
            <motion.div
              key={`${pc.card.suit}${pc.card.rank}`}
              className="absolute w-14"
              initial={{ opacity: 0, x: offset.x * 1.6, y: offset.y * 1.6, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: offset.x * 0.4,
                y: offset.y * 0.4,
                scale: isWinner ? 1.12 : 1,
                filter: winner && !isWinner ? 'brightness(0.6)' : 'brightness(1)'
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <Card card={pc.card} interactive="static" />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
