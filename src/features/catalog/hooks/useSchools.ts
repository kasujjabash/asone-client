/**
 * Schools — master data list.
 *
 * Filtered server-side on level and primary warehouse. There is no
 * server-side name search on this endpoint — `SearchFilter` is not wired
 * into `SchoolViewSet`, the same gap `TopBar`'s search box already notes for
 * the app generally — so a text filter here can only narrow the page
 * already fetched, not the whole table. See `filterSchools` in
 * `ReportsScreen`'s sibling, `pivot.ts`, for the same shape of client-side
 * substring filter over a different resource.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'
import type { School, SchoolLevel } from '@/api/types'

export interface SchoolFilters {
  level: SchoolLevel | null
  warehouseId: number | null
  query: string
  page: number
}

export interface SchoolsResult {
  schools: School[]
  /** Before the client-side text filter — what the server actually holds. */
  totalCount: number
  isLoading: boolean
  isError: boolean
}

/** Substring match over name and address, narrowing only the current page. */
function filterSchools(schools: School[], query: string): School[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return schools
  return schools.filter(
    (school) =>
      school.name.toLowerCase().includes(needle) ||
      (school.address ?? '').toLowerCase().includes(needle),
  )
}

export function useSchools(filters: SchoolFilters): SchoolsResult {
  const { level, warehouseId, query, page } = filters

  const { data, isLoading, isError } = useQuery({
    queryKey: keys.schools(level, warehouseId, page),
    queryFn: () =>
      catalogApi.schools({
        level: level ?? undefined,
        primary_warehouse: warehouseId ?? undefined,
        page,
      }),
  })

  return {
    schools: filterSchools(data?.results ?? [], query),
    totalCount: data?.count ?? 0,
    isLoading,
    isError,
  }
}
