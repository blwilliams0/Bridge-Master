import { useState } from 'react'
import { motion } from 'framer-motion'
import { SuitGlyph } from '@renderer/components/table/SuitGlyph'
import { useGameStore } from '@renderer/store/gameStore'
import { SettingsPanel } from './SettingsPanel'
import { StatsPanel } from './StatsPanel'

export function HomeScreen(): React.JSX.Element {
  const startNewGame = useGameStore((s) => s.startNewGame)
  const enterTutorial = useGameStore((s) => s.enterTutorial)
  const [modal, setModal] = useState<'settings' | 'stats' | null>(null)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 bg-[radial-gradient(ellipse_at_center,var(--color-wood-800)_0%,var(--color-wood-950)_75%)]">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-4 opacity-90">
          <SuitGlyph suit="S" size={26} color="var(--color-gold-bright)" />
          <SuitGlyph suit="H" size={26} color="var(--color-crimson-bright)" />
          <SuitGlyph suit="D" size={26} color="var(--color-crimson-bright)" />
          <SuitGlyph suit="C" size={26} color="var(--color-gold-bright)" />
        </div>
        <h1 className="font-display text-5xl tracking-[0.08em] text-[var(--color-gold-bright)]">
          Bridge Master
        </h1>
        <p className="font-body text-lg italic text-[var(--color-cream-muted)]">
          Contract Bridge, by candlelight
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        <MenuButton label="New Game" primary onClick={startNewGame} />
        <MenuButton label="Tutorial" onClick={enterTutorial} />
        <MenuButton label="Settings" onClick={() => setModal('settings')} />
        <MenuButton label="Stats" onClick={() => setModal('stats')} />
      </motion.div>

      {modal === 'settings' && <SettingsPanel onClose={() => setModal(null)} />}
      {modal === 'stats' && <StatsPanel onClose={() => setModal(null)} />}
    </div>
  )
}

function MenuButton({
  label,
  onClick,
  primary,
  disabled
}: {
  label: string
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-64 rounded-full border px-6 py-3 font-display text-base tracking-wide transition-colors ${
        disabled
          ? 'cursor-not-allowed border-[var(--color-wood-700)] text-[var(--color-cream-dim)] opacity-40'
          : primary
            ? 'border-[var(--color-gold)] bg-[var(--color-amber)] text-[var(--color-ink)] hover:bg-[var(--color-amber-glow)]'
            : 'border-[var(--color-gold-dim)] bg-[var(--color-wood-800)] text-[var(--color-cream)] hover:border-[var(--color-gold)] hover:bg-[var(--color-wood-700)]'
      }`}
    >
      {label}
      {disabled && <span className="ml-2 text-xs opacity-70">(soon)</span>}
    </button>
  )
}
