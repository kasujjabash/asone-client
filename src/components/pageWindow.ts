/**
 * Which page numbers a numbered pagination control shows.
 *
 * Its own module rather than an export from `Pagination.tsx`: a file that
 * exports both a component and a plain function breaks fast refresh, and
 * this is the half worth unit-testing anyway.
 */

/** At most this many numbers, before gaps are used instead. */
const MAX_SHOWN = 5

/**
 * Page numbers around `page`, with `null` marking an elision.
 *
 * The first and last page are always reachable, and so are the two either
 * side of the current one — a hundred pages must not become a hundred
 * buttons, but stepping forward one at a time has to stay possible.
 */
export function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= MAX_SHOWN) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, pageCount, page])
  if (page - 1 > 1) pages.add(page - 1)
  if (page + 1 < pageCount) pages.add(page + 1)

  const ordered = [...pages].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)

  const withGaps: (number | null)[] = []
  let previous = 0
  for (const current of ordered) {
    if (previous && current - previous > 1) withGaps.push(null)
    withGaps.push(current)
    previous = current
  }
  return withGaps
}
