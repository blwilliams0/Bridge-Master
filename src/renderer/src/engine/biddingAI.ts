import { bidValue, highestBid, isCallLegal, whoseTurn } from './bidding'
import { AnnotatedCall, AuctionState, BidCall, Call, ForcingLevel, Hand, partnerOf, Seat, Suit, SUITS } from './types'

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

// ---------------------------------------------------------------------------
// Standard American bidding AI.
//
// This is a heuristic, rule-based bidder -- not a simulation/double-dummy
// engine. It covers: opening bids, responses (incl. Stayman), opener/responder
// rebids, simple competitive bidding (overcalls, takeout doubles), and a
// simplified Blackwood slam try. It intentionally favors robustness over
// completeness: any auction/hand shape not covered by a specific rule falls
// through to Pass, which is always a *legal* call, so the AI can never stall
// or produce an illegal bid even on sequences this rule set doesn't model.
// ---------------------------------------------------------------------------

type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7

function asLevel(n: number): Level {
  return Math.min(7, Math.max(1, Math.round(n))) as Level
}

function suitLengths(hand: Hand): Record<Suit, number> {
  const lengths: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0 }
  for (const c of hand) lengths[c.suit]++
  return lengths
}

/** Balanced = no void/singleton and at most one doubleton (4333, 4432, 5332). */
function isBalanced(lengths: Record<Suit, number>): boolean {
  const vals = Object.values(lengths)
  if (vals.some((v) => v <= 1)) return false
  return vals.filter((v) => v === 2).length <= 1
}

/** Longest suit; ties broken toward the higher-ranking suit (and D over C on a 4-4 minor tie). */
function chooseOpeningSuit(lengths: Record<Suit, number>): Suit {
  const order: Suit[] = ['S', 'H', 'D', 'C']
  let best = order[0]
  for (const s of order) {
    if (lengths[s] > lengths[best]) best = s
  }
  return best
}

function hasStopper(hand: Hand, suit: Suit): boolean {
  const cards = hand.filter((c) => c.suit === suit).sort((a, b) => b.rank - a.rank)
  if (cards.length === 0) return false
  if (cards[0].rank === 14) return true
  if (cards[0].rank === 13 && cards.length >= 2) return true
  if (cards[0].rank === 12 && cards.length >= 3) return true
  return false
}

function countAces(hand: Hand): number {
  return hand.filter((c) => c.rank === 14).length
}

const ACE_REPLY_STRAIN: Suit[] = ['C', 'D', 'H', 'S']
const ACE_COUNT_FROM_STRAIN: Record<Suit, number> = { C: 0, D: 1, H: 2, S: 3 }

function suitRankIndex(suit: Suit): number {
  return { C: 0, D: 1, H: 2, S: 3 }[suit]
}

/** Cheapest suit (other than `exclude`) I hold 4+ cards in, biased toward one biddable at the 1-level. */
function findNewSuitToBid(lengths: Record<Suit, number>, exclude: Suit): Suit | null {
  const order: Suit[] = ['S', 'H', 'D', 'C']
  const candidates = order.filter((s) => s !== exclude && lengths[s] >= 4)
  if (candidates.length === 0) return null
  candidates.sort((a, b) => {
    const aBiddableAt1 = suitRankIndex(a) > suitRankIndex(exclude) ? 1 : 0
    const bBiddableAt1 = suitRankIndex(b) > suitRankIndex(exclude) ? 1 : 0
    if (aBiddableAt1 !== bBiddableAt1) return bBiddableAt1 - aBiddableAt1
    return lengths[b] - lengths[a]
  })
  return candidates[0]
}

function bidLevelForNewSuit(openedSuit: Suit, newSuit: Suit): Level {
  return suitRankIndex(newSuit) > suitRankIndex(openedSuit) ? 1 : 2
}

function minLegalLevelFor(auction: AuctionState, strain: Suit | 'NT'): Level | null {
  const top = highestBid(auction)
  const topVal = top ? bidValue((top.call as BidCall).level, (top.call as BidCall).strain) : -1
  for (let level = 1; level <= 7; level++) {
    if (bidValue(level, strain) > topVal) return level as Level
  }
  return null
}

