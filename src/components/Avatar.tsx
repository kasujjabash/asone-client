/**
 * Initials in a circle.
 *
 * Takes initials rather than a user, so it stays free of anything that knows
 * what a user is — `domain/access.initials()` works those out.
 */

interface AvatarProps {
  initials: string
  /** Diameter in px. */
  size?: number
}

export function Avatar({ initials, size = 32 }: AvatarProps) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.375) }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
