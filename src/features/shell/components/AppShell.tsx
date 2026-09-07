/**
 * The frame every signed-in screen sits in.
 *
 * Sidebar, top bar, and a scrolling content column. Screens pass their own
 * title and body; nothing about a particular screen lives here.
 */

import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  title: string
  children: ReactNode
}

export function AppShell({ title, children }: AppShellProps) {
  const { user, signOut } = useAuth()

  // RequireAuth guarantees a user before this renders; this keeps the type
  // honest rather than asserting non-null.
  if (!user) return null

  return (
    <div className="shell">
      <Sidebar user={user} onSignOut={() => void signOut()} />
      <div className="shell__main">
        <TopBar title={title} />
        <main className="shell__content">{children}</main>
      </div>
    </div>
  )
}
