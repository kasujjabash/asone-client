/**
 * My Profile — the signed-in person's own record.
 *
 * ---------------------------------------------------------------------------
 * Why this is not `UserProfileScreen`
 * ---------------------------------------------------------------------------
 * That one is a **lead looking at somebody else**: it lives at
 * `/users/:userId`, is reached from Users & Roles, and can change a role,
 * reassign a site, reset a password or deactivate an account. It is
 * administration.
 *
 * This is a person looking at themselves. Every role has one; only the leads
 * have that one. It borrows that screen's `.profile-hero` and
 * `.profile-columns` outright — including the Edit control sitting in the
 * hero rather than above the fields — because they are the same subject seen
 * from two sides, and a second way of drawing a person is a second thing to
 * keep in step.
 *
 * ---------------------------------------------------------------------------
 * Read first, edit on request
 * ---------------------------------------------------------------------------
 * The default state is a page of facts. Somebody opening this is far more
 * often checking what the system has on them — which site am I on, which
 * number will they ring — than changing it, and a screen that opens as a form
 * asks every one of those people to read their own details out of input
 * boxes.
 *
 * ---------------------------------------------------------------------------
 * What can be changed here, and what deliberately cannot
 * ---------------------------------------------------------------------------
 * **Your name and your phone number.** Those are the two things on your
 * record that are genuinely yours to correct.
 *
 * **Not your email — and not by a lead either.** It is the credential you
 * sign in with *and* the address your sign-in code is sent to, so a typo
 * locks the account out of the only channel that could deliver the fix. It is
 * off `MeUpdateSerializer`'s allow-list and read-only on `UserAdminSerializer`
 * too, so there is no screen in AsOne that changes one. Central Office does
 * it out of band.
 *
 * **Not your role or your site.** The server refuses those outright — that
 * allow-list is a security boundary, so a school clerk cannot patch
 * themselves into Finance. All three are shown as facts with a line naming
 * who to ask, rather than as disabled inputs: a greyed-out field implies the
 * permission exists somewhere and sends somebody looking for it.
 *
 * Nobody changes their own role, including a Program Lead. That is separation
 * of duties working, not a gap.
 */

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Alert, Avatar, Badge, Button, LoadingScreen, Panel, TextField } from '@/components'
import { fullName, initials, roleTone, siteLabel } from '@/domain/access'
import { formatDateTime } from '@/domain/dates'
import { toApiError } from '@/api/errors'
import { AppShell } from '@/features/shell/components/AppShell'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useUpdateMyProfile } from '../hooks/useMyProfile'

export function MyProfileScreen() {
  const { user } = useAuth()
  const save = useUpdateMyProfile()
  const error = save.error ? toApiError(save.error) : null

  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName, setLastName] = useState(user?.last_name ?? '')
  const [phone, setPhone] = useState(user?.phone_number ?? '')

  if (!user) return <LoadingScreen message="Loading your profile" />

  const site = siteLabel(user)
  const ready = firstName.trim() !== '' && lastName.trim() !== ''

  function open() {
    if (!user) return
    // Re-seeded on every open, not just on mount: a save elsewhere — or a
    // cancelled edit — must not leave stale text waiting in the fields.
    setFirstName(user.first_name)
    setLastName(user.last_name)
    setPhone(user.phone_number ?? '')
    save.reset()
    setEditing(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    save.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
      },
      // Only on success. A failed save keeps the form open with what was
      // typed still in it, because closing would throw the edit away and
      // show the old values as though nothing had been attempted.
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <AppShell title="My Profile">
      {/* The same hero as the lead's view of somebody, down to the Edit
          button's place in it, for the same reason it exists there: a screen
          about a person should draw the person. */}
      <header className="profile-hero">
        <Avatar initials={initials(user)} size={64} />

        <div className="profile-hero__identity">
          <div className="profile-hero__name">
            <h1 className="profile-hero__title">{fullName(user)}</h1>
          </div>

          <p className="profile-hero__email">{user.email}</p>

          <div className="profile-hero__tags">
            <Badge tone={roleTone(user.role)}>{user.role_display}</Badge>
            {/* Null is a real answer for an all-locations role, not missing
                data — see `siteLabel`. */}
            <span className="profile-hero__site">{site ?? 'All sites'}</span>
          </div>
        </div>

        {!editing && (
          <Button variant="secondary" onClick={open}>
            Edit details
          </Button>
        )}
      </header>

      <div className="profile-columns">
        <Panel
          title="Your details"
          subtitle={
            editing
              ? 'Change your name or the number colleagues reach you on.'
              : 'What AsOne has on you. Use Edit details to correct it.'
          }
        >
          {editing ? (
            <form className="stack-form" onSubmit={submit} noValidate>
              {error && (
                <Alert tone="error">
                  <strong>Nothing was saved.</strong> {error.message}
                </Alert>
              )}

              <TextField
                label="First name"
                value={firstName}
                required
                autoFocus
                error={error?.fields?.first_name?.[0]}
                onChange={(event) => setFirstName(event.target.value)}
              />
              <TextField
                label="Last name"
                value={lastName}
                required
                error={error?.fields?.last_name?.[0]}
                onChange={(event) => setLastName(event.target.value)}
              />
              <TextField
                label="Phone number"
                type="tel"
                value={phone}
                error={error?.fields?.phone_number?.[0]}
                onChange={(event) => setPhone(event.target.value)}
              />

              <div className="user-actions user-actions--row">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  disabled={save.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!ready || save.isPending}>
                  {save.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="detail-list detail-list--profile">
              <div>
                <dt>First name</dt>
                <dd>{user.first_name || '—'}</dd>
              </div>
              <div>
                <dt>Last name</dt>
                <dd>{user.last_name || '—'}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                {/* "Not set", muted — not the em dash the name fields use.
                    A phone number is optional, so empty is a real answer and
                    should read as one; a blank name is a gap in a required
                    field, which is a different thing and looks different. */}
                <dd>{user.phone_number || <span className="detail-list__muted">Not set</span>}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          )}
        </Panel>

        <Panel title="Access" subtitle="Set for you, and not changed from here.">
          <dl className="detail-list detail-list--profile">
            <div>
              <dt>Role</dt>
              <dd>{user.role_display}</dd>
            </div>
            <div>
              <dt>Site</dt>
              <dd>{site ?? 'All sites'}</dd>
            </div>
            <div>
              <dt>Last signed in</dt>
              <dd>{formatDateTime(user.last_login, 'This session')}</dd>
            </div>
          </dl>

          <Alert tone="info">
            Your <strong>email</strong> is what you sign in with and where your
            sign-in code is sent, so nobody edits one from a screen &mdash; not
            even a lead. Your <strong>role</strong> and <strong>site</strong>{' '}
            are a lead&rsquo;s to set. Ask a Program Lead or Operations Manager
            for any of the three.
          </Alert>

          {/* A Link, not a Button — it navigates, so it has to be an anchor to
              be openable in a new tab and announced as a link. */}
          <div className="user-actions">
            <Link className="btn btn--secondary btn--md" to="/set-password">
              <KeyRound size={16} aria-hidden />
              Change my password
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
