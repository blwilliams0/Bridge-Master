import { create } from 'zustand'
import {
  createAuction,
  isAuctionOver,
  isCallLegal,
  legalCalls,
  makeCall,
  resolveAuction,
  whoseTurn
} from '@renderer/engine/bidding'
import { chooseBid } from '@renderer/engine/biddingAI'
import { chooseCard } from '@renderer/engine/playAI'
import {
  dummySeat,
  initPlayState,
  isPlayComplete,
  isPlayLegal,
  legalPlays,
  openingLeader,
  playCard as enginePlayCard
} from '@renderer/engine/play'
import { scoreHand } from '@renderer/engine/scoring'
import { createHandSetup } from '@renderer/engine/gameState'
import {
  AuctionResult,
  AuctionState,
  Call,
  Card,
  Contract,
  GamePhase,
  HandScore,
  HandSetup,
  PlayState,
  Seat,
  Trick
} from '@renderer/engine/types'

export const HUMAN_SEAT: Seat = 'S'
const AI_BID_DELAY_MS = 650
const AI_PLAY_DELAY_MS = 550
const TRICK_LINGER_MS = 950

/** Declarer controls both their own hand and dummy's during play. */
export function controllerOf(contract: Contract, seat: Seat): Seat {
  return seat === dummySeat(contract) ? contract.declarer : seat
}

interface CumulativeScore {
  NS: number
  EW: number
}

interface GameState {
  view: 'home' | 'table'
  boardNumber: number
  handId: number
  setup: HandSetup | null
  auction: AuctionState | null
  contract: AuctionResult | undefined
  playState: PlayState | null
  score: HandScore | null
  phase: GamePhase | 'idle'
  cumulativeScore: CumulativeScore
  lastCompletedTrick: { trick: Trick; winner: Seat } | null

  startNewGame: () => void
  startNextHand: () => void
  humanBid: (call: Call) => void
  humanPlay: (card: Card) => void
}

function dealNewHand(boardNumber: number): { setup: HandSetup; auction: AuctionState } {
  const setup = createHandSetup(boardNumber)
  return { setup, auction: createAuction(setup.dealer) }
}

