import {
  Contract,
  Doubling,
  HandScore,
  isVulnerable,
  partnershipOf,
  Strain,
  Vulnerability
} from './types'

/** Per-trick trick score for a made contract (NT's first trick is worth more; used for overtricks too, except NT overtricks are 30 not 40). */
function perTrickValue(strain: Strain): number {
  if (strain === 'C' || strain === 'D') return 20
  return 30 // H, S, NT (NT overtricks are 30; the +10 "first trick" bonus is baked into contractTrickScoreBase)
}

/** Trick score earned for exactly making the contracted number of tricks (before doubling multiplier). */
function contractTrickScoreBase(level: number, strain: Strain): number {
  if (strain === 'NT') return 40 + (level - 1) * 30
  return level * perTrickValue(strain)
}

function doublingMultiplier(doubling: Doubling): number {
  if (doubling === 'doubled') return 2
  if (doubling === 'redoubled') return 4
  return 1
}

function overtrickValue(strain: Strain, doubling: Doubling, vulnerable: boolean): number {
  if (doubling === 'none') return perTrickValue(strain)
  if (doubling === 'doubled') return vulnerable ? 200 : 100
  return vulnerable ? 400 : 200 // redoubled
}

function insultBonus(doubling: Doubling): number {
  if (doubling === 'doubled') return 50
  if (doubling === 'redoubled') return 100
  return 0
}

function slamBonus(level: number, vulnerable: boolean): number {
  if (level === 6) return vulnerable ? 750 : 500
  if (level === 7) return vulnerable ? 1500 : 1000
  return 0
}

/**
 * Cumulative undertrick penalty. Standard ACBL table:
 * - Undoubled: 50/trick (non-vul), 100/trick (vul).
 * - Doubled non-vul: 100, 200, 200, 300, 300, ... (1st=100, 2nd-3rd=200, 4th+=300)
 * - Doubled vul: 200, 300, 300, 300, ... (1st=200, 2nd+=300)
 * - Redoubled: exactly double the corresponding doubled per-trick amount.
 */
function undertrickPenalty(undertricks: number, vulnerable: boolean, doubling: Doubling): number {
  if (doubling === 'none') {
    return undertricks * (vulnerable ? 100 : 50)
  }

  let total = 0
  for (let trick = 1; trick <= undertricks; trick++) {
    let doubledAmount: number
    if (vulnerable) {
      doubledAmount = trick === 1 ? 200 : 300
    } else {
      doubledAmount = trick === 1 ? 100 : trick <= 3 ? 200 : 300
    }
    total += doubling === 'redoubled' ? doubledAmount * 2 : doubledAmount
  }
  return total
}

/**
 * Scores one board. Positive scores favor declarer's partnership, negative
 * favor the defenders. Standard duplicate/board scoring -- no rubber bonus
 * carryover across hands.
 */
export function scoreHand(
  contract: Contract,
  tricksTaken: number,
  vulnerability: Vulnerability
): HandScore {
  const tricksNeeded = contract.level + 6
  const madeContract = tricksTaken >= tricksNeeded
  const declarerPartnership = partnershipOf(contract.declarer)
  const vulnerable = isVulnerable(vulnerability, declarerPartnership)

  let score: number

  if (madeContract) {
    const overtricks = tricksTaken - tricksNeeded
    const contractTrickScore =
      contractTrickScoreBase(contract.level, contract.strain) *
      doublingMultiplier(contract.doubling)
    const gameOrPartscoreBonus = contractTrickScore >= 100 ? (vulnerable ? 500 : 300) : 50
    const overtrickScore =
      overtricks * overtrickValue(contract.strain, contract.doubling, vulnerable)
    const slam = slamBonus(contract.level, vulnerable)
    const insult = insultBonus(contract.doubling)

    score = contractTrickScore + overtrickScore + gameOrPartscoreBonus + slam + insult
  } else {
    const undertricks = tricksNeeded - tricksTaken
    score = -undertrickPenalty(undertricks, vulnerable, contract.doubling)
  }

  return {
    score,
    madeContract,
    tricksTaken,
    contract,
    vulnerability
  }
}
