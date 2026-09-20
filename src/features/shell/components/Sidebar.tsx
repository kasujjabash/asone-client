/**
 * The sidebar — Figma 2001:426.
 *
 * Draws whatever `visibleNavigation` hands it. It does not know which role is
 * signed in and contains no conditionals about one.
 *
 * The section labels are the collapse controls, as the design's chevrons
 * imply. Each is a real button so the keyboard can reach it, and it reports
 * its state with `aria-expanded`.
 *
 * ---------------------------------------------------------------------------
 * A group of one is not a group
 * ---------------------------------------------------------------------------
 * The sections are written for the role that sees the most: a Program Lead
 * has sixteen destinations and needs them sorted. Narrower roles see the same
 * five headings over far less — School Staff had **four collapse controls for
 * five links**, three of those headings sitting above a single item.
 *
 * A heading that describes one thing is not a heading, it is a lid. So a
 * group left holding one visible item renders as a plain link in its place.
 *
 * And below a certain size the same is true of the whole sidebar: sorting six
 * links into three sections is filing rather than navigation, and it puts a
 * lid on most of what the person has. Under `FLAT_BELOW` destinations the
 * sections are dropped entirely and every link is shown.
 *
 * Both rules key off the count after filtering, never the role — a sixth role
 * added tomorrow gets the right shape without a change here, and no list of
 * role names appears in this file.
 */

import { NavLink } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import markUrl from '@/assets/brand/asone-mark.png'
import { Avatar } from '@/components'
import { fullName, initials } from '@/domain/access'
import type { CurrentUser } from '@/api/types'
import { useOrgSettings } from '@/features/settings/hooks/useOrgSettings'
import { visibleNavigation } from '../visibleNavigation'
import { useNavGroups } from '../hooks/useNavGroups'
import { NavIcon } from './NavIcon'

interface SidebarProps {
  user: CurrentUser
  onSignOut: () => void
}

/*
 * At or below this many destinations, the sidebar is a flat list.
 *
 * Nine, counted from the app rather than estimated: a school clerk has six,
 * a warehouse clerk eight, Finance nine, and a lead seventeen. Only the last
 * is a list that sections genuinely sort.
 *
 * It was seven, which put warehouse staff and Finance one and two links over
 * the line — and because the groups are an accordion, being over the line
 * meant a warehouse clerk landing on the dashboard could see **one** of their
 * eight destinations and Finance two of nine. Sections that hide seven links
 * to organise nine are not organising anything.
 */
const FLAT_BELOW = 9

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const groups = visibleNavigation(user)
  const flat = groups.reduce((n, group) => n + group.items.length, 0) <= FLAT_BELOW
  const { isOpen, toggle } = useNavGroups()

  /*
   * The organisation's own name, from Settings — the one place that field is
   * read, and the reason it is a setting at all. Falls back to the product
   * name while the query is in flight or if it fails: a sidebar with no
   * wordmark for a moment is worse than one that is briefly generic.
   */
  const { data: orgSettings } = useOrgSettings()
  const wordmark = orgSettings?.organization_name?.trim() || 'AsOne Logistics'

  return (
    <nav className="sidebar" id="app-nav" aria-label="Main">
      <div className="sidebar__brand">
        {/* The compact mark, 33×32 as designed — a different asset from the
            158×70 lockup used on the auth screens. */}
        <span className="sidebar__mark">
          <img src={markUrl} width={33} height={32} alt="" aria-hidden />
        </span>
        <span className="sidebar__wordmark">{wordmark}</span>
      </div>

      <div className="sidebar__groups">
        {groups.map((group) => {
          /*
            One item left after filtering: draw it where the section would
            have been, keeping the order the sections already establish.
          */
          if (flat || group.items.length === 1) {
            return group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link sidebar__link--solo${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))
          }

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
                {group.items.map((item) => (
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
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/*
        The card is the way to your own profile, for every role at every
        moment — clicking your own name and face is where people already look
        for it.

        It is here because the nav entry alone was not enough. The groups are
        an accordion, one open at a time, so a Finance user landing on the
        dashboard saw two of their nine links and My Profile was inside a
        collapsed section; a warehouse clerk saw one of eight. `FLAT_BELOW`
        now covers both of those roles, but the accordion still exists for a
        lead, and "where is my profile" should not depend on which section
        happens to be open.

        Sign-out stays its own button beside it — a link and a destructive
        action must not share one hit area.
      */}
      <div className="sidebar__user">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar__user-link${isActive ? ' sidebar__user-link--active' : ''}`
          }
        >
          <Avatar initials={initials(user)} />
          <span className="sidebar__user-text">
            <b>{fullName(user)}</b>
            {/* The server's wording, not ours. */}
            <small>{user.role_display}</small>
          </span>
        </NavLink>
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
