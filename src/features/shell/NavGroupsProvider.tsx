/**
 * Owns which navigation group is open, for the life of the session.
 *
 * An accordion: one group at a time. Overview starts open, clicking another
 * header moves the open one, and clicking the open header closes it so the
 * rail can be fully collapsed.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { NavGroupsContext, type NavGroupsState } from './NavGroupsContext'

const OPEN_BY_DEFAULT = 'Overview'

export function NavGroupsProvider({ children }: { children: ReactNode }) {
  const [openLabel, setOpenLabel] = useState<string | null>(OPEN_BY_DEFAULT)

  const isOpen = useCallback((label: string) => openLabel === label, [openLabel])

  const toggle = useCallback((label: string) => {
    setOpenLabel((current) => (current === label ? null : label))
  }, [])

  const value = useMemo<NavGroupsState>(() => ({ isOpen, toggle }), [isOpen, toggle])

  return <NavGroupsContext.Provider value={value}>{children}</NavGroupsContext.Provider>
}
