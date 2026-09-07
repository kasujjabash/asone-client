/**
 * Orders per day.
 *
 * One request to `/dashboard/order-volume/`, which returns the series, its
 * total and its daily average already computed.
 *
 * This replaced a client-side roll-up over `/orders/school-orders/` that had
 * two problems the server's version does not: that endpoint answers **403
 * for both leads**, so the chart was unbuildable on the dashboard it was
 * drawn for, and it has no date-range filter, so a month meant paging
 * through the order list and capping the result.
 */

import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import { keys } from '@/api/keys'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'
import type { OrderVolumeDay } from '@/api/types'

export interface DailyOrders {
  days: OrderVolumeDay[]
  total: number
  average: number
  isLoading: boolean
}

export function useDailyOrders(): DailyOrders {
  const { warehouseId } = useWarehouseFilter()

  const { data, isLoading } = useQuery({
    queryKey: keys.orderVolume(warehouseId),
    queryFn: () => dashboardApi.orderVolume({ warehouse: warehouseId }),
  })

  return {
    days: data?.days ?? [],
    total: data?.total ?? 0,
    average: Math.round(data?.average_per_day ?? 0),
    isLoading,
  }
}
