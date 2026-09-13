/**
 * "+ Add User" — a 3-step wizard: details, review, done.
 *
 * There is no modal/dialog component anywhere else in this codebase yet —
 * this is the first one. Kept local to this feature rather than promoted to
 * `components/` until a second caller needs a modal shell, so the general
 * case is designed from two examples instead of guessed from one.
 *
 * Three steps — see `WizardStep` for how they are numbered against a design
 * that draws only the first and the last.
 *
 * Step 3 is the one the design does not draw: the server returns the
 * generated password once, on that response only, and never emails it (see
 * `api/users.ts`). Dropping it silently would leave the lead with an account
 * they cannot hand off.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import * as catalogApi from '@/api/catalog'
import { Button } from '@/components'
import { PERMISSIONS_MATRIX_ROWS } from '@/domain/permissionsMatrix'
import { toApiError, type ApiError } from '@/api/errors'
import type { CreatedUser } from '@/api/users'
import type { RoleInfo, UserCreate } from '@/api/types'

interface AddUserModalProps {
  roles: RoleInfo[]
  onClose: () => void
  onCreate: (input: UserCreate) => Promise<CreatedUser>
}

interface Draft {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  site: string
}

const EMPTY: Draft = { firstName: '', lastName: '', email: '', phoneNumber: '', role: '', site: '' }

/**
 * 1 the details, 2 the review, 3 the password the server returns once.
 *
 * The design shows only steps 1 and 3 and never draws a middle one, but it
 * counts to three — so the review is numbered 2 rather than leaving a gap
 * in the counter, and the one-time password gets step 3, which is the only
 * screen after it.
 */
type WizardStep = 1 | 2 | 3
const TOTAL_STEPS = 3

