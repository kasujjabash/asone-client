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
  /**
   * What to print in the topbar and as a page heading.
   *
   * Never null, and never "All locations" for a role that does not have all
   * locations. A school clerk is scoped to their school, which has no
   * warehouse of its own on the user record — reading their blank warehouse
   * name as "all" told them the exact opposite of the truth.
   */
  siteLabel: string
  /** Empty when the signed-in role has no choice to make. */
  options: Warehouse[]
  /** False for a warehouse-scoped role — the server decides for them. */
  canSwitch: boolean
  select: (warehouseId: number | null) => void
}

export const WarehouseFilterContext = createContext<WarehouseFilter | null>(null)
