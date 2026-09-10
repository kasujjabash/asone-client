/**
 * Add or edit a school — one screen, driven by whether `:id` is present.
 *
 * A dedicated route rather than a modal: nothing in this codebase has a
 * modal/dialog primitive yet, and every existing screen is already reachable
 * by URL, which a modal form would break (no back button, no direct link to
 * "edit this school").
 */

import { useNavigate, useParams } from 'react-router-dom'
import { LoadingScreen } from '@/components'
import { toApiError } from '@/api/errors'
import { AppShell } from '@/features/shell/components/AppShell'
import { paths } from '@/routes/paths'
import { SchoolForm } from '../components/SchoolForm'
import { useSchool } from '../hooks/useSchool'
import { useSaveSchool } from '../hooks/useSaveSchool'
import { useWarehouseOptions } from '../hooks/useWarehouseOptions'

export function SchoolFormScreen() {
  const { id } = useParams<{ id?: string }>()
  const schoolId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const { school, isLoading } = useSchool(schoolId ?? -1)
  const { warehouses } = useWarehouseOptions()
  const save = useSaveSchool(schoolId)

  if (schoolId && isLoading) {
    return <LoadingScreen message="Loading school…" />
  }

  const title = schoolId ? `Edit ${school?.name ?? 'School'}` : 'Add School'
  const goBack = () => navigate(schoolId ? paths.schoolDetail(schoolId) : paths.schools)

  return (
    <AppShell title={title}>
      <header className="page-head">
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__subtitle">
          {schoolId
            ? 'Update this school’s details.'
            : 'Register a new school and assign it to a warehouse.'}
        </p>
      </header>

      <div className="card" style={{ maxWidth: 480 }}>
        <SchoolForm
          school={schoolId ? school : null}
          warehouses={warehouses}
          pending={save.isPending}
          error={save.error ? toApiError(save.error) : null}
          onCancel={goBack}
          onSubmit={(input) =>
            save.mutate(input, { onSuccess: (saved) => navigate(paths.schoolDetail(saved.id)) })
          }
        />
      </div>
    </AppShell>
  )
}