function agreedSuit(auction: AuctionState, seat: Seat): Suit | null {
  const partner = partnerOf(seat)
  for (const c of auction.calls) {
    if ((c.seat === seat || c.seat === partner) && c.call.type === 'bid' && c.call.strain !== 'NT') {
      return c.call.strain as Suit
    }
  }
  return null
}

function firstSuitBidBy(auction: AuctionState, seat: Seat): Suit | null {
  for (const c of auction.calls) {
    if (c.seat === seat && c.call.type === 'bid' && c.call.strain !== 'NT') return c.call.strain as Suit
  }
  return null
}

function tryCall(
  auction: AuctionState,
  level: number,
  strain: Suit | 'NT',
  meaning: string,
  forcing: ForcingLevel
): AnnotatedCall | null {
  const seat = whoseTurn(auction)
  const call: Call = { type: 'bid', level: asLevel(level), strain }
  if (!isCallLegal(auction, call)) return null
  return { seat, call, meaning, forcing }
}

function tryDouble(auction: AuctionState, meaning: string, forcing: ForcingLevel): AnnotatedCall | null {
  const seat = whoseTurn(auction)
  const call: Call = { type: 'double' }
  if (!isCallLegal(auction, call)) return null
  return { seat, call, meaning, forcing }
}

function passCall(auction: AuctionState): AnnotatedCall {
  return { seat: whoseTurn(auction), call: { type: 'pass' }, meaning: 'pass', forcing: 'none' }
}

// ---- Opening ----

function decideOpening(auction: AuctionState, hand: Hand, _seat: Seat): AnnotatedCall {
  const { hcp } = evaluateHand(hand)
  const lengths = suitLengths(hand)
  const balanced = isBalanced(lengths)

  if (hcp >= 22) {
    return tryCall(auction, 2, 'C', 'strong-2c-artificial', 'game') ?? passCall(auction)
  }
  if (balanced && hcp >= 20 && hcp <= 21) {
    return tryCall(auction, 2, 'NT', 'opening-2nt-balanced', 'invitational') ?? passCall(auction)
  }
  if (balanced && hcp >= 15 && hcp <= 17) {
    return tryCall(auction, 1, 'NT', 'opening-1nt-balanced', 'invitational') ?? passCall(auction)
  }
  if (hcp >= 12) {
    const suit = chooseOpeningSuit(lengths)
    return tryCall(auction, 1, suit, 'opening', 'one-round') ?? passCall(auction)
  }

  const longest = chooseOpeningSuit(lengths)
  const longestLen = lengths[longest]
  if (hcp <= 10 && longestLen >= 7) {
    return tryCall(auction, 3, longest, 'preempt', 'none') ?? passCall(auction)
  }
  if (hcp >= 5 && hcp <= 10 && longestLen === 6 && longest !== 'C') {
    return tryCall(auction, 2, longest, 'weak-two', 'none') ?? passCall(auction)
  }

  return passCall(auction)
}

// ---- Competitive: opponent opened, we haven't acted ----

function decideOvercallOrDouble(auction: AuctionState, hand: Hand, _seat: Seat, top: AnnotatedCall): AnnotatedCall {
  const openBid = top.call as BidCall
  const { hcp } = evaluateHand(hand)
  const lengths = suitLengths(hand)
  const openedSuit = openBid.strain === 'NT' ? null : (openBid.strain as Suit)

  if (openedSuit && hcp >= 12 && hcp <= 17 && lengths[openedSuit] <= 2) {
    const supportCount = SUITS.filter((s) => s !== openedSuit && lengths[s] >= 3).length
    if (supportCount >= 2) {
      const d = tryDouble(auction, 'takeout-double', 'one-round')
      if (d) return d
    }
  }

  if (hcp >= 8 && hcp <= 16) {
    const candidates = SUITS.filter((s) => s !== openedSuit && lengths[s] >= 5).sort(
      (a, b) => lengths[b] - lengths[a]
    )
    for (const suit of candidates) {
      const level = minLegalLevelFor(auction, suit)
      if (level && level <= 2) {
        const c = tryCall(auction, level, suit, 'overcall', 'none')
        if (c) return c
      }
    }
    if (isBalanced(lengths) && hcp >= 15 && hcp <= 18 && openedSuit && hasStopper(hand, openedSuit)) {
      const c = tryCall(auction, 1, 'NT', '1nt-overcall', 'invitational')
      if (c) return c
    }
  }

  return passCall(auction)
}

