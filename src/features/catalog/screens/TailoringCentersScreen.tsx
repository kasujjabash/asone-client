/**
 * Tailoring Centers — master data (F10), Locations & Administration.
 *
 * Simpler than Schools: no type, no warehouse, no status — a Tailoring
 * Center is just a name and an address. So the filter bar is just search,
 * and editing happens via a modal from the row rather than a separate
 * detail screen, since nothing calls for one.
 */

import { Search } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/features/shell/components/AppShell'
import { AddTailoringCenterModal } from '../components/AddTailoringCenterModal'
import { TailoringCentersTable } from '../components/TailoringCentersTable'
import { useTailoringCenters, type TailoringCenterFilters } from '../hooks/useTailoringCenters'
import type { TailoringCenter } from '@/api/types'

const EMPTY_FILTERS: TailoringCenterFilters = { query: '', page: 1 }

export function TailoringCentersScreen() {
  const [filters, setFilters] = useState<TailoringCenterFilters>(EMPTY_FILTERS)
  const [modalCenter, setModalCenter] = useState<TailoringCenter | null | undefined>(undefined)

  const { tailoringCenters, totalCount, isLoading } = useTailoringCenters(filters)

  return (
    <AppShell title="Tailoring Centers">
      <header className="page-head">
        <h1 className="page-head__title">Tailoring Centers</h1>
        <p className="page-head__subtitle">
          Where uniforms are made, before shipping to a warehouse.
        </p>
      </header>

      <div className="schools-filter-card">
        <div className="schools-filter__search">
          <Search size={16} className="schools-filter__search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search tailoring center name or address…"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({ ...current, query: event.target.value, page: 1 }))
            }
          />
        </div>

        <button
          type="button"
          className="schools-filter__add-btn"
          onClick={() => setModalCenter(null)}
        >
          + Add Tailoring Center
        </button>
      </div>

      <TailoringCentersTable
        tailoringCenters={tailoringCenters}
        totalCount={totalCount}
        loading={isLoading}
        page={filters.page}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        onAdd={() => setModalCenter(null)}
        onEdit={(center) => setModalCenter(center)}
      />

      <AddTailoringCenterModal
        // Forces a fresh mount per target: the modal's own `useState`
        // initializers only run once, so reusing one instance across "add"
        // and every "edit X" would show whichever record's data happened to
        // be there when it first mounted, not the one just clicked.
        key={modalCenter === null ? 'add' : (modalCenter?.id ?? 'closed')}
        isOpen={modalCenter !== undefined}
        onClose={() => setModalCenter(undefined)}
        center={modalCenter}
      />
    </AppShell>
  )
}
