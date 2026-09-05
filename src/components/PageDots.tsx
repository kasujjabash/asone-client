/**
 * Page indicator.
 *
 * The active dot is a stadium rather than a larger circle — position is
 * shown by width, not by size, so the row's rhythm stays even.
 *
 * Generic on purpose: this is the onboarding carousel today, and the same
 * control fits any short, ordered sequence. It renders `count` dots and
 * knows nothing about what they contain.
 */

interface PageDotsProps {
  count: number
  activeIndex: number
  /** Omit to render a non-interactive indicator. */
  onSelect?: (index: number) => void
  /** Names the sequence for screen readers, e.g. "Introduction". */
  label?: string
}

export function PageDots({ count, activeIndex, onSelect, label = 'Page' }: PageDotsProps) {
  return (
    <div className="page-dots" role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex
        const className = `page-dots__dot${active ? ' page-dots__dot--active' : ''}`

        if (!onSelect) {
          return <span key={index} className={className} aria-hidden />
        }

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${label} ${index + 1} of ${count}`}
            className={className}
            onClick={() => onSelect(index)}
          />
        )
      })}
    </div>
  )
}
