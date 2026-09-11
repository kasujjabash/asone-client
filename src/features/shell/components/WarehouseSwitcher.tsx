/**
 * Which warehouse the screens are showing.
 *
 * Defaults to all. A role tied to one site sees its name and no control,
 * because the server scopes their rows regardless of what the client asks
 * for — a picker there would imply a choice they do not have.
 */

import { ChevronDown, School, Warehouse } from 'lucide-react'
import { scopeOf } from '@/domain/access'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWarehouseFilter } from '../hooks/useWarehouseFilter'

const ALL = 'all'

export function WarehouseSwitcher() {
  const { warehouseId, siteLabel, options, canSwitch, select } = useWarehouseFilter()
  const { user } = useAuth()

  if (!canSwitch) {
    // A school belongs to a school, not a warehouse — so it gets the school
    // icon and the school's name. It used to read "All locations", which is
    // the one thing a school-scoped user definitively does not have.
    const atSchool = scopeOf(user) === 'assigned_schools'
    const Icon = atSchool ? School : Warehouse

    return (
      <span className="topbar__site">
        <Icon size={16} aria-hidden />
        {siteLabel}
      </span>
    )
  }

  return (
    <span
      className={`topbar__site topbar__site--select${
        warehouseId !== null ? ' topbar__site--active' : ''
      }`}
    >
      <Warehouse size={16} aria-hidden />
      <select
        aria-label="Warehouse"
        value={warehouseId === null ? ALL : String(warehouseId)}
        onChange={(event) => {
          const next = event.target.value
          select(next === ALL ? null : Number(next))
        }}
      >
        <option value={ALL}>All warehouses</option>
        {options.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
      <ChevronDown size={12} aria-hidden />
    </span>
  )
}
