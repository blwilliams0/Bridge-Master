import { AnimatePresence } from 'framer-motion'
import { Contract, Hand as HandModel, Seat } from '@renderer/engine/types'
import { dummySeat, legalPlays } from '@renderer/engine/play'
import { whoseTurn } from '@renderer/engine/bidding'
import { controllerOf, HUMAN_SEAT, useGameStore } from '@renderer/store/gameStore'
import { Hand } from './Hand'
import { TrickArea } from './TrickArea'
import { BiddingBox } from '@renderer/components/bidding/BiddingBox'
import { AuctionHistory } from '@renderer/components/bidding/AuctionHistory'
import { ContractBanner } from '@renderer/components/scoring/ContractBanner'
import { ScoreSummaryModal } from '@renderer/components/scoring/ScoreSummaryModal'

const SEAT_LABEL: Record<Seat, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

export function Table(): React.JSX.Element {
  const {
    setup,
    auction,
    contract,
    playState,
    phase,
    score,
    cumulativeScore,
    lastCompletedTrick,
    humanBid,
    humanPlay,
    startNextHand
  } = useGameStore()

  if (!setup) return <></>

  const handFor = (seat: Seat): HandModel => (playState ? playState.hands[seat] : setup.deal[seat])

  const faceUp = (seat: Seat): boolean => {
    if (seat === HUMAN_SEAT) return true
    if (playState && contract && contract !== null && playState.dummyRevealed) {
      return seat === dummySeat(contract as Contract)
    }
    return false
  }

  const playableFor = (seat: Seat) => {
    if (!playState || !contract) return []
    if (playState.nextToPlay !== seat) return []
    if (controllerOf(contract as Contract, seat) !== HUMAN_SEAT) return []
    return legalPlays(playState, seat)
  }

  const onPlayFor = (seat: Seat) => {
    if (!playState || !contract) return undefined
    if (playState.nextToPlay !== seat) return undefined
    if (controllerOf(contract as Contract, seat) !== HUMAN_SEAT) return undefined
    return humanPlay
  }

  const trickCards = lastCompletedTrick ? lastCompletedTrick.trick.cards : playState?.currentTrick ?? []
  const trickWinner = lastCompletedTrick ? lastCompletedTrick.winner : null

  return (
    <div className="flex h-full w-full">
      <div
        className="relative flex h-full flex-1 flex-col items-center justify-between overflow-hidden py-6"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--color-wood-800) 0%, var(--color-wood-950) 78%)'
        }}
      >
        <WoodGrainOverlay />

        <div className="z-10">
          <Hand
            seat="N"
            hand={handFor('N')}
            faceUp={faceUp('N')}
            playableCards={playableFor('N')}
            onPlay={onPlayFor('N')}
            orientation="horizontal"
            label={dummyTag('N', contract)}
          />
        </div>

        <div className="z-10 flex w-full flex-1 items-center justify-between px-10">
          <Hand
            seat="W"
            hand={handFor('W')}
            faceUp={faceUp('W')}
            playableCards={playableFor('W')}
            onPlay={onPlayFor('W')}
            orientation="vertical"
            label={dummyTag('W', contract)}
          />

          <div className="flex flex-col items-center gap-4">
            {contract && phase !== 'passed-out' && <ContractBanner contract={contract as Contract} />}
            <TrickArea cards={trickCards} winner={trickWinner} />
          </div>

          <Hand
            seat="E"
            hand={handFor('E')}
            faceUp={faceUp('E')}
            playableCards={playableFor('E')}
            onPlay={onPlayFor('E')}
            orientation="vertical"
            label={dummyTag('E', contract)}
          />
        </div>

        <div className="z-10 flex flex-col items-center gap-3">
          <Hand
            seat="S"
            hand={handFor('S')}
            faceUp={faceUp('S')}
            playableCards={playableFor('S')}
            onPlay={onPlayFor('S')}
            orientation="horizontal"
            label={dummyTag('S', contract)}
          />
        </div>

        {phase === 'passed-out' && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
            <div className="rounded-2xl border border-[var(--color-gold)] bg-[var(--color-wood-850)] px-10 py-8 text-center shadow-2xl">
              <h2 className="font-display text-2xl text-[var(--color-gold-bright)]">Hand Passed Out</h2>
              <p className="mt-2 text-[var(--color-cream-muted)]">No one opened the bidding.</p>
              <button
                type="button"
                onClick={startNextHand}
                className="mt-5 rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-8 py-2.5 font-display text-sm text-[var(--color-ink)] hover:bg-[var(--color-amber-glow)]"
              >
                Next Hand
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {phase === 'scoring' && score && (
            <ScoreSummaryModal score={score} cumulative={cumulativeScore} onNextHand={startNextHand} />
          )}
        </AnimatePresence>
      </div>

      {phase === 'bidding' && auction && (
        <div className="flex w-80 shrink-0 flex-col items-center gap-3 border-l border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
          <AuctionHistory auction={auction} />
          <BiddingBox auction={auction} disabled={whoseTurn(auction) !== HUMAN_SEAT} onCall={humanBid} />
        </div>
      )}
    </div>
  )
}

function dummyTag(seat: Seat, contract: Contract | null | undefined): string {
  if (contract && seat === dummySeat(contract)) return `${SEAT_LABEL[seat]} (Dummy)`
  if (contract && seat === contract.declarer) return `${SEAT_LABEL[seat]} (Declarer)`
  return SEAT_LABEL[seat]
}

function WoodGrainOverlay(): React.JSX.Element {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden>
      <defs>
        <pattern id="woodgrain" width="180" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q45 5 90 20 T180 20" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
          <path d="M0 8 Q45 -5 90 8 T180 8" stroke="var(--color-gold)" strokeWidth="0.6" fill="none" />
          <path d="M0 32 Q45 20 90 32 T180 32" stroke="var(--color-gold)" strokeWidth="0.6" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woodgrain)" />
    </svg>
  )
}
