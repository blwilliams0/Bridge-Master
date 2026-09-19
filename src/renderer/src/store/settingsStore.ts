import { create } from 'zustand'
import { loadPersisted, savePersisted, PERSISTENCE_KEYS } from '@renderer/lib/persistence'
import { PlayDifficulty } from '@renderer/engine/playAI'

interface PersistedSettings {
  difficulty: PlayDifficulty
}

interface SettingsState extends PersistedSettings {
  setDifficulty: (difficulty: PlayDifficulty) => void
}

const DEFAULT_SETTINGS: PersistedSettings = { difficulty: 'club-player' }

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = loadPersisted<PersistedSettings>(PERSISTENCE_KEYS.settings, DEFAULT_SETTINGS)
  return {
    ...initial,
    setDifficulty: (difficulty) => {
      set({ difficulty })
      savePersisted<PersistedSettings>(PERSISTENCE_KEYS.settings, { difficulty: get().difficulty })
    }
  }
})
