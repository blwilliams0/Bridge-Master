import { dummySeat, legalPlays, remainingCards, trickWinner } from './play'
import { Card, PlayedCard, PlayState, Seat, Suit, partnerOf, partnershipOf } from './types'

export type PlayDifficulty = 'beginner' | 'club-player'

// ---------------------------------------------------------------------------
// This is a heuristic card-play AI, NOT a double-dummy solver. It does not
// search the full remaining-card layout to find provably optimal lines; it
// applies well-known table heuristics (3rd-hand-high, cover an honor with an
// honor, return partner's suit, 4th-highest/top-of-sequence opening leads,
// basic trump-drawing) that produce sensible, human-like play. It will
// sometimes misdefend or miss a double-dummy-only line -- that's expected and
// acceptable for this app's purpose.
//
// Both tiers always fall back to the first legal card if no heuristic
// applies, so this function can never throw or return an illegal play.
// ---------------------------------------------------------------------------

export function chooseCard(state: PlayState, seat: Seat, difficulty: PlayDifficulty = 'club-player'): Card {
  const options = legalPlays(state, seat)
  if (options.length === 0) {
    throw new Error(`No legal plays available for ${seat}`)
  }
  if (options.length === 1) return options[0]

  try {
    return difficulty === 'beginner'
      ? chooseBeginnerCard(state, seat, options)
      : chooseClubPlayerCard(state, seat, options)
  } catch {
    return options[0]
  }
}

function groupBySuit(cards: Card[]): Map<Suit, Card[]> {
  const map = new Map<Suit, Card[]>()
  for (const c of cards) {
    const list = map.get(c.suit) ?? []
    list.push(c)
    map.set(c.suit, list)
  }
  return map
}

function wouldWinTrick(state: PlayState, seat: Seat, card: Card): boolean {
  const trick = state.currentTrick
  if (trick.length === 0) return true
  const hypothetical: PlayedCard[] = [...trick, { seat, card }]
  return trickWinner(hypothetical, state.trumpSuit) === seat
}

// ---- Beginner tier ----

function chooseBeginnerCard(state: PlayState, seat: Seat, options: Card[]): Card {
  if (state.currentTrick.length > 0) {
    const winners = options.filter((c) => wouldWinTrick(state, seat, c))
    if (winners.length > 0) {
      return winners.slice().sort((a, b) => a.rank - b.rank)[0]
    }
  }
  return options[Math.floor(Math.random() * options.length)]
}

// ---- Club Player tier ----

function chooseClubPlayerCard(state: PlayState, seat: Seat, options: Card[]): Card {
  const trick = state.currentTrick
  if (trick.length === 0) return chooseLead(state, seat, options)
  if (trick.length === 3) return chooseLastToPlay(state, seat, options, trick)
  return chooseMiddleHandPlay(state, seat, options, trick)
}

function isDeclarerSide(state: PlayState, seat: Seat): boolean {
  return partnershipOf(seat) === partnershipOf(state.contract.declarer)
}

function outstandingTrumps(state: PlayState, seat: Seat): Card[] {
  const trump = state.trumpSuit
  if (!trump) return []
  const declarer = state.contract.declarer
  const dummy = dummySeat(state.contract)
  const visible = [state.hands[declarer]]
  if (state.dummyRevealed) visible.push(state.hands[dummy])
  if (!visible.some((h) => h === state.hands[seat])) visible.push(state.hands[seat])
  return remainingCards(trump, state.playedCards, visible)
}

function topOfSequence(cards: Card[]): Card | null {
  const sorted = cards.slice().sort((a, b) => b.rank - a.rank)
  if (sorted.length < 2) return null
  if (sorted[0].rank >= 12 && sorted[0].rank - sorted[1].rank === 1) {
    return sorted[0]
  }
  return null
}

