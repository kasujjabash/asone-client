/**
 * "Online · Synced just now" — Figma's top-bar indicator, now real.
 *
 * `state` reflects `api/syncStatus`, which only flips to 'unreachable'
 * once `http.ts` has confirmed against `/api/health/` that the server is
 * actually down — never a guess from one failed request, and sticky until
 * a request genuinely succeeds again.
 *
 * `lastSyncedAt` is when a request last actually reached the server —
 * "just now" is real elapsed time, not a hardcoded string. Static by
 * design: a dot and a label, no animation.
 */

import { useEffect, useState } from 'react'
import { getSync, onSyncChange, type Sync } from '@/api/syncStatus'

function relativeTime(date: Date | null): string {
  if (!date) return 'just now'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

export function SyncStatus() {
  const [sync, setSync] = useState<Sync>(getSync)

  useEffect(() => onSyncChange(setSync), [])

  // The relative label ages even while the state itself is unchanged, so a
  // light tick keeps "just now" honest without re-rendering the whole app.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const failed = sync.state === 'unreachable'

  return (
    <span className={`sync-status${failed ? ' sync-status--failed' : ''}`} role="status">
      <span className="sync-status__dot" aria-hidden />
      <span className="sync-status__online">{failed ? 'Offline' : 'Online'}</span>
      {!failed && (
        <span className="sync-status__detail">Synced {relativeTime(sync.lastSyncedAt)}</span>
      )}
    </span>
  )
}