export const useGameStore = create<GameState>((set, get) => {
  function advanceAi(expectedHandId: number): void {
    const state = get()
    if (state.handId !== expectedHandId) return

    if (state.phase === 'bidding') {
      const auction = state.auction!
      if (isAuctionOver(auction)) {
        const contract = resolveAuction(auction)
        if (!contract) {
          set({ phase: 'passed-out', contract: null })
          return
        }
        const playState = initPlayState(contract, state.setup!.deal)
        set({ phase: 'play', contract, playState })
        advanceAi(expectedHandId)
        return
      }
      const seat = whoseTurn(auction)
      if (seat === HUMAN_SEAT) return
      setTimeout(() => {
        const s = get()
        if (s.handId !== expectedHandId || s.phase !== 'bidding' || !s.auction) return
        // Recompute whose turn it is at fire time (not the seat captured when this
        // timeout was scheduled) so a fast-changing auction can never cause a
        // stale seat to make a call out of turn.
        const currentSeat = whoseTurn(s.auction)
        if (currentSeat === HUMAN_SEAT) return
        const annotated = chooseBid(s.auction, s.setup!.deal[currentSeat], currentSeat)
        const nextAuction = makeCall(s.auction, annotated.call, {
          meaning: annotated.meaning,
          forcing: annotated.forcing
        })
        set({ auction: nextAuction })
        advanceAi(expectedHandId)
      }, AI_BID_DELAY_MS)
      return
    }

    if (state.phase === 'play') {
      const playState = state.playState!
      const contract = state.contract as Contract
      if (isPlayComplete(playState)) {
        finishPlay(playState, contract)
        return
      }
      const seat = playState.nextToPlay
      if (controllerOf(contract, seat) === HUMAN_SEAT) return
      setTimeout(() => {
        const s = get()
        if (s.handId !== expectedHandId || s.phase !== 'play' || !s.playState || !s.contract) return
        // Recompute whose turn it is at fire time -- a stale captured seat must
        // never be used to play a card once state has moved on.
        const currentSeat = s.playState.nextToPlay
        if (controllerOf(s.contract as Contract, currentSeat) === HUMAN_SEAT) return
        const card = chooseCard(s.playState, currentSeat)
        applyPlay(expectedHandId, currentSeat, card)
      }, AI_PLAY_DELAY_MS)
    }
  }

  function finishPlay(playState: PlayState, contract: Contract): void {
    const declarerPartnershipTricks =
      contract.declarer === 'N' || contract.declarer === 'S'
        ? playState.tricksWonNS
        : playState.tricksWonEW
    const score = scoreHand(contract, declarerPartnershipTricks, get().setup!.vulnerability)
    set({ phase: 'scoring', score })
    applyCumulativeScore(contract, score.score)
  }

  function applyCumulativeScore(contract: Contract, signedScore: number): void {
    const declarerSide = partnershipOfDeclarer(contract)
    const cumulative = get().cumulativeScore
    const nsDelta = declarerSide === 'NS' ? signedScore : -signedScore
    set({
      cumulativeScore: {
        NS: cumulative.NS + nsDelta,
        EW: cumulative.EW - nsDelta
      }
    })
  }

  function partnershipOfDeclarer(contract: Contract): 'NS' | 'EW' {
    return contract.declarer === 'N' || contract.declarer === 'S' ? 'NS' : 'EW'
  }

  function applyPlay(expectedHandId: number, seat: Seat, card: Card): void {
    const s = get()
    if (s.handId !== expectedHandId || !s.playState) return
    if (!isPlayLegal(s.playState, seat, card)) return
    const wasFourthCard = s.playState.currentTrick.length === 3
    const next = enginePlayCard(s.playState, seat, card)

    if (wasFourthCard) {
      const completedTrick = next.tricks[next.tricks.length - 1]
      const winner = next.nextToPlay
      set({ playState: next, lastCompletedTrick: { trick: completedTrick, winner } })
      setTimeout(() => {
        const s2 = get()
        if (s2.handId !== expectedHandId) return
        set({ lastCompletedTrick: null })
        advanceAi(expectedHandId)
      }, TRICK_LINGER_MS)
    } else {
      set({ playState: next })
      advanceAi(expectedHandId)
    }
  }

  return {
    view: 'home',
    boardNumber: 0,
    handId: 0,
    setup: null,
    auction: null,
    contract: undefined,
    playState: null,
    score: null,
    phase: 'idle',
    cumulativeScore: { NS: 0, EW: 0 },
    lastCompletedTrick: null,

    startNewGame: () => {
      const boardNumber = 1
      const { setup, auction } = dealNewHand(boardNumber)
      const handId = get().handId + 1
      set({
        view: 'table',
        boardNumber,
        handId,
        setup,
        auction,
        contract: undefined,
        playState: null,
        score: null,
        phase: 'bidding',
        cumulativeScore: { NS: 0, EW: 0 },
        lastCompletedTrick: null
      })
      advanceAi(handId)
    },

    startNextHand: () => {
      const boardNumber = get().boardNumber + 1
      const { setup, auction } = dealNewHand(boardNumber)
      const handId = get().handId + 1
      set({
        boardNumber,
        handId,
        setup,
        auction,
        contract: undefined,
        playState: null,
        score: null,
        phase: 'bidding',
        lastCompletedTrick: null
      })
      advanceAi(handId)
    },

    humanBid: (call: Call) => {
      const s = get()
      if (s.phase !== 'bidding' || !s.auction) return
      if (whoseTurn(s.auction) !== HUMAN_SEAT) return
      if (!isCallLegal(s.auction, call)) return
      const auction = makeCall(s.auction, call)
      set({ auction })
      advanceAi(s.handId)
    },

    humanPlay: (card: Card) => {
      const s = get()
      if (s.phase !== 'play' || !s.playState || !s.contract) return
      const seat = s.playState.nextToPlay
      if (controllerOf(s.contract as Contract, seat) !== HUMAN_SEAT) return
      if (!isPlayLegal(s.playState, seat, card)) return
      applyPlay(s.handId, seat, card)
    }
  }
})

export function legalCallsForCurrentTurn(): Call[] {
  const s = useGameStore.getState()
  if (!s.auction || s.phase !== 'bidding') return []
  return legalCalls(s.auction)
}

export function legalPlaysForSeat(seat: Seat): Card[] {
  const s = useGameStore.getState()
  if (!s.playState) return []
  return legalPlays(s.playState, seat)
}

export function currentOpeningLeader(contract: Contract): Seat {
  return openingLeader(contract)
}