function respondToPartnersDouble(auction: AuctionState, hand: Hand): AnnotatedCall {
  const { hcp } = evaluateHand(hand)
  const lengths = suitLengths(hand)
  const top = highestBid(auction)
  const doubledSuit = top ? (top.call as BidCall).strain : null

  const order: Suit[] = ['S', 'H', 'D', 'C']
  const candidates = order.filter((s) => s !== doubledSuit).sort((a, b) => lengths[b] - lengths[a])
  const bestSuit = candidates[0]

  if (hcp >= 10 && isBalanced(lengths) && doubledSuit && doubledSuit !== 'NT' && hasStopper(hand, doubledSuit as Suit)) {
    const level = minLegalLevelFor(auction, 'NT')
    if (level) {
      const c = tryCall(auction, level, 'NT', 'double-response-nt', 'none')
      if (c) return c
    }
  }

  const level = minLegalLevelFor(auction, bestSuit)
  if (level && level <= 4) {
    const finalLevel = hcp >= 10 ? level + 1 : level
    const c = tryCall(auction, finalLevel, bestSuit, 'double-response', 'none') ?? tryCall(auction, level, bestSuit, 'double-response', 'none')
    if (c) return c
  }

  return passCall(auction)
}

// ---- Responses to partner's opening ----

function respondToStrong2C(auction: AuctionState, hand: Hand): AnnotatedCall {
  const { hcp } = evaluateHand(hand)
  const lengths = suitLengths(hand)
  if (hcp >= 8) {
    const order: Suit[] = ['S', 'H', 'D', 'C']
    const suit = order.filter((s) => lengths[s] >= 5).sort((a, b) => lengths[b] - lengths[a])[0]
    if (suit) {
      const c = tryCall(auction, 2, suit, 'positive-response', 'game')
      if (c) return c
    }
  }
  return tryCall(auction, 2, 'D', 'waiting-response', 'game') ?? passCall(auction)
}

function respondTo1NT(auction: AuctionState, hcp: number, lengths: Record<Suit, number>): AnnotatedCall {
  const hasMajor4 = lengths.S >= 4 || lengths.H >= 4
  const has5CardMajor = lengths.S >= 5 || lengths.H >= 5

  if (hcp <= 7) {
    if (has5CardMajor) {
      const suit = lengths.S >= 5 ? 'S' : 'H'
      return tryCall(auction, 2, suit, 'weak-signoff', 'none') ?? passCall(auction)
    }
    return passCall(auction)
  }
  if (hcp <= 9) {
    if (hasMajor4) return tryCall(auction, 2, 'C', 'stayman', 'one-round') ?? passCall(auction)
    return tryCall(auction, 2, 'NT', 'invitational', 'invitational') ?? passCall(auction)
  }
  if (hcp <= 14) {
    if (hasMajor4) return tryCall(auction, 2, 'C', 'stayman', 'game') ?? passCall(auction)
    return tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
  }
  if (hcp <= 16) {
    return tryCall(auction, 4, 'NT', 'quantitative-invite', 'invitational') ?? tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
  }
  return tryCall(auction, 6, 'NT', 'slam', 'none') ?? tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
}

