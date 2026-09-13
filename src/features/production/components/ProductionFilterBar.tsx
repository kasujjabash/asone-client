/**
 * The filter band above the production order table.
 *
 * Search is applied on the client, the three dropdowns on the server.
 * That split is not arbitrary: `filterset_fields` covers status, tailoring
 * centre and warehouse, but there is no search on this endpoint — so
 * narrowing by PO number filters the page you are looking at, and says so
 * rather than pretending to search all 142.
 */

import { Search } from 'lucide-react'
import type { ProductionFilters } from '../hooks/useProductionOrders'
import type { TailoringCenter, Warehouse } from '@/api/types'

interface ProductionFilterBarProps {
  value: ProductionFilters
  onChange: (next: ProductionFilters) => void
  centers: TailoringCenter[]
  warehouses: Warehouse[]
}

const ANY = ''

/** The server's document statuses. Fulfilment is derived and not filterable. */
const STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function ProductionFilterBar({
  value,
  onChange,
  centers,
  warehouses,
}: ProductionFilterBarProps) {
  return (
    <div className="filter-bar">
      <label className="filter-bar__search">
        <Search size={16} aria-hidden />
        <input
          type="search"
          placeholder="Search PO number…"
          aria-label="Search PO number"
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
      </label>

      <label className="filter-bar__field">
        <span>TC:</span>
        <select
          aria-label="Tailoring center"
          value={value.tailoringCenter ?? ANY}
          onChange={(event) =>
            onChange({
              ...value,
              tailoringCenter: event.target.value ? Number(event.target.value) : null,
            })
          }
        >
          <option value={ANY}>All Centers</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-bar__field">
        <span>Destination:</span>
        <select
          aria-label="Destination warehouse"
          value={value.warehouse ?? ANY}
          onChange={(event) =>
            onChange({
              ...value,
              warehouse: event.target.value ? Number(event.target.value) : null,
            })
          }
        >
          <option value={ANY}>All Warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-bar__field">
        <span>Status:</span>
        <select
          aria-label="Status"
          value={value.status ?? ANY}
          onChange={(event) =>
            onChange({ ...value, status: event.target.value || null })
          }
        >
          <option value={ANY}>All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
