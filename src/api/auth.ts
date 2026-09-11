/**
 * Authentication.
 *
 * Signing in is two steps, and neither is optional:
 *
 *   1. `requestLoginCode`  email + password. Emails a one-time code and
 *                          returns a challenge. **No tokens.**
 *   2. `verifyLoginCode`   challenge + code. Returns the token pair and the
 *                          user.
 *
 * A password alone is enough to read every school's orders and every
 * warehouse's stock, which is why the server stopped issuing tokens for one.
 *
 * Thin by design: one request and one type per function. No React, no
 * navigation, no storage decisions beyond handing tokens to `tokens`.
 */

import { get, post } from './http'
import { tokens } from './tokens'
import type {
  AccountRequest,
  Credentials,
  CurrentUser,
  EmailVerification,
  LoginAttempt,
  LoginChallenge,
  Page,
  RoleInfo,
  Session,
  UserAdmin,
  UserCreate,
  VerifyLoginCode,
} from './types'

/**
 * Step one. Checks the password, then emails a code.
 *
 * The failure codes are meaningfully different here and screens should say so:
 *
 *   403  the address is not a user of this system, or has been deactivated,
 *        or its email was never confirmed. Retyping the password will not
 *        help, so say that rather than leaving someone guessing.
 *   401  the address exists; the password is wrong.
 *   429  rate limited, per address and per site.
 */
export function requestLoginCode(credentials: Credentials): Promise<LoginChallenge> {
  return post<LoginChallenge>('/auth/login/', credentials)
}

/**
 * Step two. Exchanges the challenge and code for tokens.
 *
 * A code is good once, for a few minutes, with a limited number of tries.
 * Expired, already used and too-many-attempts all come back as the same 400,
 * deliberately not saying which — so the screen must offer "start again"
 * rather than "try another code".
 *
 * Storing the tokens is this function's job: a caller that forgot would leave
 * the app authenticated in memory only.
 */
export async function verifyLoginCode(input: VerifyLoginCode): Promise<Session> {
  const session = await post<Session>('/auth/login/verify/', input)
  tokens.set({ access: session.access, refresh: session.refresh })
  return session
}

/**
 * A new member of staff confirming the address their account was created
 * against. Open — the caller has no account to authenticate with yet, which
 * is what the code stands in for.
 *
 * Until this is done, signing in is refused with a 403.
 */
export function verifyEmail(input: EmailVerification): Promise<{ detail: string }> {
  return post<{ detail: string }>('/auth/verify-email/', input)
}

/**
 * "Get Started Onboarding" — request an account.
 *
 * MOCKED: there is no self-service registration endpoint on the server.
 * Accounts are created by a Program Lead or Operations Manager through
 * `POST /auth/users/`, and self-registration may not be something AsOne
 * wants at all (every transaction records who performed it). This stub
 * exists so the screen the design calls for can be built and reviewed now;
 * swap the body for a real `post()` call once that decision is made and an
 * endpoint exists.
 */
export function requestAccount(input: AccountRequest): Promise<LoginChallenge> {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          challenge: 'mock-challenge',
          expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
          detail: 'A verification code has been sent.',
          email_hint: maskEmail(input.email),
        }),
      600,
    )
  })
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  return `${name[0]}${'•'.repeat(Math.max(name.length - 2, 1))}${name.slice(-1)}@${domain}`
}

/**
 * Confirm the code sent to a requested account's address.
 *
 * MOCKED alongside `requestAccount` — the server has no registration flow
 * for this to complete. Accepts any 6-digit code so the screen can be
 * reviewed end to end.
 */
export function confirmAccount(input: EmailVerification): Promise<{ detail: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (input.code.length === 6) {
        resolve({ detail: 'Email confirmed.' })
      } else {
        reject(new Error('Enter the 6-digit code.'))
      }
    }, 600)
  })
}

/**
 * Sign out. Blacklists the refresh token; the access token stays valid until
 * it expires, which is inherent to stateless tokens and why they are short.
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

/** The signed-in user. Reachable even while the password gate is up. */
export function me(): Promise<CurrentUser> {
  return get<CurrentUser>('/auth/me/')
}

/**
 * Change your own password.
 *
 * Requires the current password even though you are signed in, so a stolen
 * token alone cannot lock the owner out. Signs out every other session and
 * returns a fresh token pair, stored here for the same reason as sign-in.
 */
export async function changePassword(input: {
  current_password: string
  new_password: string
}): Promise<void> {
  const next = await post<Partial<Session>>('/auth/password/change/', input)
  if (next.access && next.refresh) {
    tokens.set({ access: next.access, refresh: next.refresh })
  }
}

/**
 * The five roles and the seven columns of AsOne's access matrix.
 *
 * Blocked while `must_change_password` is true, so a set-a-password screen
 * cannot depend on it.
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
}): Promise<Page<LoginAttempt>> {
  return get('/auth/login-attempts/', params)
}

/**
 * Staff accounts — the Users tab of Users & Roles.
 *
 * Program Lead and Operations Manager only; the server enforces this and a
 * 403 here means the role does not hold `table_updates`, not a bug.
 */
export function listUsers(params?: { page?: number }): Promise<Page<UserAdmin>> {
  return get<Page<UserAdmin>>('/auth/users/', params)
}

/**
 * "+ Add User" — provisioning a new staff account.
 *
 * There is no self-service sign-up (see `requestAccount`): every account is
 * created by a lead through this endpoint. The password is generated unless
 * one is typed and is returned once in the response — never emailed — so the
 * caller must show it to the person who will pass it on.
 */
export function createUser(input: UserCreate): Promise<UserAdmin> {
  return post<UserAdmin>('/auth/users/', input)
}
