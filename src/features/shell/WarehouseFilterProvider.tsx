/**
 * Owns the warehouse the dashboard is looking at.
 *
 * Defaults to **all warehouses**, and an all-locations role can narrow to
 * one. Every endpoint the dashboard uses takes `?warehouse=`, so narrowing is
 * a filter the server applies rather than anything counted here.
 *
 * A warehouse clerk gets no choice, and is not asked to make one: the server
 * scopes their rows to their own site regardless of what the client sends, so
 * offering a picker would imply a control they do not have. Their own
 * warehouse is pinned and `canSwitch` is false.
 *
 * The list is only fetched for roles that see all locations. School staff
 * would get a 403 from `/catalog/warehouses/`, so they are never asked.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as catalog from '@/api/catalog'
import { keys } from '@/api/keys'
import { homeWarehouseId, seesAllLocations } from '@/domain/access'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { WarehouseFilterContext, type WarehouseFilter } from './WarehouseFilterContext'

export function WarehouseFilterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const canSwitch = seesAllLocations(user)
  const pinned = homeWarehouseId(user)

  // All warehouses by default. A pinned role starts — and stays — on theirs.
  const [selected, setSelected] = useState<number | null>(null)

  const { data } = useQuery({
    queryKey: keys.warehouses(),
    queryFn: () => catalog.warehouses(),
    enabled: canSwitch,
    // Sites change about once a year; no reason to refetch them on a screen
    // change.
    staleTime: 10 * 60 * 1000,
  })

  const options = useMemo(() => data?.results ?? [], [data])

  const select = useCallback(
    (warehouseId: number | null) => {
      if (!canSwitch) return
      setSelected(warehouseId)
    },
    [canSwitch],
  )

  const value = useMemo<WarehouseFilter>(() => {
    const warehouseId = canSwitch ? selected : pinned
    const name = canSwitch
      ? (options.find((warehouse) => warehouse.id === warehouseId)?.name ?? null)
      : (user?.warehouse?.name ?? null)

    return { warehouseId, warehouseName: name, options, canSwitch, select }
  }, [canSwitch, selected, pinned, options, user, select])

  return (
    <WarehouseFilterContext.Provider value={value}>{children}</WarehouseFilterContext.Provider>
  )
}
