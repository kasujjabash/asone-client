/**
 * KPI data card — section 06.
 *
 * `value` is a string, not a number. Every figure worth putting on one of
 * these comes from the server already formatted or already summed — stock
 * levels, order totals, counts — and money in particular must never become a
 * JS number on the way to the screen.
 *
 * `emphasis` takes the accent border from the spec, not the error red: a
 * figure that needs attention should not read as a failure.
 */

import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  caption?: string
  icon?: LucideIcon
  emphasis?: boolean
  /** One fact, no headline figure — the spec's third variant. */
  inline?: boolean
}

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  emphasis = false,
  inline = false,
}: StatCardProps) {
  const classes = ['stat']
  if (emphasis) classes.push('stat--emphasis')
  if (inline) classes.push('stat--inline')

  if (inline) {
    return (
      <div className={classes.join(' ')}>
        {Icon && (
          <div className="stat__badge">
            <Icon size={18} aria-hidden />
          </div>
        )}
        <div>
          <div className="stat__label">{label}</div>
          <div className="stat__value">{value}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.join(' ')}>
      <div className="stat__head">
        <span className="stat__label">{label}</span>
        {Icon && <Icon className="stat__icon" size={18} aria-hidden />}
      </div>
      <div className="stat__value">{value}</div>
      {caption && <div className="stat__caption">{caption}</div>}
    </div>
  )
}
