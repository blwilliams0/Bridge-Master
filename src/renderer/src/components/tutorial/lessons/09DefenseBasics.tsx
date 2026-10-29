export default function DefenseBasics(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 font-body text-[var(--color-cream)]">
      <p>
        When you&apos;re defending (not declarer or dummy), you and your partner see only your own
        13 cards -- so a handful of table conventions help you cooperate without being able to show
        each other your hands. Bridge Master&apos;s own &quot;Club Player&quot; AI follows exactly
        these rules when it defends:
      </p>

      <div className="flex flex-col gap-3">
        <Rule
          title="The opening lead"
          body="Against notrump, lead 4th-highest from your longest and strongest suit to help partner read your length. Against a suit contract, leading the top of a solid sequence (like K-Q-J) is safe and often productive."
        />
        <Rule
          title="Third hand high"
          body="When partner leads and dummy doesn't have the trick well covered, third hand generally plays its highest card in the suit -- forcing out declarer's honors early, before declarer can set them up safely."
        />
        <Rule
          title="Cover an honor with an honor"
          body="If declarer or dummy plays an honor card (Jack or better) and you hold the next-highest honor, playing it can promote a lower card in your or partner's hand into a winner later."
        />
        <Rule
          title="Return partner's suit"
          body="Absent a clearly better plan, leading back the suit partner led originally keeps the defense working together rather than each defender chasing a different idea."
        />
      </div>
    </div>
  )
}

function Rule({ title, body }: { title: string; body: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-[var(--color-gold-dim)] bg-[var(--color-wood-900)] p-4">
      <h3 className="font-display text-base text-[var(--color-gold-bright)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-cream-muted)]">{body}</p>
    </div>
  )
}
