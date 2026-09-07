/**
 * An inline spinner.
 *
 * For an action in flight — a button mid-submit, a row saving — where a
 * skeleton makes no sense because the content is already on screen. The
 * mobile reference pairs exactly this with "Saving changes…" (state 6).
 *
 * Content that has not arrived yet gets a `Skeleton` instead.
 */

interface SpinnerProps {
  /** Diameter in px. Matches the surrounding text size by default. */
  size?: number
  /** Announced to screen readers; the visual is hidden from them. */
  label?: string
}

export function Spinner({ size = 16, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  )
}
