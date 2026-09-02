/**
 * Who may see what.
 *
 * Pure predicates over a user. No fetching, no components — so a test can
 * assert the whole navigation model without rendering anything.
 *
 * Two things this deliberately does not do:
 *
 *   It does not name roles. AsOne's access matrix is served by the backend
 *   as seven boolean columns per role; asking `can(user, 'school_orders')`
 *   means a change to one cell of that matrix stays a backend change. A
 *   frontend that branches on `role === 'FINANCE'` has copied the matrix,
 *   and the copy goes stale silently.
 *
 *   It does not decide which *rows* a user sees. That is `scope_to_user_site`
 *   on the server, it is invisible from here, and a warehouse clerk's list
 *   request simply comes back containing their own site only. Never filter a
 *   scoped list client-side, and never read an empty list as an error — it
 *   may be a correct, scoped, empty answer.
 *
 * All of this is advisory. Hiding a control is cosmetic; the server re-checks
 * every request, so a 403 is always possible and must still be handled.
 */

import type { AccessFunction, CurrentUser, Scope } from '@/api/types'

/** Does this user hold this column of the access matrix? */
export function can(user: CurrentUser | null, fn: AccessFunction): boolean {
  return user?.access.functions[fn] === true
}

/** Does this user hold at least one of these columns? */
export function canAny(user: CurrentUser | null, fns: readonly AccessFunction[]): boolean {
  return fns.some((fn) => can(user, fn))
}

export function scopeOf(user: CurrentUser | null): Scope | null {
  return user?.access.scope ?? null
}

/** All locations, rather than a single assigned site. */
export function seesAllLocations(user: CurrentUser | null): boolean {
  return scopeOf(user) === 'all_locations'
}

/**
 * The one warehouse this user is tied to, or null for an all-locations role.
 *
 * Useful for defaulting a warehouse picker; not for filtering, which the
 * server has already done.
 */
export function homeWarehouseId(user: CurrentUser | null): number | null {
  return user?.warehouse?.id ?? null
}

/** The one school this user is tied to, or null. */
export function homeSchoolId(user: CurrentUser | null): number | null {
  return user?.school?.id ?? null
}

/**
 * Where this user belongs, for showing next to their name. Null for an
 * all-locations role, which is a real answer and not missing data.
 */
export function siteLabel(user: CurrentUser | null): string | null {
  return user?.warehouse?.name ?? user?.school?.name ?? null
}

/**
 * True while the account is held at the password gate.
 *
 * The backend answers 403 on almost everything in this state — only
 * `/auth/me/`, `/auth/password/change/` and `/auth/logout/` are reachable.
 * A wall of 403s on a first sign-in is this flag, not broken permissions.
 */
export function mustChangePassword(user: CurrentUser | null): boolean {
  return user?.must_change_password === true
}

export function fullName(user: CurrentUser | null): string {
  if (!user) return ''
  const name = `${user.first_name} ${user.last_name}`.trim()
  return name || user.email
}

/** Initials for an avatar, falling back to the email's first letter. */
export function initials(user: CurrentUser | null): string {
  if (!user) return ''
  const first = user.first_name?.[0] ?? ''
  const last = user.last_name?.[0] ?? ''
  const both = `${first}${last}`.toUpperCase()
  return both || (user.email[0]?.toUpperCase() ?? '')
}
