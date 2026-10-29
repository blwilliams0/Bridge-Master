import { SUIT_SYMBOL } from '@renderer/engine/cards'
import { Strain, Suit } from '@renderer/engine/types'

export function suitColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? 'var(--color-crimson)' : 'var(--color-ink)'
}

export function strainSymbol(strain: Strain): string {
  return strain === 'NT' ? 'NT' : SUIT_SYMBOL[strain]
}

export function strainColor(strain: Strain): string {
  return strain === 'H' || strain === 'D'
    ? 'var(--color-crimson-bright)'
    : 'var(--color-gold-bright)'
}
