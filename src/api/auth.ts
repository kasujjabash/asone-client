/**
 * Authentication and the signed-in user.
 *
 * Thin by design: each function is one request and one type. No React, no
 * storage decisions beyond handing tokens to `tokens`, no navigation.
 */

import { get, post } from './http'
import { tokens } from './tokens'
import type { Credentials, CurrentUser, Page, RoleInfo, Session } from './types'

/**
 * Sign in. Returns the token pair *and* the whole user, so the app can render
 * without a second round-trip.
 *
 * Storing the tokens is this function's job because a caller that forgot
 * would leave the app authenticated in memory only.
 */
export async function login(credentials: Credentials): Promise<Session> {
  const session = await post<Session>('/auth/login/', credentials)
  tokens.set({ access: session.access, refresh: session.refresh })
  return session
}

/**
 * Sign out. Blacklists the refresh token server-side; the access token stays
 * valid until it expires, which is inherent to stateless tokens and why they
 * are short. Returns 205.
 *
 * Clears local tokens even if the request fails — the user asked to be signed
 * out, and leaving a usable token behind because the network hiccuped is the
 * wrong way to fail.
 */
export async function logout(): Promise<void> {
  const refresh = tokens.refresh
  try {
    if (refresh) await post('/auth/logout/', { refresh })
  } finally {
    tokens.clear()
  }
}

/** The signed-in user, same shape as login's `user`. */
export function me(): Promise<CurrentUser> {
  return get<CurrentUser>('/auth/me/')
}

/**
 * Change your own password.
 *
 * Requires the current password even though you are signed in, so a stolen
 * token alone cannot lock the owner out. Signs out every other session and
 * returns a fresh token pair, which is stored here for the same reason as
 * `login`.
 */
export async function changePassword(input: {
  current_password: string
  new_password: string
}): Promise<void> {
  const next = await post<{ access?: string; refresh?: string }>('/auth/password/change/', input)
  if (next.access && next.refresh) {
    tokens.set({ access: next.access, refresh: next.refresh })
  }
}

/**
 * The five roles and the seven columns of AsOne's access matrix.
 *
 * Note: this is blocked while `must_change_password` is true, so a
 * set-your-password screen cannot depend on it.
 */
export function roles(): Promise<RoleInfo[]> {
  return get<RoleInfo[]>('/auth/roles/')
}

/** The sign-in audit trail. Leads only. */
export function loginAttempts(params?: {
  email?: string
  succeeded?: boolean
  user?: number
  page?: number
}): Promise<Page<import('./types').LoginAttempt>> {
  return get('/auth/login-attempts/', params)
}
