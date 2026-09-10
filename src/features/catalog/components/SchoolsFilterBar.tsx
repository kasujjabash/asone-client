/**
 * The schools list's filter bar.
 *
 * Same teal band as the reports screen (`ReportFilters`) — one filter-bar
 * language across the app, not a second one invented per screen.
 *
 * Type and Warehouse are real, server-side filters (`SchoolViewSet`
 * supports `?level=` and `?primary_warehouse=`). Search narrows only the
 * page already on screen — see `useSchools` for why. Status is drawn inert,
 * the same way `ReportFilters` draws the School field inert: `School` has no
 * active/inactive concept in the database yet, so there is nothing to filter
 * on. Worth raising at Monday's meeting rather than inventing a field.
 */

import { CircleDashed, Search, Tag, Warehouse as WarehouseIcon } from 'lucide-react'
import { Button } from '@/components'
import type { SchoolLevel, Warehouse } from '@/api/types'

interface SchoolsFilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  level: SchoolLevel | null
  onLevelChange: (value: SchoolLevel | null) => void
  warehouseId: number | null
  onWarehouseChange: (value: number | null) => void
  warehouses: Warehouse[]
  onAdd: () => void
}

const ALL = 'all'

export function SchoolsFilterBar({
  query,
  onQueryChange,
  level,
  onLevelChange,
  warehouseId,
  onWarehouseChange,
  warehouses,
  onAdd,
}: SchoolsFilterBarProps) {
  return (
    <div className="filters">
      <label className="filters__field filters__field--grow">
        <Search size={16} aria-hidden />
        <input
          type="search"
          placeholder="Search school name or address…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <span className="filters__field">
        <Tag size={16} aria-hidden />
        <select
          aria-label="School type"
          value={level ?? ALL}
          onChange={(event) => {
            const next = event.target.value
            onLevelChange(next === ALL ? null : (next as SchoolLevel))
          }}
        >
          <option value={ALL}>Type: All</option>
          <option value="PS">Primary School</option>
          <option value="HS">High School</option>
        </select>
      </span>

      <span className="filters__field">
        <WarehouseIcon size={16} aria-hidden />
        <select
          aria-label="Primary warehouse"
          value={warehouseId === null ? ALL : String(warehouseId)}
          onChange={(event) => {
            const next = event.target.value
            onWarehouseChange(next === ALL ? null : Number(next))
          }}
        >
          <option value={ALL}>Warehouse: All</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </span>

      <span className="filters__field filters__field--static" aria-disabled="true">
        <CircleDashed size={16} aria-hidden />
        <span
          title="Schools have no active/inactive status in the database yet"
        >
          Status: Not tracked
        </span>
      </span>

      <Button size="sm" onClick={onAdd}>
        + Add School
      </Button>
    </div>
  )
}
