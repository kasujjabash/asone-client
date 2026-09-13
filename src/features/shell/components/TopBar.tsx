/**
 * The top bar — Figma 2001:765.
 *
 * One thing in the design is deliberately not built here:
 *
 *   Search is inert until `SearchFilter` is added to the server's
 *   DEFAULT_FILTER_BACKENDS — every `search_fields` declaration in the
 *   catalog is currently dead, so the input would return everything.
 *
 * The "Online" indicator is real, not decorative — see `SyncStatus` and
 * `api/syncStatus.ts`. It reflects a confirmed server outage, not a guess,
 * and stays on "Sync failed" until a request actually succeeds again.
 */

import { HelpCircle, Search } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { SyncStatus } from './SyncStatus'
import { WarehouseSwitcher } from './WarehouseSwitcher'

interface TopBarProps {
  /** The current screen's name, shown as the leading chip. */
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <span className="topbar__chip">{title}</span>

        <WarehouseSwitcher />
      </div>

      <label className="topbar__search">
        <Search size={14} aria-hidden />
        <input type="search" placeholder="Search SKU, school, center…" disabled />
      </label>

      <div className="topbar__actions">
        <SyncStatus />
        <NotificationBell />
        <button type="button" className="topbar__icon-btn" aria-label="Help">
          <HelpCircle size={18} aria-hidden />
        </button>
      </div>
    </header>
  )
}
