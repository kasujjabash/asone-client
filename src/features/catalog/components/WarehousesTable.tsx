/**
 * The warehouses list table. Same shape as `TailoringCentersTable` — no
 * detail screen, edit happens inline via the pencil icon.
 */

import { Pencil, Warehouse as WarehouseIcon } from 'lucide-react'
import { Button, EmptyState, Pagination } from '@/components'
import type { Warehouse } from '@/api/types'

const PAGE_SIZE = 50

interface WarehousesTableProps {
  warehouses: Warehouse[]
  totalCount: number
  loading: boolean
  page: number
  onPageChange: (page: number) => void
  onAdd: () => void
  onEdit: (warehouse: Warehouse) => void
}

export function WarehousesTable({
  warehouses,
  totalCount,
  loading,
  page,
  onPageChange,
  onAdd,
  onEdit,
}: WarehousesTableProps) {
  const pageCount = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)

  if (loading) {
    return (
      <div className="skeleton-stack" aria-hidden>
        <span className="skeleton" style={{ height: 40 }} />
        <span className="skeleton" style={{ height: 40 }} />
      </div>
    )
  }

  if (warehouses.length === 0) {
    return (
      <EmptyState
        icon={WarehouseIcon}
        title="No warehouses match this search"
        body="Try a different search term, or add the first warehouse."
        action={{ label: '+ Add Warehouse', onClick: onAdd }}
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
              <th scope="col">Primary Tailoring Center</th>
              <th scope="col" style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td className="schools-table__td-name">{warehouse.name}</td>
                <td className="schools-table__td-muted">{warehouse.address || '—'}</td>
                <td className="schools-table__td-muted">
                  {warehouse.primary_tailoring_center_name || '—'}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(warehouse)}
                    aria-label={`Edit ${warehouse.name}`}
                  >
                    <Pencil size={16} aria-hidden />
                  </Button>
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
        noun="warehouses"
      />
    </>
  )
}
