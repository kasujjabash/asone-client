/**
 * The arithmetic behind the compare step.
 *
 * Worth testing because a sign error here would file a surplus as a shortage
 * and adjust the wrong way — and because `offsetting` exists precisely to
 * stop a net of zero reading as "nothing wrong".
 */

import { describe, expect, it } from 'vitest'
import { difference, lineStatus, netDiscrepancyLabel, reconcile } from './receiving'

describe('difference', () => {
  it('is negative when less arrived than expected', () => {
    expect(difference(300, 290)).toBe(-10)
  })

  it('is positive when more arrived', () => {
    expect(difference(250, 255)).toBe(5)
  })
})

describe('lineStatus', () => {
  it('matches on equal counts', () => {
    expect(lineStatus(250, 250)).toBe('MATCHED')
  })

  it('reads a short delivery as a shortage', () => {
    expect(lineStatus(300, 290)).toBe('SHORTAGE')
  })

  it('reads an over-delivery as a surplus', () => {
    expect(lineStatus(250, 255)).toBe('SURPLUS')
  })
})

describe('reconcile', () => {
  it('totals both columns independently', () => {
    const result = reconcile([
      { expected: 250, received: 250 },
      { expected: 300, received: 290 },
    ])

    expect(result.totalExpected).toBe(550)
    expect(result.totalReceived).toBe(540)
    expect(result.netDiscrepancy).toBe(-10)
  })

  it('counts the lines that disagree, not the net', () => {
    const result = reconcile([
      { expected: 300, received: 290 },
      { expected: 250, received: 260 },
    ])

    expect(result.discrepancyCount).toBe(2)
    expect(result.netDiscrepancy).toBe(0)
  })

  it('flags a zero net that hides two errors', () => {
    const result = reconcile([
      { expected: 300, received: 290 },
      { expected: 250, received: 260 },
    ])

    expect(result.offsetting).toBe(true)
    expect(netDiscrepancyLabel(result)).toBe('0 pcs (offsetting variance)')
  })

  it('does not call a clean delivery offsetting', () => {
    const result = reconcile([{ expected: 250, received: 250 }])

    expect(result.offsetting).toBe(false)
    expect(result.discrepancyCount).toBe(0)
  })

  it('handles an empty count without dividing by anything', () => {
    expect(reconcile([]).netDiscrepancy).toBe(0)
  })
})
