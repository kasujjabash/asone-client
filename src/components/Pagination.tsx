/**
 * Page controls for a long table.
 *
 * States what you are looking at — "Showing 1–10 of 33" — because a page
 * number alone does not tell you how much is behind it.
 *
 * Deliberately plain: previous, next, and the position. No numbered page
 * jumps, because with a filter above it the useful moves are forward, back,
 * and narrowing the filter — a row of page numbers mostly adds targets
 * nobody presses.
 *
 * Shared rather than local to one screen: the inventory ledger, the order
 * list and the movement history all need the same control, and DRF paginates
 * everything at fifty.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

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
}

export function Pagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onChange,
  noun = 'rows',
}: PaginationProps) {
  if (pageCount <= 1) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)

  return (
    <nav className="pagination" aria-label={`${noun} pages`}>
      <p className="pagination__position">
        Showing {first}–{last} of {totalItems} {noun}
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>

        <span className="pagination__page" aria-current="page">
          {page} / {pageCount}
        </span>

        <button
          type="button"
          className="pagination__btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
