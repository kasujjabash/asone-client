/**
 * Orders › ORD-2026-1205 : Status — Figma order-details.
 *
 * Where you are and the way back, which the detail screen was missing.
 */

import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function OrderBreadcrumb({ number }: { number: string }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link className="crumbs__link" to="/orders">
        Orders
      </Link>
      <ChevronRight size={14} aria-hidden className="crumbs__sep" />
      <span className="crumbs__current" aria-current="page">
        {number} : Status
      </span>
    </nav>
  )
}
