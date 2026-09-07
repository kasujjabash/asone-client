/**
 * Reshaping stock levels for the reports screen.
 *
 * `/inventory/stock-levels/` returns one row per SKU per warehouse. The
 * report wants two other shapes: a SKU per row with a column per warehouse,
 * and stock grouped by garment for the comparison chart.
 *
 * Pure, and separate from any component, because this is the part worth
 * testing — a pivot that silently drops a warehouse produces a table that
 * looks right and is wrong.
 *
 * Reshaping, not recomputing: the only arithmetic is adding integer unit
 * counts and summing money in exact minor units, both because no endpoint
 * totals a SKU across warehouses.
 */

import { sumMoney } from '@/domain/money'
import type { Money, Sku, StockLevel } from '@/api/types'

export interface LedgerRow {
  skuId: number
  skuNumber: string
  description: string
  /** Units per warehouse id — absent means no stock recorded there. */
  byWarehouse: Map<number, number>
  totalUnits: number
  totalValue: Money
}

export interface CategoryRow {
  category: string
  /** Units per warehouse id. */
  byWarehouse: Map<number, number>
  totalUnits: number
}

export interface WarehouseColumn {
  id: number
  name: string
}

/**
 * Every warehouse mentioned by the rows, in a stable order.
 *
 * Taken from the data rather than a fixed list so the table's columns always
 * match what it is showing.
 */
export function warehouseColumns(rows: readonly StockLevel[]): WarehouseColumn[] {
  const byId = new Map<number, string>()
  for (const row of rows) byId.set(row.warehouse_id, row.warehouse_name)
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * One row per SKU, with units per warehouse and a total across them.
 *
 * Seeded from the SKU catalogue, not just the stock rows, so a SKU that has
 * never been stocked appears at zero instead of vanishing.
 *
 * That is not a cosmetic choice. `/inventory/stock-levels/` returns a row
 * only where the ledger has movements for that SKU, and `?include_zero=true`
 * does not change it — verified against the server: 33 active SKUs, 2 with
 * stock, and the flag returns the same 2. So a stock report built from that
 * response alone cannot show what is out of stock, which is the row somebody
 * actually has to act on.
 */
export function toLedgerRows(
  rows: readonly StockLevel[],
  skus: readonly Sku[] = [],
): LedgerRow[] {
  const bySku = new Map<number, LedgerRow & { values: Money[] }>()

  // Every active SKU starts at zero; stock rows then fill in what exists.
  for (const sku of skus) {
    if (sku.is_active === false) continue
    bySku.set(sku.id, {
      skuId: sku.id,
      skuNumber: sku.number,
      description: sku.description || sku.garment_name,
      byWarehouse: new Map(),
      totalUnits: 0,
      totalValue: '0.00',
      values: [],
    })
  }

  for (const row of rows) {
    const existing = bySku.get(row.sku_id)
    if (existing) {
      existing.byWarehouse.set(row.warehouse_id, row.level)
      existing.totalUnits += row.level
      existing.values.push(row.value)
    } else {
      bySku.set(row.sku_id, {
        skuId: row.sku_id,
        skuNumber: row.sku_number,
        description: row.sku_description,
        byWarehouse: new Map([[row.warehouse_id, row.level]]),
        totalUnits: row.level,
        totalValue: '0.00',
        values: [row.value],
      })
    }
  }

  return (
    [...bySku.values()]
      .map(({ values, ...row }) => ({ ...row, totalValue: sumMoney(values) }))
      /*
       * Newest SKU first.
       *
       * "Most recent" is the only reading available: a stock level carries no
       * date, so the report cannot order by when something last moved. The
       * control number is issued sequentially and never reused, which makes
       * it the closest thing to a creation order the data has. Ordering by
       * when stock last moved would need the ledger, which is a different
       * screen.
       */
      .sort((a, b) => Number(b.skuNumber) - Number(a.skuNumber))
  )
}

/**
 * SKUs with no stock anywhere.
 *
 * Counted from the rows above rather than from the stock response, for the
 * reason given there: a never-stocked SKU is missing from that response, not
 * reported at zero.
 */
export function countOutOfStock(rows: readonly LedgerRow[]): number {
  return rows.filter((row) => row.totalUnits <= 0).length
}

/**
 * Stock grouped by garment, for the category comparison.
 *
 * Needs the SKU list to know which garment a SKU belongs to — stock levels
 * carry a description but no garment id. A SKU missing from that list is
 * grouped under its own description rather than dropped, so the chart's
 * totals still add up to the table's.
 */
export function toCategoryRows(
  rows: readonly StockLevel[],
  skus: readonly Sku[],
): CategoryRow[] {
  const garmentBySku = new Map(skus.map((sku) => [sku.id, sku.garment_name]))
  const byCategory = new Map<string, CategoryRow>()

  for (const row of rows) {
    const category = garmentBySku.get(row.sku_id) ?? row.sku_description
    const existing = byCategory.get(category)

    if (existing) {
      existing.byWarehouse.set(
        row.warehouse_id,
        (existing.byWarehouse.get(row.warehouse_id) ?? 0) + row.level,
      )
      existing.totalUnits += row.level
    } else {
      byCategory.set(category, {
        category,
        byWarehouse: new Map([[row.warehouse_id, row.level]]),
        totalUnits: row.level,
      })
    }
  }

  return [...byCategory.values()].sort((a, b) => b.totalUnits - a.totalUnits)
}

/** Substring match over number and description — the SKU filter box. */
export function filterRows<T extends { skuNumber: string; description: string }>(
  rows: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...rows]
  return rows.filter(
    (row) =>
      row.skuNumber.toLowerCase().includes(needle) ||
      row.description.toLowerCase().includes(needle),
  )
}
