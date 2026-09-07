/**
 * Loading placeholders.
 *
 * One shimmer, used everywhere, so "the system is loading" looks the same
 * whichever screen you are on. The mobile reference calls for skeletons
 * rather than spinners for content (state 6), and skeletons are the better
 * answer here anyway: they hold the layout still, so a table or a panel does
 * not jump when its rows arrive.
 *
 * Three shapes cover what this app loads:
 *
 *   Skeleton      one block — a figure, a chart, a field
 *   SkeletonText  lines of prose, the last one short as real text ends ragged
 *   SkeletonRows  repeated rows — lists, tables, timelines
 *
 * All of them are `aria-hidden` and paired with an `aria-busy` region by the
 * caller, so a screen reader hears "busy" once rather than reading out a
 * dozen empty boxes.
 */

interface SkeletonProps {
  /** CSS length. Defaults to filling its container. */
  width?: string
  /** CSS length. */
  height?: string
  /** Pill rather than the default small radius — avatars, badges. */
  round?: boolean
}

export function Skeleton({ width = '100%', height = '16px', round = false }: SkeletonProps) {
  return (
    <span
      className={`skeleton${round ? ' skeleton--round' : ''}`}
      style={{ width, height }}
      aria-hidden
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <span className="skeleton-stack" aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '60%' : '100%'} height="12px" />
      ))}
    </span>
  )
}

export function SkeletonRows({ rows = 3, height = '40px' }: { rows?: number; height?: string }) {
  return (
    <span className="skeleton-stack" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={height} />
      ))}
    </span>
  )
}
