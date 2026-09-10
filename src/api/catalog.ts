/**
 * Catalog — master data.
 */

import { get, patch, post } from './http'
import type { Page, School, SchoolLevel, Sku, Warehouse } from './types'

export function warehouses(params?: { page?: number }) {
  return get<Page<Warehouse>>('/catalog/warehouses/', params ?? undefined)
}

// ---------------------------------------------------------------------------
// Schools — F12
// ---------------------------------------------------------------------------

export function schools(params?: {
  level?: SchoolLevel
  primary_warehouse?: number
  page?: number
}) {
  return get<Page<School>>('/catalog/schools/', params ?? undefined)
}

export function school(id: number) {
  return get<School>(`/catalog/schools/${id}/`)
}

export interface SchoolInput {
  name: string
  level: SchoolLevel
  address?: string
  primary_warehouse: number
}

export function createSchool(input: SchoolInput) {
  return post<School>('/catalog/schools/', input)
}

/** Schools cannot be deleted — PATCH is the only way to change one. */
export function updateSchool(id: number, input: Partial<SchoolInput>) {
  return patch<School>(`/catalog/schools/${id}/`, input)
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
