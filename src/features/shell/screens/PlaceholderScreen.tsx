/**
 * A destination whose design has not arrived yet.
 *
 * Every sidebar link leads somewhere. The alternative — links that 404 or
 * silently bounce to the dashboard — makes the app feel broken during the
 * build and hides which parts are genuinely missing.
 *
 * It names itself from `navigation.ts`, so a screen's title is never typed
 * twice, and it says plainly that the design is outstanding rather than
 * pretending to be an empty version of the real thing.
 */

import { Compass } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { EmptyState } from '@/components'
import { AppShell } from '../components/AppShell'
import { findNavItem } from '../navigation'

export function PlaceholderScreen() {
  const { pathname } = useLocation()
  const item = findNavItem(pathname)
  const title = item?.label ?? 'Screen'

  return (
    <AppShell title={title}>
      <header className="page-head">
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__subtitle">This screen is not built yet.</p>
      </header>

      <EmptyState
        icon={Compass}
        title={`${title} is coming`}
        body="The design for this screen has not landed. The navigation, roles and API behind it are already in place, so it will fill in without moving anything around it."
      />
    </AppShell>
  )
}
