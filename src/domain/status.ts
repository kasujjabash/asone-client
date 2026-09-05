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
