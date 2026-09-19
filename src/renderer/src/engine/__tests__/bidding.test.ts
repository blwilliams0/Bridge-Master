import { describe, expect, it } from 'vitest'
import {
  createAuction,
  currentDoubling,
  isAuctionOver,
  isCallLegal,
  isPassedOut,
  makeCall,
  resolveAuction
} from '../bidding'
import { Call, Strain } from '../types'

const bid = (level: 1 | 2 | 3 | 4 | 5 | 6 | 7, strain: Strain): Call => ({
  type: 'bid',
  level,
  strain
})
const PASS: Call = { type: 'pass' }
const DOUBLE: Call = { type: 'double' }
const REDOUBLE: Call = { type: 'redouble' }

describe('bid legality', () => {
  it('rejects a bid that does not outrank the current highest bid', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H'))
    // E to call: 1C is lower than 1H, illegal; 1S is higher, legal.
    expect(isCallLegal(auction, bid(1, 'C'))).toBe(false)
    expect(isCallLegal(auction, bid(1, 'H'))).toBe(false) // same bid again
    expect(isCallLegal(auction, bid(1, 'S'))).toBe(true)
    expect(isCallLegal(auction, bid(2, 'C'))).toBe(true)
  })

  it('cannot double partner\'s bid', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H')) // N
    auction = makeCall(auction, PASS) // E
    // S is North's partner; S may not double North's bid.
    expect(isCallLegal(auction, DOUBLE)).toBe(false)
  })

  it('cannot redouble without an active double', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H')) // N
    auction = makeCall(auction, PASS) // E
    // S (North's partner) tries to redouble an undoubled bid -- illegal.
    expect(isCallLegal(auction, REDOUBLE)).toBe(false)
  })

  it('allows a double by an opponent and a redouble by the doubled side', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H')) // N
    expect(isCallLegal(auction, DOUBLE)).toBe(true) // E may double
    auction = makeCall(auction, DOUBLE) // E doubles
    expect(currentDoubling(auction)).toBe('doubled')
    // S (North's side) may redouble.
    expect(isCallLegal(auction, REDOUBLE)).toBe(true)
    auction = makeCall(auction, REDOUBLE)
    expect(currentDoubling(auction)).toBe('redoubled')
    // W may not double again -- already redoubled.
    expect(isCallLegal(auction, DOUBLE)).toBe(false)
  })

  it('clears a standing double once a new bid is made', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H')) // N
    auction = makeCall(auction, DOUBLE) // E doubles
    auction = makeCall(auction, bid(2, 'H')) // S bids on, clearing the double
    expect(currentDoubling(auction)).toBe('none')
    // W may not redouble a bid that was never doubled.
    expect(isCallLegal(auction, REDOUBLE)).toBe(false)
  })
})

describe('auction resolution', () => {
  it('detects a four-pass pass-out distinctly from three passes after a bid', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, PASS)
    auction = makeCall(auction, PASS)
    auction = makeCall(auction, PASS)
    auction = makeCall(auction, PASS)
    expect(isAuctionOver(auction)).toBe(true)
    expect(isPassedOut(auction)).toBe(true)
    expect(resolveAuction(auction)).toBeNull()
  })

  it('ends after three passes following a bid, and is not a pass-out', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'NT'))
    auction = makeCall(auction, PASS)
    auction = makeCall(auction, PASS)
    auction = makeCall(auction, PASS)
    expect(isAuctionOver(auction)).toBe(true)
    expect(isPassedOut(auction)).toBe(false)
    const contract = resolveAuction(auction)
    expect(contract).toEqual({ level: 1, strain: 'NT', doubling: 'none', declarer: 'N' })
  })

  it('declares the first partner to name the winning strain, not just the last bidder', () => {
    let auction = createAuction('N')
    auction = makeCall(auction, bid(1, 'H')) // N opens 1H
    auction = makeCall(auction, bid(1, 'S')) // E overcalls 1S
    auction = makeCall(auction, bid(2, 'H')) // S (North's partner) raises to 2H
    auction = makeCall(auction, PASS) // W
    auction = makeCall(auction, PASS) // N
    auction = makeCall(auction, PASS) // E
    expect(isAuctionOver(auction)).toBe(true)
    const contract = resolveAuction(auction)
    expect(contract).toEqual({ level: 2, strain: 'H', doubling: 'none', declarer: 'N' })
  })
})