export function AddUserModal({ roles, onClose, onCreate }: AddUserModalProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [created, setCreated] = useState<CreatedUser | null>(null)

  const role = roles.find((entry) => entry.value === draft.role) ?? null
  const siteKind = role?.requires_site ?? null // "warehouse" | "school" | null

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses', 'all'],
    queryFn: () => catalogApi.warehouses(),
    enabled: siteKind === 'warehouse',
  })
  const { data: schools } = useQuery({
    queryKey: ['schools', 'all'],
    queryFn: () => catalogApi.schools(),
    enabled: siteKind === 'school',
  })

  const sites = siteKind === 'warehouse' ? warehouses?.results : siteKind === 'school' ? schools?.results : []

  const complete =
    draft.firstName.trim() &&
    draft.lastName.trim() &&
    draft.email.trim() &&
    draft.role &&
    (!siteKind || draft.site)

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleConfirm() {
    if (!role) return
    setPending(true)
    setError(null)
    try {
      const result = await onCreate({
        first_name: draft.firstName,
        last_name: draft.lastName,
        email: draft.email,
        role: role.value as UserCreate['role'],
        warehouse: siteKind === 'warehouse' && draft.site ? Number(draft.site) : undefined,
        school: siteKind === 'school' && draft.site ? Number(draft.site) : undefined,
        must_change_password: true,
      })
      setPending(false)
      if (result.password) {
        setCreated(result)
        setStep(3)
      } else {
        onClose()
      }
    } catch (cause) {
      setError(toApiError(cause))
      setPending(false)
    }
  }

  const siteName = sites?.find((entry) => String(entry.id) === draft.site)?.name

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__head">
          <h2 className="modal__title" id="add-user-title">
            Add New User
          </h2>

          {/* The counter and its bars sit together on the header row, as the
              design draws them. */}
          <span className="modal__step">
            Step <b>{step}</b> of {TOTAL_STEPS}
          </span>
          <span className="modal__progress" aria-hidden>
            {[1, 2, 3].map((index) => (
              <span
                key={index}
                className={`modal__progress-bar${
                  index <= step ? ' modal__progress-bar--done' : ''
                }`}
              />
            ))}
          </span>

          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </header>

        {step === 1 && (
          <div className="modal__body">
            <div className="modal__grid">
              <label className="stack-field">
                <span className="stack-field__label">First Name</span>
                <input
                  className="stack-field__input"
                  required
                  value={draft.firstName}
                  onChange={(event) => update('firstName', event.target.value)}
                />
              </label>
              <label className="stack-field">
                <span className="stack-field__label">Last Name</span>
                <input
                  className="stack-field__input"
                  required
                  value={draft.lastName}
                  onChange={(event) => update('lastName', event.target.value)}
                />
              </label>
            </div>

            <label className="stack-field">
              <span className="stack-field__label">Email Address</span>
              <input
                className="stack-field__input"
                type="email"
                required
                value={draft.email}
                onChange={(event) => update('email', event.target.value)}
              />
            </label>

            <label className="stack-field">
              <span className="stack-field__label">Phone Number</span>
              <input
                className="stack-field__input"
                type="tel"
                value={draft.phoneNumber}
                onChange={(event) => update('phoneNumber', event.target.value)}
              />
            </label>

            <label className="stack-field">
              <span className="stack-field__label">Role</span>
              <select
                className="stack-field__input stack-field__select"
                required
                value={draft.role}
                onChange={(event) => {
                  update('role', event.target.value)
                  update('site', '')
                }}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>

            {/*
              Always drawn, as the design has it. Disabled until a role that
              needs a site is chosen: the three all-locations roles take
              neither a warehouse nor a school, and sending one is a 400.
            */}
            <label className="stack-field">
              <span className="stack-field__label">Assigned Site</span>
              <select
                className="stack-field__input stack-field__select"
                required={Boolean(siteKind)}
                disabled={!siteKind}
                value={draft.site}
                onChange={(event) => update('site', event.target.value)}
              >
                <option value="" disabled>
                  {role
                    ? siteKind
                      ? `Select a ${siteKind}`
                      : `${role.label} covers all sites`
                    : 'Select a role first'}
                </option>
                {(sites ?? []).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>

            {/*
              Always drawn, as the design has it — empty ticks before a role
              is picked. Read-only: these are the access-matrix columns the
              chosen role already holds, a preview of what the server will
              grant rather than a set of choices, so ticking one here would
              promise something this endpoint cannot deliver.
            */}
            <div className="modal__permissions-preview">
              <p className="modal__permissions-title">Role Permissions Preview</p>
              <ul className="permission-preview">
                {PERMISSIONS_MATRIX_ROWS.map((row) => {
                  const held = role?.functions[row.function] === true
                  return (
                    <li key={row.label} className="permission-preview__item">
                      <input type="checkbox" checked={held} readOnly tabIndex={-1} />
                      <span className={held ? undefined : 'permission-preview__label--off'}>
                        {row.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="modal__actions">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" disabled={!complete} onClick={() => setStep(2)}>
                Confirm
              </Button>
            </div>
          </div>
        )}

        {created && (
          <div className="modal__body">
            <div className="modal__review">
              <div className="modal__review-row">
                <span className="modal__review-label">One-time password</span>
                <span className="modal__review-value modal__review-value--accent modal__review-value--mono">
                  {created.password}
                </span>
              </div>
            </div>
            <p className="modal__body-note">
              Shown once — pass this to {created.user.first_name} yourself. It is not emailed and
              cannot be shown again; use "set password" on their account if it is lost.
            </p>
            <div className="modal__actions modal__actions--end">
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {step === 2 && role && !created && (
          <div className="modal__body">
            {error && <p className="modal__error">{error.message}</p>}

            <div className="modal__review">
              <div className="modal__review-row">
                <span className="modal__review-label">Full Name</span>
                <span className="modal__review-value modal__review-value--accent">
                  {draft.firstName} {draft.lastName}
                </span>
              </div>
              <div className="modal__review-row">
                <span className="modal__review-label">Email Address</span>
                <span className="modal__review-value">{draft.email}</span>
              </div>
              <div className="modal__review-row">
                <span className="modal__review-label">Phone Number</span>
                <span className="modal__review-value">{draft.phoneNumber || '—'}</span>
              </div>
              {/* Role and site share a row in the design: together they are
                  one fact — what this person may do, and where. */}
              <div className="modal__review-pair">
                <div className="modal__review-row">
                  <span className="modal__review-label">System Role</span>
                  <span className="role-chip">{role.label}</span>
                </div>
                {siteKind && (
                  <div className="modal__review-row">
                    <span className="modal__review-label">Assigned Site</span>
                    <span className="modal__review-value">{siteName ?? '—'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal__actions">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)} disabled={pending}>
                Back
              </Button>
              <Button size="sm" onClick={() => void handleConfirm()} disabled={pending}>
                {pending ? 'Creating…' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
