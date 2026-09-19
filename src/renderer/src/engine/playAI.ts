import { legalPlays } from './play'
import { Card, PlayState, Seat } from './types'

export type PlayDifficulty = 'beginner' | 'club-player'

/**
 * Phase 1 stub: always plays the first legal card. Beginner/Club-Player
 * heuristic tiers (3rd-hand-high, cover an honor with an honor, return
 * partner's suit, opening-lead conventions, basic declarer technique) are
 * layered in during Phase 3. This is the safe fallback every real
 * implementation must fall back to when no heuristic applies.
 */
export function chooseCard(state: PlayState, seat: Seat, _difficulty: PlayDifficulty = 'club-player'): Card {
  const options = legalPlays(state, seat)
  if (options.length === 0) {
    throw new Error(`No legal plays available for ${seat}`)
  }
  return options[0]
}
