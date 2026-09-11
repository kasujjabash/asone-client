/**
 * Every Tailoring Center, for a picker — the Warehouse form's "primary
 * tailoring center" select. Same reasoning as `useWarehouseOptions`: there
 * are three of these today, so no pagination handling is worth building yet.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'

export function useTailoringCenterOptions() {
  const { data, isLoading } = useQuery({
    queryKey: keys.tailoringCenters(),
    queryFn: () => catalogApi.tailoringCenters(),
    staleTime: 10 * 60 * 1000,
  })

  return { tailoringCenters: data?.results ?? [], isLoading }
}
