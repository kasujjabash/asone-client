/**
 * Guards a route on one column of the access matrix.
 *
 * Shows the access-denied screen rather than redirecting. A silent bounce to
 * the dashboard reads as a broken link; being told the role does not include
 * something is an answer.
 *
 * Cosmetic, like every guard — the server re-checks, so a 403 is still
 * possible past this point and must still be handled.
 */

import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AccessDeniedScreen } from '@/features/shell/screens/AccessDeniedScreen'
import { meetsRequirement } from '@/features/shell/visibleNavigation'
import type { NavRequirement } from '@/features/shell/navigation'

interface RequireAccessProps {
  requires: NavRequirement
  children: ReactNode
}

export function RequireAccess({ requires, children }: RequireAccessProps) {
  const { user } = useAuth()

  // Same check the sidebar uses, so a destination is never visible and
  // unreachable, or hidden and reachable.
  if (!meetsRequirement(user, requires)) {
    return <AccessDeniedScreen />
  }

  return <>{children}</>
}
