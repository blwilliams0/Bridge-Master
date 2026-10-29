import { SuitGlyph } from '@renderer/components/table/SuitGlyph'

export default function NotrumpVsSuit(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Once the auction settles, the final contract is either <strong>notrump</strong> or a{' '}
        <strong>suit contract</strong> with a named trump suit. Each suits a different kind of hand.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
          <h3 className="font-display text-base text-[var(--color-gold-bright)]">Notrump</h3>
          <p className="mt-2 text-sm text-[var(--color-cream-muted)]">
            No safety net -- the highest card of the suit led always wins. Best for balanced hands
            rich in high cards, where you can simply count on winning your aces, kings, and
            established long-suit tricks.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base text-[var(--color-gold-bright)]">
              Suit contract
            </h3>
            <SuitGlyph suit="S" size={16} />
          </div>
          <p className="mt-2 text-sm text-[var(--color-cream-muted)]">
            One suit becomes trump -- any trump beats any card of another suit. Great when a
            partnership has an eight-plus card fit: short suits elsewhere can be ruffed (trumped)
            for extra tricks a flat, balanced hand could never manage.
          </p>
        </div>
      </div>

      <p>
        That&apos;s why finding an eight-card major-suit fit is often worth more than settling for
        notrump: the ability to ruff turns shortness into a weapon instead of a liability.
      </p>
    </div>
  )
}
