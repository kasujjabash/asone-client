/**
 * School orders and the reports over them.
 *
 * The report endpoints are paginated, which is convenient for a dashboard:
 * `count` answers "how many" without fetching a single row.
 */

import { get } from './http'
import type { OrderOnHold, Page, SchoolOrder } from './types'

/** Orders placed but not yet paid for. */
export function ordersOnHold(params?: { page?: number }) {
  return get<Page<OrderOnHold>>('/orders/reports/on-hold/', params ?? undefined)
}

/** Picked but not despatched — the shipping queue. */
export function ordersPartProcessed(params?: { page?: number }) {
  return get<Page<SchoolOrder>>('/orders/reports/part-processed/', params ?? undefined)
}

/**
 * Backorders outstanding.
 *
 * The report distinguishes what each one is waiting on: OPEN means nobody
 * has taken it, ASSIGNED means a warehouse has and has not shipped yet.
 * Different problems, so a tile should show the split rather than one total.
 */
export function outstandingBackorders(params?: { page?: number }) {
  return get<Page<Record<string, unknown>>>('/orders/reports/backorders/', params ?? undefined)
}

export function schoolOrders(params?: { status?: string; order_date?: string; page?: number }) {
  return get<Page<SchoolOrder>>('/orders/school-orders/', params ?? undefined)
}
