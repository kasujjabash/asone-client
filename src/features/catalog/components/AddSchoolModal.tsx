/**
 * Add School Modal.
 *
 * Allows quick registration of a new school directly from the SchoolsScreen
 * without leaving the page.
 */

import { ChevronDown } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert, Modal } from '@/components'
import { toApiError } from '@/api/errors'
import type { School, SchoolLevel, Warehouse } from '@/api/types'
import { useSaveSchool } from '../hooks/useSaveSchool'

interface AddSchoolModalProps {
  isOpen: boolean
  onClose: () => void
  warehouses: Warehouse[]
  onSuccess?: (school: School) => void
}

export function AddSchoolModal({
  isOpen,
  onClose,
  warehouses,
  onSuccess,
}: AddSchoolModalProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<SchoolLevel | ''>('PS')
  const [warehouseId, setWarehouseId] = useState(
    warehouses[0] ? String(warehouses[0].id) : '',
  )
  const [address, setAddress] = useState('')

  const save = useSaveSchool()
  const error = save.error ? toApiError(save.error) : null
  const fieldError = (fieldName: string) => error?.fields?.[fieldName]?.[0]

  function handleReset() {
    setName('')
    setLevel('PS')
    setWarehouseId(warehouses[0] ? String(warehouses[0].id) : '')
    setAddress('')
    save.reset()
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !level || !warehouseId) return

    save.mutate(
      {
        name: name.trim(),
        level,
        primary_warehouse: Number(warehouseId),
        address: address.trim() || undefined,
      },
      {
        onSuccess: (saved) => {
          handleClose()
          onSuccess?.(saved)
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add School"
      subtitle="Register a new school and assign it to a dispatch warehouse."
      maxWidth={520}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && !error.fields && <Alert tone="error">{error.message}</Alert>}

        <div className="schools-form-field">
          <label htmlFor="modal-school-name" className="schools-form-label">
            School Name <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="modal-school-name"
            type="text"
            className="schools-form-input"
            placeholder="e.g. St. Mary's Primary School"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {fieldError('name') && (
            <p className="schools-form-error">{fieldError('name')}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="schools-form-field">
            <label htmlFor="modal-school-type" className="schools-form-label">
              School Type <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <div className="schools-form-select-wrapper">
              <select
                id="modal-school-type"
                className="schools-form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as SchoolLevel)}
                required
              >
                <option value="PS">Primary (PS)</option>
                <option value="HS">High School (HS)</option>
              </select>
              <ChevronDown size={14} className="schools-form-select-chevron" aria-hidden />
            </div>
            {fieldError('level') && (
              <p className="schools-form-error">{fieldError('level')}</p>
            )}
          </div>

          <div className="schools-form-field">
            <label htmlFor="modal-school-warehouse" className="schools-form-label">
              Primary Warehouse <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <div className="schools-form-select-wrapper">
              <select
                id="modal-school-warehouse"
                className="schools-form-select"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Choose a warehouse…
                </option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="schools-form-select-chevron" aria-hidden />
            </div>
            {fieldError('primary_warehouse') && (
              <p className="schools-form-error">{fieldError('primary_warehouse')}</p>
            )}
          </div>
        </div>

        <div className="schools-form-field">
          <label htmlFor="modal-school-address" className="schools-form-label">
            Address / Location
          </label>
          <input
            id="modal-school-address"
            type="text"
            className="schools-form-input"
            placeholder="e.g. Namayemba Village, Bugiri District"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {fieldError('address') && (
            <p className="schools-form-error">{fieldError('address')}</p>
          )}
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
            disabled={save.isPending || !name.trim() || !level || !warehouseId}
          >
            {save.isPending ? 'Adding School…' : 'Add School'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
