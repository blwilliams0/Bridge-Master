import { describe, expect, it } from 'vitest'
import { createDeck, dealHands, seededRng, shuffle } from '../cards'
import { SEATS } from '../types'

describe('createDeck', () => {
  it('has 52 unique cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
    const labels = new Set(deck.map((c) => `${c.suit}${c.rank}`))
    expect(labels.size).toBe(52)
  })
})

describe('shuffle', () => {
  it('is deterministic given the same seeded RNG', () => {
    const deck = createDeck()
    const a = shuffle(deck, seededRng(42))
    const b = shuffle(deck, seededRng(42))
    expect(a).toEqual(b)
  })

  it('produces a different order than the input (statistically, with a real seed)', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck, seededRng(7))
    expect(shuffled).not.toEqual(deck)
    expect(shuffled).toHaveLength(52)
  })
})

describe('dealHands', () => {
  it('deals 13 cards to each seat with no overlap', () => {
    const deal = dealHands(seededRng(1))
    for (const seat of SEATS) {
      expect(deal[seat]).toHaveLength(13)
    }
    const allCards = SEATS.flatMap((seat) => deal[seat])
    const labels = new Set(allCards.map((c) => `${c.suit}${c.rank}`))
    expect(labels.size).toBe(52)
  })

  it('is deterministic given the same seed', () => {
    const a = dealHands(seededRng(99))
    const b = dealHands(seededRng(99))
    expect(a).toEqual(b)
  })
})
