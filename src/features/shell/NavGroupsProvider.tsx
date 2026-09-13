/**
 * Owns which navigation groups are open, for the life of the session.
 *
 * Every group starts open, as the design draws them, and each collapses
 * independently — not an accordion. A warehouse clerk moving between
 * Receiving and Inventory should not have one close because they opened the
 * other, and the whole rail fits without scrolling at the sizes this runs on.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { NavGroupsContext, type NavGroupsState } from './NavGroupsContext'

export function NavGroupsProvider({ children }: { children: ReactNode }) {
  /** Only the groups a person has deliberately closed. Absent means open, so
   *  a group added later opens by default without being listed here. */
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set())

  const isOpen = useCallback((label: string) => !closed.has(label), [closed])

  const toggle = useCallback((label: string) => {
    setClosed((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const value = useMemo<NavGroupsState>(() => ({ isOpen, toggle }), [isOpen, toggle])

  return <NavGroupsContext.Provider value={value}>{children}</NavGroupsContext.Provider>
}
