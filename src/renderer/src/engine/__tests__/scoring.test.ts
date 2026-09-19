import { describe, expect, it } from 'vitest'
import { scoreHand } from '../scoring'
import { Contract } from '../types'

describe('scoreHand', () => {
  it('4S bid and made exactly, vulnerable = 620', () => {
    const contract: Contract = { level: 4, strain: 'S', doubling: 'none', declarer: 'S' }
    const result = scoreHand(contract, 10, 'NS')
    expect(result.score).toBe(620) // 4*30=120 trick score + 500 vul game bonus
  })

  it('3NT bid and made with one overtrick = 430', () => {
    const contract: Contract = { level: 3, strain: 'NT', doubling: 'none', declarer: 'N' }
    const result = scoreHand(contract, 10, 'None')
    // trick score 40+30+30=100 (game, non-vul 300) + 1 overtrick (30) = 430
    expect(result.score).toBe(430)
  })

  it('down 2, doubled, vulnerable = -500', () => {
    const contract: Contract = { level: 3, strain: 'H', doubling: 'doubled', declarer: 'E' }
    // needs 9 tricks, took 7 => down 2
    const result = scoreHand(contract, 7, 'EW')
    expect(result.madeContract).toBe(false)
    expect(result.score).toBe(-500) // 200 (first) + 300 (second) vulnerable doubled
  })

  it('small slam bid and made exactly, non-vulnerable = 500 + trick score', () => {
    const contract: Contract = { level: 6, strain: 'S', doubling: 'none', declarer: 'S' }
    const result = scoreHand(contract, 12, 'None')
    // trick score 6*30=180 (game bonus 300, non-vul) + small slam bonus 500
    expect(result.score).toBe(180 + 300 + 500)
    expect(result.score).toBe(980)
  })

  it('grand slam bid and made exactly, vulnerable', () => {
    const contract: Contract = { level: 7, strain: 'NT', doubling: 'none', declarer: 'N' }
    const result = scoreHand(contract, 13, 'Both')
    // trick score 40+30*6=220, game bonus 500 vul, grand slam bonus 1500 vul
    expect(result.score).toBe(220 + 500 + 1500)
  })

  it('doubled contract made exactly gets the 50-point insult bonus', () => {
    const contract: Contract = { level: 1, strain: 'C', doubling: 'doubled', declarer: 'N' }
    const result = scoreHand(contract, 7, 'None')
    // trick score 20*2=40 (doubled), partscore bonus 50, insult 50 = 140
    expect(result.score).toBe(140)
  })

  it('undoubled undertricks: 50/trick non-vul, 100/trick vul', () => {
    const contract: Contract = { level: 1, strain: 'NT', doubling: 'none', declarer: 'N' }
    expect(scoreHand(contract, 6, 'None').score).toBe(-50) // down 1 non-vul
    expect(scoreHand(contract, 6, 'NS').score).toBe(-100) // down 1 vul
  })

  it('down 3 doubled non-vulnerable = -500 (classic reference number)', () => {
    const contract: Contract = { level: 4, strain: 'S', doubling: 'doubled', declarer: 'N' }
    const result = scoreHand(contract, 7, 'None') // needs 10, took 7 -> down 3
    expect(result.score).toBe(-500) // 100 + 200 + 200
  })

  it('down 5 doubled vulnerable = -1400 (classic sacrifice reference number)', () => {
    const contract: Contract = { level: 4, strain: 'S', doubling: 'doubled', declarer: 'N' }
    const result = scoreHand(contract, 5, 'NS') // needs 10, took 5 -> down 5
    expect(result.score).toBe(-1400) // 200 + 300*4
  })
})
