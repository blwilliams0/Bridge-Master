import { SuitGlyph } from '@renderer/components/table/SuitGlyph'
import { Strain } from '@renderer/engine/types'

const STRAIN_ORDER: { strain: Strain; label: string }[] = [
  { strain: 'C', label: 'Clubs' },
  { strain: 'D', label: 'Diamonds' },
  { strain: 'H', label: 'Hearts' },
  { strain: 'S', label: 'Spades' },
  { strain: 'NT', label: 'Notrump' }
]

export default function AuctionBasics(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Starting with the dealer, players take turns clockwise (N &rarr; E &rarr; S &rarr; W) making
        one call each: a <strong>bid</strong>, <strong>pass</strong>, <strong>double</strong>, or{' '}
        <strong>redouble</strong>. The auction ends the moment a call is followed by three
        consecutive passes -- or, if nobody ever bids, after all four pass (the hand is thrown in
        with no play).
      </p>
      <p>
        A bid names a <strong>level</strong>, 1 through 7 (meaning your side commits to winning 6 +
        level tricks), and a <strong>strain</strong>. Strains rank low to high:
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {STRAIN_ORDER.map((s, i) => (
          <div key={s.strain} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              {s.strain === 'NT' ? (
                <span className="font-display text-lg text-[var(--color-gold-bright)]">NT</span>
              ) : (
                <SuitGlyph suit={s.strain} size={22} />
              )}
              <span className="font-display text-[10px] text-[var(--color-cream-muted)]">
                {s.label}
              </span>
            </div>
            {i < STRAIN_ORDER.length - 1 && (
              <span className="text-[var(--color-cream-dim)]">&lt;</span>
            )}
          </div>
        ))}
      </div>

      <p>
        Each new bid must outrank the previous one -- a higher level, or the same level in a
        higher-ranking strain. <strong>Double</strong> raises the stakes on an opponent&apos;s bid;{' '}
        <strong>redouble</strong> raises them again on your own side&apos;s doubled bid. Any new bid
        cancels a standing double.
      </p>
      <p>
        Whoever bids the final, highest strain first for the winning side becomes{' '}
        <strong>declarer</strong> -- their partner&apos;s hand becomes the dummy once play begins.
      </p>
    </div>
  )
}
