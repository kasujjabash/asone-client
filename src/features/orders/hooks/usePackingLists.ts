/**
 * The delivery slips for an order.
 *
 * Fetched on demand rather than with the order: most visits to this screen
 * never print, and the endpoint is refused outright for School Staff, so
 * requesting it eagerly would put a 403 in the console on every school
 * clerk's order page.
 */

import { useQuery } from '@tanstack/react-query'
import * as ordersApi from '@/api/orders'

export function usePackingLists(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ['orders', 'packing-lists', id],
    queryFn: () => ordersApi.packingLists(id),
    enabled,
    // A shipped order's slips do not change.
    staleTime: 5 * 60 * 1000,
  })
}
