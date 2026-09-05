/**
 * Empty state — section 12.
 *
 * This system needs these more than most. Row-level scoping happens on the
 * server and is invisible from here, so a warehouse clerk's list coming back
 * empty is frequently a *correct* answer, not a fault. The copy a caller
 * passes must say what is true — "no orders on hold at your warehouse" —
 * rather than implying something failed or was lost.
 *
 * The action is optional, and its variant carries meaning:
 *
 *   primary    the recommended next step ("Request sync")
 *   secondary  a way back out of the user's own query ("Reset filters")
 */

import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface EmptyStateProps {
  title: string
  /** One or two lines. Say what is true, and what to do about it. */
  body?: string
  icon?: LucideIcon
  action?: EmptyStateAction
}

export function EmptyState({ title, body, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon size={22} aria-hidden />
      </div>

      <p className="empty__title">{title}</p>
      {body && <p className="empty__body">{body}</p>}

      {action && (
        <div className="empty__action">
          <Button variant={action.variant ?? 'primary'} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
