import { useState } from 'react'
import { createDeck, shuffle } from '@renderer/engine/cards'
import { evaluateHand } from '@renderer/engine/biddingAI'
import { Card as CardModel } from '@renderer/engine/types'
import { MiniHand } from '../MiniHand'

function randomHand(): CardModel[] {
  return shuffle(createDeck()).slice(0, 13)
}

export default function HandEvaluation(): React.JSX.Element {
  const [hand, setHand] = useState<CardModel[]>(() => randomHand())
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)

  const evaluation = evaluateHand(hand)

  function check(): void {
    setResult(Number(guess) === evaluation.hcp ? 'correct' : 'incorrect')
  }

  function newHand(): void {
    setHand(randomHand())
    setGuess('')
    setResult(null)
  }

  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        Before bidding, every player counts their hand&apos;s strength. The most common method is{' '}
        <strong className="text-[var(--color-gold-bright)]">high card points (HCP)</strong>: Ace =
        4, King = 3, Queen = 2, Jack = 1. A full deck holds 40 points; an average 13-card hand holds
        about 10.
      </p>
      <p>
        Shape matters too: a <strong>void</strong> (no cards of a suit) adds 3 distribution points,
        a <strong>singleton</strong> adds 2, and a <strong>doubleton</strong> adds 1 -- shortness
        makes a hand more useful once a trump suit is agreed.
      </p>

      <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
        <MiniHand cards={hand} width={50} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="font-display text-sm text-[var(--color-cream-muted)]">
          How many HCP is this hand?
        </label>
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="w-20 rounded-md border border-[var(--color-gold-dim)] bg-[var(--color-wood-950)] px-3 py-1.5 text-center font-display text-[var(--color-cream)] outline-none focus:border-[var(--color-gold)]"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-full border border-[var(--color-gold)] bg-[var(--color-amber)] px-5 py-1.5 font-display text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-amber-glow)]"
        >
          Check
        </button>
        <button
          type="button"
          onClick={newHand}
          className="rounded-full border border-[var(--color-gold-dim)] px-5 py-1.5 font-display text-sm text-[var(--color-cream-muted)] transition-colors hover:border-[var(--color-gold)]"
        >
          New Hand
        </button>
      </div>

      {result && (
        <p
          className={
            result === 'correct'
              ? 'text-[var(--color-gold-bright)]'
              : 'text-[var(--color-crimson-bright)]'
          }
        >
          {result === 'correct'
            ? 'Correct!'
            : `Not quite -- this hand is ${evaluation.hcp} HCP (plus ${evaluation.distributionPoints} distribution point${
                evaluation.distributionPoints === 1 ? '' : 's'
              }).`}
        </p>
      )}
    </div>
  )
}
