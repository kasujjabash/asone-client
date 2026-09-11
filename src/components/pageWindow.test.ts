/**
 * The page-number window.
 *
 * Worth testing because the failure mode is silent: an off-by-one here
 * renders a button for a page that does not exist, and the reader lands on
 * an empty table.
 */

import { describe, expect, it } from 'vitest'
import { pageWindow } from './pageWindow'

describe('pageWindow', () => {
  it('lists every page when they fit', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
  })

  it('never offers a page beyond the last', () => {
    expect(pageWindow(9, 9).every((n) => n === null || n <= 9)).toBe(true)
  })

  it('never offers a page below the first', () => {
    expect(pageWindow(1, 40).every((n) => n === null || n >= 1)).toBe(true)
  })

  it('keeps the first, last and current page reachable', () => {
    const window = pageWindow(20, 40)

    expect(window).toContain(1)
    expect(window).toContain(20)
    expect(window).toContain(40)
  })

  it('marks the gaps rather than listing forty buttons', () => {
    const window = pageWindow(20, 40)

    expect(window.filter((n) => n === null).length).toBe(2)
    expect(window.length).toBeLessThan(9)
  })

  it('does not open a gap where the pages are adjacent', () => {
    expect(pageWindow(2, 6)).toEqual([1, 2, 3, null, 6])
  })

  it('survives a single page', () => {
    expect(pageWindow(1, 1)).toEqual([1])
  })
})
