import { sortHand } from '@renderer/engine/cards'
import { Card as CardModel } from '@renderer/engine/types'
import { Card } from '@renderer/components/table/Card'

interface MiniHandProps {
  cards: CardModel[]
  width?: number
}

/** A small, static, sorted row of cards for illustrating hands in tutorial content. */
export function MiniHand({ cards, width = 56 }: MiniHandProps): React.JSX.Element {
  const sorted = sortHand(cards)
  const overlap = width * 0.55

  return (
    <div className="flex" style={{ paddingRight: overlap }}>
      {sorted.map((card, i) => (
        <div
          key={`${card.suit}${card.rank}`}
          style={{ width, marginLeft: i === 0 ? 0 : -overlap, position: 'relative', zIndex: i }}
        >
          <Card card={card} interactive="static" />
        </div>
      ))}
    </div>
  )
}
