import { motion } from 'framer-motion'
import { HandScore } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/lib/cardDisplay'

const SEAT_LABEL: Record<string, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

interface ScoreSummaryModalProps {
  score: HandScore
  cumulative: { NS: number; EW: number }
  onNextHand: () => void
  onHome: () => void
}

export function ScoreSummaryModal({
  score,
  cumulative,
  onNextHand,
  onHome
}: ScoreSummaryModalProps): React.JSX.Element {
  const { contract } = score
  const declarerSide =
    contract.declarer === 'N' || contract.declarer === 'S' ? 'North / South' : 'East / West'
  const favoredSide =
    score.score >= 0
      ? declarerSide
      : declarerSide === 'North / South'
        ? 'East / West'
        : 'North / South'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="w-[420px] rounded-2xl border border-[var(--color-gold)] bg-[var(--color-wood-850)] p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
      >
        <h2 className="font-display text-2xl tracking-wide text-[var(--color-gold-bright)]">
          {score.madeContract ? 'Contract Made' : 'Contract Defeated'}
        </h2>

        <div className="mt-4 flex items-center justify-center gap-2 font-display text-lg text-[var(--color-cream)]">
          <span>{contract.level}</span>
          <span style={{ color: strainColor(contract.strain) }}>
            {strainSymbol(contract.strain)}
          </span>
          {contract.doubling !== 'none' && (
            <span className="text-[var(--color-crimson-bright)]">
              {contract.doubling === 'doubled' ? 'X' : 'XX'}
            </span>
          )}
          <span className="text-[var(--color-cream-muted)]">
            by {SEAT_LABEL[contract.declarer]}
          </span>
        </div>

        <p className="mt-2 text-[var(--color-cream-muted)]">
          {score.tricksTaken} tricks taken &middot; {declarerSide} needed {contract.level + 6}
        </p>

        <div className="mt-5 rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] py-4">
          <div className="font-display text-3xl text-[var(--color-amber-glow)]">
            {favoredSide} +{Math.abs(score.score)}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-8 font-display text-sm text-[var(--color-cream-muted)]">
          <div>
            North / South <span className="text-[var(--color-cream)]">{cumulative.NS}</span>
          </div>
          <div>
            East / West <span className="text-[var(--color-cream)]">{cumulative.EW}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextHand}
          className="mt-6 rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-8 py-2.5 font-display text-sm tracking-wide text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
        >
          Next Hand
        </button>
        <button
          type="button"
          onClick={onHome}
          className="mt-3 block w-full text-[var(--color-cream-muted)]"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  )
}
