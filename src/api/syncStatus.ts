/**
 * Whether the app can currently reach the server — the top bar's
 * "Online"/"Sync failed" indicator.
 *
 * Sourced from the same signal `http.ts` already verifies against
 * `/api/health/` before announcing (see `onServerUnreachable`): this never
 * guesses from a single failed request, only from a confirmed outage.
 *
 * Deliberately sticky. Once a failure is announced, the state stays
 * 'unreachable' until the next *successful* request clears it — a
 * transient blip should keep drawing attention rather than silently
 * reverting to "Online" a moment later while other requests are still
 * failing.
 */

import { http, onServerUnreachable } from './http'

export type SyncState = 'online' | 'unreachable'

export interface Sync {
  state: SyncState
  /** When a request last actually reached the server. Null before the
   * first one completes this session. */
  lastSyncedAt: Date | null
}

type Listener = (sync: Sync) => void

let sync: Sync = { state: 'online', lastSyncedAt: null }
const listeners = new Set<Listener>()

function setSync(next: Sync) {
  sync = next
  for (const listener of listeners) listener(sync)
}

export function getSync(): Sync {
  return sync
}

export function onSyncChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

onServerUnreachable(() => setSync({ ...sync, state: 'unreachable' }))

// The one place that clears the sticky failure and advances the "synced
// at" clock: any request that actually completes proves the server is
// reachable, right now. A second interceptor rather than folding this into
// http.ts's existing one, so that module stays about transport concerns
// and this one stays about the indicator.
http.interceptors.response.use(
  (response) => {
    setSync({ state: 'online', lastSyncedAt: new Date() })
    return response
  },
  (error) => {
    if (error?.response) {
      // Reached the server; it just refused the request. Still a sync.
      setSync({ state: 'online', lastSyncedAt: new Date() })
    }
    throw error
  },
)
