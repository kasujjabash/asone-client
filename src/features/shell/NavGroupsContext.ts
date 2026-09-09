/**
 * Which navigation group is open.
 *
 * A context rather than component state, because the sidebar is rendered
 * inside each screen: navigating unmounts one screen and mounts the next,
 * taking the sidebar with it. Held in the component, the open group reset to
 * its default on every click — so opening Operations and choosing Orders
 * closed Operations again, which looked like the menu fighting you.
 *
 * Mounted above the router, it survives navigation.
 */

import { createContext } from 'react'

export interface NavGroupsState {
  isOpen: (label: string) => boolean
  toggle: (label: string) => void
}

export const NavGroupsContext = createContext<NavGroupsState | null>(null)
