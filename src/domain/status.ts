/**
 * Which tone a status gets.
 *
 * Pure mapping, kept out of the components so it can be asserted in a test
 * and so one status never picks up two different colours on two screens.
 *
 * The label always comes from the server's `*_display` field — never
 * reconstructed here — because the server owns the wording.
 */

import type { Tone } from '@/components'
import type { MovementType, ProcurementStatus, SchoolOrderStatus } from '@/api/types'

/**
 * School order lifecycle.
 *
 * `RELEASED` is deliberately neutral, not a success tone. The status exists
 * in the enum but no server code path reaches it — what confirms payment is
 * an open question with AsOne — so nothing in the UI should present it as an
 * achieved state.
 */
export function schoolOrderTone(status: SchoolOrderStatus): Tone {
  switch (status) {
    case 'HOLD':
      return 'warning'
    case 'PICKED':
      return 'info'
    case 'SHIPPED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    case 'RELEASED':
      return 'neutral'
  }
}

export function procurementTone(status: ProcurementStatus): Tone {
  switch (status) {
    case 'OPEN':
      return 'info'
    case 'CLOSED':
      return 'success'
    case 'CANCELLED':
      return 'error'
  }
}

/** Ledger movements: does this row add stock or remove it? */
export function movementTone(type: MovementType): Tone {
  switch (type) {
    case 'RECEIPT':
    case 'TRANSFER_IN':
    case 'RETURN':
      return 'success'
    case 'PICK':
    case 'SHIPMENT':
    case 'TRANSFER_OUT':
      return 'info'
    case 'DAMAGE':
      return 'error'
    case 'ADJUSTMENT':
      return 'warning'
  }
}

/**
 * The severity the dashboard's attention feed reports.
 *
 * The server grades each alert — CRITICAL, HOLD, and so on — and this only
 * picks how that looks. Unknown levels fall back to neutral rather than
 * throwing: the server may add one, and a new alert kind should not blank
 * the panel.
 */
export function alertTone(level: string): Tone {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
      return 'error'
    case 'WARNING':
    case 'HOLD':
      return 'warning'
    case 'READY':
    case 'INFO':
      return 'info'
    default:
      return 'neutral'
  }
}

/**
 * The kind of thing that happened, in the activity feed.
 *
 * Same reasoning: the server names the kind, this picks the colour, and an
 * unfamiliar kind gets a neutral dot instead of an exception.
 */
export function activityTone(kind: string): Tone {
  switch (kind) {
    case 'receipt':
    case 'return':
      return 'success'
    case 'order':
    case 'shipment':
    case 'production_order':
      return 'info'
    case 'adjustment':
    case 'transfer':
      return 'warning'
    case 'backorder':
      return 'error'
    default:
      return 'neutral'
  }
}

/**
 * A stock figure against its minimum.
 *
 * Both numbers come from the server; this only chooses how to show the
 * comparison.
 */
export function stockTone(level: number, minimum: number | null): Tone {
  if (level <= 0) return 'error'
  if (minimum !== null && level < minimum) return 'warning'
  return 'success'
}
