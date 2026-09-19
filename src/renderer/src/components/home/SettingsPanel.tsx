import { motion } from 'framer-motion'
import { useSettingsStore } from '@renderer/store/settingsStore'
import { PlayDifficulty } from '@renderer/engine/playAI'

interface SettingsPanelProps {
  onClose: () => void
}

const OPTIONS: { value: PlayDifficulty; label: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Mostly straightforward, occasionally random play -- forgiving while you learn.'
  },
  {
    value: 'club-player',
    label: 'Club Player',
    description:
      'Sound table heuristics: sensible opening leads, third-hand-high, covering honors, and basic declarer play.'
  }
]

export function SettingsPanel({ onClose }: SettingsPanelProps): React.JSX.Element {
  const difficulty = useSettingsStore((s) => s.difficulty)
  const setDifficulty = useSettingsStore((s) => s.setDifficulty)

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
        <h2 className="font-display text-2xl tracking-wide text-[var(--color-gold-bright)]">Settings</h2>
        <p className="mt-1 font-body text-sm text-[var(--color-cream-muted)]">
          Choose how sharp your opponents (and partner) play.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDifficulty(opt.value)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                difficulty === opt.value
                  ? 'border-[var(--color-amber-glow)] bg-[var(--color-wood-700)]'
                  : 'border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] hover:border-[var(--color-gold)]'
              }`}
            >
              <div className="font-display text-base text-[var(--color-cream)]">{opt.label}</div>
              <div className="mt-0.5 font-body text-sm text-[var(--color-cream-muted)]">{opt.description}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-8 py-2.5 font-display text-sm tracking-wide text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
        >
          Done
        </button>
      </motion.div>
    </div>
  )
}
