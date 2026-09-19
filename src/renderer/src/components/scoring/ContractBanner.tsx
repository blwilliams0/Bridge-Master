import { Contract } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/components/bidding/BiddingBox'

const SEAT_LABEL: Record<string, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

interface ContractBannerProps {
  contract: Contract
  tricksWon?: number
}

export function ContractBanner({ contract, tricksWon }: ContractBannerProps): React.JSX.Element {
  const doubleLabel = contract.doubling === 'doubled' ? ' X' : contract.doubling === 'redoubled' ? ' XX' : ''
  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--color-gold-dim)] bg-[var(--color-wood-850)]/90 px-5 py-2 font-display text-sm text-[var(--color-cream)] shadow-lg">
      <span>
        {contract.level}
        <span style={{ color: strainColor(contract.strain) }}>{strainSymbol(contract.strain)}</span>
        {doubleLabel}
      </span>
      <span className="text-[var(--color-gold)]">by {SEAT_LABEL[contract.declarer]}</span>
      {tricksWon !== undefined && (
        <span className="text-[var(--color-cream-muted)]">
          {tricksWon}/{contract.level + 6} tricks
        </span>
      )}
    </div>
  )
}
