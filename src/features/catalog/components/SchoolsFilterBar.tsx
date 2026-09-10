/**
 * The schools list's filter bar.
 *
 * Matches the Figma design exactly: a plain white toolbar, each field its
 * own bordered pill, no wrapping colour band. (An earlier pass wrongly
 * reused the reports screen's teal `.filters` band here instead of matching
 * this screen's own design — don't repeat that; a different screen's
 * pattern is not "consistency" when this screen has its own.)
 *
 * Type and Warehouse are real, server-side filters (`SchoolViewSet`
 * supports `?level=` and `?primary_warehouse=`). Search narrows only the
 * page already on screen — see `useSchools` for why. Status is drawn to
 * match the design (a normal-looking field, not disabled) but is not wired
 * to anything: `School` has no active/inactive concept in the database, so
 * there is nothing behind it yet — worth raising at Monday's meeting rather
 * than inventing a field or visually flagging it as broken.
 */

import { Search } from 'lucide-react'
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
    <div className="toolbar">
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

      <span className="filters__field">
        {/* Not wired — School has no active/inactive field yet. Matches the
            design visually; ask Monday before this does anything. */}
        <select aria-label="Status" defaultValue="active">
          <option value="active">Status: Active</option>
        </select>
      </span>

      <Button onClick={onAdd}>+ Add School</Button>
    </div>
  )
}
