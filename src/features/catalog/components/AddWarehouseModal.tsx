/**
 * Add or edit a Warehouse. Same pattern as `AddTailoringCenterModal`, plus
 * the primary tailoring center picker `Warehouse` alone needs.
 */

import { ChevronDown } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert, Modal } from '@/components'
import { toApiError } from '@/api/errors'
import type { WarehouseInput } from '@/api/catalog'
import type { TailoringCenter, Warehouse } from '@/api/types'
import { useSaveWarehouse } from '../hooks/useSaveWarehouse'

interface AddWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  tailoringCenters: TailoringCenter[]
  /** Present when editing; absent when adding. */
  warehouse?: Warehouse | null
}

const NONE = ''

export function AddWarehouseModal({
  isOpen,
  onClose,
  tailoringCenters,
  warehouse,
}: AddWarehouseModalProps) {
  const [name, setName] = useState(warehouse?.name ?? '')
  const [address, setAddress] = useState(warehouse?.address ?? '')
  const [tailoringCenterId, setTailoringCenterId] = useState(
    warehouse?.primary_tailoring_center ? String(warehouse.primary_tailoring_center) : NONE,
  )

  const save = useSaveWarehouse(warehouse?.id)
  const error = save.error ? toApiError(save.error) : null
  const fieldError = (fieldName: string) => error?.fields?.[fieldName]?.[0]

  function handleReset() {
    setName(warehouse?.name ?? '')
    setAddress(warehouse?.address ?? '')
    setTailoringCenterId(
      warehouse?.primary_tailoring_center ? String(warehouse.primary_tailoring_center) : NONE,
    )
    save.reset()
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    const input: WarehouseInput = {
      name: name.trim(),
      // As-is, not `|| undefined` — an edit that clears the address needs
      // to send an explicit "", or PATCH omits the key and the old value
      // silently survives the save.
      address: address.trim(),
      // null, not undefined — see the comment on WarehouseInput. Selecting
      // "None yet" while editing must actually clear the field, not leave
      // the warehouse's existing tailoring center untouched.
      primary_tailoring_center: tailoringCenterId ? Number(tailoringCenterId) : null,
    }
    save.mutate(input, { onSuccess: handleClose })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={warehouse ? 'Edit Warehouse' : 'Add Warehouse'}
      subtitle={
        warehouse
          ? 'Update this warehouse’s details.'
          : 'Register a new warehouse and, optionally, its default tailoring center.'
      }
      maxWidth={480}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && !error.fields && <Alert tone="error">{error.message}</Alert>}

        <div className="schools-form-field">
          <label htmlFor="wh-name" className="schools-form-label">
            Name <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="wh-name"
            type="text"
            className="schools-form-input"
            placeholder="e.g. Namayemba"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {fieldError('name') && <p className="schools-form-error">{fieldError('name')}</p>}
        </div>

        <div className="schools-form-field">
          <label htmlFor="wh-tc" className="schools-form-label">
            Primary Tailoring Center
          </label>
          <div className="schools-form-select-wrapper">
            <select
              id="wh-tc"
              className="schools-form-select"
              value={tailoringCenterId}
              onChange={(e) => setTailoringCenterId(e.target.value)}
            >
              <option value={NONE}>None yet</option>
              {tailoringCenters.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="schools-form-select-chevron" aria-hidden />
          </div>
          {fieldError('primary_tailoring_center') && (
            <p className="schools-form-error">{fieldError('primary_tailoring_center')}</p>
          )}
        </div>

        <div className="schools-form-field">
          <label htmlFor="wh-address" className="schools-form-label">
            Address / Location
          </label>
          <input
            id="wh-address"
            type="text"
            className="schools-form-input"
            placeholder="e.g. Namayemba Trading Centre"
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
            {save.isPending ? 'Saving…' : warehouse ? 'Save Changes' : 'Add Warehouse'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
