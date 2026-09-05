/**
 * Route guard.
 *
 * Renders nothing while the session is still being established. A guard that
 * treats 'loading' as 'anonymous' bounces a signed-in user to sign-in for a
 * frame on every reload, which is the single most common way this goes
 * wrong.
 *
 * Cosmetic, like every guard: the server re-checks each request, so a 403 is
 * always possible on the other side of this.
 */

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { paths } from './paths'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null

  if (status === 'anonymous' || status === 'challenged') {
    return <Navigate to={paths.signIn} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
