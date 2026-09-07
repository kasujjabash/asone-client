/**
 * Everything the dashboard shows.
 *
 * Four requests to the server's own dashboard app, which exists to answer
 * exactly these questions. It replaced a client-side roll-up that summed
 * stock rows, counted paginated reports and merged the warehouse list by
 * hand — all of which the server now does, and does better:
 *
 *   `inventory_value` and each warehouse's `value` arrive computed, so money
 *   is read rather than summed here.
 *
 *   Warehouses with no stock are already included, at zero.
 *
 *   Alert wording and severity come from the server, so the dashboard and
 *   the screens behind it cannot describe the same problem differently.
 *
 * Each figure is its own query, so a slow or forbidden one cannot blank the
 * rest of the screen, and every query is keyed on the warehouse filter so
 * switching site refetches rather than relabelling another site's numbers.
 */

import { useQueries } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import { keys } from '@/api/keys'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'
import type {
  ActivityEvent,
  AttentionAlert,
  DashboardSummary,
  Money,
  WarehouseInventory,
} from '@/api/types'

export interface DashboardData {
  summary: DashboardSummary | null
  alerts: AttentionAlert[]
  activity: ActivityEvent[]
  warehouses: WarehouseInventory[]
  totalSkus: number | null
  totalValue: Money | null
  loading: {
    summary: boolean
    alerts: boolean
    activity: boolean
    warehouses: boolean
  }
}

export function useDashboardData(): DashboardData {
  const { warehouseId } = useWarehouseFilter()
  const scope = { warehouse: warehouseId }

  const [summary, attention, activity, byWarehouse] = useQueries({
    queries: [
      {
        queryKey: keys.summary(warehouseId),
        queryFn: () => dashboardApi.summary(scope),
      },
      {
        queryKey: keys.attention(warehouseId),
        queryFn: () => dashboardApi.attention(scope),
      },
      {
        queryKey: keys.activity(warehouseId),
        queryFn: () => dashboardApi.activity(scope),
      },
      {
        queryKey: keys.inventoryByWarehouse(warehouseId),
        queryFn: () => dashboardApi.inventoryByWarehouse(scope),
      },
    ],
  })

  /*
   * `/dashboard/inventory-by-warehouse/` advertises `?warehouse=` and then
   * ignores it — verified against the server: warehouse=2 and warehouse=3
   * both return every warehouse. Every other dashboard endpoint honours it
   * (summary returns 1050 units for Namayemba and 0 for Serere), so the
   * filter looked broken on the one panel that names warehouses.
   *
   * Narrowing the list here keeps the panel consistent with the filter above
   * it. This is presentation of a filter the user chose, not row-level
   * scoping — that stays the server's job, and this endpoint has already
   * applied it.
   *
   * Remove once the server honours the parameter.
   */
  const allWarehouses = byWarehouse.data?.warehouses ?? []
  const warehouses =
    warehouseId === null
      ? allWarehouses
      : allWarehouses.filter((row) => row.warehouse_id === warehouseId)

  return {
    summary: summary.data ?? null,
    alerts: attention.data ?? [],
    activity: activity.data ?? [],
    warehouses,
    totalSkus: byWarehouse.data?.total_skus ?? null,
    totalValue: byWarehouse.data?.total_value ?? null,
    loading: {
      summary: summary.isLoading,
      alerts: attention.isLoading,
      activity: activity.isLoading,
      warehouses: byWarehouse.isLoading,
    },
  }
}
