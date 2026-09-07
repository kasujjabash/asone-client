/**
 * The react-query client.
 *
 * Two defaults matter for this system:
 *
 *   `retry: shouldRetry` — a 403 must never be retried. The role is not going
 *   to change between attempts, and retrying turns one honest refusal into
 *   three. Same for 404 and 400. Only a network failure or a 5xx is worth a
 *   second go.
 *
 *   `staleTime` short rather than zero — stock levels are summed from the
 *   ledger on every read, so they are cheap to be slightly stale and
 *   expensive to refetch on every focus change. Anything that has just been
 *   moved is invalidated explicitly instead.
 *
 * Every failed **mutation** reports itself, because a write is something the
 * user did on purpose and silence reads as success. Failed **queries** do
 * not: a panel already shows its own empty or error state, and six panels
 * failing at once would bury the screen in identical messages.
 *
 * A mutation can opt out by setting `meta.silent`, for the rare case where
 * the caller shows the failure itself.
 */

import { MutationCache, QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
// The bus directly, not the components barrel: `api/` must not pull React
// in, and `snackbarBus` is deliberately free of it for exactly this reason.
import { snackbar } from '@/components/snackbar/snackbarBus'
import { toApiError } from './errors'

const NEVER_RETRY = new Set([400, 401, 403, 404, 405, 409, 429])

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status !== undefined && NEVER_RETRY.has(status)) return false
  }
  return failureCount < 2
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent) return
      const failure = toApiError(error)
      snackbar.error(failure.message, failure.isNetwork ? 'Nothing was saved.' : undefined)
    },
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