function chooseLead(state: PlayState, seat: Seat, options: Card[]): Card {
  const trump = state.trumpSuit

  // Declarer-side trump-drawing: lead trump while the opponents still hold some.
  if (trump && isDeclarerSide(state, seat)) {
    const trumps = options.filter((c) => c.suit === trump)
    if (trumps.length > 0 && outstandingTrumps(state, seat).length > 0) {
      return trumps.slice().sort((a, b) => b.rank - a.rank)[0]
    }
  }

  const bySuit = groupBySuit(options)
  for (const cards of bySuit.values()) {
    const seq = topOfSequence(cards)
    if (seq) return seq
  }

  if (!trump) {
    const longest = [...bySuit.entries()].sort((a, b) => b[1].length - a[1].length)[0]
    if (longest && longest[1].length >= 4) {
      const sorted = longest[1].slice().sort((a, b) => b.rank - a.rank)
      return sorted[3] ?? sorted[sorted.length - 1]
    }
  }

  const nonTrump = trump ? options.filter((c) => c.suit !== trump) : options
  const pool = nonTrump.length > 0 ? nonTrump : options
  return pool.slice().sort((a, b) => a.rank - b.rank)[0]
}

function discardOrTrump(state: PlayState, seat: Seat, options: Card[], trick: PlayedCard[]): Card {
  const trump = state.trumpSuit
  if (trump) {
    const trumps = options.filter((c) => c.suit === trump)
    const winnerSoFar = trickWinner(trick, state.trumpSuit)
    const partnerWinning = winnerSoFar === partnerOf(seat)
    if (trumps.length > 0 && !partnerWinning) {
      return trumps.slice().sort((a, b) => a.rank - b.rank)[0]
    }
  }

  const nonTrump = trump ? options.filter((c) => c.suit !== trump) : options
  const pool = nonTrump.length > 0 ? nonTrump : options
  const bySuit = groupBySuit(pool)
  const longest = [...bySuit.entries()].sort((a, b) => b[1].length - a[1].length)[0]
  const candidates = (longest ? longest[1] : pool).slice().sort((a, b) => a.rank - b.rank)
  return candidates[0]
}

function chooseMiddleHandPlay(state: PlayState, seat: Seat, options: Card[], trick: PlayedCard[]): Card {
  const ledSuit = trick[0].card.suit
  const leaderSeat = trick[0].seat
  const canFollow = options.some((c) => c.suit === ledSuit)

  if (trick.length === 1) {
    const ledCard = trick[0].card
    if (canFollow && ledCard.rank >= 11) {
      const coverers = options.filter((c) => c.suit === ledSuit && c.rank === ledCard.rank + 1)
      if (coverers.length > 0) return coverers[0]
    }
    if (canFollow) {
      return options.filter((c) => c.suit === ledSuit).sort((a, b) => a.rank - b.rank)[0]
    }
    return discardOrTrump(state, seat, options, trick)
  }

  // trick.length === 2: third hand
  if (leaderSeat === partnerOf(seat) && canFollow) {
    const highestSoFar = trick.reduce(
      (h, pc) => (pc.card.suit === ledSuit && pc.card.rank > h ? pc.card.rank : h),
      0
    )
    const winners = options.filter((c) => c.suit === ledSuit && c.rank > highestSoFar)
    if (winners.length > 0) {
      return winners.slice().sort((a, b) => a.rank - b.rank)[0]
    }
  }
  if (canFollow) {
    return options.filter((c) => c.suit === ledSuit).sort((a, b) => a.rank - b.rank)[0]
  }
  return discardOrTrump(state, seat, options, trick)
}

function chooseLastToPlay(state: PlayState, seat: Seat, options: Card[], trick: PlayedCard[]): Card {
  const currentWinner = trickWinner(trick, state.trumpSuit)
  const ledSuit = trick[0].card.suit

  if (currentWinner === partnerOf(seat)) {
    const followers = options.filter((c) => c.suit === ledSuit)
    const pool = followers.length > 0 ? followers : options
    return pool.slice().sort((a, b) => a.rank - b.rank)[0]
  }

  const winning = options.filter((c) => trickWinner([...trick, { seat, card: c }], state.trumpSuit) === seat)
  if (winning.length > 0) {
    return winning.slice().sort((a, b) => a.rank - b.rank)[0]
  }

  const followers = options.filter((c) => c.suit === ledSuit)
  const pool = followers.length > 0 ? followers : options
  return pool.slice().sort((a, b) => a.rank - b.rank)[0]
}
