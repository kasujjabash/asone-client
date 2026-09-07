/**
 * Recent Activity — Figma 2001:914.
 *
 * From `/dashboard/activity/`, which spans receipts, orders, adjustments and
 * production orders — the mixed feed the design shows. Each entry arrives
 * described, so the client is not reconstructing sentences from ledger rows
 * and getting the grammar subtly wrong.
 */

import { Panel, SkeletonRows } from '@/components'
import { relativeTime } from '@/domain/dates'
import { activityTone } from '@/domain/status'
import { PREVIEW } from '../previewLimits'
import type { DashboardData } from '../hooks/useDashboardData'

export function ActivityTimeline({ data }: { data: DashboardData }) {
  const { activity, loading } = data
  const shown = activity.slice(0, PREVIEW.activity)

  return (
    <Panel
      title="Recent Activity"
      tone="sunken"
      minHeight="var(--panel-h-activity)"
      busy={loading.activity}
      viewAll={
        activity.length > shown.length
          ? { to: '/inventory', total: activity.length, noun: 'events' }
          : undefined
      }
    >
      {loading.activity ? (
        <SkeletonRows rows={4} />
      ) : activity.length === 0 ? (
        <p className="panel__clear">Nothing has happened at this location yet.</p>
      ) : (
        <ol className="timeline">
          {shown.map((event) => (
            <li className="timeline__entry" key={`${event.kind}-${event.reference}-${event.at}`}>
              <span
                className={`timeline__dot timeline__dot--${activityTone(event.kind)}`}
                aria-hidden
              />
              <span className="timeline__body">
                <b>{event.description}</b>
                <small>{relativeTime(event.at)}</small>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}
