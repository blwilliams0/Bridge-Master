export default function Overview(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Bridge is a trick-taking card game for four players, split into two partnerships sitting
        across the table from one another:{' '}
        <strong className="text-[var(--color-gold-bright)]">North &amp; South</strong> versus{' '}
        <strong className="text-[var(--color-gold-bright)]">East &amp; West</strong>.
      </p>

      <div className="mx-auto grid w-72 grid-cols-3 grid-rows-3 items-center justify-items-center gap-3 rounded-2xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-6">
        <div />
        <SeatBadge label="North" partnership="NS" />
        <div />
        <SeatBadge label="West" partnership="EW" />
        <div className="h-16 w-16 rounded-full border border-[var(--color-gold-dim)] bg-[var(--color-wood-850)]" />
        <SeatBadge label="East" partnership="EW" />
        <div />
        <SeatBadge label="South" partnership="NS" />
        <div />
      </div>

      <p>
        All 52 cards are dealt out, 13 to each player. On every trick, all four players play one
        card in turn; whoever plays the highest card of the suit led (or the highest trump, if one
        is played) wins the trick and leads the next one. Your side's goal is to win at least as
        many tricks as your partnership committed to during the auction.
      </p>
      <p>
        Every hand has two phases: first the <strong>auction</strong>, where the four players bid
        to set the contract, then <strong>play</strong>, where all 13 tricks are fought over. The
        next few lessons walk through both.
      </p>
    </div>
  )
}

function SeatBadge({ label, partnership }: { label: string; partnership: 'NS' | 'EW' }): React.JSX.Element {
  const color = partnership === 'NS' ? 'var(--color-amber-glow)' : 'var(--color-crimson-bright)'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-3 w-3 rounded-full" style={{ background: color }} />
      <span className="font-display text-xs tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
