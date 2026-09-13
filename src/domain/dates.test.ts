/**
 * The UTC bug this module exists to prevent.
 */

import { describe, expect, it } from 'vitest'
import { isBefore, todayISO } from './dates'

describe('todayISO', () => {
  it('uses the local calendar day, not UTC', () => {
    // 01:30 on the 11th in a UTC+3 zone is still 22:30 on the 10th in UTC.
    // Built from local fields, the answer is the 11th either way.
    const localEarlyMorning = new Date(2026, 8, 11, 1, 30)

    expect(todayISO(localEarlyMorning)).toBe('2026-09-11')
  })

  it('zero-pads single-digit months and days', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('handles the last day of a year', () => {
    expect(todayISO(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31')
  })
})

describe('isBefore', () => {
  it('orders ISO dates', () => {
    expect(isBefore('2026-09-10', '2026-09-25')).toBe(true)
    expect(isBefore('2026-09-25', '2026-09-10')).toBe(false)
  })

  it('is false for the same day — before is strict', () => {
    expect(isBefore('2026-09-10', '2026-09-10')).toBe(false)
  })

  it('is false when either end is missing', () => {
    expect(isBefore('', '2026-09-10')).toBe(false)
    expect(isBefore('2026-09-10', '')).toBe(false)
  })
})
