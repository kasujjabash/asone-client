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
import { homeWarehouseId, scopeOf, seesAllLocations } from '@/domain/access'
import { useOrgSettings } from '@/features/settings/hooks/useOrgSettings'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { WarehouseFilterContext, type WarehouseFilter } from './WarehouseFilterContext'

/**
 * What this user's screens are actually showing, in words.
 *
 * Only an all-locations role is ever told "All warehouses". A scoped role is
 * told the name of the one site they have, because that is what the server
 * is giving them — and a school clerk is told their *school*, not a
 * warehouse, since a school is the site they belong to.
 */
function siteLabelFor(
  user: ReturnType<typeof useAuth>['user'],
  canSwitch: boolean,
  selectedName: string | null,
): string {
  if (selectedName) return selectedName
  if (canSwitch) return 'All warehouses'
  if (scopeOf(user) === 'assigned_schools') return user?.school?.name ?? 'Your school'
  return user?.warehouse?.name ?? 'Your site'
}

export function WarehouseFilterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const canSwitch = seesAllLocations(user)
  const pinned = homeWarehouseId(user)

  /*
   * Where an all-locations session starts.
   *
   * `null` is "all warehouses". Settings carries a **Default Warehouse Hub**,
   * which is the setting's entire purpose — "the site a new session's
   * warehouse filter starts on", per its own help text — and until now
   * nothing read it, so a lead who set it went on landing on All warehouses
   * every morning.
   *
   * `touched` is what stops the default fighting the person. Seeding straight
   * into `selected` would put them back on the default the moment the
   * settings query resolved, even if they had already switched; and it would
   * make "All warehouses" unreachable, since choosing it sets `null` and null
   * is exactly what the seeding looks for. Once they have touched the picker
   * at all, including to choose All, this leaves them alone for the session.
   */
  const [selected, setSelected] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)

  /*
   * Only for a signed-in role that can switch. This provider wraps the public
   * routes as well, so an unguarded read fired a 401 on the sign-in screen —
   * and `canSwitch` is false without a user, which is also exactly when
   * `startOn` would be unused anyway.
   */
  const { data: settings } = useOrgSettings(canSwitch)
  const startOn = canSwitch && !touched ? (settings?.default_warehouse ?? null) : null

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
      setTouched(true)
      setSelected(warehouseId)
    },
    [canSwitch],
  )

  const value = useMemo<WarehouseFilter>(() => {
    const warehouseId = canSwitch ? (selected ?? startOn) : pinned
    const name = canSwitch
      ? (options.find((warehouse) => warehouse.id === warehouseId)?.name ?? null)
      : (user?.warehouse?.name ?? null)

    return {
      warehouseId,
      warehouseName: name,
      siteLabel: siteLabelFor(user, canSwitch, name),
      options,
      canSwitch,
      select,
    }
  }, [canSwitch, selected, startOn, pinned, options, user, select])

  return (
    <WarehouseFilterContext.Provider value={value}>{children}</WarehouseFilterContext.Provider>
  )
}