function respondTo2NT(auction: AuctionState, hcp: number, lengths: Record<Suit, number>): AnnotatedCall {
  const hasMajor4 = lengths.S >= 4 || lengths.H >= 4
  if (hcp <= 3) return passCall(auction)
  if (hcp <= 8) {
    if (hasMajor4) return tryCall(auction, 3, 'C', 'stayman', 'game') ?? tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
    return tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
  }
  return tryCall(auction, 6, 'NT', 'slam', 'none') ?? tryCall(auction, 3, 'NT', 'game', 'none') ?? passCall(auction)
}

function respondToSuitOpening(
  auction: AuctionState,
  suit: Suit,
  hcp: number,
  distributionPoints: number,
  lengths: Record<Suit, number>
): AnnotatedCall {
  const isMajor = suit === 'H' || suit === 'S'
  const support = lengths[suit]
  const totalPts = hcp + distributionPoints

  if (hcp < 6) return passCall(auction)

  if (isMajor && support >= 3) {
    if (totalPts >= 13) return tryCall(auction, 4, suit, 'game-raise', 'none') ?? passCall(auction)
    if (totalPts >= 10) return tryCall(auction, 3, suit, 'limit-raise', 'invitational') ?? passCall(auction)
    return tryCall(auction, 2, suit, 'simple-raise', 'none') ?? passCall(auction)
  }

  if (hcp <= 9) {
    const newSuit = findNewSuitToBid(lengths, suit)
    if (newSuit && bidLevelForNewSuit(suit, newSuit) === 1) {
      return tryCall(auction, 1, newSuit, 'new-suit-response', 'one-round') ?? passCall(auction)
    }
    return tryCall(auction, 1, 'NT', '1nt-response', 'one-round') ?? passCall(auction)
  }

  const newSuit = findNewSuitToBid(lengths, suit)
  if (newSuit) {
    const level = bidLevelForNewSuit(suit, newSuit)
    const forcing: ForcingLevel = level >= 2 && hcp >= 13 ? 'game' : 'one-round'
    return (
      tryCall(auction, level, newSuit, level >= 2 ? '2-over-1' : 'new-suit-response', forcing) ??
      tryCall(auction, 1, 'NT', '1nt-response', 'one-round') ??
      passCall(auction)
    )
  }
  return (
    tryCall(auction, 2, 'NT', '2nt-response', 'invitational') ??
    tryCall(auction, 1, 'NT', '1nt-response', 'one-round') ??
    passCall(auction)
  )
}

function respondToPreempt(auction: AuctionState, partnerBid: BidCall, hcp: number, lengths: Record<Suit, number>): AnnotatedCall {
  const fit = partnerBid.strain !== 'NT' ? lengths[partnerBid.strain as Suit] : 0
  if (hcp >= 16 || (fit >= 3 && hcp >= 10)) {
    const gameLevel = partnerBid.strain === 'S' || partnerBid.strain === 'H' ? 4 : partnerBid.strain === 'NT' ? 3 : 5
    const level = Math.max(gameLevel, partnerBid.level + 1)
    return tryCall(auction, level, partnerBid.strain, 'preempt-raise', 'none') ?? passCall(auction)
  }
  return passCall(auction)
}

function decideResponse(auction: AuctionState, hand: Hand, partnerActive: AnnotatedCall[]): AnnotatedCall {
  const partnerLast = partnerActive[partnerActive.length - 1]
  const { hcp, distributionPoints } = evaluateHand(hand)
  const lengths = suitLengths(hand)

  if (partnerLast.meaning === 'strong-2c-artificial') {
    return respondToStrong2C(auction, hand)
  }

  if (partnerLast.call.type !== 'bid') return passCall(auction)
  const partnerBid = partnerLast.call as BidCall

  if (partnerBid.strain === 'NT' && partnerBid.level === 1) return respondTo1NT(auction, hcp, lengths)
  if (partnerBid.strain === 'NT' && partnerBid.level === 2) return respondTo2NT(auction, hcp, lengths)
  if (partnerBid.strain !== 'NT' && partnerBid.level === 1) {
    return respondToSuitOpening(auction, partnerBid.strain as Suit, hcp, distributionPoints, lengths)
  }
  if (partnerLast.meaning === 'weak-two' || partnerLast.meaning === 'preempt') {
    return respondToPreempt(auction, partnerBid, hcp, lengths)
  }
  return passCall(auction)
}

