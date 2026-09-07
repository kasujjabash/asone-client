/**
 * Procurement.
 */

import { get } from './http'
import type { Page, Receipt } from './types'

export function receipts(params?: { production_order?: number; page?: number }) {
  return get<Page<Receipt>>('/procurement/receipts/', params ?? undefined)
}
