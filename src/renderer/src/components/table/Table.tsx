import { AnimatePresence } from 'framer-motion'
import { Card as CardModel, Contract, Hand as HandModel, Seat } from '@renderer/engine/types'
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
    startNextHand,
    returnHome
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

  const playableFor = (seat: Seat): CardModel[] => {
    if (phase !== 'play' || lastCompletedTrick || !playState || !contract) return []
    if (playState.nextToPlay !== seat) return []
    if (controllerOf(contract as Contract, seat) !== HUMAN_SEAT) return []
    return legalPlays(playState, seat)
  }

  const onPlayFor = (seat: Seat): ((card: CardModel) => void) | undefined => {
    if (phase !== 'play' || lastCompletedTrick || !playState || !contract) return undefined
    if (playState.nextToPlay !== seat) return undefined
    if (controllerOf(contract as Contract, seat) !== HUMAN_SEAT) return undefined
    return humanPlay
  }

  const trickCards = lastCompletedTrick
    ? lastCompletedTrick.trick.cards
    : (playState?.currentTrick ?? [])
  const trickWinner = lastCompletedTrick ? lastCompletedTrick.winner : null
  const activeSeat = phase === 'bidding' && auction ? whoseTurn(auction) : playState?.nextToPlay
  const turnMessage = lastCompletedTrick
    ? `${SEAT_LABEL[lastCompletedTrick.winner]} wins the trick`
    : phase === 'bidding' && activeSeat
      ? activeSeat === HUMAN_SEAT
        ? 'Your turn to bid'
        : `${SEAT_LABEL[activeSeat]} is bidding`
      : phase === 'play' && activeSeat && contract
        ? controllerOf(contract, activeSeat) === HUMAN_SEAT
          ? activeSeat === HUMAN_SEAT
            ? 'Your turn — select a highlighted card'
            : 'Play from dummy — select a highlighted card'
          : `${SEAT_LABEL[activeSeat]} is playing${activeSeat === HUMAN_SEAT ? ' (you are dummy)' : ''}`
        : 'Hand complete'

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] px-5 py-3 text-sm text-[var(--color-cream)]">
        <button
          type="button"
          onClick={returnHome}
          className="rounded-full border border-[var(--color-gold-dim)] px-4 py-1 hover:border-[var(--color-gold)]"
        >
          Menu
        </button>
        <span>
          Board {setup.boardNumber} · Dealer: {SEAT_LABEL[setup.dealer]} · Vulnerable:{' '}
          {setup.vulnerability}
        </span>
        <span>
          Score: N/S {cumulativeScore.NS} · E/W {cumulativeScore.EW}
        </span>
      </header>
      <div className="flex min-h-0 flex-1">
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
              {contract && phase !== 'passed-out' && (
                <ContractBanner
                  contract={contract}
                  tricksWon={
                    playState
                      ? contract.declarer === 'N' || contract.declarer === 'S'
                        ? playState.tricksWonNS
                        : playState.tricksWonEW
                      : undefined
                  }
                />
              )}
              <TrickArea cards={trickCards} winner={trickWinner} />
              <p role="status" className="max-w-64 text-center text-sm text-[var(--color-cream)]">
                {turnMessage}
              </p>
              {playState && (
                <p className="text-sm text-[var(--color-cream-muted)]">
                  Tricks: N/S {playState.tricksWonNS} · E/W {playState.tricksWonEW}
                </p>
              )}
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
                <h2 className="font-display text-2xl text-[var(--color-gold-bright)]">
                  Hand Passed Out
                </h2>
                <p className="mt-2 text-[var(--color-cream-muted)]">No one opened the bidding.</p>
                <button
                  type="button"
                  onClick={startNextHand}
                  className="mt-5 rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-8 py-2.5 font-display text-sm text-[var(--color-ink)] hover:bg-[var(--color-amber-glow)]"
                >
                  Next Hand
                </button>
                <button
                  type="button"
                  onClick={returnHome}
                  className="mt-3 block w-full text-[var(--color-cream-muted)]"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {phase === 'scoring' && score && (
              <ScoreSummaryModal
                score={score}
                cumulative={cumulativeScore}
                onNextHand={startNextHand}
                onHome={returnHome}
              />
            )}
          </AnimatePresence>
        </div>

        {phase === 'bidding' && auction && (
          <div className="flex w-80 shrink-0 flex-col items-center gap-3 overflow-y-auto border-l border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
            <AuctionHistory auction={auction} />
            <BiddingBox
              auction={auction}
              disabled={whoseTurn(auction) !== HUMAN_SEAT}
              onCall={humanBid}
            />
          </div>
        )}
      </div>
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
          <path
            d="M0 20 Q45 5 90 20 T180 20"
            stroke="var(--color-gold)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 8 Q45 -5 90 8 T180 8"
            stroke="var(--color-gold)"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M0 32 Q45 20 90 32 T180 32"
            stroke="var(--color-gold)"
            strokeWidth="0.6"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woodgrain)" />
    </svg>
  )
}
