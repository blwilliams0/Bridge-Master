import { motion } from 'framer-motion'
import { useStatsStore } from '@renderer/store/statsStore'

interface StatsPanelProps {
  onClose: () => void
}

export function StatsPanel({ onClose }: StatsPanelProps): React.JSX.Element {
  const stats = useStatsStore((s) => s)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] rounded-2xl border border-[var(--color-gold)] bg-[var(--color-wood-850)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
      >
        <h2 className="font-display text-2xl tracking-wide text-[var(--color-gold-bright)]">
          Your Record
        </h2>
        <p className="mt-1 font-body text-sm text-[var(--color-cream-muted)]">
          Across every hand you&apos;ve played.
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          <Stat label="Hands played" value={stats.handsPlayed} />
          <Stat label="Passed out" value={stats.passedOutHands} />
          <Stat label="Contracts made" value={stats.contractsMade} />
          <Stat label="Contracts defeated" value={stats.contractsDefeated} />
          <Stat label="Times declarer" value={stats.declarerHands} />
          <Stat label="Cumulative score" value={stats.totalNsScore} signed />
        </dl>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => stats.resetStats()}
            className="flex-1 rounded-full border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] px-6 py-2.5 font-display text-sm tracking-wide text-[var(--color-cream-muted)] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-cream)]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-6 py-2.5 font-display text-sm tracking-wide text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Stat({
  label,
  value,
  signed
}: {
  label: string
  value: number
  signed?: boolean
}): React.JSX.Element {
  const display = signed && value > 0 ? `+${value}` : String(value)
  return (
    <div>
      <dt className="font-display text-xs uppercase tracking-wide text-[var(--color-cream-dim)]">
        {label}
      </dt>
      <dd className="font-display text-2xl text-[var(--color-amber-glow)]">{display}</dd>
    </div>
  )
}
