export type Suit = 'C' | 'D' | 'H' | 'S'

export type Strain = Suit | 'NT'

export const SUITS: Suit[] = ['C', 'D', 'H', 'S']

/** 2-10 = spot cards, 11 = J, 12 = Q, 13 = K, 14 = A */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

export interface Card {
  suit: Suit
  rank: Rank
}

export type Seat = 'N' | 'E' | 'S' | 'W'

export const SEATS: Seat[] = ['N', 'E', 'S', 'W']

export type Partnership = 'NS' | 'EW'

export function partnershipOf(seat: Seat): Partnership {
  return seat === 'N' || seat === 'S' ? 'NS' : 'EW'
}

export function partnerOf(seat: Seat): Seat {
  switch (seat) {
    case 'N':
      return 'S'
    case 'S':
      return 'N'
    case 'E':
      return 'W'
    case 'W':
      return 'E'
  }
}

export function leftHandOpponent(seat: Seat): Seat {
  const idx = SEATS.indexOf(seat)
  return SEATS[(idx + 1) % 4]
}

export function nextSeat(seat: Seat): Seat {
  return leftHandOpponent(seat)
}

export function otherPartnership(p: Partnership): Partnership {
  return p === 'NS' ? 'EW' : 'NS'
}

export type Vulnerability = 'None' | 'NS' | 'EW' | 'Both'

export function isVulnerable(vulnerability: Vulnerability, partnership: Partnership): boolean {
  return vulnerability === 'Both' || vulnerability === partnership
}

export type Hand = Card[]

export type Deal = Record<Seat, Hand>

// ---- Bidding ----

export interface BidCall {
  type: 'bid'
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  strain: Strain
}

export interface PassCall {
  type: 'pass'
}

export interface DoubleCall {
  type: 'double'
}

export interface RedoubleCall {
  type: 'redouble'
}

export type Call = BidCall | PassCall | DoubleCall | RedoubleCall

export type ForcingLevel = 'none' | 'invitational' | 'one-round' | 'game'

export interface AnnotatedCall {
  seat: Seat
  call: Call
  meaning: string
  forcing: ForcingLevel
}

export interface AuctionState {
  dealer: Seat
  calls: AnnotatedCall[]
}

export type Doubling = 'none' | 'doubled' | 'redoubled'

export interface Contract {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  strain: Strain
  doubling: Doubling
  declarer: Seat
}

/** Result of a resolved auction: either a contract, or null meaning the hand was passed out. */
export type AuctionResult = Contract | null

// ---- Play ----

export interface PlayedCard {
  seat: Seat
  card: Card
}

export interface Trick {
  leader: Seat
  cards: PlayedCard[]
}

export interface PlayState {
  contract: Contract
  hands: Deal
  trumpSuit: Suit | null
  tricks: Trick[]
  currentTrick: PlayedCard[]
  nextToPlay: Seat
  tricksWonNS: number
  tricksWonEW: number
  dummyRevealed: boolean
  playedCards: Card[]
}

// ---- Scoring ----

export interface HandScore {
  /** Positive favors declarer's partnership, negative favors defenders. */
  score: number
  madeContract: boolean
  tricksTaken: number
  contract: Contract
  vulnerability: Vulnerability
}

// ---- Game orchestration ----

export interface HandSetup {
  boardNumber: number
  dealer: Seat
  vulnerability: Vulnerability
  deal: Deal
}

export type GamePhase = 'bidding' | 'play' | 'scoring' | 'passed-out'
