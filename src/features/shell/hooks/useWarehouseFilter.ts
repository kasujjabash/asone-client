/**
 * Read the current warehouse filter.
 *
 * Throws outside the provider — a wiring mistake that would otherwise show up
 * as every screen quietly showing all warehouses.
 */

import { useContext } from 'react'
import { WarehouseFilterContext, type WarehouseFilter } from '../WarehouseFilterContext'

export function useWarehouseFilter(): WarehouseFilter {
  const value = useContext(WarehouseFilterContext)
  if (!value) throw new Error('useWarehouseFilter must be used inside <WarehouseFilterProvider>')
  return value
}