// ---- Rebids / continuations ----

function replyToBlackwood(auction: AuctionState, hand: Hand): AnnotatedCall {
  const aces = countAces(hand)
  const strain = ACE_REPLY_STRAIN[aces % 4]
  return tryCall(auction, 5, strain, 'blackwood-reply', 'none') ?? passCall(auction)
}

function replyToStayman(auction: AuctionState, lengths: Record<Suit, number>, askLevel: number): AnnotatedCall {
  if (lengths.H >= 4) return tryCall(auction, askLevel, 'H', 'stayman-reply', 'none') ?? passCall(auction)
  if (lengths.S >= 4) return tryCall(auction, askLevel, 'S', 'stayman-reply', 'none') ?? passCall(auction)
  return tryCall(auction, askLevel, 'D', 'stayman-reply-no-major', 'none') ?? passCall(auction)
}

function interpretBlackwoodReply(
  auction: AuctionState,
  hand: Hand,
  seat: Seat,
  replyBid: BidCall,
  hcp: number
): AnnotatedCall {
  const suit = agreedSuit(auction, seat) ?? firstSuitBidBy(auction, seat) ?? 'NT'
  const partnerAces = replyBid.strain !== 'NT' ? ACE_COUNT_FROM_STRAIN[replyBid.strain as Suit] : 0
  const totalAces = countAces(hand) + partnerAces
  if (totalAces >= 4 && hcp >= 22) {
    return tryCall(auction, 7, suit, 'grand-slam', 'none') ?? tryCall(auction, 6, suit, 'small-slam', 'none') ?? passCall(auction)
  }
  if (totalAces >= 3) {
    return tryCall(auction, 6, suit, 'small-slam', 'none') ?? passCall(auction)
  }
  return tryCall(auction, 5, suit, 'signoff-after-blackwood', 'none') ?? passCall(auction)
}

function interpretStaymanReply(
  auction: AuctionState,
  replyBid: BidCall,
  hcp: number,
  lengths: Record<Suit, number>
): AnnotatedCall {
  if (replyBid.strain === 'D' || replyBid.strain === 'C') {
    if (hcp >= 10) return tryCall(auction, 3, 'NT', 'game-after-stayman', 'none') ?? passCall(auction)
    return tryCall(auction, 2, 'NT', 'invite-after-stayman', 'invitational') ?? passCall(auction)
  }
  const haveFit = lengths[replyBid.strain as Suit] >= 4
  if (haveFit) {
    const level = hcp >= 10 ? 4 : 3
    return tryCall(auction, level, replyBid.strain, 'major-fit-found', 'none') ?? passCall(auction)
  }
  return tryCall(auction, 3, 'NT', 'no-fit-fallback', 'none') ?? passCall(auction)
}

function openerRebid(
  auction: AuctionState,
  openedSuit: Suit,
  resp: BidCall,
  hcp: number,
  lengths: Record<Suit, number>,
  distributionPoints: number
): AnnotatedCall {
  const myPoints = hcp + distributionPoints
  const isMajorFit = (openedSuit === 'H' || openedSuit === 'S') && resp.strain === openedSuit

  if (isMajorFit) {
    const partnerEstimate = resp.level === 2 ? 8 : resp.level === 3 ? 11 : 15
    const combinedEstimate = myPoints + partnerEstimate

    if (combinedEstimate >= 33 && hcp >= 18) {
      return tryCall(auction, 4, 'NT', 'blackwood-ask', 'none') ?? tryCall(auction, 4, openedSuit, 'game-raise', 'none') ?? passCall(auction)
    }
    if (hcp >= 19 || combinedEstimate >= 26) {
      return tryCall(auction, 4, openedSuit, 'game-raise', 'none') ?? passCall(auction)
    }
    if (hcp >= 16) {
      return tryCall(auction, 3, openedSuit, 'invitational-raise', 'invitational') ?? passCall(auction)
    }
    return passCall(auction)
  }

  if (hcp >= 19) return tryCall(auction, 3, 'NT', 'strong-rebid-nt', 'none') ?? passCall(auction)
  if (hcp >= 16) return tryCall(auction, 2, 'NT', 'invitational-rebid', 'invitational') ?? passCall(auction)
  if (lengths[openedSuit] >= 6) {
    const minLevel = Math.max(2, resp.level)
    return tryCall(auction, minLevel, openedSuit, 'minimum-rebid', 'none') ?? passCall(auction)
  }
  return passCall(auction)
}

