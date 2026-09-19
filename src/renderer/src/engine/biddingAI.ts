import { AnnotatedCall, AuctionState, Hand, Seat, SUITS } from './types'

export interface HandEvaluation {
  hcp: number
  distributionPoints: number
}

const HONOR_POINTS: Record<number, number> = { 14: 4, 13: 3, 12: 2, 11: 1 }

/** High card points (A=4,K=3,Q=2,J=1) plus distribution points (void=3, singleton=2, doubleton=1). */
export function evaluateHand(hand: Hand): HandEvaluation {
  let hcp = 0
  for (const card of hand) {
    hcp += HONOR_POINTS[card.rank] ?? 0
  }

  let distributionPoints = 0
  for (const suit of SUITS) {
    const length = hand.filter((c) => c.suit === suit).length
    if (length === 0) distributionPoints += 3
    else if (length === 1) distributionPoints += 2
    else if (length === 2) distributionPoints += 1
  }

  return { hcp, distributionPoints }
}

/**
 * Phase 1 stub: always passes. Standard American opening/response/rebid/
 * competitive-bidding logic is layered in during Phase 3 -- this signature
 * is the seam that logic will plug into without restructuring callers.
 * Every real implementation must preserve the property that this function
 * never throws and never returns an illegal call; Pass is always the safe
 * fallback for an auction shape no rule matches.
 */
export function chooseBid(_auction: AuctionState, _hand: Hand, seat: Seat): AnnotatedCall {
  return { seat, call: { type: 'pass' }, meaning: 'pass (AI stub)', forcing: 'none' }
}
