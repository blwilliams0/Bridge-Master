import {
  AnnotatedCall,
  AuctionResult,
  AuctionState,
  BidCall,
  Call,
  Contract,
  Doubling,
  ForcingLevel,
  partnershipOf,
  Seat,
  SEATS,
  Strain
} from './types'

const STRAIN_ORDER: Record<Strain, number> = { C: 0, D: 1, H: 2, S: 3, NT: 4 }

export function bidValue(level: number, strain: Strain): number {
  return level * 5 + STRAIN_ORDER[strain]
}

export function outranks(a: BidCall, b: BidCall): boolean {
  return bidValue(a.level, a.strain) > bidValue(b.level, b.strain)
}

export function createAuction(dealer: Seat): AuctionState {
  return { dealer, calls: [] }
}

export function whoseTurn(auction: AuctionState): Seat {
  const startIdx = SEATS.indexOf(auction.dealer)
  return SEATS[(startIdx + auction.calls.length) % 4]
}

/** The most recent bid call made in the auction, if any. */
export function highestBid(auction: AuctionState): AnnotatedCall | null {
  for (let i = auction.calls.length - 1; i >= 0; i--) {
    if (auction.calls[i].call.type === 'bid') return auction.calls[i]
  }
  return null
}

/** The index of the most recent bid call, or -1 if none. */
function highestBidIndex(auction: AuctionState): number {
  for (let i = auction.calls.length - 1; i >= 0; i--) {
    if (auction.calls[i].call.type === 'bid') return i
  }
  return -1
}

/** Current doubling status of the currently-active bid (cleared by any subsequent bid). */
export function currentDoubling(auction: AuctionState): Doubling {
  const idx = highestBidIndex(auction)
  if (idx === -1) return 'none'
  let doubling: Doubling = 'none'
  for (let i = idx + 1; i < auction.calls.length; i++) {
    const type = auction.calls[i].call.type
    if (type === 'double') doubling = 'doubled'
    else if (type === 'redouble') doubling = 'redoubled'
  }
  return doubling
}

/**
 * The auction is over once four calls have been made and the last three are
 * all passes -- this covers both the "opening bid then three passes" case and
 * the "four passes with no bid at all" pass-out case.
 */
export function isAuctionOver(auction: AuctionState): boolean {
  const { calls } = auction
  if (calls.length < 4) return false
  const lastThree = calls.slice(-3)
  return lastThree.every((c) => c.call.type === 'pass')
}

export function isPassedOut(auction: AuctionState): boolean {
  return isAuctionOver(auction) && highestBid(auction) === null
}

export function isCallLegal(auction: AuctionState, call: Call): boolean {
  if (isAuctionOver(auction)) return false
  const seat = whoseTurn(auction)

  if (call.type === 'pass') return true

  if (call.type === 'bid') {
    const top = highestBid(auction)
    if (!top) return true
    return outranks(call, top.call as BidCall)
  }

  const top = highestBid(auction)
  const doubling = currentDoubling(auction)

  if (call.type === 'double') {
    if (!top) return false
    if (partnershipOf(top.seat) === partnershipOf(seat)) return false // can't double partner's bid
    return doubling === 'none'
  }

  if (call.type === 'redouble') {
    if (!top) return false
    if (partnershipOf(top.seat) !== partnershipOf(seat)) return false // only the doubled side may redouble
    return doubling === 'doubled'
  }

  return false
}

export function legalCalls(auction: AuctionState): Call[] {
  if (isAuctionOver(auction)) return []
  const calls: Call[] = [{ type: 'pass' }]

  if (isCallLegal(auction, { type: 'double' })) calls.push({ type: 'double' })
  if (isCallLegal(auction, { type: 'redouble' })) calls.push({ type: 'redouble' })

  const top = highestBid(auction)
  const topValue = top ? bidValue((top.call as BidCall).level, (top.call as BidCall).strain) : -1
  const strains: Strain[] = ['C', 'D', 'H', 'S', 'NT']
  for (let level = 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7; level <= 7; level++) {
    for (const strain of strains) {
      if (bidValue(level, strain) > topValue) {
        calls.push({ type: 'bid', level, strain })
      }
    }
  }
  return calls
}

/**
 * Attaches meaning/forcing metadata to a call. Phase 1 stub: generic labels only.
 * Real Standard American semantics are layered on in biddingAI.ts (Phase 3) by
 * passing richer annotations into makeCall via the `annotation` param.
 */
export function defaultAnnotation(call: Call): { meaning: string; forcing: ForcingLevel } {
  switch (call.type) {
    case 'pass':
      return { meaning: 'pass', forcing: 'none' }
    case 'double':
      return { meaning: 'double', forcing: 'none' }
    case 'redouble':
      return { meaning: 'redouble', forcing: 'none' }
    case 'bid':
      return { meaning: 'natural', forcing: 'none' }
  }
}

export function makeCall(
  auction: AuctionState,
  call: Call,
  annotation?: { meaning: string; forcing: ForcingLevel }
): AuctionState {
  if (!isCallLegal(auction, call)) {
    throw new Error(`Illegal call: ${JSON.stringify(call)}`)
  }
  const seat = whoseTurn(auction)
  const meta = annotation ?? defaultAnnotation(call)
  const annotated: AnnotatedCall = { seat, call, ...meta }
  return { dealer: auction.dealer, calls: [...auction.calls, annotated] }
}

/**
 * Resolves the final contract from a completed auction, determining declarer
 * by scanning forward for the FIRST player in the winning partnership to have
 * named the winning strain -- not simply whoever made the final bid.
 */
export function resolveAuction(auction: AuctionState): AuctionResult {
  if (!isAuctionOver(auction)) {
    throw new Error('Cannot resolve an auction that is not yet complete')
  }
  const top = highestBid(auction)
  if (!top) return null // passed out

  const bid = top.call as BidCall
  const winningPartnership = partnershipOf(top.seat)

  let declarer: Seat | null = null
  for (const annotated of auction.calls) {
    if (
      annotated.call.type === 'bid' &&
      annotated.call.strain === bid.strain &&
      partnershipOf(annotated.seat) === winningPartnership
    ) {
      declarer = annotated.seat
      break
    }
  }
  if (!declarer) {
    // Should be unreachable: the top bid itself always satisfies the scan.
    declarer = top.seat
  }

  return {
    level: bid.level,
    strain: bid.strain,
    doubling: currentDoubling(auction),
    declarer
  }
}

export type { Contract }
