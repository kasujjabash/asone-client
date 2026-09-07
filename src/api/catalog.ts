/**
 * Catalog — master data.
 *
 * Only what the shell and dashboard need so far; the rest arrives with the
 * master-data phase.
 */

import { get } from './http'
import type { Page, Sku, Warehouse } from './types'

export function warehouses(params?: { page?: number }) {
  return get<Page<Warehouse>>('/catalog/warehouses/', params ?? undefined)
}

/**
 * SKUs, with the garment each belongs to.
 *
 * The reports screen needs the garment to group stock by category: stock
 * levels identify a SKU by number and description but carry no garment id,
 * so the two are joined on the client.
 */
export function skus(params?: {
  garment?: number
  size?: number
  is_active?: boolean
  page?: number
}) {
  return get<Page<Sku>>('/catalog/skus/', params ?? undefined)
}
