import { cardsEqual } from './cards'
import {
  Card,
  Contract,
  Deal,
  Hand,
  leftHandOpponent,
  partnerOf,
  PlayedCard,
  PlayState,
  RANKS,
  Seat,
  Suit,
  Trick
} from './types'

export function trumpSuitOf(contract: Contract): Suit | null {
  return contract.strain === 'NT' ? null : contract.strain
}

export function openingLeader(contract: Contract): Seat {
  return leftHandOpponent(contract.declarer)
}

export function dummySeat(contract: Contract): Seat {
  return partnerOf(contract.declarer)
}

export function initPlayState(contract: Contract, hands: Deal): PlayState {
  return {
    contract,
    hands: {
      N: hands.N.slice(),
      E: hands.E.slice(),
      S: hands.S.slice(),
      W: hands.W.slice()
    },
    trumpSuit: trumpSuitOf(contract),
    tricks: [],
    currentTrick: [],
    nextToPlay: openingLeader(contract),
    tricksWonNS: 0,
    tricksWonEW: 0,
    dummyRevealed: false,
    playedCards: []
  }
}

/** Cards a seat may legally play: must follow the suit led if able, otherwise any card. */
export function legalPlays(state: PlayState, seat: Seat): Card[] {
  const hand = state.hands[seat]
  if (state.currentTrick.length === 0) return hand.slice()
  const ledSuit = state.currentTrick[0].card.suit
  const followingSuit = hand.filter((c) => c.suit === ledSuit)
  return followingSuit.length > 0 ? followingSuit : hand.slice()
}

export function isPlayLegal(state: PlayState, seat: Seat, card: Card): boolean {
  if (seat !== state.nextToPlay) return false
  const hand = state.hands[seat]
  if (!hand.some((c) => cardsEqual(c, card))) return false
  return legalPlays(state, seat).some((c) => cardsEqual(c, card))
}

export function trickWinner(cards: PlayedCard[], trumpSuit: Suit | null): Seat {
  let winner = cards[0]
  for (let i = 1; i < cards.length; i++) {
    const c = cards[i]
    const cIsTrump = trumpSuit !== null && c.card.suit === trumpSuit
    const winnerIsTrump = trumpSuit !== null && winner.card.suit === trumpSuit
    if (cIsTrump && !winnerIsTrump) {
      winner = c
    } else if (cIsTrump && winnerIsTrump) {
      if (c.card.rank > winner.card.rank) winner = c
    } else if (!cIsTrump && !winnerIsTrump) {
      if (c.card.suit === winner.card.suit && c.card.rank > winner.card.rank) winner = c
    }
    // else: c is a non-trump discard against a trump winner -- winner unchanged.
  }
  return winner.seat
}

export function playCard(state: PlayState, seat: Seat, card: Card): PlayState {
  if (!isPlayLegal(state, seat, card)) {
    throw new Error(`Illegal play: ${seat} cannot play ${JSON.stringify(card)}`)
  }

  const isOpeningLead = state.tricks.length === 0 && state.currentTrick.length === 0

  const hands: Deal = {
    N: state.hands.N.slice(),
    E: state.hands.E.slice(),
    S: state.hands.S.slice(),
    W: state.hands.W.slice()
  }
  hands[seat] = hands[seat].filter((c) => !cardsEqual(c, card))

  const currentTrick: PlayedCard[] = [...state.currentTrick, { seat, card }]
  const playedCards = [...state.playedCards, card]
  const dummyRevealed = state.dummyRevealed || isOpeningLead

  if (currentTrick.length < 4) {
    return {
      ...state,
      hands,
      currentTrick,
      playedCards,
      dummyRevealed,
      nextToPlay: leftHandOpponent(seat)
    }
  }

  const winnerSeat = trickWinner(currentTrick, state.trumpSuit)
  const trick: Trick = { leader: currentTrick[0].seat, cards: currentTrick }
  const wonByNS = winnerSeat === 'N' || winnerSeat === 'S'

  return {
    ...state,
    hands,
    playedCards,
    dummyRevealed,
    tricks: [...state.tricks, trick],
    currentTrick: [],
    nextToPlay: winnerSeat,
    tricksWonNS: state.tricksWonNS + (wonByNS ? 1 : 0),
    tricksWonEW: state.tricksWonEW + (wonByNS ? 0 : 1)
  }
}

export function isPlayComplete(state: PlayState): boolean {
  return state.tricksWonNS + state.tricksWonEW === 13
}

/**
 * Cards of `suit` that are unseen: not yet played, and not held in any of the
 * given visible hands (e.g. the AI's own hand and, once revealed, dummy's).
 * Used by play heuristics to reason about what opponents might hold.
 */
export function remainingCards(suit: Suit, playedCards: Card[], visibleHands: Hand[]): Card[] {
  const accountedFor = new Set<number>()
  for (const c of playedCards) if (c.suit === suit) accountedFor.add(c.rank)
  for (const h of visibleHands) for (const c of h) if (c.suit === suit) accountedFor.add(c.rank)
  return RANKS.filter((r) => !accountedFor.has(r)).map((rank) => ({ suit, rank }))
}
