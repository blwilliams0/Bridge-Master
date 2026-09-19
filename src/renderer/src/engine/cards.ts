import { Card, Deal, Hand, RANKS, Rank, Seat, SEATS, Suit, SUITS } from './types'

export type RNG = () => number

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

/**
 * Fisher-Yates shuffle. Accepts an injectable RNG (returning a float in [0,1))
 * so tests can seed deterministic shuffles; defaults to Math.random.
 */
export function shuffle<T>(items: T[], rng: RNG = Math.random): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Deals a freshly shuffled deck of 52 cards into 13-card hands for N/E/S/W. */
export function dealHands(rng: RNG = Math.random): Deal {
  const shuffled = shuffle(createDeck(), rng)
  const deal = {} as Deal
  SEATS.forEach((seat: Seat, seatIndex: number) => {
    deal[seat] = shuffled.slice(seatIndex * 13, seatIndex * 13 + 13)
  })
  return deal
}

export function sortHand(hand: Hand): Hand {
  const suitOrder: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 }
  return hand
    .slice()
    .sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit] || b.rank - a.rank)
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank
}

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    case 14:
      return 'A'
    default:
      return String(rank)
  }
}

export const SUIT_SYMBOL: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣'
}

export function cardLabel(card: Card): string {
  return `${rankLabel(card.rank)}${SUIT_SYMBOL[card.suit]}`
}

/** Simple mulberry32-style seeded PRNG for deterministic tests. */
export function seededRng(seed: number): RNG {
  let state = seed >>> 0
  return function next(): number {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
