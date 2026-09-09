/**
 * The filter row — Figma order-table.
 *
 * A wide "Filter orders…" box with School, Status and Date Range beside it,
 * matching the design's four controls and their order.
 *
 * All three narrow the page in hand rather than re-querying:
 *
 *   Search   `?search=` exists on the viewset but does nothing —
 *            `SearchFilter` is absent from DEFAULT_FILTER_BACKENDS, so
 *            sending it returns everything and looks broken.
 *   School   the server has no school filter on this endpoint.
 *   Status   the tabs already choose the server-side status; this narrows
 *            within one, which is the only thing it can usefully add.
 *
 * Because they narrow rather than re-query, the panel says "6 of 10 on this
 * page" when any is active, instead of implying it filtered all 234.
 */

import { Building2, CalendarRange, Filter, SlidersHorizontal } from 'lucide-react'
import type { School, SchoolOrderStatus } from '@/api/types'

export interface OrderFilterState {
  query: string
  schoolId: number | null
  status: SchoolOrderStatus | null
  orderDate: string
}

interface OrderFiltersProps {
  value: OrderFilterState
  onChange: (next: OrderFilterState) => void
  schools: School[]
  /** School staff see one school and are not offered a picker. */
  canPickSchool: boolean
  /** The statuses the current tab covers — the only ones worth offering. */
  statuses: SchoolOrderStatus[]
}

const ANY = 'any'

const STATUS_LABELS: Record<SchoolOrderStatus, string> = {
  HOLD: 'Hold',
  RELEASED: 'Released',
  PICKED: 'Picked',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function OrderFilters({
  value,
  onChange,
  schools,
  canPickSchool,
  statuses,
}: OrderFiltersProps) {
  return (
    <div className="order-filters">
      <label className="order-filters__search">
        <SlidersHorizontal size={16} aria-hidden />
        <input
          type="search"
          placeholder="Filter orders…"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
        />
      </label>

      {canPickSchool && (
        <label
          className={`order-filters__control${
            value.schoolId !== null ? ' order-filters__control--active' : ''
          }`}
        >
          <Building2 size={18} aria-hidden />
          <select
            aria-label="School"
            value={value.schoolId === null ? ANY : String(value.schoolId)}
            onChange={(event) => {
              const next = event.target.value
              onChange({ ...value, schoolId: next === ANY ? null : Number(next) })
            }}
          >
            <option value={ANY}>School: All</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label
        className={`order-filters__control${
          value.status !== null ? ' order-filters__control--active' : ''
        }`}
      >
        <Filter size={18} aria-hidden />
        <select
          aria-label="Status"
          value={value.status ?? ANY}
          onChange={(event) => {
            const next = event.target.value
            onChange({ ...value, status: next === ANY ? null : (next as SchoolOrderStatus) })
          }}
        >
          <option value={ANY}>Status: Any</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label
        className={`order-filters__control${
          value.orderDate ? ' order-filters__control--active' : ''
        }`}
      >
        <CalendarRange size={18} aria-hidden />
        {/* The server filters one exact `order_date`; there is no range. */}
        <input
          type="date"
          aria-label="Order date"
          value={value.orderDate}
          onChange={(event) => onChange({ ...value, orderDate: event.target.value })}
        />
      </label>
    </div>
  )
}
