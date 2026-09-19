import { describe, expect, it } from 'vitest'
import { createAuction, isAuctionOver, legalCalls, makeCall, resolveAuction, whoseTurn } from '../bidding'
import { seededRng } from '../cards'
import { createHandSetup } from '../gameState'
import { initPlayState, isPlayComplete, legalPlays, playCard } from '../play'
import { scoreHand } from '../scoring'
import { partnershipOf } from '../types'

const ITERATIONS = 1200
const MAX_CALLS = 200
const MAX_PLAYS = 60

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

describe('fuzz: full random-legal hand simulation', () => {
  it('never throws and always terminates across many random deals/auctions/plays', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const rng = seededRng(1000 + i)
      const setup = createHandSetup((i % 16) + 1, rng)

      let auction = createAuction(setup.dealer)
      let callGuard = 0
      while (!isAuctionOver(auction)) {
        expect(callGuard++).toBeLessThan(MAX_CALLS)
        whoseTurn(auction) // sanity: throws if auction state is malformed
        const options = legalCalls(auction)
        expect(options.length).toBeGreaterThan(0)
        const call = pick(options, rng)
        auction = makeCall(auction, call)
      }

      const contract = resolveAuction(auction)
      if (!contract) {
        continue // passed out -- nothing further to simulate for this board
      }

      let playState = initPlayState(contract, setup.deal)
      let playGuard = 0
      while (!isPlayComplete(playState)) {
        expect(playGuard++).toBeLessThan(MAX_PLAYS)
        const seat = playState.nextToPlay
        const options = legalPlays(playState, seat)
        expect(options.length).toBeGreaterThan(0)
        const card = pick(options, rng)
        playState = playCard(playState, seat, card)
      }

      const declarerPartnership = partnershipOf(contract.declarer)
      const tricksTaken =
        declarerPartnership === 'NS' ? playState.tricksWonNS : playState.tricksWonEW
      expect(tricksTaken).toBeGreaterThanOrEqual(0)
      expect(tricksTaken).toBeLessThanOrEqual(13)

      const score = scoreHand(contract, tricksTaken, setup.vulnerability)
      expect(Number.isFinite(score.score)).toBe(true)
    }
  })
})
