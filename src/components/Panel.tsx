/**
 * A titled block of content.
 *
 * The dashboard had four of these with the header markup written out each
 * time; every screen after it will want the same thing, so it is one
 * component with one place to change.
 *
 * The `viewAll` slot exists because a home screen shows a *preview*. Panels
 * here are summaries — the first few warehouses, the last few movements —
 * and the link is how someone reaches the rest. It appears only when there
 * is more to see, and it says how much more, because "View all" without a
 * number tells you nothing about whether it is worth the click.
 */

import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ViewAll {
  to: string
  /** Total available, so the link can say what it leads to. */
  total: number
  /** Plural noun — "warehouses", "movements". */
  noun: string
}

interface PanelProps {
  title: string
  /** A figure or note aligned to the right of the title. */
  meta?: ReactNode
  /** Shown when there is more than this panel is displaying. */
  viewAll?: ViewAll
  /** Draws the muted variant used for secondary panels. */
  tone?: 'surface' | 'sunken'
  /** Marks the region busy while its content loads. */
  busy?: boolean
  /**
   * A floor, not a fixed height — the design gives these panels set sizes so
   * the dashboard's two columns line up. Holding the size means an empty or
   * loading panel occupies the same space as a full one, so nothing on the
   * screen moves as data arrives.
   */
  minHeight?: string
  children: ReactNode
}

export function Panel({
  title,
  meta,
  viewAll,
  tone = 'surface',
  busy = false,
  minHeight,
  children,
}: PanelProps) {
  return (
    <section
      className={`panel${tone === 'sunken' ? ' panel--sunken' : ''}`}
      style={minHeight ? { minHeight } : undefined}
      aria-busy={busy || undefined}
    >
      <header className="panel__head">
        <h2 className="panel__title">{title}</h2>
        {meta}
      </header>

      <div className="panel__body">{children}</div>

      {viewAll && (
        <Link className="panel__view-all" to={viewAll.to}>
          View all {viewAll.total} {viewAll.noun}
          <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </section>
  )
}
