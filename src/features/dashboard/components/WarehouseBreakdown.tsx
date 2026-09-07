/**
 * Inventory by Warehouse — Figma 2001:953.
 *
 * From `/dashboard/inventory-by-warehouse/`, which already includes sites
 * holding nothing — at zero — and gives each one a computed value. The
 * client used to merge the warehouse list against stock rows to achieve the
 * first and sum decimal strings to achieve the second.
 *
 * Bars are scaled against the largest warehouse, so the comparison is honest
 * whatever the numbers are, and every label names the value its bar reaches.
 *
 * The per-bar value is an addition to the design, kept at ERA 92's request:
 * units alone do not say which warehouse is holding the money, and a site
 * with few but expensive garments can outweigh one with many cheap ones.
 */

import { Panel, SkeletonRows } from '@/components'
import { formatCompactUGX, formatQuantity } from '@/domain/money'
import { PREVIEW } from '../previewLimits'
import type { DashboardData } from '../hooks/useDashboardData'

export function WarehouseBreakdown({ data }: { data: DashboardData }) {
  const { warehouses, totalSkus, loading } = data

  const shown = warehouses.slice(0, PREVIEW.warehouses)
  // Scaled against the whole set, not the visible slice, so bars do not
  // rescale when the panel is expanded.
  const largest = warehouses.reduce((max, row) => Math.max(max, row.units), 0)

  return (
    <Panel
      title="Inventory by Warehouse"
      minHeight="var(--panel-h-warehouse)"
      busy={loading.warehouses}
      meta={
        totalSkus !== null && !loading.warehouses ? (
          <span className="panel__meta">Total SKUs: {formatQuantity(totalSkus)}</span>
        ) : undefined
      }
      viewAll={
        warehouses.length > shown.length
          ? { to: '/inventory', total: warehouses.length, noun: 'warehouses' }
          : undefined
      }
    >
      {loading.warehouses ? (
        <SkeletonRows rows={2} height="46px" />
      ) : warehouses.length === 0 ? (
        <p className="panel__clear">No stock recorded yet.</p>
      ) : (
        <div className="bars">
          {shown.map((row) => (
            <div className="bars__row" key={row.warehouse_id}>
              <div className="bars__label">
                <span>{row.warehouse_name}</span>
                <span className="t-numeric">{formatQuantity(row.units)} units</span>
              </div>
              <div className="bars__track">
                <div
                  className="bars__fill"
                  style={{ width: largest > 0 ? `${(row.units / largest) * 100}%` : '0%' }}
                />
              </div>
              <p className="bars__value">{formatCompactUGX(row.value)} at unit value</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
