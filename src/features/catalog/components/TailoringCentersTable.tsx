/**
 * The tailoring centers list table.
 *
 * No detail screen exists for a Tailoring Center — nothing in the brief
 * calls for one, unlike Schools — so editing happens directly from the row
 * via the pencil icon, opening the same modal used to add one.
 */

import { Pencil, Warehouse as TailoringCenterIcon } from 'lucide-react'
import { EmptyState, Pagination } from '@/components'
import type { TailoringCenter } from '@/api/types'

const PAGE_SIZE = 50

interface TailoringCentersTableProps {
  tailoringCenters: TailoringCenter[]
  totalCount: number
  loading: boolean
  page: number
  onPageChange: (page: number) => void
  onAdd: () => void
  onEdit: (center: TailoringCenter) => void
}

export function TailoringCentersTable({
  tailoringCenters,
  totalCount,
  loading,
  page,
  onPageChange,
  onAdd,
  onEdit,
}: TailoringCentersTableProps) {
  const pageCount = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)

  if (loading) {
    return (
      <div className="skeleton-stack" aria-hidden>
        <span className="skeleton" style={{ height: 40 }} />
        <span className="skeleton" style={{ height: 40 }} />
      </div>
    )
  }

  if (tailoringCenters.length === 0) {
    return (
      <EmptyState
        icon={TailoringCenterIcon}
        title="No tailoring centers match this search"
        body="Try a different search term, or add the first tailoring center."
        action={{ label: '+ Add Tailoring Center', onClick: onAdd }}
      />
    )
  }

  return (
    <>
      <div className="schools-table-card">
        <table className="schools-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Address</th>
              <th scope="col" style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {tailoringCenters.map((center) => (
              <tr key={center.id}>
                <td className="schools-table__td-name">{center.name}</td>
                <td className="schools-table__td-muted">{center.address || '—'}</td>
                <td>
                  <button
                    type="button"
                    className="schools-table__edit-btn"
                    onClick={() => onEdit(center)}
                    aria-label={`Edit ${center.name}`}
                  >
                    <Pencil size={16} aria-hidden />
                  </button>
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
        noun="tailoring centers"
      />
    </>
  )
}
