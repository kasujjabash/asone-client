/**
 * Warehouses — master data (F11), Locations & Administration.
 *
 * Same shape as Schools' filter bar, minus the fields Warehouse has no
 * equivalent of (Type, Status): search, a real server-side filter on
 * primary tailoring center, and add.
 */

import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/features/shell/components/AppShell'
import { AddWarehouseModal } from '../components/AddWarehouseModal'
import { WarehousesTable } from '../components/WarehousesTable'
import { useTailoringCenterOptions } from '../hooks/useTailoringCenterOptions'
import { useWarehouses, type WarehouseFilters } from '../hooks/useWarehouses'
import type { Warehouse } from '@/api/types'

const EMPTY_FILTERS: WarehouseFilters = { tailoringCenterId: null, query: '', page: 1 }
const ALL = 'all'

export function WarehousesScreen() {
  const [filters, setFilters] = useState<WarehouseFilters>(EMPTY_FILTERS)
  const [modalWarehouse, setModalWarehouse] = useState<Warehouse | null | undefined>(undefined)

  const { warehouses, totalCount, isLoading } = useWarehouses(filters)
  const { tailoringCenters } = useTailoringCenterOptions()

  function applyFilter(next: Partial<Omit<WarehouseFilters, 'page'>>) {
    setFilters((current) => ({ ...current, ...next, page: 1 }))
  }

  return (
    <AppShell title="Warehouses">
      <header className="page-head">
        <h1 className="page-head__title">Warehouses</h1>
        <p className="page-head__subtitle">
          Where finished stock is held before it ships to schools.
        </p>
      </header>

      <div className="schools-filter-card">
        <div className="schools-filter__search">
          <Search size={16} className="schools-filter__search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search warehouse name or address…"
            value={filters.query}
            onChange={(event) => applyFilter({ query: event.target.value })}
          />
        </div>

        <div className="schools-filter__select-wrapper">
          <select
            aria-label="Primary tailoring center"
            className="schools-filter__select"
            value={filters.tailoringCenterId === null ? ALL : String(filters.tailoringCenterId)}
            onChange={(event) => {
              const next = event.target.value
              applyFilter({ tailoringCenterId: next === ALL ? null : Number(next) })
            }}
          >
            <option value={ALL}>Tailoring Center: All</option>
            {tailoringCenters.map((tc) => (
              <option key={tc.id} value={tc.id}>
                {tc.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="schools-filter__chevron" aria-hidden />
        </div>

        <button
          type="button"
          className="schools-filter__add-btn"
          onClick={() => setModalWarehouse(null)}
        >
          + Add Warehouse
        </button>
      </div>

      <WarehousesTable
        warehouses={warehouses}
        totalCount={totalCount}
        loading={isLoading}
        page={filters.page}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        onAdd={() => setModalWarehouse(null)}
        onEdit={(warehouse) => setModalWarehouse(warehouse)}
      />

      <AddWarehouseModal
        // See the matching comment in TailoringCentersScreen: without a key
        // tied to which record this is, the form's internal state would not
        // reset between "add" and each "edit X".
        key={modalWarehouse === null ? 'add' : (modalWarehouse?.id ?? 'closed')}
        isOpen={modalWarehouse !== undefined}
        onClose={() => setModalWarehouse(undefined)}
        tailoringCenters={tailoringCenters}
        warehouse={modalWarehouse}
      />
    </AppShell>
  )
}
