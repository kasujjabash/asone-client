/**
 * Users & Roles.
 *
 * Three tabs — Users, Roles, Permissions — sharing one page head and one
 * "+ Add User" action. Gated on `table_updates`, same as the nav entry: only
 * Program Lead and Operations Manager reach this screen at all, so there is
 * no further per-control hiding here.
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components'
import { AppShell } from '@/features/shell/components/AppShell'
import { AddUserModal } from '../components/AddUserModal'
import { PermissionsMatrix } from '../components/PermissionsMatrix'
import { UsersTable } from '../components/UsersTable'
import { useRoles } from '../hooks/useRoles'
import { useCreateUser, useUsers } from '../hooks/useUsers'

const TABS = ['Users', 'Roles', 'Permissions'] as const
type Tab = (typeof TABS)[number]

export function UsersRolesScreen() {
  const [tab, setTab] = useState<Tab>('Users')
  const [modalOpen, setModalOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const usersQuery = useUsers()
  const rolesQuery = useRoles()
  const createUser = useCreateUser()

  const users = usersQuery.data?.results ?? []
  const roles = rolesQuery.data ?? []

  return (
    <AppShell title="Users & Roles">
      {/* The design puts no heading on this screen: the top bar already
          names it, and the tabs share their row with the one action. */}
      <div className="users__toolbar">
        <div className="tabbar" role="tablist">
          {TABS.map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={entry === tab}
              className={`tabbar__tab${entry === tab ? ' tabbar__tab--active' : ''}`}
              onClick={() => setTab(entry)}
            >
              {entry}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} aria-hidden />
          Add User
        </Button>
      </div>

      {justAdded && (
        <div className="alert alert--success" role="status">
          User added successfully
        </div>
      )}

      {tab === 'Users' && (
        <div className="table-card" aria-busy={usersQuery.isFetching || undefined}>
          <UsersTable users={users} loading={usersQuery.isLoading} />
        </div>
      )}

      <div className="panel users__matrix">
        <header className="panel__head panel__head--stacked">
          <div>
            <h2 className="panel__title">Role Permissions Matrix Preview</h2>
            <p className="panel__subtitle">System functions authorized by user role profiles.</p>
          </div>
        </header>
        <div className="panel__body">
          <PermissionsMatrix roles={roles} loading={rolesQuery.isLoading} />
        </div>
      </div>

      {modalOpen && (
        <AddUserModal
          roles={roles}
          onClose={() => setModalOpen(false)}
          onCreate={async (input) => {
            const created = await createUser.mutateAsync(input)
            setJustAdded(true)
            setTimeout(() => setJustAdded(false), 4000)
            return created
          }}
        />
      )}
    </AppShell>
  )
}
