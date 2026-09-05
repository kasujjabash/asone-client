/**
 * Am I signed in?
 *
 * A working check on the auth wiring, and the thing to reload when you want
 * to prove a session survives a refresh: the answer comes from `/auth/me/`
 * on boot, not from anything held in memory.
 *
 * It also shows what the *server* says this account may do, so signing in as
 * two roles and comparing is enough to see that access is read rather than
 * guessed. The dashboard replaces this once there is one.
 */

import { LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Alert, Badge, Button } from '@/components'
import { tokens } from '@/api/tokens'
import { can, fullName, siteLabel } from '@/domain/access'
import type { AccessFunction } from '@/api/types'
import { useAuth } from '../hooks/useAuth'

/** The seven columns of AsOne's access matrix, in the client's order. */
const COLUMNS: readonly AccessFunction[] = [
  'table_updates',
  'production_orders',
  'warehouse_receiving_and_shipping',
  'inventory_adjustments',
  'school_orders',
  'backorder_transfers',
  'financial_reports',
]

export function SessionScreen() {
  const { status, user, signOut, refresh, pending } = useAuth()
  const [rechecked, setRechecked] = useState<string | null>(null)

  async function recheck() {
    try {
      await refresh()
      setRechecked(`Confirmed with the server at ${new Date().toLocaleTimeString()}`)
    } catch {
      setRechecked('The server did not confirm this session.')
    }
  }

  if (status === 'loading') {
    return (
      <main className="session">
        <p className="t-caption">Checking your session…</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="session">
        <div className="card stack session__card">
          <Badge tone="neutral">Not signed in</Badge>
          <h1 className="t-h2">No session</h1>
          <p className="t-caption">
            There is no stored token, or the one that was stored is no longer valid.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="session">
      <div className="card stack session__card">
        <div className="session__head">
          <Badge tone={status === 'gated' ? 'warning' : 'success'}>
            {status === 'gated' ? 'Signed in — password change required' : 'Signed in'}
          </Badge>
          <h1 className="t-h2">{fullName(user)}</h1>
        </div>

        {status === 'gated' && (
          <Alert tone="warning">
            This account must replace its password before anything else will work. The
            server answers 403 on every endpoint except viewing itself, setting a password
            and signing out.
          </Alert>
        )}

        <dl className="grid-kv">
          <dt>Role</dt>
          <dd>{user.role_display}</dd>
          <dt>Scope</dt>
          <dd>{user.access.scope.replace(/_/g, ' ')}</dd>
          <dt>Site</dt>
          {/* Null for an all-locations role — a real answer, not missing data. */}
          <dd>{siteLabel(user) ?? 'All locations'}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Access token</dt>
          <dd>{tokens.access ? 'stored' : 'missing'}</dd>
          <dt>Refresh token</dt>
          <dd>{tokens.refresh ? 'stored' : 'missing'}</dd>
        </dl>

        <div>
          <p className="t-overline" style={{ margin: '0 0 8px' }}>
            What the server says this account may do
          </p>
          <ul className="badge-row">
            {COLUMNS.map((column) => (
              <li key={column}>
                <Badge tone={can(user, column) ? 'success' : 'neutral'}>
                  {column.replace(/_/g, ' ')}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {rechecked && <p className="t-caption">{rechecked}</p>}

        <div className="session__actions">
          <Button variant="secondary" onClick={recheck} disabled={pending}>
            <RefreshCw size={16} aria-hidden />
            Re-check with server
          </Button>
          <Button variant="danger" onClick={() => void signOut()} disabled={pending}>
            <LogOut size={16} aria-hidden />
            Sign out
          </Button>
        </div>

        <p className="t-caption">
          Reload this page — you should stay signed in, because the session is rebuilt from
          <code> /auth/me/</code> rather than from memory.
        </p>
      </div>
    </main>
  )
}
