import { describe, expect, it } from 'vitest'
import { createAuction, makeCall, whoseTurn } from '../bidding'
import { chooseBid } from '../biddingAI'
import { Call, Card, Hand, Seat } from '../types'

function c(rank: Card['rank'], suit: Card['suit']): Card {
  return { suit, rank }
}

function pass(): Call {
  return { type: 'pass' }
}

/** Drives the auction forward one seat by asking the AI to call for whoever's turn it is. */
function aiCall(
  auction: ReturnType<typeof createAuction>,
  hands: Record<Seat, Hand>
): { auction: ReturnType<typeof createAuction>; annotated: ReturnType<typeof chooseBid> } {
  const seat = whoseTurn(auction)
  const annotated = chooseBid(auction, hands[seat], seat)
  return {
    auction: makeCall(auction, annotated.call, {
      meaning: annotated.meaning,
      forcing: annotated.forcing
    }),
    annotated
  }
}

describe('biddingAI: Standard American scenarios', () => {
  it('opens 1NT with a balanced 16-count and raises straight to 3NT with 11 and no 4-card major', () => {
    const north: Hand = [
      c(14, 'S'),
      c(13, 'S'),
      c(4, 'S'),
      c(3, 'S'),
      c(13, 'H'),
      c(5, 'H'),
      c(2, 'H'),
      c(12, 'D'),
      c(7, 'D'),
      c(3, 'D'),
      c(14, 'C'),
      c(9, 'C'),
      c(4, 'C')
    ]
    const south: Hand = [
      c(11, 'S'),
      c(8, 'S'),
      c(6, 'S'),
      c(11, 'H'),
      c(9, 'H'),
      c(7, 'H'),
      c(14, 'D'),
      c(8, 'D'),
      c(5, 'D'),
      c(2, 'D'),
      c(13, 'C'),
      c(12, 'C'),
      c(5, 'C')
    ]

    let auction = createAuction('N')
    const opening = chooseBid(auction, north, 'N')
    expect(opening.call).toEqual({ type: 'bid', level: 1, strain: 'NT' })
    auction = makeCall(auction, opening.call, {
      meaning: opening.meaning,
      forcing: opening.forcing
    })

    auction = makeCall(auction, pass()) // East passes

    const response = chooseBid(auction, south, 'S')
    expect(response.call).toEqual({ type: 'bid', level: 3, strain: 'NT' })
  })

  it('responds Stayman with 5-4 in the majors and invitational-or-better values over a 1NT opening', () => {
    const north: Hand = [
      c(14, 'S'),
      c(13, 'S'),
      c(4, 'S'),
      c(3, 'S'),
      c(13, 'H'),
      c(5, 'H'),
      c(2, 'H'),
      c(12, 'D'),
      c(7, 'D'),
      c(3, 'D'),
      c(14, 'C'),
      c(9, 'C'),
      c(4, 'C')
    ]
    const south: Hand = [
      c(13, 'S'),
      c(12, 'S'),
      c(5, 'S'),
      c(4, 'S'),
      c(11, 'H'),
      c(6, 'H'),
      c(5, 'H'),
      c(3, 'H'),
      c(14, 'D'),
      c(7, 'D'),
      c(2, 'D'),
      c(9, 'C'),
      c(6, 'C')
    ]

    let auction = createAuction('N')
    const opening = chooseBid(auction, north, 'N')
    expect(opening.call).toEqual({ type: 'bid', level: 1, strain: 'NT' })
    auction = makeCall(auction, opening.call, {
      meaning: opening.meaning,
      forcing: opening.forcing
    })
    auction = makeCall(auction, pass())

    const response = chooseBid(auction, south, 'S')
    expect(response.call).toEqual({ type: 'bid', level: 2, strain: 'C' })
    expect(response.meaning).toBe('stayman')
  })

  it('reaches slam via Blackwood with a big major-suit fit and enough combined aces', () => {
    const north: Hand = [
      c(14, 'S'),
      c(13, 'S'),
      c(12, 'S'),
      c(6, 'S'),
      c(5, 'S'),
      c(4, 'S'),
      c(14, 'H'),
      c(12, 'H'),
      c(3, 'H'),
      c(14, 'D'),
      c(11, 'D'),
      c(2, 'D'),
      c(9, 'C')
    ]
    const south: Hand = [
      c(9, 'S'),
      c(8, 'S'),
      c(7, 'S'),
      c(3, 'S'),
      c(14, 'H'),
      c(11, 'H'),
      c(5, 'H'),
      c(13, 'D'),
      c(12, 'D'),
      c(4, 'D'),
      c(13, 'C'),
      c(6, 'C'),
      c(5, 'C')
    ]
    const east: Hand = []
    const west: Hand = []
    const hands: Record<Seat, Hand> = { N: north, E: east, S: south, W: west }

    let auction = createAuction('N')
    let step = aiCall(auction, hands)
    auction = step.auction
    expect(step.annotated.call).toEqual({ type: 'bid', level: 1, strain: 'S' }) // opener: 1S

    auction = makeCall(auction, pass()) // East passes

    step = aiCall(auction, hands)
    auction = step.auction
    expect(step.annotated.call).toEqual({ type: 'bid', level: 4, strain: 'S' }) // responder: game raise

    auction = makeCall(auction, pass()) // West passes

    step = aiCall(auction, hands)
    auction = step.auction
    expect(step.annotated.call).toEqual({ type: 'bid', level: 4, strain: 'NT' }) // opener: Blackwood ask
    expect(step.annotated.meaning).toBe('blackwood-ask')

    auction = makeCall(auction, pass()) // East passes

    step = aiCall(auction, hands)
    auction = step.auction
    expect(step.annotated.call).toEqual({ type: 'bid', level: 5, strain: 'D' }) // responder: 1 ace shown

    auction = makeCall(auction, pass()) // West passes

    step = aiCall(auction, hands)
    expect(step.annotated.call).toEqual({ type: 'bid', level: 6, strain: 'S' }) // opener: bids the small slam
  })

  it('passes throughout with a hand well below opening values and no preemptive shape', () => {
    const hand: Hand = [
      c(9, 'S'),
      c(7, 'S'),
      c(4, 'S'),
      c(10, 'H'),
      c(8, 'H'),
      c(6, 'H'),
      c(9, 'D'),
      c(6, 'D'),
      c(4, 'D'),
      c(3, 'D'),
      c(8, 'C'),
      c(5, 'C'),
      c(2, 'C')
    ]
    const auction = createAuction('N')
    const call = chooseBid(auction, hand, 'N')
    expect(call.call).toEqual({ type: 'pass' })
  })

  it('never returns an illegal call across many auction/hand combinations', () => {
    // Not a full fuzz run (that lives in fuzz.test.ts) -- just a quick direct
    // sanity check that arbitrary hands never produce an illegal first call.
    const suits: Card['suit'][] = ['C', 'D', 'H', 'S']
    const ranks: Card['rank'][] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    const deck: Card[] = suits.flatMap((s) => ranks.map((r) => ({ suit: s, rank: r })))
    for (let i = 0; i < 20; i++) {
      const hand = deck.slice(i, i + 13)
      if (hand.length < 13) continue
      const auction = createAuction('N')
      const call = chooseBid(auction, hand, 'N')
      expect(['pass', 'bid'].includes(call.call.type)).toBe(true)
    }
  })
})
