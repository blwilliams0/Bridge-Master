import { isCallLegal } from '@renderer/engine/bidding'
import { AuctionState, Call, Strain } from '@renderer/engine/types'
import { SuitGlyph } from '@renderer/components/table/SuitGlyph'
import { strainColor } from '@renderer/lib/cardDisplay'

const STRAINS: Strain[] = ['C', 'D', 'H', 'S', 'NT']
const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const

interface BiddingBoxProps {
  auction: AuctionState
  disabled: boolean
  onCall: (call: Call) => void
}

export function BiddingBox({ auction, disabled, onCall }: BiddingBoxProps): React.JSX.Element {
  const legal = (call: Call): boolean => !disabled && isCallLegal(auction, call)

  return (
    <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-850)]/95 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.55)]">
      <div className="mb-2 grid grid-cols-5 gap-1">
        {LEVELS.map((level) =>
          STRAINS.map((strain) => {
            const call: Call = { type: 'bid', level, strain }
            const ok = legal(call)
            return (
              <button
                key={`${level}${strain}`}
                type="button"
                disabled={!ok}
                aria-label={`${level} ${strain === 'NT' ? 'notrump' : { C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[strain]}`}
                onClick={() => onCall(call)}
                className={`flex h-9 w-12 items-center justify-center gap-0.5 rounded-md border font-display text-xs transition-colors ${
                  ok
                    ? 'border-[var(--color-gold)] bg-[var(--color-wood-700)] text-[var(--color-cream)] hover:bg-[var(--color-amber-dim)] hover:text-[var(--color-ink)]'
                    : 'cursor-not-allowed border-[var(--color-wood-700)] bg-[var(--color-wood-800)]/60 text-[var(--color-cream-dim)] opacity-40'
                }`}
              >
                <span>{level}</span>
                {strain === 'NT' ? (
                  <span className="text-xs">NT</span>
                ) : (
                  <SuitGlyph suit={strain} size={13} color={strainColor(strain)} />
                )}
              </button>
            )
          })
        )}
      </div>
      <div className="flex gap-1.5">
        <CallButton
          label="Pass"
          call={{ type: 'pass' }}
          legal={legal({ type: 'pass' })}
          onCall={onCall}
        />
        <CallButton
          label="Dbl"
          call={{ type: 'double' }}
          legal={legal({ type: 'double' })}
          onCall={onCall}
        />
        <CallButton
          label="Rdbl"
          call={{ type: 'redouble' }}
          legal={legal({ type: 'redouble' })}
          onCall={onCall}
        />
      </div>
    </div>
  )
}

function CallButton({
  label,
  call,
  legal,
  onCall
}: {
  label: string
  call: Call
  legal: boolean
  onCall: (call: Call) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={!legal}
      onClick={() => onCall(call)}
      className={`h-10 flex-1 rounded-md border font-display text-sm tracking-wide transition-colors ${
        legal
          ? 'border-[var(--color-gold)] bg-[var(--color-leather-800)] text-[var(--color-gold-bright)] hover:bg-[var(--color-amber-dim)] hover:text-[var(--color-ink)]'
          : 'cursor-not-allowed border-[var(--color-wood-700)] bg-[var(--color-wood-800)]/60 text-[var(--color-cream-dim)] opacity-40'
      }`}
    >
      {label}
    </button>
  )
}
