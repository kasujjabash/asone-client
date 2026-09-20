/**
 * Reason codes — F13.
 *
 * The lookup table behind every inventory adjustment: why stock moved, and
 * which way. It sits on Settings because the **leads** maintain it and the
 * leads cannot open the Adjustments screen at all — that column is Finance's.
 * Putting the editor beside the adjustments would have hidden it from its own
 * audience.
 *
 * ---------------------------------------------------------------------------
 * Direction is the field that matters
 * ---------------------------------------------------------------------------
 * `direction` decides whether posting against a code adds to stock or removes
 * from it, so nobody posting an adjustment ever chooses a sign — they pick a
 * reason and the code carries the arithmetic. A code created pointing the
 * wrong way moves stock the wrong way on every adjustment made against it,
 * which is why it is asked for as two plain statements rather than a
 * dropdown of enum values.
 *
 * It cannot be changed afterwards. Flipping the direction of a code already
 * in use would silently reverse the meaning of every adjustment posted
 * against it, including ones years old. A wrong code is retired and replaced.
 *
 * ---------------------------------------------------------------------------
 * Nothing is deleted
 * ---------------------------------------------------------------------------
 * Retiring keeps a code on every adjustment already posted while taking it
 * out of the choices for new ones. The server has no DELETE either — an audit
 * trail that cannot say why a movement happened is not an audit trail.
 */

import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Alert, Badge, Button, Pagination, SkeletonRows, TextField } from '@/components'
import { LIST_PAGE_SIZE } from '@/api/pageSize'
import {
  useAllReasonCodes,
  useCreateReasonCode,
  useSetReasonCodeActive,
} from '../hooks/useReasonCodes'

interface ReasonCodesSectionProps {
  /** False for a role that may read the table but not change it. */
  canEdit: boolean
}

const BLANK = { code: '', name: '', description: '', direction: 'DECREASE' as const }

export function ReasonCodesSection({ canEdit }: ReasonCodesSectionProps) {
  const [page, setPage] = useState(1)
  const codes = useAllReasonCodes(page)
  const create = useCreateReasonCode()
  const setActive = useSetReasonCodeActive()

  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<{
    code: string
    name: string
    description: string
    direction: 'INCREASE' | 'DECREASE'
  }>(BLANK)

  const rows = codes.data?.results ?? []
  const total = codes.data?.count ?? 0

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate(
      {
        // Upper-cased here rather than left to the typist: every existing
        // code is upper-case, and a lower-case one would sort away from its
        // family in a list ordered by code.
        code: draft.code.trim().toUpperCase(),
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        direction: draft.direction,
      },
      {
        onSuccess: () => {
          setDraft(BLANK)
          setAdding(false)
        },
      },
    )
  }

  return (
    <section className="settings-section settings-section--plain">
      {/*
        One line, not the whole explanation. The rules that matter — the
        direction is permanent, nothing is deleted — are long enough to be a
        wall of text above a seven-row table, and this app already has a place
        for that: the help button. Kept here is the single thing somebody
        needs *before* touching a row.
      */}
      <Alert tone="warning">
        <strong>A code&rsquo;s effect on stock is permanent once saved.</strong> One
        pointing the wrong way is retired and replaced, never edited &mdash;
        changing it would reverse every adjustment already posted against it.
      </Alert>


      {codes.isLoading ? (
        <SkeletonRows rows={3} />
      ) : (
        <div className="table-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Effect on stock</th>
                <th>Status</th>
                {canEdit && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="ledger__code">{row.code}</td>
                  <td className="ledger__wrap">
                    {row.name}
                    {/*
                      The description the creator wrote. Captured since the
                      model was written and never displayed anywhere, which
                      made "when to use it" guidance nobody could read — its
                      own help text says it is "for whoever is choosing one".
                    */}
                    {row.description && (
                      /* `title` because the cell truncates: the guidance is
                         the point of the field, so the full text has to be
                         reachable even when the column cannot show it. */
                      <span className="line-note line-note--clip" title={row.description}>
                        {row.description}
                      </span>
                    )}
                  </td>
                  <td className="ledger__nowrap">
                    <Badge tone={row.direction === 'INCREASE' ? 'success' : 'warning'}>
                      {row.direction === 'INCREASE' ? 'Adds' : 'Removes'}
                    </Badge>
                  </td>
                  <td className="ledger__nowrap">
                    <Badge tone={row.is_active ? 'success' : 'neutral'}>
                      {row.is_active ? 'In use' : 'Retired'}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="ledger__nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={setActive.isPending}
                        onClick={() =>
                          setActive.mutate({ id: row.id, isActive: !row.is_active })
                        }
                      >
                        {row.is_active ? 'Retire' : 'Restore'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!codes.isLoading && total > 0 && (
        <div className="table-card__footer">
          <Pagination
            page={page}
            pageCount={Math.max(1, Math.ceil(total / LIST_PAGE_SIZE))}
            totalItems={total}
            pageSize={LIST_PAGE_SIZE}
            onChange={setPage}
            noun="reason codes"
          />
        </div>
      )}

      {canEdit && !adding && (
        <div className="settings-actions settings-actions--start">
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden />
            Add a reason code
          </Button>
        </div>
      )}

      {canEdit && adding && (
        <form className="settings-subsection" onSubmit={submit} noValidate>
          <div className="settings-grid">
            <TextField
              label="Code"
              value={draft.code}
              required
              autoFocus
              maxLength={16}
              onChange={(event) => setDraft((d) => ({ ...d, code: event.target.value }))}
            />
            <TextField
              label="Name"
              value={draft.name}
              required
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
            />
          </div>

          <TextField
            label="When to use it (optional)"
            value={draft.description}
            onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
          />

          {/*
            Two statements, not an enum dropdown. "INCREASE" and "DECREASE"
            are the server's words; what the person choosing needs to know is
            what happens to the shelf. This cannot be changed after saving, so
            it is worth the extra words here.
          */}
          <fieldset className="settings-choice">
            <legend className="settings-choice__legend">
              What does posting against this code do?
            </legend>
            <label className="settings-checkbox">
              <input
                type="radio"
                name="direction"
                checked={draft.direction === 'DECREASE'}
                onChange={() => setDraft((d) => ({ ...d, direction: 'DECREASE' }))}
              />
              Removes stock — damaged, lost, written off
            </label>
            <label className="settings-checkbox">
              <input
                type="radio"
                name="direction"
                checked={draft.direction === 'INCREASE'}
                onChange={() => setDraft((d) => ({ ...d, direction: 'INCREASE' }))}
              />
              Adds stock — returned, found, recovered
            </label>
            <p className="settings-section__note">
              This cannot be changed later. A code pointing the wrong way is
              retired and replaced, because changing it would reverse the
              meaning of every adjustment already posted against it.
            </p>
          </fieldset>

          <div className="settings-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(BLANK)
                setAdding(false)
              }}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || !draft.code.trim() || !draft.name.trim()}
            >
              {create.isPending ? 'Adding…' : 'Add code'}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
