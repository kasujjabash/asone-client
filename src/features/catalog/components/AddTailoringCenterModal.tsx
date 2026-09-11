/**
 * Add or edit a Tailoring Center.
 *
 * One modal for both, following the same pattern `AddSchoolModal`
 * established for this feature — reusing its exact CSS classes
 * (`schools-form-*`, `schools-modal-btn-*`) rather than duplicating them
 * under a new name. They read "schools" only because that screen wrote
 * them first; nothing about them is Schools-specific. Worth renaming to
 * something neutral (`admin-form-*`) if a third screen ever needs them,
 * so the name stops being misleading — not done here to keep this change
 * to what Warehouses/Tailoring Centers actually needed.
 */

import { useState, type FormEvent } from 'react'
import { Alert, Modal } from '@/components'
import { toApiError } from '@/api/errors'
import type { TailoringCenterInput } from '@/api/catalog'
import type { TailoringCenter } from '@/api/types'
import { useSaveTailoringCenter } from '../hooks/useSaveTailoringCenter'

interface AddTailoringCenterModalProps {
  isOpen: boolean
  onClose: () => void
  /** Present when editing; absent when adding. */
  center?: TailoringCenter | null
}

export function AddTailoringCenterModal({
  isOpen,
  onClose,
  center,
}: AddTailoringCenterModalProps) {
  const [name, setName] = useState(center?.name ?? '')
  const [address, setAddress] = useState(center?.address ?? '')

  const save = useSaveTailoringCenter(center?.id)
  const error = save.error ? toApiError(save.error) : null
  const fieldError = (fieldName: string) => error?.fields?.[fieldName]?.[0]

  function handleReset() {
    setName(center?.name ?? '')
    setAddress(center?.address ?? '')
    save.reset()
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    // address sent as-is, not `|| undefined` — see the matching comment in
    // AddWarehouseModal: clearing it on an edit needs an explicit "".
    const input: TailoringCenterInput = { name: name.trim(), address: address.trim() }
    save.mutate(input, { onSuccess: handleClose })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={center ? 'Edit Tailoring Center' : 'Add Tailoring Center'}
      subtitle={
        center
          ? 'Update this tailoring center’s details.'
          : 'Register a new tailoring center that production orders can ship to warehouses from.'
      }
      maxWidth={480}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && !error.fields && <Alert tone="error">{error.message}</Alert>}

        <div className="schools-form-field">
          <label htmlFor="tc-name" className="schools-form-label">
            Name <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="tc-name"
            type="text"
            className="schools-form-input"
            placeholder="e.g. Idudi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {fieldError('name') && <p className="schools-form-error">{fieldError('name')}</p>}
        </div>

        <div className="schools-form-field">
          <label htmlFor="tc-address" className="schools-form-label">
            Address / Location
          </label>
          <input
            id="tc-address"
            type="text"
            className="schools-form-input"
            placeholder="e.g. Idudi Trading Centre"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {fieldError('address') && <p className="schools-form-error">{fieldError('address')}</p>}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            className="schools-modal-btn-secondary"
            onClick={handleClose}
            disabled={save.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="schools-modal-btn-primary"
            disabled={save.isPending || !name.trim()}
          >
            {save.isPending ? 'Saving…' : center ? 'Save Changes' : 'Add Tailoring Center'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
