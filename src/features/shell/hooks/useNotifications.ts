/**
 * The bell.
 *
 * `unread_count` drives the badge and the messages are already worded and
 * graded by the server, so the bell and the Needs Attention panel cannot
 * disagree about the same problem — they are the same source.
 *
 * Polled rather than pushed: there is no websocket, and a count that is a
 * minute stale is not misleading. Refetching on focus is deliberate here
 * even though it is off globally — coming back to the tab is exactly when
 * somebody wants to know what changed.
 */

import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import { keys } from '@/api/keys'
import { useWarehouseFilter } from './useWarehouseFilter'
import type { NotificationItem } from '@/api/types'

const POLL_MS = 60_000

export interface Notifications {
  unreadCount: number
  items: NotificationItem[]
  isLoading: boolean
}

export function useNotifications(): Notifications {
  const { warehouseId } = useWarehouseFilter()

  const { data, isLoading } = useQuery({
    queryKey: keys.notifications(warehouseId),
    queryFn: () => dashboardApi.notifications({ warehouse: warehouseId }),
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })

  return {
    unreadCount: data?.unread_count ?? 0,
    items: data?.notifications ?? [],
    isLoading,
  }
}
