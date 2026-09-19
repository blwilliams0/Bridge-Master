import { useMemo } from 'react'
import { createHandSetup, playOutHand } from '@renderer/engine/gameState'
import { chooseBid } from '@renderer/engine/biddingAI'
import { chooseCard } from '@renderer/engine/playAI'
import { seededRng } from '@renderer/engine/cards'
import { dummySeat, openingLeader } from '@renderer/engine/play'
import { Seat, SEATS } from '@renderer/engine/types'
import { strainColor, strainSymbol } from '@renderer/components/bidding/BiddingBox'
import { MiniHand } from '../MiniHand'
import { useGameStore } from '@renderer/store/gameStore'

const SEAT_LABEL: Record<Seat, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

// A fixed seed so this walkthrough is the same deal every time someone opens the lesson.
const EXAMPLE_SEED = 20260919

export default function GuidedExample(): React.JSX.Element {
  const startNewGame = useGameStore((s) => s.startNewGame)

  const outcome = useMemo(() => {
    const setup = createHandSetup(1, seededRng(EXAMPLE_SEED))
    return playOutHand(setup, chooseBid, chooseCard)
  }, [])

  const { setup, auction, contract, playState, score } = outcome

  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>Let's walk through one complete deal, from the cards in front of each player to the final score.</p>

      <section>
        <h3 className="font-display text-base text-[var(--color-gold-bright)]">The Deal</h3>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {SEATS.map((seat) => (
            <div key={seat} className="rounded-lg border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-2">
              <div className="mb-1 font-display text-xs uppercase tracking-wide text-[var(--color-cream-muted)]">
                {SEAT_LABEL[seat]}
              </div>
              <MiniHand cards={setup.deal[seat]} width={30} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base text-[var(--color-gold-bright)]">The Auction</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {auction.calls.map((call, i) => (
            <div key={i} className="rounded-md border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] px-2.5 py-1 text-sm">
              <span className="text-[var(--color-cream-muted)]">{SEAT_LABEL[call.seat]}:</span>{' '}
              {call.call.type === 'bid' ? (
                <span style={{ color: strainColor(call.call.strain) }}>
                  {call.call.level}
                  {strainSymbol(call.call.strain)}
                </span>
              ) : (
                <span className="capitalize text-[var(--color-cream)]">{call.call.type}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {contract && playState && score ? (
        <>
          <section>
            <h3 className="font-display text-base text-[var(--color-gold-bright)]">The Contract</h3>
            <p className="mt-1">
              Three passes set the final contract: <strong>{SEAT_LABEL[contract.declarer]}</strong>{' '}
              declares{' '}
              <span style={{ color: strainColor(contract.strain) }}>
                {contract.level}
                {strainSymbol(contract.strain)}
              </span>
              . {SEAT_LABEL[dummySeat(contract)]}'s hand becomes the dummy, laid face-up after{' '}
              {SEAT_LABEL[openingLeader(contract)]}'s opening lead.
            </p>
          </section>

          <section>
            <h3 className="font-display text-base text-[var(--color-gold-bright)]">The Play</h3>
            <p className="mt-1">All 13 tricks are played out. When the dust settles:</p>
            <p className="mt-2 font-display text-lg text-[var(--color-amber-glow)]">
              {playState.tricksWonNS} tricks for North/South, {playState.tricksWonEW} for East/West.
            </p>
          </section>

          <section>
            <h3 className="font-display text-base text-[var(--color-gold-bright)]">The Score</h3>
            <p className="mt-1">
              {score.madeContract ? 'Contract made' : 'Contract defeated'} &mdash;{' '}
              <span
                className={
                  score.score >= 0 ? 'text-[var(--color-amber-glow)]' : 'text-[var(--color-crimson-bright)]'
                }
              >
                {score.score >= 0 ? '+' : ''}
                {score.score}
              </span>{' '}
              for {contract.declarer === 'N' || contract.declarer === 'S' ? 'North/South' : 'East/West'}.
            </p>
          </section>
        </>
      ) : (
        <p className="italic text-[var(--color-cream-muted)]">
          Nobody had enough to open this time, so the hand was thrown in with no play -- that's a
          normal, if uneventful, outcome in bridge.
        </p>
      )}

      <button
        type="button"
        onClick={startNewGame}
        className="mt-2 w-fit self-center rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-8 py-2.5 font-display text-sm tracking-wide text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
      >
        Play It Yourself
      </button>
    </div>
  )
}
