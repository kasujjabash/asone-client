/**
 * Warehouses — master data list.
 *
 * `primary_tailoring_center` is a real server-side filter
 * (`WarehouseViewSet.filterset_fields`); name search narrows only the
 * fetched page, same gap as everywhere else in this feature.
 */

import { useQuery } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import { keys } from '@/api/keys'
import type { Warehouse } from '@/api/types'

export interface WarehouseFilters {
  tailoringCenterId: number | null
  query: string
  page: number
}

function filterByName(warehouses: Warehouse[], query: string): Warehouse[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return warehouses
  return warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(needle) ||
      (warehouse.address ?? '').toLowerCase().includes(needle),
  )
}

export function useWarehouses(filters: WarehouseFilters) {
  const { data, isLoading, isError } = useQuery({
    queryKey: keys.warehousesList(filters.tailoringCenterId, filters.page),
    queryFn: () =>
      catalogApi.warehouses({
        primary_tailoring_center: filters.tailoringCenterId ?? undefined,
        page: filters.page,
      }),
  })

  return {
    warehouses: filterByName(data?.results ?? [], filters.query),
    totalCount: data?.count ?? 0,
    isLoading,
    isError,
  }
}
