/**
 * The KPI row — Figma 2001:801.
 *
 * Six tiles, every figure straight from `/dashboard/summary/`. A dash while
 * loading, never a zero standing in for "not known yet" — on this screen
 * zero is a real and meaningful answer.
 *
 * Two captions differ from the design, because the server answers a slightly
 * different question than the mockup's copy implies:
 *
 *   "Items to Pick / Waiting dispatch today" — `units_awaiting_pick` is a
 *   queue, not a daily figure; there is no per-day dispatch count.
 *
 *   "Inventory Value / Est. production cost" — `inventory_value` is stock at
 *   unit value. Estimated production cost is a different number and comes
 *   from the costed group-order report.
 *
 * Low stock is counted per warehouse, not per SKU. The server walks the
 * configured minimum-stock rows — one per SKU per warehouse — and flags each
 * one at or under its floor, so a SKU that is low at two sites counts twice.
 * Across all warehouses that makes it a count of alerts; narrowed to one it
 * is a count of SKUs. The unit says which, rather than calling both "SKUs".
 */

import { AlertTriangle, Boxes, Clock, ClipboardList, Coins, Truck } from 'lucide-react'
import { formatCompactUGX, formatQuantity } from '@/domain/money'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'
import type { DashboardData } from '../hooks/useDashboardData'
import { KpiCard } from './KpiCard'

/** A figure that has not arrived reads as a dash, not a zero. */
function figure(value: number | undefined, loading: boolean): string {
  if (loading || value === undefined) return '—'
  return formatQuantity(value)
}

export function KpiRow({ data }: { data: DashboardData }) {
  const { summary, loading } = data
  const { warehouseId } = useWarehouseFilter()
  const busy = loading.summary

  const lowStock = summary?.skus_below_minimum
  // One floor per SKU per warehouse: scoped to a site the count is SKUs,
  // across sites it is alerts.
  const lowStockUnit = warehouseId === null ? 'alert' : 'SKU'

  return (
    <div className="kpi-row">
      <KpiCard
        label="Available Stock"
        value={figure(summary?.available_units, busy)}
        caption="Items ready in bins"
        icon={Boxes}
      />
      <KpiCard
        label="Items to Pick"
        value={figure(summary?.units_awaiting_pick, busy)}
        caption="Awaiting picking"
        icon={ClipboardList}
      />
      <KpiCard
        label="Pending Shipments"
        value={figure(summary?.orders_awaiting_dispatch, busy)}
        caption="Picked, awaiting despatch"
        icon={Truck}
      />
      <KpiCard
        label="Backorders"
        value={figure(summary?.outstanding_backorders, busy)}
        caption="Outstanding lines"
        icon={Clock}
      />
      <KpiCard
        label="Low Stock"
        value={
          busy || lowStock === undefined
            ? '—'
            : `${formatQuantity(lowStock)} ${lowStockUnit}${lowStock === 1 ? '' : 's'}`
        }
        caption="At or below minimum"
        icon={AlertTriangle}
        tone={lowStock ? 'alert' : 'default'}
      />
      <KpiCard
        label="Inventory Value"
        value={busy ? '—' : formatCompactUGX(summary?.inventory_value)}
        caption="Stock at unit value"
        icon={Coins}
      />
    </div>
  )
}
