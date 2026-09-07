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
import { NAVIGATION, type NavGroup } from './navigation'

export function visibleNavigation(user: CurrentUser | null): NavGroup[] {
  if (!user) return []

  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.requires === null || can(user, item.requires)),
  })).filter(
    // A section label with nothing under it is noise — drop the whole group.
    (group) => group.items.length > 0,
  )
}
