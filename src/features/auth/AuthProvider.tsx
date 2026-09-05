/**
 * Owns the session.
 *
 * Three things happen here that nowhere else can:
 *
 *   On boot it asks `/auth/me/` who the stored token belongs to, so a
 *   reload does not sign anyone out. Until that answers, the status is
 *   'loading' and no screen may claim the visitor is anonymous — rendering
 *   sign-in for half a second before a session resolves is how an app looks
 *   broken.
 *
 *   It subscribes to `onSessionExpired`, which the transport raises when a
 *   refresh token is spent or rejected. That is the one case where someone
 *   genuinely has to sign in again, and it is announced rather than acted on
 *   so that routing stays here and out of `api/`.
 *
 *   It distinguishes 'gated' from 'signedIn'. An account with
 *   `must_change_password` is authenticated but gets 403 on almost
 *   everything, so the app must treat it as a separate state rather than a
 *   signed-in user who happens to see errors everywhere.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import { toApiError, type ApiError } from '@/api/errors'
import { onSessionExpired } from '@/api/http'
import { tokens } from '@/api/tokens'
import type { CurrentUser, LoginChallenge } from '@/api/types'
import { mustChangePassword } from '@/domain/access'
import { AuthContext, type AuthState, type AuthStatus } from './AuthContext'

function statusFor(user: CurrentUser): AuthStatus {
  return mustChangePassword(user) ? 'gated' : 'signedIn'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialised from token presence rather than corrected in an effect: with
  // no stored token there is nothing to ask the server, and starting at
  // 'loading' would blank the sign-in screen for a frame.
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokens.access ? 'loading' : 'anonymous',
  )
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  // Guards against a resolved boot request writing state after the provider
  // has moved on — a sign-out landing before a slow /auth/me/ returns.
  const live = useRef(true)
  useEffect(() => {
    live.current = true
    return () => {
      live.current = false
    }
  }, [])

  const adopt = useCallback((next: CurrentUser) => {
    setUser(next)
    setChallenge(null)
    setStatus(statusFor(next))
  }, [])

  const clear = useCallback(() => {
    setUser(null)
    setChallenge(null)
    setStatus('anonymous')
  }, [])

  // Boot: who does the stored token belong to?
  useEffect(() => {
    if (!tokens.access) return

    authApi
      .me()
      .then((current) => {
        if (live.current) adopt(current)
      })
      .catch(() => {
        // A token that cannot identify itself is no token. The transport has
        // already tried a refresh by this point.
        tokens.clear()
        if (live.current) clear()
      })
  }, [adopt, clear])

  // The transport announces a dead refresh token; routing is decided here.
  useEffect(() => onSessionExpired(clear), [clear])

  const requestCode = useCallback(async (email: string, password: string) => {
    setPending(true)
    setError(null)
    try {
      const issued = await authApi.requestLoginCode({ email, password })
      setChallenge(issued)
      setStatus('challenged')
    } catch (cause) {
      setError(toApiError(cause))
    } finally {
      setPending(false)
    }
  }, [])

  const submitCode = useCallback(
    async (code: string) => {
      if (!challenge) return
      setPending(true)
      setError(null)
      try {
        const session = await authApi.verifyLoginCode({
          challenge: challenge.challenge,
          code,
        })
        adopt(session.user)
      } catch (cause) {
        setError(toApiError(cause))
      } finally {
        setPending(false)
      }
    },
    [challenge, adopt],
  )

  const restart = useCallback(() => {
    setChallenge(null)
    setError(null)
    setStatus('anonymous')
  }, [])

  const signOut = useCallback(async () => {
    setPending(true)
    try {
      await authApi.logout()
    } finally {
      setPending(false)
      setError(null)
      clear()
    }
  }, [clear])

  const refresh = useCallback(async () => {
    const current = await authApi.me()
    adopt(current)
  }, [adopt])

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      challenge,
      error,
      pending,
      requestCode,
      submitCode,
      restart,
      signOut,
      refresh,
    }),
    [status, user, challenge, error, pending, requestCode, submitCode, restart, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
