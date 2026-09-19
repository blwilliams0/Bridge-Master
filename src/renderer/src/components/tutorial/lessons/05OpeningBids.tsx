import { createAuction } from '@renderer/engine/bidding'
import { chooseBid } from '@renderer/engine/biddingAI'
import { BidCall, Card as CardModel, Rank, Suit } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/components/bidding/BiddingBox'
import { MiniHand } from '../MiniHand'

function c(suit: Suit, rank: Rank): CardModel {
  return { suit, rank }
}

const EXAMPLES: { title: string; hand: CardModel[]; note: string }[] = [
  {
    title: 'A one-level suit opening',
    hand: [
      c('S', 14), c('S', 13), c('S', 11), c('S', 7), c('S', 4),
      c('H', 12), c('H', 6), c('H', 3),
      c('D', 13), c('D', 8), c('D', 2),
      c('C', 9), c('C', 5)
    ],
    note: 'Opening-strength hand with a 5-card suit: open your longest suit.'
  },
  {
    title: 'A weak two',
    hand: [
      c('H', 13), c('H', 12), c('H', 11), c('H', 9), c('H', 6), c('H', 3),
      c('S', 8), c('S', 4),
      c('D', 7), c('D', 5), c('D', 2),
      c('C', 9), c('C', 6)
    ],
    note: 'A long, weak suit and too few points to open at the 1-level -- pre-empt instead.'
  },
  {
    title: 'A game-forcing monster',
    hand: [
      c('S', 14), c('S', 13), c('S', 12), c('S', 11),
      c('H', 14), c('H', 13), c('H', 12),
      c('D', 14), c('D', 5), c('D', 4),
      c('C', 6), c('C', 5), c('C', 3)
    ],
    note: '22+ points is too strong for a normal opening -- it forces the auction toward game.'
  }
]

export default function OpeningBids(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        The opening bid is the first call anyone makes. Standard American openings are shape- and
        point-driven: open your longest suit with opening-strength values, open notrump with a
        balanced hand in the right range, and reserve very strong or very weak hands for special
        treatments. These are the actual opening bids Bridge Master's own bidding engine chooses
        for each hand below:
      </p>

      {EXAMPLES.map((ex) => {
        const call = chooseBid(createAuction('S'), ex.hand, 'S').call as BidCall
        return (
          <div
            key={ex.title}
            className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base text-[var(--color-gold-bright)]">{ex.title}</h3>
              <div
                className="flex items-center gap-1 font-display text-lg"
                style={{ color: strainColor(call.strain) }}
              >
                <span>{call.level}</span>
                <span>{strainSymbol(call.strain)}</span>
              </div>
            </div>
            <MiniHand cards={ex.hand} width={42} />
            <p className="mt-3 text-sm text-[var(--color-cream-muted)]">{ex.note}</p>
          </div>
        )
      })}
    </div>
  )
}
