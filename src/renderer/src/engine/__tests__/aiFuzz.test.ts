import { describe, expect, it } from 'vitest'
import { createAuction, isAuctionOver, isCallLegal, makeCall, resolveAuction, whoseTurn } from '../bidding'
import { chooseBid } from '../biddingAI'
import { seededRng } from '../cards'
import { createHandSetup } from '../gameState'
import { initPlayState, isPlayComplete, isPlayLegal, playCard } from '../play'
import { chooseCard, PlayDifficulty } from '../playAI'
import { scoreHand } from '../scoring'
import { partnershipOf } from '../types'

const ITERATIONS = 220
const MAX_CALLS = 200
const MAX_PLAYS = 60
const DIFFICULTIES: PlayDifficulty[] = ['beginner', 'club-player']

describe('fuzz: real bidding/play AI never crashes, stalls, or acts illegally', () => {
  it('runs many randomized deals through the real AI end-to-end', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const rng = seededRng(5000 + i)
      const setup = createHandSetup((i % 16) + 1, rng)
      const difficulty = DIFFICULTIES[i % DIFFICULTIES.length]

      let auction = createAuction(setup.dealer)
      let callGuard = 0
      while (!isAuctionOver(auction)) {
        expect(callGuard++).toBeLessThan(MAX_CALLS)
        const seat = whoseTurn(auction)
        const annotated = chooseBid(auction, setup.deal[seat], seat)
        expect(isCallLegal(auction, annotated.call)).toBe(true)
        auction = makeCall(auction, annotated.call, { meaning: annotated.meaning, forcing: annotated.forcing })
      }

      const contract = resolveAuction(auction)
      if (!contract) continue

      let playState = initPlayState(contract, setup.deal)
      let playGuard = 0
      while (!isPlayComplete(playState)) {
        expect(playGuard++).toBeLessThan(MAX_PLAYS)
        const seat = playState.nextToPlay
        const card = chooseCard(playState, seat, difficulty)
        expect(isPlayLegal(playState, seat, card)).toBe(true)
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
