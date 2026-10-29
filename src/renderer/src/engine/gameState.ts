import { createAuction, isAuctionOver, makeCall, resolveAuction, whoseTurn } from './bidding'
import { dealHands, RNG } from './cards'
import { initPlayState, isPlayComplete, playCard } from './play'
import { scoreHand } from './scoring'
import {
  AnnotatedCall,
  AuctionResult,
  AuctionState,
  Card,
  Contract,
  Deal,
  HandScore,
  HandSetup,
  partnershipOf,
  PlayState,
  Seat,
  SEATS,
  Vulnerability
} from './types'

const DEALER_CYCLE: Seat[] = SEATS
const VULNERABILITY_CYCLE: Vulnerability[] = ['None', 'NS', 'EW', 'Both']

/** Standard 16-board duplicate dealer rotation. */
export function dealerForBoard(boardNumber: number): Seat {
  return DEALER_CYCLE[(boardNumber - 1) % 4]
}

/** Standard 16-board duplicate vulnerability rotation. */
export function vulnerabilityForBoard(boardNumber: number): Vulnerability {
  const index = (boardNumber - 1 + Math.floor((boardNumber - 1) / 4)) % 4
  return VULNERABILITY_CYCLE[index]
}

export function createHandSetup(boardNumber: number, rng?: RNG): HandSetup {
  return {
    boardNumber,
    dealer: dealerForBoard(boardNumber),
    vulnerability: vulnerabilityForBoard(boardNumber),
    deal: dealHands(rng)
  }
}

export type ChooseBidFn = (auction: AuctionState, hand: Deal[Seat], seat: Seat) => AnnotatedCall
export type ChooseCardFn = (state: PlayState, seat: Seat) => Card

export interface HandOutcome {
  setup: HandSetup
  auction: AuctionState
  contract: AuctionResult
  playState: PlayState | null
  score: HandScore | null
}

const MAX_CALLS = 200

function runAuction(setup: HandSetup, chooseBid: ChooseBidFn): AuctionState {
  let auction = createAuction(setup.dealer)
  let guard = 0
  while (!isAuctionOver(auction)) {
    if (guard++ > MAX_CALLS) {
      throw new Error('Auction did not terminate within the safety cap -- bidding logic bug')
    }
    const seat = whoseTurn(auction)
    const annotated = chooseBid(auction, setup.deal[seat], seat)
    auction = makeCall(auction, annotated.call, {
      meaning: annotated.meaning,
      forcing: annotated.forcing
    })
  }
  return auction
}

function runPlay(contract: Contract, setup: HandSetup, chooseCard: ChooseCardFn): PlayState {
  let playState = initPlayState(contract, setup.deal)
  let guard = 0
  while (!isPlayComplete(playState)) {
    if (guard++ > 52) {
      throw new Error('Play did not terminate within the safety cap -- play logic bug')
    }
    const seat = playState.nextToPlay
    const card = chooseCard(playState, seat)
    playState = playCard(playState, seat, card)
  }
  return playState
}

/** Orchestrates one full hand: auction -> (if not passed out) play -> score. */
export function playOutHand(
  setup: HandSetup,
  chooseBid: ChooseBidFn,
  chooseCard: ChooseCardFn
): HandOutcome {
  const auction = runAuction(setup, chooseBid)
  const contract = resolveAuction(auction)

  if (!contract) {
    return { setup, auction, contract: null, playState: null, score: null }
  }

  const playState = runPlay(contract, setup, chooseCard)
  const declarerPartnership = partnershipOf(contract.declarer)
  const tricksTaken = declarerPartnership === 'NS' ? playState.tricksWonNS : playState.tricksWonEW
  const score = scoreHand(contract, tricksTaken, setup.vulnerability)

  return { setup, auction, contract, playState, score }
}