function decideRebid(
  auction: AuctionState,
  hand: Hand,
  seat: Seat,
  myActive: AnnotatedCall[],
  partnerActive: AnnotatedCall[]
): AnnotatedCall {
  const myLast = myActive[myActive.length - 1]
  const partnerLast = partnerActive[partnerActive.length - 1] ?? null
  const { hcp, distributionPoints } = evaluateHand(hand)
  const lengths = suitLengths(hand)

  if (partnerLast?.meaning === 'blackwood-ask') {
    return replyToBlackwood(auction, hand)
  }

  if (partnerLast?.meaning === 'stayman' && partnerLast.call.type === 'bid') {
    return replyToStayman(auction, lengths, (partnerLast.call as BidCall).level)
  }

  if (myLast.meaning === 'blackwood-ask' && partnerLast?.call.type === 'bid') {
    return interpretBlackwoodReply(auction, hand, seat, partnerLast.call as BidCall, hcp)
  }

  if (myLast.meaning === 'stayman' && partnerLast?.call.type === 'bid') {
    return interpretStaymanReply(auction, partnerLast.call as BidCall, hcp, lengths)
  }

  if (
    myActive.length === 1 &&
    myLast.call.type === 'bid' &&
    (myLast.call as BidCall).level === 1 &&
    (myLast.call as BidCall).strain !== 'NT' &&
    partnerLast?.call.type === 'bid'
  ) {
    return openerRebid(
      auction,
      (myLast.call as BidCall).strain as Suit,
      partnerLast.call as BidCall,
      hcp,
      lengths,
      distributionPoints
    )
  }

  return passCall(auction)
}

// ---- Top-level dispatch ----

function decideBid(auction: AuctionState, hand: Hand, seat: Seat): AnnotatedCall {
  const partner = partnerOf(seat)
  const myCalls = auction.calls.filter((c) => c.seat === seat)
  const partnerCalls = auction.calls.filter((c) => c.seat === partner)
  const myActive = myCalls.filter((c) => c.call.type !== 'pass')
  const partnerActive = partnerCalls.filter((c) => c.call.type !== 'pass')
  const top = highestBid(auction)

  if (myActive.length === 0) {
    const partnerLastActive = partnerActive[partnerActive.length - 1] ?? null

    if (partnerLastActive?.call.type === 'double') {
      return respondToPartnersDouble(auction, hand)
    }
    if (partnerLastActive?.call.type === 'bid') {
      return decideResponse(auction, hand, partnerActive)
    }
    if (!top) {
      return decideOpening(auction, hand, seat)
    }
    return decideOvercallOrDouble(auction, hand, seat, top)
  }

  return decideRebid(auction, hand, seat, myActive, partnerActive)
}

/**
 * Chooses a call for `seat` using Standard American conventions. Every
 * internal branch already falls back to Pass (always a legal call while the
 * auction is open), and this wrapper adds a defense-in-depth safety net so
 * that any unforeseen bug in the rules above degrades to a safe Pass rather
 * than crashing the game or stalling the auction.
 */
export function chooseBid(auction: AuctionState, hand: Hand, seat: Seat): AnnotatedCall {
  try {
    return decideBid(auction, hand, seat)
  } catch {
    return { seat, call: { type: 'pass' }, meaning: 'pass (fallback)', forcing: 'none' }
  }
}
