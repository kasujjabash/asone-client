/**
 * Sign-in state for the screen that renders it.
 *
 * The screen below this holds no request logic — it calls `signIn` and
 * renders whatever comes back. That split is the client-side version of the
 * server's "thin views, fat services": anything worth testing lives here,
 * where a test can call it without mounting a component.
 *
 * Session state is local to this hook for now. It belongs in an
 * AuthProvider once there is more than one screen to share it with.
 */

import { useCallback, useState } from 'react'
import { login } from '@/api/auth'
import { toApiError, type ApiError } from '@/api/errors'
import type { Credentials, CurrentUser } from '@/api/types'

interface SignInState {
  user: CurrentUser | null
  error: ApiError | null
  pending: boolean
  signIn: (credentials: Credentials) => Promise<void>
}

export function useSignIn(): SignInState {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  const signIn = useCallback(async (credentials: Credentials) => {
    setPending(true)
    setError(null)
    try {
      const session = await login(credentials)
      setUser(session.user)
    } catch (cause) {
      // 401 is deliberately identical for a wrong password and an unknown
      // address, so neither reveals whether an account exists. Say the same
      // thing the server does rather than guessing which it was.
      setError(toApiError(cause))
    } finally {
      setPending(false)
    }
  }, [])

  return { user, error, pending, signIn }
}
