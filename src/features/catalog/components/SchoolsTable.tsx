/**
 * The schools list table.
 *
 * Same table shape as the reports ledger (`.ledger`, `.table-scroll`) — one
 * data-table language across the app.
 *
 * Type, Address, Primary Warehouse, Active Orders and Status are all real
 * fields now (`School.is_active`, and `active_orders_count` — annotated on
 * the server, see `SchoolViewSet.get_queryset` for exactly what "active"
 * counts). "Students" is the one column with nothing behind it: AsOne has
 * no student roster anywhere in the system — a student is a free-text name
 * on an order, not a record — so it reads as a dash rather than an invented
 * number, the same rule `KpiRow` follows for a figure that hasn't arrived.
 */

import { School as SchoolIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, Pagination } from '@/components'
import { paths } from '@/routes/paths'
import type { School } from '@/api/types'

const STUDENTS_NOT_AVAILABLE_TITLE =
  'AsOne has no student roster yet — a student is a free-text name on an order, not a record'

/** DRF's fixed page size — see API_ENDPOINTS.md. */
const PAGE_SIZE = 50

interface SchoolsTableProps {
  schools: School[]
  /** Before the client-side text filter — the server's own count for this page of filters. */
  totalCount: number
  loading: boolean
  page: number
  onPageChange: (page: number) => void
  onAdd: () => void
}

export function SchoolsTable({
  schools,
  totalCount,
  loading,
  page,
  onPageChange,
  onAdd,
}: SchoolsTableProps) {
  const pageCount = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)

  if (loading) {
    return (
      <div className="skeleton-stack" aria-hidden>
        <span className="skeleton" style={{ height: 40 }} />
        <span className="skeleton" style={{ height: 40 }} />
        <span className="skeleton" style={{ height: 40 }} />
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <EmptyState
        icon={SchoolIcon}
        title="No schools match this filter"
        body="Try a different type, warehouse, or search term — or add the first school for this filter."
        action={{ label: '+ Add School', onClick: onAdd }}
      />
    )
  }

  return (
    <>
      <div className="table-scroll">
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col">School Name</th>
              <th scope="col">Type</th>
              <th scope="col">Address</th>
              <th scope="col">Primary Warehouse</th>
              <th scope="col" className="ledger__num">
                Active Orders
              </th>
              <th scope="col" className="ledger__num" title={STUDENTS_NOT_AVAILABLE_TITLE}>
                Students
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>
                  <Link className="link-accent" to={paths.schoolDetail(school.id)}>
                    {school.name}
                  </Link>
                </td>
                <td>
                  <Badge tone={school.level === 'HS' ? 'neutral' : 'info'}>
                    {school.level_display}
                  </Badge>
                </td>
                <td>{school.address || '—'}</td>
                <td>{school.primary_warehouse_name}</td>
                <td className="ledger__num">{school.active_orders_count}</td>
                <td className="ledger__num" title={STUDENTS_NOT_AVAILABLE_TITLE}>
                  —
                </td>
                <td>
                  <Badge tone={school.is_active ? 'success' : 'neutral'}>
                    {school.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        totalItems={totalCount}
        pageSize={PAGE_SIZE}
        onChange={onPageChange}
        noun="schools"
      />
    </>
  )
}
