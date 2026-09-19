import { create } from 'zustand'
import { loadPersisted, savePersisted, PERSISTENCE_KEYS } from '@renderer/lib/persistence'

interface PersistedTutorial {
  completedLessons: string[]
}

interface TutorialState extends PersistedTutorial {
  markComplete: (lessonId: string) => void
  isComplete: (lessonId: string) => boolean
}

const DEFAULT_TUTORIAL: PersistedTutorial = { completedLessons: [] }

export const useTutorialStore = create<TutorialState>((set, get) => {
  const initial = loadPersisted<PersistedTutorial>(PERSISTENCE_KEYS.tutorial, DEFAULT_TUTORIAL)
  return {
    completedLessons: initial.completedLessons,
    markComplete: (lessonId) => {
      if (get().completedLessons.includes(lessonId)) return
      const completedLessons = [...get().completedLessons, lessonId]
      set({ completedLessons })
      savePersisted<PersistedTutorial>(PERSISTENCE_KEYS.tutorial, { completedLessons })
    },
    isComplete: (lessonId) => get().completedLessons.includes(lessonId)
  }
})
