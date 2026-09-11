/**
 * How far along a production order is.
 *
 * The server sends `fulfilment_status`, derived from posted receipts. This
 * only chooses how it looks, the same way `domain/status.ts` does for every
 * other badge in the system.
 *
 * ## What the design asks for that does not exist
 *
 * The mock shows six states: Draft, Submitted, In Production, Ready to Ship,
 * Partially Received, Received. Only the last two are knowable.
 *
 * **Tailoring Centers are not system users.** Nobody at a TC types anything
 * — AsOne was explicit (p.5) that the packing list arrives handwritten, on
 * paper, with the goods. So the system cannot know that a centre has
 * started cutting, finished, or loaded a van. The first it hears of a
 * production run is a delivery at the gate.
 *
 * Showing those four would mean a badge nothing can ever move. What is shown
 * instead is what the documents actually say: the order is out, some of it
 * has arrived, all of it has, or it is closed.
 */

import type { Tone } from '@/components'

export type FulfilmentStatus =
  | 'AWAITING'
  | 'PARTIAL'
  | 'RECEIVED'
  | 'CLOSED'
  | 'CANCELLED'

export function fulfilmentTone(status: string): Tone {
  switch (status) {
    case 'AWAITING':
      return 'info'
    case 'PARTIAL':
      return 'warning'
    case 'RECEIVED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    case 'CLOSED':
      return 'neutral'
    default:
      // A status the server grew and this build has not seen yet reads as
      // neutral rather than blanking the badge.
      return 'neutral'
  }
}

/** Units still to come. Never negative: an over-delivery is not a negative debt. */
export function outstandingUnits(ordered: number, received: number): number {
  return Math.max(0, ordered - received)
}
