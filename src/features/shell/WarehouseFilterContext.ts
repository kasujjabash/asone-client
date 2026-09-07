/**
 * Which warehouse the screens are showing.
 *
 * Split from the provider so importing the context does not pull a component
 * graph with it.
 */

import { createContext } from 'react'
import type { Warehouse } from '@/api/types'

export interface WarehouseFilter {
  /** `null` means every warehouse the role may see. */
  warehouseId: number | null
  /** The name to show, or null when the filter is "all". */
  warehouseName: string | null
  /** Empty when the signed-in role has no choice to make. */
  options: Warehouse[]
  /** False for a warehouse-scoped role — the server decides for them. */
  canSwitch: boolean
  select: (warehouseId: number | null) => void
}

export const WarehouseFilterContext = createContext<WarehouseFilter | null>(null)
