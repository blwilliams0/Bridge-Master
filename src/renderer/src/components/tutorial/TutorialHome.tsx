import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@renderer/store/gameStore'
import { useTutorialStore } from '@renderer/store/tutorialStore'
import { LESSONS } from './lessons'

export function TutorialHome(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const returnHome = useGameStore((s) => s.returnHome)
  const completed = useTutorialStore((s) => s.completedLessons)
  const markComplete = useTutorialStore((s) => s.markComplete)

  if (activeIndex !== null) {
    const lesson = LESSONS[activeIndex]
    const LessonContent = lesson.Component
    const isLast = activeIndex === LESSONS.length - 1

    return (
      <div className="flex h-full w-full flex-col items-center bg-[radial-gradient(ellipse_at_center,var(--color-wood-800)_0%,var(--color-wood-950)_75%)] p-8">
        <div className="flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
          <header className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="font-display text-sm text-[var(--color-cream-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
            >
              &larr; All Lessons
            </button>
            <span className="font-display text-xs uppercase tracking-widest text-[var(--color-cream-dim)]">
              Lesson {activeIndex + 1} of {LESSONS.length}
            </span>
          </header>

          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 overflow-y-auto rounded-2xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-850)]/80 p-8 shadow-[0_16px_50px_rgba(0,0,0,0.5)]"
          >
            <h2 className="font-display text-3xl text-[var(--color-gold-bright)]">{lesson.title}</h2>
            <div className="mt-6">
              <LessonContent />
            </div>
          </motion.div>

          <footer className="mt-4 flex justify-between">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => {
                markComplete(lesson.id)
                setActiveIndex(activeIndex - 1)
              }}
              className="rounded-full border border-[var(--color-gold-dim)] px-6 py-2 font-display text-sm text-[var(--color-cream-muted)] transition-colors hover:border-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                markComplete(lesson.id)
                setActiveIndex(isLast ? null : activeIndex + 1)
              }}
              className="rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-6 py-2 font-display text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 overflow-y-auto bg-[radial-gradient(ellipse_at_center,var(--color-wood-800)_0%,var(--color-wood-950)_75%)] p-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2"
      >
        <h1 className="font-display text-4xl tracking-wide text-[var(--color-gold-bright)]">Learn Bridge</h1>
        <p className="font-body italic text-[var(--color-cream-muted)]">
          {completed.length} of {LESSONS.length} lessons complete
        </p>
      </motion.div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {LESSONS.map((lesson, i) => {
          const done = completed.includes(lesson.id)
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex items-start gap-3 rounded-xl border px-5 py-4 text-left transition-colors ${
                done
                  ? 'border-[var(--color-gold)] bg-[var(--color-wood-700)]/70'
                  : 'border-[var(--color-gold-dim)] bg-[var(--color-wood-850)] hover:border-[var(--color-gold)]'
              }`}
            >
              <span className="font-display text-lg text-[var(--color-amber-glow)]">{i + 1}</span>
              <span className="flex-1">
                <span className="block font-display text-base text-[var(--color-cream)]">{lesson.title}</span>
                <span className="block font-body text-sm text-[var(--color-cream-muted)]">{lesson.summary}</span>
              </span>
              {done && <span className="text-[var(--color-gold-bright)]">&#10003;</span>}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={returnHome}
        className="mt-2 rounded-full border border-[var(--color-gold-dim)] px-8 py-2.5 font-display text-sm tracking-wide text-[var(--color-cream-muted)] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-cream)]"
      >
        Back to Home
      </button>
    </div>
  )
}
