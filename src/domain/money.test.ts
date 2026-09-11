/**
 * Money is never added or multiplied as a float.
 */

import { describe, expect, it } from 'vitest'
import { multiplyMoney, sumLineTotals, sumMoney } from './money'

describe('multiplyMoney', () => {
  it('multiplies exactly where a float would drift', () => {
    // 0.1 * 3 is 0.30000000000000004 in binary floating point.
    expect(multiplyMoney('0.10', 3)).toBe('0.30')
  })

  it('handles a real line', () => {
    expect(multiplyMoney('25000.00', 250)).toBe('6250000.00')
  })

  it('truncates a fractional quantity — there is no half a shirt', () => {
    expect(multiplyMoney('100.00', 2.9)).toBe('200.00')
  })

  it('is zero for a zero quantity', () => {
    expect(multiplyMoney('25000.00', 0)).toBe('0.00')
  })
})

describe('sumLineTotals', () => {
  it('totals several priced lines', () => {
    expect(
      sumLineTotals([
        { unit: '25000.00', quantity: 200 },
        { unit: '5000.00', quantity: 50 },
      ]),
    ).toBe('5250000.00')
  })

  it('is zero for no lines', () => {
    expect(sumLineTotals([])).toBe('0.00')
  })
})

describe('sumMoney', () => {
  it('still sums plain amounts exactly', () => {
    expect(sumMoney(['0.10', '0.20'])).toBe('0.30')
  })
})
