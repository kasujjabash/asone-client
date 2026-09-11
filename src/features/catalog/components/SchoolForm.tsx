/**
 * Add or edit a school.
 *
 * Plain `useState` per field, not `react-hook-form` — `react-hook-form` and
 * `zod` are dependencies but nothing in this codebase uses them yet
 * (`SignInForm` is the precedent this follows: local state, native
 * `required`, and server errors mapped onto fields from `ApiError.fields`).
 * Client-side validation is deliberately thin for the same reason: the
 * server is the one source of truth for what a valid school looks like, and
 * duplicating its rules here is something to keep in sync twice.
 */

import { useState, type FormEvent } from 'react'
import { Alert, Button, Select, TextField } from '@/components'
import type { SchoolInput } from '@/api/catalog'
import type { ApiError } from '@/api/errors'
import type { School, SchoolLevel, Warehouse } from '@/api/types'

interface SchoolFormProps {
  /** Present when editing; absent when adding. */
  school?: School | null
  warehouses: Warehouse[]
  onSubmit: (input: SchoolInput) => void
  onCancel: () => void
  pending: boolean
  error: ApiError | null
}

export function SchoolForm({
  school,
  warehouses,
  onSubmit,
  onCancel,
  pending,
  error,
}: SchoolFormProps) {
  const [name, setName] = useState(school?.name ?? '')
  const [level, setLevel] = useState<SchoolLevel | ''>(school?.level ?? '')
  const [address, setAddress] = useState(school?.address ?? '')
  const [warehouseId, setWarehouseId] = useState(
    school?.primary_warehouse ? String(school.primary_warehouse) : '',
  )

  const fieldError = (name: string) => error?.fields?.[name]?.[0]

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!level || !warehouseId) return

    onSubmit({
      name,
      level,
      // Sent as-is, including empty — not `|| undefined`. `address` is a
      // plain optional string, and PATCH omits an absent key rather than
      // clearing it: editing a school to blank out its address needs an
      // explicit "", or the old value silently survives the save.
      address,
      primary_warehouse: Number(warehouseId),
    })
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      {error && !error.fields && <Alert tone="error">{error.message}</Alert>}

      <TextField
        label="School name"
        required
        autoFocus
        value={name}
        error={fieldError('name')}
        onChange={(event) => setName(event.target.value)}
      />

      <Select
        label="Type"
        required
        value={level}
        error={fieldError('level')}
        onChange={(event) => setLevel(event.target.value as SchoolLevel)}
      >
        <option value="" disabled>
          Choose a type…
        </option>
        <option value="PS">Primary School</option>
        <option value="HS">High School</option>
      </Select>

      <Select
        label="Primary warehouse"
        required
        value={warehouseId}
        error={fieldError('primary_warehouse')}
        onChange={(event) => setWarehouseId(event.target.value)}
      >
        <option value="" disabled>
          Choose a warehouse…
        </option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </Select>

      <TextField
        label="Address"
        value={address}
        error={fieldError('address')}
        onChange={(event) => setAddress(event.target.value)}
      />

      <div className="signin__actions" style={{ justifyContent: 'flex-end', gap: 12 }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : school ? 'Save Changes' : 'Add School'}
        </Button>
      </div>
    </form>
  )
}
