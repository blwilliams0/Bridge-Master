import { AnnotatedCall, AuctionState, SEATS } from '@renderer/engine/types'
import { strainColor, strainSymbol } from './BiddingBox'

interface AuctionHistoryProps {
  auction: AuctionState
}

const SEAT_LABEL: Record<string, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

export function AuctionHistory({ auction }: AuctionHistoryProps): React.JSX.Element {
  const dealerIdx = SEATS.indexOf(auction.dealer)
  const rows: (AnnotatedCall | null)[][] = []
  let row: (AnnotatedCall | null)[] = new Array(4).fill(null)
  let seatCursor = dealerIdx
  for (const call of auction.calls) {
    row[seatCursor] = call
    seatCursor++
    if (seatCursor === 4) {
      rows.push(row)
      row = new Array(4).fill(null)
      seatCursor = 0
    }
  }
  if (row.some((c) => c !== null) || rows.length === 0) rows.push(row)

  return (
    <div className="w-64 rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-850)]/90 p-3">
      <div className="mb-1 grid grid-cols-4 gap-1 text-center font-display text-[10px] uppercase tracking-widest text-[var(--color-gold)]">
        {SEATS.map((seat) => (
          <div key={seat}>{SEAT_LABEL[seat]}</div>
        ))}
      </div>
      <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-1 text-center text-sm">
            {r.map((call, j) => (
              <div key={j} className="rounded bg-[var(--color-wood-800)]/60 py-1 text-[var(--color-cream)]">
                {call ? <CallLabel call={call} /> : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CallLabel({ call }: { call: AnnotatedCall }): React.JSX.Element {
  if (call.call.type === 'pass') return <span className="text-[var(--color-cream-dim)]">Pass</span>
  if (call.call.type === 'double') return <span className="text-[var(--color-crimson-bright)]">X</span>
  if (call.call.type === 'redouble') return <span className="text-[var(--color-crimson-bright)]">XX</span>
  const { level, strain } = call.call
  return (
    <span style={{ color: strainColor(strain) }}>
      {level}
      {strainSymbol(strain)}
    </span>
  )
}
