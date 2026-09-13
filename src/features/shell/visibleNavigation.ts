/**
 * Which navigation a given user sees.
 *
 * Pure: a user in, the groups they hold out. Kept apart from the components
 * so the whole access model can be asserted in a test without rendering, and
 * so a wrong cell shows up as a failing assertion rather than a missing menu
 * item somebody notices in a demo.
 */

import { can } from '@/domain/access'
import type { CurrentUser } from '@/api/types'
import { NAVIGATION, type NavGroup, type NavItem, type NavRequirement } from './navigation'

/** A destination plus whether this user may actually open it. */
export interface NavItemView extends NavItem {
  allowed: boolean
}

export interface NavGroupView {
  label: string
  items: NavItemView[]
}

/**
 * Does this user meet a requirement?
 *
 * One implementation, shared by the sidebar and the route guard, so a
 * destination cannot be visible and unreachable — or hidden and reachable.
 */
export function meetsRequirement(
  user: CurrentUser | null,
  requires: NavRequirement,
): boolean {
  if (requires === null) return true
  if (typeof requires === 'function') return requires(user)
  return can(user, requires)
}

export function visibleNavigation(user: CurrentUser | null): NavGroup[] {
  if (!user) return []

  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => meetsRequirement(user, item.requires)),
  })).filter(
    // A section label with nothing under it is noise — drop the whole group.
    (group) => group.items.length > 0,
  )
}

/**
 * Every destination, with the ones this user may not open marked rather
 * than removed — the full rail the design draws.
 *
 * The server still refuses a forbidden route, and `RequireAccess` still
 * guards it; a disabled item cannot be clicked through to a 403. What this
 * changes is only whether somebody can see that the destination exists.
 */
export function fullNavigation(user: CurrentUser | null): NavGroupView[] {
  if (!user) return []

  return NAVIGATION.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      ...item,
      allowed: meetsRequirement(user, item.requires),
    })),
  }))
}
