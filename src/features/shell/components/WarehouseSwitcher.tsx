/**
 * Which warehouse the screens are showing.
 *
 * Defaults to all. A role tied to one site sees its name and no control,
 * because the server scopes their rows regardless of what the client asks
 * for — a picker there would imply a choice they do not have.
 */

import { ChevronDown, Warehouse } from 'lucide-react'
import { useWarehouseFilter } from '../hooks/useWarehouseFilter'

const ALL = 'all'

export function WarehouseSwitcher() {
  const { warehouseId, warehouseName, options, canSwitch, select } = useWarehouseFilter()

  if (!canSwitch) {
    return (
      <span className="topbar__site">
        <Warehouse size={16} aria-hidden />
        {warehouseName ?? 'All locations'}
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
