import { createAuction, makeCall } from '@renderer/engine/bidding'
import { chooseBid } from '@renderer/engine/biddingAI'
import { AuctionState, BidCall, Card as CardModel, Rank, Suit } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/lib/cardDisplay'
import { MiniHand } from '../MiniHand'

function c(suit: Suit, rank: Rank): CardModel {
  return { suit, rank }
}

// South opens (dealer); West passes so North, South's partner, responds uncontested.
function auctionAfterOpening(openingCall: BidCall): AuctionState {
  let auction = createAuction('S')
  auction = makeCall(auction, openingCall, { meaning: 'opening', forcing: 'one-round' })
  auction = makeCall(auction, { type: 'pass' })
  return auction
}

const MAJOR_RAISE_RESPONDER: CardModel[] = [
  c('H', 13),
  c('H', 9),
  c('H', 6),
  c('H', 4),
  c('S', 8),
  c('S', 5),
  c('D', 12),
  c('D', 7),
  c('D', 3),
  c('C', 10),
  c('C', 9),
  c('C', 6),
  c('C', 2)
]

const STAYMAN_RESPONDER: CardModel[] = [
  c('S', 13),
  c('S', 9),
  c('S', 7),
  c('S', 4),
  c('H', 12),
  c('H', 11),
  c('H', 6),
  c('H', 4),
  c('D', 14),
  c('D', 8),
  c('D', 3),
  c('C', 6),
  c('C', 5)
]

export default function ResponsesStayman(): React.JSX.Element {
  const raiseAuction = auctionAfterOpening({ type: 'bid', level: 1, strain: 'H' })
  const raiseCall = chooseBid(raiseAuction, MAJOR_RAISE_RESPONDER, 'N').call as BidCall

  const staymanAuction = auctionAfterOpening({ type: 'bid', level: 1, strain: 'NT' })
  const staymanCall = chooseBid(staymanAuction, STAYMAN_RESPONDER, 'N').call as BidCall

  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Once partner opens, responder describes their own hand in reply. A few common responses:
        raise partner&apos;s major with three-plus card support, bid a new suit to keep the auction
        alive, or respond 1NT with a weak hand and no fit.
      </p>

      <ResponseExample
        title="Raising partner's major"
        openerBid="1♥"
        hand={MAJOR_RAISE_RESPONDER}
        call={raiseCall}
        note="Four-card heart support and enough combined strength for game -- raise straight to 4♥."
      />

      <p>
        <strong className="text-[var(--color-gold-bright)]">Stayman</strong> is a conventional 2♣
        response to a 1NT opening -- it doesn&apos;t show clubs at all. It asks partner: &quot;do
        you have a 4-card major?&quot; so the partnership can find a major-suit fit instead of
        settling for notrump.
      </p>

      <ResponseExample
        title="Asking with Stayman"
        openerBid="1NT"
        hand={STAYMAN_RESPONDER}
        call={staymanCall}
        note="4-4 in the majors is exactly the shape Stayman is built to uncover."
      />
    </div>
  )
}

function ResponseExample({
  title,
  openerBid,
  hand,
  call,
  note
}: {
  title: string
  openerBid: string
  hand: CardModel[]
  call: BidCall
  note: string
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base text-[var(--color-gold-bright)]">{title}</h3>
        <div className="flex items-center gap-2 font-display text-sm text-[var(--color-cream-muted)]">
          <span>Partner opens {openerBid}, responds with</span>
          <span
            className="flex items-center gap-1 text-lg"
            style={{ color: strainColor(call.strain) }}
          >
            <span>{call.level}</span>
            <span>{strainSymbol(call.strain)}</span>
          </span>
        </div>
      </div>
      <MiniHand cards={hand} width={42} />
      <p className="mt-3 text-sm text-[var(--color-cream-muted)]">{note}</p>
    </div>
  )
}
