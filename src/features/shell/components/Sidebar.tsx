/**
 * The sidebar — Figma 2001:426.
 *
 * Draws whatever `fullNavigation` hands it — every destination the design
 * lists, each already marked as open to this user or not. The component does
 * not know which role is signed in and contains no conditionals about one.
 *
 * The section labels are the collapse controls, as the design's chevrons
 * imply. Each is a real button so the keyboard can reach it, and it reports
 * its state with `aria-expanded`.
 */

import { NavLink } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import markUrl from '@/assets/brand/asone-mark.svg'
import { Avatar } from '@/components'
import { fullName, initials } from '@/domain/access'
import type { CurrentUser } from '@/api/types'
import { fullNavigation } from '../visibleNavigation'
import { useNavGroups } from '../hooks/useNavGroups'
import { NavIcon } from './NavIcon'

interface SidebarProps {
  user: CurrentUser
  onSignOut: () => void
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const groups = fullNavigation(user)
  const { isOpen, toggle } = useNavGroups()

  return (
    <nav className="sidebar" aria-label="Main">
      <div className="sidebar__brand">
        {/* The compact mark, 33×32 as designed — a different asset from the
            158×70 lockup used on the auth screens. */}
        <span className="sidebar__mark">
          <img src={markUrl} width={33} height={32} alt="" aria-hidden />
        </span>
        <span className="sidebar__wordmark">
          <b>AsOne Logistics</b>
          <small>Uganda Operations</small>
        </span>
      </div>

      <div className="sidebar__groups">
        {groups.map((group) => {
          const open = isOpen(group.label)
          const id = `nav-${group.label.replace(/\W+/g, '-').toLowerCase()}`

          return (
            <div className="sidebar__group" key={group.label}>
              <button
                type="button"
                className="sidebar__group-label"
                onClick={() => toggle(group.label)}
                aria-expanded={open}
                aria-controls={id}
              >
                <span>{group.label}</span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={`sidebar__chevron${open ? ' sidebar__chevron--open' : ''}`}
                />
              </button>

              <div className="sidebar__group-items" id={id} hidden={!open}>
                {group.items.map((item) =>
                  item.allowed ? (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                      }
                    >
                      <NavIcon name={item.icon} />
                      <span>{item.label}</span>
                    </NavLink>
                  ) : (
                    /*
                     * Shown, but not a link. The design draws the whole rail,
                     * and a destination this role cannot open is worth seeing
                     * exists — but making it clickable would only ever lead to
                     * a 403, which is a worse answer than a quiet one.
                     */
                    <span
                      key={item.path}
                      className="sidebar__link sidebar__link--locked"
                      aria-disabled="true"
                      title={`${item.label} is not available to your role.`}
                    >
                      <NavIcon name={item.icon} />
                      <span>{item.label}</span>
                    </span>
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="sidebar__user">
        <Avatar initials={initials(user)} />
        <span className="sidebar__user-text">
          <b>{fullName(user)}</b>
          {/* The server's wording, not ours. */}
          <small>{user.role_display}</small>
        </span>
        <button
          type="button"
          className="sidebar__signout"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          <LogOut size={20} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
