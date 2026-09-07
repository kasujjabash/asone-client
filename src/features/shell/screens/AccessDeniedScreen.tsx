/**
 * Your role does not allow this.
 *
 * Reached by typing a URL for something the signed-in role does not hold —
 * the sidebar would not have offered it. A real answer, not an error: the
 * matrix says no, and saying so is more useful than a redirect that looks
 * like the click failed.
 *
 * The server refuses the same request independently. This screen only saves
 * the round trip.
 */

import { Lock } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { EmptyState } from '@/components'
import { AppShell } from '../components/AppShell'
import { findNavItem } from '../navigation'

export function AccessDeniedScreen() {
  const { pathname } = useLocation()
  const item = findNavItem(pathname)

  return (
    <AppShell title="Access denied">
      <EmptyState
        icon={Lock}
        title="Access denied"
        body={
          item
            ? `Your role does not include ${item.label}. Ask AsOne Central Office if you need it.`
            : 'Your role does not allow this. Ask AsOne Central Office if you need access.'
        }
      />
    </AppShell>
  )
}
