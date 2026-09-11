/**
 * Tailoring Centers — master data list.
 *
 * No server-side search on this endpoint's `search_fields` is wired into
 * `DEFAULT_FILTER_BACKENDS` (the same gap `useSchools` notes), so the text
 * filter here narrows only the page already fetched.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'
import type { TailoringCenter } from '@/api/types'

export interface TailoringCenterFilters {
  query: string
  page: number
}

function filterByName(centers: TailoringCenter[], query: string): TailoringCenter[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return centers
  return centers.filter(
    (center) =>
      center.name.toLowerCase().includes(needle) ||
      (center.address ?? '').toLowerCase().includes(needle),
  )
}

export function useTailoringCenters(filters: TailoringCenterFilters) {
  const { data, isLoading, isError } = useQuery({
    queryKey: keys.tailoringCentersList(filters.page),
    queryFn: () => catalogApi.tailoringCenters({ page: filters.page }),
  })

  return {
    tailoringCenters: filterByName(data?.results ?? [], filters.query),
    totalCount: data?.count ?? 0,
    isLoading,
    isError,
  }
}
