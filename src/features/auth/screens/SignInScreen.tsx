/**
 * Sign in.
 *
 * Renders. It does not fetch — `useSignIn` does that — and it does not
 * decide what a role may do; it reads the seven access-matrix columns the
 * server sent and shows them.
 *
 * The signed-in panel is a proof of life, not the real home screen: it
 * exists to show that a sign-in reaches the API and comes back with a role,
 * a site and an access matrix.
 */

import { useState, type FormEvent } from 'react'
import { can, fullName, mustChangePassword, siteLabel } from '@/domain/access'
import { useSignIn } from '../hooks/useSignIn'
import type { AccessFunction } from '@/api/types'

/** The columns of AsOne's access matrix, in the order the client lists them. */
const COLUMNS: readonly AccessFunction[] = [
  'table_updates',
  'production_orders',
  'warehouse_receiving_and_shipping',
  'inventory_adjustments',
  'school_orders',
  'backorder_transfers',
  'financial_reports',
]

export function SignInScreen() {
  const { user, error, pending, signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void signIn({ email, password })
  }

  if (user) {
    return (
      <main style={page}>
        <div className="card stack" style={{ maxWidth: 560 }}>
          <div>
            <p className="muted" style={{ margin: 0 }}>Signed in</p>
            <h1 style={{ fontSize: 22 }}>{fullName(user)}</h1>
          </div>

          <dl className="grid-kv">
            <dt>Role</dt>
            <dd>{user.role_display}</dd>
            <dt>Scope</dt>
            <dd>{user.access.scope.replace(/_/g, ' ')}</dd>
            <dt>Site</dt>
            {/* Null for an all-locations role. That is a real answer, not
                missing data, so it says so rather than showing a blank. */}
            <dd>{siteLabel(user) ?? 'All locations'}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </dl>

          <div>
            <p className="muted" style={{ marginTop: 0 }}>Access matrix</p>
            <ul className="flags">
              {COLUMNS.map((column) => (
                <li key={column} className={`flag ${can(user, column) ? 'flag--on' : ''}`}>
                  {column.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>

          {mustChangePassword(user) && (
            <p className="notice notice--error" style={{ margin: 0 }}>
              This account must set a new password. Until it does, the server
              answers 403 on everything except viewing itself, setting a
              password and signing out.
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main style={page}>
      <form className="card stack" style={{ maxWidth: 380 }} onSubmit={onSubmit}>
        <div>
          <h1 style={{ fontSize: 20 }}>AsOne Logistics</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Sign in to continue
          </p>
        </div>

        {error && (
          <p className="notice notice--error" style={{ margin: 0 }}>
            {error.message}
          </p>
        )}

        <div>
          {/* Email, not a username — there is no username anywhere in this API. */}
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

const page: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
}
