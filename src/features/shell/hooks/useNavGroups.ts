/**
 * Read which navigation group is open.
 *
 * Throws outside the provider — that would otherwise show up as a sidebar
 * whose groups silently refuse to stay open.
 */

import { useContext } from 'react'
import { NavGroupsContext, type NavGroupsState } from '../NavGroupsContext'

export function useNavGroups(): NavGroupsState {
  const value = useContext(NavGroupsContext)
  if (!value) throw new Error('useNavGroups must be used inside <NavGroupsProvider>')
  return value
}
