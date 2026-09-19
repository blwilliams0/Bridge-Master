import { scoreHand } from '@renderer/engine/scoring'
import { Contract, Vulnerability } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/components/bidding/BiddingBox'

const EXAMPLES: { label: string; contract: Contract; tricksTaken: number; vulnerability: Vulnerability }[] = [
  {
    label: 'Game bid and made, not vulnerable',
    contract: { level: 4, strain: 'S', doubling: 'none', declarer: 'S' },
    tricksTaken: 10,
    vulnerability: 'None'
  },
  {
    label: 'Game bid and made, vulnerable',
    contract: { level: 4, strain: 'S', doubling: 'none', declarer: 'S' },
    tricksTaken: 10,
    vulnerability: 'NS'
  },
  {
    label: 'Small slam bid and made',
    contract: { level: 6, strain: 'NT', doubling: 'none', declarer: 'S' },
    tricksTaken: 12,
    vulnerability: 'NS'
  },
  {
    label: 'Doubled contract, defeated by two',
    contract: { level: 3, strain: 'H', doubling: 'doubled', declarer: 'S' },
    tricksTaken: 7,
    vulnerability: 'NS'
  }
]

export default function Scoring(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Making your contract scores the trick value you bid (20/trick in a minor, 30/trick in a
        major, 40 for the first notrump trick then 30/trick after), plus a bonus: 50 for a
        part-score, or 300 (500 if vulnerable) for reaching game. Bid and make a slam and you earn
        a further bonus on top of that.
      </p>
      <p>
        Falling short costs your side points instead -- more if you're vulnerable, and much more
        if the contract was doubled. These are real numbers computed by Bridge Master's own
        scoring engine:
      </p>

      <div className="flex flex-col gap-2">
        {EXAMPLES.map((ex) => {
          const result = scoreHand(ex.contract, ex.tricksTaken, ex.vulnerability)
          return (
            <div
              key={ex.label}
              className="flex items-center justify-between rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] px-4 py-3"
            >
              <div>
                <div className="font-display text-sm text-[var(--color-cream)]">{ex.label}</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-cream-muted)]">
                  <span>{ex.contract.level}</span>
                  <span style={{ color: strainColor(ex.contract.strain) }}>{strainSymbol(ex.contract.strain)}</span>
                  {ex.contract.doubling !== 'none' && <span>X</span>}
                  <span>
                    &middot; {ex.tricksTaken} tricks &middot; {ex.vulnerability === 'None' ? 'not vulnerable' : 'vulnerable'}
                  </span>
                </div>
              </div>
              <div
                className={`font-display text-xl ${
                  result.score >= 0 ? 'text-[var(--color-amber-glow)]' : 'text-[var(--color-crimson-bright)]'
                }`}
              >
                {result.score >= 0 ? '+' : ''}
                {result.score}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
