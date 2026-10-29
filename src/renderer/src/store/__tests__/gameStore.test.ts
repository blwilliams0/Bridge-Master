import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore, controllerOf } from '../gameStore'
import { useStatsStore } from '../statsStore'
import { legalPlays } from '../../engine/play'
import { seededRng } from '../../engine/cards'

vi.mock('../../engine/biddingAI', () => ({
  chooseBid: () => ({ call: { type: 'pass' }, meaning: 'Pass', forcing: 'none' })
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockImplementation(seededRng(42))
  useGameStore.setState(useGameStore.getInitialState())
  useStatsStore.getState().resetStats()
})

afterEach(() => {
  useGameStore.getState().returnHome()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function startPlay(): void {
  useGameStore.getState().startNewGame()
  vi.advanceTimersByTime(1300)
  useGameStore.getState().humanBid({ type: 'bid', level: 1, strain: 'NT' })
  vi.advanceTimersByTime(1950)
  expect(useGameStore.getState().phase).toBe('play')
}

function step(): void {
  const s = useGameStore.getState()
  if (s.lastCompletedTrick) {
    vi.advanceTimersByTime(950)
  } else if (
    s.playState &&
    s.contract &&
    controllerOf(s.contract, s.playState.nextToPlay) === 'S'
  ) {
    s.humanPlay(legalPlays(s.playState, s.playState.nextToPlay)[0])
  } else {
    vi.advanceTimersToNextTimer()
  }
}

describe('game lifecycle', () => {
  it('pauses AI on the menu and resumes without duplicate turns', () => {
    const s = useGameStore.getState()
    s.startNewGame()
    s.returnHome()
    vi.advanceTimersByTime(10000)
    expect(useGameStore.getState().auction?.calls).toHaveLength(0)
    s.resumeGame()
    s.resumeGame()
    vi.advanceTimersByTime(650)
    expect(useGameStore.getState().auction?.calls).toHaveLength(1)
    vi.advanceTimersByTime(650)
    expect(useGameStore.getState().auction?.calls).toHaveLength(2)
  })

  it('cancels the old game timer when dealing again', () => {
    useGameStore.getState().startNewGame()
    vi.advanceTimersByTime(300)
    useGameStore.getState().startNewGame()
    vi.advanceTimersByTime(350)
    expect(useGameStore.getState().auction?.calls).toHaveLength(0)
    vi.advanceTimersByTime(300)
    expect(useGameStore.getState().auction?.calls).toHaveLength(1)
  })

  it('records a passed-out hand once and advances the board', () => {
    useGameStore.getState().startNewGame()
    vi.advanceTimersByTime(1300)
    useGameStore.getState().humanBid({ type: 'pass' })
    vi.advanceTimersByTime(650)
    expect(useGameStore.getState().phase).toBe('passed-out')
    useGameStore.getState().returnHome()
    useGameStore.getState().resumeGame()
    expect(useStatsStore.getState().passedOutHands).toBe(1)
    useGameStore.getState().startNextHand()
    expect(useGameStore.getState().boardNumber).toBe(2)
  })

  it('blocks early leads during trick display and resumes a paused trick', () => {
    startPlay()
    for (let i = 0; i < 200; i++) {
      const s = useGameStore.getState()
      if (
        s.lastCompletedTrick &&
        s.contract &&
        s.playState &&
        controllerOf(s.contract, s.playState.nextToPlay) === 'S'
      ) {
        const before = s.playState
        s.humanPlay(legalPlays(before, before.nextToPlay)[0])
        expect(useGameStore.getState().playState).toBe(before)
        s.returnHome()
        vi.advanceTimersByTime(10000)
        expect(useGameStore.getState().lastCompletedTrick).not.toBeNull()
        s.resumeGame()
        vi.advanceTimersByTime(950)
        expect(useGameStore.getState().lastCompletedTrick).toBeNull()
        s.humanPlay(legalPlays(before, before.nextToPlay)[0])
        expect(useGameStore.getState().playState?.playedCards.length).toBe(
          before.playedCards.length + 1
        )
        return
      }
      step()
    }
    throw new Error('Expected a human-controlled trick winner')
  })

  it('plays all 52 cards, scores once, and preserves the score for the next board', () => {
    startPlay()
    for (let i = 0; i < 200 && useGameStore.getState().phase === 'play'; i++) step()
    const s = useGameStore.getState()
    expect(s.phase).toBe('scoring')
    expect(s.playState?.playedCards).toHaveLength(52)
    expect(s.playState?.tricks).toHaveLength(13)
    expect(useStatsStore.getState().handsPlayed).toBe(1)
    expect(s.cumulativeScore.NS).toBe(s.score?.score)
    s.returnHome()
    s.resumeGame()
    vi.runAllTimers()
    expect(useStatsStore.getState().handsPlayed).toBe(1)
    s.startNextHand()
    expect(useGameStore.getState().cumulativeScore).toEqual(s.cumulativeScore)
    expect(useGameStore.getState().score).toBeNull()
  })
})
