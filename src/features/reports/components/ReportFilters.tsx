/**
 * The report's filter bar — Figma 58:3595 `global-filters`.
 *
 * A teal bar with a date range, a warehouse note, a school selector and a
 * SKU search.
 *
 * The warehouse control is the **same filter as the top bar**, not a second
 * one. Two controls for the same thing can disagree, and then neither is
 * trustworthy — this reads and writes the shell's filter, so changing either
 * moves both. A role tied to one site sees its name and no control, because
 * the server scopes their rows regardless of what the client asks for.
 *
 * The School Selector has nothing behind it and is rendered inert. Stock is
 * held by warehouse, not by school — there is no school dimension on a stock
 * level to filter by. A school's only relationship to stock is which
 * warehouse serves it, and resolving that for a filter is server work.
 *
 * The SKU box filters on the client, because `SearchFilter` is missing from
 * the server's DEFAULT_FILTER_BACKENDS and `?search=` returns everything.
 */

import { CalendarRange, Filter, School, Warehouse } from 'lucide-react'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'

export interface ReportFilterState {
  asOf: string
  skuQuery: string
}

interface ReportFiltersProps {
  value: ReportFilterState
  onChange: (next: ReportFilterState) => void
  /** Called when the warehouse changes, so the table can reset its page. */
  onWarehouseChange?: () => void
}

const ALL = 'all'

export function ReportFilters({ value, onChange, onWarehouseChange }: ReportFiltersProps) {
  const { warehouseId, warehouseName, options, canSwitch, select } = useWarehouseFilter()

  return (
    <div className="filters">
      <label className="filters__field">
        <CalendarRange size={16} aria-hidden />
        <span className="filters__label">Stock as at</span>
        <input
          type="date"
          value={value.asOf}
          onChange={(event) => onChange({ ...value, asOf: event.target.value })}
        />
      </label>

      {canSwitch ? (
        <label className="filters__field">
          <Warehouse size={16} aria-hidden />
          <span className="filters__label">Warehouse</span>
          <select
            value={warehouseId === null ? ALL : String(warehouseId)}
            onChange={(event) => {
              const next = event.target.value
              select(next === ALL ? null : Number(next))
              onWarehouseChange?.()
            }}
          >
            <option value={ALL}>All warehouses</option>
            {options.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="filters__field filters__field--static">
          <Warehouse size={16} aria-hidden />
          <span className="filters__label">Warehouse</span>
          {warehouseName ?? 'All'}
        </span>
      )}

      <span className="filters__field filters__field--static" aria-disabled="true">
        <School size={16} aria-hidden />
        <span className="filters__label">School</span>
        <span title="Stock is held by warehouse; there is no school dimension to filter by">
          Not applicable
        </span>
      </span>

      <label className="filters__field filters__field--grow">
        <Filter size={16} aria-hidden />
        <input
          type="search"
          placeholder="Filter by SKU number or description"
          value={value.skuQuery}
          onChange={(event) => onChange({ ...value, skuQuery: event.target.value })}
        />
      </label>
    </div>
  )
}
