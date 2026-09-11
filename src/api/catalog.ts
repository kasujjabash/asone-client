/**
 * Catalog — master data.
 *
 * Reads for the shell and dashboard, plus the Locations screens — tailoring
 * centers, warehouses and schools. The rest of the catalogue (garments,
 * sizes, SKUs, prices, kits) arrives with the master-data phase.
 */

import { get, patch, post } from './http'
import type { Page, School, Sku, TailoringCenter, Warehouse } from './types'

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
  /** Capped at 200 by the server's pagination class. */
  page_size?: number
}) {
  return get<Page<Sku>>('/catalog/skus/', params ?? undefined)
}

/** Schools, for the order list's school filter. */
export function schools(params?: { level?: string; page?: number }) {
  return get<Page<School>>('/catalog/schools/', params ?? undefined)
}

// ---------------------------------------------------------------------------
// Locations — Tailoring Centers, Warehouses, Schools
// ---------------------------------------------------------------------------
//
// Three tables and two relationships, and the relationships are the part
// worth getting right on screen:
//
//   Warehouse -> primary Tailoring Center   OPTIONAL. p.4: "warehouses have
//                a primary TC but can order on any TC", so it is a default
//                for production orders, not a restriction — and a warehouse
//                can exist before its TC does.
//   School    -> primary Warehouse          REQUIRED. A school orders from
//                one warehouse and no other. A backorder may still be filled
//                by a different warehouse shipping direct (decision D2), but
//                that is a fulfilment decision, not the school's choice.
//
// Writing is the two leads only. Warehouse and school staff may read.
// Nothing here is ever deleted: a site is referenced by every transaction
// that happened there, so `PROTECT` refuses and the API answers 409 naming
// what still points at it.

export function tailoringCenters(params?: { page?: number; search?: string }) {
  return get<Page<TailoringCenter>>('/catalog/tailoring-centers/', params ?? undefined)
}

export function createTailoringCenter(body: Partial<TailoringCenter>) {
  return post<TailoringCenter>('/catalog/tailoring-centers/', body)
}

export function updateTailoringCenter(id: number, body: Partial<TailoringCenter>) {
  return patch<TailoringCenter>(`/catalog/tailoring-centers/${id}/`, body)
}

export function createWarehouse(body: Partial<Warehouse>) {
  return post<Warehouse>('/catalog/warehouses/', body)
}

export function updateWarehouse(id: number, body: Partial<Warehouse>) {
  return patch<Warehouse>(`/catalog/warehouses/${id}/`, body)
}

export function createSchool(body: Partial<School>) {
  return post<School>('/catalog/schools/', body)
}

export function updateSchool(id: number, body: Partial<School>) {
  return patch<School>(`/catalog/schools/${id}/`, body)
}
