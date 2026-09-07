/**
 * A dashboard KPI tile — Figma 2001:802.
 *
 * Structurally different from the shared `StatCard` (design system §06), and
 * deliberately its own component rather than a restyle of it: here the icon
 * pairs with the *figure* and the category label sits underneath, where
 * StatCard pairs the icon with the label and leads with the figure. Forcing
 * one into the other with CSS ordering cannot regroup the icon, and would
 * break the moment either design moved.
 *
 * `value` is a string. Every figure on this screen is either formatted money
 * or a formatted count, and neither should arrive as a raw number.
 */

import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  /** The category, shown last — "Available Stock". */
  label: string
  /** The figure, already formatted — "16,482", "UGX 48.2M", or "—". */
  value: string
  /** What the figure means — "Items ready in bins". */
  caption: string
  icon: LucideIcon
  /** Draws attention without implying failure. */
  tone?: 'default' | 'alert'
}

export function KpiCard({ label, value, caption, icon: Icon, tone = 'default' }: KpiCardProps) {
  return (
    <div className={`kpi${tone === 'alert' ? ' kpi--alert' : ''}`}>
      <p className="kpi__figure">
        <Icon size={18} aria-hidden className="kpi__icon" />
        <span className="kpi__value t-numeric">{value}</span>
      </p>
      <p className="kpi__caption">{caption}</p>
      <p className="kpi__label">{label}</p>
    </div>
  )
}
