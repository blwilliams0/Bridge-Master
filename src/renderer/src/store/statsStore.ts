import { create } from 'zustand'
import { loadPersisted, savePersisted, PERSISTENCE_KEYS } from '@renderer/lib/persistence'
import { Contract, HandScore, partnershipOf } from '@renderer/engine/types'

interface PersistedStats {
  handsPlayed: number
  passedOutHands: number
  declarerHands: number
  contractsMade: number
  contractsDefeated: number
  totalNsScore: number
}

interface StatsState extends PersistedStats {
  /** Records one completed hand's outcome from South's (the human's) perspective. Pass `null, null` for a passed-out hand. */
  recordHand: (contract: Contract | null, score: HandScore | null) => void
  resetStats: () => void
}

const DEFAULT_STATS: PersistedStats = {
  handsPlayed: 0,
  passedOutHands: 0,
  declarerHands: 0,
  contractsMade: 0,
  contractsDefeated: 0,
  totalNsScore: 0
}

function snapshot(state: PersistedStats): PersistedStats {
  return {
    handsPlayed: state.handsPlayed,
    passedOutHands: state.passedOutHands,
    declarerHands: state.declarerHands,
    contractsMade: state.contractsMade,
    contractsDefeated: state.contractsDefeated,
    totalNsScore: state.totalNsScore
  }
}

export const useStatsStore = create<StatsState>((set, get) => {
  const initial = loadPersisted<PersistedStats>(PERSISTENCE_KEYS.stats, DEFAULT_STATS)
  return {
    ...initial,
    recordHand: (contract, score) => {
      if (!contract || !score) {
        set((s) => ({ handsPlayed: s.handsPlayed + 1, passedOutHands: s.passedOutHands + 1 }))
      } else {
        const declarerSide = partnershipOf(contract.declarer)
        const nsDelta = declarerSide === 'NS' ? score.score : -score.score
        set((s) => ({
          handsPlayed: s.handsPlayed + 1,
          declarerHands: s.declarerHands + (declarerSide === 'NS' ? 1 : 0),
          contractsMade: s.contractsMade + (declarerSide === 'NS' && score.madeContract ? 1 : 0),
          contractsDefeated:
            s.contractsDefeated + (declarerSide === 'NS' && !score.madeContract ? 1 : 0),
          totalNsScore: s.totalNsScore + nsDelta
        }))
      }
      savePersisted<PersistedStats>(PERSISTENCE_KEYS.stats, snapshot(get()))
    },
    resetStats: () => {
      set(DEFAULT_STATS)
      savePersisted<PersistedStats>(PERSISTENCE_KEYS.stats, DEFAULT_STATS)
    }
  }
})
