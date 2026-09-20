/**
 * Every warehouse, for a picker.
 *
 * There are two of these today, so no pagination handling is worth building
 * yet — the day a third or fourth warehouse makes that untrue, this is the
 * one place to add it.
 *
 * Fetched only for the roles that may read it. Warehouses are the leads,
 * warehouse staff and Finance; a school is refused. The Inventory screen is
 * open to every role, so a school clerk was fetching a 403 on every visit for
 * a picker they never see — their warehouse is fixed by the school they
 * belong to, and it is the only one they can be shown.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'
import { canReadWarehouses } from '@/domain/access'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useWarehouseOptions() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: keys.warehouses(),
    queryFn: () => catalogApi.warehouses(),
    staleTime: 10 * 60 * 1000,
    enabled: canReadWarehouses(user),
  })

  return { warehouses: data?.results ?? [], isLoading }
}
