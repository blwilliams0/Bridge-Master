import { RANKS, Suit } from '@renderer/engine/types'
import { SuitGlyph } from '@renderer/components/table/SuitGlyph'
import { MiniHand } from '../MiniHand'

const SUITS: { suit: Suit; name: string }[] = [
  { suit: 'S', name: 'Spades' },
  { suit: 'H', name: 'Hearts' },
  { suit: 'D', name: 'Diamonds' },
  { suit: 'C', name: 'Clubs' }
]

export default function CardRanking(): React.JSX.Element {
  const spadeRun = RANKS.map((rank) => ({ suit: 'S' as Suit, rank }))

  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Every suit ranks the same way, from lowest to highest: 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack,
        Queen, King, Ace.
      </p>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
        <MiniHand cards={spadeRun} width={46} />
      </div>

      <p>
        There are four suits. In a <strong>notrump</strong> contract, no suit is special -- the
        highest card of the suit led always wins the trick. In a <strong>suit contract</strong>, one
        suit is named <strong>trump</strong>: any trump card beats every card of every other suit,
        no matter how low -- so even a small trump can win a trick your hand couldn&apos;t otherwise
        take.
      </p>

      <div className="flex justify-center gap-8">
        {SUITS.map((s) => (
          <div key={s.suit} className="flex flex-col items-center gap-1">
            <SuitGlyph suit={s.suit} size={30} />
            <span className="font-display text-xs text-[var(--color-cream-muted)]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
