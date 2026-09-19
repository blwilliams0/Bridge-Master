import { Rank } from '@renderer/engine/types'

export interface PipPosition {
  x: number
  y: number
  rotate?: 180
  scale?: number
}

/**
 * Pip positions (percentage of the card's inner content box) for spot cards
 * 2-10. Bottom-half pips are rotated 180deg to match the traditional
 * upside-down-when-reversed convention of real playing cards.
 */
const PIP_LAYOUTS: Partial<Record<Rank, PipPosition[]>> = {
  2: [
    { x: 50, y: 22 },
    { x: 50, y: 78, rotate: 180 }
  ],
  3: [
    { x: 50, y: 18 },
    { x: 50, y: 50 },
    { x: 50, y: 82, rotate: 180 }
  ],
  4: [
    { x: 30, y: 20 },
    { x: 70, y: 20 },
    { x: 30, y: 80, rotate: 180 },
    { x: 70, y: 80, rotate: 180 }
  ],
  5: [
    { x: 30, y: 20 },
    { x: 70, y: 20 },
    { x: 50, y: 50 },
    { x: 30, y: 80, rotate: 180 },
    { x: 70, y: 80, rotate: 180 }
  ],
  6: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 30, y: 82, rotate: 180 },
    { x: 70, y: 82, rotate: 180 }
  ],
  7: [
    { x: 30, y: 15 },
    { x: 70, y: 15 },
    { x: 50, y: 32 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 30, y: 85, rotate: 180 },
    { x: 70, y: 85, rotate: 180 }
  ],
  8: [
    { x: 30, y: 14 },
    { x: 70, y: 14 },
    { x: 50, y: 30 },
    { x: 30, y: 46 },
    { x: 70, y: 46 },
    { x: 50, y: 70, rotate: 180 },
    { x: 30, y: 86, rotate: 180 },
    { x: 70, y: 86, rotate: 180 }
  ],
  9: [
    { x: 30, y: 12 },
    { x: 70, y: 12 },
    { x: 30, y: 34 },
    { x: 70, y: 34 },
    { x: 50, y: 50 },
    { x: 30, y: 66, rotate: 180 },
    { x: 70, y: 66, rotate: 180 },
    { x: 30, y: 88, rotate: 180 },
    { x: 70, y: 88, rotate: 180 }
  ],
  10: [
    { x: 30, y: 10 },
    { x: 70, y: 10 },
    { x: 50, y: 22 },
    { x: 30, y: 34 },
    { x: 70, y: 34 },
    { x: 30, y: 66, rotate: 180 },
    { x: 70, y: 66, rotate: 180 },
    { x: 50, y: 78, rotate: 180 },
    { x: 30, y: 90, rotate: 180 },
    { x: 70, y: 90, rotate: 180 }
  ]
}

export function pipLayoutFor(rank: Rank): PipPosition[] | null {
  return PIP_LAYOUTS[rank] ?? null
}
