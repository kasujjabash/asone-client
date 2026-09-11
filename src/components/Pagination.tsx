/**
 * Page controls for a long table.
 *
 * States what you are looking at — "Showing 1–10 of 33" — because a page
 * number alone does not tell you how much is behind it.
 *
 * Two shapes, because two designs ask for two:
 *
 *   default    previous, position, next. With a filter above it the useful
 *              moves are forward, back and narrowing the filter.
 *   numbered   the same, with page buttons between. Used where a reader
 *              scans a long history and jumping to page 3 is a real move.
 *
 * The window of numbers is capped so a hundred pages does not produce a
 * hundred buttons — it slides around the current page and marks the gaps.
 *
 * Shared rather than local to one screen: the inventory ledger, the order
 * list and the movement history all need the same control, and DRF paginates
 * everything at fifty.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { pageWindow } from './pageWindow'

interface PaginationProps {
  /** 1-based. */
  page: number
  pageCount: number
  /** Total rows across all pages, for the position line. */
  totalItems: number
  pageSize: number
  onChange: (page: number) => void
  /** What is being counted — "SKUs", "movements". */
  noun?: string
  /** Show page-number buttons between Previous and Next. */
  numbered?: boolean
}

export function Pagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onChange,
  noun = 'rows',
  numbered = false,
}: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)

  return (
    <nav className="pagination" aria-label={`${noun} pages`}>
      <p className="pagination__position">
        Showing {first}–{last} of {totalItems} {noun}
      </p>

      {/* Buttons only when there is somewhere to go; the position line is
          always shown, so a single page still says how much it holds. */}
      <div className="pagination__controls" hidden={pageCount <= 1}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={14} aria-hidden />
          Previous
        </Button>

        {numbered ? (
          pageWindow(page, pageCount).map((entry, index) =>
            entry === null ? (
              <span className="pagination__gap" key={`gap-${index}`} aria-hidden>
                …
              </span>
            ) : (
              <button
                type="button"
                key={entry}
                className={`pagination__number${
                  entry === page ? ' pagination__number--current' : ''
                }`}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}`}
                onClick={() => onChange(entry)}
              >
                {entry}
              </button>
            ),
          )
        ) : (
          <span className="pagination__page" aria-current="page">
            {page} / {pageCount}
          </span>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next
          <ChevronRight size={14} aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
