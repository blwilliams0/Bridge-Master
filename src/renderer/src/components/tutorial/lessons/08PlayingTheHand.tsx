import { Card } from '@renderer/components/table/Card'
import { trickWinner } from '@renderer/engine/play'
import { PlayedCard, Seat, Suit } from '@renderer/engine/types'

const SEAT_LABEL: Record<Seat, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

// North leads a heart; South is void in hearts and ruffs with a low spade (trump).
const EXAMPLE_TRICK: PlayedCard[] = [
  { seat: 'N', card: { suit: 'H', rank: 6 } },
  { seat: 'E', card: { suit: 'H', rank: 11 } },
  { seat: 'S', card: { suit: 'S', rank: 4 } },
  { seat: 'W', card: { suit: 'H', rank: 13 } }
]
const TRUMP_SUIT: Suit = 'S'

export default function PlayingTheHand(): React.JSX.Element {
  const winner = trickWinner(EXAMPLE_TRICK, TRUMP_SUIT)

  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Once the auction ends, declarer's partner lays their hand face-up on the table as the{' '}
        <strong>dummy</strong> -- declarer plays both their own cards and dummy's, while the
        dummy's own player takes no active part for the rest of the hand. The defenders (the other
        partnership) play as normal.
      </p>
      <p>
        Each trick, everyone must <strong>follow suit</strong> if they can -- play a card of the
        suit that was led. Only when you hold none of that suit may you play anything else,
        including a trump, which is called <strong>ruffing</strong>.
      </p>

      <div>
        <h3 className="mb-2 font-display text-base text-[var(--color-gold-bright)]">
          Example: South ruffs
        </h3>
        <div className="flex justify-center gap-4">
          {EXAMPLE_TRICK.map(({ seat, card }) => (
            <div key={seat} className="flex flex-col items-center gap-1">
              <span
                className="font-display text-xs uppercase tracking-wide"
                style={{
                  color: seat === winner ? 'var(--color-gold-bright)' : 'var(--color-cream-muted)'
                }}
              >
                {SEAT_LABEL[seat]}
                {seat === winner ? ' — wins' : ''}
              </span>
              <div style={{ width: 60 }}>
                <Card card={card} interactive="static" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--color-cream-muted)]">
          Spades are trump. North leads a heart; East and West both follow suit, but South holds
          no hearts at all and plays a spade instead -- ruffing. Because trumps beat every other
          suit, South's low 4♠ wins the trick even though West's K♥ was the highest heart played.
        </p>
      </div>
    </div>
  )
}
