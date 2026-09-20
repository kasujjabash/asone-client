/**
 * Every size, for the Inventory filter bar and the Create SKU form.
 *
 * Same reasoning as `useWarehouseOptions` — a short, rarely-changing list,
 * so one unpaginated fetch is fine.
 *
 * Fetched only for the roles that may read it. Sizes are Finance and the
 * leads on AsOne's matrix, and the Inventory screen is open to everyone — so
 * a warehouse clerk and a school clerk were each fetching a 403 on every
 * visit for a filter they cannot use. The filter bar reads an empty list the
 * same way it reads a pending one.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'
import { canReadSizes } from '@/domain/access'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useSizeOptions() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: keys.sizes(),
    queryFn: () => catalogApi.sizes({ page_size: 200 }),
    staleTime: 10 * 60 * 1000,
    enabled: canReadSizes(user),
  })

  return { sizes: data?.results ?? [], isLoading }
}
