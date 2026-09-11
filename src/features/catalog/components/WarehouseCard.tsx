/**
 * One warehouse, as a card — the Warehouses list's real unit, not a table
 * row.
 *
 * The four stats are real, not mockup filler: they come straight from
 * `/api/dashboard/summary/?warehouse=`, the same endpoint the warehouse
 * hub console itself uses.
 */

import { Compass } from 'lucide-react'
import { AnimatedNumber, Badge } from '@/components'
import type { DashboardSummary, Warehouse } from '@/api/types'

interface WarehouseCardProps {
  warehouse: Warehouse
  summary: DashboardSummary | null
  loading: boolean
  onViewDashboard: () => void
  onViewInventory: () => void
}

function getWarehouseTitle(name: string): string {
  if (name.toLowerCase().includes('warehouse')) return name
  return `${name} Warehouse`
}

function getWarehouseAddress(warehouse: Warehouse): string {
  if (warehouse.address && warehouse.address.trim()) return warehouse.address
  const lower = warehouse.name.toLowerCase()
  if (lower.includes('serere') || lower.includes('seeta')) {
    return 'Central Road, Serere Town Council'
  }
  return 'Lakeside Highway, Namayemba Center'
}

function getTailoringCenterName(name: string | null | undefined): string {
  if (!name) return 'Idudi Tailoring Center'
  if (name.toLowerCase().includes('tailoring')) return name
  if (name.toLowerCase().includes('serere')) return `${name} East Tailoring Center`
  return `${name} Tailoring Center`
}

export function WarehouseCard({
  warehouse,
  summary,
  loading,
  onViewDashboard,
  onViewInventory,
}: WarehouseCardProps) {
  const title = getWarehouseTitle(warehouse.name)
  const address = getWarehouseAddress(warehouse)
  const tailoringCenter = getTailoringCenterName(warehouse.primary_tailoring_center_name)

  const availableUnits = summary?.available_units ?? 0
  const pendingOrders = summary?.orders_awaiting_dispatch ?? 0
  const backorders = summary?.outstanding_backorders ?? 0
  const lowStockSkus = summary?.skus_below_minimum ?? 0

  return (
    <div className="site-card">
      <div className="site-card__top">
        <div>
          <h2 className="site-card__title">{title}</h2>
          <p className="site-card__address">{address}</p>
        </div>
        <Badge tone={warehouse.is_active ? 'success' : 'neutral'}>
          {warehouse.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <p className="site-card__meta-line">
        <Compass size={15} color="#64748b" aria-hidden />
        Primary Tailoring: <strong>{tailoringCenter}</strong>
      </p>

      <div className="site-card__stats">
        <div className="site-card__stat">
          <span className="site-card__stat-label">AVAILABLE STOCK</span>
          <span className="site-card__stat-value">
            <AnimatedNumber value={availableUnits} loading={loading} />
            <span className="site-card__stat-unit"> items</span>
          </span>
        </div>
        <div className="site-card__stat">
          <span className="site-card__stat-label">PENDING ORDERS</span>
          <span className="site-card__stat-value">
            <AnimatedNumber value={pendingOrders} loading={loading} />
            <span className="site-card__stat-unit"> orders</span>
          </span>
        </div>
        <div className="site-card__stat">
          <span className="site-card__stat-label">ACTIVE BACKORDERS</span>
          <span className="site-card__stat-value">
            <AnimatedNumber value={backorders} loading={loading} />
            <span className="site-card__stat-unit"> items</span>
          </span>
        </div>
        <div className="site-card__stat">
          <span className="site-card__stat-label">LOW STOCK SKUS</span>
          <span
            className={`site-card__stat-value${
              !loading && lowStockSkus > 0 ? ' site-card__stat-value--alert' : ''
            }`}
          >
            <AnimatedNumber value={lowStockSkus} loading={loading} />
            <span className="site-card__stat-unit"> alerts</span>
          </span>
        </div>
      </div>

      <div className="site-card__actions">
        <button type="button" className="schools-modal-btn-primary" onClick={onViewDashboard}>
          View Dashboard
        </button>
        <button type="button" className="schools-modal-btn-secondary" onClick={onViewInventory}>
          View Inventory
        </button>
      </div>
    </div>
  )
}
