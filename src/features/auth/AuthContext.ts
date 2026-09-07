/**
 * The session, as the rest of the app sees it.
 *
 * Split from the provider so that importing the context does not drag a
 * component graph with it, and so Fast Refresh keeps working on both.
 */

import { createContext } from 'react'
import type { ApiError } from '@/api/errors'
import type { CurrentUser, LoginChallenge } from '@/api/types'

/**
 * Where a visitor is in the sign-in sequence.
 *
 *   loading      still asking the server who this is — say nothing yet
 *   unreachable  we hold tokens but the server did not answer. NOT signed
 *                out: the session is probably fine and the tokens are kept.
 *                A distinct state because the alternatives are both wrong —
 *                'anonymous' would redirect to sign-in for no reason, and
 *                staying 'loading' is a spinner that never stops.
 *   anonymous    no session
 *   challenged   password accepted, code emailed, waiting on the code
 *   gated        signed in, but must replace the password before anything else
 *   signedIn     fully in
 */
export type AuthStatus =
  | 'loading'
  | 'unreachable'
  | 'anonymous'
  | 'challenged'
  | 'gated'
  | 'signedIn'

export interface AuthState {
  status: AuthStatus
  user: CurrentUser | null
  /** Present only while `status` is 'challenged'. */
  challenge: LoginChallenge | null
  error: ApiError | null
  pending: boolean

  /** Step one. On success the status becomes 'challenged'. */
  requestCode: (email: string, password: string) => Promise<void>
  /** Step two. On success the status becomes 'gated' or 'signedIn'. */
  submitCode: (code: string) => Promise<void>
  /** Abandon a challenge and go back to the email and password. */
  restart: () => void
  signOut: () => Promise<void>
  /** Re-read the user, e.g. after clearing the password gate. */
  refresh: () => Promise<void>
  /** Try the session again after an outage. */
  retry: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
