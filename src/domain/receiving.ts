/**
 * Reconciling a delivery against the order that asked for it — F20.
 *
 * Pure functions over plain numbers. None of this touches React, so the
 * arithmetic that decides whether a delivery is short can be asserted in a
 * test rather than read off a screen.
 *
 * The rule the server cares about, and the reason these are separate facts:
 * **what arrived and what the paper claims are different things.** The count
 * is the truth; the expected figure is what the document said. They are
 * never averaged into one number, because the difference is exactly what the
 * warehouse is there to resolve.
 */

/** How one line came out. Matches the design's Status column. */
export type LineStatus = 'MATCHED' | 'SHORTAGE' | 'SURPLUS'

export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  MATCHED: 'Matched',
  SHORTAGE: 'Shortage',
  SURPLUS: 'Surplus',
}

/**
 * Counted minus expected.
 *
 * Negative is short, positive is over. Same direction as the server's
 * `ReceiptLine.discrepancy`, so the screen and the stored document can never
 * disagree about the sign.
 */
export function difference(expected: number, received: number): number {
  return received - expected
}

export function lineStatus(expected: number, received: number): LineStatus {
  const diff = difference(expected, received)
  if (diff === 0) return 'MATCHED'
  return diff < 0 ? 'SHORTAGE' : 'SURPLUS'
}

export interface CountedLine {
  expected: number
  received: number
}

export interface Reconciliation {
  totalExpected: number
  totalReceived: number
  /** Received minus expected across every line. */
  netDiscrepancy: number
  /** How many lines disagree, which is not the same as the net. */
  discrepancyCount: number
  /**
   * Lines disagree but the net is zero — a shortage on one size cancelling a
   * surplus on another.
   *
   * Worth naming rather than leaving as "0", because a net of zero reads as
   * "nothing wrong" and this is the opposite: two errors that happen to
   * cancel. The design calls it an offsetting variance.
   */
  offsetting: boolean
}

export function reconcile(lines: readonly CountedLine[]): Reconciliation {
  let totalExpected = 0
  let totalReceived = 0
  let discrepancyCount = 0

  for (const line of lines) {
    totalExpected += line.expected
    totalReceived += line.received
    if (difference(line.expected, line.received) !== 0) discrepancyCount += 1
  }

  const netDiscrepancy = totalReceived - totalExpected

  return {
    totalExpected,
    totalReceived,
    netDiscrepancy,
    discrepancyCount,
    offsetting: netDiscrepancy === 0 && discrepancyCount > 0,
  }
}

/**
 * How the net discrepancy should read.
 *
 * Not just the number: "0 pcs" alone is misleading when two lines are wrong
 * and cancel out.
 */
export function netDiscrepancyLabel(reconciliation: Reconciliation): string {
  const { netDiscrepancy, offsetting } = reconciliation
  const magnitude = `${netDiscrepancy > 0 ? '+' : ''}${netDiscrepancy} pcs`

  if (offsetting) return `${magnitude} (offsetting variance)`
  return magnitude
}
