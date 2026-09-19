/**
 * The single reusable decorative border drawn behind every card face --
 * a thin gold rule line with flourished corner motifs, evoking an
 * illuminated-manuscript border without hand-drawing 52 unique frames.
 */
export function CardFrame(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 140 196"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="134"
        height="190"
        rx="9"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        opacity={0.75}
      />
      <rect
        x="7"
        y="7"
        width="126"
        height="182"
        rx="6"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="0.6"
        opacity={0.45}
      />
      {[
        { x: 7, y: 7, rotate: 0 },
        { x: 133, y: 7, rotate: 90 },
        { x: 133, y: 189, rotate: 180 },
        { x: 7, y: 189, rotate: 270 }
      ].map((corner, i) => (
        <g key={i} transform={`translate(${corner.x} ${corner.y}) rotate(${corner.rotate})`}>
          <path
            d="M0 0 C 6 1, 11 4, 13 10 M0 0 C 1 6, 4 11, 10 13"
            stroke="var(--color-gold)"
            strokeWidth="1.1"
            fill="none"
            opacity={0.8}
            strokeLinecap="round"
          />
          <circle cx="3.2" cy="3.2" r="1.3" fill="var(--color-gold-bright)" opacity={0.9} />
        </g>
      ))}
    </svg>
  )
}
