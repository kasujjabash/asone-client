/**
 * Which navigation group is open.
 *
 * An accordion: one group at a time. Overview starts open, clicking another
 * header closes it and opens the new one, and clicking the open one closes
 * it — so the rail can be fully collapsed.
 *
 * A single label rather than a set, because that is the rule: holding a set
 * and then enforcing one member would let the two disagree.
 */

import { useCallback, useState } from 'react'

const OPEN_BY_DEFAULT = 'Overview'

interface NavGroupState {
  isOpen: (label: string) => boolean
  toggle: (label: string) => void
}

export function useNavGroups(): NavGroupState {
  const [openLabel, setOpenLabel] = useState<string | null>(OPEN_BY_DEFAULT)

  const isOpen = useCallback((label: string) => openLabel === label, [openLabel])

  const toggle = useCallback((label: string) => {
    setOpenLabel((current) => (current === label ? null : label))
  }, [])

  return { isOpen, toggle }
}
