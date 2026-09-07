/**
 * The report's four headline figures — Figma 58:3595 `kpi-row`.
 *
 * All four are derived from dated sources rather than `/dashboard/summary/`,
 * which takes no `as_of` and so always reports now — see the hook for why
 * that produced a page contradicting itself.
 *
 * Same tile as the dashboard, at the report's heavier 10% wash.
 *
 * "Low Stock" counts alerts, not SKUs. The server flags each configured
 * minimum-stock row — one per SKU per warehouse — that sits at or under its
 * floor, so a SKU low at both hubs counts twice. This report is never
 * narrowed to one warehouse, so the unit is always alerts.
 *
 * Two things follow from that rule and are worth knowing when reading the
 * figure: a SKU with no minimum configured is never flagged however low it
 * runs, and the comparison is `<=`, so sitting exactly on the minimum
 * counts.
 */

import { AlertTriangle, Boxes, Coins, PackageX } from 'lucide-react'
import { formatCompactUGX, formatQuantity } from '@/domain/money'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import type { StockReport } from '../hooks/useStockReport'

function figure(value: number | undefined | null, loading: boolean, suffix = ''): string {
  if (loading || value === null || value === undefined) return '—'
  return `${formatQuantity(value)}${suffix}`
}

export function ReportKpiRow({ report }: { report: StockReport }) {
  const { availableUnits, inventoryValue, lowStockAlerts, outOfStockCount, loading } = report

  return (
    <div className="kpi-row kpi-row--report">
      <KpiCard
        label="Total Available Stock"
        value={figure(availableUnits, loading.figures)}
        caption="Units physically in bins"
        icon={Boxes}
      />
      <KpiCard
        label="Total Valuation"
        value={loading.figures ? '—' : formatCompactUGX(inventoryValue)}
        caption="Stock at unit value"
        icon={Coins}
      />
      <KpiCard
        label="Low Stock"
        value={figure(
          lowStockAlerts,
          loading.figures,
          lowStockAlerts === 1 ? ' alert' : ' alerts',
        )}
        caption="At or below minimum, per warehouse"
        icon={AlertTriangle}
        tone={lowStockAlerts ? 'alert' : 'default'}
      />
      <KpiCard
        label="Out of Stock"
        value={figure(outOfStockCount, loading.stock, ' SKUs')}
        caption="Zero inventory at location"
        icon={PackageX}
        tone={outOfStockCount ? 'alert' : 'default'}
      />
    </div>
  )
}
